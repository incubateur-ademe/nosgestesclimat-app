# Auth routes migration — ticket list

## Goal

Migrate the two Express auth routes to the site's Next server actions, with the
domain logic in `packages/core`:

| Route | Site entry point today | Target |
| --- | --- | --- |
| `POST /authentication/v1/login` | `apps/site/src/services/auth/login.ts` (HTTP via `fetchServer`) | Site action calling a core `login` service directly |
| `POST /verification-codes/v1` | `apps/site/src/services/auth/create-verification-code.ts` (HTTP via `fetchServer`) | Site action calling a core verification-code service directly |

The site is the only consumer of both routes, so the Express routes, their
controllers and `apps/server/src/features/authentication` are removed at the
end of the effort.

## Architecture decisions (already settled)

1. **Domain failures are domain errors in `Result`s, not exceptions.** Core
   services return `Result<Data, Err>` from `@nosgestesclimat/core/lib/result`.
   Errors are specific classes extending `DomainError`
   (`@nosgestesclimat/core/lib/errors`), declared per feature in an
   `errors/*.error.ts` file — see
   `packages/core/src/features/simulations/errors/simulations.error.ts` for the
   house style. The core services never import the server's exception classes;
   generic ones like `EntityNotFoundException` are not moved to core. Only
   unexpected infrastructure failures (a Prisma error, a bug) still throw —
   call sites catch those and map them to their own generic error.
2. **No EventBus in core.** Core services follow the dependency-injection
   pattern already established by `createCompleteSimulation`
   (`packages/core/src/features/simulations/services/complete-simulation.service.ts`
   + `apps/site/src/services/simulations/complete-simulation.ts`): a
   `create<Service>(deps)` factory receives its side-effect dependencies and a
   `backgroundTaskRunner` typed by the existing
   `BackgroundTaskRunner` (`packages/core/src/lib/background-task-runner.ts`).
   The runner only schedules; error handling for background tasks lives inside
   the core service, which wraps the task body in a try/catch calling the
   injected `logger.error` and `captureException` (mirroring the
   `Failed to run side effect` handling in complete-simulation). The site
   injects `after` from `next/server`. Domain side effects with real invariants
   (simulation reconciliation, user data sync) are called **synchronously by
   the service**, not through the runner.
3. **No verification-code diagnosis.** The current
   `diagnoseVerificationCodeRejection` (never_requested / mismatch / expired /
   unknown) is dropped. A code lookup miss is a single
   `InvalidVerificationCodeError` — the new implementation is deliberately
   simpler than the server's. Rejections stay observable through the login
   logging (T8), minus the diagnosis context.
4. **Express routes are removed in this effort** (final ticket).
5. **Rate limiting** in the site actions is **in-memory** (per-process,
   30 s per email). Weaker than the current Redis limiter across instances —
   accepted.
6. **Emails** go through the core Brevo client
   (`packages/core/src/features/emails/brevo`), which takes its config
   (`apiKey`, `url`) from the caller — core never reads env. The site already
   has the adapter: `apps/site/src/adapters/brevoClient.ts` exports
   `sendEmail` / `addOrUpdateContact` built on `createBrevoClient`. The server
   adapter (`apps/server/src/adapters/brevo/client.ts`) stays untouched for
   its remaining consumers.

## Transition strategy

The core modules are written **fresh** (adapted copies of the server logic),
not extracted in place. The server auth feature keeps its own files running
untouched until T10 deletes them — no re-export shims, no temporary
delegation. The only import crossing the boundary during the effort is
`apps/server/src/features/users/users.service.ts`, which uses `verifyCode` and
`invalidateVerificationCode`; it switches to the core implementations in T5.

## Target layout

```
packages/core/src/features/auth/
├── errors/login.error.ts                            (InvalidVerificationCodeError, LoginError)
├── emails/auth-emails.ts                            (T4 Brevo payload factories)
├── repositories/verification-codes.repository.ts
├── schemas/verification-codes.schema.ts             (valibot: LoginDto, VerificationCodeCreateDto)
├── services/login.service.ts                        (createLogin → login + verifyCode)
└── services/create-verification-code.service.ts     (factory → createVerificationCode)

packages/core/src/features/users/
├── repositories/verified-users.repository.ts        (login-specific user fns, extends the
│                                                     existing core users repository)
└── services/                                         (reconcile + ownership-transfer services)
```

The existing session services in `features/auth` (create/rotate/revoke
session) stay where they are. Core already provides `prisma/client`,
`lib/transaction` and `lib/result` — use them instead of the server's
`adapters/prisma/*`.

## Ground rules for every ticket

- `pnpm -F <package> test`, `pnpm typecheck`, `pnpm lint` must pass (global
  commands at the end of each ticket: typecheck + lint at minimum).
- Preserve current behaviour semantics exactly unless a ticket says otherwise.
- Move tests along with the code. Do not delete test coverage.
- Do not touch `apps/server/src/adapters/brevo` or the newsletter feature.
- The core implementation is a simplification, not a transcription: no
  EventBus, no diagnosis, no exceptions for domain failures.

---

## T1 — Core: verification-code repository, schemas and domain error

Write the verification-code data layer in core, on core's prisma client.

Adapted from `apps/server/src/features/authentication/`:

- `verification-codes.repository.ts` →
  `packages/core/src/features/auth/repositories/verification-codes.repository.ts`
  (includes `invalidateVerificationCode`, needed by users.service after T5).
- valibot schemas: `LoginDto` (from `authentication.validator.ts`) and
  `VerificationCodeCreateDto` (from `verification-codes.validator.ts`) →
  `packages/core/src/features/auth/schemas/verification-codes.schema.ts`.
  Drop the Express validator wrappers ({ body, params, query }) and the
  `VerificationCodeCreateQuery` (see T9: `mode` was query-only and is
  dropped). Keep the valibot objects and inferred types.
- New file `packages/core/src/features/auth/errors/login.error.ts`:

```ts
export class InvalidVerificationCodeError extends DomainError<'invalid_verification_code'> {
  constructor() {
    super('invalid_verification_code', 'Code de vérification invalide')
  }
}

export type LoginError = InvalidVerificationCodeError
```

  This **replaces** `InvalidVerificationCodeException` — do not port the
  exception, its `rejection` / `context` payload, or the diagnosis that
  builds it (decision 3). `generateRandomVerificationCode` moves with the
  service in T6, not here.

Adaptations:
- Use `@nosgestesclimat/core/prisma/client` and
  `packages/core/src/lib/transaction.ts` (`Transaction` type) instead of
  `apps/server/src/adapters/prisma/*`.
- The core prisma client already has the `VerificationCode` model (schema
  `ngc.prisma`), so no schema change.

The server files stay untouched (transition strategy): nothing outside
`features/authentication` imports them, so no re-exports are needed.

Tests: port the repository-level parts of
`__tests__/create-verification-codes.spec.ts` to core using core test
fixtures (`packages/core/src/test-utils/db.ts` — provides
`createTestDatabase()` only; add row fixtures as needed, see open points).
Reference existing core service specs for the fixture style.

Depends on: nothing.
Blocks: T5, T6, T10.

## T2 — Core: verified-user repository functions used by login

Extract the user data functions `login` needs from
`apps/server/src/features/users/users.repository.ts` into core:

- `fetchVerifiedUser`
- `createOrUpdateVerifiedUser`
- `defaultVerifiedUserSelection` (from `apps/server/src/adapters/prisma/selection.ts`)
- the `PartialVerifiedUser` type (from `apps/server/src/core/types/user.ts`)

Target: `packages/core/src/features/users/repositories/` (extend the existing
core users repository — it already exists with `createUser`, `findUserById`).

Adaptations: same as T1 (core prisma + core `Transaction`). Preserve the
comments documenting the "one session userId = one account" invariant — they
are load-bearing for the login logic.

Unlike the auth feature, the server users feature **survives** T10 and keeps
calling these functions, so have
`apps/server/src/features/users/users.repository.ts` import/re-export from
core so there is exactly one implementation. Server keeps compiling.

Depends on: nothing (can run in parallel with T1).
Blocks: T5, T10.

## T3 — Core: login side effects (simulation reconcile + ownership transfer)

Extract the two domain side effects the login flow triggers from
`apps/server/src/features/users`:

- `transferSimulationsFromUser` (users.repository.ts) — called by
  `reconcileSimulationsAfterLogin` (users.service.ts:43)
- `transferOwnershipToUser` (users.repository.ts) — called by `syncUserData`
  (users.service.ts:57), the legacy anonymous-user merge

Target: `packages/core/src/features/users/repositories/` plus small services
in `packages/core/src/features/users/services/` mirroring
`reconcileSimulationsAfterLogin({ user, previousUserId })` and
`syncUserData({ user, verified })` (each wraps one function in a
`transaction`).

These are synchronous, transactional domain operations — do **not** route
them through any background runner. Port their doc comments verbatim
(especially the legacy-migration note on `transferOwnershipToUser`).

Keep the server functions delegating to core so `users.service.ts` still works
(users.service survives T10).

Tests: the reconciliation behaviour is covered today by
`apps/server/src/features/authentication/__tests__/reconcile-simulations-after-login.spec.ts`
and `login.spec.ts` — port what is repository-level to core; the rest moves in
T5.

Depends on: nothing.
Blocks: T5, T10.

## T4 — Core: Brevo email payload factories

The three email side effects currently live as EventBus handlers calling
`apps/server/src/adapters/brevo/client.ts`:

- `sendVerificationCodeEmail({ locale, email, code })` (handler:
  `send-verification-code.ts`)
- `sendWelcomeEmail({ email, locale, origin })` (handler:
  `send-welcome-email.ts`)
- `addOrUpdateContactAfterLogin({ email, userId })` (handler:
  `update-brevo-contact.ts`)

Implement them as factories in
`packages/core/src/features/auth/emails/auth-emails.ts`, following the
`createSendGroupCreatedEmail` style of
`packages/core/src/features/simulations/emails/simulation-emails.ts`:

```ts
createSendVerificationCodeEmail(sendEmail)
  : ({ locale, email, code }) => Promise<void>
createSendWelcomeEmail(sendEmail)
  : ({ locale, email, origin }) => Promise<void>
createAddOrUpdateContactAfterLogin(addOrUpdateContact)
  : ({ email, userId }) => Promise<void>
```

`sendEmail` / `addOrUpdateContact` are injected (`SendEmail` /
`AddOrUpdateContact` from `packages/core/src/features/emails/types.ts`) — the
site passes its existing `@/adapters/brevoClient` exports, `origin` comes from
`env.NEXT_PUBLIC_SITE_URL` at the service level (T5). Read the server adapter
first and mirror its payloads exactly — same Brevo template IDs per locale,
same params (`VERIFICATION_CODE`, `DASHBOARD_URL`), same contact attributes
(`USER_ID`). Do not invent payload shapes.

Do not modify the server adapter.

Tests: unit tests with `sendEmail` / `addOrUpdateContact` mocked, asserting
the request payloads (template ids, params, locale handling).

Depends on: nothing.
Blocks: T5, T6.

## T5 — Core: login service (factory, `Result`, `backgroundTaskRunner`)

Write `packages/core/src/features/auth/services/login.service.ts` as a
factory mirroring `createCompleteSimulation`:

```ts
createLogin({
  logger,                        // @nosgestesclimat/core/features/logger
  captureException,              // CaptureException
  sendWelcomeEmail,              // from T4
  addOrUpdateContactAfterLogin,  // from T4
  origin,                        // public origin, for the welcome email link
  backgroundTaskRunner,          // BackgroundTaskRunner (core lib type)
}): login
```

```ts
login({
  loginDto,          // email + 6-digit code (LoginDto from T1)
  locale,
  sessionUserId?,    // from the site session; enforces "one session userId = one account"
}): Promise<Result<{ user, mode }, LoginError>>
```

Flow — a simplification of
`apps/server/src/features/authentication/authentication.service.ts`:

1. `verifyCode(loginDto)`: on a lookup miss, return
   `failure(new InvalidVerificationCodeError())`. **No diagnosis, no
   exception** (decision 3). Prisma not-found is the expected signal here —
   do not let it throw.
2. The sign-in / sign-up transaction (`createAccountOrSignin`): port it
   **with its invariant comments** — the "existing account's own id wins",
   the "userId already belongs to another verified account" branches and the
   `findOtherVerifiedAccountWithUserId` doc comment. These branches *handle*
   the conflict and return normally; nothing in this flow throws
   `ForbiddenException` or `EntityNotFoundException` (those catch branches in
   the current controller are dead code — do not port them).
3. After the transaction commits:
   - Synchronously (awaited): `reconcileSimulationsAfterLogin` when
     `mode === signIn` and a `previousUserId` exists that differs from
     `user.id`; `syncUserData({ user, verified: true })` on sign-up. Preserve
     exactly the conditions currently encoded in the handlers
     (`handlers/reconcile-simulations-after-login.ts`,
     `handlers/sync-user-data-after-account-created.ts`).
   - Via the injected `backgroundTaskRunner`: `addOrUpdateContactAfterLogin`
     (every login) and `sendWelcomeEmail` (sign-up only). The task body is
     wrapped in try/catch calling the injected `logger.error` +
     `captureException` — a failing email must never fail the login, and the
     runner itself only schedules (decision 2).

The module also exports:

```ts
verifyCode(
  { email, code }: Pick<VerificationCode, 'email' | 'code'>,
  { session }?: { session?: Transaction }   // must support callers inside a transaction
): Promise<Result<UserVerificationCode, InvalidVerificationCodeError>>
invalidateVerificationCode(...)              // re-export of the T1 repository function
```

`apps/server/src/features/users/users.service.ts` (lines 19-20, 169, 178)
switches to these core imports (preferred over temporary delegation). Adapt
its call site to the `Result` return:

```ts
const result = await verifyCode({ ...userToUpdate, code, email: nextEmail }, { session })
if (!result.success) {
  throw new ForbiddenException('Forbidden ! Invalid verification code.')
}
```

This preserves today's observable behaviour: the current
`InvalidVerificationCodeException` extends `EntityNotFoundException`, which
users.service already catches and converts to a 403 `ForbiddenException`.

Tests: port `__tests__/login.spec.ts` and
`__tests__/reconcile-simulations-after-login.spec.ts` (service-level) to
core. Drop the diagnosis assertions (no longer applicable); assert instead
that a wrong/expired/never-requested code yields
`failure(InvalidVerificationCodeError)`. Inject a runner that awaits
immediately in tests so email effects stay assertable.

Depends on: T1, T2, T3, T4.
Blocks: T8, T10.

## T6 — Core: create-verification-code service (factory, `backgroundTaskRunner`)

Write `packages/core/src/features/auth/services/create-verification-code.service.ts`
as a factory:

```ts
createVerificationCodeService({
  logger,
  captureException,
  sendVerificationCodeEmail,   // from T4
  backgroundTaskRunner,
}): createVerificationCode
```

```ts
createVerificationCode({
  email,     // VerificationCodeCreateDto from T1 (email only)
  locale,
}): Promise<{ email, expirationDate }>
```

There are no domain failure modes, so the service returns the payload
directly — only unexpected infra errors throw (the site action maps those,
see T9). The code itself must not leave the service.

Flow:
1. `generateRandomVerificationCode` (now lives here) + 1-hour expiration.
2. Commit the code row first — preserve the transaction comment from
   `verification-codes.service.ts`: the code must be committed *before* the
   email is handed to Brevo, or the user can hold a code that does not exist
   in database.
3. Schedule `sendVerificationCodeEmail` through the injected
   `backgroundTaskRunner` (task body wrapped with try/catch + injected
   `logger.error` + `captureException`, as in T5).

Behaviour changes per decisions 2 and 3 — note both in the PR description:
- Today a Brevo failure can fail the create request (the handler was not
  best-effort wrapped); after this ticket it must not.
- The response now returns before the email is dispatched (today the handler
  runs within the request).

Port the service-level parts of
`__tests__/create-verification-codes.spec.ts`.

Depends on: T1, T4.
Blocks: T9, T10.

## T7 — Site: in-memory rate-limit helper

Add a small in-process rate limiter for the two actions, e.g.
`apps/site/src/helpers/server/rateLimitSameRequest.ts`:

```ts
rateLimitSameRequest({
  key: string,       // e.g. `login:${email}` — hash before storing
  ttlMs: number,     // 30_000
}): boolean          // false = throttled
```

Implementation notes:
- In-memory `Map` with TTL sweep (or lazy expiry on read). No Redis, no
  external state. Nothing reusable exists today — core's `lib/memory.ts` is
  process-memory metrics, not a store.
- Document the limitation: per-process only, resets on deploy, not shared
  across instances — accepted by decision 5.
- Unit tests: first call passes, immediate repeat throttles, expiry releases.

Depends on: nothing.
Blocks: T8, T9.

## T8 — Site: login action calls core directly

Rewrite `apps/site/src/services/auth/login.ts` to call the core `login`
service (T5) instead of `fetchServer` to `AUTHENTICATION_URL`:

1. Rate-limit by email via T7 before anything else; return
   `failure(new RateLimitedError())` when throttled.
2. `const session = await getUserSession()` — pass `session?.id` as
   `sessionUserId`. `session.id` is the user id (server-derived from the
   signed session payload today via `fetchServer`'s `x-user-id` header);
   passing it directly preserves the "one session id = one account"
   invariant. Keep the invariant comment.
3. Validate input with the core valibot `LoginDto` via
   `validatePayload` (`@nosgestesclimat/core/lib/validate-payload`) — same
   helper as `complete-simulation.ts`. Invalid input maps to
   `failure(new UnknownCodeError())` (today an invalid body gets a 400 that
   the current catch already collapses to UnknownCodeError). Check whether
   the form guarantees a well-formed email + 6-digit code client-side and
   adjust only if the UI surfaces a dedicated error for it — verify before
   choosing.
4. Build the service once at module level, mirroring
   `complete-simulation.ts`:

```ts
const loginService = createLogin({
  logger,
  captureException,
  sendWelcomeEmail: createSendWelcomeEmail(sendEmail),
  addOrUpdateContactAfterLogin: createAddOrUpdateContactAfterLogin(addOrUpdateContact),
  origin: env.NEXT_PUBLIC_SITE_URL,
  backgroundTaskRunner: after,   // from 'next/server'
})
```

   The site injects plain `after` — error handling for background tasks
   already lives in the core service (decision 2), so the site needs no
   wrapper runner.
5. Error mapping (simpler than today — no HTTP status translation):
   - `result` failure (an `InvalidVerificationCodeError`, the only domain
     error) → `failure(new InvalidCodeError())`
   - anything thrown (unexpected infra error) → `failure(new UnknownCodeError())`

   Today's `ForbiddenError` / `UnauthorizedError` branches were translating
   HTTP statuses for exceptions the server's login path never actually threw
   — do not port them.
6. Keep the existing post-login steps exactly, adapted to the new return
   shape (`{ user, mode }` — `data` is now `user`): `revokeAllSessions` on
   the old session, `createAppSession(user.id, email)`,
   `revalidatePath('/', 'layout')`, `success({ ...user, userId: user.id })`.
7. Logging parity with the old controller — replicate, don't approximate.
   The site logger (`@/logger`, pino) exists but `maskEmail` does not: port
   it from `apps/server/src/logger.ts` (or re-implement it next to the site
   logger). Log `Login attempt` (masked email, locale, userId),
   `Login succeeded` (mode, durationMs) and a warn-level rejection log with a
   `captureException` (level warning) on `InvalidVerificationCodeError` —
   the Sentry signal replaces the diagnosis context that is gone by
   decision 3.

The public contract of the file must not change: `useLogin`
(`components/authentication/_hooks/useLogin.ts`) and the auth machine keep
working untouched.

Depends on: T5, T7.
Blocks: T10.

## T9 — Site: create-verification-code action calls core directly

Rewrite `apps/site/src/services/auth/create-verification-code.ts` to call the
core service (T6):

1. Rate-limit by email via T7 (30 s); throttled →
   `failure(new RateLimitedError())`. The key scheme simplifies to
   `verification-code:${email}` — the old `method_url_email` hash was an
   artifact of the HTTP middleware.
2. Build the service at module level with the same dependency set as T8
   (`after`, site logger, `@/adapters/brevoClient`) and call it; map anything
   thrown to `failure(new UnknownCodeError())`.
3. Keep the exported signature and the
   `Result<{ expirationDate: string }, EmailError>` contract untouched so
   `useAuthCodeCreation` and the resend flow
   (`verifyCodeForm/notReceived/ResendButton.tsx`) keep working.
4. **`mode` is resolved: drop it from the domain.** It was accepted by the
   HTTP query validator and then ignored by the service (the DTO is
   email-only). The core service takes no `mode`. Keep the `mode` parameter
   in the site action signature for contract compatibility and ignore it —
   mark it deprecated. Removing it from the hook/UI is a separate,
   site-only cleanup, out of scope here.

Depends on: T6, T7.
Blocks: T10.

## T10 — Cleanup: delete the Express auth routes and server auth feature

Once T8 and T9 are verified (all site auth paths exercised):

1. Remove from `apps/server/src/app.ts`: the two `app.use` mounts
   (`/authentication`, `/verification-codes`) and their controller imports
   (lines 13-14, 67, 76).
2. Delete `apps/server/src/features/authentication/` entirely:
   controllers, services, repositories, validators, events, handlers, tests
   and fixtures — including `diagnoseVerificationCodeRejection`, which only
   ever lived inside `authentication.service.ts`.
3. Delete `apps/server/src/core/errors/InvalidVerificationCodeException.ts`
   — its only consumers are the authentication feature and its controller,
   both gone in step 2. Keep `ForbiddenException` /
   `EntityNotFoundException` (users.service and other consumers remain).
4. Point any remaining imports at core:
   - `apps/server/src/features/users/users.service.ts` (verifyCode /
     invalidateVerificationCode — switched to core in T5; verify)
   - `apps/server/src/core/__tests__/fixtures/authentication.fixture.ts`
     (test fixture — migrate or delete with its consumers)
5. Keep `rateLimitSameRequestMiddleware` — the newsletter controller still
   uses it.
6. Keep `authentificationMiddleware` — other routes still use it.
7. Site constants: remove `AUTHENTICATION_URL` and `VERIFICATION_CODE_URL`
   from `apps/site/src/constants/urls/main.ts` — the two site auth services
   are their only references.
8. Run the full suite: `pnpm test`, `pnpm typecheck`, `pnpm lint` at the
   monorepo root.

Depends on: T5, T6, T8, T9.
Blocks: nothing.

---

## Dependency graph

```
T1 (codes repo + schemas + error) ──┬──> T5 (login service) ────> T8 (login action) ──┐
T2 (users repo) ────────────────────┤                                           ├──> T10 (cleanup)
T3 (side fx) ───────────────────────┤                                           │
T4 (brevo factories) ───────────────┼──> T6 (code service) ────> T9 (code action)─┘
T7 (rate limit) ────────────────────┴──> T8, T9
```

Parallelizable batches:
- Batch 1: T1, T2, T3, T4, T7 (all independent)
- Batch 2: T5, T6
- Batch 3: T8, T9
- Batch 4: T10

## Open points implementers must check (not decided here)

- Core test-utils coverage for `verifiedUser` / `verificationCode` models —
  `packages/core/src/test-utils/db.ts` provides only `createTestDatabase()`;
  extend it with row fixtures if missing.
- Whether the login form (`AuthenticateUserForm.tsx`) guarantees a
  well-formed email + 6-digit code client-side — decides whether an invalid
  input can be surfaced as anything more specific than `UnknownCodeError`
  (T8 step 3).
- Observability parity: confirm the site's pino logger + Sentry give the same
  signal quality as the server's structured `Login attempt` logs once
  `maskEmail` is ported (T8 step 7).

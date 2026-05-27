# Repo guidelines

## Types

- **Derive, don't hardcode.** Types must emerge from a single source of truth. No copy-pasted overloads. No `Record<X, Y>` when a mapped type will do.
- **No `as unknown`.** Use native discriminants, narrow casts, or type guards. Lazy typing is rejected.
- **No unnecessary indirection.** `Maybe<T>` → just write `T | undefined`. `CONST['key']` when a bare string literal works → no.
- **`satisfies` on every structured config.** Catches omissions at build time.

## Tests

- **Mock dependencies, don't pollute production.**
- **No over-engineering.** Cover real bug paths. Framework-testing mocks are noise.

## Code

- **No comments unless asked.** Light JSDoc on exported functions is fine.
- **Follow existing patterns.** Don't invent new conventions when the repo already has one.
- **DRY, not clever.** Deduplicating identical blocks → yes. A type alias saving 10 chars → no.
- **Validate at runtime unknown values.**

## Communication

- **When the user says "this is wrong", don't ignore it.** Either comply or state your case _before_ writing code.
- **Push only when asked.**
- **Always verify lint + typecheck + tests before proposing a commit.**
- **Code in English, communicate in French.**

# Sub-category export

Computes the **sub-categories** of the simulations stored in the database and
exports them as CSV to the Scaleway bucket.

The CSV format (`;` separator, decimal comma) is the one the post analysis tools
expect (Ravijen, end page, PostHog import).

## Running a month

```sh
# On Scalingo (the code must be deployed on the app)
scalingo --app nosgestesclimat-preprod run --detached \
  "npm run jobs:exportSubcategories -- --period 2026-01"

# Follow the run (replace one-off-XXXX with the printed id)
scalingo --app nosgestesclimat-preprod logs --filter one-off-XXXX
```

> ⚠️ The Scalingo CLI (< 1.51) cannot attach to one-offs: `run` without
> `--detached` fails with `exit status 1` while the container does start. Use
> `--detached`, then `logs --filter`.

A one-off worker is killed after **1 hour without stdout output**: the job
prints a heartbeat every 5 minutes, plus the progression of every batch.

| Option                        | Default | Role                                                      |
| ----------------------------- | ------- | --------------------------------------------------------- |
| `-p`, `--period`              | —       | Month to export (`YYYY-MM`)                               |
| `--start-date` / `--end-date` | —       | Explicit period (`--end-date` included)                   |
| `-b`, `--batch`               | `1000`  | Batch size (~20 s per batch)                              |
| `-s`, `--schema`              | `ngc`   | Postgres schema                                           |
| `-f`, `--from`                | `auto`  | Resume from the bucket checkpoint, or `0` to start over   |
| `--no-upload`                 | —       | Write locally only (debug)                                |
| `--sample-per-version`        | —       | **Pre-flight**: at most N simulations per version         |
| `--sample-mode`               | `first` | Pre-flight: `first`, `spread` (evenly spaced) or `random` |
| `--sample-seed`               | `0`     | Pre-flight, `random` mode: draw seed                      |
| `--versions`                  | —       | Pre-flight: restrict to some versions                     |
| `-v`, `--verbose`             | —       | Per-simulation detail                                     |

## Outputs

```
ngc/export-subcategories/<period>/sous-categories-<period>.csv
ngc/export-subcategories/<period>/sous-categories-<period>.csv.checkpoint.json
ngc/export-subcategories/_model-cache/<version>.json
```

The CSV and the checkpoint are uploaded every 25 batches and at the end of the
run: an interrupted run resumes at the next batch with `--from auto` (default).
The model rules cache avoids downloading the npm tarballs again on resume.

## Pre-flight before a full run

On a long period, validate the rule compatibility on a sample first:

```sh
scalingo --app nosgestesclimat-preprod run --detached \
  "npm run jobs:exportSubcategories -- --period 2026-01 --sample-per-version 50 --sample-mode spread"
```

The final report gives, per model version: number of simulations in the
database, sample size, lines written, incoherent, errors, skipped, and the rules
set applied. A sample CSV is **not** exhaustive: it is for diagnosis, not for
analysis.

## Sub-category rules

They live in [`rules/`](./rules) and are the **source of truth**:

| File                               | Role                                                    |
| ---------------------------------- | ------------------------------------------------------- |
| `subcategories.yaml`               | base file, defines the CSV columns                      |
| `subcategories.before-4.16.0.yaml` | breakfast (profile → components), household electricity |
| `subcategories.before-4.10.1.yaml` | electricity through `consommation totale collectif`     |
| `subcategories.before-4.10.0.yaml` | heating without `mode`, `berline` car template          |
| `subcategories.before-4.9.1.yaml`  | `services sociétaux` not splittable by NAF branch       |

The [`lib/rules.ts`](./lib/rules.ts) catalogue maps each version range to the
files to merge (floor: **4.6.0**). A variant may only **override** existing
rules: the job refuses to start if one adds a rule, because the CSV columns
would depend on it. It also refuses to start if a referenced file is missing —
`getModelFromSource` silently ignores an absent file, so a renamed variant would
otherwise be lost without an error.

## Implementation notes

- **Period column**: the period, the keyset pagination and the `date` column of
  the CSV all use `createdAt`. It is the only indexed column
  (`Simulation_createdAt_idx`) and the only one never rewritten (`updatedAt`
  changes on every autosave, and moving a simulation to another month would
  change what an export means). `Simulation.date` is **not** read: it is set by
  the browser without validation, and measured on the 2026 insertions it is
  unreliable — 1.8 % of March rows fall on another day than their `createdAt`,
  up to 2.8 years earlier (a tab left open), and 2 252 rows have a `date` in the
  future, including year 2038 (32-bit epoch overflow). The column name `date` is
  kept because downstream tools rely on it.
- **Connection**: `psql` (provided by the image) with
  `SCALINGO_POSTGRESQL_URL`. `DATABASE_URL` carries `connection_limit`, a Prisma
  parameter libpq rejects — the URL is cleaned when needed. Every value reaching
  SQL is bound as a psql variable (`-v`, `:'name'` / `:"name"`), never
  concatenated; the password is passed through `PGPASSWORD` so it does not show
  in `ps`.
- **Model rules**: downloaded from npm version by version
  (`lib/model-rules.ts`), with 4 attempts and a bucket cache fallback. An
  isolated `ECONNRESET` does not lose a simulation.
- **Memory**: ~45 MB RSS per Publicodes engine, cached per version without
  eviction. Over a month (≤ 9 versions in practice) this stays below ~500 MB; on
  a long period, run month by month. Size **L** is enough.
- **Measured throughput**: ~23 ms per simulation, i.e. ~40 min for a production
  month (100 k simulations) and ~8 h for a year.

## Tests

```sh
npx vitest run src/jobs/subcategories
```

The tests cover period resolution, URL cleaning, S3 keys, the version catalogue
and the integrity of the rules files.

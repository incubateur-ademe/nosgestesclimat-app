/**
 * Empty stand-in for the `server-only` marker package, aliased in
 * `vitest.config.ts`: the package throws under the default export condition,
 * and tests import server modules directly — outside Next's bundler, the
 * `react-server` condition that empties it does not exist.
 */
export {}

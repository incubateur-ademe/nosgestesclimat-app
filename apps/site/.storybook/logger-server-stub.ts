import { noopLogger } from '@nosgestesclimat/core/features/logger/index'

/**
 * Browser stand-in for `@/logger/logger.server`.
 *
 * Some stories render async server components directly (for example
 * `AllBlogCategories`), which pulls `logger.server` into the preview bundle.
 * The real logger wires the Node OpenTelemetry SDK, whose browser bundle
 * cannot resolve `async_hooks`. These components are only displayed in
 * Storybook, so the shared no-op logger is enough.
 */
export default noopLogger

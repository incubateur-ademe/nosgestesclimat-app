import { registerUncaughtErrorHandlers } from './observability/uncaught-errors'
import { PostHog } from './services/tracking/Posthog'

registerUncaughtErrorHandlers()

new PostHog().init()

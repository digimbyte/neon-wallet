import * as ReactSentry from '@sentry/react'

const isSentryEnable = process.env.NODE_ENV === 'production'

export function setupSentryReact() {
  if (isSentryEnable) {
    ReactSentry.init({
      dsn:
        'https://84c269b6f724a4ec47e140b42f4e6d7d@o1193870.ingest.us.sentry.io/4506502883639296',
      environment: 'NEON-2',
      attachStacktrace: true,
      autoSessionTracking: true,
      debug: false,
      enableTracing: true,
      replaysOnErrorSampleRate: 1.0,
      replaysSessionSampleRate: 0.1,
      tracePropagationTargets: ['localhost'],
      tracesSampleRate: 1.0,
      version: process.env.npm_package_version,
    })
  }
}

export const setupSentryWrapper = app =>
  isSentryEnable
    ? ReactSentry.withProfiler(ReactSentry.withErrorBoundary(app))
    : app
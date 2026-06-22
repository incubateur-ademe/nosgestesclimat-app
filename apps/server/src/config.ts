import dotenv from 'dotenv'
import * as v from 'valibot'

if (process.env.NODE_ENV === 'development') {
  dotenv.config({ quiet: true })
}

const EnvSchema = v.optional(
  v.picklist(['development', 'production', 'test']),
  'development'
)

const AppEnvSchema = v.picklist([
  'development',
  'production',
  'test',
  'preproduction',
  'review',
])

type AppEnv = v.InferOutput<typeof AppEnvSchema>

const ListCommaSeparatedSchema = v.pipe(
  v.fallback(v.string(), ''),
  v.transform((list) => new Set(list.split(',')))
)

const AppSchema = v.strictObject({
  env: EnvSchema,
  appEnv: AppEnvSchema,
  origin: v.optional(v.pipe(v.string(), v.url()), 'https://nosgestesclimat.fr'),
  organisationIdsWithCustomQuestionsEnabled: v.optional(
    ListCommaSeparatedSchema,
    ''
  ),
  port: v.optional(v.pipe(v.unknown(), v.toNumber(), v.number())),
  serverUrl: v.optional(v.string()),
  redis: v.strictObject({
    url: v.optional(v.string(), 'redis://localhost:6379'),
  }),
})

const SecuritySchema = v.strictObject({
  cookie: v.strictObject({
    name: v.optional(v.string(), 'ngc_server_auth_jwt'),
  }),
  job: v.strictObject({ secret: v.string() }),
  jwt: v.strictObject({ secret: v.string() }),
})

const AgirSchema = v.strictObject({
  apiKey: v.string(),
  url: v.pipe(v.string(), v.url()),
})

const BrevoSchema = v.strictObject({
  apiKey: v.string(),
  url: v.pipe(v.string(), v.url()),
})

const ConnectSchema = v.strictObject({
  clientId: v.string(),
  clientSecret: v.string(),
  url: v.pipe(v.string(), v.url()),
})

const MatomoInstanceBaseSchema = v.strictObject({
  token: v.string(),
  timeout: v.optional(v.pipe(v.unknown(), v.toNumber(), v.number()), 60000),
  secure: v.optional(
    v.pipe(
      v.string(),
      v.transform((val) => val === 'true')
    )
  ),
})

const MatomoBetaSchema = v.strictObject({
  ...MatomoInstanceBaseSchema.entries,
  siteId: v.optional(v.string(), '20'),
  url: v.optional(v.pipe(v.string(), v.url()), 'https://stats.beta.gouv.fr'),
})

const MatomoDataSchema = v.strictObject({
  ...MatomoInstanceBaseSchema.entries,
  siteId: v.optional(v.string(), '153'),
  url: v.optional(v.pipe(v.string(), v.url()), 'https://stats.data.gouv.fr'),
})

const MatomoSchema = v.strictObject({
  beta: MatomoBetaSchema,
  data: v.optional(MatomoDataSchema),
})

const ScalewaySchema = v.strictObject({
  accessKeyId: v.string(),
  secretAccessKey: v.string(),
  bucket: v.string(),
  endpoint: v.optional(v.string(), 'https://s3.fr-par.scw.cloud'),
  region: v.optional(v.string(), 'fr-par'),
  rootPath: v.optional(v.string(), 'ngc'),
})

const SentrySchema = v.strictObject({
  dsn: v.optional(v.string()),
})

const TwoTonsSchema = v.strictObject({
  url: v.pipe(v.string(), v.url()),
  bearerToken: v.string(),
})

const NotionSchema = v.strictObject({
  apiKey: v.string(),
  actionDatabaseId: v.string(),
})

const ThirdPartySchema = v.strictObject({
  agir: AgirSchema,
  brevo: BrevoSchema,
  connect: ConnectSchema,
  matomo: MatomoSchema,
  scaleway: ScalewaySchema,
  sentry: SentrySchema,
  twoTons: TwoTonsSchema,
  notion: NotionSchema,
})

const ConfigSchema = v.pipe(
  v.strictObject({
    app: AppSchema,
    security: SecuritySchema,
    thirdParty: ThirdPartySchema,
  }),
  v.transform(({ app, ...config }) => ({
    ...config,
    app: {
      ...app,
      port:
        typeof app.port === 'number'
          ? app.port
          : app.env === 'development'
            ? 3001
            : 3000,
      serverUrl:
        app.serverUrl ||
        (app.env === 'development'
          ? 'http://localhost:3001'
          : 'https://server.nosgestesclimat.fr'),
    },
  }))
)

const {
  env: {
    AGIR_API_KEY,
    AGIR_URL,
    APP_ENV,
    BREVO_API_KEY,
    BREVO_URL,
    CONNECT_CLIENT_ID,
    CONNECT_CLIENT_SECRET,
    CONNECT_URL,
    AUTH_COOKIE_NAME,
    JOB_SECRET,
    JWT_SECRET,
    MATOMO_BETA_SITE_ID,
    MATOMO_BETA_SECURE,
    MATOMO_BETA_TIMEOUT,
    MATOMO_BETA_TOKEN,
    MATOMO_BETA_URL,
    NOTION_API_KEY,
    NOTION_ACTION_DATABASE_ID,
    NODE_ENV,
    ORGANISATION_IDS_WITH_CUSTOM_QUESTIONS_ENABLED,
    ORIGIN,
    PORT,
    REDIS_URL,
    SCALEWAY_SECRET_ACCESS_KEY,
    SCALEWAY_ACCESS_KEY_ID,
    SCALEWAY_BUCKET,
    SCALEWAY_ENDPOINT,
    SCALEWAY_REGION,
    SCALEWAY_ROOT_PATH,
    SENTRY_DSN,
    SERVER_URL,
    TWO_TONS_BEARER_TOKEN,
    TWO_TONS_URL,
  },
} = process

export const config = v.parse(ConfigSchema, {
  app: {
    env: NODE_ENV,
    appEnv: APP_ENV,
    origin: ORIGIN,
    organisationIdsWithCustomQuestionsEnabled:
      ORGANISATION_IDS_WITH_CUSTOM_QUESTIONS_ENABLED,
    port: PORT,
    redis: {
      url: REDIS_URL,
    },
    serverUrl: SERVER_URL,
  },
  security: {
    cookie: {
      name: AUTH_COOKIE_NAME,
    },
    job: {
      secret: JOB_SECRET,
    },
    jwt: {
      secret: JWT_SECRET,
    },
  },
  thirdParty: {
    agir: {
      apiKey: AGIR_API_KEY,
      url: AGIR_URL,
    },
    brevo: {
      apiKey: BREVO_API_KEY,
      url: BREVO_URL,
    },
    connect: {
      clientId: CONNECT_CLIENT_ID,
      clientSecret: CONNECT_CLIENT_SECRET,
      url: CONNECT_URL,
    },
    matomo: {
      beta: {
        siteId: MATOMO_BETA_SITE_ID,
        secure: MATOMO_BETA_SECURE,
        timeout: MATOMO_BETA_TIMEOUT,
        token: MATOMO_BETA_TOKEN,
        url: MATOMO_BETA_URL,
      },
    },
    notion: {
      apiKey: NOTION_API_KEY,
      actionDatabaseId: NOTION_ACTION_DATABASE_ID,
    },
    scaleway: {
      secretAccessKey: SCALEWAY_SECRET_ACCESS_KEY,
      accessKeyId: SCALEWAY_ACCESS_KEY_ID,
      bucket: SCALEWAY_BUCKET,
      endpoint: SCALEWAY_ENDPOINT,
      region: SCALEWAY_REGION,
      rootPath: SCALEWAY_ROOT_PATH,
    },
    sentry: {
      dsn: SENTRY_DSN,
    },
    twoTons: {
      bearerToken: TWO_TONS_BEARER_TOKEN,
      url: TWO_TONS_URL,
    },
  },
})

const up = (str: string) => new URLPattern(str) // improves readability of config below

const ALLOWED_ORIGINS_BY_APP_ENV: Record<AppEnv, URLPattern[]> = {
  development: [up('http://localhost:3000'), up('https://localhost:3000')],
  test: [up('https://nosgestesclimat.test')],
  preproduction: [up('https://preprod.nosgestesclimat.fr')],
  review: [up('https://nosgestesclimat-site-preprod-pr*.osc-fr1.scalingo.io')],
  production: [up('https://nosgestesclimat.fr')],
}

export const allowedOrigins: URLPattern[] =
  ALLOWED_ORIGINS_BY_APP_ENV[config.app.appEnv] ?? []

// Any path of any allowed origin
export const allowedRedirectUrls = allowedOrigins.map(
  (o) =>
    new URLPattern({
      protocol: o.protocol,
      username: o.username,
      password: o.password,
      hostname: o.hostname,
      port: o.port,
      pathname: '/*',
      search: o.search,
      hash: o.hash,
    })
)

import dotenv from 'dotenv'
import { z } from 'zod'

if (process.env.NODE_ENV === 'development') {
  dotenv.config({ quiet: true })
}

const EnvSchema = z
  .enum(['development', 'production', 'test'])
  .default('development')

const ListCommaSeparatedSchema = z
  .string()
  .optional()
  .transform((list = '') => new Set(list.split(',')))

const AppSchema = z
  .object({
    env: EnvSchema,
    origin: z.string().url().default('https://nosgestesclimat.fr'),
    organisationIdsWithCustomQuestionsEnabled: ListCommaSeparatedSchema,
    port: z.coerce.number().optional(),
    serverUrl: z.string().optional(),
    redis: z
      .object({
        url: z.string().default('redis://localhost:6379'),
      })
      .strict(),
  })
  .strict()

const SecuritySchema = z
  .object({
    cookie: z
      .object({ name: z.string().default('ngc_server_auth_jwt') })
      .strict(),
    job: z.object({ secret: z.string() }).strict(),
    jwt: z.object({ secret: z.string() }).strict(),
  })
  .strict()

const AgirSchema = z
  .object({ apiKey: z.string(), url: z.string().url() })
  .strict()

const BrevoSchema = z
  .object({ apiKey: z.string(), url: z.string().url() })
  .strict()

const ConnectSchema = z
  .object({
    clientId: z.string(),
    clientSecret: z.string(),
    url: z.string().url(),
  })
  .strict()

const MatomoInstanceBaseSchema = z
  .object({
    token: z.string(),
    timeout: z.coerce.number().default(60000),
    secure: z
      .string()
      .optional()
      .transform((val) => val === 'true'),
  })
  .strict()

const MatomoBetaSchema = MatomoInstanceBaseSchema.extend({
  siteId: z.string().default('20'),
  url: z.string().url().default('https://stats.beta.gouv.fr'),
}).strict()

const MatomoDataSchema = MatomoInstanceBaseSchema.extend({
  siteId: z.string().default('153'),
  url: z.string().url().default('https://stats.data.gouv.fr'),
}).strict()

const MatomoSchema = z
  .object({
    beta: MatomoBetaSchema,
    data: MatomoDataSchema,
  })
  .strict()

const ScalewaySchema = z
  .object({
    accessKeyId: z.string(),
    secretAccessKey: z.string(),
    bucket: z.string(),
    endpoint: z.string().default('https://s3.fr-par.scw.cloud'),
    region: z.string().default('fr-par'),
    rootPath: z.string().default('ngc'),
  })
  .strict()

const SentrySchema = z
  .object({
    dsn: z.string().optional(),
  })
  .strict()

const TwoTonsSchema = z
  .object({
    url: z.string().url(),
    bearerToken: z.string(),
  })
  .strict()

const ThirdPartySchema = z
  .object({
    agir: AgirSchema,
    brevo: BrevoSchema,
    connect: ConnectSchema,
    matomo: MatomoSchema,
    scaleway: ScalewaySchema,
    sentry: SentrySchema,
    twoTons: TwoTonsSchema,
  })
  .strict()

const ConfigSchema = z
  .object({
    app: AppSchema,
    security: SecuritySchema,
    thirdParty: ThirdPartySchema,
  })
  .strict()
  .transform(({ app, ...config }) => ({
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

const {
  env: {
    AGIR_API_KEY,
    AGIR_URL,
    BREVO_API_KEY,
    BREVO_URL,
    CONNECT_CLIENT_ID,
    CONNECT_CLIENT_SECRET,
    CONNECT_URL,
    AUTH_COOKIE_NAME,
    JOB_SECRET,
    JWT_SECRET,
    MATOMO_BETA_SITE_ID,
    MATOMO_BETA_TIMEOUT,
    MATOMO_BETA_TOKEN,
    MATOMO_BETA_URL,
    MATOMO_DATA_SITE_ID,
    MATOMO_DATA_TIMEOUT,
    MATOMO_DATA_TOKEN,
    MATOMO_DATA_URL,
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

export const config = ConfigSchema.parse({
  app: {
    env: NODE_ENV,
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
        timeout: MATOMO_BETA_TIMEOUT,
        token: MATOMO_BETA_TOKEN,
        url: MATOMO_BETA_URL,
      },
      data: {
        siteId: MATOMO_DATA_SITE_ID,
        timeout: MATOMO_DATA_TIMEOUT,
        token: MATOMO_DATA_TOKEN,
        url: MATOMO_DATA_URL,
      },
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

export const origin =
  config.app.env === 'development'
    ? ['http://localhost:3000', 'https://localhost:3000']
    : [
        'http://localhost:3000',
        'https://localhost:3000',
        'https://nosgestesclimat.fr',
        'https://preprod.nosgestesclimat.fr',
        /\.osc-fr1\.scalingo\.io$/,
        /\.vercel\.app$/,
      ]

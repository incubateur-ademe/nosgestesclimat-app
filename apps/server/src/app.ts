import { createExpressEndpoints } from '@ts-rest/express'
import { generateOpenApi } from '@ts-rest/open-api'
import cors from 'cors'
import type { Request } from 'express'
import express from 'express'
import { StatusCodes } from 'http-status-codes'
import morgan from 'morgan'
import path from 'path'
import requestIp from 'request-ip'
import swaggerUi from 'swagger-ui-express'
import { origin } from './config.js'
import authenticationController from './features/authentication/authentication.controller.js'
import verificationCodeController from './features/authentication/verification-codes.controller.js'
import groupsController from './features/groups/groups.controller.js'
import integrationsApiContract from './features/integrations/api/api.contract.js'
import integrationsApiController from './features/integrations/api/api.controller.js'
import integrationsController from './features/integrations/integrations.controller.js'
import modeleController from './features/modele/modele.controller.js'
import newslettersController from './features/newsletter/newsletter.controller.js'
import organisationController from './features/organisations/organisations.controller.js'
import simulationController from './features/simulations/simulations.controller.js'
import statsController from './features/stats/stats.controller.js'
import usersController from './features/users/users.controller.js'
import logger, { redactBody } from './logger.js'

const app = express()

app.use(express.static(path.join(import.meta.dirname, 'public')))
app.use(express.json())

app.use((req, _, next) => {
  req.requestParams = JSON.stringify({
    body: redactBody({ ...req.body }),
    query: { ...req.query },
    params: { ...req.params },
  })

  return next()
})

app.use(
  cors({
    origin,
    credentials: true,
  })
)

app.use(requestIp.mw())

morgan.token('params', (req: Request) => req.requestParams)

morgan.token('ip', (req: Request) => (req.clientIp ? '[REDACTED]' : ''))

app.use(
  morgan(
    '{"method":":method","url":":url","ip"::ip,"params"::params,"status":":status","resContentLength":":res[content-length]","reponseTime":":response-time ms"}',
    {
      stream: {
        write: (message) => logger.info(message.trim()),
      },
    }
  )
)

app.use('/authentication', authenticationController)
app.use('/modele', modeleController)
app.use('/groups', groupsController)
app.use('/integrations', integrationsController)
app.use('/newsletters', newslettersController)
app.use('/organisations', organisationController)
app.use('/simulations', simulationController)
app.use('/stats', statsController)
app.use('/users', usersController)
app.use('/verification-codes', verificationCodeController)

// public routes
app.get('/api/stats', (_, res) =>
  res.redirect(StatusCodes.MOVED_PERMANENTLY, '/stats/v1/northstar')
)

createExpressEndpoints(
  integrationsApiContract,
  integrationsApiController,
  app,
  {
    logInitialization: false,
  }
)

const integrationsOpenApiDocument = generateOpenApi(
  integrationsApiContract,
  {
    info: {
      title: 'Integrations API',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  {
    setOperationId: true,
    operationMapper: (operation, appRoute) => ({
      ...operation,
      ...(appRoute.metadata || {}),
    }),
  }
)

app.use(
  '/integrations-api/docs',
  swaggerUi.serve,
  swaggerUi.setup(integrationsOpenApiDocument)
)

export default app

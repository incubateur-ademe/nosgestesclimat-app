import { createServer } from '@mswjs/http-middleware'
import { handlers } from './handlers.ts'

const port = Number(process.env.PORT ?? 3002)
const app = createServer(...handlers)

app.listen(port, () => {
  console.log(`e2e mock server listening on http://localhost:${port}`)
})

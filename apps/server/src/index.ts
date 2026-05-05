import { Server as HttpServer } from 'http'
import type { AddressInfo } from 'net'
import { redis } from './adapters/redis/client.ts'
import app from './app.ts'
import { config } from './config.ts'
import { initGeolocationStore } from './features/modele/geolocation.repository.ts'

const main = async () => {
  await redis.connect()
  await initGeolocationStore()

  const server = new HttpServer(app)

  server.listen(config.app.port, () => {
    const { address: host, port } = server.address() as AddressInfo
    console.log('App listening at http://%s:%s', host, port)
  })
}

main()

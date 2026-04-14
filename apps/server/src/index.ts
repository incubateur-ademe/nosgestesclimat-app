import { Server as HttpServer } from 'http'
import type { AddressInfo } from 'net'
import { redis } from './adapters/redis/client.js'
import app from './app.js'
import { config } from './config.js'
import { initGeolocationStore } from './features/modele/geolocation.repository.js'

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

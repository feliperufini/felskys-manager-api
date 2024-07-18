import { app } from './app'
import { env } from './env'

app
  .listen({
    host: 'RENDER' in process.env ? '0.0.0.0' : 'localhost',
    port: env.API_BASE_PORT,
  })
  .then(() => {
    console.log(
      `HTTP Server Running...\n${env.API_BASE_URL}:${env.API_BASE_PORT}`,
    )
  })

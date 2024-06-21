import fastify from 'fastify'
import { table } from './database'

const app = fastify()

app.get('/hello', async () => {
  const tables = await table('sqlite_schema').select('*')
  return tables
})

app
  .listen({
    host: '0.0.0.0',
    port: 3333,
  })
  .then(() => {
    console.log('HTTP server running on http://localhost:3333')
  })

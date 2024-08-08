/* eslint-disable prettier/prettier */
import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_AMBIENT: z.enum(['development', 'test', 'production']).default('production'),
  DATABASE_CLIENT: z.enum(['sqlite', 'pg']),
  DATABASE_URL: z.string(),
  API_BASE_URL: z.string().url(),
  WEB_BASE_URL: z.string().url(),
  API_BASE_PORT: z.coerce.number().default(3333),
  JWT_SECRET: z.string(),
})

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.error('Invalid environment variables!', _env.error.format())

  throw new Error('Invalid environment variables!')
}

export const env = _env.data

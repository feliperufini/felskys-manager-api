import type { FastifyInstance } from 'fastify'
import { ZodError } from 'zod'

type FastifyErrorHandler = FastifyInstance['errorHandler']

export class ClientError extends Error {}

export const errorHandler: FastifyErrorHandler = (error, request, response) => {
  if (error instanceof ZodError) {
    return response.status(422).send({
      message: 'Input validation error',
      errors: error.flatten().fieldErrors,
    })
  } else if (error.statusCode === 404 || error.code === 'P2025') {
    return response.status(404).send({
      message: 'Record not found',
    })
  } else if (error instanceof ClientError) {
    return response.status(400).send({
      message: error.message,
    })
  }

  return response.status(500).send({ message: 'Internal server error' })
}

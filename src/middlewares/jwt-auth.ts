import { FastifyReply, FastifyRequest } from 'fastify'
import { ClientError } from '../error-handler'
import { JwtPayload, verify } from 'jsonwebtoken'
import { env } from '../env'

export async function verifyJwt(
  request: FastifyRequest,
  response: FastifyReply,
) {
  try {
    await request.jwtVerify()
  } catch (error) {
    return response
      .status(401)
      .send({ message: 'Token de acesso inválido.', error })
  }
}

export function userEmailTokenRequest(request: FastifyRequest): string {
  const authHeader = request.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ClientError('Token de autenticação inválido ou não fornecido.')
  }

  const token = authHeader.split(' ')[1]
  const decodedToken = verify(token, env.JWT_SECRET) as JwtPayload

  return decodedToken.email
}

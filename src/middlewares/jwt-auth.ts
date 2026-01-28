import type { FastifyReply, FastifyRequest } from 'fastify'
import { type JwtPayload, verify } from 'jsonwebtoken'
import { env } from '../env'
import { ClientError } from '../error-handler'

export async function verifyJwt(
	request: FastifyRequest,
	response: FastifyReply,
) {
	try {
		await request.jwtVerify()
	} catch (error: any) {
		const tokenErrorMessage =
			error?.code === 'FST_JWT_AUTHORIZATION_TOKEN_EXPIRED'
				? 'expirado'
				: 'inválido'
		return response
			.status(401)
			.send({ message: `Token de acesso ${tokenErrorMessage}.`, error })
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

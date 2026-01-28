import { randomUUID } from 'node:crypto'
import { compare } from 'bcryptjs'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { sign } from 'jsonwebtoken'
import { z } from 'zod'
import { env } from '../env'
import { prisma } from '../libs/prisma'

export async function authenticationRoutes(app: FastifyInstance) {
	app
		.withTypeProvider<ZodTypeProvider>()
		.post('/login', async (request, response) => {
			const loginBodySchema = z.object({
				email: z.string().email(),
				password: z.string().min(8),
			})

			const { email, password } = loginBodySchema.parse(request.body)

			const user = await prisma.user.findUnique({
				where: {
					email,
				},
			})

			if (!user) {
				return response.status(403).send({ message: 'Credenciais inválidas.' })
			}

			const isValidPassword = await compare(password, user.password_hash)

			if (!isValidPassword) {
				return response.status(403).send({ message: 'Credenciais inválidas.' })
			}

			const EXPIRES_TOKEN_IN_HOURS = 23

			const token = sign({ id: user.id, email: user.email }, env.JWT_SECRET, {
				expiresIn: `${EXPIRES_TOKEN_IN_HOURS}h`,
			})
			const tokenExpiresAt = new Date(
				Date.now() + EXPIRES_TOKEN_IN_HOURS * 60 * 60 * 1000,
			)

			const newUser = {
				id: user.id,
				nickname: user.nickname,
				email: user.email,
				role_id: user.role_id,
			}

			const loginResponseData = {
				token,
				token_expires_at: tokenExpiresAt,
				user: newUser,
			}

			await prisma.log.create({
				data: {
					method: 'LOGIN',
					model: 'User',
					// register_id: user.id,
					api_route: '/login',
					message: 'Sucesso ao efetuar login',
					context: JSON.stringify({
						...loginResponseData,
						token: undefined,
					}),
					// old_context: null,
					// new_context: null,
					level: 'SUCCESS',
					created_by: user.email,
				},
			})

			return response.status(200).send({
				message: 'Login efetuado com sucesso!',
				data: loginResponseData,
			})
		})
}

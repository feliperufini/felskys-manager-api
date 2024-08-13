import { compare } from 'bcryptjs'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../libs/prisma'
import { sign } from 'jsonwebtoken'
import { env } from '../env'

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
        expiresIn: EXPIRES_TOKEN_IN_HOURS + 'h',
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

      return response.status(200).send({
        message: 'Login efetuado com sucesso!',
        data: {
          token,
          token_expires_at: tokenExpiresAt,
          user: newUser,
        },
      })
    })
}

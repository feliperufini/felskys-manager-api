import { z } from 'zod'
import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { randomUUID } from 'crypto'
import { hash } from 'bcryptjs'
import { ZodTypeProvider } from 'fastify-type-provider-zod'

export async function usersRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get('/', async () => {
    const users = await prisma.user.findMany()

    return { users }
  })

  app.withTypeProvider<ZodTypeProvider>().get('/:id', async (request) => {
    const getUsersParamsSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = getUsersParamsSchema.parse(request.params)

    const user = await prisma.user.findUniqueOrThrow({
      where: {
        id,
      },
    })

    return { user }
  })

  app
    .withTypeProvider<ZodTypeProvider>()
    .post('/', async (request, response) => {
      const createUserBodySchema = z
        .object({
          nickname: z.string(),
          email: z.string().email(),
          password: z.string(),
          role_id: z.string(),
        })
        .required()

      const { nickname, email, password, role_id } = createUserBodySchema.parse(
        request.body,
      )

      try {
        const passwordHash = await hash(password, 8)

        await prisma.user.create({
          data: {
            id: randomUUID(),
            nickname,
            email,
            password_hash: passwordHash,
            role_id,
          },
        })

        return response
          .status(201)
          .send({ message: 'Usuário cadastrado com sucesso!' })
      } catch (error: unknown) {
        if (error instanceof Error) {
          return response.status(400).send({
            message: 'Erro ao cadastrar o usuário.',
            error: error?.message,
          })
        } else {
          return response.status(400).send({
            message: 'Erro ao cadastrar o usuário.',
            error,
          })
        }
      }
    })

  app
    .withTypeProvider<ZodTypeProvider>()
    .put('/:id', async (request, response) => {
      const getUsersParamsSchema = z.object({
        id: z.string().uuid(),
      })
      const { id } = getUsersParamsSchema.parse(request.params)

      const updateUserBodySchema = z.object({
        nickname: z.string(),
        email: z.string().email(),
        password: z.string().nullish(),
        role_id: z.string(),
      })

      const { nickname, email, password, role_id } = updateUserBodySchema.parse(
        request.body,
      )

      try {
        if (password) {
          const passwordHash = await hash(password, 8)

          await prisma.user.update({
            where: {
              id,
            },
            data: {
              nickname,
              email,
              password_hash: passwordHash,
              role_id,
              updated_at: new Date(),
            },
          })
        } else {
          await prisma.user.update({
            where: {
              id,
            },
            data: {
              nickname,
              email,
              role_id,
              updated_at: new Date(),
            },
          })
        }

        return response
          .status(201)
          .send({ message: 'Usuário atualizado com sucesso!' })
      } catch (error: unknown) {
        if (error instanceof Error) {
          return response.status(400).send({
            message: 'Erro ao atualizar o usuário.',
            error: error?.message,
          })
        } else {
          return response.status(400).send({
            message: 'Erro ao atualizar o usuário.',
            error,
          })
        }
      }
    })

  app
    .withTypeProvider<ZodTypeProvider>()
    .delete('/:id', async (request, response) => {
      const getUsersParamsSchema = z.object({
        id: z.string().uuid(),
      })
      const { id } = getUsersParamsSchema.parse(request.params)

      try {
        await prisma.user.delete({ where: { id } })

        return response
          .status(200)
          .send({ message: 'Usuário deletado com sucesso!' })
      } catch (error: unknown) {
        if (error instanceof Error) {
          return response.status(400).send({
            message: 'Erro ao deletar o usuário.',
            error: error?.message,
          })
        } else {
          return response.status(400).send({
            message: 'Erro ao deletar o usuário.',
            error,
          })
        }
      }
    })
}

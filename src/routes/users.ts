import { z } from 'zod'
import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { randomUUID } from 'crypto'

export async function usersRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const users = await prisma.user.findMany()

    return { users }
  })

  app.get('/:id', async (request) => {
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

  app.post('/', async (request, response) => {
    const createUserBodySchema = z.object({
      nickname: z.string(),
      email: z.string().email(),
      password: z.string(),
      roleId: z.string(),
    })

    const { nickname, email, password, roleId } = createUserBodySchema.parse(
      request.body,
    )

    try {
      await prisma.user.create({
        data: {
          id: randomUUID(),
          nickname,
          email,
          passwordHash: hash(password),
          roleId,
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

  app.put('/:id', async (request, response) => {
    const getUsersParamsSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = getUsersParamsSchema.parse(request.params)

    const updateUserBodySchema = z.object({
      name: z.string(),
      description: z.string(),
    })
    const { name, description } = updateUserBodySchema.parse(request.body)

    try {
      await prisma.user.update({
        where: {
          id,
        },
        data: {
          name,
          description,
          updatedAt: new Date(),
        },
      })

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

  app.delete('/:id', async (request, response) => {
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

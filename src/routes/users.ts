import { hash } from 'bcryptjs'
import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
// import { getDefaultMessageError } from '../error-handler'
import { prisma } from '../lib/prisma'
import { checkPasswordIsValid } from '../utils/general-helper'

export async function userRoutes(app: FastifyInstance) {
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
      const createUsersBodySchema = z.object({
        nickname: z.string().min(3),
        email: z.string().email(),
        password: z.string().min(8),
        role_id: z.string().uuid(),
      })

      const { nickname, email, password, role_id } =
        createUsersBodySchema.parse(request.body)

      const isPasswordInvalid = !checkPasswordIsValid(password)
      if (isPasswordInvalid) {
        return response.status(422).send({
          message:
            'Sua senha precisa ter ao menos 8 caracteres, 1 letra e 1 número.',
        })
      }

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
    })

  app
    .withTypeProvider<ZodTypeProvider>()
    .put('/:id', async (request, response) => {
      const getUsersParamsSchema = z.object({
        id: z.string().uuid(),
      })
      const { id } = getUsersParamsSchema.parse(request.params)

      const updateUsersBodySchema = z.object({
        nickname: z.string().min(3),
        email: z.string().email(),
        password: z.string().nullish(),
        role_id: z.string().uuid(),
      })

      const { nickname, email, password, role_id } =
        updateUsersBodySchema.parse(request.body)

      type UpdateRequestType = {
        nickname: string
        email: string
        role_id: string
        password_hash?: string
      }

      const requestUserData: UpdateRequestType = {
        nickname,
        email,
        role_id,
      }

      if (password && password !== '') {
        const isPasswordInvalid = !checkPasswordIsValid(password)
        if (isPasswordInvalid) {
          return response.status(422).send({
            message:
              'Sua senha precisa ter ao menos 8 caracteres, 1 letra e 1 número.',
          })
        }

        requestUserData.password_hash = await hash(password, 8)
      }

      await prisma.user.update({
        where: { id },
        data: requestUserData,
      })

      return response
        .status(201)
        .send({ message: 'Usuário atualizado com sucesso!' })
    })

  app
    .withTypeProvider<ZodTypeProvider>()
    .delete('/:id', async (request, response) => {
      const getUsersParamsSchema = z.object({
        id: z.string().uuid(),
      })
      const { id } = getUsersParamsSchema.parse(request.params)

      await prisma.user.delete({ where: { id } })

      return response
        .status(200)
        .send({ message: 'Usuário deletado com sucesso!' })
    })
}

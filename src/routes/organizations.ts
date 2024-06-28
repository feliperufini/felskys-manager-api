import { z } from 'zod'
import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { table } from '../database'
import { removeSpecialCharacters } from '../utils/generalHelper'

export async function organizationsRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const organizations = await table('organizations').select()

    return { organizations }
  })

  app.get('/:id', async (request) => {
    const getOrganizationsParamsSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = getOrganizationsParamsSchema.parse(request.params)

    const organization = await table('organizations').where('id', id).first()

    return { organization }
  })

  app.post('/', async (request, response) => {
    const createOrganizationBodySchema = z.object({
      legalName: z.string(),
      businessName: z.string(),
      document: z.string(),
    })
    const { legalName, businessName, document } =
      createOrganizationBodySchema.parse(request.body)

    await table('organizations').insert({
      id: randomUUID(),
      legal_name: legalName,
      business_name: businessName,
      document: removeSpecialCharacters(document),
    })

    return response
      .status(201)
      .send({ message: 'Organização cadastrada com sucesso!' })
  })

  app.delete('/:id', async (request, response) => {
    const getOrganizationsParamsSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = getOrganizationsParamsSchema.parse(request.params)

    await table('organizations').where('id', id).del()

    return response
      .status(200)
      .send({ message: 'Organização deletada com sucesso!' })
  })
}

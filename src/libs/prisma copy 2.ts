import { randomUUID } from 'node:crypto'
import { PrismaClient } from '@prisma/client'
import { getModelNameTranslatedFromUrlrogetModelNameTranslation } from '../utils/translate-helper'

const notLoggingModels = ['Log']

export const prisma = new PrismaClient().$extends({
  query: {
    $allModels: {
      async update({ model, operation, args, query }) {
        if (notLoggingModels.includes(model)) {
          return
        }
        console.log('##### model #####\n', model)
        console.log('##### operation #####\n', operation)
        console.log('##### args #####\n', args)

        const oldContext = prisma.[model]
        const queryReturn = await query(args)
        console.log('##### queryReturn #####\n', queryReturn)

        const translatedModelName = getModelNameTranslation(model)

        await prisma.log.create({
          data: {
            id: randomUUID(),
            method: 'UPDATE',
            model,
            register_id: args.where.id,
            // api_route: '/login',
            message: `${translatedModelName} editado(a) com sucesso`,
            old_context: JSON.stringify({ ...loginResponseData, token: undefined }),
            new_context: JSON.stringify(queryReturn),
            level: 'INFO',
            status_code: 200,
            created_by: user.email,
          },
        })
      },
    },
  },
})

export default prisma

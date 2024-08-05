import { z } from 'zod'
import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { ZodTypeProvider } from 'fastify-type-provider-zod'

export async function invoiceRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get('/', async () => {
    const invoices = await prisma.invoice.findMany()

    const newInvoices = invoices.map((invoice) => ({
      ...invoice,
      amount: Number(invoice.amount),
    }))

    return { invoices: newInvoices }
  })

  app.withTypeProvider<ZodTypeProvider>().get('/:id', async (request) => {
    const getInvoicesParamsSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = getInvoicesParamsSchema.parse(request.params)

    const invoice = await prisma.invoice.findUniqueOrThrow({
      where: {
        id,
      },
      include: {
        payments: true,
      },
    })

    const newInvoices = {
      ...invoice,
      amount: Number(invoice.amount),
      total_paid: invoice.payments.reduce(
        (total, payment) => total + Number(payment.amount),
        0,
      ),
      payments: invoice.payments.map((payment) => {
        return {
          ...payment,
          amount: Number(payment.amount),
        }
      }),
    }

    return { invoice: newInvoices }
  })

  app
    .withTypeProvider<ZodTypeProvider>()
    .post('/', async (request, response) => {
      const createInvoicesBodySchema = z.object({
        amount: z.number(),
        due_date: z.coerce.string().datetime(),
        status: z.enum(['PENDING', 'PAID', 'PARTIAL']).nullish(),
        organization_id: z.string().uuid(),
      })

      const { amount, due_date, status, organization_id } =
        createInvoicesBodySchema.parse(request.body)

      try {
        await prisma.invoice.create({
          data: {
            id: randomUUID(),
            amount,
            due_date,
            status: status ?? 'PENDING',
            organization_id,
          },
        })

        return response
          .status(201)
          .send({ message: 'Fatura cadastrada com sucesso!' })
      } catch (error: unknown) {
        if (error instanceof Error) {
          return response.status(400).send({
            message: 'Erro ao cadastrar a fatura.',
            error: error?.message,
          })
        } else {
          return response.status(400).send({
            message: 'Erro ao cadastrar a fatura.',
            error,
          })
        }
      }
    })

  app
    .withTypeProvider<ZodTypeProvider>()
    .put('/:id', async (request, response) => {
      const getInvoicesParamsSchema = z.object({
        id: z.string().uuid(),
      })
      const { id } = getInvoicesParamsSchema.parse(request.params)

      const updateInvoicesBodySchema = z.object({
        amount: z.number().nonnegative(),
        due_date: z.coerce.string().datetime(),
        status: z.enum(['PENDING', 'PAID', 'PARTIAL']),
      })
      const { amount, due_date, status } = updateInvoicesBodySchema.parse(
        request.body,
      )

      try {
        await prisma.invoice.update({
          where: {
            id,
          },
          data: {
            amount,
            due_date,
            status,
          },
        })

        return response
          .status(201)
          .send({ message: 'Fatura atualizada com sucesso!' })
      } catch (error: unknown) {
        if (error instanceof Error) {
          return response.status(400).send({
            message: 'Erro ao atualizar a fatura.',
            error: error?.message,
          })
        } else {
          return response.status(400).send({
            message: 'Erro ao atualizar a fatura.',
            error,
          })
        }
      }
    })

  app
    .withTypeProvider<ZodTypeProvider>()
    .delete('/:id', async (request, response) => {
      const getInvoicesParamsSchema = z.object({
        id: z.string().uuid(),
      })
      const { id } = getInvoicesParamsSchema.parse(request.params)

      try {
        await prisma.invoice.delete({ where: { id } })

        return response
          .status(200)
          .send({ message: 'Fatura deletada com sucesso!' })
      } catch (error: unknown) {
        if (error instanceof Error) {
          return response.status(400).send({
            message: 'Erro ao deletar a fatura.',
            error: error?.message,
          })
        } else {
          return response.status(400).send({
            message: 'Erro ao deletar a fatura.',
            error,
          })
        }
      }
    })
}

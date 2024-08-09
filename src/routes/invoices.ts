import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../libs/prisma'
import { verifyJwt } from '../middlewares/jwt-auth'
import { ClientError } from '../error-handler'

export async function invoiceRoutes(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/', { onRequest: [verifyJwt] }, async () => {
      const invoices = await prisma.invoice.findMany()

      const newInvoices = invoices.map((invoice) => ({
        ...invoice,
        amount: Number(invoice.amount),
      }))

      return { invoices: newInvoices }
    })

  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/:id', { onRequest: [verifyJwt] }, async (request) => {
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
    .post('/', { onRequest: [verifyJwt] }, async (request, response) => {
      const createInvoicesBodySchema = z.object({
        amount: z.number(),
        due_date: z.coerce.date(),
        organization_id: z.string().uuid(),
      })

      const { amount, due_date, organization_id } =
        createInvoicesBodySchema.parse(request.body)

      const invoice = await prisma.invoice.create({
        data: {
          id: randomUUID(),
          amount,
          due_date,
          status: 'PENDING',
          organization_id,
        },
      })

      return response.status(201).send({
        message: 'Fatura cadastrada com sucesso!',
        data: {
          invoice_id: invoice.id,
        },
      })
    })

  app
    .withTypeProvider<ZodTypeProvider>()
    .put('/:id', { onRequest: [verifyJwt] }, async (request, response) => {
      const getInvoicesParamsSchema = z.object({
        id: z.string().uuid(),
      })
      const { id } = getInvoicesParamsSchema.parse(request.params)

      const updateInvoicesBodySchema = z.object({
        amount: z.number().positive(),
        due_date: z.coerce.date(),
      })
      const { amount, due_date } = updateInvoicesBodySchema.parse(request.body)

      await prisma.$transaction(async (prisma) => {
        const oldInvoice = await prisma.invoice.findUniqueOrThrow({
          where: { id },
          include: {
            payments: true,
          },
        })

        const invoiceTotalPaid = oldInvoice.payments.reduce(
          (total, payment) => total + Number(payment.amount),
          0,
        )

        let newInvoiceStatus = oldInvoice.status

        if (amount === Number(oldInvoice.amount)) {
          newInvoiceStatus = oldInvoice.status
        } else if (amount > invoiceTotalPaid) {
          newInvoiceStatus = invoiceTotalPaid === 0 ? 'PENDING' : 'PARTIAL'
        } else {
          throw new ClientError(
            'A soma dos pagamentos é maior que o valor da fatura.',
          )
        }

        await prisma.invoice.update({
          where: {
            id,
          },
          data: {
            amount,
            due_date,
            status: newInvoiceStatus,
          },
        })
      })

      return response
        .status(201)
        .send({ message: 'Fatura atualizada com sucesso!' })
    })

  app
    .withTypeProvider<ZodTypeProvider>()
    .delete('/:id', { onRequest: [verifyJwt] }, async (request, response) => {
      const getInvoicesParamsSchema = z.object({
        id: z.string().uuid(),
      })
      const { id } = getInvoicesParamsSchema.parse(request.params)

      await prisma.invoice.delete({ where: { id } })

      return response
        .status(200)
        .send({ message: 'Fatura deletada com sucesso!' })
    })
}

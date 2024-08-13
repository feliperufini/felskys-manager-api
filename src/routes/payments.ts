import { z } from 'zod'
import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { prisma } from '../libs/prisma'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { ClientError } from '../error-handler'
import { userEmailTokenRequest, verifyJwt } from '../middlewares/jwt-auth'

export async function paymentRoutes(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/', { onRequest: [verifyJwt] }, async () => {
      const payments = await prisma.payment.findMany()

      const newPayments = payments.map((payment) => ({
        ...payment,
        amount: Number(payment.amount),
      }))

      return { payments: newPayments }
    })

  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/:id', { onRequest: [verifyJwt] }, async (request) => {
      const getPaymentsParamsSchema = z.object({
        id: z.string().uuid(),
      })
      const { id } = getPaymentsParamsSchema.parse(request.params)

      const payment = await prisma.payment.findUniqueOrThrow({
        where: {
          id,
        },
      })

      const newPayments = {
        ...payment,
        amount: Number(payment.amount),
      }

      return { payment: newPayments }
    })

  app
    .withTypeProvider<ZodTypeProvider>()
    .post('/', { onRequest: [verifyJwt] }, async (request, response) => {
      const createPaymentsBodySchema = z.object({
        amount: z.number().positive(),
        payment_date: z.coerce.date().max(new Date()),
        payment_method: z.enum([
          'CASH',
          'PIX',
          'BANK_SLIP',
          'CREDIT',
          'DEBIT',
          'OTHERS',
        ]),
        invoice_id: z.string().uuid(),
      })

      const { amount, payment_date, payment_method, invoice_id } =
        createPaymentsBodySchema.parse(request.body)

      await prisma.$transaction(async (prisma) => {
        const invoice = await prisma.invoice.findUniqueOrThrow({
          where: {
            id: invoice_id,
          },
          include: {
            payments: true,
          },
        })

        if (invoice.status === 'PAID') {
          throw new ClientError('Essa fatura já foi paga.')
        }

        const newTotalPaid =
          invoice.payments.reduce(
            (total, payment) => total + Number(payment.amount),
            0,
          ) + amount

        if (newTotalPaid > Number(invoice.amount)) {
          throw new ClientError(
            'A soma dos pagamentos é maior que o valor da fatura.',
          )
        }

        const newInvoiceStatus =
          newTotalPaid === Number(invoice.amount) ? 'PAID' : 'PARTIAL'

        await prisma.payment.create({
          data: {
            id: randomUUID(),
            amount,
            payment_date,
            payment_method,
            invoice_id,
            updated_by: userEmailTokenRequest(request),
          },
        })

        await prisma.invoice.update({
          where: {
            id: invoice_id,
          },
          data: {
            status: newInvoiceStatus,
          },
        })
      })

      return response
        .status(201)
        .send({ message: 'Pagamento cadastrado com sucesso!' })
    })

  app
    .withTypeProvider<ZodTypeProvider>()
    .put('/:id', { onRequest: [verifyJwt] }, async (request, response) => {
      const getPaymentsParamsSchema = z.object({
        id: z.string().uuid(),
      })
      const { id } = getPaymentsParamsSchema.parse(request.params)

      const updatePaymentsBodySchema = z.object({
        amount: z.number().positive(),
        payment_date: z.coerce.date().max(new Date()),
        payment_method: z.enum([
          'CASH',
          'PIX',
          'BANK_SLIP',
          'CREDIT',
          'DEBIT',
          'OTHERS',
        ]),
      })
      const { amount, payment_date, payment_method } =
        updatePaymentsBodySchema.parse(request.body)

      await prisma.$transaction(async (prisma) => {
        const payment = await prisma.payment.findUniqueOrThrow({
          where: {
            id,
          },
          select: {
            invoice_id: true,
          },
        })

        const invoice = await prisma.invoice.findUniqueOrThrow({
          where: {
            id: payment.invoice_id,
          },
          include: {
            payments: {
              where: {
                NOT: {
                  id,
                },
              },
            },
          },
        })

        const newTotalPaid =
          invoice.payments.reduce(
            (total, payment) => total + Number(payment.amount),
            0,
          ) + amount

        if (newTotalPaid > Number(invoice.amount)) {
          throw new ClientError(
            'A soma dos pagamentos é maior que o valor da fatura.',
          )
        }

        const newInvoiceStatus =
          newTotalPaid === Number(invoice.amount) ? 'PAID' : 'PARTIAL'

        await prisma.payment.update({
          where: {
            id,
          },
          data: {
            amount,
            payment_date,
            payment_method,
            updated_by: userEmailTokenRequest(request),
          },
        })

        await prisma.invoice.update({
          where: {
            id: payment.invoice_id,
          },
          data: {
            status: newInvoiceStatus,
          },
        })
      })

      return response
        .status(201)
        .send({ message: 'Pagamento atualizado com sucesso!' })
    })

  app
    .withTypeProvider<ZodTypeProvider>()
    .delete('/:id', { onRequest: [verifyJwt] }, async (request, response) => {
      const getPaymentsParamsSchema = z.object({
        id: z.string().uuid(),
      })
      const { id } = getPaymentsParamsSchema.parse(request.params)

      await prisma.payment.delete({ where: { id } })

      return response
        .status(200)
        .send({ message: 'Pagamento deletado com sucesso!' })
    })
}

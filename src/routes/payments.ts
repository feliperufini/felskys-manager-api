import { z } from 'zod'
import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { ZodTypeProvider } from 'fastify-type-provider-zod'

export async function paymentRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get('/', async () => {
    const payments = await prisma.payment.findMany()

    const newPayments = payments.map((payment) => ({
      ...payment,
      amount: Number(payment.amount),
    }))

    return { payments: newPayments }
  })

  app.withTypeProvider<ZodTypeProvider>().get('/:id', async (request) => {
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
    .post('/', async (request, response) => {
      const createPaymentBodySchema = z.object({
        amount: z.number(),
        payment_date: z.coerce.string().datetime(),
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
        createPaymentBodySchema.parse(request.body)

      try {
        await prisma.$transaction(async (prisma) => {
          const invoice = await prisma.invoice.findUniqueOrThrow({
            where: {
              id: invoice_id,
            },
            include: {
              payments: true,
            },
          })

          const totalPaid =
            invoice.payments.reduce(
              (total, payment) => total + Number(payment.amount),
              0,
            ) + amount

          const newInvoiceStatus =
            totalPaid >= Number(invoice.amount) ? 'PAID' : 'PARTIAL'

          await prisma.payment.create({
            data: {
              id: randomUUID(),
              amount,
              payment_date,
              payment_method,
              invoice_id,
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
      } catch (error: unknown) {
        if (error instanceof Error) {
          return response.status(400).send({
            message: 'Erro ao cadastrar o pagamento.',
            error: error?.message,
          })
        } else {
          return response.status(400).send({
            message: 'Erro ao cadastrar o pagamento.',
            error,
          })
        }
      }
    })

  app
    .withTypeProvider<ZodTypeProvider>()
    .put('/:id', async (request, response) => {
      const getPaymentsParamsSchema = z.object({
        id: z.string().uuid(),
      })
      const { id } = getPaymentsParamsSchema.parse(request.params)

      const updatePaymentBodySchema = z.object({
        amount: z.number().nonnegative(),
        payment_date: z.coerce.string().datetime(),
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
        updatePaymentBodySchema.parse(request.body)

      try {
        await prisma.payment.update({
          where: {
            id,
          },
          data: {
            amount,
            payment_date,
            payment_method,
            updated_at: new Date(),
          },
        })

        return response
          .status(201)
          .send({ message: 'Pagamento atualizado com sucesso!' })
      } catch (error: unknown) {
        if (error instanceof Error) {
          return response.status(400).send({
            message: 'Erro ao atualizar o pagamento.',
            error: error?.message,
          })
        } else {
          return response.status(400).send({
            message: 'Erro ao atualizar o pagamento.',
            error,
          })
        }
      }
    })

  app
    .withTypeProvider<ZodTypeProvider>()
    .delete('/:id', async (request, response) => {
      const getPaymentsParamsSchema = z.object({
        id: z.string().uuid(),
      })
      const { id } = getPaymentsParamsSchema.parse(request.params)

      try {
        await prisma.payment.delete({ where: { id } })

        return response
          .status(200)
          .send({ message: 'Pagamento deletado com sucesso!' })
      } catch (error: unknown) {
        if (error instanceof Error) {
          return response.status(400).send({
            message: 'Erro ao deletar o pagamento.',
            error: error?.message,
          })
        } else {
          return response.status(400).send({
            message: 'Erro ao deletar o pagamento.',
            error,
          })
        }
      }
    })
}

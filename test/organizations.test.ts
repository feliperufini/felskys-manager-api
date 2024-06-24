import { afterAll, beforeAll, test, describe } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'

describe('Organizations routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  test('Should be able to create a new organization.', async () => {
    await request(app.server)
      .post('/organizations')
      .send({
        legalName: 'Felipe de Oliveira Andrade',
        businessName: 'Felipe Andrade',
        document: '007.341.462-05',
      })
      .expect(201)
  })

  test('Should be able to list all organizations.', async () => {
    await request(app.server).get('/organizations').expect(200)
  })
})

import knex from 'knex'

export const table = knex({
  client: 'sqlite',
  connection: {
    filename: './tmp/app.db',
  },
})

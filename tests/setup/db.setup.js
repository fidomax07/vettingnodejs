require('dotenv').config();
const db = require('../../src/db');

beforeAll(async () => {
  await db.connectAsync();
});

beforeEach(async () => {
  await Promise.all((await db.collections()).map(async ({ name }) => db.dbInstance().dropCollection(name)));
});

afterAll(async () => {
  await db.dbInstance().dropDatabase();
  await db.disconnectAsync();
});

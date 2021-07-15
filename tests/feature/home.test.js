require('../setup/db.setup');
const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../src/app');
const { factory } = require('../factories/user.factory');
const { userLikes } = require('../setup/user.setup');

describe('Home API tests', () => {
  test('Should get welcoming message', async () => {
    // Arrange & Act
    const res = await request(app).get('/').send().expect(httpStatus.OK);

    // Assert
    expect(res.body).toHaveProperty('message');
    expect(res.body).toEqual({ message: 'Vetting, Node.js Experimental API' });
  });

  test('Should return users in a most liked to least liked', async () => {
    // Arrange
    const [userA, userB, userC, userD, userE] = await factory().count(5).create();
    await userLikes(userA, 2);
    await userLikes(userB, 1);
    await userLikes(userC, 3);
    await userLikes(userD, 4);
    await userLikes(userE, 2);

    // Act
    const res = await request(app).get('/most-liked').send().expect(httpStatus.OK);

    // Assert
    expect(res.body).toHaveProperty('data');
    expect(res.body.data[0]._id.toString()).toEqual(userD._id.toString());
    expect(res.body.data[1]._id.toString()).toEqual(userC._id.toString());
    expect(res.body.data[2]._id.toString()).toEqual(userA._id.toString());
    expect(res.body.data[3]._id.toString()).toEqual(userE._id.toString());
    expect(res.body.data[4]._id.toString()).toEqual(userB._id.toString());
  });
});

require('../setup/db.setup');
const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../src/app');
const { factory } = require('../factories/user.factory');
const { userLikes, simulateLikeUser } = require('../setup/user.setup');

describe('User API tests', () => {
  describe('User show tests', () => {
    test(`Should return user's username and number of likes`, async () => {
      // Arrange
      const [user] = await factory().count(5).create();
      await userLikes(user, 3);

      // Act
      const res = await request(app).get(`/user/${user._id}`).send().expect(httpStatus.OK);

      // Assert
      expect(res.body).toEqual({
        data: {
          username: user.username,
          likesCount: 3
        }
      });
    });

    test(`Should return a 404 response if user is not found with the given id`, async () => {
      // Arrange
      const [user] = await factory().count(5).create();
      await userLikes(user, 3);

      // Act
      const res = await request(app).get(`/user/wrong_id`).send().expect(httpStatus.NOT_FOUND);

      // Assert
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('User like tests', () => {
    test('Should be able to like another user of the system', async () => {
      // Arrange
      const [userA, userB] = await factory().count(2).create();

      // Act
      const res = await request(app)
        .post(`/user/${userB._id}/like`)
        .set('Authorization', `Bearer ${userA.tokens[0].token}`)
        .send()
        .expect(httpStatus.OK);

      // Assert
      await userA.populate(['liked', 'likedCount']).execPopulate();
      await userB.populate(['likes', 'likesCount']).execPopulate();

      expect(userA.likedCount).toBe(1);
      expect(userA.liked[0].user_liked_id).toEqual(userB._id);
      expect(userB.likesCount).toBe(1);
      expect(userB.likes[0].user_id).toEqual(userA._id);

      expect(res.body.data.liked[0]).toEqual({
        _user_id: userA._id.toString(),
        _user_liked_id: userB._id.toString(),
        name: userB.name,
        username: userB.username
      });
    });

    test('Should not be able to like same user more than once', async () => {
      // Arrange
      const [userA, userB] = await factory().count(2).create();
      await simulateLikeUser(userA, userB);

      // Act
      const res = await request(app)
        .post(`/user/${userB._id}/like`)
        .set('Authorization', `Bearer ${userA.tokens[0].token}`)
        .send()
        .expect(httpStatus.FORBIDDEN);

      // Assert
      await userA.populate(['liked', 'likedCount']).execPopulate();
      await userB.populate(['likes', 'likesCount']).execPopulate();

      expect(userA.likedCount).toBe(1);
      expect(userA.liked[0].user_liked_id).toEqual(userB._id);
      expect(userB.likesCount).toBe(1);
      expect(userB.likes[0].user_id).toEqual(userA._id);

      expect(res.body).toHaveProperty('error');
    });

    test('Should not be able to like itself', async () => {
      // Arrange
      const user = await factory().create();

      // Act
      const res = await request(app)
        .post(`/user/${user._id}/like`)
        .set('Authorization', `Bearer ${user.tokens[0].token}`)
        .send()
        .expect(httpStatus.FORBIDDEN);

      // Assert
      await user.populate(['likesCount', 'likedCount']).execPopulate();

      expect(user.likesCount).toBe(0);
      expect(user.likedCount).toBe(0);

      expect(res.body).toHaveProperty('error');
    });
  });

  describe('User unlike tests', () => {
    test('Should be able to unlike another user of the system', async () => {
      // Arrange
      const [userA, userB] = await factory().count(2).create();
      await simulateLikeUser(userA, userB);

      // Act
      const res = await request(app)
        .post(`/user/${userB._id}/unlike`)
        .set('Authorization', `Bearer ${userA.tokens[0].token}`)
        .send()
        .expect(httpStatus.OK);

      // Assert
      await userA.populate(['liked', 'likedCount']).execPopulate();
      await userB.populate(['likes', 'likesCount']).execPopulate();

      expect(userA.likedCount).toBe(0);
      expect(userB.likesCount).toBe(0);

      expect(res.body.data.liked).toEqual([]);
    });

    test('Should not be able to unlike someone that did not like', async () => {
      // Arrange
      const [userA, userB] = await factory().count(2).create();

      // Act
      const res = await request(app)
        .post(`/user/${userB._id}/unlike`)
        .set('Authorization', `Bearer ${userA.tokens[0].token}`)
        .send()
        .expect(httpStatus.FORBIDDEN);

      // Assert
      await userA.populate(['liked', 'likedCount']).execPopulate();
      await userB.populate(['likes', 'likesCount']).execPopulate();

      expect(userA.likedCount).toBe(0);
      expect(userB.likesCount).toBe(0);

      expect(res.body).toHaveProperty('error');
    });

    test('Should not be able to unlike itself', async () => {
      // Arrange
      const user = await factory().create();

      // Act
      const res = await request(app)
        .post(`/user/${user._id}/unlike`)
        .set('Authorization', `Bearer ${user.tokens[0].token}`)
        .send()
        .expect(httpStatus.FORBIDDEN);

      // Assert
      await user.populate(['likesCount', 'likedCount']).execPopulate();

      expect(user.likesCount).toBe(0);
      expect(user.likedCount).toBe(0);

      expect(res.body).toHaveProperty('error');
    });
  });
});

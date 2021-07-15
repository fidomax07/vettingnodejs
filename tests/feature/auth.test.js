require('../setup/db.setup');
const moment = require('moment');
const bcrypt = require('bcryptjs');
const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../src/app');
const User = require('../../src/models/user.model');
const { factory } = require('../factories/user.factory');
const { dateTimeFormat } = require('../../src/config/date');

const defaultPassword = 'secret123#';

describe('Auth API tests', () => {
  describe('Signup tests', () => {
    test('Should signup a new user', async () => {
      // Arrange
      const userAttributes = {
        name: 'Fidan Ademi',
        username: 'fidomax07',
        password: defaultPassword
      };

      // Act
      const res = await request(app).post('/signup').send(userAttributes).expect(httpStatus.CREATED);

      // Assert
      // Assert that the changes are persisted into the database
      const user = await User.findById(res.body.data.user._id);
      expect(user).not.toBeNull();
      expect(user.name).toBe(userAttributes.name);
      expect(user.username).toBe(userAttributes.username);
      expect(user.password).not.toBe(userAttributes.password);

      // Assertions about the response
      expect(res.body).toMatchObject({
        data: {
          user: {},
          token: expect.any(String)
        }
      });
      expect(res.body.data.user).toEqual({
        _id: user._id.toString(),
        name: user.name,
        username: user.username,
        createdAt: moment(user.createdAt).format(dateTimeFormat),
        updatedAt: moment(user.updatedAt).format(dateTimeFormat)
      });
      expect(res.body.data.token).toBe(user.tokens[0].token);
    });

    test('Should not signup a user without username', async () => {
      // Arrange
      const userAttributes = {
        name: 'Fidan Ademi',
        password: defaultPassword
      };

      // Act
      const res = await request(app).post('/signup').send(userAttributes).expect(httpStatus.UNPROCESSABLE_ENTITY);

      // Assert
      // Assert that no changes are made into the database
      const user = await User.findOne({ name: userAttributes.name });
      expect(user).toBeNull();

      // Assertions about the response
      expect(res.body).toHaveProperty('errors');
    });

    test('Should signup a new user without a name', async () => {
      // Arrange
      const userAttributes = {
        username: 'fidomax07',
        password: defaultPassword
      };

      // Act
      const res = await request(app).post('/signup').send(userAttributes).expect(httpStatus.CREATED);

      // Assert
      const user = await User.findById(res.body.data.user._id);
      expect(user).not.toBeNull();
      expect(res.body).toMatchObject({
        data: {
          user: {
            _id: user._id.toString(),
            username: userAttributes.username
          },
          token: user.tokens[0].token
        }
      });
      expect(user.password).not.toBe(userAttributes.password);
    });
  });

  describe('Login tests', () => {
    test('Should login an existing user', async () => {
      // Arrange
      let user = await factory().create({ password: defaultPassword });

      // Act
      const res = await request(app)
        .post('/login')
        .send({ username: user.username, password: defaultPassword })
        .expect(httpStatus.OK);

      // Assert
      user = await User.findById(user._id);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data.user.username).toBe(user.username);
      expect(res.body.data.token).toBe(user.tokens[1].token);
    });

    test('Should not login an existing user with wrong username', async () => {
      // Arrange
      await factory().create({ password: defaultPassword });

      // Act
      const res = await request(app)
        .post('/login')
        .send({ username: 'wrong123', password: defaultPassword })
        .expect(httpStatus.UNAUTHORIZED);

      // Assert
      expect(res.body).toHaveProperty('error');
    });

    test('Should not login an existing user with wrong password', async () => {
      // Arrange
      const user = await factory().create({ password: defaultPassword });

      // Act
      const res = await request(app)
        .post('/login')
        .send({ username: user.username, password: 'wrongSecret123' })
        .expect(httpStatus.UNAUTHORIZED);

      // Assert
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('Logout tests', () => {
    test('Should allow an authenticated user to logout from the system', async () => {
      // Arrange
      let user = await factory().create();

      // Act
      const res = await request(app)
        .post('/logout')
        .set('Authorization', `Bearer ${user.tokens[0].token}`)
        .send()
        .expect(httpStatus.OK);

      // Assert
      user = await User.findById(user._id);
      expect(user.tokens[0]).toBeUndefined();
      expect(res.body).toHaveProperty('data.message');
    });
  });

  describe('Profile (user information) tests', () => {
    test('Should get user information for the currently logged in user', async () => {
      // Arrange
      const user = await factory().create();

      // Act
      const res = await request(app)
        .get('/me')
        .set('Authorization', `Bearer ${user.tokens[0].token}`)
        .send()
        .expect(httpStatus.OK);

      // Assert
      expect(res.body).toHaveProperty('data');
      expect(res.body).toEqual({
        data: {
          _id: user._id.toString(),
          name: user.name,
          username: user.username,
          createdAt: moment(user.createdAt).format(dateTimeFormat),
          updatedAt: moment(user.updatedAt).format(dateTimeFormat),
          likes: [],
          liked: []
        }
      });
    });

    test('Should not return any information if the user is not authenticated', async () => {
      // Arrange
      await factory().create({ tokens: null });

      // Act
      const res = await request(app)
        .get('/me')
        .set('Authorization', `Bearer wrong_auth_token`)
        .send()
        .expect(httpStatus.UNAUTHORIZED);

      // Assert
      expect(res.body).toHaveProperty('error');
    });
  });

  describe(`Update current user's password tests`, () => {
    test(`Should update user's password`, async () => {
      // Arrange
      let user = await factory().create({ password: defaultPassword });
      const passwordData = {
        password_old: defaultPassword,
        password: 'theNewSecretPassword',
        password_confirmation: 'theNewSecretPassword'
      };

      // Act
      await request(app)
        .put('/me/update-password')
        .set('Authorization', `Bearer ${user.tokens[0].token}`)
        .send(passwordData)
        .expect(httpStatus.OK);

      // Assert
      user = await User.findById(user._id);
      expect(user.password).not.toBe(passwordData.password);
      expect(bcrypt.compareSync(passwordData.password, user.password)).toBe(true);
      expect(bcrypt.compareSync(passwordData.password_old, user.password)).toBe(false);
      await request(app)
        .post('/login')
        .send({ username: user.username, password: passwordData.password })
        .expect(httpStatus.OK);
    });

    test(`Should not update user's password, if old-password field is missing`, async () => {
      // Arrange
      let user = await factory().create({ password: defaultPassword });
      const passwordData = {
        password: 'theNewSecretPassword',
        password_confirmation: 'theNewSecretPassword'
      };

      // Act
      const res = await request(app)
        .put('/me/update-password')
        .set('Authorization', `Bearer ${user.tokens[0].token}`)
        .send(passwordData)
        .expect(httpStatus.UNPROCESSABLE_ENTITY);

      // Assert
      user = await User.findById(user._id);
      expect(bcrypt.compareSync(passwordData.password, user.password)).toBe(false);
      expect(bcrypt.compareSync(defaultPassword, user.password)).toBe(true);
      expect(res.body).toMatchObject({
        errors: {
          password_old: [expect.any(String)]
        }
      });
    });

    test(`Should not update user's password, if old-password is wrong`, async () => {
      // Arrange
      let user = await factory().create({ password: defaultPassword });
      const passwordData = {
        password_old: 'wrong_old_password',
        password: 'theNewSecretPassword',
        password_confirmation: 'theNewSecretPassword'
      };

      // Act
      const res = await request(app)
        .put('/me/update-password')
        .set('Authorization', `Bearer ${user.tokens[0].token}`)
        .send(passwordData)
        .expect(httpStatus.UNAUTHORIZED);

      // Assert
      user = await User.findById(user._id);
      expect(bcrypt.compareSync(passwordData.password, user.password)).toBe(false);
      expect(bcrypt.compareSync(defaultPassword, user.password)).toBe(true);
      expect(res.body).toHaveProperty('error');
    });

    test(`Should not update user's password, if password field is missing`, async () => {
      // Arrange
      let user = await factory().create({ password: defaultPassword });
      const passwordData = {
        password_old: defaultPassword,
        password_confirmation: 'theNewSecretPassword'
      };

      // Act
      const res = await request(app)
        .put('/me/update-password')
        .set('Authorization', `Bearer ${user.tokens[0].token}`)
        .send(passwordData)
        .expect(httpStatus.UNPROCESSABLE_ENTITY);

      // Assert
      user = await User.findById(user._id);
      expect(bcrypt.compareSync(defaultPassword, user.password)).toBe(true);
      expect(res.body).toMatchObject({
        errors: {
          password: [expect.any(String)]
        }
      });
    });

    test(`Should not update user's password, if password-confirmation field is missing`, async () => {
      // Arrange
      let user = await factory().create({ password: defaultPassword });
      const passwordData = {
        password_old: defaultPassword,
        password: 'theNewSecretPassword'
      };

      // Act
      const res = await request(app)
        .put('/me/update-password')
        .set('Authorization', `Bearer ${user.tokens[0].token}`)
        .send(passwordData)
        .expect(httpStatus.UNPROCESSABLE_ENTITY);

      // Assert
      user = await User.findById(user._id);
      expect(bcrypt.compareSync(passwordData.password, user.password)).toBe(false);
      expect(bcrypt.compareSync(defaultPassword, user.password)).toBe(true);
      expect(res.body).toMatchObject({
        errors: {
          password: [expect.any(String)]
        }
      });
    });
  });
});

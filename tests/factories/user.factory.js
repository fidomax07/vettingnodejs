const faker = require('faker');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const jwtConfig = require('../../src/config/jwt');
const User = require('../../src/models/user.model');
const { range } = require('../../src/utils/helpers');

class UserFactory {
  constructor() {
    this._count = null;
  }

  /**
   * @return {UserFactory}
   */
  static build() {
    return new UserFactory();
  }

  /**
   * @param {Number} aValue
   * @return {UserFactory}
   */
  count(aValue) {
    this._count = aValue;
    return this;
  }

  /**
   * @param {Object} overrides
   * @return {User|User[]}
   */
  make(overrides) {
    if (!this._count) {
      return new User(UserFactory.compose(overrides));
    }

    return range(1, this._count).map(() => new User(UserFactory.compose(overrides)));
  }

  /**
   * @async
   * @param {Object} overrides
   * @return {User|User[]}
   */
  async create(overrides) {
    if (!this._count) {
      const user = await this.make(overrides).save();
      return user;
    }

    const users = await Promise.all(this.make(overrides).map(async (user) => user.save()));
    return users;
  }

  /**
   * @param {Object} overrides
   * @return {Object|Object[]}
   */
  raw(overrides) {
    if (!this._count) {
      return UserFactory.compose(overrides);
    }

    return range(1, this._count).map(() => UserFactory.compose(overrides));
  }

  /**
   * @return {module:mongoose.Types._ObjectId}
   */
  static generateId() {
    return new mongoose.Types.ObjectId();
  }

  /**
   * @param {Object} attributes
   * @param {Object} overrides
   * @return {Object|Object[]}
   */
  static handleOverrides(attributes, overrides) {
    if (!overrides) {
      return attributes;
    }

    const attr = attributes;
    Object.keys(overrides).forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(attr, key)) {
        attr[key] = overrides[key];
      }
    });

    return attr;
  }

  /**
   * @param {Object} overrides
   * @return {Object}
   */
  static compose(overrides) {
    const userId = overrides?._id || UserFactory.generateId();
    const attributes = {
      _id: userId,
      name: faker.name.findName(),
      username: faker.internet.userName(),
      password: faker.internet.password(7),
      tokens: [
        {
          token: jwt.sign({ _id: userId }, jwtConfig.secret)
        }
      ]
    };
    return UserFactory.handleOverrides(attributes, overrides);
  }
}

/**
 * @return {UserFactory}
 */
const factory = () => new UserFactory();

module.exports = {
  UserFactory,
  factory
};

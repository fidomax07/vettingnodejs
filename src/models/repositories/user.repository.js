const bcrypt = require('bcryptjs');
const User = require('../user.model');
const NotFoundError = require('../../errors/NotFoundError');
const UnauthorizedError = require('../../errors/UnauthorizedError');

/**
 * @async
 * @param {Object} attributes
 * @return {Promise<User>}
 */
const store = async (attributes) => {
  const user = await new User(attributes).save();
  return user;
};

/**
 * @async
 * @param {Number} id
 * @return {Promise<User>}
 * @throws NotFoundError
 */
const findOrFail = async (id) => {
  try {
    const user = await User.findById(id);
    if (!user) {
      throw new NotFoundError('User not found.');
    }
    return user;
  } catch (err) {
    throw err instanceof NotFoundError ? err : new NotFoundError('Invalid user id.');
  }
};

/**
 * @async
 * @param {String} username
 * @param {String} password
 * @return {Promise<User>}
 * @throws UnauthorizedError
 */
const identify = async (username, password) => {
  const user = await User.findOne({ username });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new UnauthorizedError();
  }
  return user;
};

/**
 * @async
 * @return {Promise<Array<User>>}
 */
const getWithLikes = async () => {
  const users = await User.find({}).populate('likesCount').exec();
  return users;
};

module.exports = {
  store,
  findOrFail,
  identify,
  getWithLikes
};

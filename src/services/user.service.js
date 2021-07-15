const userRepository = require('../models/repositories/user.repository');

/**
 * @async
 * @param {Object} attributes
 * @returns {Promise<{user: *, token: *}>}
 */
const register = async (attributes) => {
  const user = await userRepository.store(attributes);
  const token = await user.generateAuthToken();
  return { user, token };
};

/**
 * @async
 * @param {String} username
 * @param {String} password
 * @return {Promise<{user: *, token: *}>}
 */
const login = async (username, password) => {
  const user = await userRepository.identify(username, password);
  const token = await user.generateAuthToken();
  return { user, token };
};

/**
 * @async
 * @param {User} user
 * @param {String} reqToken
 * @param {Boolean} allDevices
 * @return {Promise<void>}
 */
const logout = async (user, reqToken, allDevices) => {
  if (!allDevices) {
    await user.invalidateToken(reqToken);
  } else {
    await user.invalidateTokens();
  }
};

/**
 * @async
 * @param {User} user
 * @return {Promise<void>}
 */
const loadDependencies = async (user) => {
  await user.loadLikes();
  await user.loadLiked();
};

/**
 * @async
 * @param {User} user
 * @param {Object} reqBody
 * @return {Promise<void>}
 * @throws RequestValidationError
 */
const handlePasswordUpdate = async (user, reqBody) => {
  const password = await user.validateUpdatePassword(reqBody);
  await user.updatePassword(password);
};

/**
 * @async
 * @return {Promise<Array<User>>}
 */
const getOrderedByLikes = async () => {
  const users = await userRepository.getWithLikes();
  users.sort((ml, ll) => ll.likesCount - ml.likesCount);
  return users;
};

/**
 * @async
 * @param {Number} id
 * @return {Promise<User>}
 * @throws NotFoundError
 */
const findWithLikesCount = async (id) => {
  const user = await userRepository.findOrFail(id);
  await user.loadLikesCount();
  return user;
};

module.exports = {
  register,
  login,
  logout,
  loadDependencies,
  handlePasswordUpdate,
  getOrderedByLikes,
  findWithLikesCount
};

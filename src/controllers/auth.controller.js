const httpStatus = require('http-status');
const asyncHandler = require('../utils/async-handler');
const userService = require('../services/user.service');

const signup = asyncHandler(async ({ body }, res) => {
  const { user, token } = await userService.register(body);
  res.status(httpStatus.CREATED).send({ data: { user, token } });
});

const login = asyncHandler(async ({ body: { username, password } }, res) => {
  const { user, token } = await userService.login(username, password);
  res.send({ data: { user, token } });
});

const logout = asyncHandler(async ({ user, token }, res) => {
  await userService.logout(user, token);
  res.send({ data: { message: 'Successfully logged out.' } });
});

const profile = asyncHandler(async ({ user }, res) => {
  await userService.loadDependencies(user);
  return res.send({ data: user });
});

const updatePassword = asyncHandler(async ({ user, body }, res) => {
  await userService.handlePasswordUpdate(user, body);
  res.send({ data: user });
});

module.exports = {
  signup,
  login,
  logout,
  profile,
  updatePassword
};

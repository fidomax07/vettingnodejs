const asyncHandler = require('../utils/async-handler');
const userService = require('../services/user.service');

const show = asyncHandler(async ({ params: { id } }, res) => {
  const { username, likesCount } = await userService.findWithLikesCount(id);
  res.send({ data: { username, likesCount } });
});

const like = asyncHandler(async ({ user, params: { id } }, res) => {
  await user.likeUser(id);
  res.send({ data: user });
});

const unlike = asyncHandler(async ({ user, params: { id } }, res) => {
  await user.unlikeUser(id);
  res.send({ data: user });
});

module.exports = {
  show,
  like,
  unlike
};

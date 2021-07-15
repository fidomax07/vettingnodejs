const asyncHandler = require('../utils/async-handler');
const userService = require('../services/user.service');

const home = (req, res) => {
  res.send({ message: 'Vetting, Node.js Experimental API' });
};

const mostLiked = asyncHandler(async (req, res) => {
  const users = await userService.getOrderedByLikes();
  res.send({ data: users });
});

module.exports = {
  home,
  mostLiked
};

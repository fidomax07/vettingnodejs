const User = require('../../src/models/user.model');
const UserLike = require('../../src/models/userLike.model');

/**
 * @async
 * @param {User} user
 * @param {Number} likesCount
 * @return {Promise<void>}
 */
const userLikes = async (user, likesCount) => {
  const usersTotal = await User.find().estimatedDocumentCount();
  if (likesCount > usersTotal - 1) {
    throw new Error('User cannot have more likes than the total number of users without itself.');
  }

  const userToBeLikedId = user._id;
  const usersThatLike = await User.find({ _id: { $ne: userToBeLikedId } }).limit(likesCount);

  await Promise.all(
    usersThatLike.map(async (u) => {
      await new UserLike({ user_id: u._id, user_liked_id: userToBeLikedId }).save();
    })
  );
};

/**
 * @async
 * @param {User} userWhoLikes
 * @param {User} userWhoGetsLiked
 * @return {Promise<void>}
 */
const simulateLikeUser = async (userWhoLikes, userWhoGetsLiked) => {
  await new UserLike({ user_id: userWhoLikes._id, user_liked_id: userWhoGetsLiked._id }).save();
};

module.exports = {
  userLikes,
  simulateLikeUser
};

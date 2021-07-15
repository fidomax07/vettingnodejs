const mongoose = require('mongoose');

const userLikeSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    user_liked_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

userLikeSchema.index({ user_id: 1, user_liked_id: 1 }, { unique: true });

/** @alias User.prototype.toJSON */
userLikeSchema.methods.toJSON = function () {
  const userLike = this;
  const userLikeObject = userLike.toObject();

  delete userLikeObject._id;
  delete userLikeObject.user_id;
  delete userLikeObject.user_liked_id;

  return {
    _user_id: userLike.user_id._id,
    _user_liked_id: userLike.user_liked_id._id,
    name: userLike.user_liked_id.name ?? userLike.user_id.name,
    username: userLike.user_liked_id.username ?? userLike.user_id.username
  };
};

const UserLike = mongoose.model('UserLike', userLikeSchema);

module.exports = UserLike;

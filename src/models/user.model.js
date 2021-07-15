const mongoose = require('mongoose');
const userMethods = require('./methods/user.method');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true
    },
    username: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 7,
      trim: true
    },
    tokens: [
      {
        token: {
          type: String,
          required: true
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

userSchema.pre('save', async function (next) {
  const user = this;
  await user.hashPassword();
  next();
});

userSchema.virtual('likes', {
  ref: 'UserLike',
  localField: '_id',
  foreignField: 'user_liked_id'
});

userSchema.virtual('likesCount', {
  ref: 'UserLike',
  localField: '_id',
  foreignField: 'user_liked_id',
  count: true
});

userSchema.virtual('liked', {
  ref: 'UserLike',
  localField: '_id',
  foreignField: 'user_id'
});

userSchema.virtual('likedCount', {
  ref: 'UserLike',
  localField: '_id',
  foreignField: 'user_id',
  count: true
});

userSchema.methods = { ...userMethods };

/**
 * @class User
 * @typedef User
 */
const User = mongoose.model('User', userSchema);
module.exports = User;

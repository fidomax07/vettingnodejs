const moment = require('moment');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Validator = require('validatorjs');
const jwtConfig = require('../../config/jwt');
const UserLike = require('../userLike.model');
const { dateTimeFormat } = require('../../config/date');
const UnauthorizedError = require('../../errors/UnauthorizedError');
const InvalidOperationError = require('../../errors/InvalidOperationError');
const RequestValidationError = require('../../errors/RequestValidationError');

module.exports = {
  /**
   * @alias User.prototype.hashPassword
   * @async
   * @return {Promise<void>}
   */
  async hashPassword() {
    const user = this;
    if (user.isModified('password')) {
      user.password = await bcrypt.hash(user.password, 8);
    }
  },

  /**
   * @alias User.prototype.generateAuthToken
   * @async
   * @returns {Promise<String>}
   */
  async generateAuthToken() {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, jwtConfig.secret);
    user.tokens = user.tokens.concat({ token });
    await user.save();

    return token;
  },

  /**
   * @alias User.prototype.invalidateToken
   * @async
   * @param {String} token
   * @return {Promise<void>}
   */
  async invalidateToken(token) {
    const user = this;
    user.tokens = user.tokens.filter((tokenDoc) => tokenDoc.token !== token);
    await user.save();
  },

  /**
   * @alias User.prototype.invalidateTokens
   * @async
   * @return {Promise<void>}
   */
  async invalidateTokens() {
    const user = this;
    user.tokens = [];
    await user.save();
  },

  /**
   * @alias User.prototype.toJSON
   * @returns {Object}
   */
  toJSON() {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.__v;
    delete userObject.createdAt;
    delete userObject.updatedAt;

    return {
      ...userObject,
      createdAt: moment(user.createdAt).format(dateTimeFormat),
      updatedAt: moment(user.updatedAt).format(dateTimeFormat),
      likes: user.likes,
      likesCount: user.likesCount,
      liked: user.liked,
      likedCount: user.likedCount
    };
  },

  /**
   * @alias User.prototype.updatePassword
   * @async
   * @param {String} password
   * @return {Promise<void>}
   */
  async updatePassword(password) {
    const user = this;
    user.password = password;
    await user.save();
  },

  /**
   * @alias User.prototype.likeUser
   * @async
   * @param {Number} userId
   * @return {Promise<void>}
   */
  async likeUser(userId) {
    const user = this;
    user.validateOwnVetting(userId);
    await user.validateLike(userId);

    await new UserLike({ user_id: user._id, user_liked_id: userId }).save();
    await user.loadLiked();
  },

  /**
   * @alias User.prototype.unlikeUser
   * @async
   * @param {Number} userId
   * @return {Promise<void>}
   */
  async unlikeUser(userId) {
    const user = this;
    user.validateOwnVetting(userId);
    await user.validateUnlike(userId);

    await UserLike.deleteOne({ user_id: user._id, user_liked_id: userId });
    await user.loadLiked();
  },

  /**
   * @alias User.prototype.loadLikes
   * @async
   * @return {Promise<User>}
   */
  async loadLikes() {
    const user = this;
    await user.populate('likes').execPopulate();
    await Promise.all(
      user.likes.map(async (like) => {
        await like.populate('user_id').execPopulate();
      })
    );
    return user;
  },

  /**
   * @alias User.prototype.loadLikesCount
   * @async
   * @return {Promise<User>}
   */
  async loadLikesCount() {
    const user = this;
    await user.populate('likesCount').execPopulate();
    return user;
  },

  /**
   * @alias User.prototype.loadLiked
   * @async
   * @return {Promise<User>}
   */
  async loadLiked() {
    const user = this;
    await user.populate('liked').execPopulate();
    await Promise.all(
      user.liked.map(async (likee) => {
        await likee.populate('user_liked_id').execPopulate();
      })
    );
    return user;
  },

  /**
   * @alias User.prototype.loadLikedCount
   * @async
   * @return {Promise<User>}
   */
  async loadLikedCount() {
    const user = this;
    await user.populate('likedCount').execPopulate();
    return user;
  },

  /**
   * @alias User.prototype.hasLiked
   * @async
   * @param {Number} userId
   * @return {Promise<boolean>}
   */
  async hasLiked(userId) {
    const user = this;
    const userLike = await UserLike.findOne({ user_id: user._id, user_liked_id: userId });
    return userLike !== null;
  },

  /**
   * @alias User.prototype.validateUpdatePassword
   * @async
   * @param {Object} data
   * @return {String}
   * @throws RequestValidationError
   */
  async validateUpdatePassword(data) {
    const validation = new Validator(data, {
      password_old: 'required',
      password: 'required|min:7|confirmed'
    });

    if (validation.fails()) {
      throw new RequestValidationError(validation.errors.all());
    }

    const user = this;
    if (!(await bcrypt.compare(data.password_old, user.password))) {
      throw new UnauthorizedError('Old password does not match.');
    }

    return data.password;
  },

  /**
   * @alias User.prototype.validateOwnVetting
   * @param {Number} userId
   * @return {void}
   */
  validateOwnVetting(userId) {
    const user = this;
    if (user._id.toString() === userId.toString()) {
      throw new InvalidOperationError('You cannot like/unlike yourself.');
    }
  },

  /**
   * @alias User.prototype.validateLike
   * @async
   * @param {Number} userId
   * @return {Promise<void>}
   */
  async validateLike(userId) {
    const user = this;
    if (await user.hasLiked(userId)) {
      throw new InvalidOperationError('You already liked this user.');
    }
  },

  /**
   * @alias User.prototype.validateUnlike
   * @async
   * @param {Number} userId
   * @return {Promise<void>}
   */
  async validateUnlike(userId) {
    const user = this;
    if (!(await user.hasLiked(userId))) {
      throw new InvalidOperationError('You did not like this user.');
    }
  }
};

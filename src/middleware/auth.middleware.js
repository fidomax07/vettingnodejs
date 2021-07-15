const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const User = require('../models/user.model');
const UnauthorizedError = require('../errors/UnauthorizedError');

const authMiddleware = async (req, res, next) => {
  try {
    const tokenRaw = (req.header('Authorization') || '').replace('Bearer ', '');
    const token = jwt.verify(tokenRaw, jwtConfig.secret);
    const user = await User.findOne({ _id: token._id, 'tokens.token': tokenRaw });

    if (!user) {
      throw new UnauthorizedError();
    }

    req.token = tokenRaw;
    req.user = user;
    next();
  } catch (err) {
    next(new UnauthorizedError());
  }
};

module.exports = authMiddleware;

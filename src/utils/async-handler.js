const asyncHandler = (fn) => (req, res, next) => {
  const fnReturnValue = fn(req, res, next);
  return Promise.resolve(fnReturnValue).catch(next);
};

module.exports = asyncHandler;

module.exports = (req, res, next) => {
  req.requestId = crypto.randomUUID();

  next();
};

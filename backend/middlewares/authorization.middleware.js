module.exports = (req, res, next) => {
  try {
    const tenantId = Number(req.headers["t_id"]);

    if (!tenantId) {
      return res.status(400).json({
        message: "Missing tenant id (t_id)",
      });
    }

    if (tenantId !== req.creator.id) {
      return res.status(403).json({
        message: "Access denied!",
      });
    }

    req.tenantId = tenantId;
    next();
  } catch (err) {
    return res.status(500).json({
      message: "Tenant validation failed!",
    });
  }
};

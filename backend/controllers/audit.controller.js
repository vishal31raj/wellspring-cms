const { Op } = require("sequelize");
const AuditLog = require("../models/audit.model");

exports.getAuditLogs = async (req, res) => {
  try {
    const actorId = req.creator.id;

    let { page = 1, size = 10, date, actionType } = req.query;

    page = Number(page);
    size = Number(size);

    if (page < 1 || size < 1) {
      return res.status(400).json({
        message: "Invalid pagination params",
      });
    }

    const where = {
      actorId, // authorization
    };

    // Filter by action type
    if (actionType) {
      const allowedActions = [
        "CREATE",
        "UPDATE",
        "DELETE",
        "REORDER",
        "BULK_CREATE",
        "LOGIN",
        "LOGOUT",
        "REGISTER",
      ];

      if (!allowedActions.includes(actionType)) {
        return res.status(400).json({
          message: "Invalid actionType",
        });
      }

      where.action = actionType;
    }

    // Filter by date range
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      where.createdAt = {
        [Op.between]: [startDate, endDate],
      };
    }

    const offset = (page - 1) * size;

    const { rows, count } = await AuditLog.findAndCountAll({
      where,
      limit: size,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      message: "Audit logs fetched successfully",
      data: rows,
      pagination: {
        page,
        size,
        totalRecords: count,
        totalPages: Math.ceil(count / size),
      },
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

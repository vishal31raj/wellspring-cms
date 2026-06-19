// AuditLog model
const Sequelize = require("sequelize");
const sequelize = require("../utils/database");

const AuditLog = sequelize.define("audit_log", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  actorId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  action: {
    type: Sequelize.ENUM(
      "CREATE",
      "UPDATE",
      "DELETE",
      "REORDER",
      "BULK_CREATE",
      "LOGIN",
      "LOGOUT",
      "REGISTER",
    ),
    allowNull: false,
  },
  targetEntity: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  entityId: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
});

module.exports = AuditLog;

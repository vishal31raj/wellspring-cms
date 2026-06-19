const AuditLog = require("../models/audit.model");

exports.logAction = async (actorId, action, targetEntity, entityId) => {
  await AuditLog.create({
    actorId,
    action,
    targetEntity,
    entityId,
  });
};

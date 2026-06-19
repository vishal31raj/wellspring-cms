const express = require("express");
const auditController = require("../controllers/audit.controller");

const isAuthenticated = require("../middlewares/authentication.middleware");

const router = express.Router();

router.get("/logs", isAuthenticated, auditController.getAuditLogs);

module.exports = router;

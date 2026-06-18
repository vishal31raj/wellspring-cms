const express = require("express");
const { body } = require("express-validator");

const programController = require("../controllers/program.controller");

const isAuthenticated = require("../middlewares/authentication.middleware");
const isAuthorized = require("../middlewares/authorization.middleware");
const validate = require("../middlewares/req-validation.middleware");

const router = express.Router();

const reorderValidator = [
  body()
    .isArray({ min: 1 })
    .withMessage("Request body must be a non-empty array"),

  body("*.sessionId").isInt({ min: 1 }).withMessage("Invalid sessionId"),

  body("*.newPosition").isInt({ min: 1 }).withMessage("Invalid newPosition"),
];

router.post(
  "/",
  isAuthenticated,
  isAuthorized,
  body("title").notEmpty().withMessage("Title is required"),
  validate,
  programController.createProgram,
);
router.get(
  "/",
  isAuthenticated,
  isAuthorized,
  programController.getAllPrograms,
);
router.get(
  "/:id",
  isAuthenticated,
  isAuthorized,
  programController.getProgramDetails,
);
router.delete(
  "/:id",
  isAuthenticated,
  isAuthorized,
  programController.deleteProgram,
);
router.put(
  "/:id",
  isAuthenticated,
  isAuthorized,
  body("title").notEmpty().withMessage("Title is required"),
  validate,
  programController.updateProgram,
);
router.put(
  "/:programId/reorder",
  isAuthenticated,
  isAuthorized,
  reorderValidator,
  validate,
  programController.reorderSessions,
);

module.exports = router;

const express = require("express");
const { body } = require("express-validator");

const sessionController = require("../controllers/session.controller");

const isAuthenticated = require("../middlewares/authentication.middleware");
const isAuthorized = require("../middlewares/authorization.middleware");
const validate = require("../middlewares/req-validation.middleware");

const router = express.Router();

const sessionValidators = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("duration")
    .notEmpty()
    .withMessage("Duration is required")
    .isInt({ min: 1 })
    .withMessage("Duration must be a positive integer (seconds)"),
  body("position")
    .notEmpty()
    .withMessage("Position is required")
    .isInt({ min: 1 })
    .withMessage("Position must be a positive integer"),
  body("instructorName").notEmpty().withMessage("Instructor name is required"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
  body("tags.*").optional().isString().withMessage("Each tag must be a string"),
  body("mediaFileUrl")
    .trim()
    .notEmpty()
    .withMessage("Media file URL is required")
    .isURL()
    .withMessage("Media file URL must be valid"),
  body("type")
    .notEmpty()
    .withMessage("Type is required")
    .isIn(["audio", "video"])
    .withMessage("Type must be either audio or video"),
];

router.post(
  "/programs/:programId",
  isAuthenticated,
  isAuthorized,
  sessionValidators,
  validate,
  sessionController.createSession,
);

router.get(
  "/:id",
  isAuthenticated,
  isAuthorized,
  sessionController.getSessionDetails,
);

router.put(
  "/:id",
  isAuthenticated,
  isAuthorized,
  sessionValidators,
  validate,
  sessionController.updateSession,
);

router.delete(
  "/:id",
  isAuthenticated,
  isAuthorized,
  sessionController.deleteSession,
);

module.exports = router;

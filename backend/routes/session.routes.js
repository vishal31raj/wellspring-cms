const express = require("express");
const multer = require("multer");
const { body } = require("express-validator");

const sessionController = require("../controllers/session.controller");
const s3Controller = require("../utils/s3");

const isAuthenticated = require("../middlewares/authentication.middleware");
const isAuthorized = require("../middlewares/authorization.middleware");
const validate = require("../middlewares/req-validation.middleware");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const sessionValidators = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("instructorName").notEmpty().withMessage("Instructor name is required"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
  body("tags.*").optional().isString().withMessage("Each tag must be a string"),
];

router.post(
  "/programs/:programId/bulkImport",
  isAuthenticated,
  isAuthorized,
  upload.single("file"), // Expecting the CSV file under the key "file"
  [
    body("bulkImportId")
      .trim()
      .notEmpty()
      .withMessage("bulkImportId is required for idempotency protection"),
  ],
  validate,
  sessionController.bulkImportSessions,
);

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

router.post(
  "/generateUploadUrl/:programId/:sessionId",
  isAuthenticated,
  isAuthorized,
  [
    body("fileName").trim().notEmpty().withMessage("File name is required"),
    body("fileSize").trim().notEmpty().withMessage("File size is required"),
    body("contentType")
      .trim()
      .notEmpty()
      .withMessage("Content type is required"),
  ],
  validate,
  s3Controller.generateUploadUrl,
);

module.exports = router;

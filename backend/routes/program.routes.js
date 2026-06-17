const express = require("express");
const { body } = require("express-validator");

const programController = require("../controllers/program.controller");

const isAuthenticated = require("../middlewares/authentication.middleware");
const isAuthorized = require("../middlewares/authorization.middleware");
const validate = require("../middlewares/req-validation.middleware");

const router = express.Router();

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
router.put(
  "/:id",
  isAuthenticated,
  isAuthorized,
  body("title").notEmpty().withMessage("Title is required"),
  validate,
  programController.updateProgram,
);

module.exports = router;

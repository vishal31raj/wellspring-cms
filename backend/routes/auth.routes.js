const express = require("express");
const authController = require("../controllers/auth/auth.controller");

const isAuthenticated = require("../middlewares/authentication.middleware");

const router = express.Router();

router.post("/signup", authController.signup);

router.post("/login", authController.login);

router.get("/getProfile", isAuthenticated, authController.getProfile);

router.patch("/changePassword", isAuthenticated, authController.changePassword);

module.exports = router;

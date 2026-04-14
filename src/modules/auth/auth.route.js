const express = require("express");
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  checkBalance,
} = require("./auth.controller");

const router = express.Router();

router.post("/register",        register);
router.post("/login",           login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password",  resetPassword);
router.post("/check-balance", checkBalance);
module.exports = router;
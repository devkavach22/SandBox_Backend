const express = require("express");
const {
  callApiHandler,
  getUserHistoryHandler,
  getAllHistoryHandler,
} = require("./sandbox.controller");

const router = express.Router();
const validateClient = require("../../utils/validateClient");
router.post("/call",    validateClient,       callApiHandler);          // API call karo
router.get("/history/all", validateClient,    getAllHistoryHandler);     // Admin all history
router.get("/history/:userId",validateClient, getUserHistoryHandler);   // Customer history


module.exports = router;
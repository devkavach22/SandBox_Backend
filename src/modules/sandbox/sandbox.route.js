const express = require("express");
const {
  callApiHandler,
  getUserHistoryHandler,
  getAllHistoryHandler,
} = require("./sandbox.controller");

const router = express.Router();

router.post("/call",           callApiHandler);          // API call karo
router.get("/history/all",     getAllHistoryHandler);     // Admin all history
router.get("/history/:userId", getUserHistoryHandler);   // Customer history


module.exports = router;
const express = require("express");
const {
  createOrderHandler,
  verifyPaymentHandler,
  getHistoryHandler,
  getAllPaymentsHandler,
} = require("./payment.controller");

const router = express.Router();

router.post("/order",        createOrderHandler);      // Order create
router.post("/verify",       verifyPaymentHandler);    // Payment verify
router.get("/history/:userId", getHistoryHandler);     // Customer history
router.get("/all",           getAllPaymentsHandler);    // Admin all payments

module.exports = router;
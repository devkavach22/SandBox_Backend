const express = require("express");
const {
  createOrderHandler,
  verifyPaymentHandler,
  getHistoryHandler,
  getAllPaymentsHandler,
} = require("./payment.controller");

const router = express.Router();
const validateClient = require("../../utils/validateClient");

router.post("/order",   validateClient,     createOrderHandler);      // Order create
router.post("/verify",   validateClient,    verifyPaymentHandler);    // Payment verify
router.get("/history/:userId",validateClient, getHistoryHandler);     // Customer history
router.get("/all",   validateClient,        getAllPaymentsHandler);    // Admin all payments

module.exports = router;
const { createOrder, verifyPayment, getPaymentHistory, getAllPayments } = require("./payment.service");
const asyncHandler = require("../../utils/asyncHandler");
const STATUS       = require("../../utils/statusCodes");

// ── Order Create ──
const createOrderHandler = asyncHandler(async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(STATUS.BAD_REQUEST).json({ success: false, message: "Valid amount required" });
  }

  const order = await createOrder({ amount });
  return res.status(STATUS.CREATED).json({
    success: true,
    message: "Order created",
    data:    order,
  });
});

// ── Payment Verify ──
const verifyPaymentHandler = asyncHandler(async (req, res) => {
  const { order_id, payment_id, signature, amount, userId } = req.body;

  if (!order_id || !payment_id || !signature || !amount || !userId) {
    return res.status(STATUS.BAD_REQUEST).json({ success: false, message: "All fields required" });
  }

  const data = await verifyPayment({ order_id, payment_id, signature, amount, userId });
  return res.status(STATUS.OK).json({
    success: true,
    message: "Payment verified successfully",
    data,
  });
});

// ── Payment History — Customer ──
const getHistoryHandler = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const payments = await getPaymentHistory(userId);
  return res.status(STATUS.OK).json({
    success: true,
    message: "Payment history fetched",
    count:   payments.length,
    data:    payments,
  });
});

// ── All Payments — Admin ──
const getAllPaymentsHandler = asyncHandler(async (req, res) => {
  const payments = await getAllPayments();
  return res.status(STATUS.OK).json({
    success: true,
    message: "All payments fetched",
    count:   payments.length,
    data:    payments,
  });
});

module.exports = { createOrderHandler, verifyPaymentHandler, getHistoryHandler, getAllPaymentsHandler };
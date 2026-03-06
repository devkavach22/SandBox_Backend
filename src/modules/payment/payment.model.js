const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  user: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      "User",
    required: true,
  },
  order_id: {
    type:     String,
    required: true,
  },
  transaction_id: {
    type:     String,
    required: true,
    unique:   true,
  },
  amount: {
    type:     Number,
    required: true,
  },
  method: {
    type:    String,
    default: "Razorpay",
  },
  status: {
    type:    String,
    enum:    ["success", "failed"],
    default: "success",
  },
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);
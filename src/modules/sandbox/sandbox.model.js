const mongoose = require("mongoose");

const historySchema = new mongoose.Schema({
  user: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      "User",
    required: true,
  },
  api: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      "Api",
    required: true,
  },
  apiName: {
    type: String,
  },
  method: {
    type: String,
  },
  url: {
    type: String,
  },
  requestBody: {
    type:    mongoose.Schema.Types.Mixed,
    default: null,
  },
  responseData: {
    type:    mongoose.Schema.Types.Mixed,
    default: null,
  },
  statusCode: {
    type: Number,
  },
  status: {
    type:    String,
    enum:    ["success", "error"],
    default: "success",
  },
  amountDeducted: {
    type:    Number,
    default: 0,
  },
  responseTime: {
    type:    Number, // ms me
    default: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model("History", historySchema);
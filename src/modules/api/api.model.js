const mongoose = require("mongoose");

const apiSchema = new mongoose.Schema({
  name: {
    type:     String,
    required: [true, "API name required"],
    trim:     true,
  },
  url: {
    type:     String,
    required: [true, "URL required"],
    trim:     true,
  },
  method: {
    type:    String,
    enum:    ["GET", "POST", "PUT", "DELETE"],
    default: "GET",
  },
  description: {
    type:  String,
    trim:  true,
  },
  pricePerCall: {
    type:    Number,
    default: 2,
  },
  enabled: {
    type:    Boolean,
    default: true,
  },
  isDemo: {
    type:    Boolean,
    default: false,
  },
  sampleBody: {
    type:    mongoose.Schema.Types.Mixed,
    default: null,
  },
  sampleResponse: {
    type:    mongoose.Schema.Types.Mixed,
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model("Api", apiSchema);
const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");
const crypto   = require("crypto");

const userSchema = new mongoose.Schema({
  client_id: {
    type:    String,
    unique:  true,
    default: () => crypto.randomBytes(32).toString("hex"), 
  },
  name: {
    type:     String,
    required: [true, "Name required"],
    trim:     true,
  },
  email: {
    type:      String,
    required:  [true, "Email required"],
    unique:    true,
    lowercase: true,
    trim:      true,
  },
  password: {
    type:      String,
    required:  [true, "Password required"],
    minlength: 6,
    select:    false,
  },
  phone: {
    type:  String,
    trim:  true,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^[6-9]\d{9}$/.test(v);
      },
      message: "Invalid phone number",
    },
  },
  role: {
    type:    String,
    enum:    ["admin", "customer"],
    default: "customer",
  },
  avatar: {
    type:    String,
    default: null,
  },
  secreteKey: {
    type:    String,
    unique:  true,
    default: () => crypto.randomBytes(32).toString("hex"), 
  },
  tempPassword: {
    type:   String,
    select: false,
  },
  tempPasswordExpires: {
    type:   Date,
    select: false,
  },
  balance: {
    type:    Number,
    default: 0,
  },
  selectedApis: [{
    type: mongoose.Schema.Types.ObjectId,
    ref:  "Api",
  }],
}, { timestamps: true });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model("User", userSchema);
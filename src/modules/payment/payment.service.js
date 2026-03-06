const Razorpay   = require("razorpay");
const crypto     = require("crypto");
const nodemailer = require("nodemailer");
const Payment    = require("./payment.model");
const User       = require("../auth/auth.model");

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const transporter = nodemailer.createTransport({
  host:   process.env.MAIL_HOST,
  port:   parseInt(process.env.MAIL_PORT),
  secure: process.env.MAIL_SECURE === "true",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

const sendPaymentEmail = async ({ email, name, amount, transaction_id, method, balance, date }) => {
  await transporter.sendMail({
    from:    `"SandboxHub" <${process.env.MAIL_USER}>`,
    to:      email,
    subject: "✅ Payment Successful — SandboxHub",
    html: `
      <div style="font-family: monospace; background: #020b08; color: #e8fff6; padding: 32px; border-radius: 16px; max-width: 500px; margin: auto;">
        <h2 style="color: #00ffb4; margin-bottom: 4px;">✅ Payment Successful!</h2>
        <p style="color: #5a8a70; margin-top: 0;">Hi ${name}, your wallet has been credited.</p>
        <div style="background: #071a12; border: 1px solid #0d3324; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #0d3324;">
              <td style="padding: 10px 0; color: #5a8a70;">Transaction ID</td>
              <td style="padding: 10px 0; color: #e8fff6; font-weight: bold;">${transaction_id}</td>
            </tr>
            <tr style="border-bottom: 1px solid #0d3324;">
              <td style="padding: 10px 0; color: #5a8a70;">Amount Paid</td>
              <td style="padding: 10px 0; color: #00ffb4; font-weight: bold;">₹${amount}</td>
            </tr>
            <tr style="border-bottom: 1px solid #0d3324;">
              <td style="padding: 10px 0; color: #5a8a70;">Date & Time</td>
              <td style="padding: 10px 0; color: #e8fff6;">${date}</td>
            </tr>
            <tr style="border-bottom: 1px solid #0d3324;">
              <td style="padding: 10px 0; color: #5a8a70;">Method</td>
              <td style="padding: 10px 0; color: #4da6ff;">${method}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #5a8a70;">Wallet Balance</td>
              <td style="padding: 10px 0; color: #ffd700; font-weight: bold;">₹${balance}</td>
            </tr>
          </table>
        </div>
        <p style="color: #5a8a70; font-size: 12px; text-align: center;">Thank you for using SandboxHub!</p>
      </div>
    `,
  });
};

// ── Step 1: Order Create ──
const createOrder = async ({ amount }) => {
  const order = await razorpay.orders.create({
    amount:   amount * 100,
    currency: "INR",
    receipt:  `receipt_${Date.now()}`,
  });
  return order;
};

// ── Step 2: Payment Verify ──
const verifyPayment = async ({ order_id, payment_id, signature, amount, userId }) => {

  // Development me bypass — Production me real verify
  if (process.env.NODE_ENV === "production") {
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(order_id + "|" + payment_id)
      .digest("hex");

    if (expectedSignature !== signature) {
      throw { status: 400, message: "Payment verification failed — invalid signature" };
    }
  }

  // Duplicate payment check
  const existing = await Payment.findOne({ transaction_id: payment_id });
  if (existing) throw { status: 409, message: "Payment already verified" };

  // Payment save karo
  const payment = await Payment.create({
    user:           userId,
    order_id,
    transaction_id: payment_id,
    amount,
    status:         "success",
  });

  // Balance update karo
  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { balance: amount } },
    { new: true }
  );

  const date = new Date().toLocaleString("en-IN", {
    day:    "2-digit",
    month:  "short",
    year:   "numeric",
    hour:   "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  await sendPaymentEmail({
    email:          user.email,
    name:           user.name,
    amount,
    transaction_id: payment_id,
    method:         "Razorpay",
    balance:        user.balance,
    date,
  });

  return { payment, balance: user.balance };
};

// ── Payment History — Customer ──
const getPaymentHistory = async (userId) => {
  return await Payment.find({ user: userId }).sort({ createdAt: -1 });
};

// ── All Payments — Admin ──
const getAllPayments = async () => {
  return await Payment
    .find()
    .populate("user", "name email")
    .sort({ createdAt: -1 });
};

module.exports = { createOrder, verifyPayment, getPaymentHistory, getAllPayments };
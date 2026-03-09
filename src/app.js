require("dotenv").config();
const express  = require("express");
const cors     = require("cors");
const helmet   = require("helmet");

const authRoute = require("./modules/auth/auth.route");
const apiRoute  = require("./modules/api/api.route");
const paymentRoute = require("./modules/payment/payment.route");
const userRoute = require("./modules/user/user.route");
const sandboxRoute = require("./modules/sandbox/sandbox.route");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use("/api/auth", authRoute);
app.use("/api/apis", apiRoute);
app.use("/api/payment", paymentRoute);
app.use("/api/user", userRoute);
app.use("/api/sandbox", sandboxRoute);

/* Home Route */
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Welcome to SandBox API",
    documentation: "/api",
    health: "/health"
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is running",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

module.exports = app;
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");
const authRoute = require("./src/modules/auth/auth.route");
const apiRoute = require("./src/modules/api/api.route");
const paymentRoute = require("./src/modules/payment/payment.route");
const userRoute = require("./src/modules/user/user.route");
const sandboxRoute = require("./src/modules/sandbox/sandbox.route");

const app = express();
const PORT = process.env.PORT;

const corsOptions = {
  origin: [
    "http://localhost:6002",
    "http://192.168.11.53:6002",
    "*"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  next();
});

app.options("/{*path}", cors(corsOptions));
app.use(cors(corsOptions));

app.use("/api/auth", authRoute);
app.use("/api/apis", apiRoute);
app.use("/api/payment", paymentRoute);
app.use("/api/user", userRoute);
app.use("/api/sandbox", sandboxRoute);

app.get("/", (req, res) => {
  res.status(200).json({ status: "success", message: "Welcome to SandBox API" });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "success", message: "Server is running" });
});

app.use((req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("🔥 Unhandled error:", err.message || err);
  res.status(500).json({ success: false, message: err.message || "Internal server error" });
});

connectDB().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
}).catch((err) => {
  console.error("❌ DB connection failed:", err);
  process.exit(1);
});
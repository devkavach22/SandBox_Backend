require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");

const authRoute = require("./src/modules/auth/auth.route");
const apiRoute = require("./src/modules/api/api.route");
const paymentRoute = require("./src/modules/payment/payment.route");
const userRoute = require("./src/modules/user/user.route");
const sandboxRoute = require("./src/modules/sandbox/sandbox.route");

console.log("✅ authRoute loaded:", typeof authRoute);
console.log("✅ apiRoute loaded:", typeof apiRoute);
console.log("✅ paymentRoute loaded:", typeof paymentRoute);
console.log("✅ userRoute loaded:", typeof userRoute);
console.log("✅ sandboxRoute loaded:", typeof sandboxRoute);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

/* ─── Log every incoming request ─────────────────────────────── */
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  next();
});

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

/* ─── 404 Catch — shows exactly what URL was not found ───────── */
app.use((req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ success: false, message: "Route not found" });
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
}).catch((err) => {
  console.error("❌ DB connection failed:", err);
  process.exit(1);
})
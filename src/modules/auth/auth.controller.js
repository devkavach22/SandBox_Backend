const { registerService, loginService, forgotPasswordService, resetPasswordService, checkBalanceService } = require("./auth.service");
const asyncHandler = require("../../utils/asyncHandler");
const STATUS = require("../../utils/statusCodes");

// ── Register ──
const register = asyncHandler(async (req, res) => {
  const { name, email, password, confirm_password, phone, avatar } = req.body;

  if (!name || !email || !password || !confirm_password || !phone) {
    return res.status(STATUS.BAD_REQUEST).json({
      success: false,
      message: "All fields required — name, email, password, confirm_password, phone",
    });
  }

  if (password !== confirm_password) {
    return res.status(STATUS.BAD_REQUEST).json({
      success: false,
      message: "Password and confirm password do not match",
    });
  }

  const data = await registerService({ name, email, password, phone, avatar });

  return res.status(STATUS.CREATED).json({
    success: true,
    message: "Account created successfully",
    data,
  });
});

// ── Login ──
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(STATUS.BAD_REQUEST).json({
      success: false,
      message: "Email and password required",
    });
  }

  const data = await loginService({ email, password });

  return res.status(STATUS.OK).json({
    success: true,
    message: "Login successful",
    data,
  });
});

// ── Forgot Password ──
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(STATUS.BAD_REQUEST).json({
      success: false,
      message: "Email is required",
    });
  }

  const data = await forgotPasswordService(email);

  return res.status(STATUS.OK).json({
    success: true,
    message: data.message,
  });
});

// ── Reset Password ──
const resetPassword = asyncHandler(async (req, res) => {
  const { email, tempPassword, newPassword } = req.body;

  if (!email || !tempPassword || !newPassword) {
    return res.status(STATUS.BAD_REQUEST).json({
      success: false,
      message: "email, tempPassword and newPassword are required",
    });
  }

  await resetPasswordService({ email, tempPassword, newPassword });

  return res.status(STATUS.OK).json({
    success: true,
    message: "Password updated successfully",
  });
});

// ── Check Balance ──
const checkBalance = asyncHandler(async (req, res) => {
  const { secreteKey, client_id } = req.body; // ✅ body se lenge

  if (!secreteKey || !client_id) {
    return res.status(STATUS.BAD_REQUEST).json({
      success: false,
      message: "Required parameters are missing",
    });
  }

  const data = await checkBalanceService({ secreteKey, client_id });
  return res.status(STATUS.OK).json({
    success: true,
    data,
  });
});

module.exports = { register, login, forgotPassword, resetPassword, checkBalance };
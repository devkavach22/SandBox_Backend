const { registerService, loginService ,forgotPasswordService,resetPasswordService} = require("./auth.service");
const asyncHandler = require("../../utils/asyncHandler");
const STATUS       = require("../../utils/statusCodes");

// ── Register ──
const register = asyncHandler(async (req, res) => {
  const { name, email, password, confirm_password, phone, avatar } = req.body;

  // Required fields
  if (!name || !email || !password || !confirm_password || !phone) {
    return res.status(STATUS.BAD_REQUEST).json({
      success: false,
      message: "All fields required — name, email, password, confirm_password, phone",
    });
  }

  // Password match check
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


const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const data = await forgotPasswordService(email);
  return res.status(STATUS.OK).json({ success: true, message: data.message });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { email, tempPassword, newPassword } = req.body;
  await resetPasswordService({ email, tempPassword, newPassword });
  return res.status(STATUS.OK).json({ success: true, message: "Password updated successfully" });
});

module.exports = { register, login ,forgotPassword,resetPassword};
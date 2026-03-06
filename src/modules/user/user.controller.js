const { getProfile, updateProfile, getAvailableApis, selectApi, deselectApi, getBalance } = require("./user.service");
const asyncHandler = require("../../utils/asyncHandler");
const STATUS       = require("../../utils/statusCodes");
const User         = require("../auth/auth.model");

// ── Profile dekho ──
const getProfileHandler = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await getProfile(userId);
  return res.status(STATUS.OK).json({ success: true, message: "Profile fetched", data: user });
});

// ── Profile update ──
const updateProfileHandler = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { name, phone, avatar } = req.body;
  const user = await updateProfile(userId, { name, phone, avatar });
  return res.status(STATUS.OK).json({ success: true, message: "Profile updated", data: user });
});

// ── Available APIs ──
const getAvailableApisHandler = asyncHandler(async (req, res) => {
  const apis = await getAvailableApis();
  return res.status(STATUS.OK).json({ success: true, message: "Available APIs fetched", count: apis.length, data: apis });
});

// ── API Select ──
const selectApiHandler = asyncHandler(async (req, res) => {
  const { userId, apiId } = req.body;
  if (!userId || !apiId) {
    return res.status(STATUS.BAD_REQUEST).json({ success: false, message: "userId and apiId required" });
  }
  const selectedApis = await selectApi(userId, apiId);
  return res.status(STATUS.OK).json({ success: true, message: "API selected successfully", data: selectedApis });
});

// ── API Deselect ──
const deselectApiHandler = asyncHandler(async (req, res) => {
  const { userId, apiId } = req.body;
  if (!userId || !apiId) {
    return res.status(STATUS.BAD_REQUEST).json({ success: false, message: "userId and apiId required" });
  }
  const selectedApis = await deselectApi(userId, apiId);
  return res.status(STATUS.OK).json({ success: true, message: "API deselected successfully", data: selectedApis });
});

// ── Balance ──
const getBalanceHandler = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const data = await getBalance(userId);
  return res.status(STATUS.OK).json({ success: true, message: "Balance fetched", data });
});

// ── All Customers — Admin ──
const getAllCustomersHandler = asyncHandler(async (req, res) => {
  const customers = await User.find({ role: "customer" })
    .select("-password")
    .populate("selectedApis", "name method url pricePerCall")
    .sort({ createdAt: -1 });

  return res.status(STATUS.OK).json({
    success: true,
    message: "Customers fetched",
    count:   customers.length,
    data:    customers,
  });
});

module.exports = {
  getProfileHandler,
  updateProfileHandler,
  getAvailableApisHandler,
  selectApiHandler,
  deselectApiHandler,
  getBalanceHandler,
  getAllCustomersHandler,
};
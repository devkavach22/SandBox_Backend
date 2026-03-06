const { getAllApis, getEnabledApis, createApi, updateApi, deleteApi, toggleApi } = require("./api.service");
const asyncHandler = require("../../utils/asyncHandler");
const STATUS = require("../../utils/statusCodes");
const User = require("../auth/auth.model");
const Api = require("./api.model");
const Payment = require("../payment/payment.model");
const History = require("../sandbox/sandbox.model");

// ── Sab APIs — Admin ──
const getAllApisHandler = asyncHandler(async (req, res) => {
  const apis = await getAllApis();
  return res.status(STATUS.OK).json({ success: true, message: "APIs fetched", count: apis.length, data: apis });
});

// ── Enabled APIs — Customer ──
const getEnabledApisHandler = asyncHandler(async (req, res) => {
  const apis = await getEnabledApis();
  return res.status(STATUS.OK).json({ success: true, message: "APIs fetched", count: apis.length, data: apis });
});

// ── API Add — Admin ──
const createApiHandler = asyncHandler(async (req, res) => {
  const { name, url, method, description, pricePerCall, sampleBody, sampleResponse } = req.body;
  if (!name || !url || !method) {
    return res.status(STATUS.BAD_REQUEST).json({ success: false, message: "Name, URL and method required" });
  }
  const api = await createApi({ name, url, method, description, pricePerCall, sampleBody, sampleResponse });
  return res.status(STATUS.CREATED).json({ success: true, message: "API created successfully", data: api });
});

// ── API Update — Admin ──
const updateApiHandler = asyncHandler(async (req, res) => {
  const api = await updateApi(req.params.id, req.body);
  return res.status(STATUS.OK).json({ success: true, message: "API updated successfully", data: api });
});

// ── API Delete — Admin ──
const deleteApiHandler = asyncHandler(async (req, res) => {
  await deleteApi(req.params.id);
  return res.status(STATUS.OK).json({ success: true, message: "API deleted successfully" });
});

// ── Toggle Enable/Disable — Admin ──
const toggleApiHandler = asyncHandler(async (req, res) => {
  const api = await toggleApi(req.params.id);
  return res.status(STATUS.OK).json({
    success: true,
    message: `API ${api.enabled ? "enabled" : "disabled"} successfully`,
    data: api,
  });
});

// ── Admin Stats ──
const getStatsHandler = asyncHandler(async (req, res) => {
  const totalApis = await Api.countDocuments();
  const totalCustomers = await User.countDocuments({ role: "customer" });
  const totalApiCalls = await History.countDocuments();
  const successCalls = await History.countDocuments({ status: "success" });
  const failedCalls = await History.countDocuments({ status: "error" });

  // Total Revenue
  const revenueResult = await Payment.aggregate([
    { $match: { status: "success" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const totalRevenue = revenueResult[0]?.total || 0;

  return res.status(STATUS.OK).json({
    success: true,
    message: "Stats fetched",
    data: {
      totalApis,
      totalCustomers,
      totalRevenue,
      totalApiCalls,
      successCalls,
      failedCalls,
    },
  });
});

module.exports = {
  getAllApisHandler,
  getEnabledApisHandler,
  createApiHandler,
  updateApiHandler,
  deleteApiHandler,
  toggleApiHandler,
  getStatsHandler,
};
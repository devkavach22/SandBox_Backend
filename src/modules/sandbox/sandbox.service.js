const axios   = require("axios");
const User    = require("../auth/auth.model");
const Api     = require("../api/api.model");
const History = require("./sandbox.model");
const STATUS  = require("../../utils/statusCodes");

const callApi = async ({ userId, apiId, requestBody, headers = {} }) => {

  // ── User check ──
  const user = await User.findById(userId);
  if (!user) throw { status: STATUS.NOT_FOUND, message: "User not found" };

  // ── API check ──
  const api = await Api.findById(apiId);
  if (!api)         throw { status: STATUS.NOT_FOUND,   message: "API not found" };
  if (!api.enabled) throw { status: STATUS.BAD_REQUEST, message: "API is disabled" };

  // ── Balance check ──
  if (user.balance < api.pricePerCall) {
    throw { status: STATUS.BAD_REQUEST, message: `Insufficient balance — need ₹${api.pricePerCall}, have ₹${user.balance}` };
  }

  // ── Actual API Call ──
  const startTime = Date.now();
  let responseData, statusCode, status;

  try {
    const response = await axios({
      method:  api.method,
      url:     api.url,
      data:    api.method === "GET" ? undefined : (requestBody || null),
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
        ...headers, 
      },
    });

    responseData = response.data;
    statusCode   = response.status;
    status       = "success";

  } catch (err) {
    responseData = err.response?.data || { message: err.message };
    statusCode   = err.response?.status || STATUS.SERVER_ERROR;
    status       = "error";
  }

  const responseTime = Date.now() - startTime;

  // ── Balance katao ──
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $inc: { balance: -api.pricePerCall } },
    { new: true }
  );

  // ── History save karo ──
  await History.create({
    user:           userId,
    api:            apiId,
    apiName:        api.name,
    method:         api.method,
    url:            api.url,
    requestBody:    api.method === "GET" ? null : (requestBody || null),
    responseData,
    statusCode,
    status,
    amountDeducted: api.pricePerCall,
    responseTime,
  });

  return {
    statusCode,
    status,
    responseTime:     `${responseTime}ms`,
    amountDeducted:   api.pricePerCall,
    remainingBalance: updatedUser.balance,
    response:         responseData,
  };
};

// ── History — Customer ──
const getUserHistory = async (userId) => {
  return await History
    .find({ user: userId })
    .populate("api", "name method url")
    .sort({ createdAt: -1 });
};

// ── History — Admin ──
const getAllHistory = async () => {
  return await History
    .find()
    .populate("user", "name email")
    .populate("api", "name method url")
    .sort({ createdAt: -1 });
};

module.exports = { callApi, getUserHistory, getAllHistory };
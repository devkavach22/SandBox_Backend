const axios   = require("axios");
const User    = require("../auth/auth.model");
const Api     = require("../api/api.model");
const History = require("./sandbox.model");
const STATUS  = require("../../utils/statusCodes");

const callApi = async ({ userId, apiId, requestBody, headers = {}, isFormData = false, urlOverride = null }) => {

    // ── User check ──
    const user = await User.findById(userId);
    if (!user) throw { status: STATUS.NOT_FOUND, message: "User not found" };

    // ── API check ──
    const api = await Api.findById(apiId);
    if (!api)         throw { status: STATUS.NOT_FOUND,   message: "API not found" };
    if (!api.enabled) throw { status: STATUS.BAD_REQUEST, message: "API is disabled" };

    // ── Balance check ──
    if (user.balance < api.pricePerCall) {
        throw {
            status:  STATUS.BAD_REQUEST,
            message: `Insufficient balance — need ₹${api.pricePerCall}, have ₹${user.balance}`,
        };
    }

    // ── URL decide karo ──
    const targetUrl = (urlOverride && urlOverride.trim()) ? urlOverride.trim() : api.url;

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🚀 API CALL:", api.name);
    console.log("   Method  :", api.method);
    console.log("   URL     :", targetUrl);
    console.log("   FormData:", isFormData);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    const startTime = Date.now();
    let responseData, statusCode, status;

    const requestHeaders = isFormData
        ? { ...headers }
        : { "Content-Type": "application/json", ...headers };

    try {
        console.log("📤 Sending...");
        const response = await axios({
            method:           api.method,
            url:              targetUrl,
            data:             api.method === "GET" ? undefined : (requestBody || null),
            timeout:          300000,
            maxContentLength: Infinity,
            maxBodyLength:    Infinity,
            headers:          requestHeaders,
        });
        responseData = response.data;
        statusCode   = response.status;
        status       = "success";
        console.log("✅ Done:", statusCode, "in", Date.now() - startTime, "ms");
    } catch (err) {
        responseData = err.response?.data || { message: err.message };
        statusCode   = err.response?.status || STATUS.SERVER_ERROR;
        status       = "error";
        console.log("❌ Failed:", err.message, "in", Date.now() - startTime, "ms");
    }

    const responseTime = Date.now() - startTime;
    console.log("⏱️  Total:", responseTime, "ms");

    // ── Actual success check — HTTP bhi success ho AUR response me success: false na ho ──
    const isActualSuccess = status === "success" && responseData?.success !== false;

    // ── Balance katao — sirf actual success pe ──
    let updatedUser;
    if (isActualSuccess) {
        updatedUser = await User.findByIdAndUpdate(
            userId,
            { $inc: { balance: -api.pricePerCall } },
            { new: true }
        );
    } else {
        updatedUser = await User.findById(userId); // balance same rahega
    }

    // ── History save karo ──
    const loggedBody = isFormData
        ? "[multipart/form-data — file upload]"
        : (api.method === "GET" ? null : (requestBody || null));

    await History.create({
        user:           userId,
        api:            apiId,
        apiName:        api.name,
        method:         api.method,
        url:            targetUrl,
        requestBody:    loggedBody,
        responseData,
        statusCode,
        status:         isActualSuccess ? "success" : "error",
        amountDeducted: isActualSuccess ? api.pricePerCall : 0,
        responseTime,
    });

    return {
        statusCode,
        status:           isActualSuccess ? "success" : "error",
        responseTime:     `${responseTime}ms`,
        amountDeducted:   isActualSuccess ? api.pricePerCall : 0,
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
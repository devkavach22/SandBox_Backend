const { getAllApis, getEnabledApis, createApi, updateApi, deleteApi, toggleApi } = require("./api.service");
const asyncHandler = require("../../utils/asyncHandler");
const STATUS       = require("../../utils/statusCodes");
const User         = require("../auth/auth.model");
const Api          = require("./api.model");
const Payment      = require("../payment/payment.model");
const History      = require("../sandbox/sandbox.model");

// ── Helper: parse JSON string safely ──
const tryParse = (val) => {
    if (val === undefined || val === null || val === "") return null;
    if (typeof val !== "string") return val; // already object
    try { return JSON.parse(val); } catch { return null; }
};

// ── Helper: "true" / "false" string → Boolean ──
const toBool = (val) => {
    if (typeof val === "boolean") return val;
    if (val === "true")  return true;
    if (val === "false") return false;
    return true;
};

// ── Helper: map multer files → attachment objects ──
const mapFiles = (files = []) =>
    files.map((f) => ({
        filename:     f.filename,
        originalname: f.originalname,
        mimetype:     f.mimetype,
        size:         f.size,
        path:         f.path,
    }));

// ── Sab APIs — Admin ──
const getAllApisHandler = asyncHandler(async (req, res) => {
    const apis = await getAllApis();
    return res.status(STATUS.OK).json({
        success: true,
        message: "APIs fetched",
        count:   apis.length,
        data:    apis,
    });
});

// ── Enabled APIs — Customer ──
const getEnabledApisHandler = asyncHandler(async (req, res) => {
    const apis = await getEnabledApis();
    return res.status(STATUS.OK).json({
        success: true,
        message: "APIs fetched",
        count:   apis.length,
        data:    apis,
    });
});

// ── API Add — Admin ──
const createApiHandler = asyncHandler(async (req, res) => {
    const { name, url, method, description, pricePerCall, category } = req.body;

    if (!name || !url || !method) {
        return res.status(STATUS.BAD_REQUEST).json({
            success: false,
            message: "Name, URL and method required",
        });
    }

    // FormData se aane wale strings ko properly parse karo
    const sampleBody     = tryParse(req.body.sampleBody);     // "{\"file\":\"\"}" → { file: "" }
    const sampleResponse = tryParse(req.body.sampleResponse); // string → object
    const enabled        = toBool(req.body.enabled);          // "true" → true
    const attachments    = mapFiles(req.files);               // multer files → clean objects

    const api = await createApi({
        name,
        url,
        method,
        description,
        pricePerCall,
        category,
        sampleBody,
        sampleResponse,
        enabled,
        attachments,
    });

    return res.status(STATUS.CREATED).json({
        success: true,
        message: "API created successfully",
        data:    api,
    });
});

// ── API Update — Admin ──
const updateApiHandler = asyncHandler(async (req, res) => {
    const data = { ...req.body };

    data.sampleBody     = tryParse(data.sampleBody);
    data.sampleResponse = tryParse(data.sampleResponse);
    data.enabled        = toBool(data.enabled);

    if (req.files?.length > 0) {
        const newFiles = mapFiles(req.files);
        const existing = await Api.findById(req.params.id).select("attachments");
        data.attachments = [...(existing?.attachments || []), ...newFiles];
    }

    const api = await updateApi(req.params.id, data);
    return res.status(STATUS.OK).json({
        success: true,
        message: "API updated successfully",
        data:    api,
    });
});

// ── API Delete — Admin ──
const deleteApiHandler = asyncHandler(async (req, res) => {
    await deleteApi(req.params.id);
    return res.status(STATUS.OK).json({
        success: true,
        message: "API deleted successfully",
    });
});

// ── Toggle Enable/Disable — Admin ──
const toggleApiHandler = asyncHandler(async (req, res) => {
    const api = await toggleApi(req.params.id);
    return res.status(STATUS.OK).json({
        success: true,
        message: `API ${api.enabled ? "enabled" : "disabled"} successfully`,
        data:    api,
    });
});

// ── Admin Stats ──
const getStatsHandler = asyncHandler(async (req, res) => {
    const totalApis      = await Api.countDocuments();
    const totalCustomers = await User.countDocuments({ role: "customer" });
    const totalApiCalls  = await History.countDocuments();
    const successCalls   = await History.countDocuments({ status: "success" });
    const failedCalls    = await History.countDocuments({ status: "error" });

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
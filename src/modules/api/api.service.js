const Api = require("./api.model");

// ── Sab APIs lo ──
const getAllApis = async () => {
    return await Api.find().sort({ createdAt: -1 });
};

// ── Sirf enabled APIs lo (customer ke liye) ──
const getEnabledApis = async () => {
    return await Api.find({ enabled: true }).sort({ createdAt: -1 });
};

// ── API add karo ──
const createApi = async ({ name, url, method, description, pricePerCall, sampleBody, sampleResponse, category, enabled, attachments }) => {
    const api = await Api.create({
        name,
        url,
        method,
        description,
        pricePerCall,
        sampleBody,       // already parsed object from controller
        sampleResponse,   // already parsed object from controller
        category,
        enabled,          // ← fix: pehle miss tha
        attachments,      // ← fix: pehle miss tha
        isDemo: false,
    });
    return api;
};

// ── API update karo ──
const updateApi = async (id, data) => {
    const api = await Api.findByIdAndUpdate(id, data, { new: true });
    if (!api) throw { status: 404, message: "API not found" };
    return api;
};

// ── API delete karo ──
const deleteApi = async (id) => {
    const api = await Api.findByIdAndDelete(id);
    if (!api) throw { status: 404, message: "API not found" };
    return api;
};

// ── Enable/Disable toggle ──
const toggleApi = async (id) => {
    const api = await Api.findById(id);
    if (!api) throw { status: 404, message: "API not found" };
    api.enabled = !api.enabled;
    await api.save();
    return api;
};

module.exports = { getAllApis, getEnabledApis, createApi, updateApi, deleteApi, toggleApi };
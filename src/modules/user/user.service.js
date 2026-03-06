const User = require("../auth/auth.model");
const Api  = require("../api/api.model");

// ── Profile dekho ──
const getProfile = async (userId) => {
  const user = await User.findById(userId).populate("selectedApis");
  if (!user) throw { status: 404, message: "User not found" };
  return user;
};

// ── Profile update karo ──
const updateProfile = async (userId, { name, phone, avatar }) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { name, phone, avatar },
    { new: true }
  );
  if (!user) throw { status: 404, message: "User not found" };
  return user;
};

// ── Available APIs dekho ──
const getAvailableApis = async () => {
  return await Api.find({ enabled: true }).sort({ createdAt: -1 });
};

// ── API select karo ──
const selectApi = async (userId, apiId) => {
  const api = await Api.findById(apiId);
  if (!api) throw { status: 404, message: "API not found" };

  const user = await User.findById(userId);
  if (!user) throw { status: 404, message: "User not found" };

  // Pehle se selected hai?
  if (user.selectedApis.includes(apiId)) {
    throw { status: 409, message: "API already selected" };
  }

  user.selectedApis.push(apiId);
  await user.save();

  return user.selectedApis;
};

// ── API deselect karo ──
const deselectApi = async (userId, apiId) => {
  const user = await User.findById(userId);
  if (!user) throw { status: 404, message: "User not found" };

  user.selectedApis = user.selectedApis.filter(
    (id) => id.toString() !== apiId
  );
  await user.save();

  return user.selectedApis;
};

// ── Balance dekho ──
const getBalance = async (userId) => {
  const user = await User.findById(userId).select("balance name email");
  if (!user) throw { status: 404, message: "User not found" };
  return user;
};

module.exports = { getProfile, updateProfile, getAvailableApis, selectApi, deselectApi, getBalance };
const { callApi, getUserHistory, getAllHistory } = require("./sandbox.service");
const asyncHandler = require("../../utils/asyncHandler");
const STATUS       = require("../../utils/statusCodes");

// ── API Call ──
const callApiHandler = asyncHandler(async (req, res) => {
  const { userId, apiId, requestBody, headers } = req.body; // ← headers add

  if (!userId || !apiId) {
    return res.status(STATUS.BAD_REQUEST).json({
      success: false,
      message: "userId and apiId required",
    });
  }

  const data = await callApi({ userId, apiId, requestBody, headers }); // ← headers pass
  return res.status(STATUS.OK).json({
    success: true,
    message: "API call successful",
    data,
  });
});

// ── History — Customer ──
const getUserHistoryHandler = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const history = await getUserHistory(userId);
  return res.status(STATUS.OK).json({
    success: true,
    message: "History fetched",
    count:   history.length,
    data:    history,
  });
});

// ── History — Admin ──
const getAllHistoryHandler = asyncHandler(async (req, res) => {
  const history = await getAllHistory();
  return res.status(STATUS.OK).json({
    success: true,
    message: "All history fetched",
    count:   history.length,
    data:    history,
  });
});

module.exports = { callApiHandler, getUserHistoryHandler, getAllHistoryHandler };
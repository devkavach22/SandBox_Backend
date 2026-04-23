const { callApi, getUserHistory, getAllHistory } = require("./sandbox.service");
const asyncHandler = require("../../utils/asyncHandler");
const STATUS       = require("../../utils/statusCodes");
const multer       = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

const callApiHandler = [
    upload.any(),

    asyncHandler(async (req, res) => {
        const userId      = req.body.userId;
        const apiId       = req.body.apiId;
        const urlOverride = req.body.urlOverride || null;
        const headers     = req.body.headers
            ? (typeof req.body.headers === "string" ? JSON.parse(req.body.headers) : req.body.headers)
            : {};
        const isFormData  = req.files && req.files.length > 0;

        if (!userId || !apiId) {
            return res.status(STATUS.BAD_REQUEST).json({
                success: false,
                message: "userId and apiId required",
            });
        }

        let requestBody;

        if (isFormData) {
            const FormData = require("form-data");
            const fd = new FormData();

            req.files.forEach((f) => {
                fd.append(f.fieldname, f.buffer, {
                    filename:    f.originalname,
                    contentType: f.mimetype,
                });
            });

            Object.entries(req.body).forEach(([k, v]) => {
                if (!["userId", "apiId", "headers", "urlOverride"].includes(k)) {
                    fd.append(k, v);
                }
            });

            requestBody = fd;
            Object.assign(headers, fd.getHeaders());
        } else {
            requestBody = req.body.requestBody || null;
        }

        const data = await callApi({ userId, apiId, requestBody, headers, isFormData, urlOverride });

        return res.status(STATUS.OK).json({
            success: true,
            message: "API call successful",
            data,
        });
    }),
];

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
const express  = require("express");
const multer   = require("multer");
const path     = require("path");
const fs       = require("fs");

const {
  getAllApisHandler,
  getEnabledApisHandler,
  createApiHandler,
  updateApiHandler,
  deleteApiHandler,
  toggleApiHandler,
  getStatsHandler,
} = require("./api.controller");

const router         = express.Router();
const validateClient = require("../../utils/validateClient");

// ── Uploads folder auto-create ──
const uploadDir = path.join(__dirname, "../../../uploads/apis");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ── Multer config ──
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
});

// ── Routes ──
router.get("/stats",           validateClient,                           getStatsHandler);
router.get("/all",             validateClient,                           getAllApisHandler);
router.get("/",                validateClient,                           getEnabledApisHandler);
router.post("/",               validateClient, upload.array("attachments"), createApiHandler);
router.put("/:id",             validateClient, upload.array("attachments"), updateApiHandler);
router.delete("/:id",          validateClient,                           deleteApiHandler);
router.patch("/:id/toggle",    validateClient,                           toggleApiHandler);

module.exports = router;
const express = require("express");
const {
  getAllApisHandler,
  getEnabledApisHandler,
  createApiHandler,
  updateApiHandler,
  deleteApiHandler,
  toggleApiHandler,
  getStatsHandler,
} = require("./api.controller");

const router = express.Router();

router.get("/stats",        getStatsHandler);         // Admin stats
router.get("/all",          getAllApisHandler);        // Sab APIs
router.post("/",            createApiHandler);         // API add
router.put("/:id",          updateApiHandler);         // API edit
router.delete("/:id",       deleteApiHandler);         // API delete
router.patch("/:id/toggle", toggleApiHandler);         // Enable/Disable
router.get("/",             getEnabledApisHandler);    // Sirf enabled

module.exports = router;
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
const validateClient = require("../../utils/validateClient");

router.get("/stats",  validateClient,      getStatsHandler);         // Admin stats
router.get("/all",    validateClient,      getAllApisHandler);        // Sab APIs
router.post("/",    validateClient,        createApiHandler);         // API add
router.put("/:id",  validateClient,        updateApiHandler);         // API edit
router.delete("/:id",   validateClient,    deleteApiHandler);         // API delete
router.patch("/:id/toggle",validateClient, toggleApiHandler);         // Enable/Disable
router.get("/",    validateClient,         getEnabledApisHandler);    // Sirf enabled

module.exports = router;
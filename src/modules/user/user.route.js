const express = require("express");
const {
  getProfileHandler,
  updateProfileHandler,
  getAvailableApisHandler,
  selectApiHandler,
  deselectApiHandler,
  getBalanceHandler,
  getAllCustomersHandler,
} = require("./user.controller");

const router = express.Router();

router.get("/all",             getAllCustomersHandler);  // Sab customers — Admin
router.get("/profile/:userId", getProfileHandler);       // Profile dekho
router.put("/profile/:userId", updateProfileHandler);    // Profile update
router.get("/available-apis",  getAvailableApisHandler); // Available APIs
router.post("/select-api",     selectApiHandler);        // API select

router.delete("/deselect-api", deselectApiHandler);      // API deselect
router.get("/balance/:userId", getBalanceHandler);       // Balance

module.exports = router;

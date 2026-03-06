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

const validateClient = require("../../utils/validateClient");

const router = express.Router();
router.get("/all",    validateClient,getAllCustomersHandler);  

router.get("/profile/:userId",validateClient, getProfileHandler);       
router.put("/profile/:userId",validateClient, updateProfileHandler);    
router.get("/available-apis", validateClient, getAvailableApisHandler); // Available APIs
router.post("/select-api", validateClient,    selectApiHandler);        // API select

router.delete("/deselect-api",validateClient, deselectApiHandler);      // API deselect
router.get("/balance/:userId",validateClient, getBalanceHandler);       // Balance

module.exports = router;

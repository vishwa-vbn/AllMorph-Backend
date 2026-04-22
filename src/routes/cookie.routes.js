const express = require("express");

const {
  storeConsentHandler,
  getAllConsentsHandler,
  getConsentByIdHandler,
  deleteConsentHandler,
  getConsentCountHandler,
} = require("../controllers/cookie.controller");

const {
  isAuthenticated,
  isAdmin,
  optionalAuthenticated,
} = require("../middleware/auth");

const router = express.Router();

/* PUBLIC */

router.post("/consent", optionalAuthenticated, storeConsentHandler);

/* ADMIN */

router.get("/consents", isAuthenticated, isAdmin, getAllConsentsHandler);

router.get("/consents/count", isAuthenticated, isAdmin, getConsentCountHandler);

router.get("/consents/:id", isAuthenticated, isAdmin, getConsentByIdHandler);

router.delete("/consents/:id", isAuthenticated, isAdmin, deleteConsentHandler);

module.exports = router;

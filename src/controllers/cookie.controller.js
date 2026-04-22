const cookieModel = require("../models/cookie.model");
const { successResponse, errorResponse } = require("../utils/response");

async function storeConsentHandler(req, res) {
  try {
    const { consent_given, preferences } = req.body;

    const finalConsent =
      consent_given !== undefined
        ? consent_given
        : preferences
          ? preferences.analytics || preferences.marketing
          : true;

    const data = {
      user_id: req.user ? req.user.id : null,
      ip_address:
        req.ip ||
        req.headers["x-forwarded-for"] ||
        req.connection.remoteAddress,
      consent_given: finalConsent,
      preferences: preferences || {},
      user_agent: req.headers["user-agent"] || null,
    };

    const consent = await cookieModel.storeConsent(data);

    return successResponse(res, 201, "Consent stored successfully", consent);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}

async function getAllConsentsHandler(req, res) {
  try {
    const consents = await cookieModel.getAllConsents();
    return successResponse(
      res,
      200,
      "Consents retrieved successfully",
      consents,
    );
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}

async function getConsentByIdHandler(req, res) {
  try {
    const id = parseInt(req.params.id, 10);

    const consent = await cookieModel.getConsentById(id);

    if (!consent) return errorResponse(res, 404, "Consent record not found");

    return successResponse(res, 200, "Consent retrieved successfully", consent);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}

async function deleteConsentHandler(req, res) {
  try {
    const id = parseInt(req.params.id, 10);

    const deletedConsent = await cookieModel.deleteConsent(id);

    if (!deletedConsent)
      return errorResponse(res, 404, "Consent record not found");

    return successResponse(
      res,
      200,
      "Consent deleted successfully",
      deletedConsent,
    );
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}

async function getConsentCountHandler(req, res) {
  try {
    const count = await cookieModel.getConsentCount();
    return successResponse(res, 200, "Consent count retrieved successfully", {
      count,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}

module.exports = {
  storeConsentHandler,
  getAllConsentsHandler,
  getConsentByIdHandler,
  deleteConsentHandler,
  getConsentCountHandler,
};

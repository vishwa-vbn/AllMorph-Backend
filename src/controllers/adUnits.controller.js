const { AdSettings } = require("../models/adUnits.model");
const { successResponse, errorResponse } = require("../utils/response");

const getAdSettings = async (req, res) => {
  try {
    const adSettings = await AdSettings.getAdSettings();
    return successResponse(
      res,
      200,
      "Ad settings retrieved successfully",
      adSettings
    );
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

const upsertAdSettings = async (req, res) => {
  try {
    const { ad_density, ad_format, target_pages, providers } = req.body;

    // Basic validation
    if (!ad_density || !ad_format || !target_pages) {
      return errorResponse(res, 400, "ad_density, ad_format, and target_pages are required");
    }

    const validDensities = ["low", "balanced", "high"];
    if (!validDensities.includes(ad_density)) {
      return errorResponse(
        res,
        400,
        `ad_density must be one of: ${validDensities.join(", ")}`
      );
    }

    const validFormats = ["banner", "responsive", "native"];
    if (!validFormats.includes(ad_format)) {
      return errorResponse(
        res,
        400,
        `ad_format must be one of: ${validFormats.join(", ")}`
      );
    }

    const validTargetPages = ["all", "home", "posts", "custom"];
    if (!validTargetPages.includes(target_pages)) {
      return errorResponse(
        res,
        400,
        `target_pages must be one of: ${validTargetPages.join(", ")}`
      );
    }

    const updated = await AdSettings.upsertAdSettings({
      ad_density,
      ad_format,
      target_pages,
      providers,
    });

    return successResponse(
      res,
      200,
      "Ad settings updated successfully",
      updated
    );
  } catch (error) {
    console.error("Error in upsertAdSettings:", error.message);
    return errorResponse(res, 500, error.message);
  }
};

module.exports = {
  getAdSettings,
  upsertAdSettings,
};
const crypto = require("crypto");

/**
 * Custom CSRF protection middleware.
 * Implements the Double Submit Cookie pattern.
 */
const csrfProtection = (req, res, next) => {
  const isProduction = process.env.NODE_ENV === "production";
  const COOKIE_NAME = "ALLMORPH_XSRF_TOKEN";
  
  // 1. Double Submit Cookie Logic
  let csrfToken = req.cookies?.[COOKIE_NAME];
  let isNewToken = false;

  if (!csrfToken) {
    csrfToken = crypto.randomBytes(32).toString("hex");
    isNewToken = true;
    res.cookie(COOKIE_NAME, csrfToken, {
      httpOnly: false,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, 
      path: "/",
    });
  }

  // 🔥 EXPOSE THE TOKEN IN A HEADER
  res.setHeader("X-CSRF-Token", csrfToken);

  const safeMethods = ["GET", "HEAD", "OPTIONS"];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  const path = req.originalUrl.split("?")[0];
  const exemptPaths = [
    "/api/users/login",
    "/api/users/register",
    "/api/users/forgot-password",
    "/api/users/reset-password",
    "/api/users/refresh-token",
    "/api/newsletter/subscribe",
    "/api/contact/send",
  ];

  const isExempt = exemptPaths.some(p => path === p || path.startsWith(p + "/"));
  const isPublicView = path.startsWith("/api/posts/view/");

  if (isExempt || isPublicView) {
    return next();
  }

  if (isNewToken) {
    return next();
  }

  // 4. Verify the token
  const headerToken = req.headers["x-xsrf-token"] || req.headers["x-csrf-token"] || req.headers["xsrf-token"];

  if (!headerToken || headerToken !== csrfToken) {
    // Generate a NEW token to force a reset
    const resetToken = crypto.randomBytes(32).toString("hex");
    res.cookie(COOKIE_NAME, resetToken, {
      httpOnly: false,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
    });
    res.setHeader("X-CSRF-Token", resetToken);

    console.warn(`[CSRF MISMATCH] Path: ${path} | Cookie: ${csrfToken ? "Present" : "Missing"} | Header: ${headerToken ? "Present" : "Missing"}`);

    return res.status(403).json({
      success: false,
      message: "CSRF token mismatch or missing. A fresh token has been issued, please try again.",
      retry: true 
    });
  }

  next();
};

module.exports = csrfProtection;

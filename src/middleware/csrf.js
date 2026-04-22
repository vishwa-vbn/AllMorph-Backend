const crypto = require("crypto");

/**
 * Custom CSRF protection middleware.
 * Implements the Double Submit Cookie pattern.
 */
const csrfProtection = (req, res, next) => {
  try {
    const isProduction = process.env.NODE_ENV === "production";

    // 1. Skip verification for safe methods IMMEDIATELY (GET, HEAD, OPTIONS)
    const safeMethods = ["GET", "HEAD", "OPTIONS"];
    if (safeMethods.includes(req.method)) {
      // Still set the header so the client can capture it for future POSTs
      const currentToken = req.cookies?.["XSRF-TOKEN"];
      if (currentToken) res.setHeader("X-CSRF-Token", currentToken);
      return next();
    }

    // 2. Double Submit Cookie Logic
    let csrfToken = req.cookies?.["XSRF-TOKEN"];
    let isNewToken = false;

    if (!csrfToken) {
      csrfToken = crypto.randomBytes(32).toString("hex");
      isNewToken = true;
      res.cookie("XSRF-TOKEN", csrfToken, {
        httpOnly: false,
        secure: isProduction || req.secure || req.headers["x-forwarded-proto"] === "https",
        sameSite: (isProduction || req.headers["x-forwarded-proto"] === "https") ? "none" : "lax",
        maxAge: 24 * 60 * 60 * 1000,
        path: "/",
      });
    }

    // Expose token for the frontend to pick up
    res.setHeader("X-CSRF-Token", csrfToken);

    // 3. Skip verification for public/exempt endpoints
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

    if (isExempt || isPublicView || isNewToken) {
      return next();
    }

    // 4. Verify the token for state-changing methods
    const headerToken = req.headers["x-xsrf-token"] || req.headers["x-csrf-token"] || req.headers["xsrf-token"];

    if (!headerToken || headerToken !== csrfToken) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      res.cookie("XSRF-TOKEN", resetToken, {
        httpOnly: false,
        secure: isProduction || req.secure || req.headers["x-forwarded-proto"] === "https",
        sameSite: (isProduction || req.headers["x-forwarded-proto"] === "https") ? "none" : "lax",
        maxAge: 24 * 60 * 60 * 1000,
        path: "/",
      });
      res.setHeader("X-CSRF-Token", resetToken);

      return res.status(403).json({
        success: false,
        message: "CSRF token mismatch. A fresh token has been issued.",
        newToken: resetToken,
        retry: true
      });
    }

    next();
  } catch (error) {
    console.error("CSRF Middleware Error:", error);
    // On error, let the request through but log it, or fail gracefully
    next(); 
  }
};

module.exports = csrfProtection;

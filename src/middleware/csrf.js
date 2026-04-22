const crypto = require("crypto");

/**
 * Custom CSRF protection middleware.
 * Implements the Double Submit Cookie pattern.
 */
const csrfProtection = (req, res, next) => {
  // 1. Generate a CSRF token if it doesn't exist in the session/cookies
  // For simplicity, we'll generate one and set it in a non-HttpOnly cookie
  // so the frontend can read it and send it back in a header.
  
  let csrfToken = req.cookies?.["XSRF-TOKEN"];

  if (!csrfToken) {
    csrfToken = crypto.randomBytes(32).toString("hex");
    res.cookie("XSRF-TOKEN", csrfToken, {
      httpOnly: false, // Must be readable by frontend JS
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });
  }

  // 2. Skip verification for safe methods OR public non-sensitive endpoints
  const safeMethods = ["GET", "HEAD", "OPTIONS"];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // Exempt routes that are public entry points or non-sensitive interactions
  const exemptPaths = [
    "/api/users/login",
    "/api/users/register",
    "/api/users/forgot-password",
    "/api/users/reset-password",
    "/api/users/refresh-token",
    "/api/newsletter/subscribe",
    "/api/contact/send",
  ];

  if (exemptPaths.includes(req.path) || req.path.startsWith("/api/posts/view/")) {
    return next();
  }

  // 3. Verify the token for state-changing methods
  const headerToken = req.headers["x-xsrf-token"];

  if (!headerToken || headerToken !== csrfToken) {
    return res.status(403).json({
      success: false,
      message: "Invalid or missing CSRF token",
    });
  }

  next();
};

module.exports = csrfProtection;

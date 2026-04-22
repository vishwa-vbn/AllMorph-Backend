const crypto = require("crypto");

/**
 * Custom CSRF protection middleware.
 * Implements the Double Submit Cookie pattern.
 */
const csrfProtection = (req, res, next) => {
  const isProduction = process.env.NODE_ENV === "production";
  
  // 1. Double Submit Cookie Logic
  let csrfToken = req.cookies?.["XSRF-TOKEN"];
  let isNewToken = false;

  if (!csrfToken) {
    csrfToken = crypto.randomBytes(32).toString("hex");
    isNewToken = true;
    res.cookie("XSRF-TOKEN", csrfToken, {
      httpOnly: false, // Accessible by frontend JS in same-site, but maybe not cross-site
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, 
      path: "/",
    });
  }

  // 🔥 EXPOSE THE TOKEN IN A HEADER (Crucial for Vercel cross-origin)
  // Frontend can read this header if Exposed-Headers is set in CORS
  res.setHeader("X-CSRF-Token", csrfToken);

  // 2. Skip verification for safe methods (GET, HEAD, OPTIONS)
  const safeMethods = ["GET", "HEAD", "OPTIONS"];
  if (safeMethods.includes(req.method)) {
    return next();
  }

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

  if (isExempt || isPublicView) {
    return next();
  }

  if (isNewToken) {
    return next();
  }

  // 4. Verify the token for state-changing methods
  // We check multiple common header names (case-insensitive in Express)
  const headerToken = req.headers["x-xsrf-token"] || req.headers["x-csrf-token"] || req.headers["xsrf-token"];

  if (!headerToken || headerToken !== csrfToken) {
    // Generate a NEW token to force a reset on the client side for the next attempt
    const resetToken = crypto.randomBytes(32).toString("hex");
    res.cookie("XSRF-TOKEN", resetToken, {
      httpOnly: false,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
    });
    res.setHeader("X-CSRF-Token", resetToken);

    if (!isProduction || process.env.DEBUG_CSRF === "true") {
      console.warn(`[CSRF FAILURE] ${req.method} ${path}`);
      console.warn(`- Expected (Cookie): ${csrfToken}`);
      console.warn(`- Received (Header): ${headerToken || "MISSING"}`);
      console.warn(`- Action: Token reset sent in 403 response.`);
    }

    return res.status(403).json({
      success: false,
      message: "CSRF token mismatch or missing. A fresh token has been issued, please try again.",
      details: !isProduction ? "Check server logs for token details." : undefined,
      retry: true // Hint to frontend to retry the action
    });
  }

  next();
};

module.exports = csrfProtection;

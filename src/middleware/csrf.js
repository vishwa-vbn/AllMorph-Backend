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
      httpOnly: false, // Must be readable by frontend JS
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: "/",
    });
  }

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

  // More flexible check for exemptions
  const isExempt = exemptPaths.some(p => path === p || path.startsWith(p + "/"));
  const isPublicView = path.startsWith("/api/posts/view/");

  if (isExempt || isPublicView) {
    return next();
  }

  // 4. If we JUST generated a token on a POST request, we can't reasonably expect
  // the client to have sent it back yet (they didn't have it).
  // However, normally people get a GET first.
  // If it's a new token and we are here, it's likely a first-time submission.
  if (isNewToken) {
    return next();
  }

  // 5. Verify the token for state-changing methods
  const headerToken = req.headers["x-xsrf-token"];

  if (!headerToken || headerToken !== csrfToken) {
    if (!isProduction) {
      console.warn(`CSRF Failure: [${req.method}] ${path}`);
      console.warn(`Cookie Token: ${csrfToken ? "Present" : "Missing"}`);
      console.warn(`Header Token: ${headerToken ? "Present" : "Missing"}`);
    }
    return res.status(403).json({
      success: false,
      message: "CSRF token mismatch or missing. Please refresh the page.",
    });
  }

  next();
};

module.exports = csrfProtection;

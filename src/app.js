// const express = require('express');
// const cors = require('cors');
// const cookieParser = require('cookie-parser');
// const csrfProtection = require('./middleware/csrf');
// const sanitizationMiddleware = require('./middleware/sanitization');
// require('dotenv').config();

// const app = express();
// const port = process.env.PORT || 3000;

// // CORS middleware
// app.use(
//   cors({
//     origin: [
//       'http://localhost:5173',
//       'https://yourblog.com',
//       'https://admin.free-subdomain.com',
//     ],
//     methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
//     credentials: true,
//   })
// );

// // Parse JSON and cookies
// app.use(express.json());
// app.use(cookieParser());

// // Sanitization (before routes and CSRF to be safe, though order with CSRF doesn't matter much)
// app.use(sanitizationMiddleware);

// // CSRF Protection
// app.use(csrfProtection);

// // Mount routes
// app.use('/api/users', require('./routes/user.routes'));
// app.use('/api/posts', require('./routes/post.routes'));
// app.use('/api/categories', require('./routes/category.routes'));
// app.use('/api/post-categories', require('./routes/postCategories.routes'));
// app.use('/api/tags', require('./routes/tags.routes'));
// app.use('/api/post-tags', require('./routes/postTags.routes'));
// app.use('/api/comments', require('./routes/comments.routes'));
// app.use('/api/ad-units', require('./routes/adUnits.routes'));
// app.use('/api/settings', require('./routes/settings.routes'));
// app.use("/api/imagekit", require("./routes/imageKit.routes"));
// app.use("/api/cloudinary",require("./routes/cloudinary.routes"))

// // Newly added routes
// app.use('/api/newsletter', require('./routes/newsletter.routes'));
// app.use('/api/contact', require('./routes/contact.routes'));
// app.use('/api/pages', require('./routes/page.routes'));
// app.use('/api/search', require('./routes/search.routes'));
// app.use('/api/likes', require('./routes/like.routes'));
// app.use('/api/bookmarks', require('./routes/bookmark.routes'));
// app.use('/api/cookies', require('./routes/cookie.routes'));
// app.use('/api/sitemap', require('./routes/sitemap.routes'));
// app.use("/api/dashboard", require("./routes/dashboard.routes"));

// // Health-check endpoint
// app.get('/', (req, res) => {
//   res.send('Backend API is running!');
// });

// // Start server
// app.listen(port, () => {
//   console.log(`Server listening on port ${port}`);
// });

// const express = require("express");
// const cors = require("cors");
// const cookieParser = require("cookie-parser");
// const helmet = require("helmet");
// const rateLimit = require("express-rate-limit");
// require("dotenv").config();

// // Custom middleware
// const csrfProtection = require("./middleware/csrf");
// const sanitizationMiddleware = require("./middleware/sanitization");

// const app = express();
// const port = process.env.PORT || 3000;

// // ─────────────────────────────────────────────────────────────
// // ✅ SECURITY HEADERS (HELMET)
// // ─────────────────────────────────────────────────────────────
// app.use(
//   helmet({
//     contentSecurityPolicy: {
//       directives: {
//         defaultSrc: ["'self'"],
//         scriptSrc: ["'self'", "'unsafe-inline'"],
//         styleSrc: ["'self'", "'unsafe-inline'"],
//         imgSrc: [
//           "'self'",
//           "data:",
//           "https://ik.imagekit.io",
//           "https://res.cloudinary.com",
//         ],
//         connectSrc: ["'self'"],
//       },
//     },
//   }),
// );

// // ─────────────────────────────────────────────────────────────
// // ✅ RATE LIMITING
// // ─────────────────────────────────────────────────────────────
// const generalLimiter = rateLimit({
//   windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
//   max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
//   message: { error: "Too many requests, please try again later." },
// });

// // Apply general limiter to all routes
// app.use("/api/", generalLimiter);

// // Stricter limiter for login/register
// const authLimiter = rateLimit({
//   windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
//   max: parseInt(process.env.RATE_LIMIT_LOGIN_MAX) || 10,
//   message: { error: "Too many login attempts, please try again after 15 minutes." },
// });
// app.use("/api/users/login", authLimiter);
// app.use("/api/users/register", authLimiter);

// // ─────────────────────────────────────────────────────────────
// // ✅ CORS CONFIG (CRITICAL FOR COOKIES)
// // ─────────────────────────────────────────────────────────────
// const frontendUrl = process.env.FRONT_END_URL
//   ? process.env.FRONT_END_URL.replace(/\/$/, "")
//   : "https://all-morph-git-main-vishwavbns-projects.vercel.app"; // Fallback if missing
// const allowedOrigins = [frontendUrl];

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       // Allow requests with no origin (like mobile apps or curl)
//       if (!origin) return callback(null, true);
//       if (allowedOrigins.indexOf(origin) !== -1) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//     credentials: true,
//   }),
// );

// // ─────────────────────────────────────────────────────────────
// // ✅ BODY + COOKIE PARSER
// // ─────────────────────────────────────────────────────────────
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());

// // ─────────────────────────────────────────────────────────────
// // ✅ SANITIZATION (before routes)
// // ─────────────────────────────────────────────────────────────
// app.use(sanitizationMiddleware);

// // ─────────────────────────────────────────────────────────────
// // ✅ CSRF PROTECTION (GLOBAL)
// // ─────────────────────────────────────────────────────────────
// app.use(csrfProtection);

// // ─────────────────────────────────────────────────────────────
// // ✅ ROUTES
// // ─────────────────────────────────────────────────────────────
// app.use("/api/users", require("./routes/user.routes"));
// app.use("/api/posts", require("./routes/post.routes"));
// app.use("/api/categories", require("./routes/category.routes"));
// app.use("/api/post-categories", require("./routes/postCategories.routes"));
// app.use("/api/tags", require("./routes/tags.routes"));
// app.use("/api/post-tags", require("./routes/postTags.routes"));
// app.use("/api/comments", require("./routes/comments.routes"));
// app.use("/api/ad-units", require("./routes/adUnits.routes"));
// app.use("/api/settings", require("./routes/settings.routes"));
// app.use("/api/imagekit", require("./routes/imageKit.routes"));
// app.use("/api/cloudinary", require("./routes/cloudinary.routes"));

// // Additional routes
// app.use("/api/newsletter", require("./routes/newsletter.routes"));
// app.use("/api/contact", require("./routes/contact.routes"));
// app.use("/api/pages", require("./routes/page.routes"));
// app.use("/api/search", require("./routes/search.routes"));
// app.use("/api/likes", require("./routes/like.routes"));
// app.use("/api/bookmarks", require("./routes/bookmark.routes"));
// app.use("/api/cookies", require("./routes/cookie.routes"));
// app.use("/api/sitemap", require("./routes/sitemap.routes"));
// app.use("/api/dashboard", require("./routes/dashboard.routes"));

// // ─────────────────────────────────────────────────────────────
// // ✅ HEALTH CHECK
// // ─────────────────────────────────────────────────────────────
// app.get("/", (req, res) => {
//   res.send("Backend API is running!");
// });

// // ─────────────────────────────────────────────────────────────
// // ✅ GLOBAL ERROR HANDLER
// // ─────────────────────────────────────────────────────────────
// app.use((err, req, res, next) => {
//   if (process.env.NODE_ENV !== "production") {
//     console.error("Global Error:", err);
//   }

//   if (err.code === "EBADCSRFTOKEN") {
//     return res.status(403).json({ error: "Invalid CSRF token" });
//   }

//   // Handle CORS errors specifically
//   if (err.message === "Not allowed by CORS") {
//     return res.status(403).json({ error: "CORS policy restriction" });
//   }

//   res.status(err.status || 500).json({
//     error: process.env.NODE_ENV === "production"
//       ? "An internal server error occurred"
//       : err.message
//   });
// });

// // ─────────────────────────────────────────────────────────────
// // ✅ START SERVER
// // ─────────────────────────────────────────────────────────────
// app.listen(port, () => {
//   console.log(`🚀 Server running on http://localhost:${port}`);
// });

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

// Custom middleware
const csrfProtection = require("./middleware/csrf");
const sanitizationMiddleware = require("./middleware/sanitization");

const app = express();
const port = process.env.PORT || 3000;

// ─────────────────────────────────────────────────────────────
// ✅ BUILD ALLOWED ORIGINS (Development + Production)
// ─────────────────────────────────────────────────────────────
const buildAllowedOrigins = () => {
  const origins = [];

  // Development: Allow all common localhost variants
  if (process.env.NODE_ENV !== "production") {
    origins.push(
      "http://localhost:3000", // Backend port
      "http://localhost:5173", // Vite default
      "http://localhost:5174", // Vite alternate
      "http://localhost:4173", // SvelteKit
      "http://localhost:8080", // Common dev port
      "http://127.0.0.1:3000",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
      "http://127.0.0.1:8080",
    );
  }

  // Production: Add frontend URL from env
  if (process.env.FRONT_END_URL) {
    origins.push(process.env.FRONT_END_URL.replace(/\/$/, ""));
  } else if (process.env.NODE_ENV === "production") {
    // Fallback for production if env var is missing
    origins.push("https://all-morph-git-main-vishwavbns-projects.vercel.app");
  }

  return origins;
};

const allowedOrigins = buildAllowedOrigins();
console.log("🔒 Allowed CORS Origins:", allowedOrigins);

// ─────────────────────────────────────────────────────────────
// ✅ SECURITY HEADERS (HELMET)
// ─────────────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: [
          "'self'",
          "data:",
          "https://ik.imagekit.io",
          "https://res.cloudinary.com",
        ],
        connectSrc: ["'self'"],
      },
    },
  }),
);

// ─────────────────────────────────────────────────────────────
// ✅ RATE LIMITING
// ─────────────────────────────────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: { error: "Too many requests, please try again later." },
  skip: (req) => process.env.NODE_ENV !== "production", // Skip in development
});

// Apply general limiter to all routes
app.use("/api/", generalLimiter);

// Stricter limiter for login/register
const authLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_LOGIN_MAX) || 10,
  message: {
    error: "Too many login attempts, please try again after 15 minutes.",
  },
  skip: (req) => process.env.NODE_ENV !== "production", // Skip in development
});
app.use("/api/users/login", authLimiter);
app.use("/api/users/register", authLimiter);

// ─────────────────────────────────────────────────────────────
// ✅ CORS CONFIG (CRITICAL FOR COOKIES)
// ─────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);

      // Allow Vercel preview deployments dynamically
      const isVercelPreview = origin && origin.match(/^https:\/\/all-morph.*\.vercel\.app$/);

      if (allowedOrigins.includes(origin) || isVercelPreview) {
        callback(null, true);
      } else {
        console.warn(`❌ CORS blocked request from origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "X-CSRF-Token", // Uppercase variant
      "x-xsrf-token", // Lowercase variant (axios default)
      "X-XSRF-TOKEN", // All uppercase variant
    ],
  }),
);

// ─────────────────────────────────────────────────────────────
// ✅ BODY + COOKIE PARSER
// ─────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─────────────────────────────────────────────────────────────
// ✅ SANITIZATION (before routes)
// ─────────────────────────────────────────────────────────────
app.use(sanitizationMiddleware);

// ─────────────────────────────────────────────────────────────
// ✅ CSRF PROTECTION (GLOBAL)
// ─────────────────────────────────────────────────────────────
app.use(csrfProtection);

// ─────────────────────────────────────────────────────────────
// ✅ ROUTES
// ─────────────────────────────────────────────────────────────
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/posts", require("./routes/post.routes"));
app.use("/api/categories", require("./routes/category.routes"));
app.use("/api/post-categories", require("./routes/postCategories.routes"));
app.use("/api/tags", require("./routes/tags.routes"));
app.use("/api/post-tags", require("./routes/postTags.routes"));
app.use("/api/comments", require("./routes/comments.routes"));
app.use("/api/ad-units", require("./routes/adUnits.routes"));
app.use("/api/settings", require("./routes/settings.routes"));
app.use("/api/imagekit", require("./routes/imageKit.routes"));
app.use("/api/cloudinary", require("./routes/cloudinary.routes"));

// Additional routes
app.use("/api/newsletter", require("./routes/newsletter.routes"));
app.use("/api/contact", require("./routes/contact.routes"));
app.use("/api/pages", require("./routes/page.routes"));
app.use("/api/search", require("./routes/search.routes"));
app.use("/api/likes", require("./routes/like.routes"));
app.use("/api/bookmarks", require("./routes/bookmark.routes"));
app.use("/api/cookies", require("./routes/cookie.routes"));
app.use("/api/sitemap", require("./routes/sitemap.routes"));
app.use("/api/dashboard", require("./routes/dashboard.routes"));

// ─────────────────────────────────────────────────────────────
// ✅ HEALTH CHECK
// ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.send("Backend API is running!");
});

// ─────────────────────────────────────────────────────────────
// ✅ GLOBAL ERROR HANDLER
// ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  if (process.env.NODE_ENV !== "production") {
    console.error("❌ Global Error:", err);
  }

  if (err.code === "EBADCSRFTOKEN") {
    return res.status(403).json({ error: "Invalid CSRF token" });
  }

  // Handle CORS errors specifically
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ error: "CORS policy restriction" });
  }

  res.status(err.status || 500).json({
    error:
      process.env.NODE_ENV === "production"
        ? "An internal server error occurred"
        : err.message,
  });
});

// ─────────────────────────────────────────────────────────────
// ✅ START SERVER
// ─────────────────────────────────────────────────────────────
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  if (process.env.NODE_ENV !== "production") {
    console.log("📝 Development mode: Rate limiting disabled");
  }
});
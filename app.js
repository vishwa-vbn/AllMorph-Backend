// const express = require("express");
// const cors = require("cors");
// require("dotenv").config();

// const app = express();
// const port = process.env.PORT || 3000;

// const corsOptions = {
//   origin: "http://localhost:5173",
//   credentials: true, // important if using cookies/auth
// };

// app.use(cors(corsOptions));
// app.options("*", cors(corsOptions));
// // Allow all CORS requests
// app.use(cors());

// app.options("*", cors()); // Optional, handles preflight requests

// // Middleware
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Mount routes
// app.use("/api/users", require("./routes/user.routes"));
// app.use("/api/posts", require("./routes/post.routes"));
// app.use("/api/categories", require("./routes/category.routes"));
// app.use("/api/post-categories", require("./routes/postCategories.routes"));
// app.use("/api/tags", require("./routes/tags.routes"));
// app.use("/api/post-tags", require("./routes/postTags.routes"));
// app.use("/api/comments", require("./routes/comments.routes"));
// app.use("/api/ad-units", require("./routes/adUnits.routes"));
// app.use("/api/settings", require("./routes/settings.routes"));

// // Start the server
// app.listen(port, () => {
//   console.log(`Server listening on port ${port}`);
// });

// // Export the app for Vercel deployment
// module.exports = app;

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

/* ================= CORS CONFIG (STRICT + COOKIES) ================= */
const frontendUrl = process.env.FRONT_END_URL 
  ? process.env.FRONT_END_URL.replace(/\/$/, "")
  : "https://all-morph.vercel.app";
const allowedOrigins = [frontendUrl, "http://localhost:5173"];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps / curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // 🔥 REQUIRED for cookies
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
  }),
);

/* 🔥 HANDLE PREFLIGHT PROPERLY */
app.options(
  "*",
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

/* ================= MIDDLEWARE ================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================= ROUTES ================= */
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/posts", require("./routes/post.routes"));
app.use("/api/categories", require("./routes/category.routes"));
app.use("/api/post-categories", require("./routes/postCategories.routes"));
app.use("/api/tags", require("./routes/tags.routes"));
app.use("/api/post-tags", require("./routes/postTags.routes"));
app.use("/api/comments", require("./routes/comments.routes"));
app.use("/api/ad-units", require("./routes/adUnits.routes"));
app.use("/api/settings", require("./routes/settings.routes"));

/* ================= START SERVER ================= */
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

module.exports = app;
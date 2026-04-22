// const jwt = require("jsonwebtoken");

// const isAuthenticated = (req, res, next) => {
//   const token = req.header("Authorization");
//   if (!token) return res.status(401).json({ error: "Access denied, no token provided" });

//   try {
//     const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     res.status(401).json({ error: "Invalid token" });
//   }
// };

// const isAdmin = (req, res, next) => {
//   console.log("req inside categories",req.user)
//   if (req.user && req.user.role === "admin") {
//     next();
//   } else {
//     res.status(403).json({ error: "Access denied, admin only" });
//   }
// };

// const optionalAuthenticated = (req, res, next) => {
//   const token = req.header("Authorization");
//   if (!token) return next();

//   try {
//     const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     next(); // Treat as guest if token is invalid
//   }
// };

// module.exports = { isAuthenticated, isAdmin, optionalAuthenticated };


const jwt = require("jsonwebtoken");

const isAuthenticated = (req, res, next) => {
  let token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
  
  // Guard against stringified null/undefined from frontend
  if (token === "undefined" || token === "null") {
    token = null;
  }

  if (!token)
    return res
      .status(401)
      .json({ error: "Access denied, no token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT Verification Error:", err.message);
    res.status(401).json({ error: "Invalid token" });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ error: "Access denied, admin only" });
  }
};

const optionalAuthenticated = (req, res, next) => {
  try {
    let token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    
    if (token === "undefined" || token === "null") {
      token = null;
    }

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    req.user = null;
    next(); // Treat as guest if token is invalid
  }
};

module.exports = { isAuthenticated, isAdmin, optionalAuthenticated };


// const express = require("express");
// const {
//   createUserHandler,
//   createAdminHandler,
//   loginUserHandler,
//   resetPasswordHandler,
//   forgotPasswordHandler,
//   getMeHandler,
//   updateProfileHandler,
//   getUserLikesHandler,
//   getUserBookmarksHandler,
//   getAllUsersHandler,
//   updateUserHandler,        // New
//   deleteUserHandler,        // New
//   bulkDeleteUsersHandler,
//   getUserWithPermissionsHandler,
//   refreshTokenHandler,
// } = require("../controllers/user.controller");

// const { isAuthenticated, isAdmin,optionalAuthenticated } = require("../middleware/auth");
// const router = express.Router();

// router.post("/register", createUserHandler);
// router.post("/forgot-password", forgotPasswordHandler);
// router.post("/reset-password", resetPasswordHandler);

// router.post("/register/admin", createAdminHandler);
// router.post("/login", loginUserHandler);
// router.post("/refresh-token", refreshTokenHandler); // Add this
// router.get("/", isAuthenticated, isAdmin, getAllUsersHandler);
// router.get("/data/:id", isAuthenticated, getUserWithPermissionsHandler);


// router.get("/me", isAuthenticated, getMeHandler);
// router.put("/me", isAuthenticated, updateProfileHandler);
// router.get("/me/likes", isAuthenticated, getUserLikesHandler);
// router.get("/me/bookmarks", isAuthenticated, getUserBookmarksHandler);

// router.put("/:id", isAuthenticated, isAdmin, updateUserHandler);         // Update user
// router.delete("/:id", isAuthenticated, isAdmin, deleteUserHandler);      // Delete single user
// router.post("/bulk-delete", isAuthenticated, isAdmin, bulkDeleteUsersHandler);

// module.exports = router;

const express = require("express");
const {
  createUserHandler,
  createAdminHandler,
  loginUserHandler,
  resetPasswordHandler,
  forgotPasswordHandler,
  getMeHandler,
  updateProfileHandler,
  getUserLikesHandler,
  getUserBookmarksHandler,
  getAllUsersHandler,
  updateUserHandler,
  deleteUserHandler,
  bulkDeleteUsersHandler,
  getUserWithPermissionsHandler,
  refreshTokenHandler,
  logoutUserHandler,
} = require("../controllers/user.controller");

const {
  isAuthenticated,
  isAdmin,
  optionalAuthenticated,
} = require("../middleware/auth");
const router = express.Router();

// ─── Public Routes ──────────────────────────────────────────────────────────
router.post("/register", createUserHandler);
router.post("/login", loginUserHandler);
router.post("/forgot-password", forgotPasswordHandler);
router.post("/reset-password", resetPasswordHandler);
router.post("/refresh-token", refreshTokenHandler);
router.post("/logout", isAuthenticated, logoutUserHandler);

// ─── FIX: /register/admin is now protected — only an existing admin can create another admin
router.post("/register/admin", isAuthenticated, isAdmin, createAdminHandler);

// ─── Authenticated User Routes (but /me is optional for initial check) ───────────
router.get("/me", optionalAuthenticated, getMeHandler);
router.put("/me", isAuthenticated, updateProfileHandler);
router.get("/me/likes", isAuthenticated, getUserLikesHandler);
router.get("/me/bookmarks", isAuthenticated, getUserBookmarksHandler);

// ─── Admin-Only Routes ───────────────────────────────────────────────────────
router.get("/", isAuthenticated, isAdmin, getAllUsersHandler);
router.get("/data/:id", isAuthenticated, getUserWithPermissionsHandler);
router.put("/:id", isAuthenticated, isAdmin, updateUserHandler);
router.delete("/:id", isAuthenticated, isAdmin, deleteUserHandler);
router.post("/bulk-delete", isAuthenticated, isAdmin, bulkDeleteUsersHandler);

module.exports = router;



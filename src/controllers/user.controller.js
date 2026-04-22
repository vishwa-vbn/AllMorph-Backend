const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const ImageKit = require("imagekit");
const multer = require("multer");

// ─── ImageKit Setup ───────────────────────────────────────────────────────────
const imageKitConfig = {
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
};

if (!imageKitConfig.publicKey || !imageKitConfig.privateKey || !imageKitConfig.urlEndpoint) {
  console.error("ImageKit configuration is incomplete. Please check environment variables.");
}

const imageKit = new ImageKit(imageKitConfig);

// ─── Multer Setup ─────────────────────────────────────────────────────────────
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (!file) return cb(null, false);
    const allowedTypes = ["image/jpeg", "image/png"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG and PNG are allowed."));
    }
  },
}).single("avatar");

// ─── Nodemailer Setup ─────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_SERVER,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// HANDLERS
// ─────────────────────────────────────────────────────────────────────────────

const registerUserHandler = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) return res.status(400).json({ error: err.message });
      let userData = { ...req.body };
      if (req.file) {
        try {
          const uploadResponse = await imageKit.upload({
            file: req.file.buffer,
            fileName: `user_${Date.now()}_${req.file.originalname}`,
            folder: "/user_avatars",
          });
          userData.avatar = uploadResponse.url;
          userData.file_id = uploadResponse.fileId;
        } catch (e) {
          userData.avatar_upload_error = e.message;
        }
      }
      const newUser = await userModel.createUser(userData);
      res.status(201).json(newUser);
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const createUserHandler = registerUserHandler; // Alias

const createAdminHandler = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) return res.status(400).json({ error: err.message });
      let adminData = { ...req.body };
      if (req.file) {
        try {
          const uploadResponse = await imageKit.upload({
            file: req.file.buffer,
            fileName: `admin_${Date.now()}_${req.file.originalname}`,
            folder: "/user_avatars",
          });
          adminData.avatar = uploadResponse.url;
          adminData.file_id = uploadResponse.fileId;
        } catch (e) {
          adminData.avatar_upload_error = e.message;
        }
      }
      const newAdmin = await userModel.createAdmin(adminData);
      res.status(201).json(newAdmin);
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Internal server error" });
  }
};

const loginUserHandler = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.loginUser({ email, password });
    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    const permissions = await userModel.getPermissionsByRoleId(user.roleid);
    const accessToken = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
    const refreshToken = jwt.sign({ userId: user.id, role: user.role }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };

    res.cookie("accessToken", accessToken, { ...cookieOptions, maxAge: 1 * 60 * 60 * 1000 });
    res.cookie("refreshToken", refreshToken, cookieOptions);

    res.json({ message: "Login successful", user, permissions });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const refreshTokenHandler = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
    if (!refreshToken) return res.status(401).json({ error: "Refresh token is required" });

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ error: "Invalid or expired refresh token" });
      const accessToken = jwt.sign({ userId: decoded.userId, role: decoded.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        maxAge: 1 * 60 * 60 * 1000,
      });
      res.json({ accessToken });
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const logoutUserHandler = async (req, res) => {
  try {
    const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "Lax" };
    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);
    res.json({ message: "User logged out successfully" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const forgotPasswordHandler = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userModel.getUserByEmail(email);
    if (!user) return res.status(404).json({ error: "User not found" });

    const resetToken = await userModel.generateResetToken(user.id);
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: user.email,
      subject: "🔐 Reset Your Password",
      html: `<p>Hello ${user.name}, click <a href="${resetLink}">here</a> to reset your password. Link expires in 24h.</p>`,
    });
    res.json({ message: "Password reset link sent to your email." });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const resetPasswordHandler = async (req, res) => {
  try {
    const { token } = req.query;
    const { newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: "Missing token or password" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await userModel.updatePassword(decoded.userId, newPassword);
    res.json({ message: "Password successfully updated" });
  } catch (err) {
    res.status(400).json({ error: "Invalid or expired token" });
  }
};

const getAllUsersHandler = async (req, res) => {
  try {
    const users = await userModel.getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const getUsers = getAllUsersHandler;

const updateUserHandler = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) return res.status(400).json({ error: err.message });
      const { id } = req.params;
      const existingUser = await userModel.getUserById(id);
      if (!existingUser) return res.status(404).json({ error: "User not found" });

      let userData = { ...req.body };
      if (req.file) {
        if (existingUser.file_id) await imageKit.deleteFile(existingUser.file_id).catch(() => {});
        const uploadResponse = await imageKit.upload({
          file: req.file.buffer,
          fileName: `user_${Date.now()}_${req.file.originalname}`,
          folder: "/user_avatars",
        });
        userData.avatar = uploadResponse.url;
        userData.file_id = uploadResponse.fileId;
      }
      const updatedUser = await userModel.updateUser(id, userData);
      res.json(updatedUser);
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateUserById = updateUserHandler;

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.getUserById(id);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.file_id) await imageKit.deleteFile(user.file_id).catch(() => {});
    await userModel.deleteUser(id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const bulkDeleteUsers = async (req, res) => {
  try {
    const { userIds } = req.body;
    const users = await userModel.getUsersByIds(userIds);
    for (const u of users) if (u.file_id) await imageKit.deleteFile(u.file_id).catch(() => {});
    await userModel.bulkDeleteUsers(userIds);
    res.json({ message: "Users deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await userModel.getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const getUserWithPermissionsHandler = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role !== "admin" && req.user.userId !== parseInt(id)) return res.status(403).json({ error: "Access denied" });
    const { user, permissions } = await userModel.getUserWithPermissionsById(parseInt(id));
    res.json({ user, permissions });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const getMeHandler = async (req, res) => {
  try {
    if (!req.user) {
      return res.json({ success: true, user: null, permissions: [] });
    }

    const profile = await userModel.getUserProfile(req.user.userId);

    // ✅ FETCH PERMISSIONS
    const permissions = await userModel.getPermissionsByRoleId(profile.roleid);

    res.json({
      success: true,
      user: profile,
      permissions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getCurrentUser = getMeHandler;

const updateProfileHandler = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) return res.status(400).json({ error: err.message });
      const userId = req.user.userId;
      const existingUser = await userModel.getUserById(userId);
      let userData = { ...req.body };
      if (req.file) {
        if (existingUser.file_id) await imageKit.deleteFile(existingUser.file_id).catch(() => {});
        const uploadResponse = await imageKit.upload({ file: req.file.buffer, fileName: `user_${Date.now()}` });
        userData.avatar = uploadResponse.url;
        userData.file_id = uploadResponse.fileId;
      }
      const updatedUser = await userModel.updateUserProfile(userId, userData);
      res.json({ success: true, user: updatedUser });
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const getUserLikesHandler = async (req, res) => {
  try {
    const likes = await userModel.getUserLikedPosts(req.user.userId, 10, 0);
    res.json({ success: true, likes });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const getUserBookmarksHandler = async (req, res) => {
  try {
    const bookmarks = await userModel.getUserBookmarkedPosts(req.user.userId, 10, 0);
    res.json({ success: true, bookmarks });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const getPublicUsers = async (req, res) => {
  try {
    const users = await userModel.getPublicUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  registerUserHandler,
  createUserHandler,
  createAdminHandler,
  loginUserHandler,
  refreshTokenHandler,
  logoutUserHandler,
  forgotPasswordHandler,
  resetPasswordHandler,
  getAllUsersHandler,
  getUsers: getAllUsersHandler,
  updateUserHandler,
  updateUserById: updateUserHandler,
  deleteUserHandler: deleteUser,
  bulkDeleteUsersHandler: bulkDeleteUsers,
  getUserById,
  getUserWithPermissionsHandler,
  getMeHandler,
  getCurrentUser: getMeHandler,
  updateProfileHandler,
  getUserLikesHandler,
  getUserBookmarksHandler,
  getPublicUsers,
  refreshAccessToken: refreshTokenHandler,
  changeCurrentPassword: (req, res) => res.status(501).json({ message: "Not implemented" }),
  forgetPassword: forgotPasswordHandler,
  resetPassword: resetPasswordHandler,
};

const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

// Register
router.get("/register", authController.showRegister);
router.post("/register", authController.registerStudent);

// Login
router.get("/login", authController.showLogin);
router.post("/login", authController.loginStudent);

// Logout
router.get("/logout", authController.logoutStudent);

// Admin Login
router.get("/admin/login", authController.showAdminLogin);

router.post("/admin/login", authController.loginAdmin);

// Admin Logout
router.get("/admin/logout", authController.logoutAdmin);

//forgot password
router.get("/forgot-password", authController.showForgotPassword);

router.post("/forgot-password", authController.sendOTP);


// Verify OTP
router.get("/verify-otp", authController.showVerifyOTP);

router.post("/verify-otp", authController.verifyOTP);


// Reset Password
router.get("/reset-password", authController.showResetPassword);

router.post("/reset-password", authController.resetPassword);

module.exports = router;
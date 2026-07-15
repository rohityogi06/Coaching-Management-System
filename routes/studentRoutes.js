const express = require("express");


const router = express.Router();

const studentController = require("../controllers/studentController");
const profileUpload = require("../middleware/profileUpload");

// Dashboard
router.get("/dashboard", studentController.showDashboard);

// ===========================
// Student Profile
// ===========================

// Profile Page
router.get("/student/profile", studentController.showProfile);

// Update Profile
// Update Profile
router.post(
    "/student/profile",
    profileUpload.single("profile_photo"),
    studentController.updateProfile
);

// ===========================
// Study Material
// ===========================

// Student Notes
router.get("/student/notes", studentController.showNotes);

// ===========================
// Change Student Password
// ===========================

// Change Password
router.post(
    "/student/change-password",
    studentController.changePassword
);


// ======================
// Student Attendance
// ======================

// Show Student Attendance
router.get(
    "/student/attendance",
    studentController.showAttendance
);

module.exports = router;
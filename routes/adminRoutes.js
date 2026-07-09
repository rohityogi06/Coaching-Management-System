const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

const adminController = require("../controllers/adminController");

//admin deshbored
router.get("/admin/dashboard", adminController.dashboard);


// ======================
// Students List
// ======================
router.get("/admin/students", adminController.students);

// ======================
// Add Student
// ======================
router.get("/admin/students/add", adminController.showAddStudent);
router.post("/admin/students/add", adminController.addStudent);

// ======================
// Edit Student
// ======================
router.get("/admin/students/edit/:id", adminController.showEditStudent);
router.post("/admin/students/edit/:id", adminController.updateStudent);



// ======================
// Delete Student
// ======================
router.get("/admin/students/delete/:id", adminController.deleteStudent);


// ======================
// Courses List
// ======================
router.get("/admin/courses", adminController.courses);

// ======================
// Add Course
// ======================
router.get("/admin/courses/add", adminController.showAddCourse);
router.post("/admin/courses/add", adminController.addCourse);

// ======================
// Edit Course
// ======================
router.get("/admin/courses/edit/:id", adminController.showEditCourse);
router.post("/admin/courses/edit/:id", adminController.updateCourse);

// ======================
// Delete Course
// ======================
router.get("/admin/courses/delete/:id", adminController.deleteCourse);


// ======================
// Assign Course
// ======================
router.get("/admin/assign-course", adminController.showAssignCourse);

router.post("/admin/assign-course", adminController.assignCourse);



// ======================
// Attendance
// ======================
router.get("/admin/attendance", adminController.showAttendance);

router.post("/admin/attendance", adminController.saveAttendance);

router.get("/admin/attendance/list", adminController.attendanceList);


// ======================
// Fees Page
// ======================
router.get("/admin/fees", adminController.showFees);

// ======================
// Save Fees
// ======================
router.post("/admin/fees", adminController.saveFees);

// ======================
// Fees List
// ======================
router.get("/admin/fees/list", adminController.feesList);

// ======================
// Edit Fees Page
// ======================
router.get("/admin/fees/edit/:id", adminController.showEditFees);

// ======================
// Update Fees
// ======================
router.post("/admin/fees/edit/:id", adminController.updateFees);

// ======================
// Delete Fees
// ======================
router.get("/admin/fees/delete/:id", adminController.deleteFees);


// ======================
// Results
// ======================

// Results Page
router.get("/admin/results", adminController.showResults);

// Save Result
router.post("/admin/results", adminController.saveResult);

// Results List
router.get("/admin/results/list", adminController.resultsList);

// Edit Result Page
router.get("/admin/results/edit/:id", adminController.showEditResult);

// Update Result
router.post("/admin/results/edit/:id", adminController.updateResult);

// Delete Result
router.get("/admin/results/delete/:id", adminController.deleteResult);


// ======================
// Notice Routes
// ======================

// Notice Page
router.get("/admin/notices", adminController.showNoticePage);

// Save Notice
router.post("/admin/notices", adminController.saveNotice);

// Notice List
router.get("/admin/notices/list", adminController.noticeList);

// Delete Notice
router.get("/admin/notices/delete/:id", adminController.deleteNotice);

// Edit Notice Page
router.get("/admin/notices/edit/:id", adminController.showEditNotice);

// Update Notice
router.post("/admin/notices/edit/:id", adminController.updateNotice);




// ======================
// Notes Routes
// ======================

// Notes Upload Page
router.get("/admin/notes", adminController.showNotes);

// Save Notes
router.post(
    "/admin/notes",
    upload.single("pdf"),
    adminController.saveNotes
);

// Notes List
router.get("/admin/notes/list", adminController.notesList);

// Delete Notes
router.get("/admin/notes/delete/:id", adminController.deleteNote);


// ======================
// Reports Page
// ======================
router.get("/admin/reports", adminController.reports);

// ======================
// Students Report PDF
// ======================
router.get("/admin/reports/students/pdf", adminController.studentsReportPDF);

// ======================
// Fees Report PDF
// ======================
router.get("/admin/reports/fees/pdf", adminController.feesReportPDF);

// ======================
// Results Report PDF
// ======================
router.get("/admin/reports/results/pdf", adminController.resultsReportPDF);


// ===========================
// Admin Profile
// ===========================

// Admin Profile Page
router.get("/admin/profile", adminController.showProfile);

// Update Admin Profile
router.post("/admin/profile", adminController.updateProfile);

// ===========================
// Student Registration Requests
// ===========================

// Pending Requests Page
router.get("/admin/requests", adminController.showRequests);

// Approve Student
router.post("/admin/approve/:id", adminController.approveStudent);

// Reject Student
router.post("/admin/reject/:id", adminController.rejectStudent);


// ===========================
// Change Admin Password
// ===========================

router.post(
    "/admin/change-password",
    adminController.changePassword
);


// ===========================
// Test Email
// ===========================

router.get("/test-email", adminController.testEmail);




module.exports = router;
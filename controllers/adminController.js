

const db = require("../models/db");
const bcrypt = require("bcrypt");
const transporter = require("../mail");
const PDFDocument = require("pdfkit");


// ==============================
// admin  Dashboard
// ==============================

exports.dashboard = (req, res) => {

    if (!req.session.admin) {
        return res.redirect("/admin/login");
    }

    db.query("SELECT COUNT(*) AS totalStudents FROM students", (err, students) => {

        db.query("SELECT COUNT(*) AS totalCourses FROM courses", (err, courses) => {

            db.query("SELECT COUNT(*) AS totalFees FROM fees", (err, fees) => {

                db.query(
                    "SELECT SUM(amount) AS totalRevenue FROM fees WHERE status='Paid'",
                    (err, revenue) => {

                        db.query("SELECT COUNT(*) AS totalResults FROM results", (err, results) => {

                            db.query("SELECT COUNT(*) AS totalNotices FROM notices", (err, notices) => {

                                db.query(
                                    "SELECT COUNT(*) AS pendingRequests FROM students WHERE status='Pending'",
                                    (err, pending) => {

                                        res.render("admin-dashboard", {
                                            totalStudents: students[0].totalStudents,
                                            totalCourses: courses[0].totalCourses,
                                            totalFees: fees[0].totalFees,
                                            totalRevenue: revenue[0].totalRevenue || 0,
                                            totalResults: results[0].totalResults,
                                            totalNotices: notices[0].totalNotices,
                                            pendingRequests: pending[0].pendingRequests
                                        });

                                    }
                                );

                            });

                        });

                    }
                );

            });

        });

    });

};


// ======================
// Students List
// ======================

exports.students = (req, res) => {

    if (!req.session.admin) {
        return res.redirect("/admin/login");
    }

    db.query(
        "SELECT * FROM students WHERE status='Approved'",
        (err, students) => {

            if (err) {
                console.log(err);
                return res.send("Database Error");
            }

            res.render("admin-students", {
                students
            });

        }
    );

};

// ======================
// Add Student Page
// ======================

exports.showAddStudent = (req, res) => {

    if (!req.session.admin) {
        return res.redirect("/admin/login");
    }

    res.render("add-student");

};

// ======================
// Save Student
// ======================

exports.addStudent = async (req, res) => {

    const { name, email, phone, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
        INSERT INTO students(name,email,phone,password)
        VALUES(?,?,?,?)
    `;

    db.query(sql, [name, email, phone, hashedPassword], (err) => {

        if (err) {
            console.log(err);
            return res.send("Error");
        }

        res.redirect("/admin/students");

    });

};

// ======================
// Edit Student Page
// ======================

exports.showEditStudent = (req, res) => {

    if (!req.session.admin) {
        return res.redirect("/admin/login");
    }

    const id = req.params.id;

    db.query(
        "SELECT * FROM students WHERE id=?",
        [id],
        (err, result) => {

            if (err) {
                console.log(err);
                return res.send("Database Error");
            }

            res.render("edit-student", {
                student: result[0]
            });

        }
    );

};

// ======================
// Update Student
// ======================

exports.updateStudent = (req, res) => {

    const id = req.params.id;

    const { name, email, phone } = req.body;

    const sql = `
        UPDATE students
        SET name=?, email=?, phone=?
        WHERE id=?
    `;

    db.query(sql, [name, email, phone, id], (err) => {

        if (err) {
            console.log(err);
            return res.send("Update Failed");
        }

        res.redirect("/admin/students");

    });

};


// ======================
// Delete Student
// ======================

exports.deleteStudent = (req, res) => {

    if (!req.session.admin) {
        return res.redirect("/admin/login");
    }

    const id = req.params.id;

    const sql = "DELETE FROM students WHERE id = ?";

    db.query(sql, [id], (err) => {

        if (err) {
            console.log(err);
            return res.send("Delete Failed");
        }

        res.redirect("/admin/students");

    });

};


// ======================
// Courses List
// ======================

exports.courses = (req, res) => {

    if (!req.session.admin) {
        return res.redirect("/admin/login");
    }

    db.query("SELECT * FROM courses", (err, courses) => {

        if (err) {
            console.log(err);
            return res.send("Database Error");
        }

        res.render("admin-courses", { courses });

    });

};

// ======================
// Add Course Page
// ======================

exports.showAddCourse = (req, res) => {

    if (!req.session.admin) {
        return res.redirect("/admin/login");
    }

    res.render("add-course");

};

// ======================
// Save Course
// ======================

exports.addCourse = (req, res) => {

    const { course_name, class: className, subject, description } = req.body;

    const sql = `
        INSERT INTO courses(course_name,class,subject,description)
        VALUES(?,?,?,?)
    `;

    db.query(sql, [course_name, className, subject, description], (err) => {

        if (err) {
            console.log(err);
            return res.send("Error");
        }

        res.redirect("/admin/courses");

    });

};

// ======================
// Edit Course Page
// ======================

exports.showEditCourse = (req, res) => {

    if (!req.session.admin) {
        return res.redirect("/admin/login");
    }

    db.query(
        "SELECT * FROM courses WHERE id=?",
        [req.params.id],
        (err, result) => {

            if (err) {
                console.log(err);
                return res.send("Database Error");
            }

            res.render("edit-course", {
                course: result[0]
            });

        }
    );

};

// ======================
// Update Course
// ======================

exports.updateCourse = (req, res) => {

    const id = req.params.id;

    const { course_name, class: className, subject, description } = req.body;

    const sql = `
        UPDATE courses
        SET course_name=?,
            class=?,
            subject=?,
            description=?
        WHERE id=?
    `;

    db.query(
        sql,
        [course_name, className, subject, description, id],
        (err) => {

            if (err) {
                console.log(err);
                return res.send("Update Failed");
            }

            res.redirect("/admin/courses");

        }
    );

};

// ======================
// Delete Course
// ======================

exports.deleteCourse = (req, res) => {

    if (!req.session.admin) {
        return res.redirect("/admin/login");
    }

    db.query(
        "DELETE FROM courses WHERE id=?",
        [req.params.id],
        (err) => {

            if (err) {
                console.log(err);
                return res.send("Delete Failed");
            }

            res.redirect("/admin/courses");

        }
    );

};



// ======================
// Assign Course Page
// ======================

exports.showAssignCourse = (req, res) => {

    if (!req.session.admin) {
        return res.redirect("/admin/login");
    }

    db.query("SELECT * FROM students", (err, students) => {

        if (err) {
            console.log(err);
            return res.send("Database Error");
        }

        db.query("SELECT * FROM courses", (err, courses) => {

            if (err) {
                console.log(err);
                return res.send("Database Error");
            }

            res.render("assign-course", {
                students,
                courses
            });

        });

    });

};

// ======================
// Assign Course
// ======================

exports.assignCourse = (req, res) => {

    const { student_id, course_id } = req.body;

    const sql = `
        INSERT INTO student_courses(student_id, course_id)
        VALUES (?, ?)
    `;

    db.query(sql, [student_id, course_id], (err) => {

        if (err) {
            console.log(err);
            return res.send("Assignment Failed");
        }

        res.redirect("/admin/dashboard");

    });

};


// ======================
// Attendance Page
// ======================

exports.showAttendance = (req, res) => {

    if (!req.session.admin) {
        return res.redirect("/admin/login");
    }

    db.query("SELECT * FROM students", (err, students) => {

        if (err) {
            console.log(err);
            return res.send("Database Error");
        }

        db.query("SELECT * FROM courses", (err, courses) => {

            if (err) {
                console.log(err);
                return res.send("Database Error");
            }

            res.render("attendance", {
                students,
                courses
            });

        });

    });

};

// ======================
// Save Attendance
// ======================

exports.saveAttendance = (req, res) => {

    const {
        student_id,
        course_id,
        attendance_date,
        status
    } = req.body;

    const sql = `
        INSERT INTO attendance
        (student_id, course_id, attendance_date, status)
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        sql,
        [student_id, course_id, attendance_date, status],
        (err) => {

            if (err) {
                console.log(err);
                return res.send("Attendance Save Failed");
            }

            res.redirect("/admin/attendance");

        }
    );

};

// ======================
// Attendance List
// ======================

exports.attendanceList = (req, res) => {

    if (!req.session.admin) {
        return res.redirect("/admin/login");
    }

    const sql = `
        SELECT
            attendance.id,
            students.name AS student_name,
            courses.course_name,
            attendance.attendance_date,
            attendance.status
        FROM attendance
        JOIN students
        ON attendance.student_id = students.id
        JOIN courses
        ON attendance.course_id = courses.id
        ORDER BY attendance.attendance_date DESC
    `;

    db.query(sql, (err, attendance) => {

        if (err) {
            console.log(err);
            return res.send("Database Error");
        }

        res.render("attendance-list", {
            attendance
        });

    });

};


// ======================
// Fees Page
// ======================

exports.showFees = (req, res) => {

    if (!req.session.admin) {
        return res.redirect("/admin/login");
    }

    db.query("SELECT * FROM students", (err, students) => {

        if (err) {
            console.log(err);
            return res.send("Database Error");
        }

        res.render("fees", {
            students
        });

    });

};

// ======================
// Save Fees
// ======================

exports.saveFees = (req, res) => {

    const {
        student_id,
        amount,
        payment_date,
        status
    } = req.body;

    const sql = `
        INSERT INTO fees(student_id, amount, payment_date, status)
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        sql,
        [student_id, amount, payment_date, status],
        (err) => {

            if (err) {
                console.log(err);
                return res.send("Fees Save Failed");
            }

            res.redirect("/admin/fees");

        }
    );

};

// ======================
// Fees List
// ======================

exports.feesList = (req, res) => {

    if (!req.session.admin) {
        return res.redirect("/admin/login");
    }

    const sql = `
        SELECT
            fees.id,
            students.name,
            fees.amount,
            fees.payment_date,
            fees.status
        FROM fees
        JOIN students
        ON fees.student_id = students.id
        ORDER BY fees.id DESC
    `;

    db.query(sql, (err, fees) => {

        if (err) {
            console.log(err);
            return res.send("Database Error");
        }

        res.render("fees-list", {
            fees
        });

    });

};

// ======================
// Edit Fees Page
// ======================

exports.showEditFees = (req, res) => {

    if (!req.session.admin) {
        return res.redirect("/admin/login");
    }

    const id = req.params.id;

    db.query(
        "SELECT * FROM fees WHERE id = ?",
        [id],
        (err, feeResult) => {

            if (err) {
                console.log(err);
                return res.send("Database Error");
            }

            db.query("SELECT * FROM students", (err, students) => {

                if (err) {
                    console.log(err);
                    return res.send("Database Error");
                }

                res.render("edit-fees", {
                    fee: feeResult[0],
                    students
                });

            });

        }
    );

};

// ======================
// Update Fees
// ======================

exports.updateFees = (req, res) => {

    const id = req.params.id;

    const {
        student_id,
        amount,
        payment_date,
        status
    } = req.body;

    const sql = `
        UPDATE fees
        SET
            student_id = ?,
            amount = ?,
            payment_date = ?,
            status = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [student_id, amount, payment_date, status, id],
        (err) => {

            if (err) {
                console.log(err);
                return res.send("Update Failed");
            }

            res.redirect("/admin/fees/list");

        }
    );

};

// ======================
// Delete Fees
// ======================

exports.deleteFees = (req, res) => {

    if (!req.session.admin) {
        return res.redirect("/admin/login");
    }

    const id = req.params.id;

    db.query(
        "DELETE FROM fees WHERE id = ?",
        [id],
        (err) => {

            if (err) {
                console.log(err);
                return res.send("Delete Failed");
            }

            res.redirect("/admin/fees/list");

        }
    );

};


// ======================
// Results Page
// ======================

exports.showResults = (req, res) => {

    if (!req.session.admin) {
        return res.redirect("/admin/login");
    }

    db.query("SELECT * FROM students", (err, students) => {

        if (err) {
            console.log(err);
            return res.send("Database Error");
        }

        db.query("SELECT * FROM courses", (err, courses) => {

            if (err) {
                console.log(err);
                return res.send("Database Error");
            }

            res.render("results", {
                students,
                courses
            });

        });

    });

};

// ======================
// Save Result
// ======================

exports.saveResult = (req, res) => {

    const {
        student_id,
        course_id,
        marks,
        total_marks,
        exam_name
    } = req.body;

    const sql = `
        INSERT INTO results
        (student_id, course_id, marks, total_marks, exam_name)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [student_id, course_id, marks, total_marks, exam_name],
        (err) => {

            if (err) {
                console.log(err);
                return res.send("Result Save Failed");
            }

            res.redirect("/admin/results");

        }
    );

};

// ======================
// Results List
// ======================

exports.resultsList = (req, res) => {

    if (!req.session.admin) {
        return res.redirect("/admin/login");
    }

    const sql = `
        SELECT
            results.id,
            students.name,
            courses.course_name,
            results.exam_name,
            results.marks,
            results.total_marks
        FROM results
        JOIN students
        ON results.student_id = students.id
        JOIN courses
        ON results.course_id = courses.id
        ORDER BY results.id DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.log(err);
            return res.send("Database Error");
        }

        res.render("results-list", {
            results
        });

    });

};

// ======================
// Edit Result Page
// ======================

exports.showEditResult = (req, res) => {

    if (!req.session.admin) {
        return res.redirect("/admin/login");
    }

    const id = req.params.id;

    db.query(
        "SELECT * FROM results WHERE id = ?",
        [id],
        (err, resultData) => {

            if (err) {
                console.log(err);
                return res.send("Database Error");
            }

            db.query("SELECT * FROM students", (err, students) => {

                if (err) {
                    console.log(err);
                    return res.send("Database Error");
                }

                db.query("SELECT * FROM courses", (err, courses) => {

                    if (err) {
                        console.log(err);
                        return res.send("Database Error");
                    }

                    res.render("edit-result", {
                        result: resultData[0],
                        students,
                        courses
                    });

                });

            });

        }

    );

};

// ======================
// Update Result
// ======================

exports.updateResult = (req, res) => {

    const id = req.params.id;

    const {
        student_id,
        course_id,
        exam_name,
        marks,
        total_marks
    } = req.body;

    const sql = `
        UPDATE results
        SET
            student_id = ?,
            course_id = ?,
            exam_name = ?,
            marks = ?,
            total_marks = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [
            student_id,
            course_id,
            exam_name,
            marks,
            total_marks,
            id
        ],
        (err) => {

            if (err) {
                console.log(err);
                return res.send("Update Failed");
            }

            res.redirect("/admin/results/list");

        }
    );

};

// ======================
// Delete Result
// ======================

exports.deleteResult = (req, res) => {

    if (!req.session.admin) {
        return res.redirect("/admin/login");
    }

    const id = req.params.id;

    db.query(
        "DELETE FROM results WHERE id = ?",
        [id],
        (err) => {

            if (err) {
                console.log(err);
                return res.send("Delete Failed");
            }

            res.redirect("/admin/results/list");

        }
    );

};


// ======================
// Notice Page
// ======================

exports.showNoticePage = (req, res) => {

    if (!req.session.admin) {
        return res.redirect("/admin/login");
    }

    res.render("notices");

};

// ======================
// Save Notice
// ======================

exports.saveNotice = (req, res) => {

    const {
        title,
        description,
        notice_date
    } = req.body;

    const sql = `
        INSERT INTO notices
        (title, description, notice_date)
        VALUES (?, ?, ?)
    `;

    db.query(
        sql,
        [title, description, notice_date],
        (err) => {

            if (err) {
                console.log(err);
                return res.send("Notice Save Failed");
            }

            res.redirect("/admin/notices");

        }
    );

};

// ======================
// Notice List
// ======================

exports.noticeList = (req, res) => {

    if (!req.session.admin) {
        return res.redirect("/admin/login");
    }

    db.query(
        "SELECT * FROM notices ORDER BY notice_date DESC",
        (err, notices) => {

            if (err) {
                console.log(err);
                return res.send("Database Error");
            }

            res.render("notices-list", {
                notices
            });

        }
    );

};

// ======================
// Delete Notice
// ======================

exports.deleteNotice = (req, res) => {

    if (!req.session.admin) {
        return res.redirect("/admin/login");
    }

    const id = req.params.id;

    db.query(
        "DELETE FROM notices WHERE id = ?",
        [id],
        (err) => {

            if (err) {
                console.log(err);
                return res.send("Delete Failed");
            }

            res.redirect("/admin/notices/list");

        }
    );

};

// ======================
// Edit Notice Page
// ======================

exports.showEditNotice = (req, res) => {

    if (!req.session.admin) {
        return res.redirect("/admin/login");
    }

    const id = req.params.id;

    db.query(
        "SELECT * FROM notices WHERE id = ?",
        [id],
        (err, result) => {

            if (err) {
                console.log(err);
                return res.send("Database Error");
            }

            res.render("edit-notice", {
                notice: result[0]
            });

        }
    );

};

// ======================
// Update Notice
// ======================

exports.updateNotice = (req, res) => {

    const id = req.params.id;

    const {
        title,
        description,
        notice_date
    } = req.body;

    const sql = `
        UPDATE notices
        SET
            title = ?,
            description = ?,
            notice_date = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [title, description, notice_date, id],
        (err) => {

            if (err) {
                console.log(err);
                return res.send("Update Failed");
            }

            res.redirect("/admin/notices/list");

        }
    );

};


// ======================
// Notes Upload Page
// ======================
exports.showNotes = (req, res) => {

    if (!req.session.admin) {
        return res.redirect("/admin/login");
    }

    db.query("SELECT * FROM courses", (err, courses) => {

        if (err) {
            console.log(err);
            return res.send("Database Error");
        }

        res.render("notes", {
            courses
        });

    });

};


// ======================
// Save Notes
// ======================
exports.saveNotes = (req, res) => {

    if (!req.session.admin) {
        return res.redirect("/admin/login");
    }

    if (!req.file) {
        return res.send("Please select a PDF file");
    }

    const {
        course_id,
        title,
        description,
        upload_date
    } = req.body;

    const file_name = req.file.filename;

    const sql = `
        INSERT INTO notes
        (course_id, title, description, file_name, upload_date)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            course_id,
            title,
            description,
            file_name,
            upload_date
        ],
        (err) => {

            if (err) {
                console.log(err);
                return res.send("Upload Failed");
            }

            res.redirect("/admin/notes/list");

        }
    );

};


// ======================
// Notes List
// ======================
exports.notesList = (req, res) => {

    if (!req.session.admin) {
        return res.redirect("/admin/login");
    }

    const sql = `
        SELECT
            notes.*,
            courses.course_name
        FROM notes
        JOIN courses
        ON notes.course_id = courses.id
        ORDER BY notes.id DESC
    `;

    db.query(sql, (err, notes) => {

        if (err) {
            console.log(err);
            return res.send("Database Error");
        }

        res.render("notes-list", {
            notes
        });

    });

};


// ======================
// Delete Notes
// ======================
exports.deleteNote = (req, res) => {

    if (!req.session.admin) {
        return res.redirect("/admin/login");
    }

    db.query(
        "DELETE FROM notes WHERE id=?",
        [req.params.id],
        (err) => {

            if (err) {
                console.log(err);
                return res.send("Delete Failed");
            }

            res.redirect("/admin/notes/list");

        }
    );

};



// ======================
// Reports Page
// ======================

exports.reports = (req, res) => {

    if (!req.session.admin) {
        return res.redirect("/admin/login");
    }

    res.render("reports");

};


// ======================
// Students Report PDF
// ======================

exports.studentsReportPDF = (req, res) => {

    if (!req.session.admin) {
        return res.redirect("/admin/login");
    }

    db.query("SELECT * FROM students", (err, students) => {

        if (err) {
            return res.send("Database Error");
        }

        const doc = new PDFDocument();

        res.setHeader(
            "Content-Disposition",
            "attachment; filename=Students_Report.pdf"
        );

        res.setHeader(
            "Content-Type",
            "application/pdf"
        );

        doc.pipe(res);

        doc.fontSize(20)
            .text("Sandeep Coaching Classes", {
                align: "center"
            });

        doc.moveDown();

        doc.fontSize(16)
            .text("Students Report");

        doc.moveDown();

        students.forEach((student, index) => {

            doc.fontSize(12).text(
                `${index + 1}. ${student.name} | ${student.email} | ${student.phone}`
            );

        });

        doc.end();

    });

};


// ======================
// Fees Report PDF
// ======================

exports.feesReportPDF = (req, res) => {

    if (!req.session.admin) {
        return res.redirect("/admin/login");
    }

    const sql = `
        SELECT
            fees.*,
            students.name
        FROM fees
        JOIN students
        ON fees.student_id = students.id
    `;

    db.query(sql, (err, fees) => {

        if (err) {
            return res.send("Database Error");
        }

        const doc = new PDFDocument();

        res.setHeader(
            "Content-Disposition",
            "attachment; filename=Fees_Report.pdf"
        );

        res.setHeader(
            "Content-Type",
            "application/pdf"
        );

        doc.pipe(res);

        doc.fontSize(20)
            .text("Sandeep Coaching Classes", {
                align: "center"
            });

        doc.moveDown();

        doc.fontSize(16)
            .text("Fees Report");

        doc.moveDown();

        fees.forEach((fee, index) => {

            doc.fontSize(12).text(
                `${index + 1}. ${fee.name} | ₹${fee.amount} | ${fee.status}`
            );

        });

        doc.end();

    });

};


// ======================
// Results Report PDF
// ======================

exports.resultsReportPDF = (req, res) => {

    if (!req.session.admin) {
        return res.redirect("/admin/login");
    }

    const sql = `
        SELECT
            results.*,
            students.name
        FROM results
        JOIN students
        ON results.student_id = students.id
    `;

    db.query(sql, (err, results) => {

        if (err) {
            return res.send("Database Error");
        }

        const doc = new PDFDocument();

        res.setHeader(
            "Content-Disposition",
            "attachment; filename=Results_Report.pdf"
        );

        res.setHeader(
            "Content-Type",
            "application/pdf"
        );

        doc.pipe(res);

        doc.fontSize(20)
            .text("Sandeep Coaching Classes", {
                align: "center"
            });

        doc.moveDown();

        doc.fontSize(16)
            .text("Results Report");

        doc.moveDown();

        results.forEach((result, index) => {

            doc.fontSize(12).text(
                `${index + 1}. ${result.name} | ${result.subject} | Marks : ${result.marks}`
            );

        });

        doc.end();

    });

};


// ===========================
// Admin Profile Page
// ===========================

exports.showProfile = (req, res) => {

    if (!req.session.admin) {
        return res.redirect("/admin/login");
    }

    res.render("admin-profile", {
        admin: req.session.admin
    });

};


// ===========================
// Update Admin Profile
// ===========================

exports.updateProfile = (req, res) => {

    if (!req.session.admin) {
        return res.redirect("/admin/login");
    }

    const adminId = req.session.admin.id;

    const { name, email } = req.body;

    const sql = `
        UPDATE admins
        SET name = ?, email = ?
        WHERE id = ?
    `;

    db.query(sql, [name, email, adminId], (err) => {

        if (err) {
            console.log(err);
            return res.send("Profile Update Failed");
        }

        // Update Session
        req.session.admin.name = name;
        req.session.admin.email = email;

        res.render("admin-profile", {
            admin: req.session.admin,
            success: "✅ Profile Updated Successfully!"
        });

    });

};



// ===========================
// Registration Requests Page
// ===========================

exports.showRequests = (req, res) => {

    if (!req.session.admin) {
        return res.redirect("/admin/login");
    }

    db.query(
        "SELECT * FROM students WHERE status='Pending'",
        (err, students) => {

            if (err) {
                return res.send("Database Error");
            }

            res.render("admin-requests", {
                students
            });

        }
    );

};


// ===========================
// Approve Student
// ===========================

exports.approveStudent = (req, res) => {

    if (!req.session.admin) {
        return res.redirect("/admin/login");
    }

    const studentId = req.params.id;

    db.query(
        "SELECT * FROM students WHERE id=?",
        [studentId],
        async (err, result) => {

            if (err || result.length === 0) {
                return res.send("Student not found");
            }

            const student = result[0];

            db.query(
                "UPDATE students SET status='Approved' WHERE id=?",
                [studentId],
                async (err) => {

                    if (err) {
                        return res.send("Error");
                    }

                   
                    try {

                        await transporter.sendMail({

                            from: process.env.EMAIL_USER,

                            to: student.email,

                            subject: "🎉 Registration Approved",

                            html: `
                                <h2>Congratulations ${student.name}! 🎉</h2>

                                <p>Your registration has been <b>Approved</b>.</p>

                                <p>You can now login to the Coaching Management System.</p>

                                <br>

                                <p>Best Wishes,<br>
                                Coaching Management Team</p>
                            `

                        });

                        console.log("✅ Approval Email Sent");
                       
                    } catch (mailError) {

                        console.log("❌ Email Error:", mailError);

                    }

                    req.session.success = "✅ Student Approved Successfully!";

                    res.redirect("/admin/requests");

                }

            );

        }

    );

};


// ===========================
// Reject Student
// ===========================

exports.rejectStudent = (req, res) => {

    if (!req.session.admin) {
        return res.redirect("/admin/login");
    }

    const studentId = req.params.id;

    db.query(
        "SELECT * FROM students WHERE id=?",
        [studentId],
        async (err, result) => {

            if (err || result.length === 0) {
                return res.send("Student not found");
            }

            const student = result[0];

            // 📧 Send Rejection Email
            try {

                await transporter.sendMail({

                    from: process.env.EMAIL_USER,

                    to: student.email,

                    subject: "❌ Registration Rejected",

                    html: `
                        <h2>Hello ${student.name}</h2>

                        <p>We are sorry to inform you that your registration has been <b>Rejected</b>.</p>

                        <p>If you think this is a mistake, please contact the coaching administration.</p>

                        <br>

                        <p>Thank You,<br>
                        Coaching Management Team</p>
                    `

                });

                console.log("✅ Rejection Email Sent");

            } catch (mailError) {

                console.log("❌ Email Error:", mailError);

            }

            // 🗑️ Delete Student
            db.query(
                "DELETE FROM students WHERE id=?",
                [studentId],
                (err) => {

                    if (err) {
                        console.log(err);
                        return res.send("Delete Failed");
                    }

                    req.session.success =
                        "❌ Student Rejected and Deleted Successfully!";

                    res.redirect("/admin/requests");

                }

            );

        }

    );

};

// ===========================
// Change Admin Password
// ===========================

exports.changePassword = (req, res) => {

    if (!req.session.admin) {
        return res.redirect("/admin/login");
    }

    const adminId = req.session.admin.id;

    const { oldPassword, newPassword } = req.body;

    db.query(
        "SELECT * FROM admins WHERE id=?",
        [adminId],
        async (err, result) => {

            if (err) {
                return res.send("Database Error");
            }

            const admin = result[0];

            const match = await bcrypt.compare(
                oldPassword,
                admin.password
            );

            if (!match) {
                return res.send("Old Password Incorrect");
            }

            const hashedPassword = await bcrypt.hash(
                newPassword,
                10
            );

            db.query(
                "UPDATE admins SET password=? WHERE id=?",
                [hashedPassword, adminId],
                (err) => {

                    if (err) {
                        return res.send("Password Update Failed");
                    }

                    // Update Session
                    req.session.admin.password = hashedPassword;

                    res.render("admin-profile", {
                        admin: req.session.admin,
                        success: "✅ Password Changed Successfully!"
                    });

                }
            );

        }
    );

};


// ===========================
// Test Email
// ===========================

exports.testEmail = async (req, res) => {

    try {

        await transporter.sendMail({

            from: process.env.EMAIL_USER,

            to: process.env.EMAIL_USER,
           

            subject: "Coaching Management Test",

            html: `
                <h2>✅ Email Working Successfully</h2>

                <p>Nodemailer is configured correctly.</p>

                <h3>Congratulations 🎉</h3>
            `

        });

        res.send("✅ Email Sent Successfully");

    } catch (err) {

        console.log(err);

        res.send("❌ Email Failed");

    }

};
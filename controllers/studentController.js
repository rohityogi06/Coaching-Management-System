const db = require("../models/db");
const bcrypt = require("bcrypt");

// ==============================
// Student Dashboard
// ==============================

exports.showDashboard = (req, res) => {

    if (!req.session.student) {
        return res.redirect("/login");
    }

    const studentId = req.session.student.id;

    const courseSql = `
        SELECT courses.*
        FROM student_courses
        JOIN courses ON student_courses.course_id = courses.id
        WHERE student_courses.student_id = ?
    `;

    const feesSql = `
        SELECT * FROM fees
        WHERE student_id = ?
        ORDER BY id DESC
    `;

    const resultSql = `
        SELECT results.*, courses.course_name
        FROM results
        JOIN courses ON results.course_id = courses.id
        WHERE student_id = ?
        ORDER BY results.id DESC
    `;

    const noticeSql = `
        SELECT *
        FROM notices
        ORDER BY notice_date DESC
        LIMIT 5
    `;

    db.query(courseSql, [studentId], (err, courses) => {

        if (err) return res.send("Error loading courses");

        db.query(feesSql, [studentId], (err, fees) => {

            if (err) return res.send("Error loading fees");

            db.query(resultSql, [studentId], (err, results) => {

                if (err) return res.send("Error loading results");

                db.query(noticeSql, (err, notices) => {

                    if (err) return res.send("Error loading notices");

                    res.render("dashboard", {

                        student: req.session.student,
                        courses,
                        fees,
                        results,
                        notices

                    });

                });

            });

        });

    });

};


// ==============================
// Student Profile
// ==============================

exports.showProfile = (req, res) => {

    if (!req.session.student) {
        return res.redirect("/login");
    }

    res.render("student-profile", {

        student: req.session.student

    });

};

// ==============================
// Update Profile
// ==============================

// ===========================
// Update Student Profile
// ===========================

exports.updateProfile = (req, res) => {

    const studentId = req.session.student.id;

    const { name, email, phone } = req.body;

    // Default Query
    let sql =
        "UPDATE students SET name=?, email=?, phone=? WHERE id=?";

    let values = [name, email, phone, studentId];

    // If Photo Uploaded
    if (req.file) {

        sql =
            "UPDATE students SET name=?, email=?, phone=?, profile_photo=? WHERE id=?";

        values = [
            name,
            email,
            phone,
            req.file.filename,
            studentId
        ];

        // Session Update
        req.session.student.profile_photo = req.file.filename;
    }

    db.query(sql, values, (err) => {

        if (err) {

            console.log(err);

            return res.send("Update Failed");

        }

        // Session Update
        req.session.student.name = name;
        req.session.student.email = email;
        req.session.student.phone = phone;

        res.render("student-profile", {

            student: req.session.student,

            success: "✅ Profile Updated Successfully"

        });

    });

};


// ==============================
// Student Study Material
// ==============================

exports.showNotes = (req, res) => {

    if (!req.session.student) {
        return res.redirect("/login");
    }

    const studentId = req.session.student.id;

    const sql = `
        SELECT
            notes.*,
            courses.course_name
        FROM notes
        JOIN courses
            ON notes.course_id = courses.id
        JOIN student_courses
            ON student_courses.course_id = courses.id
        WHERE student_courses.student_id = ?
        ORDER BY notes.upload_date DESC
    `;

    db.query(sql, [studentId], (err, notes) => {

        if (err) {
            console.log(err);
            return res.send("Database Error");
        }

        res.render("student-notes", {

            student: req.session.student,
            notes

        });

    });

};


// ===========================
// Change Student Password
// ===========================

exports.changePassword = (req, res) => {

    if (!req.session.student) {
        return res.redirect("/login");
    }

    const studentId = req.session.student.id;

    const { oldPassword, newPassword } = req.body;

    db.query(
        "SELECT * FROM students WHERE id=?",
        [studentId],
        async (err, result) => {

            if (err) {
                return res.send("Error");
            }

            const user = result[0];

            const match = await bcrypt.compare(
                oldPassword,
                user.password
            );

            if (!match) {

                return res.render("student-profile", {
                    student: req.session.student,
                    error: "Old password incorrect ❌"
                });

            }

            const hashed = await bcrypt.hash(
                newPassword,
                10
            );

            db.query(
                "UPDATE students SET password=? WHERE id=?",
                [hashed, studentId],
                (err) => {

                    if (err) {

                        return res.render("student-profile", {
                            student: req.session.student,
                            error: "Update Failed ❌"
                        });

                    }

                    res.render("student-profile", {
                        student: req.session.student,
                        success: "Password updated successfully ✅"
                    });

                }
            );

        }
    );

};

// ======================
// Student Attendance
// ======================

exports.showAttendance = (req, res) => {

    // Student Login Check
    if (!req.session.student) {
        return res.redirect("/login");
    }

    const studentId = req.session.student.id;

    // Get Attendance of Logged-in Student
    db.query(

        `SELECT attendance.attendance_date,
                attendance.status,
                courses.course_name
         FROM attendance
         JOIN courses
         ON attendance.course_id = courses.id
         WHERE attendance.student_id = ?`,

        [studentId],

        (err, attendance) => {

            if (err) {
                console.log(err);
                return res.send("Database Error");
            }

            // ======================
            // Attendance Summary
            // ======================

            const totalClasses = attendance.length;

            const presentClasses = attendance.filter(
                item => item.status === "Present"
            ).length;

            const absentClasses = attendance.filter(
                item => item.status === "Absent"
            ).length;

            const percentage = totalClasses > 0
                ? ((presentClasses / totalClasses) * 100).toFixed(2)
                : 0;

            // Render Attendance Page
            res.render("student-attendance", {
                attendance,
                totalClasses,
                presentClasses,
                absentClasses,
                percentage
            });

        }

    );

};
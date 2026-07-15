
const authRoutes = require("./routes/authRoutes");
require("dotenv").config();
const studentRoutes = require("./routes/studentRoutes");
const adminRoutes = require("./routes/adminRoutes");

const transporter = require("./mail");
const express=require("express");
const app=express();
const db = require("./models/db");
//const bcrypt = require("bcrypt");
const session = require("express-session");
const port =8080;
//const multer = require("multer");
//const path = require("path");
//const PDFDocument = require("pdfkit");


app.set("view engine","ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());



// // ======================
// // Multer Setup
// // ======================

// const storage = multer.diskStorage({

//     destination: function (req, file, cb) {
//         cb(null, "public/uploads");
//     },

//     filename: function (req, file, cb) {

//         const uniqueName = Date.now() + path.extname(file.originalname);

//         cb(null, uniqueName);

//     }

// });

// const upload = multer({

//     storage: storage,

//     fileFilter: (req, file, cb) => {

//         if (file.mimetype === "application/pdf") {

//             cb(null, true);

//         } else {

//             cb(new Error("Only PDF files allowed"));

//         }

//     }

// });

// SESSION SETUP (ensure app.js me already hai)
app.use(session({
    secret: "sandeep123",
    resave: false,
    saveUninitialized: false
}));

// ======================
// Global Session Data
// ======================

app.use((req, res, next) => {

    res.locals.student = req.session.student;

    res.locals.admin = req.session.admin;

    next();

});
app.use("/", authRoutes);
app.use("/", studentRoutes);
app.use("/", adminRoutes);
// home route
app.get("/",(req,res)=>{
  res.render("home.ejs");
});

//about route
app.get("/about",(req,res)=>{
    res.render('about.ejs');
});

// Courses route
app.get("/courses",(req,res)=>{
   res.render("courses.ejs");
});

// teachers route
app.get("/teachers",(req,res)=>{
   res.render("teachers.ejs");
});
//contact route
app.get("/contact",(req,res)=>{
   res.render("contact.ejs");
});

app.post("/contact", async (req, res) => {

    try {

        const { name, email, subject, message } = req.body;

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: subject,
            html: `
                <h3>New Contact Message</h3>

                <p><b>Name:</b> ${name}</p>

                <p><b>Email:</b> ${email}</p>

                <p><b>Message:</b></p>

                <p>${message}</p>
            `
        });

        res.send("✅ Message Sent Successfully");

    } catch (err) {

        console.log(err);
        res.send("❌ Failed to Send Message");

    }

});
// //login route
// app.get("/login",(req,res)=>{
//    res.render("login.ejs");
// });

// app.post("/login", async (req, res) => {

//     const { email, password } = req.body;

//     const sql = "SELECT * FROM students WHERE email = ?";

//     db.query(sql, [email], async (err, result) => {

//         if (err) {
//             console.log(err);
//             return res.send("Server error");
//         }

//         if (result.length === 0) {
//             return res.send("User not found");
//         }

//         const student = result[0];

//         // Password Check
//         const match = await bcrypt.compare(password, student.password);

//         if (!match) {
//             return res.send("Wrong password");
//         }

//         // ✅ Status Check
//         if (student.status === "Pending") {
//             return res.send("⏳ Your account is waiting for admin approval.");
//         }

//         if (student.status === "Rejected") {
//             return res.send("❌ Your registration has been rejected. Please contact the coaching.");
//         }

//         // ✅ Login Allowed
//         req.session.student = student;

//         res.redirect("/dashboard");

//     });

// });

// // register route
// app.get("/register",(req,res)=>{
//    res.render("register.ejs");
// });

// app.post("/register", async (req, res) => {

//     const { name, email, phone, password } = req.body;

//     try {

//         const hashedPassword = await bcrypt.hash(password, 10);

//         const sql = `
//             INSERT INTO students
//             (name, email, phone, password, status)
//             VALUES (?, ?, ?, ?, ?)
//         `;

//         db.query(
//             sql,
//             [name, email, phone, hashedPassword, "Pending"],
//             async (err) => {

//                 if (err) {
//                     console.log(err);
//                     return res.send("Registration failed");
//                 }

//                 // 📧 Email to Admin
//                 try {

//                     await transporter.sendMail({

//                         from: process.env.EMAIL_USER,

//                         to: process.env.EMAIL_USER,

//                         subject: "🆕 New Student Registration",

//                         html: `
//                             <h2>New Student Registration</h2>
//                             <hr>

//                             <p><b>Name:</b> ${name}</p>

//                             <p><b>Email:</b> ${email}</p>

//                             <p><b>Phone:</b> ${phone}</p>

//                             <p><b>Status:</b> Pending Approval</p>

//                             <br>

//                             <p>Please login to the Admin Panel and approve this student.</p>
//                         `

//                     });

//                     console.log("✅ Admin notification email sent.");

//                 } catch (mailError) {

//                     console.log("❌ Email Error:", mailError);

//                 }

//                 res.send(`
//                     <h2>✅ Registration Successful!</h2>

//                     <p>Your account is waiting for admin approval.</p>

//                     <a href="/login">Go to Login</a>
//                 `);

//             }
//         );

//     } catch (error) {

//         console.log(error);

//         res.send("Something went wrong");

//     }

// });
// // ======================
// // Student Dashboard
// // ======================

// app.get("/dashboard", (req, res) => {

//     if (!req.session.student) {
//         return res.redirect("/login");
//     }

//     const studentId = req.session.student.id;

//     // 1. Courses
//     const courseSql = `
//         SELECT courses.*
//         FROM student_courses
//         JOIN courses ON student_courses.course_id = courses.id
//         WHERE student_courses.student_id = ?
//     `;

//     // 2. Fees
//     const feesSql = `
//         SELECT * FROM fees
//         WHERE student_id = ?
//         ORDER BY id DESC
//     `;

//     // 3. Results
//     const resultSql = `
//         SELECT results.*, courses.course_name
//         FROM results
//         JOIN courses ON results.course_id = courses.id
//         WHERE student_id = ?
//         ORDER BY results.id DESC
//     `;

//     // 4. Notices (latest 5)
//     const noticeSql = `
//         SELECT * FROM notices
//         ORDER BY notice_date DESC
//         LIMIT 5
//     `;

//     db.query(courseSql, [studentId], (err, courses) => {

//         if (err) return res.send("Error loading courses");

//         db.query(feesSql, [studentId], (err, fees) => {

//             if (err) return res.send("Error loading fees");

//             db.query(resultSql, [studentId], (err, results) => {

//                 if (err) return res.send("Error loading results");

//                 db.query(noticeSql, (err, notices) => {

//                     if (err) return res.send("Error loading notices");

//                     res.render("dashboard", {
//                         student: req.session.student,
//                         courses,
//                         fees,
//                         results,
//                         notices
//                     });

//                 });

//             });

//         });

//     });

// });
// // Logout route

// app.get("/logout", (req, res) => {

//     req.session.destroy((err) => {

//         if (err) {
//             return res.send("Logout Failed");
//         }

//         res.redirect("/login");

//     });

// });


// // Admin Login Page
// app.get("/admin/login", (req, res) => {
//     res.render("admin-login");
// });

// // Admin Login
// app.post("/admin/login", (req, res) => {

//     const { email, password } = req.body;

//     const sql = "SELECT * FROM admins WHERE email = ?";

//     db.query(sql, [email], async (err, result) => {

//         if (err) {
//             console.log(err);
//             return res.send("Server Error");
//         }

//         if (result.length === 0) {
//             return res.send("Admin Not Found");
//         }

//         const admin = result[0];

//         const match = await bcrypt.compare(password, admin.password);

//         if (!match) {
//             return res.send("Wrong Password");
//         }

//         req.session.admin = admin;

//         res.redirect("/admin/dashboard");

//     });

// });


// // admin dashbored
// app.get("/admin/dashboard", (req, res) => {

//     if (!req.session.admin) {
//         return res.redirect("/admin/login");
//     }

//     db.query("SELECT COUNT(*) AS totalStudents FROM students", (err, students) => {

//         db.query("SELECT COUNT(*) AS totalCourses FROM courses", (err, courses) => {

//             db.query("SELECT COUNT(*) AS totalFees FROM fees", (err, fees) => {

//                 db.query("SELECT SUM(amount) AS totalRevenue FROM fees WHERE status='Paid'", (err, revenue) => {

//                     db.query("SELECT COUNT(*) AS totalResults FROM results", (err, results) => {

//                         db.query("SELECT COUNT(*) AS totalNotices FROM notices", (err, notices) => {

//                             // Pending Registration Requests
//                             db.query(
//                                 "SELECT COUNT(*) AS pendingRequests FROM students WHERE status='Pending'",
//                                 (err, pending) => {

//                                     res.render("admin-dashboard", {

//                                         totalStudents: students[0].totalStudents,
//                                         totalCourses: courses[0].totalCourses,
//                                         totalFees: fees[0].totalFees,
//                                         totalRevenue: revenue[0].totalRevenue || 0,
//                                         totalResults: results[0].totalResults,
//                                         totalNotices: notices[0].totalNotices,
//                                         pendingRequests: pending[0].pendingRequests

//                                     });

//                                 }
//                             );

//                         });

//                     });

//                 });

//             });

//         });

//     });

// });
// app.get("/admin/students", (req, res) => {

//     if (!req.session.admin) {
//         return res.redirect("/admin/login");
//     }

//     const sql = "SELECT * FROM students";

//     db.query(sql, (err, students) => {

//         if (err) {
//             console.log(err);
//             return res.send("Database Error");
//         }

//         res.render("admin-students", {
//             students
//         });

//     });

// });


// app.get("/admin/students/add", (req, res) => {

//     if (!req.session.admin) {
//         return res.redirect("/admin/login");
//     }

//     res.render("add-student");

// });

// app.post("/admin/students/add", async (req, res) => {

//     const { name, email, phone, password } = req.body;

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const sql = `
//         INSERT INTO students(name,email,phone,password)
//         VALUES(?,?,?,?)
//     `;

//     db.query(sql, [name,email,phone,hashedPassword], (err)=>{

//         if(err){
//             console.log(err);
//             return res.send("Error");
//         }

//         res.redirect("/admin/students");

//     });

// });


// // Edit Student Page
// app.get("/admin/students/edit/:id", (req, res) => {

//     if (!req.session.admin) {
//         return res.redirect("/admin/login");
//     }

//     const id = req.params.id;

//     const sql = "SELECT * FROM students WHERE id = ?";

//     db.query(sql, [id], (err, result) => {

//         if (err) {
//             console.log(err);
//             return res.send("Database Error");
//         }

//         res.render("edit-student", {
//             student: result[0]
//         });

//     });

// });

// // Update Student
// app.post("/admin/students/edit/:id", (req, res) => {

//     const id = req.params.id;

//     const { name, email, phone } = req.body;

//     const sql = `
//         UPDATE students
//         SET name=?, email=?, phone=?
//         WHERE id=?
//     `;

//     db.query(sql, [name, email, phone, id], (err) => {

//         if (err) {
//             console.log(err);
//             return res.send("Update Failed");
//         }

//         res.redirect("/admin/students");

//     });

// });


// // Delete Student
// app.get("/admin/students/delete/:id", (req, res) => {

//     if (!req.session.admin) {
//         return res.redirect("/admin/login");
//     }

//     const id = req.params.id;

//     const sql = "DELETE FROM students WHERE id = ?";

//     db.query(sql, [id], (err) => {

//         if (err) {
//             console.log(err);
//             return res.send("Delete Failed");
//         }

//         res.redirect("/admin/students");

//     });

// });

// // Admin Courses List
// app.get("/admin/courses", (req, res) => {

//     if (!req.session.admin) {
//         return res.redirect("/admin/login");
//     }

//     const sql = "SELECT * FROM courses";

//     db.query(sql, (err, courses) => {

//         if (err) {
//             console.log(err);
//             return res.send("Database Error");
//         }

//         res.render("admin-courses", {
//             courses
//         });

//     });

// });

// app.get("/admin/courses/add", (req, res) => {

//     if (!req.session.admin) {
//         return res.redirect("/admin/login");
//     }

//     res.render("add-course");

// });


// app.post("/admin/courses/add", (req, res) => {

//     const { course_name, class: className, subject, description } = req.body;

//     const sql = `
//         INSERT INTO courses(course_name, class, subject, description)
//         VALUES (?, ?, ?, ?)
//     `;

//     db.query(
//         sql,
//         [course_name, className, subject, description],
//         (err) => {

//             if (err) {
//                 console.log(err);
//                 return res.send("Error");
//             }

//             res.redirect("/admin/courses");

//         }
//     );

// });

// // Edit Course Page
// app.get("/admin/courses/edit/:id", (req, res) => {

//     if (!req.session.admin) {
//         return res.redirect("/admin/login");
//     }

//     const id = req.params.id;

//     const sql = "SELECT * FROM courses WHERE id = ?";

//     db.query(sql, [id], (err, result) => {

//         if (err) {
//             console.log(err);
//             return res.send("Database Error");
//         }

//         res.render("edit-course", {
//             course: result[0]
//         });

//     });

// });


// // Update Course
// app.post("/admin/courses/edit/:id", (req, res) => {

//     const id = req.params.id;

//     const { course_name, class: className, subject, description } = req.body;

//     const sql = `
//         UPDATE courses
//         SET course_name = ?,
//             class = ?,
//             subject = ?,
//             description = ?
//         WHERE id = ?
//     `;

//     db.query(
//         sql,
//         [course_name, className, subject, description, id],
//         (err) => {

//             if (err) {
//                 console.log(err);
//                 return res.send("Update Failed");
//             }

//             res.redirect("/admin/courses");

//         }
//     );

// });


// // Delete Course
// app.get("/admin/courses/delete/:id", (req, res) => {

//     if (!req.session.admin) {
//         return res.redirect("/admin/login");
//     }

//     const id = req.params.id;

//     const sql = "DELETE FROM courses WHERE id = ?";

//     db.query(sql, [id], (err) => {

//         if (err) {
//             console.log(err);
//             return res.send("Delete Failed");
//         }

//         res.redirect("/admin/courses");

//     });

// });


// //Asign page route
// app.get("/admin/assign-course", (req, res) => {

//     if (!req.session.admin) {
//         return res.redirect("/admin/login");
//     }

//     db.query("SELECT * FROM students", (err, students) => {

//         if (err) {
//             console.log(err);
//             return res.send("Database Error");
//         }

//         db.query("SELECT * FROM courses", (err, courses) => {

//             if (err) {
//                 console.log(err);
//                 return res.send("Database Error");
//             }

//             res.render("assign-course", {
//                 students,
//                 courses
//             });

//         });

//     });

// });

// //Asign save routes
// app.post("/admin/assign-course", (req, res) => {

//     const { student_id, course_id } = req.body;

//     const sql = `
//         INSERT INTO student_courses(student_id, course_id)
//         VALUES (?, ?)
//     `;

//     db.query(sql, [student_id, course_id], (err) => {

//         if (err) {
//             console.log(err);
//             return res.send("Assignment Failed");
//         }

//         res.redirect("/admin/dashboard");

//     });

// });


// // Attendance Page
// app.get("/admin/attendance", (req, res) => {

//     if (!req.session.admin) {
//         return res.redirect("/admin/login");
//     }

//     db.query("SELECT * FROM students", (err, students) => {

//         if (err) {
//             console.log(err);
//             return res.send("Database Error");
//         }

//         db.query("SELECT * FROM courses", (err, courses) => {

//             if (err) {
//                 console.log(err);
//                 return res.send("Database Error");
//             }

//             res.render("attendance", {
//                 students,
//                 courses
//             });

//         });

//     });

// });

// // Save Attendance
// app.post("/admin/attendance", (req, res) => {

//     const {
//         student_id,
//         course_id,
//         attendance_date,
//         status
//     } = req.body;

//     const sql = `
//         INSERT INTO attendance
//         (student_id, course_id, attendance_date, status)
//         VALUES (?, ?, ?, ?)
//     `;

//     db.query(
//         sql,
//         [student_id, course_id, attendance_date, status],
//         (err) => {

//             if (err) {
//                 console.log(err);
//                 return res.send("Attendance Save Failed");
//             }

//             res.redirect("/admin/attendance");

//         }
//     );

// });

// // Attendance List
// app.get("/admin/attendance/list", (req, res) => {

//     if (!req.session.admin) {
//         return res.redirect("/admin/login");
//     }

//     const sql = `
//         SELECT
//             attendance.id,
//             students.name AS student_name,
//             courses.course_name,
//             attendance.attendance_date,
//             attendance.status
//         FROM attendance
//         JOIN students ON attendance.student_id = students.id
//         JOIN courses ON attendance.course_id = courses.id
//         ORDER BY attendance.attendance_date DESC
//     `;

//     db.query(sql, (err, attendance) => {

//         if (err) {
//             console.log(err);
//             return res.send("Database Error");
//         }

//         res.render("attendance-list", {
//             attendance
//         });

//     });

// });


// // Fees Page
// app.get("/admin/fees", (req, res) => {

//     if (!req.session.admin) {
//         return res.redirect("/admin/login");
//     }

//     db.query("SELECT * FROM students", (err, students) => {

//         if (err) {
//             console.log(err);
//             return res.send("Database Error");
//         }

//         res.render("fees", {
//             students
//         });

//     });

// });


// // Save Fees
// app.post("/admin/fees", (req, res) => {

//     const {
//         student_id,
//         amount,
//         payment_date,
//         status
//     } = req.body;

//     const sql = `
//         INSERT INTO fees(student_id, amount, payment_date, status)
//         VALUES (?, ?, ?, ?)
//     `;

//     db.query(
//         sql,
//         [student_id, amount, payment_date, status],
//         (err) => {

//             if (err) {
//                 console.log(err);
//                 return res.send("Fees Save Failed");
//             }

//             res.redirect("/admin/fees");

//         }
//     );

// });

// // ==========================
// // Fees Records
// // ==========================
// app.get("/admin/fees/list", (req, res) => {

//     if (!req.session.admin) {
//         return res.redirect("/admin/login");
//     }

//     const sql = `
//         SELECT
//             fees.id,
//             students.name,
//             fees.amount,
//             fees.payment_date,
//             fees.status
//         FROM fees
//         JOIN students
//         ON fees.student_id = students.id
//         ORDER BY fees.id DESC
//     `;

//     db.query(sql, (err, fees) => {

//         if (err) {
//             console.log(err);
//             return res.send("Database Error");
//         }

//         res.render("fees-list", {
//             fees
//         });

//     });

// });


// // Delete Fees
// app.get("/admin/fees/delete/:id", (req, res) => {

//     if (!req.session.admin) {
//         return res.redirect("/admin/login");
//     }

//     const id = req.params.id;

//     db.query("DELETE FROM fees WHERE id = ?", [id], (err) => {

//         if (err) {
//             console.log(err);
//             return res.send("Delete Failed");
//         }

//         res.redirect("/admin/fees/list");

//     });

// });


// // Edit Fees Page
// app.get("/admin/fees/edit/:id", (req, res) => {

//     if (!req.session.admin) {
//         return res.redirect("/admin/login");
//     }

//     const id = req.params.id;

//     db.query("SELECT * FROM fees WHERE id = ?", [id], (err, feeResult) => {

//         if (err) {
//             console.log(err);
//             return res.send("Database Error");
//         }

//         db.query("SELECT * FROM students", (err, students) => {

//             if (err) {
//                 console.log(err);
//                 return res.send("Database Error");
//             }

//             res.render("edit-fees", {
//                 fee: feeResult[0],
//                 students
//             });

//         });

//     });

// });


// // Update Fees
// app.post("/admin/fees/edit/:id", (req, res) => {

//     const id = req.params.id;

//     const {
//         student_id,
//         amount,
//         payment_date,
//         status
//     } = req.body;

//     const sql = `
//         UPDATE fees
//         SET
//             student_id = ?,
//             amount = ?,
//             payment_date = ?,
//             status = ?
//         WHERE id = ?
//     `;

//     db.query(
//         sql,
//         [student_id, amount, payment_date, status, id],
//         (err) => {

//             if (err) {
//                 console.log(err);
//                 return res.send("Update Failed");
//             }

//             res.redirect("/admin/fees/list");

//         }
//     );

// });


// // Results Page
// app.get("/admin/results", (req, res) => {

//     if (!req.session.admin) {
//         return res.redirect("/admin/login");
//     }

//     db.query("SELECT * FROM students", (err, students) => {

//         if (err) {
//             console.log(err);
//             return res.send("Database Error");
//         }

//         db.query("SELECT * FROM courses", (err, courses) => {

//             if (err) {
//                 console.log(err);
//                 return res.send("Database Error");
//             }

//             res.render("results", {
//                 students,
//                 courses
//             });

//         });

//     });

// });


// // Save Result
// app.post("/admin/results", (req, res) => {

//     const {
//         student_id,
//         course_id,
//         marks,
//         total_marks,
//         exam_name
//     } = req.body;

//     const sql = `
//         INSERT INTO results
//         (student_id, course_id, marks, total_marks, exam_name)
//         VALUES (?, ?, ?, ?, ?)
//     `;

//     db.query(
//         sql,
//         [student_id, course_id, marks, total_marks, exam_name],
//         (err) => {

//             if (err) {
//                 console.log(err);
//                 return res.send("Result Save Failed");
//             }

//             res.redirect("/admin/results");

//         }
//     );

// });


// // Results List
// app.get("/admin/results/list", (req, res) => {

//     if (!req.session.admin) {
//         return res.redirect("/admin/login");
//     }

//     const sql = `
//         SELECT
//             results.id,
//             students.name,
//             courses.course_name,
//             results.exam_name,
//             results.marks,
//             results.total_marks
//         FROM results
//         JOIN students ON results.student_id = students.id
//         JOIN courses ON results.course_id = courses.id
//         ORDER BY results.id DESC
//     `;

//     db.query(sql, (err, results) => {

//         if (err) {
//             console.log(err);
//             return res.send("Database Error");
//         }

//         res.render("results-list", {
//             results
//         });

//     });

// });

// // Delete Result
// app.get("/admin/results/delete/:id", (req, res) => {

//     if (!req.session.admin) {
//         return res.redirect("/admin/login");
//     }

//     const id = req.params.id;

//     db.query(
//         "DELETE FROM results WHERE id = ?",
//         [id],
//         (err) => {

//             if (err) {
//                 console.log(err);
//                 return res.send("Delete Failed");
//             }

//             res.redirect("/admin/results/list");

//         }
//     );

// });


// // Edit Result Page
// app.get("/admin/results/edit/:id", (req, res) => {

//     if (!req.session.admin) {
//         return res.redirect("/admin/login");
//     }

//     const id = req.params.id;

//     db.query(
//         "SELECT * FROM results WHERE id = ?",
//         [id],
//         (err, resultData) => {

//             if (err) {
//                 console.log(err);
//                 return res.send("Database Error");
//             }

//             db.query("SELECT * FROM students", (err, students) => {

//                 if (err) {
//                     console.log(err);
//                     return res.send("Database Error");
//                 }

//                 db.query("SELECT * FROM courses", (err, courses) => {

//                     if (err) {
//                         console.log(err);
//                         return res.send("Database Error");
//                     }

//                     res.render("edit-result", {
//                         result: resultData[0],
//                         students,
//                         courses
//                     });

//                 });

//             });

//         }
//     );

// });

// // Update Result
// app.post("/admin/results/edit/:id", (req, res) => {

//     const id = req.params.id;

//     const {
//         student_id,
//         course_id,
//         exam_name,
//         marks,
//         total_marks
//     } = req.body;

//     const sql = `
//         UPDATE results
//         SET
//             student_id = ?,
//             course_id = ?,
//             exam_name = ?,
//             marks = ?,
//             total_marks = ?
//         WHERE id = ?
//     `;

//     db.query(
//         sql,
//         [
//             student_id,
//             course_id,
//             exam_name,
//             marks,
//             total_marks,
//             id
//         ],
//         (err) => {

//             if (err) {
//                 console.log(err);
//                 return res.send("Update Failed");
//             }

//             res.redirect("/admin/results/list");

//         }
//     );

// });

// // Notice Page
// app.get("/admin/notices", (req, res) => {

//     if (!req.session.admin) {
//         return res.redirect("/admin/login");
//     }

//     res.render("notices");

// });

// // Save Notice
// app.post("/admin/notices", (req, res) => {

//     const {
//         title,
//         description,
//         notice_date
//     } = req.body;

//     const sql = `
//         INSERT INTO notices
//         (title, description, notice_date)
//         VALUES (?, ?, ?)
//     `;

//     db.query(
//         sql,
//         [title, description, notice_date],
//         (err) => {

//             if (err) {
//                 console.log(err);
//                 return res.send("Notice Save Failed");
//             }

//             res.redirect("/admin/notices");

//         }
//     );

// });


// // Notice List
// app.get("/admin/notices/list", (req, res) => {

//     if (!req.session.admin) {
//         return res.redirect("/admin/login");
//     }

//     db.query(
//         "SELECT * FROM notices ORDER BY notice_date DESC",
//         (err, notices) => {

//             if (err) {
//                 console.log(err);
//                 return res.send("Database Error");
//             }

//             res.render("notices-list", {
//                 notices
//             });

//         }
//     );

// });


// // Delete Notice
// app.get("/admin/notices/delete/:id", (req, res) => {

//     if (!req.session.admin) {
//         return res.redirect("/admin/login");
//     }

//     const id = req.params.id;

//     db.query(
//         "DELETE FROM notices WHERE id = ?",
//         [id],
//         (err) => {

//             if (err) {
//                 console.log(err);
//                 return res.send("Delete Failed");
//             }

//             res.redirect("/admin/notices/list");

//         }
//     );

// });


// // Edit Notice Page
// app.get("/admin/notices/edit/:id", (req, res) => {

//     if (!req.session.admin) {
//         return res.redirect("/admin/login");
//     }

//     const id = req.params.id;

//     db.query(
//         "SELECT * FROM notices WHERE id = ?",
//         [id],
//         (err, result) => {

//             if (err) {
//                 console.log(err);
//                 return res.send("Database Error");
//             }

//             res.render("edit-notice", {
//                 notice: result[0]
//             });

//         }
//     );

// });


// // Update Notice
// app.post("/admin/notices/edit/:id", (req, res) => {

//     const id = req.params.id;

//     const {
//         title,
//         description,
//         notice_date
//     } = req.body;

//     const sql = `
//         UPDATE notices
//         SET title = ?, description = ?, notice_date = ?
//         WHERE id = ?
//     `;

//     db.query(
//         sql,
//         [title, description, notice_date, id],
//         (err) => {

//             if (err) {
//                 console.log(err);
//                 return res.send("Update Failed");
//             }

//             res.redirect("/admin/notices/list");

//         }
//     );

// });

// //profile page route
// app.get("/student/profile", (req, res) => {

//     if (!req.session.student) {
//         return res.redirect("/login");
//     }

//     res.render("student-profile", {
//         student: req.session.student
//     });

// });

// // Update Profile
// app.post("/student/profile", (req, res) => {

//     const studentId = req.session.student.id;
//     const { name, email, phone } = req.body;

//     db.query(
//         "UPDATE students SET name=?, email=?, phone=? WHERE id=?",
//         [name, email, phone, studentId],
//         (err) => {

//             if (err) {
//                 return res.send("Update Failed");
//             }

//             // session update
//             req.session.student.name = name;
//             req.session.student.email = email;
//             req.session.student.phone = phone;

//             res.render("student-profile", {
//                 student: req.session.student,
//                 success: "Profile updated successfully ✅"
//             });

//         }
//     );

// });


// //Change Password

// app.post("/student/change-password", (req, res) => {

//     const studentId = req.session.student.id;
//     const { oldPassword, newPassword } = req.body;

//     db.query(
//         "SELECT * FROM students WHERE id=?",
//         [studentId],
//         async (err, result) => {

//             if (err) return res.send("Error");

//             const user = result[0];

//             const match = await bcrypt.compare(oldPassword, user.password);

//             if (!match) {
//                 return res.render("student-profile", {
//                     student: req.session.student,
//                     error: "Old password incorrect ❌"
//                 });
//             }

//             const hashed = await bcrypt.hash(newPassword, 10);

//             db.query(
//                 "UPDATE students SET password=? WHERE id=?",
//                 [hashed, studentId],
//                 (err) => {

//                     if (err) {
//                         return res.render("student-profile", {
//                             student: req.session.student,
//                             error: "Update Failed ❌"
//                         });
//                     }

//                     return res.render("student-profile", {
//                         student: req.session.student,
//                         success: "Password updated successfully ✅"
//                     });

//                 }
//             );

//         }
//     );

// });


// // Admin Logout
// app.get("/admin/logout", (req, res) => {

//     req.session.destroy((err) => {

//         if (err) {
//             return res.send("Logout Failed");
//         }

//         res.redirect("/admin/login");

//     });

// });


// // ===========================
// // Admin Profile Page
// // ===========================
// app.get("/admin/profile", (req, res) => {

//     if (!req.session.admin) {
//         return res.redirect("/admin/login");
//     }

//     res.render("admin-profile", {
//         admin: req.session.admin
//     });

// });


// // ===========================
// // Update Admin Profile
// // ===========================
// app.post("/admin/profile", (req, res) => {

//     if (!req.session.admin) {
//         return res.redirect("/admin/login");
//     }

//     const adminId = req.session.admin.id;

//     const { name, email } = req.body;

//     const sql = `
//         UPDATE admins
//         SET name=?, email=?
//         WHERE id=?
//     `;

//     db.query(sql, [name, email, adminId], (err) => {

//         if (err) {
//             console.log(err);
//             return res.send("Profile Update Failed");
//         }

//         // Session Update
//         req.session.admin.name = name;
//         req.session.admin.email = email;

//         res.render("admin-profile", {
//             admin: req.session.admin,
//             success: "✅ Profile Updated Successfully!"
//         });

//     });

// });


// // ===========================
// // Change Admin Password
// // ===========================
// app.post("/admin/change-password", (req, res) => {

//     if (!req.session.admin) {
//         return res.redirect("/admin/login");
//     }

//     const adminId = req.session.admin.id;

//     const { oldPassword, newPassword } = req.body;

//     db.query(
//         "SELECT * FROM admins WHERE id=?",
//         [adminId],
//         async (err, result) => {

//             if (err) return res.send("Database Error");

//             const admin = result[0];

//             const match = await bcrypt.compare(
//                 oldPassword,
//                 admin.password
//             );

//             if (!match) {
//                 return res.send("Old Password Incorrect");
//             }

//             const hashedPassword =
//                 await bcrypt.hash(newPassword, 10);

//             db.query(
//                 "UPDATE admins SET password=? WHERE id=?",
//                 [hashedPassword, adminId],
//                 (err) => {

//                     if (err) {
//                         return res.send("Password Update Failed");
//                     }

//                    req.session.admin.password = hashedPassword;

//                     res.render("admin-profile", {
//                      admin: req.session.admin,
//                      success: "✅ Password Changed Successfully!"
//                     });
//                 }
//             );

//         }

//     );

// });

// // ======================
// // Notes Upload Page
// // ======================

// app.get("/admin/notes", (req, res) => {

//     if (!req.session.admin) {
//         return res.redirect("/admin/login");
//     }

//     db.query("SELECT * FROM courses", (err, courses) => {

//         if (err) {
//             console.log(err);
//             return res.send("Database Error");
//         }

//         res.render("notes", {
//             courses
//         });

//     });

// });

// // ======================
// // Save Notes
// // ======================

// app.post("/admin/notes", upload.single("pdf"), (req, res) => {

//     if (!req.session.admin) {
//         return res.redirect("/admin/login");
//     }

//     const {
//         course_id,
//         title,
//         description,
//         upload_date
//     } = req.body;

//     const file_name = req.file.filename;

//     const sql = `
//         INSERT INTO notes
//         (course_id, title, description, file_name, upload_date)
//         VALUES (?, ?, ?, ?, ?)
//     `;

//     db.query(
//         sql,
//         [
//             course_id,
//             title,
//             description,
//             file_name,
//             upload_date
//         ],
//         (err) => {

//             if (err) {
//                 console.log(err);
//                 return res.send("Upload Failed");
//             }

//             res.redirect("/admin/notes/list");

//         }
//     );

// });

// // ======================
// // Notes List
// // ======================

// app.get("/admin/notes/list", (req, res) => {

//     if (!req.session.admin) {
//         return res.redirect("/admin/login");
//     }

//     const sql = `
//         SELECT
//             notes.*,
//             courses.course_name
//         FROM notes
//         JOIN courses
//         ON notes.course_id = courses.id
//         ORDER BY notes.id DESC
//     `;

//     db.query(sql, (err, notes) => {

//         if (err) {
//             console.log(err);
//             return res.send("Database Error");
//         }

//         res.render("notes-list", {
//             notes
//         });

//     });

// });


// app.get("/admin/notes/delete/:id", (req, res) => {

//     if (!req.session.admin) {
//         return res.redirect("/admin/login");
//     }

//     db.query(
//         "DELETE FROM notes WHERE id=?",
//         [req.params.id],
//         (err) => {

//             if (err) {
//                 console.log(err);
//                 return res.send("Delete Failed");
//             }

//             res.redirect("/admin/notes/list");

//         }
//     );

// });


// // ======================
// // Student Study Material
// // ======================

// app.get("/student/notes", (req, res) => {

//     if (!req.session.student) {
//         return res.redirect("/login");
//     }

//     const studentId = req.session.student.id;

//     const sql = `
//         SELECT
//             notes.*,
//             courses.course_name
//         FROM notes
//         JOIN courses
//         ON notes.course_id = courses.id
//         JOIN student_courses
//         ON student_courses.course_id = courses.id
//         WHERE student_courses.student_id = ?
//         ORDER BY notes.upload_date DESC
//     `;

//     db.query(sql, [studentId], (err, notes) => {

//         if (err) {
//             console.log(err);
//             return res.send("Database Error");
//         }

//         res.render("student-notes", {
//             student: req.session.student,
//             notes
//         });

//     });

// });

// // admin reports

// app.get("/admin/reports", (req, res) => {

//     if (!req.session.admin) {
//         return res.redirect("/admin/login");
//     }

//     res.render("reports");

// });

// // admin report student pdf
// app.get("/admin/reports/students/pdf", (req, res) => {

//     if (!req.session.admin) {
//         return res.redirect("/admin/login");
//     }

//     db.query("SELECT * FROM students", (err, students) => {

//         if (err) {
//             return res.send("Database Error");
//         }

//         const doc = new PDFDocument();

//         res.setHeader(
//             "Content-Disposition",
//             "attachment; filename=Students_Report.pdf"
//         );

//         res.setHeader(
//             "Content-Type",
//             "application/pdf"
//         );

//         doc.pipe(res);

//         doc.fontSize(20)
//            .text("Sandeep Coaching Classes", {
//                align: "center"
//            });

//         doc.moveDown();

//         doc.fontSize(16)
//            .text("Students Report");

//         doc.moveDown();

//         students.forEach((student, index) => {

//             doc.fontSize(12).text(
//                 `${index + 1}. ${student.name} | ${student.email} | ${student.phone}`
//             );

//         });

//         doc.end();

//     });

// });

// // admin report fees pdf

// app.get("/admin/reports/fees/pdf", (req, res) => {

//     if (!req.session.admin) {
//         return res.redirect("/admin/login");
//     }

//     const sql = `
//         SELECT
//             fees.*,
//             students.name
//         FROM fees
//         JOIN students
//         ON fees.student_id = students.id
//     `;

//     db.query(sql, (err, fees) => {

//         if (err) return res.send("Database Error");

//         const doc = new PDFDocument();

//         res.setHeader(
//             "Content-Disposition",
//             "attachment; filename=Fees_Report.pdf"
//         );

//         res.setHeader("Content-Type", "application/pdf");

//         doc.pipe(res);

//         doc.fontSize(20).text("Sandeep Coaching Classes", {
//             align: "center"
//         });

//         doc.moveDown();

//         doc.fontSize(16).text("Fees Report");

//         doc.moveDown();

//         fees.forEach((fee, index) => {

//             doc.fontSize(12).text(
//                 `${index + 1}. ${fee.name} | ₹${fee.amount} | ${fee.status}`
//             );

//         });

//         doc.end();

//     });

// });


// //admin reports result pdf
// app.get("/admin/reports/results/pdf", (req, res) => {

//     if (!req.session.admin) {
//         return res.redirect("/admin/login");
//     }

//     const sql = `
//         SELECT
//             results.*,
//             students.name
//         FROM results
//         JOIN students
//         ON results.student_id = students.id
//     `;

//     db.query(sql, (err, results) => {

//         if (err) return res.send("Database Error");

//         const doc = new PDFDocument();

//         res.setHeader(
//             "Content-Disposition",
//             "attachment; filename=Results_Report.pdf"
//         );

//         res.setHeader("Content-Type", "application/pdf");

//         doc.pipe(res);

//         doc.fontSize(20).text("Sandeep Coaching Classes", {
//             align: "center"
//         });

//         doc.moveDown();

//         doc.fontSize(16).text("Results Report");

//         doc.moveDown();

//         results.forEach((result, index) => {

//             doc.fontSize(12).text(
//                 `${index + 1}. ${result.name} | ${result.subject} | Marks : ${result.marks}`
//             );

//         });

//         doc.end();

//     });

// });
// admin request

// app.get("/admin/requests", (req, res) => {

//     if (!req.session.admin) {
//         return res.redirect("/admin/login");
//     }

//     db.query(
//         "SELECT * FROM students WHERE status='Pending'",
//         (err, students) => {

//             if (err) {
//                 return res.send("Database Error");
//             }

//             res.render("admin-requests", {
//                 students
//             });

//         }
//     );

// });
// // accept approve
// app.post("/admin/approve/:id", (req, res) => {

//     if (!req.session.admin) {
//         return res.redirect("/admin/login");
//     }

//     const studentId = req.params.id;

//     // Student details lo
//     db.query(
//         "SELECT * FROM students WHERE id=?",
//         [studentId],
//         async (err, result) => {

//             if (err || result.length === 0) {
//                 return res.send("Student not found");
//             }

//             const student = result[0];

//             // Status update karo
//             db.query(
//                 "UPDATE students SET status='Approved' WHERE id=?",
//                 [studentId],
//                 async (err) => {

//                     if (err) {
//                         return res.send("Error");
//                     }

//                     // 📧 Email bhejo
//                     try {

//                         await transporter.sendMail({

//                             from: process.env.EMAIL_USER,

//                             to: student.email,

//                             subject: "🎉 Registration Approved",

//                             html: `
//                                 <h2>Congratulations ${student.name}! 🎉</h2>

//                                 <p>Your registration has been <b>Approved</b>.</p>

//                                 <p>You can now login to the Coaching Management System.</p>

//                                 <br>

//                                 <p>Best Wishes,<br>
//                                 Coaching Management Team</p>
//                             `

//                         });

//                         console.log("✅ Approval Email Sent");

//                     } catch (mailError) {

//                         console.log("❌ Email Error:", mailError);

//                     }

//                     req.session.success = "✅ Student Approved Successfully!";

//                     res.redirect("/admin/requests");

//                 }
//             );

//         }
//     );

// });

// // reject aproval
// app.post("/admin/reject/:id", (req, res) => {

//     if (!req.session.admin) {
//         return res.redirect("/admin/login");
//     }

//     const studentId = req.params.id;

//     // Student details fetch
//     db.query(
//         "SELECT * FROM students WHERE id=?",
//         [studentId],
//         async (err, result) => {

//             if (err || result.length === 0) {
//                 return res.send("Student not found");
//             }

//             const student = result[0];

//             // Update Status
//             db.query(
//                 "UPDATE students SET status='Rejected' WHERE id=?",
//                 [studentId],
//                 async (err) => {

//                     if (err) {
//                         console.log(err);
//                         return res.send("Error");
//                     }

//                     // 📧 Send Rejection Email
//                     try {

//                         await transporter.sendMail({

//                             from: process.env.EMAIL_USER,

//                             to: student.email,

//                             subject: "❌ Registration Rejected",

//                             html: `
//                                 <h2>Hello ${student.name}</h2>

//                                 <p>We are sorry to inform you that your registration has been <b>Rejected</b>.</p>

//                                 <p>If you think this is a mistake, please contact the coaching administration.</p>

//                                 <br>

//                                 <p>Thank You,<br>
//                                 Coaching Management Team</p>
//                             `

//                         });

//                         console.log("✅ Rejection Email Sent");

//                     } catch (mailError) {

//                         console.log("❌ Email Error:", mailError);

//                     }

//                     req.session.success = "❌ Student Rejected Successfully!";

//                     res.redirect("/admin/requests");

//                 }

//             );

//         }

//     );

// });
// // temparary test email

// app.get("/test-email", async (req, res) => {

//     try {

//         await transporter.sendMail({

//             from: process.env.EMAIL_USER,

//             to: process.env.EMAIL_USER,

//             subject: "Coaching Management Test",

//             html: `
//                 <h2>✅ Email Working Successfully</h2>

//                 <p>Nodemailer is configured correctly.</p>

//                 <h3>Congratulations 🎉</h3>
//             `

//         });

//         res.send("✅ Email Sent Successfully");

//     } catch (err) {

//         console.log(err);

//         res.send("❌ Email Failed");

//     }

// });

// // forgor password route

// app.get("/forgot-password",(req,res)=>{

//     res.render("forgot-password");

// });


// app.post("/forgot-password", (req, res) => {

//     const email = req.body.email;

//     // Pehle Students table check
//     db.query(
//         "SELECT * FROM students WHERE email=?",
//         [email],
//         async (err, result) => {

//             if (err) {
//                 console.log(err);
//                 return res.send("Server Error");
//             }

//             // Student mila
//             if (result.length > 0) {

//                 const otp = Math.floor(100000 + Math.random() * 900000);

//                 req.session.otp = otp;
//                 req.session.email = email;
//                 req.session.role = "student";
//                 req.session.otpExpiry = Date.now() + 5 * 60 * 1000;

//                 try {

//                     await transporter.sendMail({

//                         from: process.env.EMAIL_USER,

//                         to: email,

//                         subject: "🔐 Password Reset OTP",

//                         html: `
//                             <h2>Password Reset</h2>

//                             <p>Your OTP is:</p>

//                             <h1>${otp}</h1>

//                             <p>This OTP is valid for 5 minutes.</p>
//                         `

//                     });

//                     return res.redirect("/verify-otp");

//                 } catch (mailError) {

//                     console.log(mailError);

//                     return res.send("Email Sending Failed");

//                 }

//             }

//             // Student nahi mila to Admin check
//             db.query(
//                 "SELECT * FROM admin WHERE email=?",
//                 [email],
//                 async (err, adminResult) => {

//                     if (err) {
//                         console.log(err);
//                         return res.send("Server Error");
//                     }

//                     if (adminResult.length > 0) {

//                         const otp = Math.floor(100000 + Math.random() * 900000);

//                         req.session.otp = otp;
//                         req.session.email = email;
//                         req.session.role = "admin";
//                         req.session.otpExpiry = Date.now() + 5 * 60 * 1000;

//                         try {

//                             await transporter.sendMail({

//                                 from: process.env.EMAIL_USER,

//                                 to: email,

//                                 subject: "🔐 Password Reset OTP",

//                                 html: `
//                                     <h2>Password Reset</h2>

//                                     <p>Your OTP is:</p>

//                                     <h1>${otp}</h1>

//                                     <p>This OTP is valid for 5 minutes.</p>
//                                 `

//                             });

//                             return res.redirect("/verify-otp");

//                         } catch (mailError) {

//                             console.log(mailError);

//                             return res.send("Email Sending Failed");

//                         }

//                     }

//                     return res.send("Email not found.");

//                 }

//             );

//         }

//     );

// });

// // verify otp
// app.get("/verify-otp", (req, res) => {

//     res.render("verify-otp");

// });

// app.post("/verify-otp", (req, res) => {

//     const userOtp = req.body.otp;

//     // OTP Expire Check
//     if (Date.now() > req.session.otpExpiry) {
//         return res.send("❌ OTP Expired");
//     }

//     // OTP Match Check
//     if (userOtp == req.session.otp) {

//         return res.redirect("/reset-password");

//     } else {

//         return res.send("❌ Invalid OTP");

//     }

// });


// // reset password

// app.get("/reset-password", (req, res) => {

//     res.render("reset-password");

// });

// app.post("/reset-password", async (req, res) => {

//     const { password, confirmPassword } = req.body;

//     if (password !== confirmPassword) {

//         return res.send("Passwords do not match.");

//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Student
//     if (req.session.role === "student") {

//         db.query(

//             "UPDATE students SET password=? WHERE email=?",

//             [hashedPassword, req.session.email],

//             (err) => {

//                 if (err) return res.send("Database Error");

//                 // Session Clear
//                 req.session.otp = null;
//                 req.session.email = null;
//                 req.session.role = null;
//                 req.session.otpExpiry = null;

//                 res.send(`
//                     <h2>✅ Password Updated Successfully!</h2>
//                     <a href="/login">Go to Login</a>
//                 `);

//             }

//         );

//     }

//     // Admin
//     else {

//         db.query(

//             "UPDATE admin SET password=? WHERE email=?",

//             [hashedPassword, req.session.email],

//             (err) => {

//                 if (err) return res.send("Database Error");

//                 req.session.otp = null;
//                 req.session.email = null;
//                 req.session.role = null;
//                 req.session.otpExpiry = null;

//                 res.send(`
//                     <h2>✅ Password Updated Successfully!</h2>
//                     <a href="/admin/login">Go to Admin Login</a>
//                 `);

//             }

//         );

//     }

// });
app.listen(port,()=>{
  console.log(" listenin the server 8080");
});
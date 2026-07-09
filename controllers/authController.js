const db = require("../models/db");
const bcrypt = require("bcrypt");
const transporter = require("../mail");

// ==============================
// Register Page
// ==============================

exports.showRegister = (req, res) => {
    res.render("register");
};

// ==============================
// Register Student
// ==============================

exports.registerStudent = async (req, res) => {

    const { name, email, phone, password } = req.body;

    try {

        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = `
            INSERT INTO students
            (name, email, phone, password, status)
            VALUES (?, ?, ?, ?, ?)
        `;

        db.query(
            sql,
            [name, email, phone, hashedPassword, "Pending"],
            async (err) => {

                if (err) {
                    console.log(err);
                    return res.send("Registration failed");
                }

                // ==============================
                // Email to Admin
                // ==============================

                try {

                    await transporter.sendMail({

                        from: process.env.EMAIL_USER,

                        to: process.env.EMAIL_USER,

                        subject: "🆕 New Student Registration",

                        html: `
                            <h2>New Student Registration</h2>
                            <hr>

                            <p><b>Name:</b> ${name}</p>

                            <p><b>Email:</b> ${email}</p>

                            <p><b>Phone:</b> ${phone}</p>

                            <p><b>Status:</b> Pending Approval</p>

                            <br>

                            <p>Please login to the Admin Panel and approve this student.</p>
                        `

                    });

                    console.log("✅ Admin notification email sent.");

                } catch (mailError) {

                    console.log("❌ Email Error:", mailError);

                }

                res.send(`
                    <h2>✅ Registration Successful!</h2>

                    <p>Your account is waiting for admin approval.</p>

                    <a href="/login">Go to Login</a>
                `);

            }
        );

    } catch (error) {

        console.log(error);

        res.send("Something went wrong");

    }

};



// ==============================
// Login Page
// ==============================

exports.showLogin = (req, res) => {
    res.render("login");
};

// ==============================
// Student Login
// ==============================

exports.loginStudent = async (req, res) => {

    const { email, password } = req.body;

    const sql = "SELECT * FROM students WHERE email = ?";

    db.query(sql, [email], async (err, result) => {

        if (err) {
            console.log(err);
            return res.send("Server error");
        }

        if (result.length === 0) {
            return res.send("User not found");
        }

        const student = result[0];

        // Password Check
        const match = await bcrypt.compare(password, student.password);

        if (!match) {
            return res.send("Wrong password");
        }

        // Status Check
        if (student.status === "Pending") {
            return res.send("⏳ Your account is waiting for admin approval.");
        }

        if (student.status === "Rejected") {
            return res.send("❌ Your registration has been rejected. Please contact the coaching.");
        }

        // Login Allowed
        req.session.student = student;

        res.redirect("/dashboard");

    });

};



// ==============================
// Student Logout
// ==============================

exports.logoutStudent = (req, res) => {

    req.session.destroy((err) => {

        if (err) {
            return res.send("Logout Failed");
        }

        res.redirect("/login");

    });

};


// ==============================
// Admin Login Page
// ==============================

exports.showAdminLogin = (req, res) => {

    res.render("admin-login");

};

// ==============================
// Admin Login
// ==============================

exports.loginAdmin = (req, res) => {

    const { email, password } = req.body;

    const sql = "SELECT * FROM admins WHERE email = ?";

    db.query(sql, [email], async (err, result) => {

        if (err) {
            console.log(err);
            return res.send("Server Error");
        }

        if (result.length === 0) {
            return res.send("Admin Not Found");
        }

        const admin = result[0];

        const match = await bcrypt.compare(password, admin.password);

        if (!match) {
            return res.send("Wrong Password");
        }

        req.session.admin = admin;

        res.redirect("/admin/dashboard");

    });

};


// ==============================
// Admin Logout
// ==============================

exports.logoutAdmin = (req, res) => {

    req.session.destroy((err) => {

        if (err) {
            return res.send("Logout Failed");
        }

        res.redirect("/admin/login");

    });

};


// ==============================
// Forgot Password Page
// ==============================

exports.showForgotPassword = (req, res) => {

    res.render("forgot-password");

};

// ==============================
// Send OTP
// ==============================

exports.sendOTP = (req, res) => {

    const email = req.body.email;

    // Pehle Students table check
    db.query(
        "SELECT * FROM students WHERE email=?",
        [email],
        async (err, result) => {

            if (err) {
                console.log(err);
                return res.send("Server Error");
            }

            // Student mila
            if (result.length > 0) {

                const otp = Math.floor(100000 + Math.random() * 900000);

                req.session.otp = otp;
                req.session.email = email;
                req.session.role = "student";
                req.session.otpExpiry = Date.now() + 5 * 60 * 1000;

                try {

                    await transporter.sendMail({

                        from: process.env.EMAIL_USER,
                        to: email,
                        subject: "🔐 Password Reset OTP",

                        html: `
                        <h2>Password Reset</h2>

                        <p>Your OTP is:</p>

                        <h1>${otp}</h1>

                        <p>This OTP is valid for 5 minutes.</p>
                        `

                    });

                    return res.redirect("/verify-otp");

                } catch (mailError) {

                    console.log(mailError);

                    return res.send("Email Sending Failed");

                }

            }

            // Student nahi mila to Admin check
            db.query(
                "SELECT * FROM admin WHERE email=?",
                [email],
                async (err, adminResult) => {

                    if (err) {
                        console.log(err);
                        return res.send("Server Error");
                    }

                    if (adminResult.length > 0) {

                        const otp = Math.floor(100000 + Math.random() * 900000);

                        req.session.otp = otp;
                        req.session.email = email;
                        req.session.role = "admin";
                        req.session.otpExpiry = Date.now() + 5 * 60 * 1000;

                        try {

                            await transporter.sendMail({

                                from: process.env.EMAIL_USER,
                                to: email,
                                subject: "🔐 Password Reset OTP",

                                html: `
                                <h2>Password Reset</h2>

                                <p>Your OTP is:</p>

                                <h1>${otp}</h1>

                                <p>This OTP is valid for 5 minutes.</p>
                                `

                            });

                            return res.redirect("/verify-otp");

                        } catch (mailError) {

                            console.log(mailError);

                            return res.send("Email Sending Failed");

                        }

                    }

                    return res.send("Email not found.");

                }

            );

        }

    );

};

// ==============================
// Verify OTP Page
// ==============================

exports.showVerifyOTP = (req, res) => {

    res.render("verify-otp");

};

// ==============================
// Verify OTP
// ==============================

exports.verifyOTP = (req, res) => {

    const userOtp = req.body.otp;

    // OTP Expire Check
    if (Date.now() > req.session.otpExpiry) {
        return res.send("❌ OTP Expired");
    }

    // OTP Match Check
    if (userOtp == req.session.otp) {

        return res.redirect("/reset-password");

    } else {

        return res.send("❌ Invalid OTP");

    }

};


// ==============================
// Reset Password Page
// ==============================

exports.showResetPassword=(req,res)=>{
     res.render("reset-password");
}

// ==============================
// Reset Password
// ==============================

exports.resetPassword = async (req, res) => {

    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {

        return res.send("Passwords do not match.");

    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Student
    if (req.session.role === "student") {

        db.query(

            "UPDATE students SET password=? WHERE email=?",

            [hashedPassword, req.session.email],

            (err) => {

                if (err) return res.send("Database Error");

                // Session Clear
                req.session.otp = null;
                req.session.email = null;
                req.session.role = null;
                req.session.otpExpiry = null;

                res.send(`
                    <h2>✅ Password Updated Successfully!</h2>
                    <a href="/login">Go to Login</a>
                `);

            }

        );

    }

    // Admin
    else {

        db.query(

            "UPDATE admin SET password=? WHERE email=?",

            [hashedPassword, req.session.email],

            (err) => {

                if (err) return res.send("Database Error");

                req.session.otp = null;
                req.session.email = null;
                req.session.role = null;
                req.session.otpExpiry = null;

                res.send(`
                    <h2>✅ Password Updated Successfully!</h2>
                    <a href="/admin/login">Go to Admin Login</a>
                `);

            }

        );

    }

};
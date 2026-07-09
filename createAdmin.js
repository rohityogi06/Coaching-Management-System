const db = require("./db");
const bcrypt = require("bcrypt");

async function createAdmin() {

    const name = "Sandeep";
    const email = "admin@sandeep.com";
    const password = "admin123";

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
        INSERT INTO admins (name, email, password)
        VALUES (?, ?, ?)
    `;

    db.query(sql, [name, email, hashedPassword], (err) => {

        if (err) {
            console.log(err);
            return;
        }

        console.log("✅ Admin Created Successfully");

        process.exit();

    });

}

createAdmin();
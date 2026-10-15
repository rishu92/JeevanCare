
const db = require("./config/db");
const bcrypt = require("bcrypt");

async function createFirstAdmin() {
  try {
    // Check whether this admin email already exists
    const [users] = await db.execute(
      "SELECT id, role FROM users WHERE email = ? LIMIT 1",
      ["admin@jeevancare.local"]
    );

    if (users.length > 0) {
      console.log("This email already exists. No changes made.");
      return;
    }

    // Read password securely from environment variable
    const password = process.env.FIRST_ADMIN_PASSWORD;

    if (!password || password.length < 12) {
      console.log(
        "Set FIRST_ADMIN_PASSWORD to a password of at least 12 characters."
      );
      return;
    }

    // Hash password before storing it
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the first admin account
    await db.execute(
      `INSERT INTO users (full_name, mobile, email, password, role)
       VALUES (?, ?, ?, ?, ?)`,
      [
        "JeevanCare Admin",
        "9263082046",
        "admin@jeevancare.local",
        hashedPassword,
        "admin"
      ]
    );

    console.log("First admin created successfully.");
    console.log("Email: admin@jeevancare.local");
    console.log("Keep your password private.");
  } catch (error) {
    console.error("Admin creation failed:", error.message);
  } finally {
    await db.end();
  }
}

createFirstAdmin();

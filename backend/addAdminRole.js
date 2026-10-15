
const db = require("./config/db");

async function addAdminRole() {
    try {
        await db.execute(`
            ALTER TABLE users
            MODIFY COLUMN role ENUM('patient', 'doctor', 'admin') NOT NULL
        `);

        console.log("Admin role added successfully.");
    } catch (error) {
        console.error("Unable to add admin role:", error.message);
        process.exitCode = 1;
    } finally {
        await db.end();
    }
}

addAdminRole();

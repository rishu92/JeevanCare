
const db = require("./config/db");

async function checkTable() {
    try {
        console.log("Checking doctor_documents table...");

        const [rows] = await db.execute(
            "SHOW TABLES LIKE 'doctor_documents'"
        );

        if (rows.length > 0) {
            console.log("SUCCESS: doctor_documents table exists.");
        } else {
            console.log("NOT FOUND: doctor_documents table does not exist.");
        }
    } catch (error) {
        console.error("Database check failed:", error.message);
    } finally {
        await db.end();
    }
}

checkTable();

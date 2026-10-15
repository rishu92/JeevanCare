console.log("Doctor documents table script started");
const db = require("./config/db");

async function createTable() {
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS doctor_documents (
                id INT AUTO_INCREMENT PRIMARY KEY,
                doctor_id INT NOT NULL,
                document_type VARCHAR(50) NOT NULL,
                file_name VARCHAR(255) NOT NULL,
                file_path VARCHAR(500) NOT NULL,
                review_status ENUM(
                    'pending',
                    'approved',
                    'rejected'
                ) NOT NULL DEFAULT 'pending',
                uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_doctor_id (doctor_id)
            )
        `);

        console.log("doctor_documents table created successfully.");
    } catch (error) {
        console.error("Table creation failed:", error.message);
        process.exitCode = 1;
    } finally {
        await db.end();
    }
}

createTable();

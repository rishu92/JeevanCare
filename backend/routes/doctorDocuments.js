
const express = require("express");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");

const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Private folder for doctor verification documents
const uploadDir = path.join(__dirname, "../private_uploads");

fs.mkdirSync(uploadDir, { recursive: true });

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
        cb(null, `${crypto.randomUUID()}.pdf`);
    }
});

// Upload configuration: one PDF, maximum 5 MB
const upload = multer({
    storage,

    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1
    },

    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();

        if (
            file.mimetype !== "application/pdf" ||
            ext !== ".pdf"
        ) {
            return cb(
                new Error("Please upload one PDF file only.")
            );
        }

        cb(null, true);
    }
});

// Safely remove a file from disk
function removeFile(filePath) {
    try {
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (error) {
        console.error("File cleanup error:", error.message);
    }
}

// ==========================================
// UPLOAD ONE COMBINED DOCTOR DOCUMENT PDF
// ==========================================

router.post(
    "/upload",

    // Verify login token
    authMiddleware,

    // Only doctors can upload documents
    (req, res, next) => {
        if (req.user.role !== "doctor") {
            return res.status(403).json({
                success: false,
                message:
                    "Only doctors can upload verification documents."
            });
        }

        next();
    },

    // IMPORTANT: frontend field name must be "document"
    (req, res, next) => {
        upload.single("document")(req, res, (error) => {
            if (error) {
                return res.status(400).json({
                    success: false,
                    message:
                        error.code === "LIMIT_FILE_SIZE"
                            ? "The PDF must be 5 MB or smaller."
                            : error.code === "LIMIT_FILE_COUNT" ||
                              error.code === "LIMIT_UNEXPECTED_FILE"
                            ? "Please upload only one PDF using the document field."
                            : error.message
                });
            }

            next();
        });
    },

    // Save document details in MySQL
    async (req, res) => {
        const uploadedFile = req.file;

        let connection;
        let transactionStarted = false;
        let oldFilesToRemove = [];

        try {
            // Check if a file was uploaded
            if (!uploadedFile) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Please upload your combined documents PDF."
                });
            }

            connection = await db.getConnection();

            await connection.beginTransaction();
            transactionStarted = true;

            // Find the logged-in doctor's profile
            const [doctorRows] = await connection.execute(
                `SELECT id, verification_status
                 FROM doctors
                 WHERE user_id = ?
                 LIMIT 1
                 FOR UPDATE`,
                [req.user.id]
            );

            if (doctorRows.length === 0) {
                await connection.rollback();
                transactionStarted = false;

                removeFile(uploadedFile.path);

                return res.status(404).json({
                    success: false,
                    message: "Doctor profile not found."
                });
            }

            const doctor = doctorRows[0];

            // Already approved doctors cannot re-upload
            if (doctor.verification_status === "approved") {
                await connection.rollback();
                transactionStarted = false;

                removeFile(uploadedFile.path);

                return res.status(400).json({
                    success: false,
                    message: "Your account is already approved."
                });
            }

            // Get existing verification documents
            const [existingDocuments] = await connection.execute(
                `SELECT id, file_path
                 FROM doctor_documents
                 WHERE doctor_id = ?`,
                [doctor.id]
            );

            // Do not allow another upload while pending review
            if (
                doctor.verification_status === "pending" &&
                existingDocuments.length > 0
            ) {
                await connection.rollback();
                transactionStarted = false;

                removeFile(uploadedFile.path);

                return res.status(409).json({
                    success: false,
                    message:
                        "Your documents are already submitted and awaiting admin review."
                });
            }

            // If rejected, replace the previous submission
            if (doctor.verification_status === "rejected") {
                oldFilesToRemove = existingDocuments.map(
                    (document) => document.file_path
                );

                await connection.execute(
                    `DELETE FROM doctor_documents
                     WHERE doctor_id = ?`,
                    [doctor.id]
                );
            }

            // Save the new PDF record
            await connection.execute(
                `INSERT INTO doctor_documents
                 (
                    doctor_id,
                    document_type,
                    file_name,
                    file_path,
                    review_status
                 )
                 VALUES (?, 'combined_documents', ?, ?, 'pending')`,
                [
                    doctor.id,
                    uploadedFile.originalname,
                    uploadedFile.filename
                ]
            );

            // Keep the doctor offline until approval
            await connection.execute(
                `UPDATE doctors
                 SET verification_status = 'pending',
                     availability_status = 'offline'
                 WHERE id = ?`,
                [doctor.id]
            );

            await connection.commit();
            transactionStarted = false;

            // Remove files from the rejected submission
            for (const oldFile of oldFilesToRemove) {
                removeFile(
                    path.join(
                        uploadDir,
                        path.basename(oldFile)
                    )
                );
            }

            return res.status(201).json({
                success: true,
                message:
                    "PDF uploaded successfully. Waiting for admin approval.",
                verification_status: "pending",
                uploaded_count: 1
            });

        } catch (error) {
            if (connection && transactionStarted) {
                try {
                    await connection.rollback();
                } catch (rollbackError) {
                    console.error(
                        "Rollback error:",
                        rollbackError.message
                    );
                }
            }

            // Remove the newly uploaded file if saving failed
            removeFile(uploadedFile?.path);

            console.error("Document upload error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to save verification document."
            });

        } finally {
            if (connection) {
                connection.release();
            }
        }
    }
);

module.exports = router;

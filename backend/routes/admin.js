import express from "express";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import db from "../config/db.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

// =====================================================
// Helper: Validate positive numeric IDs
// =====================================================
function isValidId(id) {
  return Number.isInteger(id) && id > 0;
}

// =====================================================
// 1. GET ALL DOCTORS
// Includes pending, approved and rejected doctors
// =====================================================
router.get(
  "/doctors",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const [doctors] = await db.execute(`
        SELECT
          d.id AS doctor_id,
          d.user_id,
          d.full_name,
          u.email,
          u.mobile,
          d.specialization,
          d.qualification,
          d.experience_years,
          d.verification_status,
          d.availability_status,
          d.created_at
        FROM doctors d
        LEFT JOIN users u ON u.id = d.user_id
        ORDER BY d.created_at DESC
      `);

      return res.json({
        success: true,
        doctors
      });
    } catch (error) {
      console.error("Admin doctors error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Unable to fetch doctors."
      });
    }
  }
);

// =====================================================
// 2. GET PENDING DOCTORS
// =====================================================
router.get(
  "/pending-doctors",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const [doctors] = await db.execute(`
        SELECT
          d.id AS doctor_id,
          d.user_id,
          d.full_name,
          u.email,
          u.mobile,
          d.specialization,
          d.qualification,
          d.experience_years,
          d.verification_status,
          d.availability_status,
          d.created_at
        FROM doctors d
        LEFT JOIN users u ON u.id = d.user_id
        WHERE d.verification_status = 'pending'
        ORDER BY d.created_at ASC
      `);

      return res.json({
        success: true,
        doctors
      });
    } catch (error) {
      console.error("Pending doctors error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Unable to fetch pending doctors."
      });
    }
  }
);

// =====================================================
// 3. DIRECTLY APPROVE DOCTOR
// Documents are NOT required for this admin action
// PATCH /api/admin/doctors/:doctorId/approve
// =====================================================
router.patch(
  "/doctors/:doctorId/approve",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    let connection;

    try {
      const doctorId = Number(req.params.doctorId);

      if (!isValidId(doctorId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid doctor ID."
        });
      }

      connection = await db.getConnection();
      await connection.beginTransaction();

      const [doctors] = await connection.execute(
        `SELECT id, user_id, verification_status
         FROM doctors
         WHERE id = ?
         FOR UPDATE`,
        [doctorId]
      );

      if (doctors.length === 0) {
        await connection.rollback();

        return res.status(404).json({
          success: false,
          message: "Doctor not found."
        });
      }

      // Admin can approve even when no documents were uploaded.
      await connection.execute(
        `UPDATE doctors
         SET verification_status = 'approved'
         WHERE id = ?`,
        [doctorId]
      );

      await connection.commit();

      return res.json({
        success: true,
        message: "Doctor approved successfully by admin.",
        doctor_id: doctorId,
        approval_method: "manual_admin_approval"
      });
    } catch (error) {
      if (connection) {
        await connection.rollback();
      }

      console.error("Direct doctor approval error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Unable to approve doctor."
      });
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }
);

// =====================================================
// 4. DIRECTLY REJECT DOCTOR
// Documents are NOT required for this admin action
// PATCH /api/admin/doctors/:doctorId/reject
// Body: { "reason": "Reason for rejection" }
// =====================================================
router.patch(
  "/doctors/:doctorId/reject",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    let connection;

    try {
      const doctorId = Number(req.params.doctorId);

      const reason =
        typeof req.body?.reason === "string"
          ? req.body.reason.trim()
          : "";

      if (!isValidId(doctorId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid doctor ID."
        });
      }

      if (!reason || reason.length > 500) {
        return res.status(400).json({
          success: false,
          message: "Provide a rejection reason (maximum 500 characters)."
        });
      }

      connection = await db.getConnection();
      await connection.beginTransaction();

      const [doctors] = await connection.execute(
        `SELECT id
         FROM doctors
         WHERE id = ?
         FOR UPDATE`,
        [doctorId]
      );

      if (doctors.length === 0) {
        await connection.rollback();

        return res.status(404).json({
          success: false,
          message: "Doctor not found."
        });
      }

      await connection.execute(
        `UPDATE doctors
         SET verification_status = 'rejected',
             availability_status = 'offline'
         WHERE id = ?`,
        [doctorId]
      );

      await connection.commit();

      return res.json({
        success: true,
        message: "Doctor rejected successfully by admin.",
        doctor_id: doctorId,
        reason
      });
    } catch (error) {
      if (connection) {
        await connection.rollback();
      }

      console.error("Direct doctor rejection error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Unable to reject doctor."
      });
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }
);

// =====================================================
// 5. GET ALL PATIENTS
// =====================================================
router.get(
  "/patients",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const [patients] = await db.execute(`
        SELECT
          id,
          full_name,
          mobile,
          email,
          created_at
        FROM users
        WHERE role = 'patient'
        ORDER BY created_at DESC
      `);

      return res.json({
        success: true,
        patients
      });
    } catch (error) {
      console.error("Admin patients error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Unable to fetch patients."
      });
    }
  }
);

// =====================================================
// 6. DELETE PATIENT
// DELETE /api/admin/patients/:patientId
//
// Deletes the patient's consultations and account.
// =====================================================
router.delete(
  "/patients/:patientId",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    let connection;

    try {
      const patientId = Number(req.params.patientId);

      if (!isValidId(patientId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid patient ID."
        });
      }

      connection = await db.getConnection();
      await connection.beginTransaction();

      const [patients] = await connection.execute(
        `SELECT id
         FROM users
         WHERE id = ? AND role = 'patient'
         FOR UPDATE`,
        [patientId]
      );

      if (patients.length === 0) {
        await connection.rollback();

        return res.status(404).json({
          success: false,
          message: "Patient not found."
        });
      }

      await connection.execute(
        "DELETE FROM consultations WHERE patient_id = ?",
        [patientId]
      );

      await connection.execute(
        "DELETE FROM users WHERE id = ? AND role = 'patient'",
        [patientId]
      );

      await connection.commit();

      return res.json({
        success: true,
        message: "Patient and associated consultations deleted successfully."
      });
    } catch (error) {
      if (connection) {
        await connection.rollback();
      }

      console.error("Delete patient error:", error.message);

      return res.status(500).json({
        success: false,
        message:
          "Unable to delete patient. Check database relationships and dependent records."
      });
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }
);

// =====================================================
// 7. DELETE DOCTOR
// DELETE /api/admin/doctors/:doctorId
//
// Deletes the doctor's consultations, document records,
// doctor profile and associated user account.
// =====================================================
router.delete(
  "/doctors/:doctorId",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    let connection;

    try {
      const doctorId = Number(req.params.doctorId);

      if (!isValidId(doctorId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid doctor ID."
        });
      }

      connection = await db.getConnection();
      await connection.beginTransaction();

      const [doctors] = await connection.execute(
        `SELECT id, user_id
         FROM doctors
         WHERE id = ?
         FOR UPDATE`,
        [doctorId]
      );

      if (doctors.length === 0) {
        await connection.rollback();

        return res.status(404).json({
          success: false,
          message: "Doctor not found."
        });
      }

      const userId = doctors[0].user_id;

      // Keep this order to avoid common foreign-key conflicts.
      await connection.execute(
        "DELETE FROM consultations WHERE doctor_id = ?",
        [doctorId]
      );

      await connection.execute(
        "DELETE FROM doctor_documents WHERE doctor_id = ?",
        [doctorId]
      );

      await connection.execute(
        "DELETE FROM doctors WHERE id = ?",
        [doctorId]
      );

      await connection.execute(
        "DELETE FROM users WHERE id = ?",
        [userId]
      );

      await connection.commit();

      return res.json({
        success: true,
        message: "Doctor account and associated records deleted successfully."
      });
    } catch (error) {
      if (connection) {
        await connection.rollback();
      }

      console.error("Delete doctor error:", error.message);

      return res.status(500).json({
        success: false,
        message:
          "Unable to delete doctor. Check database relationships and dependent records."
      });
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }
);

// =====================================================
// 8. GET ALL CONSULTATIONS
// =====================================================
router.get(
  "/consultations",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const [consultations] = await db.execute(`
        SELECT
          c.id,
          c.patient_id,
          c.doctor_id,
          c.reason,
          c.preferred_language,
          c.status,
          c.created_at,
          p.full_name AS patient_name,
          p.mobile AS patient_mobile,
          p.email AS patient_email,
          d.full_name AS doctor_name,
          d.specialization
        FROM consultations c
        LEFT JOIN users p ON p.id = c.patient_id
        LEFT JOIN doctors d ON d.id = c.doctor_id
        ORDER BY c.created_at DESC
      `);

      return res.json({
        success: true,
        consultations
      });
    } catch (error) {
      console.error("Admin consultations error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Unable to fetch consultations."
      });
    }
  }
);

// =====================================================
// 9. GET DOCUMENTS UPLOADED BY A DOCTOR
// =====================================================
router.get(
  "/doctors/:doctorId/documents",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const doctorId = Number(req.params.doctorId);

      if (!isValidId(doctorId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid doctor ID."
        });
      }

      const [documents] = await db.execute(
        `SELECT
           id,
           doctor_id,
           document_type,
           file_name,
           review_status,
           uploaded_at
         FROM doctor_documents
         WHERE doctor_id = ?
         ORDER BY uploaded_at DESC`,
        [doctorId]
      );

      return res.json({
        success: true,
        documents
      });
    } catch (error) {
      console.error("Doctor documents error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Unable to fetch doctor documents."
      });
    }
  }
);

// =====================================================
// 10. SECURELY VIEW A DOCTOR DOCUMENT
// =====================================================
router.get(
  "/documents/:documentId/view",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const documentId = Number(req.params.documentId);

      if (!isValidId(documentId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid document ID."
        });
      }

      const [documents] = await db.execute(
        `SELECT file_path, document_type
         FROM doctor_documents
         WHERE id = ?
         LIMIT 1`,
        [documentId]
      );

      if (documents.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Document not found."
        });
      }

      const uploadDir = path.resolve(__dirname, "../private_uploads");
      const filePath = path.resolve(
        uploadDir,
        documents[0].file_path
      );

      // Prevent paths outside private_uploads.
      const relativePath = path.relative(uploadDir, filePath);

      if (
        !relativePath ||
        relativePath.startsWith("..") ||
        path.isAbsolute(relativePath) ||
        !fs.existsSync(filePath) ||
        !fs.statSync(filePath).isFile()
      ) {
        return res.status(404).json({
          success: false,
          message: "Document file not found."
        });
      }

      const ext = path.extname(filePath).toLowerCase();

      const mimeTypes = {
        ".pdf": "application/pdf",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png"
      };

      const contentType = mimeTypes[ext];

      if (!contentType) {
        return res.status(415).json({
          success: false,
          message: "Unsupported document format."
        });
      }

      res.setHeader("Content-Type", contentType);
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("Cache-Control", "private, no-store");
      res.setHeader("Content-Disposition", "inline");

      return res.sendFile(filePath);
    } catch (error) {
      console.error("Document view error:", error.message);

      if (!res.headersSent) {
        return res.status(500).json({
          success: false,
          message: "Unable to open document."
        });
      }
    }
  }
);

// =====================================================
// 11. APPROVE AN UPLOADED DOCUMENT
// Doctor is approved only if at least one document exists
// and all documents are approved.
// =====================================================
router.patch(
  "/documents/:documentId/approve",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    let connection;

    try {
      const documentId = Number(req.params.documentId);

      if (!isValidId(documentId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid document ID."
        });
      }

      connection = await db.getConnection();
      await connection.beginTransaction();

      const [documents] = await connection.execute(
        `SELECT id, doctor_id
         FROM doctor_documents
         WHERE id = ?
         FOR UPDATE`,
        [documentId]
      );

      if (documents.length === 0) {
        await connection.rollback();

        return res.status(404).json({
          success: false,
          message: "Document not found."
        });
      }

      const doctorId = documents[0].doctor_id;

      await connection.execute(
        `UPDATE doctor_documents
         SET review_status = 'approved'
         WHERE id = ?`,
        [documentId]
      );

      const [counts] = await connection.execute(
        `SELECT
           COUNT(*) AS total,
           SUM(review_status = 'approved') AS approved_count
         FROM doctor_documents
         WHERE doctor_id = ?`,
        [doctorId]
      );

      const allApproved =
        Number(counts[0].total) > 0 &&
        Number(counts[0].total) ===
          Number(counts[0].approved_count);

      if (allApproved) {
        await connection.execute(
          `UPDATE doctors
           SET verification_status = 'approved'
           WHERE id = ?`,
          [doctorId]
        );
      }

      await connection.commit();

      return res.json({
        success: true,
        message: allApproved
          ? "Document approved. Doctor verification is now approved."
          : "Document approved. Remaining documents still need approval.",
        doctor_approved: allApproved
      });
    } catch (error) {
      if (connection) {
        await connection.rollback();
      }

      console.error("Document approval error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Unable to approve document."
      });
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }
);

// =====================================================
// 12. REJECT AN UPLOADED DOCUMENT
// Body: { "reason": "Reason for rejection" }
// =====================================================
router.patch(
  "/documents/:documentId/reject",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    let connection;

    try {
      const documentId = Number(req.params.documentId);

      const reason =
        typeof req.body?.reason === "string"
          ? req.body.reason.trim()
          : "";

      if (!isValidId(documentId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid document ID."
        });
      }

      if (!reason || reason.length > 500) {
        return res.status(400).json({
          success: false,
          message: "Provide a rejection reason (maximum 500 characters)."
        });
      }

      connection = await db.getConnection();
      await connection.beginTransaction();

      const [documents] = await connection.execute(
        `SELECT id, doctor_id
         FROM doctor_documents
         WHERE id = ?
         FOR UPDATE`,
        [documentId]
      );

      if (documents.length === 0) {
        await connection.rollback();

        return res.status(404).json({
          success: false,
          message: "Document not found."
        });
      }

      const doctorId = documents[0].doctor_id;

      await connection.execute(
        `UPDATE doctor_documents
         SET review_status = 'rejected'
         WHERE id = ?`,
        [documentId]
      );

      await connection.execute(
        `UPDATE doctors
         SET verification_status = 'rejected',
             availability_status = 'offline'
         WHERE id = ?`,
        [doctorId]
      );

      await connection.commit();

      return res.json({
        success: true,
        message: "Document and doctor verification rejected.",
        reason
      });
    } catch (error) {
      if (connection) {
        await connection.rollback();
      }

      console.error("Document rejection error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Unable to reject document."
      });
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }
);

export default router;
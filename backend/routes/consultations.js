
const express = require("express");
const dbModule = require("../config/db");
const db = dbModule.default || dbModule;
const authMiddleware = require("../middleware/authMiddleware");
const doctorApproval = require("../middleware/doctorApproval");

const router = express.Router();


// ==========================================
// CREATE CONSULTATION REQUEST (PATIENT)
// ==========================================

router.post("/", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "patient") {
            return res.status(403).json({
                success: false,
                message: "Only patients can request consultations."
            });
        }

        const {
            doctor_id,
            reason,
            preferred_language
        } = req.body;

        if (!doctor_id || !reason || !reason.trim()) {
            return res.status(400).json({
                success: false,
                message: "Doctor and consultation reason are required."
            });
        }

        const [doctors] = await db.execute(
            `
            SELECT
                id,
                full_name,
                specialization,
                availability_status,
                verification_status
            FROM doctors
            WHERE id = ?
            LIMIT 1
            `,
            [doctor_id]
        );

        if (doctors.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found."
            });
        }

        const doctor = doctors[0];

        if (doctor.verification_status !== "approved") {
            return res.status(403).json({
                success: false,
                message: "This doctor is not verified yet."
            });
        }

        if (doctor.availability_status !== "available") {
            return res.status(400).json({
                success: false,
                message: "This doctor is currently unavailable."
            });
        }

        const [result] = await db.execute(
            `
            INSERT INTO consultations
            (
                patient_id,
                doctor_id,
                reason,
                preferred_language,
                status
            )
            VALUES (?, ?, ?, ?, 'requested')
            `,
            [
                req.user.id,
                doctor_id,
                reason.trim(),
                preferred_language || "Hindi"
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Consultation request sent successfully.",
            consultation: {
                id: result.insertId,
                doctor_id: doctor.id,
                doctor_name: doctor.full_name,
                specialization: doctor.specialization,
                status: "requested"
            }
        });

    } catch (error) {
        console.error("Consultation creation error:", error);
        console.error("SQL error details:", error.code, error.sqlMessage);

        return res.status(500).json({
            success: false,
            message: "Unable to create consultation request."
        });
    }
});


// ==========================================
// PATIENT CONSULTATION HISTORY
// ==========================================

router.get("/my", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "patient") {
            return res.status(403).json({
                success: false,
                message: "Only patients can access their consultation history."
            });
        }

        const [consultations] = await db.execute(
            `
            SELECT
                c.id,
                c.reason,
                c.preferred_language,
                c.status,
                c.created_at,

                d.id AS doctor_id,
                d.full_name AS doctor_name,
                d.specialization,
                d.qualification,
                d.experience_years,
                d.consultation_fee,
                d.language AS doctor_language,
                d.city,
                d.availability_status

            FROM consultations c

            JOIN doctors d
                ON c.doctor_id = d.id

            WHERE c.patient_id = ?

            ORDER BY c.created_at DESC
            `,
            [req.user.id]
        );

        return res.status(200).json({
            success: true,
            consultations
        });

    } catch (error) {
        console.error("Consultation history error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load consultation history."
        });
    }
});


// ==========================================
// GET APPROVED DOCTOR'S CONSULTATION REQUESTS
// ==========================================

router.get(
    "/doctor",
    authMiddleware,
    doctorApproval,
    async (req, res) => {
        try {
            const [doctorRows] = await db.execute(
                `
                SELECT
                    id,
                    full_name,
                    specialization,
                    qualification,
                    experience_years,
                    consultation_fee,
                    language,
                    city,
                    availability_status
                FROM doctors
                WHERE user_id = ?
                LIMIT 1
                `,
                [req.user.id]
            );

            if (doctorRows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Doctor profile not found."
                });
            }

            const doctor = doctorRows[0];

            const [consultations] = await db.execute(
                `
                SELECT
                    c.id,
                    c.reason,
                    c.preferred_language,
                    c.status,
                    c.created_at,

                    u.id AS patient_id,
                    u.full_name AS patient_name,
                    u.mobile AS patient_mobile,
                    u.email AS patient_email

                FROM consultations c

                JOIN users u
                    ON c.patient_id = u.id

                WHERE c.doctor_id = ?

                ORDER BY c.created_at DESC
                `,
                [doctor.id]
            );

            return res.status(200).json({
                success: true,
                doctor: {
                    id: doctor.id,
                    name: doctor.full_name,
                    specialization: doctor.specialization,
                    qualification: doctor.qualification,
                    experience_years: doctor.experience_years,
                    consultation_fee: doctor.consultation_fee,
                    language: doctor.language,
                    city: doctor.city,
                    availability_status: doctor.availability_status
                },
                consultations
            });

        } catch (error) {
            console.error("Doctor consultation loading error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to load consultation requests."
            });
        }
    }
);


// ==========================================
// ACCEPT CONSULTATION (APPROVED DOCTOR ONLY)
// ==========================================

router.patch(
    "/:id/accept",
    authMiddleware,
    doctorApproval,
    async (req, res) => {
        try {
            const consultationId = Number(req.params.id);

            if (!Number.isInteger(consultationId) || consultationId <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid consultation ID."
                });
            }

            const [doctorRows] = await db.execute(
                `
                SELECT id
                FROM doctors
                WHERE user_id = ?
                LIMIT 1
                `,
                [req.user.id]
            );

            if (doctorRows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Doctor profile not found."
                });
            }

            const doctorId = doctorRows[0].id;

            const [result] = await db.execute(
                `
                UPDATE consultations
                SET status = 'accepted'
                WHERE id = ?
                  AND doctor_id = ?
                  AND status = 'requested'
                `,
                [consultationId, doctorId]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Consultation not found or already processed."
                });
            }

            return res.status(200).json({
                success: true,
                message: "Consultation accepted successfully."
            });

        } catch (error) {
            console.error("Accept consultation error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to accept consultation."
            });
        }
    }
);


// ==========================================
// REJECT CONSULTATION (APPROVED DOCTOR ONLY)
// ==========================================

router.patch(
    "/:id/reject",
    authMiddleware,
    doctorApproval,
    async (req, res) => {
        try {
            const consultationId = Number(req.params.id);

            if (!Number.isInteger(consultationId) || consultationId <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid consultation ID."
                });
            }

            const [doctorRows] = await db.execute(
                `
                SELECT id
                FROM doctors
                WHERE user_id = ?
                LIMIT 1
                `,
                [req.user.id]
            );

            if (doctorRows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Doctor profile not found."
                });
            }

            const doctorId = doctorRows[0].id;

            const [result] = await db.execute(
                `
                UPDATE consultations
                SET status = 'rejected'
                WHERE id = ?
                  AND doctor_id = ?
                  AND status = 'requested'
                `,
                [consultationId, doctorId]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Consultation not found or already processed."
                });
            }

            return res.status(200).json({
                success: true,
                message: "Consultation rejected successfully."
            });

        } catch (error) {
            console.error("Reject consultation error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to reject consultation."
            });
        }
    }
);


module.exports = router;

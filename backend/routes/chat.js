const express = require("express");
const router = express.Router();

const dbModule = require("../config/db");
const db = dbModule.default || dbModule;
const authMiddleware = require("../middleware/authMiddleware");


// =========================================
// CHECK CHAT ACCESS
// =========================================

async function getConsultationAccess(consultationId, userId) {

    const [rows] = await db.query(
        `
        SELECT
            c.id,
            c.patient_id,
            c.doctor_id,
            c.status,
            d.user_id AS doctor_user_id
        FROM consultations c
        INNER JOIN doctors d
            ON c.doctor_id = d.id
        WHERE c.id = ?
        `,
        [consultationId]
    );


    if (rows.length === 0) {
        return null;
    }


    const consultation = rows[0];

    const isPatient =
        Number(consultation.patient_id) === Number(userId);

    const isDoctor =
        Number(consultation.doctor_user_id) === Number(userId);


    if (!isPatient && !isDoctor) {
        return null;
    }


    return consultation;
}


// =========================================
// GET CHAT MESSAGES
// GET /api/chat/:consultationId
// =========================================

router.get(
    "/:consultationId",
    authMiddleware,
    async (req, res) => {

        try {

            const consultationId =
                Number(req.params.consultationId);


            if (!Number.isInteger(consultationId)) {

                return res.status(400).json({
                    success: false,
                    message: "Invalid consultation ID."
                });

            }


            // -----------------------------------------
            // Check user access
            // -----------------------------------------

            const consultation =
                await getConsultationAccess(
                    consultationId,
                    req.user.id
                );


            if (!consultation) {

                return res.status(403).json({
                    success: false,
                    message: "You do not have access to this consultation."
                });

            }


            // -----------------------------------------
            // Chat allowed only for accepted/completed
            // consultations
            // -----------------------------------------

            if (
                consultation.status !== "accepted" &&
                consultation.status !== "completed"
            ) {

                return res.status(400).json({
                    success: false,
                    message: "Chat is available after the consultation is accepted."
                });

            }


            // -----------------------------------------
            // Get messages
            // -----------------------------------------

            const [messages] = await db.query(
                `
                SELECT
                    cm.id,
                    cm.consultation_id,
                    cm.sender_id,
                    cm.message,
                    cm.created_at,
                    u.full_name AS sender_name,
                    u.role AS sender_role
                FROM chat_messages cm
                INNER JOIN users u
                    ON cm.sender_id = u.id
                WHERE cm.consultation_id = ?
                ORDER BY cm.created_at ASC
                `,
                [consultationId]
            );


            return res.status(200).json({
                success: true,
                consultation: {
                    id: consultation.id,
                    status: consultation.status
                },
                messages
            });


        } catch (error) {

            console.error(
                "Get chat messages error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Unable to load chat messages."
            });

        }

    }
);


// =========================================
// SEND CHAT MESSAGE
// POST /api/chat/:consultationId
// =========================================

router.post(
    "/:consultationId",
    authMiddleware,
    async (req, res) => {

        try {

            const consultationId =
                Number(req.params.consultationId);

            const { message } = req.body;


            // -----------------------------------------
            // Validate consultation ID
            // -----------------------------------------

            if (!Number.isInteger(consultationId)) {

                return res.status(400).json({
                    success: false,
                    message: "Invalid consultation ID."
                });

            }


            // -----------------------------------------
            // Validate message
            // -----------------------------------------

            if (
                !message ||
                typeof message !== "string" ||
                message.trim().length === 0
            ) {

                return res.status(400).json({
                    success: false,
                    message: "Message is required."
                });

            }


            const cleanMessage =
                message.trim();


            if (cleanMessage.length > 1000) {

                return res.status(400).json({
                    success: false,
                    message: "Message cannot exceed 1000 characters."
                });

            }


            // -----------------------------------------
            // Check user access
            // -----------------------------------------

            const consultation =
                await getConsultationAccess(
                    consultationId,
                    req.user.id
                );


            if (!consultation) {

                return res.status(403).json({
                    success: false,
                    message: "You do not have access to this consultation."
                });

            }


            // -----------------------------------------
            // Chat only after acceptance
            // -----------------------------------------

            if (
                consultation.status !== "accepted" &&
                consultation.status !== "completed"
            ) {

                return res.status(400).json({
                    success: false,
                    message: "Chat is available after the consultation is accepted."
                });

            }


            // -----------------------------------------
            // Save message
            // -----------------------------------------

            const [result] = await db.query(
                `
                INSERT INTO chat_messages
                (
                    consultation_id,
                    sender_id,
                    message
                )
                VALUES (?, ?, ?)
                `,
                [
                    consultationId,
                    req.user.id,
                    cleanMessage
                ]
            );


            // -----------------------------------------
            // Get inserted message
            // -----------------------------------------

            const [messages] = await db.query(
                `
                SELECT
                    cm.id,
                    cm.consultation_id,
                    cm.sender_id,
                    cm.message,
                    cm.created_at,
                    u.full_name AS sender_name,
                    u.role AS sender_role
                FROM chat_messages cm
                INNER JOIN users u
                    ON cm.sender_id = u.id
                WHERE cm.id = ?
                `,
                [result.insertId]
            );


            return res.status(201).json({
                success: true,
                message: "Message sent successfully.",
                chatMessage: messages[0]
            });


        } catch (error) {

            console.error(
                "Send chat message error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Unable to send message."
            });

        }

    }
);


module.exports = router;
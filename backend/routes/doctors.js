const express = require("express");
const dbModule = require("../config/db");
const db = dbModule.default || dbModule;
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// ==========================================
// GET ALL DOCTORS
// ==========================================

router.get("/", authMiddleware, async (req, res) => {

    try {

        /*
        ==========================================
        DUPLICATE DOCTOR PROTECTION
        ==========================================

        If the same doctor profile exists more than
        once in the doctors table, only one record
        will be returned to the frontend.

        MIN(id) keeps the first doctor record.
        ==========================================
        */

        const [doctors] = await db.execute(
            `
            SELECT
                MIN(id) AS id,
                full_name,
                specialization,
                qualification,
                experience_years,
                consultation_fee,
                language,
                city,
                availability_status
            FROM doctors

            GROUP BY
                full_name,
                specialization,
                qualification,
                experience_years,
                consultation_fee,
                language,
                city,
                availability_status

            ORDER BY
                availability_status = 'available' DESC,
                full_name ASC
            `
        );


        return res.status(200).json({

            success: true,

            doctors: doctors

        });

    } catch (error) {

        console.error(
            "Doctor loading error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Unable to load doctors."

        });

    }

});


// ==========================================
// GET LOGGED-IN DOCTOR PROFILE
// ==========================================

router.get("/profile", authMiddleware, async (req, res) => {

    try {

        if (req.user.role !== "doctor") {

            return res.status(403).json({

                success: false,

                message:
                    "Only doctors can access this profile."

            });

        }


        const [doctors] = await db.execute(
            `
            SELECT
                id,
                user_id,
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


        if (doctors.length === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "Doctor profile not found."

            });

        }


        return res.status(200).json({

            success: true,

            doctor: doctors[0]

        });

    } catch (error) {

        console.error(
            "Doctor profile loading error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Unable to load doctor profile."

        });

    }

});


// ==========================================
// UPDATE LOGGED-IN DOCTOR PROFILE
// ==========================================

router.put("/profile", authMiddleware, async (req, res) => {

    try {

        if (req.user.role !== "doctor") {

            return res.status(403).json({

                success: false,

                message:
                    "Only doctors can update this profile."

            });

        }


        const {
            specialization,
            qualification,
            experience_years,
            consultation_fee,
            language,
            city,
            availability_status
        } = req.body;


        // ==========================================
        // VALIDATION
        // ==========================================

        if (
            !specialization ||
            !qualification ||
            !language ||
            !city ||
            !availability_status
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please fill all profile fields."

            });

        }


        const experience =
            Number(experience_years);


        const fee =
            Number(consultation_fee);


        if (
            Number.isNaN(experience) ||
            experience < 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Experience must be a valid number."

            });

        }


        if (
            Number.isNaN(fee) ||
            fee < 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Consultation fee must be a valid number."

            });

        }


        const allowedStatuses = [
            "available",
            "busy",
            "offline"
        ];


        if (
            !allowedStatuses.includes(
                availability_status
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid availability status."

            });

        }


        // ==========================================
        // UPDATE PROFILE
        // ==========================================

        const [result] = await db.execute(
            `
            UPDATE doctors

            SET
                specialization = ?,
                qualification = ?,
                experience_years = ?,
                consultation_fee = ?,
                language = ?,
                city = ?,
                availability_status = ?

            WHERE user_id = ?
            `,
            [
                specialization.trim(),
                qualification.trim(),
                experience,
                fee,
                language.trim(),
                city.trim(),
                availability_status,
                req.user.id
            ]
        );


        if (result.affectedRows === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "Doctor profile not found."

            });

        }


        // ==========================================
        // RETURN UPDATED PROFILE
        // ==========================================

        const [updatedDoctors] =
            await db.execute(
                `
                SELECT
                    id,
                    user_id,
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


        return res.status(200).json({

            success: true,

            message:
                "Doctor profile updated successfully.",

            doctor:
                updatedDoctors[0]

        });

    } catch (error) {

        console.error(
            "Doctor profile update error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Unable to update doctor profile."

        });

    }

});


module.exports = router;


const dbModule = require("../config/db");
const db = dbModule.default || dbModule;

const doctorApproval = async (req, res, next) => {
    try {
        if (req.user.role !== "doctor") {
            return res.status(403).json({
                success: false,
                message: "Only doctors can access this resource."
            });
        }

        const [doctors] = await db.execute(
            `
            SELECT verification_status
            FROM doctors
            WHERE user_id = ?
            LIMIT 1
            `,
            [req.user.id]
        );

        if (doctors.length === 0) {
            return res.status(403).json({
                success: false,
                message: "Doctor profile not found."
            });
        }

        const status = doctors[0].verification_status;

        if (status !== "approved") {
            return res.status(403).json({
                success: false,
                verification_status: status,
                message:
                    status === "pending"
                        ? "Waiting for admin approval."
                        : "Your verification was rejected. Please contact the administrator."
            });
        }

        next();
    } catch (error) {
        console.error("Doctor approval check error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to verify doctor approval status."
        });
    }
};

module.exports = doctorApproval;

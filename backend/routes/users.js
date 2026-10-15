const express = require("express");
const router = express.Router();

const dbModule = require("../config/db");
const db = dbModule.default || dbModule;
const authMiddleware = require("../middleware/authMiddleware");


// =========================================
// GET CURRENT USER PROFILE
// =========================================

router.get("/profile", authMiddleware, async (req, res) => {

    try {

        const [users] = await db.query(
            `
            SELECT
                id,
                full_name,
                mobile,
                email,
                role,
                created_at
            FROM users
            WHERE id = ?
            `,
            [req.user.id]
        );


        if (users.length === 0) {

            return res.status(404).json({
                success: false,
                message: "User profile not found."
            });

        }


        return res.status(200).json({
            success: true,
            user: users[0]
        });


    } catch (error) {

        console.error(
            "Get profile error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to load profile."
        });

    }

});


// =========================================
// UPDATE CURRENT USER PROFILE
// =========================================

router.put("/profile", authMiddleware, async (req, res) => {

    try {

        const {
            full_name,
            mobile,
            email
        } = req.body;


        // -----------------------------------------
        // Validation
        // -----------------------------------------

        if (!full_name || full_name.trim().length < 2) {

            return res.status(400).json({
                success: false,
                message: "Please enter a valid full name."
            });

        }


        if (!mobile || !/^[0-9]{10}$/.test(mobile)) {

            return res.status(400).json({
                success: false,
                message: "Please enter a valid 10-digit mobile number."
            });

        }


        if (
            !email ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ) {

            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address."
            });

        }


        // -----------------------------------------
        // Check duplicate email
        // -----------------------------------------

        const [emailUsers] = await db.query(
            `
            SELECT id
            FROM users
            WHERE email = ?
            AND id != ?
            `,
            [email.trim(), req.user.id]
        );


        if (emailUsers.length > 0) {

            return res.status(409).json({
                success: false,
                message: "This email address is already registered."
            });

        }


        // -----------------------------------------
        // Check duplicate mobile
        // -----------------------------------------

        const [mobileUsers] = await db.query(
            `
            SELECT id
            FROM users
            WHERE mobile = ?
            AND id != ?
            `,
            [mobile, req.user.id]
        );


        if (mobileUsers.length > 0) {

            return res.status(409).json({
                success: false,
                message: "This mobile number is already registered."
            });

        }


        // -----------------------------------------
        // Update user
        // -----------------------------------------

        await db.query(
            `
            UPDATE users
            SET
                full_name = ?,
                mobile = ?,
                email = ?
            WHERE id = ?
            `,
            [
                full_name.trim(),
                mobile,
                email.trim(),
                req.user.id
            ]
        );


        // -----------------------------------------
        // Get updated user
        // -----------------------------------------

        const [updatedUsers] = await db.query(
            `
            SELECT
                id,
                full_name,
                mobile,
                email,
                role,
                created_at
            FROM users
            WHERE id = ?
            `,
            [req.user.id]
        );


        return res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            user: updatedUsers[0]
        });


    } catch (error) {

        console.error(
            "Update profile error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to update profile."
        });

    }

});


module.exports = router;
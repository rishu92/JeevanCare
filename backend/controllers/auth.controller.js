
const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const dbModule = require("../config/db");
const db = dbModule.default || dbModule;

// ==========================================
// REGISTER USER
// ==========================================

const registerUser = async (req, res) => {
    const connection = await db.getConnection();

    try {
        const {
            full_name,
            name,
            mobile,
            email,
            password,
            role
        } = req.body;

        // Support both names
        const fullName = full_name || name;

        // ==========================================
        // BASIC VALIDATION
        // ==========================================

        if (
            !fullName ||
            !mobile ||
            !email ||
            !password ||
            !role
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });
        }

        if (
            role !== "patient" &&
            role !== "doctor"
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid user role."
            });
        }

        // ==========================================
        // MOBILE VALIDATION
        // ==========================================

        if (!/^[6-9]\d{9}$/.test(mobile)) {
            return res.status(400).json({
                success: false,
                message:
                    "Please enter a valid 10-digit mobile number."
            });
        }

        // ==========================================
        // EMAIL VALIDATION
        // ==========================================

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            return res.status(400).json({
                success: false,
                message:
                    "Please enter a valid email address."
            });
        }

        // ==========================================
        // PASSWORD VALIDATION
        // ==========================================

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message:
                    "Password must contain at least 8 characters."
            });
        }

        // ==========================================
        // CHECK EXISTING USER
        // ==========================================

        const [existingUsers] =
            await connection.execute(
                `
                SELECT id
                FROM users
                WHERE email = ?
                   OR mobile = ?
                LIMIT 1
                `,
                [
                    email.trim().toLowerCase(),
                    mobile.trim()
                ]
            );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message:
                    "Email or mobile number is already registered."
            });
        }

        // ==========================================
        // HASH PASSWORD
        // ==========================================

        const hashedPassword =
            await bcrypt.hash(password, 10);

        // ==========================================
        // START TRANSACTION
        // ==========================================

        await connection.beginTransaction();

        // ==========================================
        // CREATE USER
        // ==========================================

        const [result] =
            await connection.execute(
                `
                INSERT INTO users
                (
                    full_name,
                    mobile,
                    email,
                    password,
                    role
                )
                VALUES (?, ?, ?, ?, ?)
                `,
                [
                    fullName.trim(),
                    mobile.trim(),
                    email.trim().toLowerCase(),
                    hashedPassword,
                    role
                ]
            );

        const userId = result.insertId;

        // ==========================================
        // CREATE DOCTOR PROFILE
        // ==========================================

        if (role === "doctor") {
            await connection.execute(
                `
                INSERT INTO doctors
                (
                    user_id,
                    full_name,
                    specialization,
                    qualification,
                    experience_years,
                    consultation_fee,
                    language,
                    city,
                    availability_status,
                    verification_status
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `,
                [
                    userId,
                    fullName.trim(),
                    "General Physician",
                    "MBBS",
                    0,
                    299.00,
                    "English/Hindi",
                    "Delhi",
                    "offline",
                    "pending"
                ]
            );
        }

        // ==========================================
        // COMMIT
        // ==========================================

        await connection.commit();

        // ==========================================
        // RESPONSE
        // ==========================================

        return res.status(201).json({
            success: true,
            message: "Registration successful.",
            user: {
                id: userId,
                name: fullName.trim(),
                mobile: mobile.trim(),
                email: email.trim().toLowerCase(),
                role: role
            }
        });

    } catch (error) {
        try {
            await connection.rollback();
        } catch (rollbackError) {
            console.error(
                "Rollback error:",
                rollbackError
            );
        }

        console.error(
            "Registration error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to register user."
        });

    } finally {
        connection.release();
    }
};

// ==========================================
// LOGIN USER
// ==========================================

const loginUser = async (req, res) => {
    try {
        const {
            identifier,
            email,
            password
        } = req.body;

        // Support both old email format
        // and current identifier format

        const loginIdentifier =
            identifier || email;

        // ==========================================
        // VALIDATION
        // ==========================================

        if (
            !loginIdentifier ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Email/mobile and password are required."
            });
        }

        // ==========================================
        // FIND USER BY EMAIL OR MOBILE
        // ==========================================

        const [users] =
            await db.execute(
                `
                SELECT
                    u.id,
                    u.full_name,
                    u.mobile,
                    u.email,
                    u.password,
                    u.role,
                    d.verification_status
                FROM users u
                LEFT JOIN doctors d ON d.user_id = u.id
                WHERE u.email = ?
                   OR u.mobile = ?
                LIMIT 1
                `,
                [
                    loginIdentifier.trim().toLowerCase(),
                    loginIdentifier.trim()
                ]
            );

        // ==========================================
        // USER NOT FOUND
        // ==========================================

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid email/mobile or password."
            });
        }

        const user = users[0];

        // ==========================================
        // PASSWORD CHECK
        // ==========================================

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid email/mobile or password."
            });
        }

        // ==========================================
        // CREATE JWT
        // ==========================================

        const token = jwt.sign(
            {
                id: user.id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        // ==========================================
        // LOGIN RESPONSE
        // ==========================================

        return res.status(200).json({
            success: true,
            message: "Login successful.",
            token: token,
            user: {
                id: user.id,
                name: user.full_name,
                mobile: user.mobile,
                email: user.email,
                role: user.role,
                verification_status:
                    user.role === "doctor"
                        ? user.verification_status
                        : null
            }
        });

    } catch (error) {
        console.error(
            "Login error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to login user."
        });
    }
};

// ==========================================
// EXPORT
// ==========================================

module.exports = {
    registerUser,
    loginUser
};

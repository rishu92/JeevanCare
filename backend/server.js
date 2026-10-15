
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/db");
const chatRoutes = require("./routes/chat");
const authRoutes = require("./routes/auth");
const aiRoutes = require("./routes/ai");
const doctorRoutes = require("./routes/doctors");
const consultationRoutes = require("./routes/consultations");
const userRoutes = require("./routes/users");
const doctorDocumentRoutes = require("./routes/doctorDocuments");

const app = express();
const rateLimit = require("express-rate-limit");
const PORT = process.env.PORT || 5000;

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests. Please try again later."
    }
});

// ==========================================
// MIDDLEWARE
// ==========================================

const allowedOrigins = [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
];

app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests without an Origin header,
            // such as Postman or direct server requests.
            if (!origin) {
                return callback(null, true);
            }

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(
                new Error("Origin not allowed by CORS.")
            );
        },

        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],

        allowedHeaders: [
            "Content-Type",
            "Authorization"
        ]
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// VALIDATE ROUTERS
// ==========================================

const routes = [
    {
        name: "doctorDocumentRoutes",
        path: "/api/doctor-documents",
        router: doctorDocumentRoutes,
        limited: true
    },
    {
        name: "authRoutes",
        path: "/api/auth",
        router: authRoutes,
        limited: true
    },
    {
        name: "aiRoutes",
        path: "/api/ai",
        router: aiRoutes,
        limited: true
    },
    {
        name: "doctorRoutes",
        path: "/api/doctors",
        router: doctorRoutes,
        limited: true
    },
    {
        name: "consultationRoutes",
        path: "/api/consultations",
        router: consultationRoutes,
        limited: true
    },
    {
        name: "userRoutes",
        path: "/api/users",
        router: userRoutes,
        limited: true
    },
    {
        name: "chatRoutes",
        path: "/api/chat",
        router: chatRoutes,
        limited: false
    }
];

for (const route of routes) {
    if (typeof route.router !== "function") {
        console.error(
            `Invalid router: ${route.name}.`,
            "Expected an Express router function."
        );

        console.error(
            "Check the module export in the corresponding route file."
        );

        process.exit(1);
    }

    if (route.limited) {
        app.use(route.path, apiLimiter, route.router);
    } else {
        app.use(route.path, route.router);
    }

    console.log(`Route mounted: ${route.path}`);
}

// ==========================================
// BASIC ROUTE
// ==========================================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "JeevanCare Backend is running.",
        version: "1.0.0"
    });
});

// ==========================================
// HEALTH CHECK
// ==========================================

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        status: "healthy",
        service: "JeevanCare API"
    });
});

// ==========================================
// ERROR HANDLER
// ==========================================

app.use((err, req, res, next) => {
    console.error("Server Error:", err);

    if (res.headersSent) {
        return next(err);
    }

    res.status(500).json({
        success: false,
        message: "Something went wrong on the server."
    });
});

// ==========================================
// START SERVER
// ==========================================

async function startServer() {
    try {
        const adminModule = await import("./routes/admin.js");
        const adminRoutes = adminModule.default;

        if (typeof adminRoutes !== "function") {
            throw new Error("Admin router is not an Express router function.");
        }

        app.use("/api/admin", adminRoutes);

        console.log("Route mounted: /api/admin");
        app.get("/api/admin/test", (req, res) => {
    res.json({
        success: true,
        message: "Admin route working"
    });
});

        app.listen(PORT, () => {
            console.log("------------------------------------------");
            console.log("JeevanCare Backend");
            console.log("------------------------------------------");
            console.log(`Server running on http://localhost:${PORT}`);
            console.log(`Health check: http://localhost:${PORT}/api/health`);
            console.log("------------------------------------------");
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

startServer();

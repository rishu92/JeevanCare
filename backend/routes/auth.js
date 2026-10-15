const express = require("express");

const router = express.Router();

const {
    registerUser,
    loginUser
} = require("../controllers/auth.controller");

const authMiddleware = require("../middleware/authMiddleware");


router.post("/register", registerUser);

router.post("/login", loginUser);


// Protected route
router.get("/me", authMiddleware, (req, res) => {

    res.status(200).json({
        success: true,
        message: "Authentication successful.",
        user: req.user
    });

});


module.exports = router;
const express = require("express");
const router = express.Router();

const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");


// =========================================
// LOCAL AI HEALTH RESPONSE ENGINE
// =========================================

function generateHealthResponse(input) {

    const message = input.toLowerCase();


    // -----------------------------------------
    // EMERGENCY
    // -----------------------------------------

    if (
        message.includes("chest pain") ||
        message.includes("difficulty breathing") ||
        message.includes("can't breathe") ||
        message.includes("cannot breathe") ||
        message.includes("unconscious") ||
        message.includes("severe bleeding") ||
        message.includes("heart attack") ||
        message.includes("stroke")
    ) {

        return `
This may be a medical emergency.

Please do not rely on AI guidance in this situation. 
Call 112 or contact your nearest emergency medical service immediately.

If possible:
• Stay with the person.
• Keep them in a safe and comfortable position.
• Do not give food or medicine unless advised by a medical professional.
• Seek urgent medical attention.

JeevanCare AI provides general health guidance and is not a substitute for emergency medical care.
        `.trim();
    }


    // -----------------------------------------
    // FEVER
    // -----------------------------------------

    if (
        message.includes("fever") ||
        message.includes("temperature") ||
        message.includes("bukhar")
    ) {

        return `
For a mild fever, focus on rest and staying hydrated.

You can:
• Drink enough water and fluids.
• Take adequate rest.
• Wear comfortable clothing.
• Monitor your temperature.

If the fever is very high, lasts for several days, keeps getting worse, or is accompanied by severe symptoms, consult a qualified doctor.

JeevanCare AI provides general information and does not diagnose or prescribe medicines.
        `.trim();
    }


    // -----------------------------------------
    // HEADACHE
    // -----------------------------------------

    if (
        message.includes("headache") ||
        message.includes("head pain") ||
        message.includes("sir dard")
    ) {

        return `
For a mild headache, try resting in a quiet environment and staying hydrated.

You can:
• Drink sufficient water.
• Get adequate sleep.
• Take a break from screens.
• Avoid skipping meals.

If the headache is sudden and extremely severe, follows an injury, or occurs with confusion, weakness, vision problems, vomiting, or other serious symptoms, seek medical attention promptly.

If headaches keep recurring, consider consulting a doctor.
        `.trim();
    }


    // -----------------------------------------
    // COUGH / COLD
    // -----------------------------------------

    if (
        message.includes("cough") ||
        message.includes("cold") ||
        message.includes("sore throat") ||
        message.includes("runny nose") ||
        message.includes("khansi") ||
        message.includes("jukam")
    ) {

        return `
For common cough or cold symptoms:

• Stay hydrated.
• Get enough rest.
• Warm fluids may help soothe the throat.
• Avoid smoke and other irritants.

If you develop difficulty breathing, persistent high fever, chest pain, or symptoms that are getting significantly worse, consult a doctor promptly.
        `.trim();
    }


    // -----------------------------------------
    // STOMACH
    // -----------------------------------------

    if (
        message.includes("stomach") ||
        message.includes("abdominal") ||
        message.includes("vomiting") ||
        message.includes("diarrhea") ||
        message.includes("loose motion") ||
        message.includes("pet dard")
    ) {

        return `
For mild stomach-related symptoms:

• Drink enough fluids.
• Eat light and easily digestible food.
• Avoid very oily or spicy food temporarily.
• Take adequate rest.

If there is severe abdominal pain, blood in vomit or stool, repeated vomiting, signs of dehydration, or worsening symptoms, seek medical attention.
        `.trim();
    }


    // -----------------------------------------
    // TIREDNESS / WEAKNESS
    // -----------------------------------------

    if (
        message.includes("tired") ||
        message.includes("weakness") ||
        message.includes("weak") ||
        message.includes("fatigue") ||
        message.includes("thakan") ||
        message.includes("kamzori")
    ) {

        return `
Feeling tired can have many possible causes, including lack of sleep, dehydration, stress, poor nutrition, or illness.

Try:
• Getting adequate sleep.
• Drinking enough water.
• Eating balanced meals.
• Taking short breaks if you have been working or studying for long periods.

If the weakness is severe, persistent, unexplained, or associated with other concerning symptoms, consult a doctor.
        `.trim();
    }


    // -----------------------------------------
    // GENERAL HEALTH
    // -----------------------------------------

    if (
        message.includes("healthy") ||
        message.includes("health") ||
        message.includes("diet") ||
        message.includes("exercise") ||
        message.includes("fitness")
    ) {

        return `
Some basic habits that support general health include:

• Eat a balanced diet.
• Drink sufficient water.
• Get regular physical activity.
• Maintain a consistent sleep schedule.
• Manage stress.
• Avoid smoking and excessive alcohol consumption.
• Get medical check-ups when appropriate.

If you have a specific health concern, describe your symptoms and how long you have had them.
        `.trim();
    }


    // -----------------------------------------
    // DEFAULT RESPONSE
    // -----------------------------------------

    return `
I can provide general health information based on your symptoms.

Please tell me:
• What symptoms are you experiencing?
• How long have you had them?
• Are the symptoms getting better or worse?
• Do you have any other important symptoms?

If your symptoms are severe, rapidly worsening, or feel like an emergency, call 112 or seek immediate medical care.

JeevanCare AI is not a doctor and does not provide a diagnosis or prescription.
    `.trim();
}


// =========================================
// POST /api/ai
// ASK AI
// =========================================

router.post("/", authMiddleware, async (req, res) => {

    try {

        const { message } = req.body;


        // -----------------------------------------
        // BASIC VALIDATION
        // -----------------------------------------

        if (!message || message.trim().length === 0) {

            return res.status(400).json({
                success: false,
                message: "Message is required."
            });

        }


        // -----------------------------------------
        // CLEAN MESSAGE
        // -----------------------------------------

        const cleanMessage = message.trim();


        // -----------------------------------------
        // MESSAGE LENGTH LIMIT
        // -----------------------------------------

        if (cleanMessage.length > 1000) {

            return res.status(400).json({
                success: false,
                message: "Message cannot exceed 1000 characters."
            });

        }


        // -----------------------------------------
        // GENERATE AI RESPONSE
        // -----------------------------------------

        const aiResponse =
            generateHealthResponse(cleanMessage);


        // -----------------------------------------
        // SAVE CHAT HISTORY
        // -----------------------------------------

        await db.query(
            `
            INSERT INTO ai_chats
            (
                user_id,
                user_message,
                ai_response
            )
            VALUES (?, ?, ?)
            `,
            [
                req.user.id,
                cleanMessage,
                aiResponse
            ]
        );


        // -----------------------------------------
        // SEND RESPONSE
        // -----------------------------------------

        return res.status(200).json({

            success: true,

            response: aiResponse

        });


    } catch (error) {

        console.error(
            "AI route error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to process your health question right now."

        });

    }

});


// =========================================
// GET /api/ai/history
// CHAT HISTORY
// =========================================

router.get(
    "/history",
    authMiddleware,
    async (req, res) => {

        try {

            const [chats] = await db.query(
                `
                SELECT
                    id,
                    user_message,
                    ai_response,
                    created_at
                FROM ai_chats
                WHERE user_id = ?
                ORDER BY created_at DESC
                LIMIT 20
                `,
                [req.user.id]
            );


            return res.status(200).json({

                success: true,

                chats: chats

            });


        } catch (error) {

            console.error(
                "AI history error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to load chat history."

            });

        }

    }
);


module.exports = router;
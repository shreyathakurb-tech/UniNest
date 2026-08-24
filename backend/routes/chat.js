const express = require("express");

const router = express.Router();

const searchProperties = require("../services/propertySearch");

const askAI = require("../services/groq");

router.post("/", async (req, res) => {

    try {

        const {

    message,

    userId = "guest"

} = req.body;

        const text = message.toLowerCase().trim();
        const greetings = [
            "hi",
            "hello",
            "hey",
            "good morning",
            "good afternoon",
            "good evening"
        ];

        if (greetings.includes(text)) {

            return res.json({

                success: true,

                reply: `👋 Hello! Welcome to UniNest.

I'm your AI Accommodation Assistant.

I can help you find:

🏡 PGs
🏠 Flats
🛏 Private or Shared Rooms
🎓 Accommodation near your university

Just tell me something like:

• Boys PG in Powai under ₹9000
• Girls hostel near NMIMS
• Private room in Andheri with WiFi`

            });

        }

        const properties = await searchProperties(message);

const reply = await askAI(
    userId,
    message,
    properties
);

return res.json({

    success: true,

    reply

});

    }

    catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,

            error: err.message

        });

    }

});

module.exports = router;
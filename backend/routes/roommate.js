const express = require("express");

const router = express.Router();

const { askRoommateAI } = require("../services/roommateAI");

router.post("/", async (req, res) => {

    try {

        const {

            message,

            userId = "guest"

        } = req.body;

        const reply = await askRoommateAI(

            userId,

            message

        );

        res.json({

            reply

        });

    }

    catch (err) {

        console.error(err);

        res.status(500).json({

            reply: "Server Error"

        });

    }

});

module.exports = router;
const express = require("express");
const router = express.Router();
const pool = require("../db");

// =========================
// Save Favourite
// =========================
router.post("/", async (req, res) => {

    try {

        const { userId, propertyId } = req.body;

        await pool.query(
            `INSERT INTO favourites (user_id, property_id)
             VALUES ($1, $2)
             ON CONFLICT (user_id, property_id) DO NOTHING`,
            [userId, propertyId]
        );

        res.json({ 
            success: true,
            message: "Property added to favourites."
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            error: err.message
        });

    }

});

// =========================
// Get User Favourites
// =========================
router.get("/:userId", async (req, res) => {

    try {

        const { userId } = req.params;

        const result = await pool.query(

            `SELECT properties.*
             FROM favourites
             JOIN properties
             ON favourites.property_id = properties.id
             WHERE favourites.user_id = $1
             ORDER BY favourites.created_at DESC`,

            [userId]

        );

        res.json(result.rows);

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            error: err.message
        });

    }

});

// =========================
// Remove Favourite
// =========================
router.delete("/", async (req, res) => {

    try {

        const { userId, propertyId } = req.body;

        await pool.query(

            `DELETE FROM favourites
             WHERE user_id=$1
             AND property_id=$2`,

            [userId, propertyId]

        );

        res.json({

            success: true,

            message: "Favourite removed."

        });

    } catch (err) {

        console.log(err);

        res.status(500).json({

            success: false,

            error: err.message

        });

    }

});

module.exports = router;
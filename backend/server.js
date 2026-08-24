require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const chatRoute = require("./routes/chat");
const roommateRoute =require("./routes/roommate");
const favouriteRoutes = require("./routes/favourites");
const pool = require("./db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
let allProperties = [];
let latestProperties = [];
let featuredProperties = [];

const app = express();
app.use("/images", express.static(path.join(__dirname, "images")));

app.use(cors());
app.use(express.json());
app.use("/api/chat", chatRoute);
app.use("/api/roommate", roommateRoute);
app.use("/favourites", favouriteRoutes);

app.get("/", (req, res) => {
    res.send("UniNest Backend Running");
});

pool.query("SELECT 1")
    .then(() => {
        console.log("PostgreSQL Connected");
    })
    .catch(err => {
        console.error("PostgreSQL Connection Error:", err.message);
    });

app.post("/register", async (req, res) => {

    try {

        const {
            name,
            email,
            phone,
            password
        } = req.body;

        const existingUser = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (existingUser.rows.length > 0) {

            return res.status(400).json({
                message: "Email already exists"
            });

        }

        const hashedPassword =
            await bcrypt.hash(password, 10);

        await pool.query(
            `INSERT INTO users
            (name,email,phone,password)
            VALUES($1,$2,$3,$4)`,
            [
                name,
                email,
                phone,
                hashedPassword
            ]
        );

        res.status(201).json({
            message: "Registration Successful"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

});

app.get("/users", async (req, res) => {

    const result = await pool.query(
        "SELECT id,name,email,phone,created_at FROM users"
    );

    res.json(result.rows);

});

app.post("/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {

            return res.status(400).json({
                message: "Invalid Email or Password"
            });

        }

        const user = result.rows[0];

        const validPassword =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!validPassword) {

            return res.status(400).json({
                message: "Invalid Email or Password"
            });

        }

        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            message: "Login Successful",
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

});

app.post("/properties", async (req, res) => {

    try {

        const {
            title,
            location,
            price,
            room_type,
            gender,
            description,
            image_url,
            image_urls,
            user_id
        } = req.body;

        const result = await pool.query(
            `INSERT INTO properties
            (
                title,
                location,
                price,
                room_type,
                gender,
                description,
                image_url,
                image_urls,
                user_id
            )
            VALUES
            ($1,$2,$3,$4,$5,$6,$7,$8,$9)
            RETURNING *`,
            [
                title,
                location,
                price,
                room_type,
                gender,
                description,
                image_url,
                JSON.stringify(image_urls || []),
                user_id
            ]
        );

        res.status(201).json({
            message: "Property Added Successfully",
            property: result.rows[0]
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

});

app.get("/properties", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM properties ORDER BY id DESC"
        );

        res.json(result.rows);

    } catch (error) {
        console.error("Error fetching properties:", error);

        res.status(500).json({
            message: "Failed to fetch properties",
            error: error.message
        });
    }
});

app.get("/my-properties/:userId", async (req, res) => {

    try {

        const { userId } = req.params;

        const result = await pool.query(

            `SELECT *
             FROM properties
             WHERE user_id = $1
             ORDER BY id DESC`,

            [userId]

        );

        res.json(result.rows);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

});

app.get("/properties/:id", async (req, res) => {

    try {

        const { id } = req.params;

        const result = await pool.query(
            "SELECT * FROM properties WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                message: "Property not found"
            });

        }

        res.json(result.rows[0]);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

});

// Get landlord contact details for a property
app.get("/properties/:id/landlord", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT 
                u.name,
                u.email,
                u.phone
             FROM properties p
             JOIN users u ON p.user_id = u.id
             WHERE p.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Landlord not found"
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error("Error fetching landlord:", error);

        res.status(500).json({
            message: "Server Error"
        });
    }
});

app.delete("/properties/:id", async (req, res) => {

    try {

        const { id } = req.params;

        const result = await pool.query(
            "DELETE FROM properties WHERE id = $1 RETURNING *",
            [id]
        );

        if(result.rows.length === 0){

            return res.status(404).json({
                message: "Property not found"
            });

        }

        res.json({
            message: "Property Deleted Successfully"
        });

    } catch(error){

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

});

app.put("/properties/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const {
            title,
            location,
            price,
            room_type,
            gender,
            description,
            image_url,
            image_urls
        } = req.body;

        const result = await pool.query(
            `UPDATE properties
             SET
                title = $1,
                location = $2,
                price = $3,
                room_type = $4,
                gender = $5,
                description = $6,

                -- Keep old image if no new image is provided
                image_url = COALESCE(NULLIF($7, ''), image_url),

                -- Keep old gallery if no new gallery is provided
                image_urls = COALESCE($8::jsonb, image_urls)

             WHERE id = $9
             RETURNING *`,
            [
                title,
                location,
                price,
                room_type,
                gender,
                description,

                // If image_url is empty, send null
                image_url || null,

                // If image_urls is not provided, send null
                image_urls !== undefined
                    ? JSON.stringify(image_urls)
                    : null,

                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Property not found"
            });
        }

        res.json({
            message: "Property Updated Successfully",
            property: result.rows[0]
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });
    }
});

app.get("/featured-properties", async (req, res) => {

    try {

        const result = await pool.query(

            `SELECT *
             FROM properties
             WHERE is_featured = TRUE
             ORDER BY id DESC`

        );

        res.json(result.rows);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

});

// ===============================
// Subscribe for Property Alerts
// ===============================

app.post("/subscribe", async (req, res) => {

    try {

        const {
            email,
            university,
            location,
            budget
        } = req.body;

        // Email validation
        if (!email || email.trim() === "") {

            return res.status(400).json({

                success: false,

                message: "Email is required."

            });

        }

        // Check if email already exists
        const existingSubscriber = await pool.query(

            "SELECT * FROM subscribers WHERE email = $1",

            [email]

        );

        if (existingSubscriber.rows.length > 0) {

            return res.status(409).json({

                success: false,

                message: "You are already subscribed!"

            });

        }

        // Insert subscriber
        const result = await pool.query(

            `INSERT INTO subscribers
            (
                email,
                university,
                location,
                budget
            )
            VALUES
            ($1,$2,$3,$4)
            RETURNING *`,

            [

                email,

                university || null,

                location || null,

                budget || null

            ]

        );

        res.status(201).json({

            success: true,

            message: "🎉 Successfully subscribed!",

            subscriber: result.rows[0]

        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: "Server Error"

        });

    }

});

// ===============================
// Contact Us
// ===============================

app.post("/contact", async (req, res) => {

    try {

        const {
            name,
            email,
            subject,
            message
        } = req.body;

        // Validation
        if (!name || !email || !subject || !message) {

            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });

        }

        // Save message to database
        const result = await pool.query(
            `INSERT INTO contact_messages
            (name, email, subject, message)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
            [
                name,
                email,
                subject,
                message
            ]
        );

        res.status(201).json({
            success: true,
            message: "Message sent successfully!",
            contact: result.rows[0]
        });

    } catch (error) {

        console.error("Contact Error:", error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

});

app.post("/property-visits", async (req, res) => {
    try {
        const {
            property_id,
            user_id,
            visit_date,
            visit_time,
            name,
            email
        } = req.body;

        if (
            !property_id ||
            !visit_date ||
            !visit_time ||
            !name ||
            !email
        ) {
            return res.status(400).json({
                message: "Please provide all required details"
            });
        }

        const propertyResult = await pool.query(
            `SELECT id, title
             FROM properties
             WHERE id = $1`,
            [property_id]
        );

        if (propertyResult.rows.length === 0) {
            return res.status(404).json({
                message: "Property not found"
            });
        }

        const result = await pool.query(
            `INSERT INTO property_visits
                (property_id, user_id, visit_date, visit_time, name, email)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [
                property_id,
                user_id || null,
                visit_date,
                visit_time,
                name,
                email
            ]
        );

        res.status(201).json({
            message: "Visit booked successfully",
            booking: result.rows[0]
        });

    } catch (error) {
        console.error("Error booking property visit:", error);

        res.status(500).json({
            message: "Unable to book visit"
        });
    }9
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
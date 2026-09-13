const Groq = require("groq-sdk");
const pool = require("../db");

require("dotenv").config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// =====================================
// Conversation Memory
// =====================================

const sessions = new Map();

function getSession(userId) {

    if (!sessions.has(userId)) {

        sessions.set(userId, {

            history: [],

            profile: {

                university: null,
                location: null,
                budget: null,
                personality: null,
                studySchedule: null,
                sleepSchedule: null,
                cleanliness: null,
                foodPreference: null,
                smoking: null,
                drinking: null,
                hobbies: null

            },

            conversationStage: "collecting",

            questionsAsked: 0,

            questionLimit: 3

        });

    }

    return sessions.get(userId);

}

// =====================================
// Update User Profile
// =====================================

function updateProfile(profile, message) {

    const text = message.toLowerCase().trim();

    // -------------------------
    // Budget
    // -------------------------

    const budgetMatch =
        text.match(/(?:₹|rs\.?|rupees?)?\s*(\d{3,6})/i);

    if (budgetMatch) {

        profile.budget =
            Number(budgetMatch[1]);

    }

    // -------------------------
    // Personality
    // -------------------------

    if (text.includes("introvert"))
        profile.personality = "Introvert";

    if (text.includes("extrovert"))
        profile.personality = "Extrovert";

    if (text.includes("ambivert"))
        profile.personality = "Ambivert";

    // -------------------------
    // Food
    // -------------------------

    if (text.includes("vegetarian"))
        profile.foodPreference = "Vegetarian";

    if (
        text.includes("non veg") ||
        text.includes("non-veg") ||
        text.includes("non vegetarian")
    ) {
        profile.foodPreference = "Non-Vegetarian";
    }

    if (text.includes("vegan"))
        profile.foodPreference = "Vegan";

    // -------------------------
    // Smoking
    // -------------------------

    if (
        text.includes("don't smoke") ||
        text.includes("do not smoke") ||
        text.includes("non smoker") ||
        text.includes("non-smoker")
    ) {
        profile.smoking = "No";
    }

    if (
        text.includes("i smoke") ||
        text.includes("smoker")
    ) {
        profile.smoking = "Yes";
    }

    // -------------------------
    // Drinking
    // -------------------------

    if (
        text.includes("don't drink") ||
        text.includes("do not drink") ||
        text.includes("non drinker")
    ) {
        profile.drinking = "No";
    }

    if (
        text.includes("i drink") ||
        text.includes("drink occasionally")
    ) {
        profile.drinking = "Yes";
    }

    // -------------------------
    // Cleanliness
    // -------------------------

    if (
        text.includes("very clean") ||
        text.includes("clean person")
    ) {
        profile.cleanliness = "Very Clean";
    }
    else if (text.includes("clean")) {

        profile.cleanliness = "Clean";

    }
    else if (text.includes("messy")) {

        profile.cleanliness = "Messy";

    }

    // -------------------------
    // Study Schedule
    // -------------------------

    if (
        text.includes("study at night") ||
        text.includes("night study") ||
        text.includes("study during night")
    ) {
        profile.studySchedule = "Night";
    }

    if (
        text.includes("study in morning") ||
        text.includes("morning study") ||
        text.includes("study early")
    ) {
        profile.studySchedule = "Morning";
    }

    // -------------------------
    // Sleep
    // -------------------------

    if (
        text.includes("sleep early") ||
        text.includes("early sleeper") ||
        text.includes("sleep at 10") ||
        text.includes("sleep at 11")
    ) {
        profile.sleepSchedule = "Early";
    }

    if (
        text.includes("sleep late") ||
        text.includes("night owl") ||
        text.includes("sleep at 2") ||
        text.includes("sleep at 3")
    ) {
        profile.sleepSchedule = "Late";
    }

    // -------------------------
    // Location
    // -------------------------

    const locations = [
        "powai",
        "andheri",
        "thane",
        "bandra",
        "kurla",
        "dadar",
        "borivali",
        "vile parle",
        "chembur",
        "ghatkopar",
        "mulund",
        "mumbai",
        "delhi",
        "bangalore",
        "pune",
        "hyderabad"
    ];

    for (const location of locations) {

        if (text.includes(location)) {

            profile.location = location;

            break;

        }

    }

    // -------------------------
    // University
    // -------------------------

    const universityPatterns = [

        /study at (.+)/i,

        /student at (.+)/i,

        /my university is (.+)/i

    ];

    for (const pattern of universityPatterns) {

        const match = message.match(pattern);

        if (match) {

            profile.university =
                match[1]
                    .trim()
                    .replace(/[.!?]+$/, "");

            break;

        }

    }

}

// =====================================
// Missing Questions
// =====================================

function getMissingFields(profile) {

    const questions = [];

    if (!profile.personality) {

        questions.push({
            field: "Personality",
            question:
                "Would you describe yourself as introvert, extrovert, or ambivert?"
        });

    }

    if (!profile.sleepSchedule) {

        questions.push({
            field: "Sleep Schedule",
            question:
                "What's your usual sleep schedule? Early sleeper or night owl?"
        });

    }

    if (!profile.cleanliness) {

        questions.push({
            field: "Cleanliness",
            question:
                "How important is cleanliness to you? Clean, moderate, or relaxed?"
        });

    }

    if (!profile.foodPreference) {

        questions.push({
            field: "Food Preference",
            question:
                "Do you have a food preference such as vegetarian, non-vegetarian, or no preference?"
        });

    }

    if (!profile.smoking) {

        questions.push({
            field: "Smoking",
            question:
                "Do you prefer a roommate who does not smoke?"
        });

    }

    if (!profile.drinking) {

        questions.push({
            field: "Drinking",
            question:
                "Do you prefer a roommate who does not drink?"
        });

    }

    return questions;

}

// =====================================
// Find Roommate Candidates
// =====================================

async function findRoommates(profile, currentUserId) {

    let query = `
        SELECT
            u.id,
            u.name,
            u.email,
            u.phone,

            rp.preferred_gender,
            rp.study_time,
            rp.sleep_time,
            rp.budget,
            rp.preferred_location,
            rp.smoking_preference,
            rp.food_preference

        FROM users u

        INNER JOIN roommate_preferences rp
            ON u.id = rp.user_id

        WHERE 1 = 1
    `;

    const values = [];

    // Don't recommend the logged-in user
    if (
        currentUserId &&
        currentUserId !== "guest" &&
        !isNaN(Number(currentUserId))
    ) {

        values.push(Number(currentUserId));

        query += `
            AND u.id <> $${values.length}
        `;

    }

    // -------------------------
    // Gender
    // -------------------------

    if (profile.preferredGender) {

        values.push(
            profile.preferredGender.toLowerCase()
        );

        query += `
            AND LOWER(COALESCE(rp.preferred_gender, ''))
            = $${values.length}
        `;

    }

    // -------------------------
    // Location
    // -------------------------

    if (profile.location) {

        values.push(
            `%${profile.location.toLowerCase()}%`
        );

        query += `
            AND LOWER(COALESCE(rp.preferred_location, ''))
            LIKE $${values.length}
        `;

    }

    // -------------------------
    // Budget
    // -------------------------

    if (profile.budget) {

        values.push(Number(profile.budget));

        query += `
            AND (
                rp.budget IS NULL
                OR rp.budget <= $${values.length}
            )
        `;

    }

    query += `
        ORDER BY u.name ASC
        LIMIT 10
    `;

    const result = await pool.query(
        query,
        values
    );

    return result.rows;

}

// =====================================
// Calculate Compatibility
// =====================================

function calculateMatch(profile, roommate) {

    let score = 0;

    let total = 0;

    // Study schedule
    if (profile.studySchedule) {

        total++;

        if (
            roommate.study_time &&
            roommate.study_time.toLowerCase()
                === profile.studySchedule.toLowerCase()
        ) {
            score++;
        }

    }

    // Sleep schedule
    if (profile.sleepSchedule) {

        total++;

        if (
            roommate.sleep_time &&
            roommate.sleep_time.toLowerCase()
                === profile.sleepSchedule.toLowerCase()
        ) {
            score++;
        }

    }

    // Location
    if (profile.location) {

        total++;

        if (
            roommate.preferred_location &&
            roommate.preferred_location
                .toLowerCase()
                .includes(profile.location.toLowerCase())
        ) {
            score++;
        }

    }

    // Budget
    if (profile.budget) {

        total++;

        if (
            roommate.budget &&
            Number(roommate.budget)
                <= Number(profile.budget)
        ) {
            score++;
        }

    }

    // Food
    if (profile.foodPreference) {

        total++;

        if (
            roommate.food_preference &&
            roommate.food_preference
                .toLowerCase()
                === profile.foodPreference.toLowerCase()
        ) {
            score++;
        }

    }

    // Smoking
    if (profile.smoking) {

        total++;

        if (
            roommate.smoking_preference &&
            roommate.smoking_preference
                .toLowerCase()
                === profile.smoking.toLowerCase()
        ) {
            score++;
        }

    }

    if (total === 0)
        return 0;

    return Math.round(
        (score / total) * 100
    );

}

// =====================================
// Main AI Function
// =====================================

async function askRoommateAI(
    userId,
    message
) {

    try {

        const session =
            getSession(userId);

        // ===================================
        // Question Limit
        // ===================================

        const questionLimitMatch =
            message.match(
                /\b(?:only|just|ask me|give me)\s*(\d+)\s*(?:questions?|ques(?:tions?)?)\b/i
            );

        if (questionLimitMatch) {

            const requestedLimit =
                parseInt(
                    questionLimitMatch[1],
                    10
                );

            if (
                requestedLimit >= 1 &&
                requestedLimit <= 3
            ) {

                session.questionLimit =
                    requestedLimit;

            }

        }

        // ===================================
        // Stop Asking Questions
        // ===================================

        const stopRequest =
            /\b(stop|no more questions|don't ask more|do not ask more|that's enough|thats enough|just recommend|give me the match|recommend now)\b/i
                .test(message);

        if (stopRequest) {

            session.conversationStage =
                "recommendation";

        }

        // ===================================
        // Update Profile
        // ===================================

        updateProfile(
            session.profile,
            message
        );

        // ===================================
        // Save User Message
        // ===================================

        session.history.push({

            role: "user",

            content: message

        });

        if (session.history.length > 20) {

            session.history =
                session.history.slice(-20);

        }

        // ===================================
        // Missing Fields
        // ===================================

        const missing =
            getMissingFields(
                session.profile
            );

        // ===================================
        // Count Answered Preferences
        // ===================================

        const compatibilityFields = [

            session.profile.personality,
            session.profile.studySchedule,
            session.profile.sleepSchedule,
            session.profile.cleanliness,
            session.profile.foodPreference,
            session.profile.smoking,
            session.profile.drinking

        ];

        const answeredFields =
            compatibilityFields.filter(
                value =>
                    value !== null &&
                    value !== ""
            ).length;

        // ===================================
        // Conversation Stage
        // ===================================

        if (
            answeredFields >= 3 ||
            missing.length === 0 ||
            session.questionsAsked >=
                session.questionLimit ||
            session.conversationStage ===
                "recommendation"
        ) {

            session.conversationStage =
                "recommendation";

        }
        else {

            session.conversationStage =
                "collecting";

        }

        // ===================================
        // COLLECTING STAGE
        // ===================================

        if (
            session.conversationStage ===
            "collecting"
        ) {

            const questionsRemaining =
                Math.max(
                    0,
                    session.questionLimit -
                    session.questionsAsked
                );

            const questions =
                missing
                    .slice(0, questionsRemaining)
                    .map(q => q.question);

            if (questions.length === 0) {

                session.conversationStage =
                    "recommendation";

            }
            else {

                const reply =
                    questions
                        .map(q => q)
                        .join("\n");

                const questionCount =
                    (reply.match(/\?/g) || [])
                        .length;

                session.questionsAsked +=
                    questionCount;

                session.history.push({

                    role: "assistant",

                    content: reply

                });

                return reply;

            }

        }

        // ===================================
        // RECOMMENDATION STAGE
        // ===================================

        const roommates =
            await findRoommates(
                session.profile,
                userId
            );

        // ===================================
        // No Roommates
        // ===================================

        if (roommates.length === 0) {

            const reply = `
I couldn't find a roommate who matches your current preferences.

You can try:
• A different location
• A slightly different budget
• Fewer preferences

You can also tell me "recommend now" and I'll search using the information you've already provided.
            `.trim();

            session.history.push({

                role: "assistant",

                content: reply

            });

            return reply;

        }

        // ===================================
        // Calculate Match Scores
        // ===================================

        const rankedRoommates =
            roommates
                .map(roommate => ({

                    ...roommate,

                    matchScore:
                        calculateMatch(
                            session.profile,
                            roommate
                        )

                }))
                .sort(
                    (a, b) =>
                        b.matchScore -
                        a.matchScore
                )
                .slice(0, 5);

        // ===================================
        // Prepare Real Data for Groq
        // ===================================

        const roommateData =
            rankedRoommates
                .map(
                    (roommate, index) => `

ROOMMATE ${index + 1}

Name: ${roommate.name || "Not available"}

Email: ${roommate.email || "Not available"}

Phone: ${roommate.phone || "Not available"}

Gender: ${roommate.preferred_gender || "Not available"}

Study Time: ${roommate.study_time || "Not available"}

Sleep Time: ${roommate.sleep_time || "Not available"}

Budget: ${
    roommate.budget
        ? `₹${roommate.budget}`
        : "Not available"
}

Location: ${
    roommate.preferred_location ||
    "Not available"
}

Smoking: ${
    roommate.smoking_preference ||
    "Not available"
}

Food Preference: ${
    roommate.food_preference ||
    "Not available"
}

Compatibility Score: ${roommate.matchScore}%

--------------------------------
`
                )
                .join("\n");

        // ===================================
        // User Profile
        // ===================================

        const profileData = `

User Preferences

Personality:
${session.profile.personality || "Not provided"}

Study Schedule:
${session.profile.studySchedule || "Not provided"}

Sleep Schedule:
${session.profile.sleepSchedule || "Not provided"}

Cleanliness:
${session.profile.cleanliness || "Not provided"}

Food:
${session.profile.foodPreference || "Not provided"}

Smoking:
${session.profile.smoking || "Not provided"}

Drinking:
${session.profile.drinking || "Not provided"}

Location:
${session.profile.location || "Not provided"}

Budget:
${
    session.profile.budget
        ? `₹${session.profile.budget}`
        : "Not provided"
}
`;

        // ===================================
        // Groq Prompt
        // ===================================

        const systemPrompt = `

You are UniNest AI Roommate Matching Assistant.

Your job is to present REAL roommate profiles returned by the database.

IMPORTANT RULES:

1. NEVER invent a roommate name.

2. NEVER invent an email, phone number,
   university, location, budget or preference.

3. ONLY use the supplied ROOMMATE DATA.

4. Show the roommate's REAL name.

5. Show the compatibility percentage.

6. Explain briefly why the roommate matches.

7. If information says "Not available",
   do not guess it.

8. Do NOT ask additional questions.

9. Do NOT give generic advice instead of profiles.

10. Return the best 1–5 actual roommate profiles.

11. Keep the response concise.

Use this format:

🏠 Recommended Roommates

### 1. [Real Name] — [Score]%

📍 Location:
💰 Budget:
📚 Study Time:
😴 Sleep Time:
👤 Gender:
🍴 Food:
🚭 Smoking:

**Why this is a good match:**
Brief explanation based ONLY on the supplied data.

Then repeat for the other roommates.

`;

        const messages = [

            {
                role: "system",
                content: systemPrompt
            },

            {
                role: "user",
                content: `

${profileData}

DATABASE ROOMMATES

${roommateData}

Return the best matching real roommates.
`
            }

        ];

        // ===================================
        // Groq
        // ===================================

        const completion =
            await groq.chat.completions.create({

                model:
                    "openai/gpt-oss-20b",

                messages,

                temperature: 0.2,

                max_tokens: 900

            });

        const reply =
            completion
                .choices[0]
                .message
                .content
                .trim();

        // ===================================
        // Save Assistant Response
        // ===================================

        session.history.push({

            role: "assistant",

            content: reply

        });

        if (session.history.length > 30) {

            session.history =
                session.history.slice(-30);

        }

        return reply;

    }

    catch (err) {

        console.error(
            "========== ROOMMATE AI ERROR =========="
        );

        console.error(err);

        console.error(
            "======================================="
        );

        return "Sorry, I'm unable to find roommates right now.";

    }

}

module.exports = askRoommateAI;
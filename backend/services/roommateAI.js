const Groq = require("groq-sdk");
require("dotenv").config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// ===================================
// Conversation Memory
// ===================================

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

conversationStage: "collecting"

        });

    }

    return sessions.get(userId);

}

function updateProfile(profile, message) {

    const text = message.toLowerCase().trim();

    // -------------------------
    // Budget
    // -------------------------

    const budgetMatch = text.match(/(?:₹|rs\.?|rupees?)?\s*(\d{3,6})/i);

    if (budgetMatch) {

        profile.budget = budgetMatch[1];

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

    if (text.includes("vegan"))
        profile.foodPreference = "Vegan";

    if (
        text.includes("non veg") ||
        text.includes("non-veg") ||
        text.includes("non vegetarian")
    ) {

        profile.foodPreference = "Non-Vegetarian";

    }

    // -------------------------
    // Smoking
    // -------------------------

    if (
        text.includes("don't smoke") ||
        text.includes("do not smoke") ||
        text.includes("non smoker")
    ) {

        profile.smoking = "No";

    }

    if (
        text.includes("smoker") ||
        text.includes("i smoke")
    ) {

        profile.smoking = "Yes";

    }

    // -------------------------
    // Drinking
    // -------------------------

    if (
        text.includes("don't drink") ||
        text.includes("do not drink")
    ) {

        profile.drinking = "No";

    }

    if (
        text.includes("drink occasionally") ||
        text.includes("i drink")
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

    if (text.includes("clean"))
        profile.cleanliness = "Clean";

    if (text.includes("messy"))
        profile.cleanliness = "Messy";

    // -------------------------
    // Study Schedule
    // -------------------------

    if (
        text.includes("study at night") ||
        text.includes("night study")
    ) {

        profile.studySchedule = "Night";

    }

    if (
        text.includes("study in morning") ||
        text.includes("morning study")
    ) {

        profile.studySchedule = "Morning";

    }

    // -------------------------
    // Sleep
    // -------------------------

    if (
        text.includes("sleep early") ||
        text.includes("10 pm") ||
        text.includes("11 pm")
    ) {

        profile.sleepSchedule = "Early";

    }

    if (
        text.includes("sleep late") ||
        text.includes("2 am") ||
        text.includes("3 am")
    ) {

        profile.sleepSchedule = "Late";

    }

    // -------------------------
    // University
    // -------------------------

    const universityPatterns = [

        /study at (.+)/i,

        /student at (.+)/i,

        /from (.+ university)/i,

        /my university is (.+)/i

    ];

    for (const pattern of universityPatterns) {

        const match = message.match(pattern);

        if (match) {

            profile.university = match[1].trim();

            break;

        }

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

    locations.forEach(location => {

        if (text.includes(location)) {

            profile.location = location;

        }

    });

}

function getMissingFields(profile) {

    const questions = [];

    if (!profile.university) {

        questions.push({
            field: "University",
            question: "Which university do you attend?"
        });

    }

    if (!profile.location) {

        questions.push({
            field: "Location",
            question: "Which location are you looking for accommodation in?"
        });

    }

    if (!profile.budget) {

        questions.push({
            field: "Budget",
            question: "What's your monthly budget?"
        });

    }

    if (!profile.personality) {

        questions.push({
            field: "Personality",
            question: "Would you describe yourself as an introvert or extrovert?"
        });

    }

    if (!profile.studySchedule) {

        questions.push({
            field: "Study Schedule",
            question: "What's your study schedule like?"
        });

    }

    if (!profile.sleepSchedule) {

        questions.push({
            field: "Sleep Schedule",
            question: "When do you usually sleep?"
        });

    }

    if (!profile.cleanliness) {

        questions.push({
            field: "Cleanliness",
            question: "How important is cleanliness to you?"
        });

    }

    if (!profile.foodPreference) {

        questions.push({
            field: "Food Preference",
            question: "Do you prefer vegetarian or non-vegetarian food?"
        });

    }

    if (!profile.smoking) {

        questions.push({
            field: "Smoking",
            question: "Do you smoke?"
        });

    }

    if (!profile.drinking) {

        questions.push({
            field: "Drinking",
            question: "Do you drink occasionally?"
        });

    }

    return questions;

}

async function askRoommateAI(userId, message) {

    try {

        const session = getSession(userId);

        // Update profile from current message
        updateProfile(session.profile, message);

        // Save current user message
        session.history.push({

            role: "user",

            content: message

        });

        // Keep only recent history
        if (session.history.length > 20) {

            session.history = session.history.slice(-20);

        }

        // Find missing information
        const missing = getMissingFields(session.profile);

        if (missing.length === 0) {

    session.conversationStage = "recommendation";

}
else {

    session.conversationStage = "collecting";

}

        // Build user profile
        const profileSummary = `

Known User Information

University : ${session.profile.university || "Unknown"}

Preferred Location : ${session.profile.location || "Unknown"}

Budget : ${session.profile.budget || "Unknown"}

Personality : ${session.profile.personality || "Unknown"}

Study Schedule : ${session.profile.studySchedule || "Unknown"}

Sleep Schedule : ${session.profile.sleepSchedule || "Unknown"}

Cleanliness : ${session.profile.cleanliness || "Unknown"}

Food Preference : ${session.profile.foodPreference || "Unknown"}

Smoking : ${session.profile.smoking || "Unknown"}

Drinking : ${session.profile.drinking || "Unknown"}

`;

        const systemPrompt = `

You are UniNest AI Roommate Assistant.

Current Conversation Stage:

${session.conversationStage}

KNOWN USER PROFILE

University:
${session.profile.university || "Unknown"}

Location:
${session.profile.location || "Unknown"}

Budget:
${session.profile.budget || "Unknown"}

Personality:
${session.profile.personality || "Unknown"}

Study Schedule:
${session.profile.studySchedule || "Unknown"}

Sleep Schedule:
${session.profile.sleepSchedule || "Unknown"}

Cleanliness:
${session.profile.cleanliness || "Unknown"}

Food:
${session.profile.foodPreference || "Unknown"}

Smoking:
${session.profile.smoking || "Unknown"}

Drinking:
${session.profile.drinking || "Unknown"}

RULES

If stage is collecting

• Ask ONLY missing questions.

• Never ask answered questions.

• Ask maximum 3 questions.

If stage is recommendation

• Do NOT ask more questions.

• Summarize the user's profile.

• Recommend the ideal roommate.

• Explain WHY.

• Give roommate tips.

If user asks follow-up questions

Answer using remembered profile.

Never forget previous conversation.

Be friendly.

`;

        const messages = [

{
role:"system",
content:systemPrompt
},

...session.history,

{
role:"user",

content:`

Missing Questions

${missing.slice(0,3).map(x=>"- "+x.question).join("\n")}

Current User Message

${message}

`

}

];

        const completion = await groq.chat.completions.create({

            model: "llama-3.3-70b-versatile",

            messages,

            temperature: 0.4,

            max_tokens: 500

        });

        const reply = completion.choices[0].message.content;

        session.history.push({

            role: "assistant",

            content: reply

        });

        if (session.history.length > 30) {

    session.history =
        session.history.slice(-30);

}

        const finalReply = reply.trim();

return finalReply;

    }

    catch (err) {

        console.error(err);

        return "Sorry, I'm unable to answer right now.";

    }

}

module.exports = {
    askRoommateAI
};
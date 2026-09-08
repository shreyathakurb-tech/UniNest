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

conversationStage: "collecting",
questionsAsked: 0,
questionLimit: 3

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

    // Most important roommate compatibility questions

    if (!profile.personality) {
        questions.push({
            field: "Personality",
            question: "Would you describe yourself as introvert, extrovert, or ambivert?"
        });
    }

    if (!profile.sleepSchedule) {
        questions.push({
            field: "Sleep Schedule",
            question: "What's your usual sleep schedule? Early sleeper or night owl?"
        });
    }

    if (!profile.cleanliness) {
        questions.push({
            field: "Cleanliness",
            question: "How important is cleanliness to you? Clean, moderate, or relaxed?"
        });
    }

    if (!profile.foodPreference) {
        questions.push({
            field: "Food Preference",
            question: "Do you have a food preference such as vegetarian, non-vegetarian, or no preference?"
        });
    }

    if (!profile.smoking) {
        questions.push({
            field: "Smoking",
            question: "Do you prefer a roommate who does not smoke?"
        });
    }

    if (!profile.drinking) {
        questions.push({
            field: "Drinking",
            question: "Do you prefer a roommate who does not drink?"
        });
    }
    return questions;
}

async function askRoommateAI(userId, message) {

    try {

        const session = getSession(userId);

        // Allow the user to choose how many questions they want
const questionLimitMatch = message.match(
    /\b(?:only|just|ask me|give me)\s*(\d+)\s*(?:questions?|ques(?:tions?)?)\b/i
);

if (questionLimitMatch) {
    const requestedLimit = parseInt(questionLimitMatch[1], 10);

    if (requestedLimit >= 1 && requestedLimit <= 3) {
        session.questionLimit = requestedLimit;
    }
}

// Allow the user to stop answering questions
const stopRequest = /\b(stop|no more questions|don't ask more|do not ask more|that's enough|thats enough|just recommend|give me the match|recommend now)\b/i.test(message);

if (stopRequest) {
    session.conversationStage = "recommendation";
}

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

        const compatibilityFields = [
    session.profile.personality,
    session.profile.studySchedule,
    session.profile.sleepSchedule,
    session.profile.cleanliness,
    session.profile.foodPreference,
    session.profile.smoking,
    session.profile.drinking
];

const answeredFields = compatibilityFields.filter(
    value => value !== null && value !== ""
).length;

        // ===================================
// Decide conversation stage
// ===================================

if (
    answeredFields >= 3 ||
    missing.length === 0 ||
    session.questionsAsked >= session.questionLimit ||
    session.conversationStage === "recommendation"
) {
    session.conversationStage = "recommendation";
} else {
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

• Ask ONLY missing roommate compatibility questions.
• NEVER ask for university, budget, location, or accommodation details.
• Never ask a question that the user has already answered.
• Ask no more than the remaining question limit.
• The user does NOT have to answer every question.
• If the user provides only 1, 2, or 3 answers, use those answers.
• If the user asks to stop, immediately move to recommendation.
• If the user says "ask only 2 questions", ask only 2 questions.
• If the user says "ask only 3 questions", ask only 3 questions.

If stage is recommendation

• Do NOT ask more questions.
• Use the information already provided.
• Give the best roommate recommendation possible.
• Clearly mention that the recommendation is based on the information provided.
• Explain why the roommate is compatible.
• Give useful roommate tips.

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

${missing
    .slice(
        0,
        Math.max(
            0,
            session.questionLimit - session.questionsAsked
        )
    )
    .map(x => "- " + x.question)
    .join("\n")}

Current User Message

${message}

`

}

];

        const completion = await groq.chat.completions.create({

            model: "openai/gpt-oss-20b",

            messages,

            temperature: 0.4,

            max_tokens: 500

        });

        const reply = completion.choices[0].message.content;

        // ===================================
// Count questions asked
// ===================================

const questionCount = (reply.match(/\?/g) || []).length;

session.questionsAsked += questionCount;

if (session.questionsAsked >= session.questionLimit) {
    session.conversationStage = "recommendation";
}

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

module.exports = askRoommateAI;
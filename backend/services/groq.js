const Groq = require("groq-sdk");
require("dotenv").config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// ==============================
// Conversation Memory
// ==============================

const sessions = new Map();

function getSession(userId) {

    if (!sessions.has(userId)) {

        sessions.set(userId, {

            history: [],

            lastProperty: null,

            lastProperties: [],

            lastSearch: "",

            lastIntent: ""

        });

    }

    return sessions.get(userId);

}

// ==============================
// Follow-up Detection
// ==============================

function isFollowUpQuestion(message) {

    const text = message.toLowerCase();

    const followUps = [

        "this property",
        "that property",
        "this one",
        "that one",
        "it",
        "tell me more",
        "more information",
        "more details",
        "complete information",
        "full information",
        "show details",
        "all information",
        "describe it",
        "amenities",
        "facilities",
        "deposit",
        "security",
        "owner",
        "contact",
        "phone",
        "wifi",
        "parking",
        "laundry",
        "food",
        "bathroom",
        "distance",
        "address"

    ];

    return followUps.some(word => text.includes(word));

}

// ==============================
// Select Property from Conversation
// ==============================

function getSelectedProperty(session, message) {

    const text = message.toLowerCase();

    if (text.includes("first")) {

        return session.lastProperties[0];

    }

    if (text.includes("second")) {

        return session.lastProperties[1];

    }

    if (text.includes("third")) {

        return session.lastProperties[2];

    }

    if (text.includes("fourth")) {

        return session.lastProperties[3];

    }

    return session.lastProperty;

}

async function askAI(userId, userQuestion, properties) {

    try {

        const session = getSession(userId);

        const followUp = isFollowUpQuestion(userQuestion);

        // Save latest search results
        if (!followUp && properties.length > 0) {

            session.lastProperties = properties;

            session.lastProperty = properties[0];

            session.lastSearch = userQuestion;

        }

        // User asks about second/third property
        if (followUp) {

            const selected = getSelectedProperty(
                session,
                userQuestion
            );

            if (selected) {

                session.lastProperty = selected;

            }

        }

        // Decide which property AI should receive
        let propertyList = [];

        if (followUp && session.lastProperty) {

            propertyList = [session.lastProperty];

        } else {

            propertyList = properties;

        }
        // =====================================
        // Format Properties
        // =====================================

        let propertyData = "No matching properties found.";

        if (propertyList.length > 0) {

            propertyData = propertyList.map((property, index) => `

Property ${index + 1}

Name: ${property.title || property.name || "N/A"}

Location: ${property.location || "N/A"}

Price: ₹${property.price || "N/A"} per month

Gender: ${property.gender || "N/A"}

Room Type: ${property.room_type || "N/A"}

Amenities: ${property.amenities || "Not specified"}

Description: ${property.description || "Not available"}

Owner Name: ${property.owner_name || "Not available"}

Contact: ${property.contact || "Not available"}

Available: ${property.available ? "Yes" : "Not Mentioned"}

Match Score: ${property.matchScore || 0}%

--------------------------------------------------

`).join("\n");

        }

        // =====================================
        // System Prompt
        // =====================================

        const systemPrompt = `

You are UniNest AI Accommodation Assistant.

Your job is to help students find accommodations.

IMPORTANT RULES

1. NEVER create fake properties.

2. NEVER guess rent.

3. NEVER invent amenities.

4. ONLY use the supplied property data.

5. If no property exists, politely say no matching property was found.

6. Never expose database IDs.

7. Answer naturally.

8. If the user asks:
   - tell me more
   - complete information
   - full details
   - does it have wifi
   - parking
   - owner
   - food
   - security
   - deposit

Answer ONLY using the supplied property.

9. Use bullet points whenever possible.

10. Recommend the best property if multiple properties exist.

11. Keep answers under 220 words.

12. If the user asks for comparison,
compare only supplied properties.

13. If information is unavailable,
say "This information is not available."

`;

        const messages = [

            {
                role: "system",
                content: systemPrompt
            },

            {
                role: "user",
                content: `

Available Properties

${propertyData}

User Question

${userQuestion}

`
            }

        ];

        // =====================================
        // Conversation Memory
        // =====================================

        if (session.history.length > 0) {

            messages.splice(
                1,
                0,
                ...session.history
            );

        }

        // Keep only recent history
        if (session.history.length > 10) {

            session.history =
                session.history.slice(-10);

        }

        session.history.push({

            role: "user",

            content: userQuestion

        });

        // =====================================
        // Call Groq
        // =====================================

        const completion =
            await groq.chat.completions.create({

                model: "llama-3.3-70b-versatile",

                messages,

                temperature: 0.4,

                max_tokens: 500

            });

        const reply =
            completion.choices[0].message.content;

        session.history.push({

            role: "assistant",

            content: reply

        });

        return reply;

    }

    catch (err) {

        console.error(err);

        return "Sorry, I'm unable to answer right now.";

    }

}

module.exports = askAI;
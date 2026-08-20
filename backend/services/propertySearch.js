const pool = require("../db");

async function searchProperties(userMessage) {

    const text = userMessage.toLowerCase();

    let query = `
    SELECT *
    FROM properties
    WHERE 1=1
    `;

    const values = [];

    if(text.includes("girls"))
        query += ` AND LOWER(gender)='girls'`;

    if(text.includes("boys"))
        query += ` AND LOWER(gender)='boys'`;

    if(text.includes("unisex"))
        query += ` AND LOWER(gender)='unisex'`;

    const budget = text.match(/\d+/);

    if(budget){

        values.push(Number(budget[0]));

        query += ` AND price <= $${values.length}`;

    }

    const locations=[
        "andheri",
        "bandra",
        "thane",
        "powai",
        "dadar",
        "borivali",
        "vile parle",
        "kurla"
    ];

    locations.forEach(location=>{

        if(text.includes(location)){

            values.push(`%${location}%`);

            query += ` AND LOWER(location) LIKE $${values.length}`;

        }

    });

    const result = await pool.query(query, values);

const scoredProperties = result.rows.map(property => {

    let score = 0;

    // --------------------
    // Location (40 points)
    // --------------------
    const matchedLocation = locations.find(location =>
        text.includes(location)
    );

    if (
        matchedLocation &&
        property.location &&
        property.location.toLowerCase().includes(matchedLocation)
    ) {
        score += 40;
    }

    // --------------------
// Budget (30 points)
// --------------------

if (!budget) {

    // User didn't specify a budget
    score += 30;

} else {

    const userBudget = Number(budget[0]);

    if (property.price <= userBudget) {

        score += 30;

    }

}

// --------------------
// Gender (20 points)
// --------------------

if (
    !text.includes("boys") &&
    !text.includes("girls") &&
    !text.includes("unisex")
) {

    // User didn't specify gender
    score += 20;

}
else if (

    (text.includes("boys") &&
        property.gender.toLowerCase() === "boys") ||

    (text.includes("girls") &&
        property.gender.toLowerCase() === "girls") ||

    (text.includes("unisex") &&
        property.gender.toLowerCase() === "unisex")

) {

    score += 20;

}

    // --------------------
// Room Type (10 points)
// --------------------

const roomType = property.room_type.toLowerCase();

if (
    roomType.includes("single") && text.includes("single") ||
    roomType.includes("shared") && text.includes("shared") ||
    roomType.includes("private") && text.includes("private")
) {
    score += 10;
}
else if (

    property.room_type &&
    text.includes(property.room_type.toLowerCase())

) {

    score += 10;

}

    return {

        ...property,

        matchScore: score

    };

});

// Highest score first
scoredProperties.sort((a, b) => b.matchScore - a.matchScore);

return scoredProperties;

}

module.exports=searchProperties;
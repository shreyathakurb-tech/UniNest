const roommateChatbot = document.querySelector(".roommate-chatbot");

const openRoommateBtn = document.getElementById("openRoommateChat");
const closeRoommateBtn = document.getElementById("closeRoommateChat");

const minimizeRoommateBtn = document.getElementById("minimizeRoommateChat");
const maximizeRoommateBtn = document.getElementById("maximizeRoommateChat");

const roommateInput = document.getElementById("roommateUserInput");
const roommateSendBtn = document.getElementById("roommateSendBtn");
const roommateChat = document.getElementById("roommateChatMessages");


// --------------------
// Open
// --------------------

if (openRoommateBtn && roommateChatbot) {

    openRoommateBtn.addEventListener("click", () => {

        roommateChatbot.style.display = "flex";

    });

}


// --------------------
// Close
// --------------------

if (closeRoommateBtn && roommateChatbot) {

    closeRoommateBtn.addEventListener("click", () => {

        roommateChatbot.style.display = "none";

    });

}


// --------------------
// Minimize
// --------------------

if (minimizeRoommateBtn && roommateChatbot) {

    minimizeRoommateBtn.addEventListener("click", () => {

        roommateChatbot.classList.toggle("minimized");

    });

}


// --------------------
// Maximize
// --------------------

if (maximizeRoommateBtn && roommateChatbot) {

    maximizeRoommateBtn.addEventListener("click", () => {

        roommateChatbot.classList.toggle("maximized");

    });

}


// --------------------
// Add Message
// --------------------

function addRoommateMessage(text, type) {

    if (!roommateChat) return;

    const div = document.createElement("div");

    div.className = type;

    const time = new Date().toLocaleTimeString([], {

        hour: "2-digit",

        minute: "2-digit"

    });

    div.innerHTML = `

        <div class="message-text">${text}</div>

        <div class="message-time">${time}</div>

    `;

    roommateChat.appendChild(div);

    roommateChat.scrollTop = roommateChat.scrollHeight;

}


// --------------------
// Send
// --------------------

async function sendRoommateMessage() {

    if (!roommateInput) return;

    const message = roommateInput.value.trim();

    if (!message) return;

    addRoommateMessage(message, "user");

    roommateInput.value = "";

    try {

        const response = await fetch(`${API_URL}/api/roommate`, {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify({

    message,

    userId: "guest"

})

            }

        );

        const data = await response.json();

        addRoommateMessage(data.reply, "bot");

    }

    catch (err) {

        addRoommateMessage(

            "Unable to connect to AI server.",

            "bot"

        );

    }

}


// --------------------
// Send Button
// --------------------

if (roommateSendBtn) {

    roommateSendBtn.addEventListener(

        "click",

        sendRoommateMessage

    );

}


// --------------------
// Enter Key
// --------------------

if (roommateInput) {

    roommateInput.addEventListener(

        "keydown",

        function (e) {

            if (e.key === "Enter") {

                sendRoommateMessage();

            }

        }

    );

}
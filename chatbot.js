const chatbot = document.querySelector(".chatbot");
const openBtn = document.getElementById("openChat");
const closeBtn = document.getElementById("closeChat");
const minimizeBtn = document.getElementById("minimizeChat");
const maximizeBtn = document.getElementById("maximizeChat");

const input = document.getElementById("userInput");
const send = document.getElementById("sendBtn");
const chat = document.getElementById("chatMessages");

if (openBtn) {
    openBtn.addEventListener("click", () => {
        chatbot.style.display = "flex";
    });
}

if (closeBtn) {
    closeBtn.addEventListener("click", () => {
        chatbot.style.display = "none";
    });
}

// =========================
// Minimize Chat
// =========================

if (minimizeBtn && chatbot) {

    minimizeBtn.addEventListener("click", () => {

        chatbot.classList.toggle("minimized");

    });

}

// =========================
// Maximize Chat
// =========================

if (maximizeBtn && chatbot) {

    maximizeBtn.addEventListener("click", () => {

        chatbot.classList.toggle("maximized");

    });

}

function showTyping() {

    const div = document.createElement("div");

    div.className = "bot typing-message";

    div.innerHTML = `
        <div class="typing">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;

    chat.appendChild(div);

    chat.scrollTop = chat.scrollHeight;

    return div;

}

function removeTyping(div) {

    if (div) {

        div.remove();

    }

}

function addMessage(text, type) {

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

    chat.appendChild(div);

    if (type === "user") {

        // Scroll to the bottom for the user's own message
        chat.scrollTop = chat.scrollHeight;

    } else {

        // Scroll so the TOP of the bot message is visible
        div.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

}

async function sendMessage() {

    const message = input.value.trim();

    if (!message) return;

    addMessage(message, "user");

    input.value = "";

    try {

        const typing = showTyping();

        const res = await fetch(`${API_URL}/api/chat`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

           body: JSON.stringify({

    message,

    userId: "guest"

})

        });

        const data = await res.json();

        removeTyping(typing);

        addMessage(data.reply || "No reply received", "bot");

    } catch (err) {

        removeTyping(typing);

        addMessage("Unable to connect to AI server.", "bot");

    }

}

send.addEventListener("click", sendMessage);

input.addEventListener("keydown", function (e) {

    if (e.key === "Enter") {

        sendMessage();

    }

});

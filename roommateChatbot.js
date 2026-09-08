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

function formatRoommateResponse(text) {

    // Escape HTML first for safety
    text = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    const lines = text.split("\n");
    let html = "";
    let i = 0;

    while (i < lines.length) {

        let line = lines[i].trim();

        // Empty line
        if (!line) {
            i++;
            continue;
        }

        // Markdown table
        if (
            line.startsWith("|") &&
            i + 1 < lines.length &&
            /^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?$/.test(lines[i + 1].trim())
        ) {

            const headers = line
                .split("|")
                .slice(1, -1)
                .map(cell => cell.trim());

            i += 2;

            html += `<table class="roommate-table"><thead><tr>`;

            headers.forEach(header => {
                html += `<th>${formatMarkdown(header)}</th>`;
            });

            html += `</tr></thead><tbody>`;

            while (
                i < lines.length &&
                lines[i].trim().startsWith("|")
            ) {

                const cells = lines[i]
                    .split("|")
                    .slice(1, -1)
                    .map(cell => cell.trim());

                html += `<tr>`;

                cells.forEach(cell => {
                    html += `<td>${formatMarkdown(cell)}</td>`;
                });

                html += `</tr>`;

                i++;
            }

            html += `</tbody></table>`;

            continue;
        }

        // ### Heading
        if (line.startsWith("### ")) {

            html += `<h3>${formatMarkdown(line.substring(4))}</h3>`;

            i++;
            continue;
        }

        // ## Heading
        if (line.startsWith("## ")) {

            html += `<h2>${formatMarkdown(line.substring(3))}</h2>`;

            i++;
            continue;
        }

        // # Heading
        if (line.startsWith("# ")) {

            html += `<h1>${formatMarkdown(line.substring(2))}</h1>`;

            i++;
            continue;
        }

        // Bullet list
        if (line.startsWith("- ") || line.startsWith("* ")) {

            html += `<ul>`;

            while (
                i < lines.length &&
                (lines[i].trim().startsWith("- ") ||
                 lines[i].trim().startsWith("* "))
            ) {

                const item = lines[i].trim().substring(2);

                html += `<li>${formatMarkdown(item)}</li>`;

                i++;
            }

            html += `</ul>`;

            continue;
        }

        // Normal paragraph
        html += `<p>${formatMarkdown(line)}</p>`;

        i++;
    }

    return html;
}


function formatMarkdown(text) {

    // Bold
    text = text.replace(
        /\*\*(.*?)\*\*/g,
        "<strong>$1</strong>"
    );

    // Italic
    text = text.replace(
        /\*(.*?)\*/g,
        "<em>$1</em>"
    );

    return text;
}


// --------------------
// Convert AI Markdown to HTML
// --------------------

function renderRoommateMarkdown(text) {

    // Escape HTML for safety
    text = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    // Remove horizontal separator lines
    text = text.replace(/^\s*---+\s*$/gm, "");

    // Convert Markdown tables
    const lines = text.split("\n");
    let html = "";
    let inTable = false;

    for (let i = 0; i < lines.length; i++) {

        let line = lines[i].trim();

        // Skip empty lines
        if (!line) {
            if (inTable) {
                html += "</table>";
                inTable = false;
            }
            continue;
        }

        // Detect table
        if (line.startsWith("|") && line.endsWith("|")) {

            const cells = line
                .split("|")
                .slice(1, -1)
                .map(cell => cell.trim());

            // Markdown separator row
            if (cells.every(cell => /^[-:]+$/.test(cell))) {
                continue;
            }

            if (!inTable) {
                html += `
                    <table class="roommate-table">
                        <tbody>
                `;
                inTable = true;

                html += "<tr>";

                cells.forEach(cell => {
                    html += `<th>${formatInlineMarkdown(cell)}</th>`;
                });

                html += "</tr>";
            } else {

                html += "<tr>";

                cells.forEach(cell => {
                    html += `<td>${formatInlineMarkdown(cell)}</td>`;
                });

                html += "</tr>";
            }

            continue;
        }

        // Close table if normal text starts
        if (inTable) {
            html += "</tbody></table>";
            inTable = false;
        }

        // Heading
        if (line.startsWith("### ")) {
            html += `<h3>${formatInlineMarkdown(line.substring(4))}</h3>`;
            continue;
        }

        if (line.startsWith("## ")) {
            html += `<h2>${formatInlineMarkdown(line.substring(3))}</h2>`;
            continue;
        }

        // Bullet point
        if (line.startsWith("- ")) {
            html += `<div class="roommate-bullet">• ${formatInlineMarkdown(line.substring(2))}</div>`;
            continue;
        }

        // Numbered list
        if (/^\d+\.\s/.test(line)) {
            html += `<div class="roommate-number">${formatInlineMarkdown(line)}</div>`;
            continue;
        }

        // Normal paragraph
        html += `<p>${formatInlineMarkdown(line)}</p>`;
    }

    if (inTable) {
        html += "</tbody></table>";
    }

    return html;
}


// --------------------
// Inline Markdown
// --------------------

function formatInlineMarkdown(text) {

    // Bold
    text = text.replace(
        /\*\*(.*?)\*\*/g,
        "<strong>$1</strong>"
    );

    // Italic
    text = text.replace(
        /\*(.*?)\*/g,
        "<em>$1</em>"
    );

    return text;
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

    const formattedText =
        type === "bot"
            ? renderRoommateMarkdown(text)
            : text;

    div.innerHTML = `
        <div class="message-text">
            ${formattedText}
        </div>

        <div class="message-time">
            ${time}
        </div>
    `;

    roommateChat.appendChild(div);

    roommateChat.scrollTop =
        roommateChat.scrollHeight;
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
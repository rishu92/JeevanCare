/* =========================================
   JeevanCare - Consultation Chat
   ========================================= */

const API_BASE_URL = "https://jeevancare-mnn4.onrender.com";


// =========================================
// AUTH
// =========================================

const token = localStorage.getItem("jeevancare_token");
const storedUser = localStorage.getItem("jeevancare_user");

if (!token || !storedUser) {
    window.location.href = "index.html";
}

let currentUser = null;

try {
    currentUser = JSON.parse(storedUser);
} catch (error) {

    console.error("User data error:", error);

    localStorage.removeItem("jeevancare_token");
    localStorage.removeItem("jeevancare_user");

    window.location.href = "index.html";
}


// =========================================
// CONSULTATION ID
// =========================================

const urlParams = new URLSearchParams(
    window.location.search
);

const consultationId =
    Number(urlParams.get("consultation"));


// =========================================
// ELEMENTS
// =========================================

const backLink =
    document.getElementById("backLink");

const personAvatar =
    document.getElementById("personAvatar");

const personName =
    document.getElementById("personName");

const personRole =
    document.getElementById("personRole");

const consultationStatus =
    document.getElementById("consultationStatus");

const chatMessages =
    document.getElementById("chatMessages");

const chatForm =
    document.getElementById("chatForm");

const chatInput =
    document.getElementById("chatInput");

const sendMessageBtn =
    document.getElementById("sendMessageBtn");


// =========================================
// VALIDATE CONSULTATION ID
// =========================================

if (!Number.isInteger(consultationId) || consultationId <= 0) {

    if (chatMessages) {

        chatMessages.innerHTML = `
            <div class="chat-empty">
                <div class="chat-empty-icon">!</div>

                <h3>Invalid consultation</h3>

                <p>
                    We could not find the consultation
                    associated with this chat.
                </p>
            </div>
        `;
    }

    if (chatForm) {
        chatForm.style.display = "none";
    }
}


// =========================================
// ESCAPE HTML
// =========================================

function escapeHtml(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;
}


// =========================================
// FORMAT DATE
// =========================================

function formatMessageTime(dateValue) {

    if (!dateValue) {
        return "";
    }

    const date =
        new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleTimeString(
        "en-IN",
        {
            hour: "numeric",
            minute: "2-digit"
        }
    );
}


// =========================================
// FORMAT ROLE
// =========================================

function formatRole(role) {

    if (!role) {
        return "";
    }

    if (role === "doctor") {
        return "Doctor";
    }

    if (role === "patient") {
        return "Patient";
    }

    return role.charAt(0).toUpperCase() +
        role.slice(1);
}


// =========================================
// UPDATE BACK LINK
// =========================================

function updateBackLink() {

    if (!backLink) {
        return;
    }

    if (currentUser?.role === "doctor") {

        backLink.href =
            "doctor-dashboard.html";

        backLink.innerHTML =
            `<span>←</span> Back to Dashboard`;

    } else {

        backLink.href =
            "dashboard.html";

        backLink.innerHTML =
            `<span>←</span> Back to Dashboard`;
    }
}


// =========================================
// UPDATE PERSON INFO
// =========================================

function updatePersonInfo(messages) {

    if (!messages || messages.length === 0) {

        personName.textContent =
            "Consultation Chat";

        personRole.textContent =
            "Private healthcare conversation";

        personAvatar.textContent =
            "?";

        return;
    }


    /*
     * Find the first message sent by the
     * other participant.
     */

    const otherMessage =
        messages.find(
            message =>
                Number(message.sender_id) !==
                Number(currentUser.id)
        );


    const person =
        otherMessage || messages[0];


    const name =
        person.sender_name ||
        "Consultation Participant";

    const role =
        person.sender_role ||
        "";


    personName.textContent =
        name;

    personRole.textContent =
        formatRole(role);

    personAvatar.textContent =
        name.charAt(0).toUpperCase();
}


// =========================================
// RENDER MESSAGES
// =========================================


function renderMessages(messages) {
    if (!chatMessages) return;

    if (!messages || messages.length === 0) {
        chatMessages.innerHTML = `
            <div class="chat-empty">
                <div class="chat-empty-icon">💬</div>
                <span class="empty-kicker">YOUR PRIVATE SPACE</span>
                <h3>Let's start talking!</h3>
                <p>Have a question about your consultation? Send your first message below.</p>
                <div class="empty-suggestions">
                    <span>👋 Say hello</span>
                    <span>🩺 Ask a question</span>
                    <span>💚 Discuss your care</span>
                </div>
            </div>
        `;
        return;
    }

    const wasNearBottom =
        chatMessages.scrollHeight -
        chatMessages.scrollTop -
        chatMessages.clientHeight < 100;

    chatMessages.innerHTML = messages.map(message => {
        const isSent =
            Number(message.sender_id) === Number(currentUser.id);

        const senderName = isSent
            ? "You"
            : (message.sender_name || "Consultation participant");

        const initials = senderName
            .trim()
            .charAt(0)
            .toUpperCase();

        const time = formatMessageTime(message.created_at);

        return `
            <article class="message ${isSent ? "sent" : "received"}">
                ${
                    !isSent
                        ? `
                            <div class="message-sender">
                                <span class="message-avatar">${escapeHtml(initials)}</span>
                                <span>${escapeHtml(senderName)}</span>
                            </div>
                        `
                        : ""
                }

                <div class="message-bubble">
                    <div class="message-text">${escapeHtml(message.message)}</div>

                    <div class="message-meta">
                        <span class="message-time">${escapeHtml(time)}</span>
                        ${
                            isSent
                                ? '<span class="message-status" title="Sent">✓</span>'
                                : ""
                        }
                    </div>
                </div>
            </article>
        `;
    }).join("");

    if (wasNearBottom) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}


// =========================================
// LOAD CHAT
// =========================================

async function loadChat(scrollToBottom = true) {

    if (
        !consultationId ||
        !Number.isInteger(consultationId)
    ) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/chat/${consultationId}`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load chat."
            );
        }


        // -----------------------------------------
        // Consultation status
        // -----------------------------------------

        if (consultationStatus) {

            const status =
                data.consultation?.status ||
                "unknown";

            consultationStatus.textContent =
                status;
        }


        // -----------------------------------------
        // Person information
        // -----------------------------------------

        updatePersonInfo(
            data.messages || []
        );


        // -----------------------------------------
        // Render
        // -----------------------------------------

        renderMessages(
            data.messages || []
        );


        if (!scrollToBottom) {
            return;
        }


    } catch (error) {

        console.error(
            "Chat loading error:",
            error
        );


        if (chatMessages) {

            chatMessages.innerHTML = `
                <div class="chat-empty">

                    <div class="chat-empty-icon">
                        !
                    </div>

                    <h3>Unable to load chat</h3>

                    <p>
                        ${escapeHtml(
                            error.message ||
                            "Please try again."
                        )}
                    </p>

                </div>
            `;
        }
    }
}


// =========================================
// SEND MESSAGE
// =========================================

if (chatForm) {

    chatForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const message =
                chatInput.value.trim();


            // -------------------------------------
            // Validation
            // -------------------------------------

            if (!message) {
                return;
            }


            if (message.length > 1000) {

                alert(
                    "Message cannot exceed 1000 characters."
                );

                return;
            }


            // -------------------------------------
            // Loading state
            // -------------------------------------

            sendMessageBtn.disabled =
                true;

            chatInput.disabled =
                true;


            const originalButtonHTML =
                sendMessageBtn.innerHTML;

            sendMessageBtn.innerHTML =
                `<span>Sending...</span>`;


            try {

                const response =
                    await fetch(
                        `${API_BASE_URL}/api/chat/${consultationId}`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    `Bearer ${token}`
                            },

                            body: JSON.stringify({
                                message: message
                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Unable to send message."
                    );
                }


                // Clear input

                chatInput.value = "";

                chatInput.style.height =
                    "auto";


                // Reload messages

                await loadChat(true);


            } catch (error) {

                console.error(
                    "Send message error:",
                    error
                );


                alert(
                    error.message ||
                    "Unable to send message."
                );


            } finally {

                sendMessageBtn.disabled =
                    false;

                chatInput.disabled =
                    false;

                sendMessageBtn.innerHTML =
                    originalButtonHTML;

                chatInput.focus();
            }

        }
    );
}


// =========================================
// TEXTAREA AUTO RESIZE
// =========================================

if (chatInput) {

    chatInput.addEventListener(
        "input",
        () => {

            chatInput.style.height =
                "auto";

            chatInput.style.height =
                Math.min(
                    chatInput.scrollHeight,
                    120
                ) + "px";

        }
    );


    // Enter = send
    // Shift + Enter = new line

    chatInput.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                chatForm.requestSubmit();
            }
        }
    );
}


// =========================================
// AUTO REFRESH
// =========================================

let chatRefreshTimer = null;


function startChatRefresh() {

    if (chatRefreshTimer) {

        clearInterval(
            chatRefreshTimer
        );
    }


    chatRefreshTimer =
        setInterval(
            () => {

                if (
                    document.visibilityState ===
                    "visible"
                ) {

                    loadChat(false);
                }

            },
            3000
        );
}


function stopChatRefresh() {

    if (chatRefreshTimer) {

        clearInterval(
            chatRefreshTimer
        );

        chatRefreshTimer = null;
    }
}


// Stop polling when leaving page

window.addEventListener(
    "beforeunload",
    stopChatRefresh
);


// =========================================
// INITIALIZE
// =========================================

updateBackLink();

loadChat(true);

startChatRefresh();
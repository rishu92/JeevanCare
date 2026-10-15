// ==========================================
// JeevanCare Dashboard
// ==========================================

// GET SAVED USER DATA
const token = localStorage.getItem("jeevancare_token");
const savedUser = localStorage.getItem("jeevancare_user");

// PROTECT DASHBOARD
if (!token || !savedUser) {
    window.location.href = "index.html";
}

// PARSE USER
let user = null;

try {
    user = JSON.parse(savedUser);
} catch (error) {
    console.error("Unable to read user data.");

    localStorage.removeItem("jeevancare_token");
    localStorage.removeItem("jeevancare_user");

    window.location.href = "index.html";
}

// ==========================================
// DYNAMIC GREETING + USER INFORMATION
// ==========================================

function getGreeting() {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
        return "Good morning";
    }

    if (hour >= 12 && hour < 17) {
        return "Good afternoon";
    }

    if (hour >= 17 && hour < 21) {
        return "Good evening";
    }

    return "Good night";
}

function displayUserInformation(currentUser) {
    const greetingText = document.getElementById("greetingText");
    const userNameElement = document.getElementById("userName");
    const profileName = document.getElementById("profileName");
    const profileRole = document.getElementById("profileRole");
    const userAvatar = document.getElementById("userAvatar");

    const name =
        currentUser?.name ||
        currentUser?.full_name ||
        currentUser?.fullName ||
        currentUser?.email?.split("@")[0] ||
        "Patient";

    if (greetingText) {
        greetingText.textContent = getGreeting();
    }

    if (userNameElement) {
        userNameElement.textContent = name;
    }

    if (profileName) {
        profileName.textContent = name;
    }

    if (profileRole) {
        profileRole.textContent = currentUser?.role || "patient";
    }

    if (userAvatar) {
        userAvatar.textContent = name.charAt(0).toUpperCase();
    }
}

if (user) {
    displayUserInformation(user);
}

// Update greeting every minute.
setInterval(() => {
    const greetingText = document.getElementById("greetingText");

    if (greetingText) {
        greetingText.textContent = getGreeting();
    }
}, 60000);

// ==========================================
// LOGOUT
// ==========================================

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        const confirmLogout = confirm(
            "Are you sure you want to logout?"
        );

        if (!confirmLogout) {
            return;
        }

        localStorage.removeItem("jeevancare_token");
        localStorage.removeItem("jeevancare_user");

        window.location.href = "index.html";
    });
}

// ==========================================
// VERIFY TOKEN WITH BACKEND
// ==========================================

async function verifyAuthentication() {
    try {
        const response = await fetch(
            "https://jeevancare-mnn4.onrender.com/api/auth/me",
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            throw new Error("Authentication failed.");
        }

        const data = await response.json();

        if (data.user && typeof data.user === "object") {
            // Refresh saved user data without losing existing fields.
            user = {
                ...user,
                ...data.user
            };

            localStorage.setItem(
                "jeevancare_user",
                JSON.stringify(user)
            );

            displayUserInformation(user);
        }

        console.log("Authenticated user:", data.user);

    } catch (error) {
        console.error(
            "Dashboard authentication error:",
            error
        );

        localStorage.removeItem("jeevancare_token");
        localStorage.removeItem("jeevancare_user");

        window.location.href = "index.html";
    }
}

verifyAuthentication();

// ==========================================
// LOAD MY CONSULTATIONS
// ==========================================

const consultationsList = document.getElementById(
    "consultationsList"
);

const noConsultations = document.getElementById(
    "noConsultations"
);

async function loadMyConsultations() {
    if (!consultationsList) {
        return;
    }

    const currentToken = localStorage.getItem(
        "jeevancare_token"
    );

    if (!currentToken) {
        consultationsList.innerHTML = `
            <div class="consultations-empty">
                <h3>Please login again</h3>
                <p>Your session has expired.</p>
            </div>
        `;

        return;
    }

    try {
        const response = await fetch(
            "https://jeevancare-mnn4.onrender.com/api/consultations/my",
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${currentToken}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Unable to load consultations."
            );
        }

        // NO CONSULTATIONS
        if (
            !data.consultations ||
            data.consultations.length === 0
        ) {
            consultationsList.style.display = "none";

            if (noConsultations) {
                noConsultations.style.display = "block";
            }

            return;
        }

        // SHOW CONSULTATION CARDS
        consultationsList.style.display = "grid";

        if (noConsultations) {
            noConsultations.style.display = "none";
        }

        consultationsList.innerHTML = data.consultations
            .map(consultation => {
                // Doctor name
                const doctorName =
                    consultation.doctor_name || "Doctor";

                // Doctor initials
                const initials = doctorName
                    .replace("Dr.", "")
                    .trim()
                    .split(" ")
                    .map(word => word.charAt(0))
                    .join("")
                    .substring(0, 2)
                    .toUpperCase();

                // Date
                const date = new Date(
                    consultation.created_at
                ).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short"
                });

                // Status
                const status =
                    consultation.status || "requested";

                const formattedStatus =
                    status.charAt(0).toUpperCase() +
                    status.slice(1);

                // CHAT BUTTON
                let chatButton = "";

                /*
                 * Chat is available only when the doctor
                 * has accepted the consultation or it is completed.
                 */

                if (
                    status === "accepted" ||
                    status === "completed"
                ) {
                    chatButton = `
                        <button
                            type="button"
                            class="patient-chat-btn"
                            onclick="openPatientChat(${Number(
                                consultation.id
                            )})">
                            <span>💬</span>
                            Chat
                        </button>
                    `;
                }

                // RETURN CONSULTATION CARD
                return `
                    <div
                        class="consultation-card"
                        data-consultation-id="${Number(
                            consultation.id
                        )}">

                        <div class="consultation-avatar">
                            ${escapeDashboardHtml(initials)}
                        </div>

                        <div class="consultation-info">
                            <h3>
                                ${escapeDashboardHtml(doctorName)}
                            </h3>

                            <p class="consultation-specialization">
                                ${escapeDashboardHtml(
                                    consultation.specialization ||
                                    "Medical Specialist"
                                )}
                            </p>

                            <div class="consultation-meta">
                                <span>
                                    ${escapeDashboardHtml(
                                        consultation.city || "India"
                                    )}
                                </span>

                                <span>•</span>

                                <span>
                                    ${escapeDashboardHtml(
                                        consultation.preferred_language ||
                                        "Hindi"
                                    )}
                                </span>
                            </div>
                        </div>

                        <div class="consultation-right">
                            <span
                                class="consultation-status status-${escapeDashboardHtml(
                                    status
                                )}">
                                ${escapeDashboardHtml(formattedStatus)}
                            </span>

                            <span class="consultation-date">
                                ${escapeDashboardHtml(date)}
                            </span>

                            ${chatButton}
                        </div>
                    </div>
                `;
            })
            .join("");

    } catch (error) {
        console.error(
            "Consultation loading error:",
            error
        );

        consultationsList.innerHTML = `
            <div class="consultations-empty">
                <h3>Unable to load consultations</h3>
                <p>
                    Please make sure the JeevanCare
                    backend is running.
                </p>
            </div>
        `;
    }
}

// ==========================================
// OPEN PATIENT CHAT
// ==========================================

function openPatientChat(consultationId) {
    const id = Number(consultationId);

    if (!Number.isInteger(id) || id <= 0) {
        alert("Invalid consultation.");
        return;
    }

    window.location.href = `chat.html?consultation=${id}`;
}

// ==========================================
// ESCAPE HTML
// ==========================================

function escapeDashboardHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// ==========================================
// LOAD WHEN DASHBOARD OPENS
// ==========================================

loadMyConsultations();

// ==========================================
// REFRESH CONSULTATIONS PERIODICALLY
// ==========================================

let consultationRefreshTimer = null;

function startConsultationRefresh() {
    // Prevent duplicate timers.
    if (consultationRefreshTimer) {
        clearInterval(consultationRefreshTimer);
    }

    // Refresh every 30 seconds.
    consultationRefreshTimer = setInterval(() => {
        loadMyConsultations();
    }, 30000);
}

startConsultationRefresh();
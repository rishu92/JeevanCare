// ==========================================
// JeevanCare Doctor Dashboard
// ==========================================


// ==========================================
// AUTHENTICATION
// ==========================================

const token =
    localStorage.getItem("jeevancare_token");

const savedUser =
    localStorage.getItem("jeevancare_user");


// Doctor login required
if (!token || !savedUser) {

    window.location.href = "index.html";

}


// ==========================================
// USER DATA
// ==========================================

let user = null;

try {

    user = JSON.parse(savedUser);

} catch (error) {

    console.error(
        "Unable to read saved user data."
    );

    localStorage.removeItem(
        "jeevancare_token"
    );

    localStorage.removeItem(
        "jeevancare_user"
    );

    window.location.href = "index.html";

}


// ==========================================
// CHECK DOCTOR ROLE
// ==========================================

if (user && user.role !== "doctor") {

    alert(
        "Doctor dashboard is only available for doctor accounts."
    );

    window.location.href = "dashboard.html";

}


// ==========================================
// ELEMENTS
// ==========================================

const doctorName =
    document.getElementById("doctorName");

const welcomeDoctor =
    document.getElementById("welcomeDoctor");

const doctorAvatar =
    document.getElementById("doctorAvatar");

const doctorSpecialization =
    document.getElementById(
        "doctorSpecialization"
    );

const totalRequests =
    document.getElementById("totalRequests");

const pendingRequests =
    document.getElementById("pendingRequests");

const acceptedRequests =
    document.getElementById("acceptedRequests");

const requestsList =
    document.getElementById("requestsList");

const requestsLoading =
    document.getElementById(
        "requestsLoading"
    );

const noRequests =
    document.getElementById("noRequests");

const refreshRequests =
    document.getElementById(
        "refreshRequests"
    );

const logoutBtn =
    document.getElementById("logoutBtn");


// ==========================================
// DISPLAY DOCTOR INFORMATION
// ==========================================

if (user) {

    const name =
        user.name ||
        user.full_name ||
        "Doctor";


    if (doctorName) {

        doctorName.textContent =
            name;

    }


    if (welcomeDoctor) {

        welcomeDoctor.textContent =
            name;

    }


    if (doctorAvatar) {

        doctorAvatar.textContent =
            name
                .charAt(0)
                .toUpperCase();

    }


    if (doctorSpecialization) {

        doctorSpecialization.textContent =
            user.specialization ||
            "Medical Specialist";

    }

}


// ==========================================
// LOGOUT
// ==========================================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        () => {

            const confirmLogout =
                confirm(
                    "Are you sure you want to logout?"
                );


            if (!confirmLogout) {
                return;
            }


            localStorage.removeItem(
                "jeevancare_token"
            );

            localStorage.removeItem(
                "jeevancare_user"
            );


            window.location.href =
                "index.html";

        }
    );

}


// ==========================================
// LOAD CONSULTATION REQUESTS
// ==========================================

async function loadConsultationRequests() {

    if (!requestsList) {
        return;
    }


    requestsLoading.style.display =
        "flex";

    requestsList.innerHTML = "";

    noRequests.style.display =
        "none";


    try {

        const response =
            await fetch(
                "https://jeevancare-mnn4.onrender.com/api/consultations/doctor",
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
                "Unable to load consultation requests."
            );

        }


        const consultations =
            data.consultations || [];


        // ==========================================
        // HIDE LOADING
        // ==========================================

        requestsLoading.style.display =
            "none";


        // ==========================================
        // UPDATE STATS
        // ==========================================

        const total =
            consultations.length;


        const pending =
            consultations.filter(
                consultation =>
                    consultation.status ===
                    "requested"
            ).length;


        const accepted =
            consultations.filter(
                consultation =>
                    consultation.status ===
                    "accepted"
            ).length;


        if (totalRequests) {

            totalRequests.textContent =
                total;

        }


        if (pendingRequests) {

            pendingRequests.textContent =
                pending;

        }


        if (acceptedRequests) {

            acceptedRequests.textContent =
                accepted;

        }


        // ==========================================
        // NO REQUESTS
        // ==========================================

        if (consultations.length === 0) {

            noRequests.style.display =
                "flex";

            return;

        }


        // ==========================================
        // RENDER REQUESTS
        // ==========================================

        requestsList.innerHTML =
            consultations
                .map(renderConsultation)
                .join("");


    } catch (error) {

        console.error(
            "Consultation loading error:",
            error
        );


        requestsLoading.style.display =
            "none";


        requestsList.innerHTML = `

            <div class="empty-box">

                <div class="empty-icon">
                    !
                </div>

                <h3>
                    Unable to load requests
                </h3>

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


// ==========================================
// RENDER CONSULTATION CARD
// ==========================================

function renderConsultation(
    consultation
) {

    const patientName =
        consultation.patient_name ||
        "Patient";


    // ==========================================
    // PATIENT INITIALS
    // ==========================================

    const initials =
        patientName
            .trim()
            .split(" ")
            .map(
                word =>
                    word
                        .charAt(0)
                        .toUpperCase()
            )
            .join("")
            .substring(0, 2);


    // ==========================================
    // STATUS
    // ==========================================

    const status =
        consultation.status ||
        "requested";


    const formattedStatus =
        status
            .charAt(0)
            .toUpperCase() +
        status.slice(1);


    // ==========================================
    // DATE
    // ==========================================

    const date =
        new Date(
            consultation.created_at
        ).toLocaleString(
            "en-IN",
            {
                dateStyle: "medium",
                timeStyle: "short"
            }
        );


    // ==========================================
    // CONSULTATION DETAILS
    // ==========================================

    const reason =
        consultation.reason ||
        "No reason provided";


    const language =
        consultation.preferred_language ||
        "Hindi";


    const mobile =
        consultation.patient_mobile ||
        "Not available";


    // ==========================================
    // ACTION BUTTONS
    // ==========================================

    let actionButtons = "";


    // ------------------------------------------
    // REQUESTED
    // ------------------------------------------

    if (status === "requested") {

        actionButtons = `

            <button
                class="accept-btn"
                onclick="updateConsultation(
                    ${Number(consultation.id)},
                    'accept'
                )"
            >
                Accept
            </button>


            <button
                class="reject-btn"
                onclick="updateConsultation(
                    ${Number(consultation.id)},
                    'reject'
                )"
            >
                Reject
            </button>

        `;

    }


    // ------------------------------------------
    // ACCEPTED / COMPLETED
    // ------------------------------------------

    if (
        status === "accepted" ||
        status === "completed"
    ) {

        actionButtons = `

            <button
                class="chat-btn"
                onclick="openConsultationChat(
                    ${Number(consultation.id)}
                )"
            >
                💬 Chat
            </button>

        `;

    }


    // ==========================================
    // RETURN CARD
    // ==========================================

    return `

        <div
            class="request-card"
            data-consultation-id="${Number(
                consultation.id
            )}"
        >

            <!-- PATIENT AVATAR -->

            <div class="patient-avatar">

                ${escapeHtml(initials)}

            </div>


            <!-- PATIENT INFORMATION -->

            <div class="patient-info">

                <h3>
                    ${escapeHtml(
                        patientName
                    )}
                </h3>


                <p class="patient-reason">

                    ${escapeHtml(
                        reason
                    )}

                </p>


                <div class="patient-meta">

                    <span>
                        ${escapeHtml(
                            mobile
                        )}
                    </span>

                    <span>•</span>

                    <span>
                        ${escapeHtml(
                            language
                        )}
                    </span>

                    <span>•</span>

                    <span>
                        ${escapeHtml(
                            date
                        )}
                    </span>

                </div>

            </div>


            <!-- ACTIONS -->

            <div class="request-actions">

                <span
                    class="request-status status-${escapeHtml(
                        status
                    )}"
                >

                    ${escapeHtml(
                        formattedStatus
                    )}

                </span>


                ${actionButtons}

            </div>

        </div>

    `;

}


// ==========================================
// OPEN CONSULTATION CHAT
// ==========================================

function openConsultationChat(
    consultationId
) {

    const id =
        Number(consultationId);


    if (!Number.isInteger(id) || id <= 0) {

        alert(
            "Invalid consultation."
        );

        return;

    }


    window.location.href =
        `chat.html?consultation=${id}`;

}


// ==========================================
// ACCEPT / REJECT CONSULTATION
// ==========================================

async function updateConsultation(
    consultationId,
    action
) {

    const actionText =
        action === "accept"
            ? "accept"
            : "reject";


    const confirmed =
        confirm(
            `Are you sure you want to ${actionText} this consultation?`
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `https://jeevancare-mnn4.onrender.com/api/consultations/${consultationId}/${action}`,
                {
                    method: "PATCH",

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
                `Unable to ${actionText} consultation.`
            );

        }


        alert(
            data.message ||
            `Consultation ${actionText}ed successfully.`
        );


        // Reload requests
        loadConsultationRequests();


    } catch (error) {

        console.error(
            "Consultation update error:",
            error
        );


        alert(
            error.message ||
            "Something went wrong."
        );

    }

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHtml(value) {

    return String(value ?? "")
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// ==========================================
// REFRESH
// ==========================================

if (refreshRequests) {

    refreshRequests.addEventListener(
        "click",
        loadConsultationRequests
    );

}


// ==========================================
// INITIAL LOAD
// ==========================================

loadConsultationRequests();
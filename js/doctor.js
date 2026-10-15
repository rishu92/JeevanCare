// ==========================================
// JeevanCare - Doctor Consultation
// ==========================================


// ==========================================
// AUTHENTICATION
// ==========================================

const token =
    localStorage.getItem("jeevancare_token");

if (!token) {
    window.location.href = "index.html";
}


// ==========================================
// ELEMENTS
// ==========================================

const doctorSearch =
    document.getElementById("doctorSearch");

const specializationFilter =
    document.getElementById(
        "specializationFilter"
    );

const availabilityFilter =
    document.getElementById(
        "availabilityFilter"
    );

const doctorGrid =
    document.getElementById("doctorGrid");

const doctorCount =
    document.getElementById("doctorCount");

const noDoctors =
    document.getElementById("noDoctors");


// Consultation modal
const consultModal =
    document.getElementById("consultModal");

const closeConsult =
    document.getElementById("closeConsult");

const selectedDoctor =
    document.getElementById("selectedDoctor");

const consultForm =
    document.getElementById("consultForm");

const consultReason =
    document.getElementById("consultReason");

const consultLanguage =
    document.getElementById("consultLanguage");

const consultMessage =
    document.getElementById("consultMessage");


// ==========================================
// DOCTOR DATA
// ==========================================

let doctors = [];

let selectedDoctorId = null;


// ==========================================
// LOAD DOCTORS
// ==========================================

async function loadDoctors() {

    if (!doctorGrid) {
        return;
    }


    doctorGrid.innerHTML = `
        <div class="doctors-loading">
            <div class="doctor-spinner"></div>
            <span>Loading doctors...</span>
        </div>
    `;


    try {

        const response =
            await fetch(
                "https://jeevancare-mnn4.onrender.com/api/doctors",
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
                "Unable to load doctors."
            );

        }


        doctors =
            data.doctors || [];


        renderDoctors();


    } catch (error) {

        console.error(
            "Doctor loading error:",
            error
        );


        doctorGrid.innerHTML = `
            <div class="doctor-error">

                <div class="doctor-error-icon">
                    !
                </div>

                <h3>
                    Unable to load doctors
                </h3>

                <p>
                    ${escapeHtml(
                        error.message ||
                        "Please try again."
                    )}
                </p>

                <button
                    class="retry-doctors-btn"
                    onclick="loadDoctors()"
                >
                    Try Again
                </button>

            </div>
        `;

    }

}


// ==========================================
// RENDER DOCTORS
// ==========================================

function renderDoctors() {

    const searchValue =
        doctorSearch
            ? doctorSearch.value
                .trim()
                .toLowerCase()
            : "";


    const specializationValue =
        specializationFilter
            ? specializationFilter.value
            : "all";


    const availabilityValue =
        availabilityFilter
            ? availabilityFilter.value
            : "all";


    // ==========================================
    // FILTER
    // ==========================================

    const filteredDoctors =
        doctors.filter(doctor => {

            const name =
                (
                    doctor.full_name || ""
                ).toLowerCase();


            const specialization =
                (
                    doctor.specialization || ""
                ).toLowerCase();


            const city =
                (
                    doctor.city || ""
                ).toLowerCase();


            const matchesSearch =
                !searchValue ||
                name.includes(searchValue) ||
                specialization.includes(searchValue) ||
                city.includes(searchValue);


            const matchesSpecialization =
                specializationValue === "all" ||
                doctor.specialization ===
                    specializationValue;


            const matchesAvailability =
                availabilityValue === "all" ||
                doctor.availability_status ===
                    availabilityValue;


            return (
                matchesSearch &&
                matchesSpecialization &&
                matchesAvailability
            );

        });


    // ==========================================
    // COUNT
    // ==========================================

    if (doctorCount) {

        doctorCount.textContent =
            `${filteredDoctors.length} ${
                filteredDoctors.length === 1
                    ? "doctor"
                    : "doctors"
            }`;

    }


    // ==========================================
    // NO RESULTS
    // ==========================================

    if (filteredDoctors.length === 0) {

        doctorGrid.innerHTML = "";

        if (noDoctors) {
            noDoctors.style.display = "flex";
        }

        return;

    }


    if (noDoctors) {
        noDoctors.style.display = "none";
    }


    // ==========================================
    // DOCTOR CARDS
    // ==========================================

    doctorGrid.innerHTML =
        filteredDoctors
            .map(renderDoctorCard)
            .join("");

}


// ==========================================
// DOCTOR CARD
// ==========================================

function renderDoctorCard(doctor) {

    const doctorName =
        doctor.full_name ||
        "Doctor";


    const initials =
        doctorName
            .replace(/^Dr\.\s*/i, "")
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


    const status =
        doctor.availability_status ||
        "offline";


    const statusText =
        status.charAt(0).toUpperCase() +
        status.slice(1);


    const isAvailable =
        status === "available";


    const fee =
        Number(
            doctor.consultation_fee || 0
        );


    return `

        <article class="doctor-card">


            <!-- AVATAR -->

            <div class="doctor-card-top">

                <div class="doctor-avatar">
                    ${escapeHtml(initials)}
                </div>

                <span
                    class="
                        doctor-status
                        status-${escapeHtml(status)}
                    "
                >
                    <span class="status-dot"></span>

                    ${escapeHtml(statusText)}

                </span>

            </div>


            <!-- INFORMATION -->

            <div class="doctor-card-content">

                <h3>
                    ${escapeHtml(doctorName)}
                </h3>


                <p class="doctor-specialization">

                    ${escapeHtml(
                        doctor.specialization ||
                        "Medical Specialist"
                    )}

                </p>


                <p class="doctor-qualification">

                    ${escapeHtml(
                        doctor.qualification ||
                        "Medical Professional"
                    )}

                </p>


                <div class="doctor-details">

                    <span>
                        ${escapeHtml(
                            String(
                                doctor.experience_years || 0
                            )
                        )}
                        yrs experience
                    </span>

                    <span>
                        •
                    </span>

                    <span>
                        ${escapeHtml(
                            doctor.city ||
                            "India"
                        )}
                    </span>

                </div>


                <div class="doctor-language">

                    <span>
                        Languages
                    </span>

                    <strong>
                        ${escapeHtml(
                            doctor.language ||
                            "Hindi"
                        )}
                    </strong>

                </div>


            </div>


            <!-- FOOTER -->

            <div class="doctor-card-footer">

                <div class="doctor-fee">

                    <small>
                        Consultation
                    </small>

                    <strong>
                        ₹${fee}
                    </strong>

                </div>


                <button
                    class="consult-btn"
                    ${
                        isAvailable
                            ? ""
                            : "disabled"
                    }
                    onclick="
                        openConsultationModal(
                            ${Number(doctor.id)}
                        )
                    "
                >

                    ${
                        isAvailable
                            ? "Consult Now →"
                            : "Unavailable"
                    }

                </button>

            </div>


        </article>

    `;

}


// ==========================================
// OPEN CONSULTATION MODAL
// ==========================================

function openConsultationModal(
    doctorId
) {

    const doctor =
        doctors.find(
            item =>
                Number(item.id) ===
                Number(doctorId)
        );


    if (!doctor) {

        console.error(
            "Doctor not found:",
            doctorId
        );

        return;

    }


    if (
        doctor.availability_status !==
        "available"
    ) {

        alert(
            "This doctor is currently unavailable."
        );

        return;

    }


    selectedDoctorId =
        Number(doctor.id);


    // ==========================================
    // SELECTED DOCTOR DISPLAY
    // ==========================================

    if (selectedDoctor) {

        const name =
            doctor.full_name ||
            "Doctor";


        const initials =
            name
                .replace(/^Dr\.\s*/i, "")
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


        selectedDoctor.innerHTML = `

            <div class="selected-doctor-avatar">

                ${escapeHtml(initials)}

            </div>


            <div class="selected-doctor-info">

                <h3>
                    ${escapeHtml(name)}
                </h3>

                <p>
                    ${escapeHtml(
                        doctor.specialization ||
                        "Medical Specialist"
                    )}
                </p>

                <span>
                    ₹${Number(
                        doctor.consultation_fee || 0
                    )}
                    consultation
                </span>

            </div>

        `;

    }


    // ==========================================
    // RESET MESSAGE
    // ==========================================

    if (consultMessage) {

        consultMessage.textContent = "";

        consultMessage.className =
            "consult-message";

    }


    // ==========================================
    // OPEN MODAL
    // ==========================================

    if (consultModal) {

        consultModal.classList.add(
            "active"
        );

        document.body.style.overflow =
            "hidden";

    }

}


// ==========================================
// CLOSE CONSULTATION MODAL
// ==========================================

function closeConsultationModal() {

    if (consultModal) {

        consultModal.classList.remove(
            "active"
        );

    }

    document.body.style.overflow =
        "";

    selectedDoctorId =
        null;

}


// ==========================================
// CLOSE BUTTON
// ==========================================

if (closeConsult) {

    closeConsult.addEventListener(
        "click",
        closeConsultationModal
    );

}


// ==========================================
// CLICK OUTSIDE MODAL
// ==========================================

if (consultModal) {

    consultModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                consultModal
            ) {

                closeConsultationModal();

            }

        }
    );

}


// ==========================================
// ESC KEY
// ==========================================

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            consultModal &&
            consultModal.classList.contains(
                "active"
            )
        ) {

            closeConsultationModal();

        }

    }
);


// ==========================================
// SUBMIT CONSULTATION
// ==========================================

if (consultForm) {

    consultForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            // ==========================================
            // VALIDATE DOCTOR
            // ==========================================

            if (!selectedDoctorId) {

                showConsultMessage(
                    "Please select a doctor first.",
                    true
                );

                return;

            }


            // ==========================================
            // GET VALUES
            // ==========================================

            const reason =
                consultReason
                    ? consultReason.value.trim()
                    : "";


            const language =
                consultLanguage
                    ? consultLanguage.value
                    : "Hindi";


            // ==========================================
            // VALIDATE REASON
            // ==========================================

            if (!reason) {

                showConsultMessage(
                    "Please describe your health concern.",
                    true
                );

                if (consultReason) {
                    consultReason.focus();
                }

                return;

            }


            if (reason.length < 5) {

                showConsultMessage(
                    "Please provide a little more detail about your concern.",
                    true
                );

                if (consultReason) {
                    consultReason.focus();
                }

                return;

            }


            // ==========================================
            // FIND SUBMIT BUTTON
            // ==========================================

            const submitButton =
                consultForm.querySelector(
                    'button[type="submit"]'
                );


            if (submitButton) {

                submitButton.disabled =
                    true;

                submitButton.dataset.originalText =
                    submitButton.innerHTML;

                submitButton.innerHTML =
                    "Sending Request...";

            }


            try {

                // ==========================================
                // API REQUEST
                // ==========================================

                const response =
                    await fetch(
                        "https://jeevancare-mnn4.onrender.com/api/consultations",
                        {
                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    `Bearer ${token}`

                            },

                            body:
                                JSON.stringify({

                                    doctor_id:
                                        selectedDoctorId,

                                    reason:
                                        reason,

                                    preferred_language:
                                        language

                                })

                        }
                    );


                const data =
                    await response.json();


                // ==========================================
                // API ERROR
                // ==========================================

                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Unable to send consultation request."
                    );

                }


                // ==========================================
                // SUCCESS
                // ==========================================

                showConsultMessage(
                    data.message ||
                    "Consultation request sent successfully!",
                    false
                );


                // Reset form
                if (consultForm) {
                    consultForm.reset();
                }


                // ==========================================
                // GO TO DASHBOARD
                // ==========================================

                setTimeout(() => {

                    window.location.href =
                        "dashboard.html";

                }, 1500);


            } catch (error) {

                console.error(
                    "Consultation request error:",
                    error
                );


                showConsultMessage(
                    error.message ||
                    "Unable to send consultation request.",
                    true
                );


                // Re-enable button
                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.innerHTML =
                        submitButton.dataset.originalText ||
                        "Send Request";

                }

            }

        }
    );

}


// ==========================================
// SHOW CONSULTATION MESSAGE
// ==========================================

function showConsultMessage(
    message,
    isError = false
) {

    if (!consultMessage) {
        return;
    }


    consultMessage.textContent =
        message;


    consultMessage.className =
        isError
            ? "consult-message error"
            : "consult-message success";

}


// ==========================================
// SEARCH
// ==========================================

if (doctorSearch) {

    doctorSearch.addEventListener(
        "input",
        renderDoctors
    );

}


// ==========================================
// SPECIALIZATION FILTER
// ==========================================

if (specializationFilter) {

    specializationFilter.addEventListener(
        "change",
        renderDoctors
    );

}


// ==========================================
// AVAILABILITY FILTER
// ==========================================

if (availabilityFilter) {

    availabilityFilter.addEventListener(
        "change",
        renderDoctors
    );

}


// ==========================================
// HTML ESCAPE
// ==========================================

function escapeHtml(value) {

    return String(value)
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
// LOAD DOCTORS ON PAGE LOAD
// ==========================================

loadDoctors();
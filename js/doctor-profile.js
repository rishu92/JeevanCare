// ==========================================
// JeevanCare Doctor Profile
// ==========================================


// ==========================================
// AUTHENTICATION
// ==========================================

const token =
    localStorage.getItem("jeevancare_token");

const savedUser =
    localStorage.getItem("jeevancare_user");


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
        "Unable to read user data."
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
// DOCTOR ONLY
// ==========================================

if (user && user.role !== "doctor") {

    alert(
        "This page is only available for doctor accounts."
    );

    window.location.href =
        "dashboard.html";

}


// ==========================================
// ELEMENTS
// ==========================================

const doctorAvatar =
    document.getElementById(
        "doctorAvatar"
    );

const doctorName =
    document.getElementById(
        "doctorName"
    );

const doctorEmail =
    document.getElementById(
        "doctorEmail"
    );

const specialization =
    document.getElementById(
        "specialization"
    );

const qualification =
    document.getElementById(
        "qualification"
    );

const experience =
    document.getElementById(
        "experience"
    );

const fee =
    document.getElementById(
        "fee"
    );

const language =
    document.getElementById(
        "language"
    );

const city =
    document.getElementById(
        "city"
    );

const availability =
    document.getElementById(
        "availability"
    );

const profileForm =
    document.getElementById(
        "doctorProfileForm"
    );

const profileMessage =
    document.getElementById(
        "profileMessage"
    );

const saveProfileBtn =
    document.getElementById(
        "saveProfileBtn"
    );


// ==========================================
// SHOW BASIC USER INFO
// ==========================================

if (user) {

    const name =
        user.name || "Doctor";

    if (doctorName) {
        doctorName.textContent = name;
    }

    if (doctorEmail) {
        doctorEmail.textContent =
            user.email || "Doctor account";
    }

    if (doctorAvatar) {
        doctorAvatar.textContent =
            name
                .charAt(0)
                .toUpperCase();
    }

}


// ==========================================
// LOAD DOCTOR PROFILE
// ==========================================

async function loadDoctorProfile() {

    try {

        const response =
            await fetch(
                "http://localhost:5000/api/doctors/profile",
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
                "Unable to load doctor profile."
            );

        }


        const doctor =
            data.doctor;


        if (!doctor) {

            throw new Error(
                "Doctor profile not found."
            );

        }


        // ==========================================
        // FILL FORM
        // ==========================================

        if (specialization) {
            specialization.value =
                doctor.specialization || "";
        }

        if (qualification) {
            qualification.value =
                doctor.qualification || "";
        }

        if (experience) {
            experience.value =
                doctor.experience_years ?? 0;
        }

        if (fee) {
            fee.value =
                doctor.consultation_fee ?? 0;
        }

        if (language) {
            language.value =
                doctor.language || "";
        }

        if (city) {
            city.value =
                doctor.city || "";
        }

        if (availability) {
            availability.value =
                doctor.availability_status ||
                "offline";
        }


        // Update name from doctor profile
        if (
            doctorName &&
            doctor.full_name
        ) {

            doctorName.textContent =
                doctor.full_name;

        }


        if (
            doctorAvatar &&
            doctor.full_name
        ) {

            doctorAvatar.textContent =
                doctor.full_name
                    .charAt(0)
                    .toUpperCase();

        }


    } catch (error) {

        console.error(
            "Doctor profile loading error:",
            error
        );

        showMessage(
            error.message ||
            "Unable to load profile.",
            true
        );

    }

}


// ==========================================
// SAVE PROFILE
// ==========================================

if (profileForm) {

    profileForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            // ==========================================
            // VALUES
            // ==========================================

            const profileData = {

                specialization:
                    specialization.value.trim(),

                qualification:
                    qualification.value.trim(),

                experience_years:
                    Number(experience.value),

                consultation_fee:
                    Number(fee.value),

                language:
                    language.value.trim(),

                city:
                    city.value.trim(),

                availability_status:
                    availability.value

            };


            // ==========================================
            // CLIENT VALIDATION
            // ==========================================

            if (
                !profileData.specialization ||
                !profileData.qualification ||
                !profileData.language ||
                !profileData.city
            ) {

                showMessage(
                    "Please fill all profile fields.",
                    true
                );

                return;

            }


            if (
                Number.isNaN(
                    profileData.experience_years
                ) ||
                profileData.experience_years < 0
            ) {

                showMessage(
                    "Please enter a valid experience.",
                    true
                );

                return;

            }


            if (
                Number.isNaN(
                    profileData.consultation_fee
                ) ||
                profileData.consultation_fee < 0
            ) {

                showMessage(
                    "Please enter a valid consultation fee.",
                    true
                );

                return;

            }


            // ==========================================
            // DISABLE BUTTON
            // ==========================================

            saveProfileBtn.disabled = true;

            saveProfileBtn.innerHTML =
                "Saving...";


            try {

                const response =
                    await fetch(
                        "http://localhost:5000/api/doctors/profile",
                        {
                            method: "PUT",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    `Bearer ${token}`

                            },

                            body:
                                JSON.stringify(
                                    profileData
                                )

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Unable to update profile."
                    );

                }


                // ==========================================
                // SUCCESS
                // ==========================================

                showMessage(
                    data.message ||
                    "Profile updated successfully.",
                    false
                );


                // Update displayed name
                if (
                    data.doctor &&
                    doctorName &&
                    data.doctor.full_name
                ) {

                    doctorName.textContent =
                        data.doctor.full_name;

                }


            } catch (error) {

                console.error(
                    "Profile update error:",
                    error
                );

                showMessage(
                    error.message ||
                    "Unable to update profile.",
                    true
                );

            } finally {

                saveProfileBtn.disabled =
                    false;

                saveProfileBtn.innerHTML =
                    `Save Changes <span>→</span>`;

            }

        }
    );

}


// ==========================================
// MESSAGE
// ==========================================

function showMessage(
    message,
    isError = false
) {

    if (!profileMessage) {
        return;
    }


    profileMessage.textContent =
        message;


    profileMessage.classList.toggle(
        "error",
        isError
    );


    // Clear success message after a while
    if (!isError) {

        setTimeout(() => {

            if (profileMessage) {

                profileMessage.textContent =
                    "";

            }

        }, 4000);

    }

}


// ==========================================
// INITIAL LOAD
// ==========================================

loadDoctorProfile();
/* =========================================
   JeevanCare - Patient Profile
   ========================================= */

const API_BASE_URL = "https://jeevancare-mnn4.onrender.com";

const token = localStorage.getItem("jeevancare_token");
const storedUser = localStorage.getItem("jeevancare_user");


// =========================================
// AUTH CHECK
// =========================================

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
// ELEMENTS
// =========================================

const profileAvatar = document.getElementById("profileAvatar");
const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const profileRole = document.getElementById("profileRole");

const fullNameInput = document.getElementById("fullName");
const mobileInput = document.getElementById("mobile");
const emailInput = document.getElementById("email");

const accountRole = document.getElementById("accountRole");
const memberSince = document.getElementById("memberSince");

const profileForm = document.getElementById("profileForm");
const profileMessage = document.getElementById("profileMessage");
const saveProfileBtn = document.getElementById("saveProfileBtn");


// =========================================
// SHOW MESSAGE
// =========================================

function showMessage(message, type) {

    if (!profileMessage) return;

    profileMessage.textContent = message;

    profileMessage.className =
        `profile-message ${type}`;

    profileMessage.style.display = "block";
}


// =========================================
// HIDE MESSAGE
// =========================================

function hideMessage() {

    if (!profileMessage) return;

    profileMessage.style.display = "none";
}


// =========================================
// UPDATE PROFILE HEADER
// =========================================

function updateProfileHeader(user) {

    const name =
        user.full_name || "User";

    const email =
        user.email || "No email";

    const role =
        user.role || "patient";


    if (profileName) {
        profileName.textContent = name;
    }

    if (profileEmail) {
        profileEmail.textContent = email;
    }

    if (profileRole) {
        profileRole.textContent =
            role.charAt(0).toUpperCase() +
            role.slice(1);
    }

    if (accountRole) {
        accountRole.textContent =
            role.charAt(0).toUpperCase() +
            role.slice(1);
    }

    if (profileAvatar) {
        profileAvatar.textContent =
            name.charAt(0).toUpperCase();
    }
}


// =========================================
// FORMAT DATE
// =========================================

function formatMemberSince(dateValue) {

    if (!dateValue) {
        return "—";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}


// =========================================
// LOAD PROFILE
// =========================================

async function loadProfile() {

    hideMessage();

    try {

        const response = await fetch(
            `${API_BASE_URL}/api/users/profile`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );


        const data = await response.json();


        if (!response.ok) {
            throw new Error(
                data.message ||
                "Unable to load profile."
            );
        }


        currentUser = data.user;


        // Save latest user data locally
        localStorage.setItem(
            "jeevancare_user",
            JSON.stringify(data.user)
        );


        // Update UI
        updateProfileHeader(data.user);


        // Fill form
        fullNameInput.value =
            data.user.full_name || "";

        mobileInput.value =
            data.user.mobile || "";

        emailInput.value =
            data.user.email || "";


        // Member since
        memberSince.textContent =
            formatMemberSince(
                data.user.created_at
            );


    } catch (error) {

        console.error(
            "Profile loading error:",
            error
        );

        showMessage(
            error.message ||
            "Unable to load your profile.",
            "error"
        );
    }
}


// =========================================
// MOBILE INPUT
// =========================================

if (mobileInput) {

    mobileInput.addEventListener(
        "input",
        () => {

            mobileInput.value =
                mobileInput.value
                    .replace(/\D/g, "")
                    .slice(0, 10);

        }
    );
}


// =========================================
// SAVE PROFILE
// =========================================

if (profileForm) {

    profileForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            hideMessage();


            const fullName =
                fullNameInput.value.trim();

            const mobile =
                mobileInput.value.trim();

            const email =
                emailInput.value.trim();


            // -------------------------------------
            // Validation
            // -------------------------------------

            if (fullName.length < 2) {

                showMessage(
                    "Please enter a valid full name.",
                    "error"
                );

                fullNameInput.focus();

                return;
            }


            if (!/^[0-9]{10}$/.test(mobile)) {

                showMessage(
                    "Please enter a valid 10-digit mobile number.",
                    "error"
                );

                mobileInput.focus();

                return;
            }


            if (
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
            ) {

                showMessage(
                    "Please enter a valid email address.",
                    "error"
                );

                emailInput.focus();

                return;
            }


            // -------------------------------------
            // Loading state
            // -------------------------------------

            const originalButtonHTML =
                saveProfileBtn.innerHTML;

            saveProfileBtn.disabled = true;

            saveProfileBtn.innerHTML =
                "Saving...";


            try {

                const response = await fetch(
                    `${API_BASE_URL}/api/users/profile`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },

                        body: JSON.stringify({
                            full_name: fullName,
                            mobile: mobile,
                            email: email
                        })
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


                // ---------------------------------
                // Store updated user
                // ---------------------------------

                currentUser =
                    data.user;

                localStorage.setItem(
                    "jeevancare_user",
                    JSON.stringify(data.user)
                );


                // ---------------------------------
                // Update UI
                // ---------------------------------

                updateProfileHeader(
                    data.user
                );


                fullNameInput.value =
                    data.user.full_name || "";

                mobileInput.value =
                    data.user.mobile || "";

                emailInput.value =
                    data.user.email || "";


                // ---------------------------------
                // Success
                // ---------------------------------

                showMessage(
                    data.message ||
                    "Profile updated successfully.",
                    "success"
                );


            } catch (error) {

                console.error(
                    "Profile update error:",
                    error
                );

                showMessage(
                    error.message ||
                    "Unable to update profile.",
                    "error"
                );


            } finally {

                saveProfileBtn.disabled =
                    false;

                saveProfileBtn.innerHTML =
                    originalButtonHTML;
            }

        }
    );
}


// =========================================
// INITIAL LOAD
// =========================================

loadProfile();
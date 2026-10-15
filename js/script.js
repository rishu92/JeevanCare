// ==========================================
// JeevanCare - Main Frontend Script
// ==========================================


// ==========================================
// PAGE LOADER
// ==========================================

window.addEventListener("load", () => {

    const pageLoader =
        document.getElementById("pageLoader");

    if (pageLoader) {

        setTimeout(() => {

            pageLoader.classList.add("hide");

        }, 500);

    }

});


// ==========================================
// MOBILE NAVIGATION
// ==========================================

const menuToggle =
    document.getElementById("menuToggle");

const navMenu =
    document.getElementById("navMenu");


if (menuToggle && navMenu) {

    menuToggle.addEventListener(
        "click",
        () => {

            navMenu.classList.toggle("active");

            menuToggle.classList.toggle("active");

        }
    );

}


// Close mobile menu when clicking navigation link

document.querySelectorAll(".nav-link").forEach(
    (link) => {

        link.addEventListener(
            "click",
            () => {

                if (navMenu) {

                    navMenu.classList.remove(
                        "active"
                    );

                }

                if (menuToggle) {

                    menuToggle.classList.remove(
                        "active"
                    );

                }

            }
        );

    }
);


// ==========================================
// MODAL ELEMENTS
// ==========================================

const loginOverlay =
    document.getElementById("loginOverlay");

const registerOverlay =
    document.getElementById("registerOverlay");

const otpOverlay =
    document.getElementById("otpOverlay");

const termsModal =
    document.getElementById("termsModal");


// ==========================================
// MODAL HELPERS
// ==========================================

function openModal(modal) {

    if (!modal) return;

    modal.classList.add("active");

    document.body.classList.add(
        "modal-open"
    );

}


function closeModal(modal) {

    if (!modal) return;

    modal.classList.remove("active");

    document.body.classList.remove(
        "modal-open"
    );

}


// ==========================================
// LOGIN BUTTONS
// ==========================================

const openLogin =
    document.getElementById("openLogin");

const heroLogin =
    document.getElementById("heroLogin");

const mobileLogin =
    document.getElementById("mobileLogin");

const safetyLogin =
    document.getElementById("safetyLogin");

const ctaLogin =
    document.getElementById("ctaLogin");


// Navbar Login

if (openLogin) {

    openLogin.addEventListener(
        "click",
        () => {

            window.location.href =
                "login.html";

        }
    );

}


// Hero Login

if (heroLogin) {

    heroLogin.addEventListener(
        "click",
        () => {

            window.location.href =
                "login.html";

        }
    );

}


// Mobile Login

if (mobileLogin) {

    mobileLogin.addEventListener(
        "click",
        () => {

            window.location.href =
                "login.html";

        }
    );

}


// Safety Login

if (safetyLogin) {

    safetyLogin.addEventListener(
        "click",
        () => {

            window.location.href =
                "login.html";

        }
    );

}


// CTA Login

if (ctaLogin) {

    ctaLogin.addEventListener(
        "click",
        () => {

            window.location.href =
                "login.html";

        }
    );

}


// ==========================================
// REGISTER BUTTONS
// ==========================================

const openRegister =
    document.getElementById("openRegister");

const heroGetStarted =
    document.getElementById("heroGetStarted");

const mobileRegister =
    document.getElementById("mobileRegister");


// Navbar Register

if (openRegister) {

    openRegister.addEventListener(
        "click",
        () => {

            window.location.href =
                "register.html";

        }
    );

}


// Hero Get Started

if (heroGetStarted) {

    heroGetStarted.addEventListener(
        "click",
        () => {

            window.location.href =
                "register.html";

        }
    );

}


// Mobile Register

if (mobileRegister) {

    mobileRegister.addEventListener(
        "click",
        () => {

            window.location.href =
                "register.html";

        }
    );

}


// ==========================================
// CLOSE BUTTONS
// ==========================================

const closeLogin =
    document.getElementById("closeLogin");

const closeRegister =
    document.getElementById("closeRegister");

const closeOtp =
    document.getElementById("closeOtp");

const closeTerms =
    document.getElementById("closeTerms");


if (closeLogin) {

    closeLogin.addEventListener(
        "click",
        () => {

            closeModal(loginOverlay);

        }
    );

}


if (closeRegister) {

    closeRegister.addEventListener(
        "click",
        () => {

            closeModal(registerOverlay);

        }
    );

}


if (closeOtp) {

    closeOtp.addEventListener(
        "click",
        () => {

            closeModal(otpOverlay);

        }
    );

}


if (closeTerms) {

    closeTerms.addEventListener(
        "click",
        () => {

            closeModal(termsModal);

        }
    );

}


// ==========================================
// SWITCH LOGIN → REGISTER
// ==========================================

const switchToRegister =
    document.getElementById(
        "switchToRegister"
    );


if (switchToRegister) {

    switchToRegister.addEventListener(
        "click",
        (event) => {

            event.preventDefault();

            /*
             * Since standalone pages are now being used,
             * send the user directly to register.html.
             */

            window.location.href =
                "register.html";

        }
    );

}


// ==========================================
// SWITCH REGISTER → LOGIN
// ==========================================

const switchToLogin =
    document.getElementById(
        "switchToLogin"
    );


if (switchToLogin) {

    switchToLogin.addEventListener(
        "click",
        (event) => {

            event.preventDefault();

            /*
             * Since standalone pages are now being used,
             * send the user directly to login.html.
             */

            window.location.href =
                "login.html";

        }
    );

}


// ==========================================
// PASSWORD TOGGLE - LOGIN MODAL
// ==========================================

const toggleLoginPassword =
    document.getElementById(
        "toggleLoginPassword"
    );

const loginPassword =
    document.getElementById(
        "loginPassword"
    );


if (
    toggleLoginPassword &&
    loginPassword
) {

    toggleLoginPassword.addEventListener(
        "click",
        () => {

            if (
                loginPassword.type ===
                "password"
            ) {

                loginPassword.type =
                    "text";

                toggleLoginPassword.textContent =
                    "Hide";

            } else {

                loginPassword.type =
                    "password";

                toggleLoginPassword.textContent =
                    "Show";

            }

        }
    );

}


// ==========================================
// PASSWORD TOGGLE - REGISTER MODAL
// ==========================================

const toggleRegisterPassword =
    document.getElementById(
        "toggleRegisterPassword"
    );

const registerPassword =
    document.getElementById(
        "registerPassword"
    );


if (
    toggleRegisterPassword &&
    registerPassword
) {

    toggleRegisterPassword.addEventListener(
        "click",
        () => {

            if (
                registerPassword.type ===
                "password"
            ) {

                registerPassword.type =
                    "text";

                toggleRegisterPassword.textContent =
                    "Hide";

            } else {

                registerPassword.type =
                    "password";

                toggleRegisterPassword.textContent =
                    "Show";

            }

        }
    );

}


// ==========================================
// PASSWORD TOGGLE - CONFIRM PASSWORD
// ==========================================

const toggleConfirmPassword =
    document.getElementById(
        "toggleConfirmPassword"
    );

const confirmPassword =
    document.getElementById(
        "confirmPassword"
    );


if (
    toggleConfirmPassword &&
    confirmPassword
) {

    toggleConfirmPassword.addEventListener(
        "click",
        () => {

            if (
                confirmPassword.type ===
                "password"
            ) {

                confirmPassword.type =
                    "text";

                toggleConfirmPassword.textContent =
                    "Hide";

            } else {

                confirmPassword.type =
                    "password";

                toggleConfirmPassword.textContent =
                    "Show";

            }

        }
    );

}


// ==========================================
// TERMS MODAL
// ==========================================

const termsButton =
    document.getElementById(
        "termsButton"
    );

const acceptTerms =
    document.getElementById(
        "acceptTerms"
    );


if (termsButton) {

    termsButton.addEventListener(
        "click",
        (event) => {

            event.preventDefault();

            openModal(termsModal);

        }
    );

}


if (acceptTerms) {

    acceptTerms.addEventListener(
        "click",
        () => {

            const termsCheckbox =
                document.getElementById(
                    "termsCheckbox"
                );


            if (termsCheckbox) {

                termsCheckbox.checked =
                    true;

            }


            closeModal(termsModal);

        }
    );

}


// ==========================================
// CLOSE MODAL WHEN CLICKING OUTSIDE
// ==========================================

[
    loginOverlay,
    registerOverlay,
    otpOverlay,
    termsModal
].forEach(
    (overlay) => {

        if (!overlay) return;


        overlay.addEventListener(
            "click",
            (event) => {

                if (
                    event.target ===
                    overlay
                ) {

                    closeModal(
                        overlay
                    );

                }

            }
        );

    }
);


// ==========================================
// ESCAPE KEY CLOSE MODALS
// ==========================================

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key !==
            "Escape"
        ) {
            return;
        }


        closeModal(loginOverlay);

        closeModal(registerOverlay);

        closeModal(otpOverlay);

        closeModal(termsModal);

    }
);


// ==========================================
// MOBILE NUMBER INPUT
// ==========================================

const registerMobile =
    document.getElementById(
        "registerMobile"
    );


if (registerMobile) {

    registerMobile.addEventListener(
        "input",
        () => {

            registerMobile.value =
                registerMobile.value
                    .replace(/\D/g, "")
                    .slice(0, 10);

        }
    );

}


// ==========================================
// OLD MODAL REGISTER FORM
// ==========================================

const registerForm =
    document.getElementById(
        "registerForm"
    );


if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            // ------------------------------------------
            // GET FORM VALUES
            // ------------------------------------------

            const nameElement =
                document.getElementById(
                    "registerName"
                );

            const mobileElement =
                document.getElementById(
                    "registerMobile"
                );

            const emailElement =
                document.getElementById(
                    "registerEmail"
                );

            const passwordElement =
                document.getElementById(
                    "registerPassword"
                );

            const confirmPasswordElement =
                document.getElementById(
                    "confirmPassword"
                );


            /*
             * If these elements do not exist,
             * the standalone register.html is
             * being used instead.
             */

            if (
                !nameElement ||
                !mobileElement ||
                !emailElement ||
                !passwordElement ||
                !confirmPasswordElement
            ) {

                return;

            }


            const name =
                nameElement.value.trim();

            const mobile =
                mobileElement.value.trim();

            const email =
                emailElement.value.trim();

            const password =
                passwordElement.value;

            const confirmPasswordValue =
                confirmPasswordElement.value;


            // ------------------------------------------
            // ROLE
            // ------------------------------------------

            const roleElement =
                document.querySelector(
                    'input[name="role"]:checked'
                );


            const roleError =
                document.getElementById(
                    "roleError"
                );

            const termsError =
                document.getElementById(
                    "termsError"
                );

            const registerDemoMessage =
                document.getElementById(
                    "registerDemoMessage"
                );


            if (roleError) {
                roleError.textContent = "";
            }

            if (termsError) {
                termsError.textContent = "";
            }

            if (registerDemoMessage) {
                registerDemoMessage.textContent = "";
            }


            // ------------------------------------------
            // ROLE VALIDATION
            // ------------------------------------------

            if (!roleElement) {

                if (roleError) {

                    roleError.textContent =
                        "Please select your role.";

                }

                return;

            }


            // ------------------------------------------
            // MOBILE VALIDATION
            // ------------------------------------------

            if (
                !/^[6-9]\d{9}$/.test(
                    mobile
                )
            ) {

                if (registerDemoMessage) {

                    registerDemoMessage.textContent =
                        "Please enter a valid 10-digit mobile number.";

                }

                return;

            }


            // ------------------------------------------
            // EMAIL VALIDATION
            // ------------------------------------------

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (
                !emailPattern.test(
                    email
                )
            ) {

                if (registerDemoMessage) {

                    registerDemoMessage.textContent =
                        "Please enter a valid email address.";

                }

                return;

            }


            // ------------------------------------------
            // PASSWORD VALIDATION
            // ------------------------------------------

            if (
                password.length < 8
            ) {

                if (registerDemoMessage) {

                    registerDemoMessage.textContent =
                        "Password must contain at least 8 characters.";

                }

                return;

            }


            // ------------------------------------------
            // CONFIRM PASSWORD
            // ------------------------------------------

            if (
                password !==
                confirmPasswordValue
            ) {

                if (registerDemoMessage) {

                    registerDemoMessage.textContent =
                        "Passwords do not match.";

                }

                return;

            }


            // ------------------------------------------
            // TERMS
            // ------------------------------------------

            const termsCheckbox =
                document.getElementById(
                    "termsCheckbox"
                );


            if (
                !termsCheckbox ||
                !termsCheckbox.checked
            ) {

                if (termsError) {

                    termsError.textContent =
                        "Please accept the terms and conditions.";

                }

                return;

            }


            const role =
                roleElement.value;


            // ------------------------------------------
            // SEND TO BACKEND
            // ------------------------------------------

            try {

                if (registerDemoMessage) {

                    registerDemoMessage.textContent =
                        "Creating your account...";

                }


                const response =
                    await fetch(
                        "https://jeevancare-mnn4.onrender.com/api/auth/register",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({

                                    full_name:
                                        name,

                                    mobile:
                                        mobile,

                                    email:
                                        email,

                                    password:
                                        password,

                                    role:
                                        role

                                })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    if (registerDemoMessage) {

                        registerDemoMessage.textContent =
                            data.message ||
                            "Registration failed.";

                    }

                    return;

                }


                // ------------------------------------------
                // SUCCESS
                // ------------------------------------------

                if (registerDemoMessage) {

                    registerDemoMessage.textContent =
                        "Registration successful!";

                }


                console.log(
                    "Registration response:",
                    data
                );


                // ------------------------------------------
                // STORE OTP INFORMATION
                // ------------------------------------------

                sessionStorage.setItem(
                    "jeevancare_otp_destination",
                    mobile
                );

                sessionStorage.setItem(
                    "jeevancare_otp_email",
                    email
                );

                sessionStorage.setItem(
                    "jeevancare_registered_role",
                    role
                );

                sessionStorage.setItem(
                    "jeevancare_demo_otp",
                    "123456"
                );


                // ------------------------------------------
                // OPEN OTP MODAL
                // ------------------------------------------

                setTimeout(
                    () => {

                        closeModal(
                            registerOverlay
                        );


                        const otpDestination =
                            document.getElementById(
                                "otpDestination"
                            );


                        if (otpDestination) {

                            otpDestination.textContent =
                                mobile;

                        }


                        openModal(
                            otpOverlay
                        );

                    },
                    800
                );


            } catch (error) {

                console.error(
                    "Registration request error:",
                    error
                );


                if (registerDemoMessage) {

                    registerDemoMessage.textContent =
                        "Unable to connect to the server. Please make sure the backend is running.";

                }

            }

        }
    );

}


// ==========================================
// OTP INPUTS - OLD MODAL
// ==========================================

const otpInputs =
    document.querySelectorAll(
        ".otp-input"
    );


otpInputs.forEach(
    (input, index) => {

        input.addEventListener(
            "input",
            () => {

                input.value =
                    input.value
                        .replace(/\D/g, "")
                        .slice(0, 1);


                if (
                    input.value &&
                    index <
                    otpInputs.length - 1
                ) {

                    otpInputs[
                        index + 1
                    ].focus();

                }

            }
        );


        input.addEventListener(
            "keydown",
            (event) => {

                if (
                    event.key ===
                    "Backspace" &&
                    !input.value &&
                    index > 0
                ) {

                    otpInputs[
                        index - 1
                    ].focus();

                }

            }
        );

    }
);


// ==========================================
// OTP FORM - OLD MODAL DEMO
// ==========================================

const otpForm =
    document.getElementById(
        "otpForm"
    );

const otpError =
    document.getElementById(
        "otpError"
    );

const otpDemoMessage =
    document.getElementById(
        "otpDemoMessage"
    );


if (otpForm) {

    otpForm.addEventListener(
        "submit",
        (event) => {

            event.preventDefault();


            let enteredOtp =
                "";


            otpInputs.forEach(
                (input) => {

                    enteredOtp +=
                        input.value;

                }
            );


            // Demo OTP

            if (
                enteredOtp !==
                "123456"
            ) {

                if (otpError) {

                    otpError.textContent =
                        "Invalid OTP. Use 123456 for demo.";

                }

                return;

            }


            if (otpError) {

                otpError.textContent =
                    "";

            }


            if (otpDemoMessage) {

                otpDemoMessage.textContent =
                    "OTP verified successfully!";

            }


            setTimeout(
                () => {

                    closeModal(
                        otpOverlay
                    );


                    if (otpForm) {

                        otpForm.reset();

                    }

                },
                1000
            );

        }
    );

}


// ==========================================
// BACK TO REGISTER FROM OLD OTP MODAL
// ==========================================

const backToRegister =
    document.getElementById(
        "backToRegister"
    );


if (backToRegister) {

    backToRegister.addEventListener(
        "click",
        (event) => {

            event.preventDefault();


            closeModal(
                otpOverlay
            );


            window.location.href =
                "register.html";

        }
    );

}


// ==========================================
// OLD MODAL LOGIN
// ==========================================

const loginForm =
    document.getElementById(
        "loginForm"
    );

const loginDemoMessage =
    document.getElementById(
        "loginDemoMessage"
    );


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const identifierElement =
                document.getElementById(
                    "loginIdentifier"
                );

            const passwordElement =
                document.getElementById(
                    "loginPassword"
                );


            if (
                !identifierElement ||
                !passwordElement
            ) {

                return;

            }


            const identifier =
                identifierElement.value.trim();

            const password =
                passwordElement.value;


            if (
                !identifier ||
                !password
            ) {

                if (loginDemoMessage) {

                    loginDemoMessage.textContent =
                        "Please enter your email and password.";

                }

                return;

            }


            try {

                if (loginDemoMessage) {

                    loginDemoMessage.textContent =
                        "Signing in...";

                }


                const response =
                    await fetch(
                        "https://jeevancare-mnn4.onrender.com/api/auth/login",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({

                                    identifier:
                                        identifier,

                                    password:
                                        password

                                })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    if (loginDemoMessage) {

                        loginDemoMessage.textContent =
                            data.message ||
                            "Login failed.";

                    }

                    return;

                }


                // Save JWT token

                localStorage.setItem(
                    "jeevancare_token",
                    data.token
                );


                // Save user information

                localStorage.setItem(
                    "jeevancare_user",
                    JSON.stringify(
                        data.user
                    )
                );


                if (loginDemoMessage) {

                    loginDemoMessage.textContent =
                        "Login successful!";

                }


                console.log(
                    "Login response:",
                    data
                );


                // Redirect according to role

                setTimeout(
                    () => {

                        if (
                            data.user.role ===
                            "doctor"
                        ) {

                            window.location.href =
                                "doctor-dashboard.html";

                        } else {

                            window.location.href =
                                "dashboard.html";

                        }

                    },
                    800
                );


            } catch (error) {

                console.error(
                    "Login request error:",
                    error
                );


                if (loginDemoMessage) {

                    loginDemoMessage.textContent =
                        "Unable to connect to the server. Please make sure the backend is running.";

                }

            }

        }
    );

}


// ==========================================
// FORGOT PASSWORD - DEMO
// ==========================================

const forgotPassword =
    document.getElementById(
        "forgotPassword"
    );


if (forgotPassword) {

    forgotPassword.addEventListener(
        "click",
        (event) => {

            event.preventDefault();


            alert(
                "Password recovery will be available soon."
            );

        }
    );

}
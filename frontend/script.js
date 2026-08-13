/* =========================================================
   STUDYSHARE - COMPLETE JAVASCRIPT
   FIXED AUTHENTICATION + LOGIN/LOGOUT + DASHBOARD SESSION
========================================================= */


/* =========================================================
   API CONFIG
   Change this if your backend runs somewhere other than
   localhost:5000 (e.g. after deploying it).
========================================================= */

const API_BASE = "https://studyshare-6bl0.onrender.com";


/* =========================================================
   AUTH HELPERS
========================================================= */

function getToken() {
    return localStorage.getItem("token");
}


function getUser() {
    const user = localStorage.getItem("user");

    if (!user) {
        return null;
    }

    try {
        return JSON.parse(user);
    } catch (error) {
        console.error("Invalid saved user:", error);
        localStorage.removeItem("user");
        return null;
    }
}


function isLoggedIn() {
    return !!getToken();
}


function getUserRole() {

    const user = getUser();

    return user ? user.role : null;
}


function isAdmin() {
    return getUserRole() === "admin";
}


function getUserName() {

    const user = getUser();

    if (!user) {
        return "Guest User";
    }

    return (
        user.name ||
        user.fullName ||
        user.username ||
        user.firstName ||
        "User"
    );
}


function getUserEmail() {

    const user = getUser();

    if (!user) {
        return "guest@studyshare.com";
    }

    return user.email || "guest@studyshare.com";
}


function getInitials(name) {

    if (!name) {
        return "GU";
    }

    const words = name
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (words.length === 1) {
        return words[0]
            .substring(0, 2)
            .toUpperCase();
    }

    return (
        words[0][0] +
        words[words.length - 1][0]
    ).toUpperCase();
}


/* =========================================================
   UPDATE DASHBOARD USER INFORMATION
========================================================= */

function updateSessionUI() {

    const name = getUserName();
    const email = getUserEmail();
    const initials = getInitials(name);

    document
        .querySelectorAll("[data-session-name]")
        .forEach(element => {
            element.textContent = name;
        });


    document
        .querySelectorAll("[data-session-email]")
        .forEach(element => {
            element.textContent = email;
        });


    document
        .querySelectorAll("[data-session-initials]")
        .forEach(element => {
            element.textContent = initials;
        });


    const adminNavLink = document.getElementById("adminNavLink");

    if (adminNavLink) {
        adminNavLink.style.display = isAdmin() ? "" : "none";
    }
}


/* =========================================================
   PROTECT DASHBOARD / UPLOAD / ADMIN PAGES
========================================================= */

function protectDashboard() {

    const path = window.location.pathname.toLowerCase();

    const needsLogin =
        path.includes("dashboard.html") ||
        path.includes("upload.html") ||
        path.includes("admin.html");

    if (!needsLogin) {
        return;
    }

    if (!isLoggedIn()) {

        console.log(
            "No login session. Redirecting to login page."
        );

        window.location.href = "login.html";

        return;
    }

    if (path.includes("admin.html") && !isAdmin()) {

        console.log(
            "Not an admin. Redirecting to dashboard."
        );

        window.location.href = "dashboard.html";

        return;
    }

    updateSessionUI();
}


/* =========================================================
   MOBILE MENU
========================================================= */

const menuBtn =
    document.getElementById("menuBtn");

const navLinks =
    document.getElementById("navLinks");


if (menuBtn && navLinks) {

    menuBtn.addEventListener("click", () => {

        navLinks.classList.toggle("show");

        const icon =
            menuBtn.querySelector("i");

        if (!icon) {
            return;
        }

        if (
            navLinks.classList.contains("show")
        ) {

            icon.classList.remove(
                "fa-bars"
            );

            icon.classList.add(
                "fa-xmark"
            );

        } else {

            icon.classList.remove(
                "fa-xmark"
            );

            icon.classList.add(
                "fa-bars"
            );
        }

    });
}


/* =========================================================
   NAVIGATION
========================================================= */

const links =
    document.querySelectorAll(
        ".nav-links a"
    );


links.forEach(link => {

    link.addEventListener("click", () => {

        links.forEach(item => {
            item.classList.remove("active");
        });

        link.classList.add("active");

        if (navLinks) {
            navLinks.classList.remove("show");
        }

        if (menuBtn) {

            const icon =
                menuBtn.querySelector("i");

            if (icon) {

                icon.classList.remove(
                    "fa-xmark"
                );

                icon.classList.add(
                    "fa-bars"
                );
            }
        }
    });
});


/* =========================================================
   DARK MODE
========================================================= */

const themeBtn =
    document.getElementById("themeBtn");


function applyTheme() {

    const savedTheme =
        localStorage.getItem("theme");

    if (savedTheme === "dark") {

        document.body.classList.add("dark");

        if (themeBtn) {

            const icon =
                themeBtn.querySelector("i");

            if (icon) {

                icon.classList.remove(
                    "fa-moon"
                );

                icon.classList.add(
                    "fa-sun"
                );
            }
        }

    } else {

        document.body.classList.remove(
            "dark"
        );

        if (themeBtn) {

            const icon =
                themeBtn.querySelector("i");

            if (icon) {

                icon.classList.remove(
                    "fa-sun"
                );

                icon.classList.add(
                    "fa-moon"
                );
            }
        }
    }
}


if (themeBtn) {

    themeBtn.addEventListener(
        "click",
        () => {

            const dark =
                document.body.classList.toggle(
                    "dark"
                );

            const icon =
                themeBtn.querySelector("i");

            if (dark) {

                localStorage.setItem(
                    "theme",
                    "dark"
                );

                if (icon) {

                    icon.classList.remove(
                        "fa-moon"
                    );

                    icon.classList.add(
                        "fa-sun"
                    );
                }

            } else {

                localStorage.setItem(
                    "theme",
                    "light"
                );

                if (icon) {

                    icon.classList.remove(
                        "fa-sun"
                    );

                    icon.classList.add(
                        "fa-moon"
                    );
                }
            }

        }
    );
}


applyTheme();


/* =========================================================
   LOGOUT
========================================================= */

function logoutUser(event) {

    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }


    console.log("Logging out...");


    /* Remove authentication */

    localStorage.removeItem(
        "token"
    );

    localStorage.removeItem(
        "user"
    );


    /* Update navigation */

    updateNavbar();


    /* Show message */

    showToast(
        "Logged out successfully!"
    );


    /*
       Go to home page after logout.
       This prevents the dashboard from
       remaining visible after logout.
    */

    setTimeout(() => {

        window.location.href =
            "index.html";

    }, 500);
}


/* =========================================================
   NAVBAR LOGIN / LOGOUT
========================================================= */

function updateNavbar() {

    const loggedIn =
        isLoggedIn();


    /*
       Find ALL login/logout buttons.
       This includes the top navbar and
       dashboard sidebar.
    */

    const authButtons =
        document.querySelectorAll(
            "[data-logout], .login-btn"
        );


    authButtons.forEach(button => {

        /*
           Remove old onclick handlers
        */

        button.onclick = null;


        /*
           Remove old event marker
        */

        button.removeAttribute(
            "data-auth-handler"
        );


        /*
           Clone button to remove old
           listeners that may exist.
        */

        const newButton =
            button.cloneNode(true);


        button.replaceWith(
            newButton
        );


        if (loggedIn) {

            /* =========================
               LOGGED IN
            ========================= */

            newButton.textContent =
                "Logout";

            newButton.setAttribute(
                "data-logout",
                ""
            );

            newButton.removeAttribute(
                "href"
            );

            newButton.style.cursor =
                "pointer";


            newButton.addEventListener(
                "click",
                logoutUser
            );


        } else {

            /* =========================
               LOGGED OUT
            ========================= */

            newButton.textContent =
                "Login";

            newButton.removeAttribute(
                "data-logout"
            );

            newButton.setAttribute(
                "href",
                "login.html"
            );

            newButton.style.cursor =
                "pointer";
        }

    });


    /*
       Update dashboard user information
    */

    updateSessionUI();
}


/* =========================================================
   EMAIL VALIDATION
========================================================= */

function validateEmail(email) {

    const pattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return pattern.test(email);
}


/* =========================================================
   LOGIN FORM
========================================================= */

const loginForm =
    document.getElementById(
        "pageLoginForm"
    );


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const emailInput =
                document.getElementById(
                    "loginEmail"
                );

            const passwordInput =
                document.getElementById(
                    "loginPassword"
                );


            if (
                !emailInput ||
                !passwordInput
            ) {

                showToast(
                    "Login fields not found."
                );

                return;
            }


            const email =
                emailInput.value.trim();

            const password =
                passwordInput.value;


            if (!validateEmail(email)) {

                showToast(
                    "Please enter a valid email."
                );

                return;
            }


            if (password.length < 6) {

                showToast(
                    "Password must be at least 6 characters."
                );

                return;
            }


            try {

                showToast(
                    "Logging in..."
                );


                const response =
                    await fetch(
                        API_BASE + "/api/auth/login",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                email: email,
                                password: password
                            })
                        }
                    );


                const data =
                    await response.json();


                console.log(
                    "Login response:",
                    data
                );


                if (!response.ok) {

                    showToast(
                        data.message ||
                        "Login failed."
                    );

                    return;
                }


                /*
                   IMPORTANT:
                   Save JWT
                */

                if (data.token) {

                    localStorage.setItem(
                        "token",
                        data.token
                    );

                } else {

                    showToast(
                        "Login succeeded but no token was returned."
                    );

                    return;
                }


                /*
                   Save user
                */

                if (data.user) {

                    localStorage.setItem(
                        "user",
                        JSON.stringify(
                            data.user
                        )
                    );

                } else {

                    /*
                       Fallback if backend
                       doesn't return user
                    */

                    localStorage.setItem(
                        "user",
                        JSON.stringify({
                            email: email,
                            name: email
                                .split("@")[0]
                        })
                    );
                }


                /*
                   Update interface
                */

                updateNavbar();
                updateSessionUI();


                showToast(
                    "Login successful!"
                );


                if (loginForm) {
                    loginForm.reset();
                }


                /*
                   Go to dashboard
                */

                setTimeout(() => {

                    window.location.href =
                        "dashboard.html";

                }, 500);


            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );


                showToast(
                    "Unable to connect to server."
                );
            }

        }
    );
}


/* =========================================================
   REGISTER FORM
========================================================= */

const pageRegisterForm =
    document.getElementById(
        "pageRegisterForm"
    );


if (pageRegisterForm) {

    pageRegisterForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const nameInput = document.getElementById("registerName");
            const emailInput = document.getElementById("registerEmail");
            const passwordInput = document.getElementById("registerPassword");
            const confirmInput = document.getElementById("registerConfirm");
            const termsInput = document.getElementById("registerTerms");


            if (!nameInput || !emailInput || !passwordInput || !confirmInput) {
                showToast("Registration fields not found.");
                return;
            }


            const name = nameInput.value.trim();
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            const confirm = confirmInput.value;


            if (name.length < 2) {
                showToast("Please enter your full name.");
                return;
            }

            if (!validateEmail(email)) {
                showToast("Please enter a valid email.");
                return;
            }

            if (password.length < 6) {
                showToast("Password must be at least 6 characters.");
                return;
            }

            if (password !== confirm) {
                showToast("Passwords do not match.");
                return;
            }

            if (termsInput && !termsInput.checked) {
                showToast("Please accept the Terms & Privacy Policy.");
                return;
            }


            try {

                showToast("Creating your account...");

                const registerResponse = await fetch(
                    API_BASE + "/api/auth/register",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ name, email, password })
                    }
                );

                const registerData = await registerResponse.json();

                if (!registerResponse.ok) {
                    showToast(registerData.message || "Registration failed.");
                    return;
                }


                /*
                   Registration doesn't return a token, so log
                   the new user in immediately for a seamless
                   "create account -> land on dashboard" flow.
                */

                const loginResponse = await fetch(
                    API_BASE + "/api/auth/login",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ email, password })
                    }
                );

                const loginData = await loginResponse.json();

                if (!loginResponse.ok || !loginData.token) {

                    showToast("Account created! Please log in.");

                    setTimeout(() => {
                        window.location.href = "login.html";
                    }, 800);

                    return;
                }

                localStorage.setItem("token", loginData.token);
                localStorage.setItem("user", JSON.stringify(loginData.user));

                updateNavbar();
                updateSessionUI();

                showToast("Account created! Redirecting to your dashboard...");

                pageRegisterForm.reset();

                setTimeout(() => {
                    window.location.href = "dashboard.html";
                }, 700);

            } catch (error) {

                console.error("Registration error:", error);

                showToast("Unable to connect to server.");
            }

        }
    );
}


/* =========================================================
   SEARCH
========================================================= */

function searchMaterials() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );

    if (!searchInput) {
        return;
    }


    const input =
        searchInput.value
            .toLowerCase()
            .trim();


    const cards =
        document.querySelectorAll(
            ".material-card"
        );


    let found = 0;


    cards.forEach(card => {

        const text =
            card.innerText
                .toLowerCase();


        if (
            text.includes(input)
        ) {

            card.style.display =
                "block";

            found++;

        } else {

            card.style.display =
                "none";
        }
    });


    const noResults =
        document.getElementById(
            "noResults"
        );


    if (noResults) {

        noResults.style.display =
            found === 0
                ? "block"
                : "none";
    }
}


/* =========================================================
   SEARCH SUGGESTIONS
========================================================= */

function getMaterialsData() {

    const cards =
        document.querySelectorAll(
            ".material-card"
        );


    return Array.from(cards).map(
        card => {

            const titleEl =
                card.querySelector("h3");

            const categoryEl =
                card.querySelector(
                    ".category"
                );

            const iconEl =
                card.querySelector(
                    ".material-icon"
                );


            return {

                title:
                    titleEl
                        ? titleEl.textContent.trim()
                        : "",

                categoryLabel:
                    categoryEl
                        ? categoryEl.textContent.trim()
                        : "",

                iconHTML:
                    iconEl
                        ? iconEl.outerHTML
                        : "",

                element: card
            };
        }
    );
}


function closeSearchSuggestions() {

    const box =
        document.getElementById(
            "searchSuggestions"
        );


    if (box) {
        box.classList.remove(
            "show"
        );
    }
}


function updateSearchSuggestions() {

    const input =
        document.getElementById(
            "searchInput"
        );

    const box =
        document.getElementById(
            "searchSuggestions"
        );


    if (!input || !box) {
        return;
    }


    const query =
        input.value
            .toLowerCase()
            .trim();


    box.innerHTML = "";


    if (!query) {

        box.classList.remove(
            "show"
        );

        return;
    }


    const matches =
        getMaterialsData()
            .filter(item =>

                item.title
                    .toLowerCase()
                    .includes(query) ||

                item.categoryLabel
                    .toLowerCase()
                    .includes(query)
            );


    if (!matches.length) {

        const empty =
            document.createElement(
                "div"
            );

        empty.className =
            "suggestion-empty";

        empty.textContent =
            `No materials match "${query}"`;

        box.appendChild(
            empty
        );

        box.classList.add(
            "show"
        );

        return;
    }


    const count =
        document.createElement(
            "div"
        );

    count.className =
        "suggestion-count";

    count.textContent =
        matches.length +
        (
            matches.length === 1
                ? " result"
                : " results"
        );

    box.appendChild(
        count
    );


    matches
        .slice(0, 6)
        .forEach(item => {

            const row =
                document.createElement(
                    "div"
                );

            row.className =
                "suggestion-item";


            row.innerHTML = `

                ${item.iconHTML}

                <div class="suggestion-info">

                    <strong></strong>

                    <span></span>

                </div>

                <i class="fa-solid fa-arrow-right suggestion-arrow"></i>
            `;


            row.querySelector(
                "strong"
            ).textContent =
                item.title;


            row.querySelector(
                "span"
            ).textContent =
                item.categoryLabel;


            row.addEventListener(
                "click",
                () => {

                    input.value =
                        item.title;

                    closeSearchSuggestions();

                    searchMaterials();

                    item.element.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });

                }
            );


            box.appendChild(
                row
            );
        });


    box.classList.add(
        "show"
    );
}


function handleSearchInput(event) {

    updateSearchSuggestions();


    if (event.key === "Enter") {

        searchMaterials();

        closeSearchSuggestions();


        const materialsSection =
            document.getElementById(
                "materials"
            );


        if (materialsSection) {

            materialsSection.scrollIntoView({
                behavior: "smooth"
            });
        }
    }


    if (event.key === "Escape") {

        closeSearchSuggestions();
    }
}


document.addEventListener(
    "click",
    event => {

        const wrapper =
            document.getElementById(
                "searchWrapper"
            );


        if (
            wrapper &&
            !wrapper.contains(
                event.target
            )
        ) {

            closeSearchSuggestions();
        }
    }
);


/* =========================================================
   FILTER MATERIALS
========================================================= */

function filterMaterials(
    category,
    button
) {

    const cards =
        document.querySelectorAll(
            ".material-card"
        );

    const buttons =
        document.querySelectorAll(
            ".filter-btn"
        );


    buttons.forEach(btn => {

        btn.classList.remove(
            "active"
        );

    });


    if (button) {

        button.classList.add(
            "active"
        );
    }


    let found = 0;


    cards.forEach(card => {

        const cardCategory =
            card.getAttribute(
                "data-category"
            );


        if (
            category === "all" ||
            cardCategory === category
        ) {

            card.style.display =
                "block";

            found++;

        } else {

            card.style.display =
                "none";
        }
    });


    const noResults =
        document.getElementById(
            "noResults"
        );


    if (noResults) {

        noResults.style.display =
            found === 0
                ? "block"
                : "none";
    }
}


/* =========================================================
   DOWNLOAD
========================================================= */

async function downloadMaterial(
    materialId,
    materialName
) {

    try {

        /*
           Get the JWT token saved during login.
        */

        const token = getToken();


        /*
           User must be logged in to download.
        */

        if (!token) {

            showToast(
                "Please log in to download materials."
            );

            setTimeout(() => {

                window.location.href =
                    "login.html";

            }, 800);

            return;
        }


        showToast(
            "Preparing download..."
        );


        /*
           Send the JWT token to the backend.

           The backend authentication middleware
           expects:

           Authorization: Bearer <token>
        */

        const response = await fetch(
            `${API_BASE}/api/materials/${materialId}/download`,
            {
                method: "POST",

                headers: {
                    Authorization:
                        "Bearer " + token
                }
            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            showToast(
                data.message ||
                "Download failed."
            );

            return;
        }


        /*
           Start the actual file download.
        */

        const link =
            document.createElement("a");


        link.href =
            API_BASE + data.fileUrl;


        link.setAttribute(
            "download",
            ""
        );


        document.body.appendChild(
            link
        );


        link.click();


        link.remove();


        /*
           Update download count
           on the material card.
        */

        const card =
            document.querySelector(
                `[data-material-id="${materialId}"]`
            );


        if (card) {

            const countEl =
                card.querySelector(
                    ".download-count"
                );


            if (countEl) {

                countEl.textContent =
                    data.downloads;
            }
        }


        showToast(
            materialName +
            " download started!"
        );


    } catch (error) {

        console.error(
            "Download error:",
            error
        );


        showToast(
            "Unable to connect to server."
        );
    }
}


/* =========================================================
   LOAD MATERIALS (INDEX PAGE)
========================================================= */

function escapeHtml(text) {

    const div = document.createElement("div");

    div.textContent = text || "";

    return div.innerHTML;
}


function subjectIconInfo(subject) {

    const key = (subject || "").toLowerCase();

    const map = {
        "programming": { cls: "programming", icon: "fa-solid fa-code" },
        "database": { cls: "database", icon: "fa-solid fa-database" },
        "networking": { cls: "network", icon: "fa-solid fa-network-wired" },
        "management": { cls: "management", icon: "fa-solid fa-chart-line" },
        "web development": { cls: "webdev", icon: "fa-solid fa-globe" },
        "operating systems": { cls: "os", icon: "fa-solid fa-microchip" }
    };

    return map[key] || { cls: "pdf", icon: "fa-solid fa-file-lines" };
}


function formatFileSizeLabel(material) {

    const type = material && material.fileUrl && material.fileUrl.toLowerCase().endsWith(".pdf")
        ? "PDF"
        : "Document";

    const bytes = material ? material.fileSize : 0;

    if (!bytes) {
        return type;
    }

    const mb = bytes / (1024 * 1024);

    const sizeLabel = mb >= 1
        ? mb.toFixed(1) + " MB"
        : Math.max(1, Math.round(bytes / 1024)) + " KB";

    return `${type} • ${sizeLabel}`;
}


function renderMaterialCard(material) {

    const iconInfo = subjectIconInfo(material.subject);

    const uploaderName =
        material.uploadedBy && material.uploadedBy.name
            ? material.uploadedBy.name
            : "Anonymous";

    const title = escapeHtml(material.title);
    const description = escapeHtml(material.description);
    const subject = escapeHtml(material.subject);

    return `
        <article class="material-card"
                 data-category="${subject.toLowerCase()}"
                 data-material-id="${material._id}">

            <div class="material-icon ${iconInfo.cls}">
                <i class="${iconInfo.icon}"></i>
            </div>

            <div class="material-info">

                <span class="category">${subject}</span>

                <h3>${title}</h3>

                <p>${description}</p>

                <div class="material-meta">
                    <span>
                        <i class="fa-solid fa-user"></i>
                        ${escapeHtml(uploaderName)}
                    </span>

                    <span>
                        <i class="fa-solid fa-download"></i>
                        <span class="download-count">${material.downloads || 0}</span>
                    </span>
                </div>

                <button class="download-btn"
                        onclick="downloadMaterial('${material._id}', '${title.replace(/'/g, "\\'")}')">
                    <i class="fa-solid fa-download"></i>
                    Download
                </button>

            </div>

        </article>
    `;
}


async function loadPublicMaterials() {

    const grid = document.getElementById("materialsGrid");

    if (!grid) {
        return;
    }

    try {

        const response = await fetch(`${API_BASE}/api/materials`);
        const materials = await response.json();

        if (!response.ok) {
            throw new Error(materials.message || "Failed to load materials");
        }

        if (!materials.length) {

            grid.innerHTML = `
                <div class="materials-loading">
                    <i class="fa-solid fa-folder-open"></i>
                    No materials have been approved yet. Be the first to
                    <a href="upload.html">share one</a>!
                </div>
            `;

            return;
        }

        grid.innerHTML = materials
            .map(renderMaterialCard)
            .join("");

        // Fade in the newly-rendered cards without disturbing
        // elements that have already animated in.
        animateNewlyAddedCards(".material-card");

    } catch (error) {

        console.error("Failed to load materials:", error);

        grid.innerHTML = `
            <div class="materials-error">
                <i class="fa-solid fa-triangle-exclamation"></i>
                Couldn't reach the server. Make sure the backend is
                running at ${API_BASE}.
            </div>
        `;
    }
}

/* =========================================================
   CONTACT FORM
========================================================= */

const contactForm =
    document.getElementById(
        "contactForm"
    );


if (contactForm) {

    contactForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const nameInput =
                document.getElementById(
                    "contactName"
                );


            const name =
                nameInput
                    ? nameInput.value
                    : "there";


            showToast(
                "Thank you " +
                name +
                "! Message sent."
            );


            contactForm.reset();
        }
    );
}


/* =========================================================
   TOAST
========================================================= */

let toastTimer = null;


function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );

    const toastMessage =
        document.getElementById(
            "toastMessage"
        );


    if (
        !toast ||
        !toastMessage
    ) {

        console.log(message);

        return;
    }


    toastMessage.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            3000
        );
}


/* =========================================================
   ANIMATE DYNAMICALLY-INSERTED CARDS
   (safe to call repeatedly - skips elements already visible)
========================================================= */

function animateNewlyAddedCards(selector) {

    if (!("IntersectionObserver" in window)) {
        return;
    }

    const observer = new IntersectionObserver(
        entries => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                }
            });
        },
        { threshold: 0.15 }
    );

    document.querySelectorAll(selector).forEach(element => {

        if (element.classList.contains("visible")) {
            return;
        }

        element.style.opacity = "0";
        element.style.transform = "translateY(25px)";
        element.style.transition = "0.6s ease";

        observer.observe(element);
    });
}


/* =========================================================
   SCROLL ANIMATION
========================================================= */

if (
    "IntersectionObserver" in window
) {

    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(
                    entry => {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target.classList.add(
                                "visible"
                            );
                        }
                    }
                );

            },
            {
                threshold: 0.15
            }
        );


    const animatedElements =
        document.querySelectorAll(
            ".material-card, .subject-card, .step"
        );


    animatedElements.forEach(
        element => {

            element.style.opacity =
                "0";

            element.style.transform =
                "translateY(25px)";

            element.style.transition =
                "0.6s ease";

            observer.observe(
                element
            );
        }
    );


    const animationStyle =
        document.createElement(
            "style"
        );


    animationStyle.textContent = `

        .material-card.visible,
        .subject-card.visible,
        .step.visible {

            opacity: 1 !important;
            transform: translateY(0) !important;

        }

    `;


    document.head.appendChild(
        animationStyle
    );
}


/* =========================================================
   KEYBOARD ESCAPE
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (event.key === "Escape") {

            closeSearchSuggestions();
        }
    }
);


/* =========================================================
   SMOOTH SCROLL
========================================================= */

document
    .querySelectorAll(
        'a[href^="#"]'
    )
    .forEach(anchor => {

        anchor.addEventListener(
            "click",
            function(event) {

                const href =
                    this.getAttribute(
                        "href"
                    );


                if (
                    !href ||
                    href === "#"
                ) {
                    return;
                }


                const target =
                    document.querySelector(
                        href
                    );


                if (target) {

                    event.preventDefault();


                    target.scrollIntoView({
                        behavior: "smooth"
                    });
                }
            }
        );
    });


/* =========================================================
   SUBJECT CARDS
========================================================= */

const subjectCards =
    document.querySelectorAll(
        ".subject-card"
    );


subjectCards.forEach(card => {

    card.addEventListener(
        "click",
        () => {

            const title =
                card.querySelector(
                    "h3"
                );


            if (!title) {
                return;
            }


            const subject =
                title.textContent
                    .toLowerCase();


            const buttons =
                document.querySelectorAll(
                    ".filter-btn"
                );


            let matched = false;


            buttons.forEach(button => {

                const buttonText =
                    button.textContent
                        .toLowerCase()
                        .trim();


                if (
                    subject.includes(
                        buttonText
                    ) ||
                    buttonText.includes(
                        subject
                    )
                ) {

                    filterMaterials(
                        buttonText,
                        button
                    );

                    matched = true;
                }
            });


            if (!matched) {

                const materials =
                    document.getElementById(
                        "materials"
                    );


                if (materials) {

                    materials.scrollIntoView({
                        behavior: "smooth"
                    });
                }
            }
        }
    );
});


/* =========================================================
   HEADER SHADOW
========================================================= */

window.addEventListener(
    "scroll",
    () => {

        const header =
            document.querySelector(
                ".header"
            );


        if (!header) {
            return;
        }


        if (window.scrollY > 50) {

            header.style.boxShadow =
                "0 5px 20px rgba(0,0,0,0.05)";

        } else {

            header.style.boxShadow =
                "none";
        }
    }
);


/* =========================================================
   PASSWORD VISIBILITY
========================================================= */

document
    .querySelectorAll(
        ".toggle-visibility"
    )
    .forEach(btn => {

        btn.addEventListener(
            "click",
            () => {

                const input =
                    btn.parentElement
                        .querySelector(
                            "input"
                        );


                if (!input) {
                    return;
                }


                if (
                    input.type ===
                    "password"
                ) {

                    input.type =
                        "text";

                    btn.classList.remove(
                        "fa-eye"
                    );

                    btn.classList.add(
                        "fa-eye-slash"
                    );

                } else {

                    input.type =
                        "password";

                    btn.classList.remove(
                        "fa-eye-slash"
                    );

                    btn.classList.add(
                        "fa-eye"
                    );
                }
            }
        );
    });


/* =========================================================
   UPLOAD PAGE - DRAG & DROP
========================================================= */

const dropzone =
    document.getElementById(
        "dropzone"
    );

const dropzoneInput =
    document.getElementById(
        "dropzoneInput"
    );

const filePreviewList =
    document.getElementById(
        "filePreviewList"
    );


function formatFileSize(bytes) {

    if (bytes < 1024) {
        return bytes + " B";
    }


    if (bytes < 1024 * 1024) {

        return (
            bytes / 1024
        ).toFixed(1) + " KB";
    }


    return (
        bytes /
        (1024 * 1024)
    ).toFixed(1) + " MB";
}


function iconForFile(fileName) {

    const ext =
        fileName
            .split(".")
            .pop()
            .toLowerCase();


    if (ext === "pdf") {
        return "fa-file-pdf";
    }


    if (
        ["doc", "docx"].includes(
            ext
        )
    ) {
        return "fa-file-word";
    }


    if (
        ["ppt", "pptx"].includes(
            ext
        )
    ) {
        return "fa-file-powerpoint";
    }


    if (
        ["xls", "xlsx"].includes(
            ext
        )
    ) {
        return "fa-file-excel";
    }


    if (
        ["zip", "rar"].includes(
            ext
        )
    ) {
        return "fa-file-zipper";
    }


    return "fa-file";
}


function renderFilePreview(files) {

    if (!filePreviewList) {
        return;
    }


    filePreviewList.innerHTML =
        "";


    Array.from(files).forEach(
        file => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "file-preview-item";


            const icon =
                document.createElement(
                    "i"
                );

            icon.className =
                "fa-solid " +
                iconForFile(
                    file.name
                ) +
                " file-type-icon";


            const meta =
                document.createElement(
                    "div"
                );

            meta.className =
                "file-meta";


            const name =
                document.createElement(
                    "strong"
                );

            name.textContent =
                file.name;


            const size =
                document.createElement(
                    "span"
                );

            size.textContent =
                formatFileSize(
                    file.size
                );


            meta.appendChild(
                name
            );

            meta.appendChild(
                size
            );


            const remove =
                document.createElement(
                    "button"
                );

            remove.type =
                "button";

            remove.className =
                "remove-file";

            remove.innerHTML =
                '<i class="fa-solid fa-xmark"></i>';


            remove.addEventListener(
                "click",
                () => {
                    item.remove();

                    /*
                       Only one file is supported by the backend,
                       so removing the preview also clears the
                       actual file input.
                    */

                    if (dropzoneInput) {
                        dropzoneInput.value = "";
                    }
                }
            );


            item.appendChild(
                icon
            );

            item.appendChild(
                meta
            );

            item.appendChild(
                remove
            );


            filePreviewList.appendChild(
                item
            );
        }
    );
}


if (
    dropzone &&
    dropzoneInput
) {

    dropzone.addEventListener(
        "click",
        () => {

            dropzoneInput.click();
        }
    );


    dropzoneInput.addEventListener(
        "change",
        () => {

            renderFilePreview(
                dropzoneInput.files
            );
        }
    );


    [
        "dragenter",
        "dragover"
    ].forEach(
        eventName => {

            dropzone.addEventListener(
                eventName,
                event => {

                    event.preventDefault();

                    dropzone.classList.add(
                        "drag-over"
                    );
                }
            );
        }
    );


    [
        "dragleave",
        "drop"
    ].forEach(
        eventName => {

            dropzone.addEventListener(
                eventName,
                event => {

                    event.preventDefault();

                    dropzone.classList.remove(
                        "drag-over"
                    );
                }
            );
        }
    );


    dropzone.addEventListener(
        "drop",
        event => {

            const files =
                event.dataTransfer.files;


            if (
                files &&
                files.length
            ) {

                /*
                   Only single-file upload is supported by the
                   backend. If more than one file is dropped,
                   just take the first and let the user know.
                */

                const fileToUse =
                    files.length > 1
                        ? [files[0]]
                        : files;

                if (files.length > 1) {
                    showToast("Only one file can be uploaded at a time — using the first file.");
                }

                const dataTransfer = new DataTransfer();

                Array.from(fileToUse).forEach(file => {
                    dataTransfer.items.add(file);
                });

                dropzoneInput.files = dataTransfer.files;

                renderFilePreview(
                    dropzoneInput.files
                );
            }
        }
    );
}


/* =========================================================
   UPLOAD PAGE - TAG INPUT
========================================================= */

const tagInputBox =
    document.getElementById(
        "tagInputBox"
    );

const tagInputField =
    document.getElementById(
        "tagInputField"
    );


if (
    tagInputBox &&
    tagInputField
) {

    tagInputField.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter" &&
                tagInputField.value.trim()
            ) {

                event.preventDefault();


                const tag =
                    document.createElement(
                        "span"
                    );


                tag.className =
                    "tag-pill";


                const text =
                    document.createTextNode(
                        tagInputField.value.trim()
                    );


                const button =
                    document.createElement(
                        "button"
                    );


                button.type =
                    "button";


                button.innerHTML =
                    '<i class="fa-solid fa-xmark"></i>';


                button.addEventListener(
                    "click",
                    () => {
                        tag.remove();
                    }
                );


                tag.appendChild(
                    text
                );

                tag.appendChild(
                    button
                );


                tagInputBox.insertBefore(
                    tag,
                    tagInputField
                );


                tagInputField.value =
                    "";
            }
        }
    );
}


/* =========================================================
   PAGE UPLOAD FORM
========================================================= */

const pageUploadForm =
    document.getElementById(
        "pageUploadForm"
    );


if (pageUploadForm) {

    pageUploadForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            if (!isLoggedIn()) {
                showToast("Please log in to upload material.");
                setTimeout(() => {
                    window.location.href = "login.html";
                }, 800);
                return;
            }


            const titleInput = document.getElementById("materialTitle");
            const subjectInput = document.getElementById("materialSubject");
            const descriptionInput = document.getElementById("materialDescription");

            const title = titleInput ? titleInput.value.trim() : "";
            const subject = subjectInput ? subjectInput.value : "";
            const description = descriptionInput ? descriptionInput.value.trim() : "";

            const file =
                dropzoneInput && dropzoneInput.files.length
                    ? dropzoneInput.files[0]
                    : null;


            if (!title) {
                showToast("Please enter a material title.");
                return;
            }

            if (!subject) {
                showToast("Please select a subject category.");
                return;
            }

            if (!description) {
                showToast("Please add a short description.");
                return;
            }

            if (!file) {
                showToast("Please choose a file to upload.");
                return;
            }


            const formData = new FormData();

            formData.append("title", title);
            formData.append("subject", subject);
            formData.append("description", description);
            formData.append("file", file);


            try {

                showToast("Uploading material...");

                const response = await fetch(
                    API_BASE + "/api/materials",
                    {
                        method: "POST",
                        headers: {
                            Authorization: "Bearer " + getToken()
                        },
                        body: formData
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    showToast(data.message || "Upload failed.");
                    return;
                }

                showToast("Material submitted for review!");

                pageUploadForm.reset();

                if (filePreviewList) {
                    filePreviewList.innerHTML = "";
                }

                setTimeout(() => {
                    window.location.href = "dashboard.html";
                }, 900);

            } catch (error) {

                console.error("Upload error:", error);

                showToast("Unable to connect to server.");
            }
        }
    );
}


/* =========================================================
   DASHBOARD - MY MATERIALS
========================================================= */

function statusBadge(status) {

    if (status === "approved") {
        return '<span class="badge success"><i class="fa-solid fa-circle-check"></i> Approved</span>';
    }

    if (status === "rejected") {
        return '<span class="badge danger"><i class="fa-solid fa-circle-xmark"></i> Rejected</span>';
    }

    return '<span class="badge warning"><i class="fa-solid fa-clock"></i> Pending Review</span>';
}


function renderMyMaterialRow(material) {

    const iconInfo = subjectIconInfo(material.subject);
    const title = escapeHtml(material.title);

    return `
        <tr data-material-id="${material._id}">
            <td>
                <div class="table-file">
                    <div class="material-icon ${iconInfo.cls}"><i class="${iconInfo.icon}"></i></div>
                    <div>
                        <strong>${title}</strong>
                        <span>${formatFileSizeLabel(material)}</span>
                    </div>
                </div>
            </td>
            <td>${material.downloads || 0}</td>
            <td>—</td>
            <td class="status-cell">${statusBadge(material.status)}</td>
            <td>
                <div class="row-actions">
                    <button class="icon-btn danger my-material-delete-btn" title="Delete">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
}


async function loadMyMaterials() {

    const tbody = document.getElementById("myMaterialsBody");

    if (!tbody) {
        return; // not on the dashboard page
    }

    if (!isLoggedIn()) {
        return; // protectDashboard() already redirects to login
    }

    try {

        const response = await fetch(
            `${API_BASE}/api/materials/mine`,
            { headers: { Authorization: "Bearer " + getToken() } }
        );

        const materials = await response.json();

        if (!response.ok) {
            throw new Error(materials.message || "Failed to load your materials");
        }

        tbody.innerHTML = materials.length
            ? materials.map(renderMyMaterialRow).join("")
            : `
                <tr>
                    <td colspan="5" style="text-align:center;color:var(--muted);padding:24px;">
                        You haven't uploaded anything yet.
                        <a href="upload.html">Upload your first material</a>.
                    </td>
                </tr>
            `;

        const uploadedEl = document.getElementById("statUploaded");
        const downloadsEl = document.getElementById("statDownloads");

        if (uploadedEl) {
            uploadedEl.textContent = materials.length;
        }

        if (downloadsEl) {

            const totalDownloads = materials.reduce(
                (sum, m) => sum + (m.downloads || 0),
                0
            );

            downloadsEl.textContent = totalDownloads;
        }

    } catch (error) {

        console.error("Failed to load your materials:", error);

        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;color:var(--muted);padding:24px;">
                    Couldn't load your materials. Make sure the backend is running.
                </td>
            </tr>
        `;
    }
}


document.addEventListener("click", async event => {

    const btn = event.target.closest(".my-material-delete-btn");

    if (!btn) {
        return;
    }

    const row = btn.closest("tr");
    const materialId = row ? row.getAttribute("data-material-id") : null;

    if (!materialId) {
        return;
    }

    if (!confirm("Delete this material? This cannot be undone.")) {
        return;
    }

    try {

        const response = await fetch(
            `${API_BASE}/api/materials/${materialId}`,
            {
                method: "DELETE",
                headers: { Authorization: "Bearer " + getToken() }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            showToast(data.message || "Failed to delete material.");
            return;
        }

        row.style.opacity = "0";

        setTimeout(() => row.remove(), 300);

        showToast("Material deleted");

    } catch (error) {

        console.error("Delete error:", error);

        showToast("Unable to connect to server.");
    }
});


/* =========================================================
   CLEAR SEARCH
========================================================= */

function clearSearch() {

    const input =
        document.getElementById(
            "searchInput"
        );


    if (!input) {
        return;
    }


    input.value =
        "";


    searchMaterials();

    closeSearchSuggestions();
}


/* =========================================================
   ADMIN PANEL
========================================================= */

function userStatusBadgeHtml(user) {

    return user.isSuspended
        ? '<span class="badge neutral"><i class="fa-solid fa-ban"></i> Suspended</span>'
        : '<span class="badge success"><i class="fa-solid fa-circle-check"></i> Active</span>';
}


function renderAdminMaterialRow(material) {

    const iconInfo = subjectIconInfo(material.subject);
    const title = escapeHtml(material.title);

    const uploaderName =
        material.uploadedBy && material.uploadedBy.name
            ? material.uploadedBy.name
            : "Unknown";

    return `
        <tr data-material-id="${material._id}">
            <td>
                <div class="table-file">
                    <div class="material-icon ${iconInfo.cls}"><i class="${iconInfo.icon}"></i></div>
                    <div>
                        <strong>${title}</strong>
                        <span>${formatFileSizeLabel(material)}</span>
                    </div>
                </div>
            </td>
            <td>${escapeHtml(uploaderName)}</td>
            <td>${material.downloads || 0}</td>
            <td class="status-cell">${statusBadge(material.status)}</td>
            <td>
                <div class="row-actions">
                    <button class="icon-btn success admin-approve-btn" title="Approve"><i class="fa-solid fa-check"></i></button>
                    <button class="icon-btn danger admin-reject-btn" title="Reject"><i class="fa-solid fa-xmark"></i></button>
                    <button class="icon-btn danger admin-material-delete-btn" title="Delete"><i class="fa-solid fa-trash"></i></button>
                </div>
            </td>
        </tr>
    `;
}


function renderAdminUserRow(user) {

    const initials = getInitials(user.name);
    const roleLabel = user.role === "admin" ? "Admin" : "Student";

    return `
        <tr data-user-id="${user._id}">
            <td>
                <div class="table-file">
                    <div class="sidebar-avatar" style="width:36px;height:36px;font-size:12px;">${initials}</div>
                    <div><strong>${escapeHtml(user.name)}</strong></div>
                </div>
            </td>
            <td>${escapeHtml(user.email)}</td>
            <td><span class="badge neutral">${roleLabel}</span></td>
            <td class="status-cell">${userStatusBadgeHtml(user)}</td>
            <td>
                <div class="row-actions">
                    <button class="icon-btn admin-user-suspend-btn" title="${user.isSuspended ? "Reactivate" : "Suspend"}">
                        <i class="fa-solid fa-ban"></i>
                    </button>
                    <button class="icon-btn danger admin-user-delete-btn" title="Delete"><i class="fa-solid fa-trash"></i></button>
                </div>
            </td>
        </tr>
    `;
}


async function loadAdminData() {

    const materialsBody = document.getElementById("materialsTableBody");
    const usersBody = document.getElementById("usersTableBody");

    if (!materialsBody && !usersBody) {
        return; // not on the admin page
    }

    if (!isLoggedIn() || !isAdmin()) {
        return; // protectDashboard() already redirects
    }

    const authHeader = { Authorization: "Bearer " + getToken() };

    try {

        const statsRes = await fetch(
            `${API_BASE}/api/admin/stats`,
            { headers: authHeader }
        );

        const stats = await statsRes.json();

        if (statsRes.ok) {

            const statMap = {
                statTotalUsers: stats.totalUsers,
                statTotalMaterials: stats.totalMaterials,
                statPendingApprovals: stats.pendingApprovals,
                statTotalDownloads: stats.totalDownloads
            };

            Object.keys(statMap).forEach(id => {

                const el = document.getElementById(id);

                if (el) {
                    el.textContent = statMap[id];
                }
            });
        }

    } catch (error) {
        console.error("Failed to load admin stats:", error);
    }

    if (materialsBody) {

        try {

            const res = await fetch(
                `${API_BASE}/api/admin/materials`,
                { headers: authHeader }
            );

            const materials = await res.json();

            if (!res.ok) {
                throw new Error(materials.message || "Failed to load materials");
            }

            materialsBody.innerHTML = materials.length
                ? materials.map(renderAdminMaterialRow).join("")
                : `<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:24px;">No materials yet.</td></tr>`;

        } catch (error) {

            console.error(error);

            materialsBody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:24px;">Couldn't load materials.</td></tr>`;
        }
    }

    if (usersBody) {

        try {

            const res = await fetch(
                `${API_BASE}/api/admin/users`,
                { headers: authHeader }
            );

            const users = await res.json();

            if (!res.ok) {
                throw new Error(users.message || "Failed to load users");
            }

            usersBody.innerHTML = users.length
                ? users.map(renderAdminUserRow).join("")
                : `<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:24px;">No users yet.</td></tr>`;

        } catch (error) {

            console.error(error);

            usersBody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:24px;">Couldn't load users.</td></tr>`;
        }
    }
}


document.addEventListener("click", async event => {

    const approveBtn = event.target.closest(".admin-approve-btn");
    const rejectBtn = event.target.closest(".admin-reject-btn");
    const materialDeleteBtn = event.target.closest(".admin-material-delete-btn");
    const suspendBtn = event.target.closest(".admin-user-suspend-btn");
    const userDeleteBtn = event.target.closest(".admin-user-delete-btn");

    if (!approveBtn && !rejectBtn && !materialDeleteBtn && !suspendBtn && !userDeleteBtn) {
        return;
    }

    const authHeader = {
        Authorization: "Bearer " + getToken(),
        "Content-Type": "application/json"
    };

    if (approveBtn || rejectBtn) {

        const row = (approveBtn || rejectBtn).closest("tr");
        const materialId = row.getAttribute("data-material-id");
        const status = approveBtn ? "approved" : "rejected";

        try {

            const res = await fetch(
                `${API_BASE}/api/admin/materials/${materialId}/status`,
                {
                    method: "PATCH",
                    headers: authHeader,
                    body: JSON.stringify({ status })
                }
            );

            const data = await res.json();

            if (!res.ok) {
                showToast(data.message || "Update failed.");
                return;
            }

            const cell = row.querySelector(".status-cell");

            if (cell) {
                cell.innerHTML = statusBadge(status);
            }

            showToast(`Material marked as ${status}`);

        } catch (error) {

            console.error(error);

            showToast("Unable to connect to server.");
        }

        return;
    }

    if (materialDeleteBtn) {

        const row = materialDeleteBtn.closest("tr");
        const materialId = row.getAttribute("data-material-id");

        if (!confirm("Delete this material? This cannot be undone.")) {
            return;
        }

        try {

            const res = await fetch(
                `${API_BASE}/api/admin/materials/${materialId}`,
                { method: "DELETE", headers: authHeader }
            );

            const data = await res.json();

            if (!res.ok) {
                showToast(data.message || "Failed to delete material.");
                return;
            }

            row.style.opacity = "0";

            setTimeout(() => row.remove(), 300);

            showToast("Material deleted");

        } catch (error) {

            console.error(error);

            showToast("Unable to connect to server.");
        }

        return;
    }

    if (suspendBtn) {

        const row = suspendBtn.closest("tr");
        const userId = row.getAttribute("data-user-id");

        try {

            const res = await fetch(
                `${API_BASE}/api/admin/users/${userId}/suspend`,
                { method: "PATCH", headers: authHeader }
            );

            const data = await res.json();

            if (!res.ok) {
                showToast(data.message || "Update failed.");
                return;
            }

            const cell = row.querySelector(".status-cell");

            if (cell) {

                cell.innerHTML = data.isSuspended
                    ? '<span class="badge neutral"><i class="fa-solid fa-ban"></i> Suspended</span>'
                    : '<span class="badge success"><i class="fa-solid fa-circle-check"></i> Active</span>';
            }

            showToast(data.message);

        } catch (error) {

            console.error(error);

            showToast("Unable to connect to server.");
        }

        return;
    }

    if (userDeleteBtn) {

        const row = userDeleteBtn.closest("tr");
        const userId = row.getAttribute("data-user-id");

        if (!confirm("Delete this user? This cannot be undone.")) {
            return;
        }

        try {

            const res = await fetch(
                `${API_BASE}/api/admin/users/${userId}`,
                { method: "DELETE", headers: authHeader }
            );

            const data = await res.json();

            if (!res.ok) {
                showToast(data.message || "Failed to delete user.");
                return;
            }

            row.style.opacity = "0";

            setTimeout(() => row.remove(), 300);

            showToast("User deleted");

        } catch (error) {

            console.error(error);

            showToast("Unable to connect to server.");
        }
    }
});


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /*
           First update login/logout
        */

        updateNavbar();


        /*
           Then update dashboard user
        */

        updateSessionUI();


        /*
           Finally protect dashboard
        */

        protectDashboard();


        /*
           Load real data for whichever page we're on.
           Each loader safely no-ops if its target
           elements aren't present on the current page.
        */

        loadPublicMaterials();
        loadMyMaterials();
        loadAdminData();


        console.log(
            "StudyShare authentication initialized."
        );

    }
);


/* =========================================================
   END
========================================================= */

console.log(
    "StudyShare Portal loaded successfully!"
);
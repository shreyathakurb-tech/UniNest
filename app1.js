/* =========================================
   UniNest - app.js (Part 1)
   ========================================= */

/* =========================
   THEME TOGGLE
========================= */
const API_URL = "https://uninest-oqx4.onrender.com";

const themeToggle = document.getElementById("themeToggle");
const html = document.documentElement;

const initialTheme = localStorage.getItem("theme");

function showToast(message, type = "info") {

    const toast = document.getElementById("toast");

    if (!toast) return;

    toast.textContent = message;

    toast.className = `toast show ${type}`;

    setTimeout(() => {

        toast.className = "toast";

    }, 3000);

}

if (initialTheme) {
    html.setAttribute("data-theme", initialTheme);

    if (themeToggle) {
        themeToggle.innerHTML =
            initialTheme === "light"
                ? '<i class="fa-solid fa-sun"></i>'
                : '<i class="fa-solid fa-moon"></i>';
    }
}

if (themeToggle) {

    themeToggle.addEventListener("click", () => {

        const currentTheme = html.getAttribute("data-theme");

        if (currentTheme === "dark") {

            html.setAttribute("data-theme", "light");

            localStorage.setItem("theme", "light");

            themeToggle.innerHTML =
                '<i class="fa-solid fa-sun"></i>';

        } else {

            html.setAttribute("data-theme", "dark");

            localStorage.setItem("theme", "dark");

            themeToggle.innerHTML =
                '<i class="fa-solid fa-moon"></i>';
        }

    });

}


/* =========================
   MOBILE MENU
========================= */

const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");

if (menuBtn && mobileMenu) {

    menuBtn.addEventListener("click", () => {

        mobileMenu.classList.toggle("show");

    });

    document.querySelectorAll(".mobile-menu a").forEach(link => {

        link.addEventListener("click", () => {

            mobileMenu.classList.remove("show");

        });

    });

}


/* =========================
   SCROLL TO TOP
========================= */

const scrollTopBtn = document.getElementById("scrollTopBtn");

window.addEventListener("scroll", () => {

    if (!scrollTopBtn) return;

    if (window.scrollY > 500) {

        scrollTopBtn.classList.add("active");

    } else {

        scrollTopBtn.classList.remove("active");

    }

});

if (scrollTopBtn) {

    scrollTopBtn.addEventListener("click", () => {

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    });

}


/* =========================
   FAQ ACCORDION
========================= */

const faqQuestions = document.querySelectorAll(".faq-question");

faqQuestions.forEach(question => {
    question.addEventListener("click", () => {

        const item = question.parentElement;

        document.querySelectorAll(".faq-item").forEach(faq => {

            if (faq !== item) {

                faq.classList.remove("active");

            }

        });

        item.classList.toggle("active");

    });

});


/* =========================
   WISHLIST BUTTON
========================= */



/* =========================
   NAVBAR SHADOW ON SCROLL
========================= */

const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", () => {

    if (!navbar) return;

    if (window.scrollY > 30) {

        navbar.style.background = "var(--card)";

        navbar.style.backdropFilter =
            "blur(24px)";

    } else {

        navbar.style.background = "var(--card)";

    }

});


/* =========================
   POPULAR SEARCH BUTTONS
========================= */

const searchInput =
    document.getElementById("searchInput");

const popularButtons =
    document.querySelectorAll(".popular-searches button");

popularButtons.forEach(btn => {

    btn.addEventListener("click", () => {

        if (searchInput) {

            searchInput.value = btn.textContent;
            filterListings();

        }
    
    });
});
/* =========================
   SEARCH & FILTER LOGIC
========================= */

const budgetFilter = document.getElementById("budgetFilter");
const roomFilter = document.getElementById("roomFilter");
const genderFilter = document.getElementById("genderFilter");
const searchBtn = document.querySelector(".search-btn");


function filterListings() {

    const searchText = searchInput
        ? searchInput.value.trim().toLowerCase()
        : "";

    const budgetVal = budgetFilter ? budgetFilter.value : "all";
    const roomVal = roomFilter ? roomFilter.value : "all";
    const genderVal = genderFilter ? genderFilter.value : "all";

    let visibleCount = 0;
    const listingCards = document.querySelectorAll(
    "#latestProperties .listing-card"
);
    listingCards.forEach(card => {

        const price = parseInt(card.dataset.price, 10);
        const type = card.dataset.type;
        const gender = card.dataset.gender;

        const locationText = card.querySelector(".location")
            ? card.querySelector(".location").textContent.toLowerCase()
            : "";

        const titleText = card.querySelector("h3")
            ? card.querySelector("h3").textContent.toLowerCase()
            : "";

        let matchesBudget = true;
        let matchesRoom = true;
        let matchesGender = true;
        let matchesSearch = true;

        // Budget check
        switch (budgetVal) {
            case "under5000":
                matchesBudget = price < 5000;
                break;
            case "5000-10000":
                matchesBudget = price >= 5000 && price <= 10000;
                break;
            case "10000-20000":
                matchesBudget = price > 10000 && price <= 20000;
                break;
            case "20000-30000":
                matchesBudget = price > 20000 && price <= 30000;
                break;
            case "above30000":
                matchesBudget = price > 30000;
                break;
            default:
                matchesBudget = true;
        }

        // Room type check
        if (roomVal !== "all") {
            matchesRoom =
    type === roomVal.toLowerCase();
        }

        // Gender check
        if (genderVal !== "all") {
            matchesGender =
    gender === genderVal.toLowerCase()
    || gender === "unisex";}

        // Text search check (matches location or title)
        if (searchText !== "") {
            matchesSearch =
                locationText.includes(searchText) ||
                titleText.includes(searchText);
        }

        if (matchesBudget && matchesRoom && matchesGender && matchesSearch) {
            card.style.display = "";
            visibleCount++;
        } else {
            card.style.display = "none";
        }

    });

    showNoResultsMessage(visibleCount);
}

function showNoResultsMessage(count) {

    const grid = document.querySelector("#latestProperties");

    let msg = document.getElementById("noResultsMsg");

    if (count === 0) {

        if (!msg) {

            msg = document.createElement("div");

            msg.id = "noResultsMsg";

            msg.style.textAlign = "center";
            msg.style.padding = "40px";
            msg.style.width = "100%";
            msg.innerHTML = `
                <h3>No properties found</h3>
                <p>Try changing your search or filters.</p>
            `;

            grid.appendChild(msg);
        }

        msg.style.display = "block";

    } else if (msg) {

        msg.style.display = "none";

    }

}

// Trigger filtering on search button click
if (searchBtn) {

    searchBtn.addEventListener("click", () => {

        filterListings();

        // Scroll to property section
        const listingsSection = document.getElementById("listings");

        if (listingsSection) {

            listingsSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }

    });

}

// Trigger filtering on dropdown change
[budgetFilter, roomFilter, genderFilter].forEach(filter => {
    if (filter) {
        filter.addEventListener("change", filterListings);
    }
});

// Trigger filtering on Enter key in search input

if (searchInput) {
    searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            filterListings();
        }
    });
}

// Popular search buttons should also trigger filter
popularButtons.forEach(btn => {

    btn.addEventListener("click", () => {

        if (searchInput) {
            searchInput.value = btn.textContent;
        }

        filterListings();

        const listingsSection = document.getElementById("listings");

        if (listingsSection) {

            listingsSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }

    });

});

/* =========================
   AUTH MODAL
========================= */

const openAuth    = document.getElementById("openAuth");
const authModal   = document.getElementById("authModal");
const closeAuth   = document.getElementById("closeAuth");
const authContent = document.getElementById("authContent");

// --- Login HTML ---
const loginHTML = `
<div class="auth-card">

    <div class="auth-brand">
        <div class="auth-logo-circle">
            <i class="fa-solid fa-house"></i>
        </div>
        <span>UniNest</span>
    </div>

    <h1>Welcome Back</h1>
    <p class="auth-subtitle">Sign in to continue</p>

    <form id="loginForm">
        <input type="email" id="loginEmail" placeholder="Email Address" required>
        <input type="password" id="loginPassword" placeholder="Password" required>
        <button type="submit">Sign In</button>
    </form>

    <div class="auth-divider"><span>or</span></div>

    <div class="social-icons">
        <i class="fa-brands fa-google auth-google-icon" title="Continue with Google"></i>
    </div>

    <p class="auth-switch">
        Don't have an account? <a href="#" id="showRegister">Register</a>
    </p>

</div>`;

const registerHTML = `
<div class="auth-card">

    <div class="auth-brand">
        <div class="auth-logo-circle">
            <i class="fa-solid fa-house"></i>
        </div>
        <span>UniNest</span>
    </div>

    <h1>Create Account</h1>

    <form id="registerForm">
        <input type="text" id="name" placeholder="Full Name" required>
        <input type="email" id="email" placeholder="Email Address" required>
        <input type="tel" id="phone" placeholder="Phone Number" required>
        <input type="password" id="password" placeholder="Password" required>
        <input type="password" id="confirmPassword" placeholder="Confirm Password" required>
        <button type="submit">Register</button>
    </form>

    <div class="auth-divider"><span>or</span></div>

    <div class="social-icons">
        <i class="fa-brands fa-google auth-google-icon" title="Continue with Google"></i>
    </div>

    <p class="auth-switch">
        Already have an account? <a href="#" id="showLogin">Sign In</a>
    </p>

</div>`;

// --- Helper: attach login form handler ---
function attachLoginHandler() {

    const loginForm =
        document.getElementById("loginForm");

    if (!loginForm) return;

    loginForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const email =
            document.getElementById("loginEmail").value;

        const password =
            document.getElementById("loginPassword").value;

        try {

            const response = await fetch(
                `${API_URL}/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {

                localStorage.setItem(
                    "token",
                    data.token
                );

                localStorage.setItem("userId", data.user.id);

                localStorage.setItem("userName", data.user.name);

                localStorage.setItem("userEmail", data.user.email);

                

showToast(data.message, "success");


// Update navbar immediately
openAuth.innerHTML = `
    <i class="fa-solid fa-user"></i>
    ${data.user.name}
    <i class="fa-solid fa-chevron-down"></i>
`;

authModal.classList.remove("active");

document.body.style.overflow = "";

            } else {

              showToast(data.message, "error");  

            }

        } catch (error) {

            console.log(error);

            showToast("Server Error", "error");

        }

    });

}



// --- Helper: attach register form handler ---
function attachRegisterHandler() {

    const registerForm =
        document.getElementById("registerForm");

    if (!registerForm) return;

    registerForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const name =
            document.getElementById("name").value;

        const email =
            document.getElementById("email").value;

        const phone =
            document.getElementById("phone").value;

        const password =
            document.getElementById("password").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;

        if (password !== confirmPassword) {

            showToast("Passwords do not match", "error");
            return;
        }

        try {

            const response = await fetch(
                `${API_URL}/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name,
                        email,
                        phone,
                        password
                    })
                }
            );

            const data = await response.json();

            showToast(data.message, "success");

        } catch (error) {

            console.log(error);
            showToast("Server Error", "error");

        }

    });

}

// --- Open modal with login form ---
if (openAuth) {

    openAuth.addEventListener("click", () => {

        const savedUserName =
            localStorage.getItem("userName");

        // Logged in
        if (savedUserName) {

            const userMenu =
                document.getElementById("userMenu");

            if (userMenu) {
                userMenu.classList.toggle("show");
            }

            return;
        }

        // Not logged in
        authContent.innerHTML = loginHTML;

        authModal.classList.add("active");

        document.body.style.overflow = "hidden";

        attachLoginHandler();

    });

}

// --- Close modal ---
if (closeAuth) {
    closeAuth.addEventListener("click", () => {
        authModal.classList.remove("active");
        document.body.style.overflow = "";
    });
}

// --- Close on backdrop click ---
window.addEventListener("click", (e) => {
    if (e.target === authModal) {
        authModal.classList.remove("active");
        document.body.style.overflow = "";
    }
});

// --- Close on Escape key ---
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && authModal && authModal.classList.contains("active")) {
        authModal.classList.remove("active");
        document.body.style.overflow = "";
    }
});

// --- Switch between login / register ---
document.addEventListener("click", (e) => {

    if (e.target.id === "showRegister") {
        e.preventDefault();
        authContent.innerHTML = registerHTML;
        attachRegisterHandler();
    }

    if (e.target.id === "showLogin") {
        e.preventDefault();
        authContent.innerHTML = loginHTML;
        attachLoginHandler();
    }

});

/* =========================
   SHOW LOGGED IN USER
========================= */

const userMenu = document.getElementById("userMenu");
const logoutBtn = document.getElementById("logoutBtn");

const savedUserName = localStorage.getItem("userName");

if(savedUserName && openAuth){

    openAuth.innerHTML = `
        <i class="fa-solid fa-user"></i>
        ${savedUserName}
        <i class="fa-solid fa-chevron-down"></i>
    `;

}

if(logoutBtn){

    logoutBtn.addEventListener("click", (e) => {

        e.preventDefault();
        e.stopPropagation();

        localStorage.removeItem("token");
        localStorage.removeItem("userName");
        localStorage.removeItem("userId");

        // Change username back to Sign In
        openAuth.innerHTML = "Sign In";

        // Close dropdown
        userMenu.classList.remove("show");

        showToast("Logged out successfully", "success");

    });

}

/* =========================
   LIST PROPERTY
========================= */

const listPropertyBtn =
    document.getElementById("listPropertyBtn");

const propertyFormModal =
    document.getElementById("propertyFormModal");

const closePropertyForm =
    document.getElementById("closePropertyForm");

if(listPropertyBtn){

    listPropertyBtn.addEventListener("click", () => {

        const token =
            localStorage.getItem("token");

        if(!token){

            showToast("Please login first", "info");

            return;
        }

        propertyFormModal.classList.add("active");

    });

}

if(closePropertyForm){

    closePropertyForm.addEventListener("click", () => {

        propertyFormModal.classList.remove("active");

    });

}

let editingPropertyId = null;

const propertyForm =
    document.getElementById("propertyForm");

if(propertyForm){

    propertyForm.addEventListener("submit",
    async (e) => {

        e.preventDefault();

        const imageUrls = document
    .getElementById("propertyImage")
    .value
    .split("\n")
    .map(url => url.trim())
    .filter(url => url !== "");

const propertyData = {
    title: document.getElementById("propertyTitle").value,
    location: document.getElementById("propertyLocation").value,
    price: document.getElementById("propertyPrice").value,
    room_type: document.getElementById("propertyRoomType").value,
    gender: document.getElementById("propertyGender").value,
    description: document.getElementById("propertyDescription").value,

    // Keep the existing main image
    // First image is always the main/card image
image_url: imageUrls[0] || "",
image_urls: imageUrls,

    user_id: Number(localStorage.getItem("userId"))
};

        try {

            const url = editingPropertyId
    ? `${API_URL}/properties/${editingPropertyId}`
    : `${API_URL}/properties`;

const method = editingPropertyId
    ? "PUT"
    : "POST";

const response = await fetch(url, {
    method,
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(propertyData)
});

const data = await response.json();

if (!response.ok) {
    throw new Error(data.message || "Failed to save property");
}

showToast(
    editingPropertyId
        ? "Property Updated Successfully"
        : "Property Added Successfully",
    "success"
);

propertyForm.reset();
editingPropertyId = null;

const submitBtn = propertyForm.querySelector(
    "button[type='submit']"
);

if (submitBtn) {
    submitBtn.textContent = "Add Property";
}

propertyFormModal.classList.remove("active");

            loadLatestProperties();
            loadFeaturedProperties();

        } catch(error){

            console.log(error);

            showToast("Server Error", "error");

        }

    });

}

async function loadLatestProperties() {

    try {

        const response = await fetch(
            `${API_URL}/properties`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message ||
                data.error ||
                "Failed to load properties"
            );
        }

        const properties = Array.isArray(data)
            ? data
            : (data.properties || []);

        const container =
            document.getElementById("latestProperties");

        if (!container) return;

        container.innerHTML = "";

        properties.slice(0, 3).forEach(property => {
            const card = `

    <div
    class="listing-card"
    data-price="${property.price}"
    data-type="${property.room_type.toLowerCase()}"
    data-gender="${property.gender.toLowerCase()}">

        <div class="listing-image">

            <img src="${
    property.image_urls && property.image_urls.length > 0
        ? getImageUrl(property.image_urls[0])
        : getImageUrl(property.image_url)
}" alt="${property.title}">

            <span class="verified-tag">
                ✓ Verified
            </span>

            <button
    class="wishlist-btn"
    data-id="${property.id}">
                <i class="${
    favouriteIds.includes(property.id)
        ? "fa-solid"
        : "fa-regular"
} fa-heart"
style="${
    favouriteIds.includes(property.id)
        ? "color:#ef4444"
        : ""
}">
</i>
            </button>

        </div>

        <div class="listing-content">

            <div class="listing-top">

                <h3>${property.title}</h3>

                <span class="rating">
                    ⭐ 4.8
                </span>

            </div>

            <p class="location">

                📍 ${property.location}

            </p>

            <div class="amenities">

                <span>📶 WiFi</span>

                <span>❄ AC</span>

                <span>🍳 Kitchen</span>

                <span>🔒 Security</span>

            </div>

            <div class="distance">

                👤 ${property.gender} • ${property.room_type}

            </div>

            <div class="listing-bottom">

    <div class="price-box">

        <h2>₹${property.price}</h2>
        <small>/month</small>

    </div>

    <a
        href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.location)}"
        target="_blank"
        class="map-link">

        <i class="fa-solid fa-location-dot"></i>
        <span>View on Map</span>

    </a>

</div>
                <button
                    class="primary-btn view-btn"
                    data-id="${property.id}">

                    View Details

                </button>

            </div>

        </div>

    </div>

    `;

    container.innerHTML += card;

        });

    }
    catch (error) {

        console.log(error);

    }

}

let favouriteIds = [];

async function loadFavourites() {
    const userId = localStorage.getItem("userId");

    if (!userId) {
        favouriteIds = [];
        updateFavouriteBadge();
        return;
    }

    try {
        const response = await fetch(
    `${API_URL}/favourites/${userId}`
);

        const data = await response.json();

        console.log("Favourites response:", data);

        if (!response.ok) {
            throw new Error(data.error || "Failed to load favourites");
        }

        const favourites = Array.isArray(data)
            ? data
            : (data.favourites || []);

        favouriteIds = favourites.map(
            property => property.id
        );

        updateFavouriteBadge();

    } catch (error) {
        console.error("Load favourites error:", error);

        favouriteIds = [];
        updateFavouriteBadge();
    }
}

(async()=>{

    await loadFavourites();

    loadLatestProperties();

    loadFeaturedProperties();

    updateFavouriteBadge();

})();

let currentImages = [];
let currentImageIndex = 0;
let currentPropertyId = null;

function getImageUrl(imagePath) {
    if (!imagePath) {
        return "";
    }

    // Already a complete URL
    if (
        imagePath.startsWith("http://") ||
        imagePath.startsWith("https://")
    ) {
        return imagePath;
    }

    // Convert Windows backslashes to normal slashes
    imagePath = imagePath.replace(/\\/g, "/");

    // Handle old Windows paths
    if (imagePath.includes("/images/")) {
        imagePath = imagePath.split("/images/").pop();
    }

    // Remove leading slash
    imagePath = imagePath.replace(/^\/+/, "");

    return `${API_URL}/images/${encodeURIComponent(imagePath)}`;
}

function renderGallery() {

    const modalImage =
        document.getElementById("modalImage");

    const galleryDots =
        document.getElementById("galleryDots");

    if (!modalImage || !galleryDots) {
        return;
    }

    if (currentImages.length === 0) {
        modalImage.src = "";
        galleryDots.innerHTML = "";
        return;
    }

    modalImage.src =
        getImageUrl(
            currentImages[currentImageIndex]
        );

    galleryDots.innerHTML = "";

    currentImages.forEach((image, index) => {

        const dot =
            document.createElement("span");

        dot.className = "gallery-dot";

        if (index === currentImageIndex) {
            dot.classList.add("active");
        }

        dot.addEventListener("click", (event) => {

            event.stopPropagation();

            currentImageIndex = index;

            renderGallery();

        });

        galleryDots.appendChild(dot);

    });

    updateGalleryArrows();

}

async function openPropertyDetails(propertyId) {

    try {

        const response = await fetch(
            `${API_URL}/properties/${propertyId}`
        );

        if (!response.ok) {
            throw new Error("Property not found");
        }

        const property =
            await response.json();
        
        currentPropertyId = propertyId;

        currentImages =
            Array.isArray(property.image_urls)
                ? property.image_urls
                : [];

        if (
            currentImages.length === 0 &&
            property.image_url
        ) {
            currentImages = [
                property.image_url
            ];
        }

        currentImageIndex = 0;

        renderGallery();

        document.getElementById(
            "modalTitle"
        ).textContent =
            property.title;

        document.getElementById(
            "modalLocation"
        ).textContent =
            "📍 " + property.location;

        document.getElementById(
            "modalPrice"
        ).textContent =
            `₹${property.price} / month`;

        document.getElementById(
            "modalDescription"
        ).textContent =
            property.description || "";

        document
            .getElementById("propertyModal")
            .classList.add("active");

        document.body.style.overflow =
            "hidden";

    } catch (error) {

        console.log(error);

        showToast(
            "Unable to load property",
            "error"
        );

    }
}

// ================================
// CONTACT LANDLORD
// ================================

// ================================
// CONTACT LANDLORD
// ================================

const contactLandlordBtn =
    document.getElementById("contactLandlordBtn");

const contactModal =
    document.getElementById("contactLandlordModal");

if (contactLandlordBtn && contactModal) {

    contactLandlordBtn.addEventListener("click", async () => {

        if (!currentPropertyId) {
            showToast(
                "Property information not available",
                "error"
            );
            return;
        }

        try {

            const response = await fetch(
                `${API_URL}/properties/${currentPropertyId}/landlord`
            );

            if (!response.ok) {
                throw new Error("Landlord not found");
            }

            const landlord = await response.json();

            document.getElementById("landlordName").textContent =
                landlord.name;

            document.getElementById("landlordEmail").textContent =
                landlord.email;

            document.getElementById("landlordPhone").textContent =
                landlord.phone;

            document.getElementById("landlordEmailBtn").href =
                `mailto:${landlord.email}`;

            document.getElementById("landlordCallBtn").href =
                `tel:${landlord.phone}`;

            contactModal.classList.add("active");

        } catch (error) {

            console.log(error);

            showToast(
                "Unable to load landlord details",
                "error"
            );
        }
    });
}

// =====================================
// CLOSE CONTACT LANDLORD MODAL
// =====================================

const closeContactLandlord =
    document.getElementById("closeContactLandlord");

if (closeContactLandlord && contactModal) {

    closeContactLandlord.addEventListener("click", () => {

        contactModal.classList.remove("active");

    });
}


// CLOSE WHEN CLICKING OUTSIDE THE POPUP

if (contactModal) {

    contactModal.addEventListener("click", (event) => {

        if (event.target === contactModal) {
            contactModal.classList.remove("active");
        }

    });

}

// NEXT IMAGE BUTTON
// ================================
// GALLERY ARROWS
// ================================

const galleryNext =
    document.getElementById("galleryNext");

const galleryPrev =
    document.getElementById("galleryPrev");


function updateGalleryArrows() {

    if (!galleryNext || !galleryPrev) {
        return;
    }

    // FIRST IMAGE
    if (currentImageIndex === 0) {

        galleryPrev.style.display = "none";

        if (currentImages.length > 1) {
            galleryNext.style.display = "flex";
        } else {
            galleryNext.style.display = "none";
        }

    }

    // LAST IMAGE
    else if (
        currentImageIndex ===
        currentImages.length - 1
    ) {

        galleryPrev.style.display = "flex";

        galleryNext.style.display = "none";

    }

    // MIDDLE IMAGE
    else {

        galleryPrev.style.display = "flex";
        galleryNext.style.display = "flex";

    }
}


// NEXT IMAGE
if (galleryNext) {

    galleryNext.addEventListener("click", (event) => {

        event.stopPropagation();

        if (
            currentImageIndex <
            currentImages.length - 1
        ) {

            currentImageIndex++;

            renderGallery();

            updateGalleryArrows();

        }

    });

}


// PREVIOUS IMAGE
if (galleryPrev) {

    galleryPrev.addEventListener("click", (event) => {

        event.stopPropagation();

        if (currentImageIndex > 0) {

            currentImageIndex--;

            renderGallery();

            updateGalleryArrows();

        }

    });

}

document.addEventListener(
    "click",
    async (e) => {

        const button =
            e.target.closest(".view-btn");

        if (!button) return;

        const propertyId =
            button.dataset.id;

        if (!propertyId) return;

        await openPropertyDetails(
            propertyId
        );

    }
);

document.addEventListener("click", async (e) => {

    const editBtn = e.target.closest(".edit-btn");

    if (!editBtn) return;

    const propertyId = editBtn.dataset.id;

    try {

        const response = await fetch(
            `${API_URL}/properties/${propertyId}`
        );

        const property = await response.json();

        document.getElementById("propertyTitle").value =
            property.title;

        document.getElementById("propertyLocation").value =
            property.location;

        document.getElementById("propertyPrice").value =
            property.price;

        document.getElementById("propertyRoomType").value =
            property.room_type;

        document.getElementById("propertyGender").value =
            property.gender;

        document.getElementById("propertyDescription").value =
            property.description;

        document.getElementById("propertyImage").value =
    Array.isArray(property.image_urls)
        ? property.image_urls.join("\n")
        : property.image_url || "";

        editingPropertyId = property.id;

        document.querySelector(
            "#propertyForm button[type='submit']"
        ).textContent = "Update Property";

        myPropertiesModal.classList.remove("active");

        propertyFormModal.classList.add("active");

    }

    catch(error){

        console.log(error);

        showToast("Unable to load property","error");

    }

});

document.addEventListener("click", async (e) => {

    const deleteBtn = e.target.closest(".delete-btn");

    if (!deleteBtn) return;

    const propertyId = deleteBtn.dataset.id;

    const confirmDelete = confirm(
        "Are you sure you want to delete this property?"
    );

    if (!confirmDelete) return;

    try {

        const response = await fetch(
            `${API_URL}/properties/${propertyId}`,
            {
                method: "DELETE"
            }
        );

        const data = await response.json();

        showToast(data.message, "success");

        loadLatestProperties();

        loadFeaturedProperties();

        loadMyProperties();

    }

    catch(error){

        console.log(error);

        showToast("Server Error", "error");

    }

});

const propertyModal = document.getElementById("propertyModal");
const closeModalBtn = document.querySelector(".close-modal");

if (closeModalBtn) {

    closeModalBtn.addEventListener("click", () => {

        propertyModal.classList.remove("active");
        document.body.style.overflow = "";

    });

}

window.addEventListener("click", (e) => {

    if (e.target === propertyModal) {

        propertyModal.classList.remove("active");
        document.body.style.overflow = "";
    }

});

document.addEventListener("keydown", (e) => {

    if (e.key === "Escape" && propertyModal.classList.contains("active")) {

        propertyModal.classList.remove("active");
        document.body.style.overflow = "";

    }

});

/* =========================
   MY PROPERTIES
========================= */

const myPropertiesBtn =
    document.getElementById("myPropertiesBtn");

const myPropertiesModal =
    document.getElementById("myPropertiesModal");

const closeMyProperties =
    document.getElementById("closeMyProperties");

const myPropertiesContainer =
    document.getElementById("myPropertiesContainer");


async function loadMyProperties() {

    const userId =
        localStorage.getItem("userId");

    if (!userId) {

        showToast("Please login first", "info");
        return;

    }

    try {

        const response = await fetch(
            `${API_URL}/my-properties/${userId}`
        );

        const properties =
            await response.json();

        myPropertiesContainer.innerHTML = "";

        if (properties.length === 0) {

            myPropertiesContainer.innerHTML = `
                <p style="text-align:center;">
                    You haven't added any properties yet.
                </p>
            `;

            return;

        }

        properties.forEach(property => {

            myPropertiesContainer.innerHTML += `

            <div
    class="listing-card"
    data-price="${property.price}"
    data-type="${property.room_type.toLowerCase()}"
    data-gender="${property.gender.toLowerCase()}">

                    <div class="listing-image">
    <img src="${
    property.image_urls && property.image_urls.length > 0
        ? getImageUrl(property.image_urls[0])
        : getImageUrl(property.image_url)
}" alt="${property.title}">

                        <span class="verified-tag">
                        ✓ Verified
                        </span>
                 
                        <button
    class="wishlist-btn"
    data-id="${property.id}">
                       <i class="${
    favouriteIds.includes(property.id)
        ? "fa-solid"
        : "fa-regular"
} fa-heart"
style="${
    favouriteIds.includes(property.id)
        ? "color:#ef4444"
        : ""
}">
</i>
                        </button>
                    </div>
            
                <div class="listing-content">
                    <div class="listing-top">
                        <h3>${property.title}</h3>
                        <span class="rating">
                        ⭐ 4.8
                        </span>
                    </div>
            
                    <p class="location">
                        📍 ${property.location}
                    </p>
            
                    <div class="amenities">
                        <span>📶 WiFi</span>
                        <span>❄ AC</span>
                        <span>🍳 Kitchen</span>
                        <span>🔒 Security</span>
                    </div>
            
                    <div class="distance">
                        👤 ${property.gender} • ${property.room_type}
                    </div>

                    <div class="listing-bottom">

    <div>

        <h2>₹${property.price}</h2>

        <small>/month</small>

    </div>
    <div class="property-map">

    <i class="fa-solid fa-location-dot"></i>

    <a
        href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.location)}"
        target="_blank"
        class="map-link">

        View on Map

    </a>

</div>

</div>

                    <div class="my-property-buttons">
                        <button
                            class="primary-btn edit-btn"
                            data-id="${property.id}">
                            ✏ Edit
                        </button>

                        <button
                            class="outline-btn delete-btn"
                            data-id="${property.id}">
                            🗑 Delete
                        </button>
                    </div>
                </div>
            </div>
            

            `;

        });

        myPropertiesModal.classList.add("active");

    }

    catch(error){

        console.log(error);

        showToast("Server Error","error");

    }

}


if(myPropertiesBtn){

    myPropertiesBtn.addEventListener("click",(e)=>{

        e.preventDefault();

        loadMyProperties();

    });

}


if(closeMyProperties){

    closeMyProperties.addEventListener("click",()=>{

        myPropertiesModal.classList.remove("active");

    });

}


window.addEventListener("click",(e)=>{

    if(e.target===myPropertiesModal){

        myPropertiesModal.classList.remove("active");

    }

});

async function loadFeaturedProperties() {

    try {
const response = await fetch(
    `${API_URL}/featured-properties`
);

const data = await response.json();

if (!response.ok) {
    throw new Error(
        data.message ||
        data.error ||
        "Failed to load featured properties"
    );
}

const properties = Array.isArray(data)
    ? data
    : (data.properties || []);

const featuredContainer =
    document.getElementById("propertyContainer");

if (!featuredContainer) return;

featuredContainer.innerHTML = "";

properties.slice(0, 3).forEach(property => {
            const card = `

<div
    class="listing-card"
    data-price="${property.price}"
    data-type="${property.room_type.toLowerCase()}"
    data-gender="${property.gender.toLowerCase()}">

    <div class="listing-image">

        <img src="${
    property.image_urls && property.image_urls.length > 0
        ? getImageUrl(property.image_urls[0])
        : getImageUrl(property.image_url)
}" alt="${property.title}">
        <span class="verified-tag">

            ✓ Verified

        </span>

       <button
    class="wishlist-btn"
    data-id="${property.id}">

            <i class="${
    favouriteIds.includes(property.id)
        ? "fa-solid"
        : "fa-regular"
} fa-heart"
style="${
    favouriteIds.includes(property.id)
        ? "color:#ef4444"
        : ""
}">
</i>

        </button>

    </div>

    <div class="listing-content">

        <div class="listing-top">

            <h3>${property.title}</h3>

            <span class="rating">

                ⭐ 4.8

            </span>

        </div>

        <p class="location">

            📍 ${property.location}

        </p>

        <div class="amenities">

            <span>📶 WiFi</span>

            <span>❄ AC</span>

            <span>🍳 Kitchen</span>

            <span>🔒 Security</span>

        </div>

        <div class="distance">

            👤 ${property.gender} • ${property.room_type}

        </div>

        

        <div class="listing-bottom">

    <div class="price-box">

        <h2>₹${property.price}</h2>
        <small>/month</small>

    </div>

    <a
        href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.location)}"
        target="_blank"
        class="map-link">

        <i class="fa-solid fa-location-dot"></i>
        <span>View on Map</span>

    </a>

</div>

<button
    class="primary-btn view-btn"
    data-id="${property.id}">

    View Details

</button>
    </div>

</div>

`;

            featuredContainer.innerHTML += card;

        });

    }

    catch(error){

        console.log(error);

    }

}

const viewAllModal =
document.getElementById("viewAllModal");

const viewAllContainer =
document.getElementById("viewAllContainer");

const viewAllTitle =
document.getElementById("viewAllTitle");

document
.getElementById("closeViewAll")
.addEventListener("click",()=>{

    viewAllModal.classList.remove("active");

});

document
.getElementById("viewAllLatestBtn")
.addEventListener("click",async()=>{

    viewAllTitle.innerText="Latest Properties";

    const response=await fetch(`${API_URL}/properties`);

    const properties=await response.json();

    viewAllContainer.innerHTML="";

    properties.forEach(property=>{
viewAllContainer.innerHTML += `

<div class="listing-card">

    <div class="listing-image">

       <img src="${
    property.image_urls && property.image_urls.length > 0
        ? getImageUrl(property.image_urls[0])
        : getImageUrl(property.image_url)
}" alt="${property.title}">

        <span class="verified-tag">
            ✓ Verified
        </span>

        <button
    class="wishlist-btn"
    data-id="${property.id}">
           <i class="${
    favouriteIds.includes(property.id)
        ? "fa-solid"
        : "fa-regular"
} fa-heart"
style="${
    favouriteIds.includes(property.id)
        ? "color:#ef4444"
        : ""
}">
</i>
        </button>

    </div>

    <div class="listing-content">

        <div class="listing-top">

            <h3>${property.title}</h3>

            <span class="rating">
                ⭐ 4.8
            </span>

        </div>

        <p class="location">
            📍 ${property.location}
        </p>

        <div class="amenities">
            <span>📶 WiFi</span>
            <span>❄ AC</span>
            <span>🍳 Kitchen</span>
            <span>🔒 Security</span>
        </div>

        <div class="distance">
            👤 ${property.gender} • ${property.room_type}
        </div>

        <div class="listing-bottom">

            <div class="price-box">
                <h2>₹${property.price}</h2>
                <small>/month</small>
            </div>

            <a
                href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.location)}"
                target="_blank"
                class="map-link">

                <i class="fa-solid fa-location-dot"></i>
                <span>View on Map</span>

            </a>

        </div>

        <button
            class="primary-btn view-btn"
            data-id="${property.id}">
            View Details
        </button>

    </div>

</div>

`;

    });

    viewAllModal.classList.add("active");

});

document
.getElementById("viewAllFeaturedBtn")
.addEventListener("click",async()=>{

    viewAllTitle.innerText="Featured Properties";

    const response=await fetch(`${API_URL}/featured-properties`);

    const properties=await response.json();

    viewAllContainer.innerHTML="";

    properties.forEach(property=>{

viewAllContainer.innerHTML += `

<div class="listing-card">

    <div class="listing-image">

        <img src="${
    property.image_urls && property.image_urls.length > 0
        ? getImageUrl(property.image_urls[0])
        : getImageUrl(property.image_url)
}" alt="${property.title}">

        <span class="verified-tag">
            ✓ Verified
        </span>

        <button
    class="wishlist-btn"
    data-id="${property.id}">
            <i class="${
    favouriteIds.includes(property.id)
        ? "fa-solid"
        : "fa-regular"
} fa-heart"
style="${
    favouriteIds.includes(property.id)
        ? "color:#ef4444"
        : ""
}">
</i>
        </button>

    </div>

    <div class="listing-content">

        <div class="listing-top">

            <h3>${property.title}</h3>

            <span class="rating">
                ⭐ 4.8
            </span>

        </div>

        <p class="location">
            📍 ${property.location}
        </p>

        <div class="amenities">
            <span>📶 WiFi</span>
            <span>❄ AC</span>
            <span>🍳 Kitchen</span>
            <span>🔒 Security</span>
        </div>

        <div class="distance">
            👤 ${property.gender} • ${property.room_type}
        </div>

        <div class="listing-bottom">

            <div class="price-box">
                <h2>₹${property.price}</h2>
                <small>/month</small>
            </div>

            <a
                href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.location)}"
                target="_blank"
                class="map-link">

                <i class="fa-solid fa-location-dot"></i>
                <span>View on Map</span>

            </a>

        </div>

        <button
            class="primary-btn view-btn"
            data-id="${property.id}">
            View Details
        </button>

    </div>

</div>

`;

    });

    viewAllModal.classList.add("active");

});

document.addEventListener("click", async (e) => {

    const button = e.target.closest(".wishlist-btn");

    if (!button) return;

    const userId = localStorage.getItem("userId");

if (!userId) {

    showToast("Please login first", "info");

    return;

}

const propertyId = button.dataset.id;

    try {

        const icon = button.querySelector("i");

const isFavourite = icon.classList.contains("fa-solid");

const url = `${API_URL}/favourites`;

const method = isFavourite ? "DELETE" : "POST";

const response = await fetch(url, {

    method,

    headers: {
        "Content-Type": "application/json"
    },

    body: JSON.stringify({

        userId,
        propertyId

    })

});

const data = await response.json();

if (data.success) {

    if (isFavourite) {

        favouriteIds = favouriteIds.filter(id => id != propertyId);

        showToast("Removed from favourites", "success");

    } else {

        if (!favouriteIds.includes(Number(propertyId))) {

    favouriteIds.push(Number(propertyId));

}

        showToast("Added to favourites", "success");

    }

     updateWishlistButtons();

     updateFavouriteBadge();


}

    }

    catch (err) {

        console.log(err);

    }

});

const myFavouritesBtn =
document.getElementById("myFavouritesBtn");

const myFavouritesModal =
document.getElementById("myFavouritesModal");

const closeFavourites =
document.getElementById("closeFavourites");

const myFavouritesContainer =
document.getElementById("myFavouritesContainer");

if(myFavouritesBtn){

    myFavouritesBtn.addEventListener("click", async (e) => {

        e.preventDefault();

        await loadMyFavourites();

        myFavouritesModal.classList.add("active");

    });

}

if(closeFavourites){

    closeFavourites.addEventListener("click",()=>{

        myFavouritesModal.classList.remove("active");

    });

}

async function loadMyFavourites() {

    const userId = localStorage.getItem("userId");

    if (!userId) return;

    const response = await fetch(
        `${API_URL}/favourites/${userId}`
    );

    const properties = await response.json();

    myFavouritesContainer.innerHTML = "";

    document.querySelector(".favourite-count").textContent =
        properties.length;

    properties.forEach(property => {

        myFavouritesContainer.innerHTML += `

<div class="listing-card">

    <div class="listing-image">

       <img src="${
    property.image_urls && property.image_urls.length > 0
        ? getImageUrl(property.image_urls[0])
        : getImageUrl(property.image_url)
}" alt="${property.title}">
        <span class="verified-tag">
            ✓ Verified
        </span>

    </div>

    <div class="listing-content">

        <h3>${property.title}</h3>

        <p class="location">
            📍 ${property.location}
        </p>

        <p class="favourite-info">
            👥 ${property.gender} • ${property.room_type}
        </p>

        <div class="listing-bottom">

            <div class="price-box">

                <h2>₹${property.price}</h2>

                <small>/month</small>

            </div>

        </div>

        <button
    class="primary-btn favourite-view-btn"
    data-id="${property.id}">
    View Details
</button>
    </div>

</div>

`;

    });

}

document.addEventListener("click", async (e) => {

    const button =
        e.target.closest(".favourite-view-btn");

    if (!button) return;

    const propertyId =
        button.dataset.id;

    if (!propertyId) return;

    await openPropertyDetails(propertyId);

});

function updateFavouriteBadge(){

    const badge =
        document.querySelector(".favourite-count");

    if(badge){

        badge.textContent = favouriteIds.length;

    }

}

function updateWishlistButtons(){

    document
        .querySelectorAll(".wishlist-btn")
        .forEach(button=>{

            const id =
                Number(button.dataset.id);

            const icon =
                button.querySelector("i");

            if(favouriteIds.includes(id)){

                icon.classList.remove("fa-regular");

                icon.classList.add("fa-solid");

                icon.style.color="#ef4444";

            }

            else{

                icon.classList.remove("fa-solid");

                icon.classList.add("fa-regular");

                icon.style.color="";

            }

        });

}
/* ===========================
   NEWSLETTER SUBSCRIBE
=========================== */

const subscribeBtn =
    document.getElementById("subscribeBtn");

if (subscribeBtn) {

    subscribeBtn.addEventListener("click", async () => {


const email=
document.getElementById("subscriberEmail").value.trim();

const university=
document.getElementById("subscriberUniversity").value.trim();

const location=
document.getElementById("subscriberLocation").value.trim();

const budget=
document.getElementById("subscriberBudget").value.trim();

if(email===""){

showToast("Please enter your email.","error");

return;

}

try{

const response=await fetch(

`${API_URL}/subscribe`,

{

method:"POST",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify({

email,

university,

location,

budget

})

}

);

const data=await response.json();

showToast(

data.message,

data.success?"success":"error"

);

if(data.success){

document.getElementById("subscriberEmail").value="";

document.getElementById("subscriberUniversity").value="";

document.getElementById("subscriberLocation").value="";

document.getElementById("subscriberBudget").value="";

advancedFields.style.display="none";

toggleBtn.innerHTML=
"Advanced Preferences (Optional) ▼";

}

}

catch(err){

showToast("Server Error","error");

console.log(err);

}

});

/* ==========================
   ADVANCED PREFERENCES
========================== */

const toggleBtn =
document.getElementById("toggleAdvanced");

const advancedFields =
document.getElementById("advancedFields");

if(toggleBtn){

toggleBtn.addEventListener("click",()=>{

if(advancedFields.style.display==="none"){

advancedFields.style.display="block";

toggleBtn.innerHTML=
"Advanced Preferences (Optional) ▲";

}
else{

advancedFields.style.display="none";

toggleBtn.innerHTML=
"Advanced Preferences (Optional) ▼";

}

});

}

const footerWishlist = document.getElementById("footerWishlist");

if (footerWishlist) {

    footerWishlist.addEventListener("click", async function (e) {

        e.preventDefault();

        await loadMyFavourites();

        document
            .getElementById("myFavouritesModal")
            .classList.add("active");
            

    });

}



const footerRoommate = document.getElementById("footerRoommate");

if (footerRoommate) {

    footerRoommate.addEventListener("click", (e) => {

        e.preventDefault();

        document.querySelector(".roommate-chatbot").style.display = "flex";

        document.getElementById("roommateUserInput").focus();

    });

}
const footerAI = document.getElementById("footerAI");

if (footerAI) {

    footerAI.addEventListener("click", (e) => {

        e.preventDefault();

        document.querySelector(".chatbot").style.display = "flex";

        document.getElementById("userInput").focus();

    });

}

const footerList =
    document.getElementById("footerListProperty");

if (footerList) {

    footerList.addEventListener("click", function (e) {

        e.preventDefault();

        const token =
            localStorage.getItem("token");

        if (!token) {

            showToast(
                "Please login first",
                "info"
            );

            return;
        }

        document
            .getElementById("propertyFormModal")
            .classList.add("active");

    });

}

const footerManage =
document.getElementById("footerManage");

if (footerManage) {

    footerManage.addEventListener("click", function (e) {

        e.preventDefault();

        document
.getElementById("myPropertiesModal")
.classList.add("active");

        loadMyProperties();

    });

}

// =========================================
// BOOK VISIT
// =========================================

const bookVisitBtn =
    document.getElementById("bookVisitBtn");

const bookVisitModal =
    document.getElementById("bookVisitModal");

const closeBookVisit =
    document.getElementById("closeBookVisit");

const confirmVisitBtn =
    document.getElementById("confirmVisitBtn");

if (bookVisitBtn && bookVisitModal) {

    bookVisitBtn.addEventListener("click", () => {

        if (!currentPropertyId) {
            showToast(
                "Property information not available",
                "error"
            );
            return;
        }

        // Get property title from existing modal
        const propertyTitle =
            document.getElementById("modalTitle")
                .textContent;

        document.getElementById(
            "bookingPropertyTitle"
        ).textContent = propertyTitle;

        // Get logged-in user's information
        const savedUserName =
            localStorage.getItem("userName");

        const savedUserEmail =
            localStorage.getItem("userEmail");

        if (savedUserName) {
            document.getElementById(
                "visitorName"
            ).value = savedUserName;
        }

        if (savedUserEmail) {
            document.getElementById(
                "visitorEmail"
            ).value = savedUserEmail;
        }

        bookVisitModal.classList.add("active");
    });
}

// =========================================
// CLOSE BOOK VISIT MODAL
// =========================================

if (closeBookVisit && bookVisitModal) {

    closeBookVisit.addEventListener("click", () => {

        bookVisitModal.classList.remove("active");

    });
}
if (bookVisitModal) {

    window.addEventListener("click", (e) => {

        if (e.target === bookVisitModal) {

            bookVisitModal.classList.remove("active");

        }

    });

}

// =========================================
// CONFIRM BOOKING
// =========================================

if (confirmVisitBtn) {

    confirmVisitBtn.addEventListener("click", async () => {

        const visitDate =
            document.getElementById("visitDate").value;

        const visitTime =
            document.getElementById("visitTime").value;

        const visitorName =
            document.getElementById("visitorName").value.trim();

        const visitorEmail =
            document.getElementById("visitorEmail").value.trim();

        // Validate fields
        if (
            !visitDate ||
            !visitTime ||
            !visitorName ||
            !visitorEmail
        ) {
            showToast(
                "Please fill in all the details",
                "error"
            );
            return;
        }

        // Make sure a property is selected
        if (!currentPropertyId) {
            showToast(
                "Property information not available",
                "error"
            );
            return;
        }

        try {

            confirmVisitBtn.disabled = true;
            confirmVisitBtn.textContent = "Booking...";

            const userId =
                localStorage.getItem("userId");

            const response = await fetch(
                `${API_URL}/property-visits`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        property_id: Number(currentPropertyId),
                        user_id: userId
                            ? Number(userId)
                            : null,
                        visit_date: visitDate,
                        visit_time: visitTime,
                        name: visitorName,
                        email: visitorEmail
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to book visit"
                );
            }

            showToast(
                "Visit booked successfully!",
                "success"
            );

            // Close booking popup
            bookVisitModal.classList.remove("active");

            // Clear form
            document.getElementById("visitDate").value = "";
            document.getElementById("visitTime").value = "";
            document.getElementById("visitorName").value = "";
            document.getElementById("visitorEmail").value = "";

                } catch (error) {

            console.error("Booking error:", error);

            showToast(
                error.message || "Unable to book visit",
                "error"
            );

        } finally {

            confirmVisitBtn.disabled = false;
            confirmVisitBtn.textContent = "Confirm Visit";

        }

    });

}}
// - index.js

// Init AOS
AOS.init({
  duration: 800,
  easing: "ease-in-out",
  once: true,
  offset: 100,
  mirror: false,
});

document.getElementById("year").textContent = new Date().getFullYear();

// --- Scroll to Top Logic ---
const scrollTopBtn = document.getElementById("scrollTopBtn");
window.addEventListener("scroll", () => {
  if (window.scrollY > 300) {
    scrollTopBtn.classList.remove("translate-y-24", "opacity-0");
  } else {
    scrollTopBtn.classList.add("translate-y-24", "opacity-0");
  }
});

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// --- Improved Modal Logic ---

function hideModal(modalId) {
  const el = document.getElementById(modalId);
  el.classList.remove("scale-100", "opacity-100");
  el.classList.add("scale-90", "opacity-0");
  setTimeout(() => el.classList.add("hidden"), 300);
}

function showModal(modalId) {
  const el = document.getElementById(modalId);
  el.classList.remove("hidden");
  setTimeout(() => {
    el.classList.remove("scale-90", "opacity-0");
    el.classList.add("scale-100", "opacity-100");
  }, 10);
}

function openLogin(isSwitching = false) {
  const overlay = document.getElementById("overlay");
  if (isSwitching) {
    const signup = document.getElementById("signupPopup");
    signup.classList.add("hidden", "scale-90", "opacity-0");
    signup.classList.remove("scale-100", "opacity-100");
  } else {
    overlay.classList.remove("hidden");
  }
  showModal("loginPopup");
}

function openSignup(isSwitching = false) {
  const overlay = document.getElementById("overlay");
  if (isSwitching) {
    const login = document.getElementById("loginPopup");
    login.classList.add("hidden", "scale-90", "opacity-0");
    login.classList.remove("scale-100", "opacity-100");
  } else {
    overlay.classList.remove("hidden");
  }
  showModal("signupPopup");
}

function closePopup() {
  const overlay = document.getElementById("overlay");
  hideModal("loginPopup");
  hideModal("signupPopup");
  setTimeout(() => {
    overlay.classList.add("hidden");
  }, 300);
}

// Mobile Menu
function toggleMobileMenu() {
  document.getElementById("mobile-menu").classList.toggle("hidden");
}

// --- NEW API CALL LOGIC ---

async function handleSignup() {
  const name = document.getElementById("signup-name").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value.trim();

  // VALIDATION [New Change]
  if (!name || !email || !password) {
    alert("Please fill in all details to sign up.");
    return;
  }

  const requestBody = { name, email, password };
  const apiUrl = `${CONFIG.API_BASE_URL}/register`;

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });
    
    if (response.ok) {
      
      closePopup();
      openLogin();
    } else {
      const error = await response.text();
      alert("Registration Failed: " + error);
    }
  } catch (error) {
    console.error("Network Error:", error);
    alert("An unexpected network error occurred.");
  }
}

const loginUrl = `${CONFIG.API_BASE_URL}/login`;

async function handleLogin() {
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value.trim();

  // VALIDATION [New Change]
  if (!email || !password) {
    alert("Please enter both email and password to login.");
    return;
  }

  const requestBody = { email, password };

  try {
    const response = await fetch(loginUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("jwtToken", data.token);
      window.location.href = "index.html";
    } else {
      const errorMessage = await response.text();
      alert("Login Failed: " + errorMessage);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Something went wrong.");
  }
}

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('openLogin') === 'true') {
        window.history.replaceState({}, document.title, window.location.pathname);
        setTimeout(() => { openLogin(); }, 500);
    }
});
// Init AOS
AOS.init({
  duration: 800,
  easing: "ease-in-out",
  once: true,
  offset: 100,
  mirror: false,
});

document.getElementById("year").textContent = new Date().getFullYear();

// --- Auto Popup Logic ---
/* REMOVED: The automatic signup popup logic was here. 
           The code below is now empty, preventing the auto-popup. 
        window.addEventListener('load', function() {
            // Opens signup popup automatically 1.5 seconds after page load
            setTimeout(() => {
                // Only open if no popup is currently open
                const overlay = document.getElementById('overlay');
                if (overlay.classList.contains('hidden')) {
                    openSignup(false);
                }
            }, 1500); 
        });
        */

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

/**
 * Handles the Sign Up form submission, calling the /register API endpoint.
 */

async function handleSignup() {
  console.log("index.js");
  
  // 1. Get input values from the new IDs in index.html
  const name = document.getElementById("signup-name").value;
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;

  // The RegisterRequest in your Spring Boot likely requires these fields.
  const requestBody = {
    name: name,
    email: email,
    password: password,
  };

  // Endpoint URL (Assuming Spring Boot is running on the same host/port)
  const apiUrl = `${CONFIG.API_BASE_URL}/register`;

  try {
    // 2. Make the API Call using fetch
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        // Crucial for sending JSON data
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody), // Convert JS object to JSON string
    });
    // 3. Handle the response
    if (response.ok) {
      // Registration successful (Status 200 OK)
      const data = await response.json();
      console.log("Registration Successful. Received Token:", data.token);

      alert("Registration successful! Please login.");

      // Close signup and open login popup
      closePopup();
      openLogin();
    } else {
      // Registration failed (e.g., Status 400 Bad Request)
      const error = await response.text(); // Get the plain error message from the body
      console.error("Registration Failed:", error);
      alert("Registration Failed: " + error);
    }
  } catch (error) {
    // Network or unexpected error
    console.error("Network Error:", error);
    alert("An unexpected network error occurred. Please try again.");
  }
}

const loginUrl = `${CONFIG.API_BASE_URL}/login`;

async function handleLogin() {
  console.log("index.js");
  
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  const requestBody = {
    email: email,
    password: password,
  };

  try {
    const response = await fetch(loginUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (response.ok) {
      const data = await response.json();

      localStorage.setItem("jwtToken", data.token);

      console.log("Login Successful!");
      window.location.href = "index.html";
      alert("login successfull");
    } else {
      const errorMessage = await response.text();
      alert("Login Failed: " + errorMessage);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Something went wrong. Please check the console.");
  }
}


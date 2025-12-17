/* nav.js */

document.addEventListener('DOMContentLoaded', () => {
    includeHTML('nav-bar.html', 'nav-placeholder').then(() => {
        updateNavbarUI();
    });
    if (typeof AOS !== 'undefined') AOS.init();
});

async function includeHTML(url, elementId) {
    const placeholder = document.getElementById(elementId);
    if (!placeholder) return;
    try {
        const response = await fetch(url);
        if (response.ok) placeholder.innerHTML = await response.text();
    } catch (error) {
        console.error(`Error loading ${url}:`, error);
    }
}

function updateNavbarUI() {
    const token = localStorage.getItem('jwtToken');
    const authButtons = document.getElementById('nav-auth-buttons');
    const userProfile = document.getElementById('nav-user-profile');
    const mobileAuth = document.getElementById('mobile-auth-buttons');
    const mobileProfile = document.getElementById('mobile-user-profile');

    if (token) {
        authButtons?.classList.add('hidden');
        userProfile?.classList.remove('hidden');
        mobileAuth?.classList.add('hidden');
        mobileProfile?.classList.remove('hidden');
    } else {
        authButtons?.classList.remove('hidden');
        userProfile?.classList.add('hidden');
        mobileAuth?.classList.remove('hidden');
        mobileProfile?.classList.add('hidden');
    }
}

function handleRecruiterClick() {
    const token = localStorage.getItem('jwtToken');
    if (token) {
        window.location.href = "Recruiter.html";
    } else {
        alert("Please login first to access the Recruiter Dashboard.");
        openLogin();
    }
}

async function handleLogin() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();

    // VALIDATION [New Change]
    if (!email || !password) {
        alert("Please enter both email and password.");
        return;
    }

    const requestBody = { email, password };
    const loginUrl = `${CONFIG.API_BASE_URL}/login`;

    try {
        const response = await fetch(loginUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('jwtToken', data.token);
            localStorage.setItem('userId', data.userId);
            localStorage.setItem('userName', data.name || email.split('@')[0]);
            
            alert("Login successful!");
            window.location.href = "profile.html";
        } else {
            const errorMessage = await response.text();
            alert("Login Failed: " + errorMessage);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Something went wrong.");
    }
}

async function handleSignup() {
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value.trim();

    // VALIDATION [New Change]
    if (!name || !email || !password) {
        alert("Please complete all fields to sign up.");
        return;
    }

    const requestBody = { name, email, password };
    const apiUrl = `${CONFIG.API_BASE_URL}/register`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (response.ok) {
            alert('Registration successful! Please login.');
            closePopup();
            openLogin();
        } else {
            const error = await response.text();
            alert('Registration Failed: ' + error);
        }
    } catch (error) {
        console.error('Network Error:', error);
        alert('An unexpected network error occurred.');
    }
}

// Modal Utils
function toggleModal(modalId, show) {
    const overlay = document.getElementById('overlay');
    const modal = document.getElementById(modalId);
    if (!modal || !overlay) return;

    if (show) {
        overlay.classList.remove('hidden');
        modal.classList.remove('hidden');
        setTimeout(() => {
            overlay.classList.remove('opacity-0');
            modal.classList.remove('scale-90', 'opacity-0');
            modal.classList.add('scale-100', 'opacity-100');
        }, 10);
    } else {
        overlay.classList.add('opacity-0');
        modal.classList.remove('scale-100', 'opacity-100');
        modal.classList.add('scale-90', 'opacity-0');
        setTimeout(() => {
            overlay.classList.add('hidden');
            modal.classList.add('hidden');
        }, 300);
    }
}

function closePopup() {
    toggleModal('loginPopup', false);
    toggleModal('signupPopup', false);
}
function openLogin(isSwitch) {
    if(isSwitch) toggleModal('signupPopup', false);
    toggleModal('loginPopup', true);
}
function openSignup(isSwitch) {
    if(isSwitch) toggleModal('loginPopup', false);
    toggleModal('signupPopup', true);
}

// Global Exports
window.handleRecruiterClick = handleRecruiterClick;
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
window.openLogin = openLogin;
window.openSignup = openSignup;
window.closePopup = closePopup;
window.updateNavbarUI = updateNavbarUI;
// DOM Elements
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const mobileLoginBtn = document.getElementById('mobileLoginBtn');
const mobileSignupBtn = document.getElementById('mobileSignupBtn');
const loginModal = document.getElementById('loginModal');
const signupModal = document.getElementById('signupModal');
const closeLoginModal = document.getElementById('closeLoginModal');
const closeSignupModal = document.getElementById('closeSignupModal');
const showSignup = document.getElementById('showSignup');
const showLogin = document.getElementById('showLogin');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

// API Base URL
const API_BASE_URL = 'http://localhost:8080/api';

// Show message helper function
function showMessage(elementId, message, isError = false) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.color = isError ? '#e74c3c' : '#2ecc71';
        element.style.display = 'block';
        
        // Hide message after 5 seconds
        setTimeout(() => {
            element.style.display = 'none';
        }, 5000);
    }
}

// Register function
async function register() {
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Client-side validation
    if (!name || !email || !password || !confirmPassword) {
        showMessage('signupMsg', 'All fields are required!', true);
        return;
    }
    
    if (password !== confirmPassword) {
        showMessage('signupMsg', 'Passwords do not match!', true);
        return;
    }
    
    const data = {
        name: name,
        email: email,
        password: password
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showMessage('signupMsg', 'Registration successful! Please login.');
            // Clear the form
            document.getElementById('signupName').value = '';
            document.getElementById('signupEmail').value = '';
            document.getElementById('signupPassword').value = '';
            document.getElementById('confirmPassword').value = '';
            
            // Switch to login form after a delay
            setTimeout(() => {
                document.getElementById('signupPopup').style.display = 'none';
                document.getElementById('loginPopup').style.display = 'block';
            }, 1500);
        } else {
            const errorMessage = result.message || 'Registration failed. Please try again.';
            showMessage('signupMsg', errorMessage, true);
        }
    } catch (error) {
        console.error('Registration error:', error);
        showMessage('signupMsg', 'An error occurred. Please try again later.', true);
    }
}

// Login function
async function login() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    // Client-side validation
    if (!email || !password) {
        showMessage('loginMsg', 'Email and password are required!', true);
        return;
    }
    
    const data = {
        email: email,
        password: password
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showMessage('loginMsg', 'Login successful! Redirecting...');
            
            // Store the token in localStorage
            if (result.token) {
                localStorage.setItem('authToken', result.token);
                
                // Redirect to dashboard after a short delay
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            }
        } else {
            const errorMessage = result.message || 'Login failed. Please check your credentials.';
            showMessage('loginMsg', errorMessage, true);
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage('loginMsg', 'An error occurred. Please try again later.', true);
    }
}

// Mobile Menu Toggle
if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : 'auto';
    });

    // Close menu when clicking on a nav link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    });
}

// Show Login Modal
const showLoginModal = () => {
    loginModal.classList.add('active');
    document.body.style.overflow = 'hidden';
};

// Show Signup Modal
const showSignupModal = () => {
    signupModal.classList.add('active');
    document.body.style.overflow = 'hidden';
};

// Close Modals
const closeModals = () => {
    loginModal.classList.remove('active');
    signupModal.classList.remove('active');
    document.body.style.overflow = 'auto';
};

// Event Listeners
loginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showLoginModal();});

signupBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showSignupModal();
});

mobileLoginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showLoginModal();
    mobileMenu.classList.remove('active');
});

mobileSignupBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showSignupModal();
    mobileMenu.classList.remove('active');
});

closeLoginModal.addEventListener('click', closeModals);
closeSignupModal.addEventListener('click', closeModals);

showSignup.addEventListener('click', (e) => {
    e.preventDefault();
    loginModal.classList.remove('active');
    showSignupModal();
});

showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    signupModal.classList.remove('active');
    showLoginModal();
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        closeModals();
    }
    if (e.target === signupModal) {
        closeModals();
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            const headerOffset = 80; // Height of the fixed header
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Form Submissions
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Here you would typically make an API call to your backend
    console.log('Login attempt with:', { email, password });
    
    // Show success message (in a real app, handle response from server)
    alert('Login successful!');
    closeModals();
});

signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Basic validation
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    // Here you would typically make an API call to your backend
    console.log('Signup attempt with:', { name, email, password });
    
    // Show success message (in a real app, handle response from server)
    alert('Account created successfully! Please log in.');
    signupModal.classList.remove('active');
    showLoginModal();
});

// Sticky Navbar
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 15px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'white';
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    }
});

// Initialize AOS (Animate On Scroll) - if you want to add animations
// Make sure to include AOS CSS and JS in your HTML
// <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
// <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
// document.addEventListener('DOMContentLoaded', () => {
//     AOS.init({
//         duration: 800,
//         easing: 'ease-in-out',
//         once: true
//     });
// });



// Login/Signup Popup Functionality
document.addEventListener('DOMContentLoaded', function() {
    const overlay = document.querySelector('.overlay');
    const loginPopup = document.getElementById('loginPopup');
    const signupPopup = document.getElementById('signupPopup');
    const closeButtons = document.querySelectorAll('.close');
    const switchLinks = document.querySelectorAll('.switch-link');
    const popupLinks = document.querySelectorAll('[data-popup]');

    // Function to show a specific popup
    function showPopup(popupId) {
        // Hide all popups first
        document.querySelectorAll('.popup').forEach(popup => {
            popup.style.display = 'none';
        });
        
        // Show the requested popup and overlay
        const popup = document.getElementById(popupId);
        if (popup) {
            popup.style.display = 'block';
            overlay.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    // Function to close all popups
    function closePopup() {
        document.querySelectorAll('.popup').forEach(popup => {
            popup.style.display = 'none';
        });
        overlay.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // Event listeners for popup links in navbar
    popupLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const popupId = this.getAttribute('data-popup');
            showPopup(popupId);
        });
    });

    // Event listeners for close buttons
    closeButtons.forEach(button => {
        button.addEventListener('click', closePopup);
    });

    // Event listeners for switch links (Login/Signup)
    switchLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetPopup = this.getAttribute('data-target');
            showPopup(targetPopup);
        });
    });

    // Close popup when clicking on overlay
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            closePopup();
        }
    });

    // Close popup with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closePopup();
        }
    });
});

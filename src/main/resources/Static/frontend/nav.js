document.addEventListener('DOMContentLoaded', () => {
            // Function to load external HTML for dynamic components (Navbar)
            async function includeHTML(url, elementId) {
                const placeholder = document.getElementById(elementId);
                if (!placeholder) return; 

                try {
                    const response = await fetch(url);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status} (${url})`);
                    }
                    const html = await response.text();
                    placeholder.innerHTML = html;
                    
                } catch (error) {
                    console.error(`Could not load component from ${url}. If you are opening index.html directly (file://), this is expected. You must use a local server.`, error);
                }
            }

            // Load the NAV BAR component (Footer is now inlined)
            includeHTML('nav-bar.html', 'nav-placeholder');
            
            // Set the current year for the inlined footer
            const yearElement = document.getElementById('year');
            if (yearElement) {
                yearElement.textContent = new Date().getFullYear();
            }

            // Initialize AOS
            AOS.init();
        });

function toggleModal(modalId, show) {
    const modal = document.getElementById(modalId);
    if (!modal || !overlay) return; // Safety check

    if (show) {
        overlay.classList.remove('hidden');
        setTimeout(() => overlay.classList.add('opacity-100'), 10);

        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.remove('scale-90', 'opacity-0');
            modal.classList.add('scale-100', 'opacity-100');
        }, 10);
    } else {
        overlay.classList.remove('opacity-100');
        modal.classList.remove('scale-100', 'opacity-100');
        modal.classList.add('scale-90', 'opacity-0');

        setTimeout(() => {
            overlay.classList.add('hidden');
            modal.classList.add('hidden');
        }, 300); // Match transition duration
    }
}

function closePopup() {
    toggleModal('loginPopup', false);
    toggleModal('signupPopup', false);
}

function openLogin(isSwitch = false) {
    if (isSwitch) {
        toggleModal('signupPopup', false);
        // Give a slight delay when switching to allow the previous one to start hiding
        setTimeout(() => toggleModal('loginPopup', true), 100); 
    } else {
        toggleModal('loginPopup', true);
    }
}

function openSignup(isSwitch = false) {
    if (isSwitch) {
        toggleModal('loginPopup', false);
        setTimeout(() => toggleModal('signupPopup', true), 100);
    } else {
        toggleModal('signupPopup', true);
    }
}



async function handleLogin() {
    console.log("nav.js");
    

    const loginUrl = `${CONFIG.API_BASE_URL}/login`;

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const requestBody = {
        email: email,
        password: password
    };

    try {

        const response = await fetch(loginUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (response.ok) {

            const data = await response.json();


            localStorage.setItem('jwtToken', data.token);


            console.log("Login Successful!");
            window.location.href = "profile.html";
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

async function handleSignup() {
    console.log("nav.js");
            // 1. Get input values from the new IDs in index.html
            const name = document.getElementById('signup-name').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;

            // The RegisterRequest in your Spring Boot likely requires these fields.
            const requestBody = {
                name: name,
                email: email,
                password: password
            };

            // Endpoint URL (Assuming Spring Boot is running on the same host/port)
            const apiUrl = `${CONFIG.API_BASE_URL}/register`;

            try {
                // 2. Make the API Call using fetch
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        // Crucial for sending JSON data
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestBody) // Convert JS object to JSON string
                });
                // 3. Handle the response
                if (response.ok) {
                    // Registration successful (Status 200 OK)
                    const data = await response.json();
                    console.log('Registration Successful. Received Token:', data.token);

                    alert('Registration successful! Please login.');

                    // Close signup and open login popup
                    closePopup();
                    openLogin();

                } else {
                    // Registration failed (e.g., Status 400 Bad Request)
                    const error = await response.text(); // Get the plain error message from the body
                    console.error('Registration Failed:', error);
                    alert('Registration Failed: ' + error);
                }
            } catch (error) {
                // Network or unexpected error
                console.error('Network Error:', error);
                alert('An unexpected network error occurred. Please try again.');
            }
        }




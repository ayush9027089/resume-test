feather.replace();

// ===== Login/Signup Functionality (NEW) =====
const loginPopup = document.getElementById('loginPopup');
const signupPopup = document.getElementById('signupPopup');
const overlay = document.getElementById('overlay');
const mobileMenu = document.getElementById('mobile-menu');

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

const loginUrl = `${CONFIG.API_BASE_URL}/login`;

async function handleLogin() {
    

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
// ===== END Login/Signup Functionality (NEW) =====




// DOM elements

const sortSelect = document.getElementById('sortSelect');

const detailModal = document.getElementById('detailModal');
const atsChartCtx = document.getElementById('atsChart');
const positionCheckboxesContainer = document.getElementById('positionCheckboxes');
const filterSidebar = document.getElementById('filterSidebar');


let atsChartInstance = null; // To store the Chart.js instance


// ===== Utility Functions for Checkbox Filtering (NEW) =====

/**
 * Gets the values of all checked checkboxes with a given name attribute.
 * @param {string} name - The name attribute of the checkbox group.
 * @returns {string[]} An array of checked values.
 */
function getCheckedValues(name) {
    const checkboxes = document.querySelectorAll(`input[name="${name}"]:checked`);
    return Array.from(checkboxes).map(cb => cb.value);
}

// ===== Core Logic Functions =====

/**
 * Updates the counts displayed next to the checkbox filters.
 */
function updateFilterCounts() {
    // 1. Position Counts
    
    // Get all unique positions from the raw data
    const allPositions = [...new Set(rawCandidates.map(c => c.position))];
    
    // Update dynamically generated position counts based on *currently filtered* candidates
    allPositions.forEach(position => {
        const id = `count-pos-${position.replace(/\s/g, '-')}`;
        const countElement = document.getElementById(id);
        
        if (countElement) {
            // Count from the currently filtered 'candidates' array
            const count = candidates.filter(c => c.position === position).length;
            countElement.textContent = count;
        }
    });


    // 2. Score Counts (always based on the current 'candidates' list for filter visibility)
    let scoreCounts = { '90+': 0, '80-89': 0, '70-79': 0, '<70': 0 };
    candidates.forEach(c => {
        const score = c.score;
        if (score >= 90) scoreCounts['90+']++;
        else if (score >= 80) scoreCounts['80-89']++;
        else if (score >= 70) scoreCounts['70-79']++;
        else scoreCounts['<70']++;
    });

    // Update static score counts
    
}


/**
 * Dynamically populates the Position checkboxes.
 */
function populatePositionFilter() {
    // Get all unique positions from the master list (rawCandidates)
    const positions = [...new Set(rawCandidates.map(c => c.position))].sort();
    positionCheckboxesContainer.innerHTML = ''; // Clear previous options

    positions.forEach(position => {
        const uniqueId = position.replace(/\s/g, '-');
        const label = document.createElement('label');
        label.className = 'flex items-center space-x-2 text-sm text-gray-300 hover:text-white cursor-pointer transition';
        label.innerHTML = `
            <input type="checkbox" name="positionFilter" value="${position}" class="form-checkbox">
            <span>${position}</span>
            <span class="text-xs text-gray-500 ml-auto">(<span id="count-pos-${uniqueId}">0</span>)</span>
        `;
        positionCheckboxesContainer.appendChild(label);
    });

    // Call after populating to update counts
    updateFilterCounts();
}

let rawCandidates = [];  // Will hold data from backend
let candidates = [];     // Filtered version

const candidateList = document.getElementById('candidateList');
const noResults = document.getElementById('noResults');
const cardTemplate = document.getElementById('cardTemplate');

// ===== Helper Functions =====
function getScoreColor(score) {
    if (!score) return 'bg-gray-600 text-white';
    if (score >= 18) return 'bg-green-500 text-white';
    if (score >= 15) return 'bg-yellow-500 text-white';
    if (score >= 10) return 'bg-blue-500 text-white';
    return 'bg-red-500 text-white';
}

function formatStatus(status) {
    if (!status) return 'Pending';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

// ===== Render Candidate Cards from Backend Data =====
function renderCandidates() {
    candidateList.innerHTML = '';

    if (rawCandidates.length === 0) {
        noResults.classList.remove('hidden');
        return;
    }

    noResults.classList.add('hidden');

    rawCandidates.forEach(candidate => {
        const templateContent = cardTemplate.content.cloneNode(true);
        const card = templateContent.querySelector('.card');

        // Click to open modal (uses candidateId from backend)
        card.dataset.id = candidate.candidateId;

        // Name
        card.querySelector('.name').textContent = candidate.candidateName || 'Unknown Candidate';

        // Position / Domain - fallback since not in current backend DTO
        const positionEl = card.querySelector('.position');
        positionEl.textContent = candidate.position || 'Software Engineer';

        // Score Pill
        const scorePill = card.querySelector('.score-pill');
        const score = candidate.totalScore ?? '—';
        scorePill.textContent = score;
        scorePill.className = `score-pill px-4 py-1.5 rounded-full font-bold text-sm shadow-md ${getScoreColor(candidate.totalScore)}`;

        // Replace checkbox + "Shortlist" with Status text
        const actionsLeft = card.querySelector('.flex.items-center.gap-2');
        const statusText = formatStatus(candidate.status);
        const statusColor = candidate.status === 'SHORTLISTED' 
            ? 'text-green-400' 
            : candidate.status === 'REJECTED' 
                ? 'text-red-400' 
                : 'text-yellow-400';

        actionsLeft.innerHTML = `
            <span class="text-sm font-medium text-gray-300">Status:</span>
            <span class="text-sm font-semibold ${statusColor}">${statusText}</span>
        `;

        // View Profile button with arrow
        card.querySelector('.view-btn').innerHTML = 
            `View Profile <i data-feather="arrow-right" class="w-4 h-4 inline ml-1"></i>`;

        candidateList.appendChild(templateContent);
    });

    // Re-initialize feather icons
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
}

// ===== Load Data from Backend + Update Stats + Render Cards =====
async function loadDashboardStats() {
    const jobId = localStorage.getItem('jobId');
    const token = localStorage.getItem('jwtToken');

    if (!jobId) {
        console.warn('No jobId found in localStorage');
        return;
    }

    // Loading states
    document.getElementById('totalCount').textContent = '...';
    document.getElementById('shortlistCount').textContent = '...';
    document.getElementById('avgScore').textContent = '...';
    candidateList.innerHTML = '<div class="col-span-full text-center py-16 text-gray-500">Loading candidates...</div>';

    const baseUrl = CONFIG.API_BASE_URL.replace('/auth', '');
    const url = `${baseUrl}/dashboard/${jobId}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();

        rawCandidates = data;
        candidates = [...data];

        // Update top stats
        const total = data.length;
        const shortlisted = data.filter(c => c.status?.toUpperCase() === 'SHORTLISTED').length;
        const validScores = data.filter(c => c.totalScore != null);
        const avg = validScores.length > 0 
            ? (validScores.reduce((sum, c) => sum + c.totalScore, 0) / validScores.length).toFixed(1)
            : '0.0';

        document.getElementById('totalCount').textContent = total;
        document.getElementById('shortlistCount').textContent = shortlisted;
        document.getElementById('avgScore').textContent = avg;

        // Render cards
        renderCandidates();

    } catch (error) {
        console.error('Failed to load dashboard:', error);
        candidateList.innerHTML = '<div class="col-span-full text-center py-16 text-red-400">Failed to load candidates</div>';
        document.getElementById('totalCount').textContent = '—';
        document.getElementById('shortlistCount').textContent = '—';
        document.getElementById('avgScore').textContent = '—';
    }
}

document.getElementById('exportBtn').addEventListener('click', () => {
    if (candidates.length === 0) {
        alert("No data available to export.");
        return;
    }

    // Define CSV Headers
    const headers = ["Name", "Position", "Total Score", "Status"];
    
    // Map candidate data to rows
    const rows = candidates.map(c => [
        `"${c.candidateName || c.name}"`, 
        `"${c.position}"`, 
        c.totalScore || c.score, 
        c.status
    ]);

    // Construct CSV content
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Candidate_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});
document.getElementById('downloadSelectedBtn').addEventListener('click', () => {
    // Check if any candidates are filtered
    if (candidates.length === 0) {
        alert("No candidates selected to download.");
        return;
    }

    // Logic: If you have resume URLs in your data, you can open them in new tabs
    // Or, trigger a print-friendly summary of the current list
    const confirmDownload = confirm(`Prepare batch summary for ${candidates.length} candidates?`);
    
    if (confirmDownload) {
        // Simple implementation: Open the browser print dialog for the candidate list
        window.print();
    }
});
/**
 * Filters and sorts the candidate list, then re-renders the cards.
 */
function applyFiltersAndSort() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
   
    
    // Get checked values from the new checkbox groups
    const selectedPositions = getCheckedValues('positionFilter');
    const selectedScores = getCheckedValues('scoreFilter');
    const selectedStatuses = getCheckedValues('statusFilter');

    // 1. Filtering
    candidates = rawCandidates.filter(candidate => {
        // Search Filter (Note: search still checks name and position, summary check removed)
        if (searchInput && 
            !candidate.name.toLowerCase().includes(searchInput) &&
            !candidate.position.toLowerCase().includes(searchInput)
        ) {
            return false;
        }

        // Position Filter (Multiselect)
        // If one or more positions are checked, the candidate must match one of them
        if (selectedPositions.length > 0 && !selectedPositions.includes(candidate.position)) {
            return false;
        }

        // Score Filter (Multiselect)
        if (selectedScores.length > 0) {
            let passesScore = false;
            const score = candidate.score;
            for (const range of selectedScores) {
                if (range === '90+' && score >= 90) { passesScore = true; break; }
                if (range === '80-89' && score >= 80 && score <= 89) { passesScore = true; break; }
                if (range === '70-79' && score >= 70 && score <= 79) { passesScore = true; break; }
                if (range === '<70' && score < 70) { passesScore = true; break; }
            }
            if (!passesScore) return false;
        }

        // Status Filter (Multiselect)
        if (selectedStatuses.length > 0 && !selectedStatuses.includes(candidate.status)) {
            return false;
        }

        return true;
    });

   

    // 3. Rendering
    renderCandidateCards(candidates);
    updateSummaryStats();
    updateFilterCounts(); // Re-run to update counts based on new filtered list
}

/**
 * Renders the candidate cards to the DOM.
 */
function renderCandidateCards(candidateArray) {
    candidateList.innerHTML = '';
    const template = document.getElementById('cardTemplate');

    if (candidateArray.length === 0) {
        noResults.classList.remove('hidden');
    } else {
        noResults.classList.add('hidden');
        candidateArray.forEach(candidate => {
            const clone = template.content.cloneNode(true);
            const card = clone.querySelector('.card');
            
            // Set data ID for modal
            card.dataset.id = candidate.id;

            // Set content
            clone.querySelector('.name').textContent = candidate.name;
            clone.querySelector('.position').textContent = candidate.position;
            

            // Score Pill Styling
            const scorePill = clone.querySelector('.score-pill');
            scorePill.textContent = candidate.score;
            if (candidate.score >= 90) scorePill.className += ' bg-green-500 text-white';
            else if (candidate.score >= 80) scorePill.className += ' bg-yellow-500 text-gray-900';
            else if (candidate.score >= 70) scorePill.className += ' bg-blue-500 text-white';
            else scorePill.className += ' bg-red-500 text-white';

            // Status/Shortlist Styling
            if (candidate.status === 'shortlisted') {
                card.classList.add('shortlisted');
                clone.querySelector('.shortlistCheckbox').checked = true;
            } else {
                clone.querySelector('.shortlistCheckbox').checked = false;
            }
            
            // Add event listener to checkbox for status update
            const checkbox = clone.querySelector('.shortlistCheckbox');
            checkbox.dataset.id = candidate.id; // Store ID on checkbox
            checkbox.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent card click event from firing
                toggleShortlist(parseInt(e.target.dataset.id), e.target.checked);
            });
            
            candidateList.appendChild(clone);
        });
        // Re-run feather icons for the new cards
        feather.replace();
    }
}

/**
 * Updates the summary statistics at the top of the dashboard.
 */
function updateSummaryStats() {
    const totalCount = rawCandidates.length;
    const shortlistedCount = rawCandidates.filter(c => c.status === 'shortlisted').length;
    const avgScore = totalCount > 0 
        ? (rawCandidates.reduce((sum, c) => sum + c.score, 0) / totalCount).toFixed(1)
        : 0;
    
    // Removed the avgExp calculation line

    document.getElementById('totalCount').textContent = totalCount;
    document.getElementById('shortlistCount').textContent = shortlistedCount;
    document.getElementById('avgScore').textContent = avgScore;
    
    // DELETE OR COMMENT OUT THE LINE BELOW:
    // document.getElementById('avgExp').textContent = `${avgExp} Yrs`; 
}
/**
 * Toggles the shortlist status of a candidate and updates the UI.
 * @param {number} id - The ID of the candidate.
 * @param {boolean} isShortlisted - The new status.
 */
function toggleShortlist(id, isShortlisted) {
    const candidate = rawCandidates.find(c => c.id === id);
    if (candidate) {
        candidate.status = isShortlisted ? 'shortlisted' : 'consider';
        
        // Re-run filters and rendering to apply new status styles and update counts
        applyFiltersAndSort();
    }
}


// ===== Modal and Chart Logic (No Change, but included for completeness) =====

function showDetailModal(id) {
    const candidate = candidates.find(c => c.id === parseInt(id));
    if (!candidate) return;

    // Destroy previous chart instance to avoid conflicts
    if (atsChartInstance) {
        atsChartInstance.destroy();
    }

    // Populate Modal Details
    document.getElementById('modalName').textContent = candidate.name;
    document.getElementById('modalPosition').textContent = candidate.position;
    document.getElementById('modalScore').textContent = candidate.score;
    document.getElementById('modalExp').textContent = `${candidate.experience} yrs`;

    // Status button updates
    const shortlistBtn = document.getElementById('modalShortlist');
    const rejectBtn = document.getElementById('modalReject');

    if (candidate.status === 'shortlisted') {
        shortlistBtn.textContent = 'Shortlisted (Undo)';
        shortlistBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
        shortlistBtn.classList.add('bg-gray-600', 'hover:bg-gray-700');
        rejectBtn.disabled = true;
    } else if (candidate.status === 'rejected') {
        rejectBtn.textContent = 'Rejected (Undo)';
        rejectBtn.classList.remove('bg-red-600', 'hover:bg-red-700');
        rejectBtn.classList.add('bg-gray-600', 'hover:bg-gray-700');
        shortlistBtn.disabled = true;
    } else { // consider
        shortlistBtn.textContent = 'Shortlist';
        shortlistBtn.classList.add('bg-green-600', 'hover:bg-green-700');
        shortlistBtn.classList.remove('bg-gray-600', 'hover:bg-gray-700');
        shortlistBtn.disabled = false;
        
        rejectBtn.textContent = 'Reject Candidate';
        rejectBtn.classList.add('bg-red-600', 'hover:bg-red-700');
        rejectBtn.classList.remove('bg-gray-600', 'hover:bg-gray-700');
        rejectBtn.disabled = false;
    }

    // Modal button listeners (remove previous and add new ones)
    shortlistBtn.onclick = () => {
        const newStatus = candidate.status === 'shortlisted' ? 'consider' : 'shortlisted';
        toggleShortlist(candidate.id, newStatus === 'shortlisted');
        showDetailModal(candidate.id); // Re-render modal state
    };
    rejectBtn.onclick = () => {
        const newStatus = candidate.status === 'rejected' ? 'consider' : 'rejected';
        rawCandidates.find(c => c.id === candidate.id).status = newStatus;
        applyFiltersAndSort();
        showDetailModal(candidate.id); // Re-render modal state
    };


    // Create/Update ATS Chart (Radar Chart)
    const atsData = candidate.atsBreakdown || {keywords: 70, format: 80, length: 75};

    atsChartInstance = new Chart(atsChartCtx, {
        type: 'radar',
        data: {
            labels: ['Keywords Match', 'Format & Structure', 'Resume Length'],
            datasets: [{
                label: 'ATS Match Score (%)',
                data: [atsData.keywords, atsData.format, atsData.length],
                fill: true,
                backgroundColor: 'rgba(74, 108, 247, 0.2)', // brand-primary/20
                borderColor: '#4a6cf7', // brand-primary
                pointBackgroundColor: '#6dd3ff', // brand-accent
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#4a6cf7'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    pointLabels: { color: '#bbb' },
                    suggestedMin: 0,
                    suggestedMax: 100,
                    ticks: {
                        color: '#999',
                        backdropColor: '#1a1f2d', // card background
                        stepSize: 20
                    }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(26, 31, 45, 0.9)', // bg-brand-card
                    titleColor: '#fff',
                    bodyColor: '#ddd',
                    borderColor: '#4a6cf7',
                    borderWidth: 1,
                    cornerRadius: 6,
                }
            }
        }
    });

    // Show modal
    detailModal.classList.remove('hidden');
    feather.replace(); // Ensure icons in modal are rendered
}

// ===== Event Listeners and Initial Load =====

// Listener for all filter changes (NEW)
// Attaching one listener to the parent container is more efficient than three individual ones.
filterSidebar.addEventListener('change', (e) => {
    // Only trigger if a checkbox is changed
    if (e.target.type === 'checkbox' || e.target.id === 'searchInput' && e.type === 'input') {
        applyFiltersAndSort();
    }
});

// Listener for search input (NEW)
document.getElementById('searchInput').addEventListener('input', applyFiltersAndSort);

// Listener for sort dropdown (UNCHANGED)


// LIST OF ALL POTENTIAL POSITIONS FOR THE RANDOM GENERATOR (UPDATED)
const allPositions = [
    "Frontend Developer", 
    "Backend Developer", 
    "Data Scientist", 
    "Product Manager",
    "UI Engineer",
    "Marketing Specialist", 
    "Sales Manager",      
    "HR Analyst",         
    "Project Lead"        
];


// Add sample candidate (CLEANED UP - photo and aiSummary removed)



// ===== Scroll to Top Functionality (EXISTING) =====
const scrollTopBtn = document.getElementById('scrollTopBtn');

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Event listener to show/hide the button
window.addEventListener('scroll', () => {
    if (scrollTopBtn) { // Check if the button exists
        // Show button when page is scrolled down 400px
        if (window.scrollY > 400) {
            scrollTopBtn.classList.remove('translate-y-24', 'opacity-0');
            scrollTopBtn.classList.add('translate-y-0', 'opacity-100');
        } else {
            scrollTopBtn.classList.add('translate-y-24', 'opacity-0');
            scrollTopBtn.classList.remove('translate-y-0', 'opacity-100');
        }
    }
});


// ===== Initial Load =====
document.addEventListener('DOMContentLoaded', () => {
    // Populate the position checkboxes dynamically first
    populatePositionFilter();
    
    // Then apply filters and render initial list
    applyFiltersAndSort(); 

    loadDashboardStats();
    
});
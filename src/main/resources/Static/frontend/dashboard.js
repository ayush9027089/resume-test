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


// ===== Sample Data (CLEANED UP - photo and aiSummary removed) =====
let rawCandidates = [
  {id:1,name:"Sarah Johnson",position:"Frontend Developer",experience:5,score:94,skillsMatch:"28/30",status:"shortlisted", atsBreakdown: {keywords: 90, format: 95, length: 85}},
  {id:2,name:"Robert Kim",position:"Backend Developer",experience:6,score:91,skillsMatch:"29/30",status:"shortlisted", atsBreakdown: {keywords: 95, format: 85, length: 90}},
  {id:3,name:"UI Engineer",position:"UI Engineer",experience:4,score:87,skillsMatch:"25/30",status:"consider", atsBreakdown: {keywords: 88, format: 85, length: 86}},
  {id:4,name:"Lisa Thompson",position:"Frontend Developer",experience:4,score:84,skillsMatch:"26/30",status:"consider", atsBreakdown: {keywords: 80, format: 92, length: 80}},
  {id:5,name:"David Wilson",position:"Data Scientist",experience:7,score:82,skillsMatch:"24/30",status:"consider", atsBreakdown: {keywords: 90, format: 75, length: 85}},
  {id:6,name:"Emily Davis",position:"Data Scientist",experience:3,score:78,skillsMatch:"21/30",status:"consider", atsBreakdown: {keywords: 75, format: 80, length: 80}},
  {id:7,name:"Marcus Bell",position:"Product Manager",experience:8,score:75,skillsMatch:"19/30",status:"consider", atsBreakdown: {keywords: 70, format: 80, length: 75}},
  {id:8,name:"Anna Lee",position:"Backend Developer",experience:2,score:68,skillsMatch:"15/30",status:"rejected", atsBreakdown: {keywords: 60, format: 75, length: 70}},
  {id:9,name:"Chris Hall",position:"UI Engineer",experience:5,score:93,skillsMatch:"27/30",status:"shortlisted", atsBreakdown: {keywords: 95, format: 90, length: 95}},
  {id:10,name:"Jessica Green",position:"Data Scientist",experience:10,score:90,skillsMatch:"30/30",status:"shortlisted", atsBreakdown: {keywords: 92, format: 90, length: 88}},
  {id:11,name:"Kevin Smith",position:"Frontend Developer",experience:1,score:65,skillsMatch:"12/30",status:"rejected", atsBreakdown: {keywords: 55, format: 65, length: 75}},
  {id:12,name:"Olivia Rodriguez",position:"Product Manager",experience:6,score:85,skillsMatch:"25/30",status:"consider", atsBreakdown: {keywords: 80, format: 85, length: 90}},
  {id:13,name:"Thomas Young",position:"Backend Developer",experience:9,score:72,skillsMatch:"18/30",status:"consider", atsBreakdown: {keywords: 65, format: 78, length: 75}},
  {id:14,name:"Mia Brown",position:"UI Engineer",experience:3,score:79,skillsMatch:"23/30",status:"consider", atsBreakdown: {keywords: 70, format: 85, length: 82}},
  {id:15,name:"Noah Clark",position:"Product Manager",experience:5,score:88,skillsMatch:"27/30",status:"shortlisted", atsBreakdown: {keywords: 90, format: 85, length: 90}},
  {id:16,name:"Sophie White",position:"Frontend Developer",experience:7,score:80,skillsMatch:"24/30",status:"consider", atsBreakdown: {keywords: 85, format: 70, length: 85}},
  {id:17,name:"Ethan King",position:"Backend Developer",experience:4,score:60,skillsMatch:"10/30",status:"rejected", atsBreakdown: {keywords: 50, format: 60, length: 70}},
  {id:18,name:"Chloe Martinez",position:"Data Scientist",experience:2,score:70,skillsMatch:"18/30",status:"consider", atsBreakdown: {keywords: 65, format: 75, length: 70}},
  {id:19,name:"Ryan Perez",position:"UI Engineer",experience:6,score:89,skillsMatch:"26/30",status:"shortlisted", atsBreakdown: {keywords: 90, format: 90, length: 87}},
  {id:20,name:"Zoe Taylor",position:"Frontend Developer",experience:3,score:74,skillsMatch:"20/30",status:"consider", atsBreakdown: {keywords: 75, format: 70, length: 80}},
  {id:21,name:"Ben Carter",position:"Marketing Specialist",experience:4,score:81,skillsMatch:"22/30",status:"consider", atsBreakdown: {keywords: 80, format: 85, length: 78}},
  {id:22,name:"Diana Ross",position:"Sales Manager",experience:9,score:76,skillsMatch:"20/30",status:"consider", atsBreakdown: {keywords: 75, format: 70, length: 83}},
  {id:23,name:"Henry Adams",position:"HR Analyst",experience:3,score:71,skillsMatch:"17/30",status:"rejected", atsBreakdown: {keywords: 65, format: 75, length: 73}},
  {id:24,name:"Ivy Lin",position:"Project Lead",experience:8,score:92,skillsMatch:"29/30",status:"shortlisted", atsBreakdown: {keywords: 95, format: 90, length: 91}},
  {id:25,name:"Jack Miller",position:"Data Scientist",experience:5,score:86,skillsMatch:"25/30",status:"consider", atsBreakdown: {keywords: 88, format: 82, length: 85}},
];

// Reassign to `candidates` for filtering operations
let candidates = [...rawCandidates];

// DOM elements
const candidateList = document.getElementById('candidateList');
const sortSelect = document.getElementById('sortSelect');
const noResults = document.getElementById('noResults');
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
    document.getElementById('count-90').textContent = scoreCounts['90+'];
    document.getElementById('count-80-89').textContent = scoreCounts['80-89'];
    document.getElementById('count-70-79').textContent = scoreCounts['70-79'];
    document.getElementById('count-lt70').textContent = scoreCounts['<70'];
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


/**
 * Filters and sorts the candidate list, then re-renders the cards.
 */
function applyFiltersAndSort() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const sortValue = sortSelect.value;
    
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

    // 2. Sorting
    candidates.sort((a, b) => {
        switch (sortValue) {
            case 'score_desc': return b.score - a.score;
            case 'score_asc': return a.score - b.score;
            case 'experience_desc': return b.experience - a.experience;
            case 'experience_asc': return a.experience - b.experience;
            default: return b.score - a.score;
        }
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
            clone.querySelector('.exp').textContent = `${candidate.experience} yrs`;
            clone.querySelector('.skills').textContent = candidate.skillsMatch;

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
    const avgExp = totalCount > 0 
        ? (rawCandidates.reduce((sum, c) => sum + c.experience, 0) / totalCount).toFixed(1)
        : 0;

    document.getElementById('totalCount').textContent = totalCount;
    document.getElementById('shortlistCount').textContent = shortlistedCount;
    document.getElementById('avgScore').textContent = avgScore;
    document.getElementById('avgExp').textContent = `${avgExp} Yrs`;
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
sortSelect.addEventListener('change', applyFiltersAndSort);

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
document.getElementById('addCandidates').addEventListener('click', () => {
  const nextId = rawCandidates.length ? Math.max(...rawCandidates.map(x => x.id)) + 1 : 1;
  const sample = {
    id: nextId,
    name: `New Candidate ${nextId}`,
    position: allPositions[Math.floor(Math.random() * allPositions.length)], // Use expanded list
    experience: Math.floor(Math.random() * 7) + 1,
    score: Math.floor(Math.random() * 30) + 60,
    skillsMatch: `${Math.floor(Math.random() * 10) + 15}/30`,
    status: "consider",
    atsBreakdown: {keywords: Math.floor(Math.random() * 30) + 60, format: Math.floor(Math.random() * 30) + 60, length: Math.floor(Math.random() * 30) + 60}
  };
  rawCandidates.push(sample);
  // Re-run the initial population/filter to include the new position/candidate
  populatePositionFilter(); 
  applyFiltersAndSort(); 
});


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
});
feather.replace();

// ===== Login/Signup Functionality =====
const loginPopup = document.getElementById('loginPopup');
const signupPopup = document.getElementById('signupPopup');
const overlay = document.getElementById('overlay');

function toggleModal(modalId, show) {
    const modal = document.getElementById(modalId);
    if (!modal || !overlay) return;

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
        }, 300);
    }
}

function closePopup() {
    toggleModal('loginPopup', false);
    toggleModal('signupPopup', false);
}

function openLogin(isSwitch = false) {
    if (isSwitch) {
        toggleModal('signupPopup', false);
        setTimeout(() => toggleModal('loginPopup', true), 100); 
    } else {
        toggleModal('loginPopup', true);
    }
}

async function handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const requestBody = { email, password };

    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('jwtToken', data.token); // Store token for API calls
            window.location.href = "dashboard.html"; 
        } else {
            const errorMessage = await response.text();
            alert("Login Failed: " + errorMessage);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

// ===== DATA HANDLING (REPLACING SAMPLE DATA) =====

let rawCandidates = []; // Initially empty
let candidates = [];

/**
 * Fetches real candidate data from the recruiter backend
 */
async function fetchCandidates() {
    const token = localStorage.getItem('jwtToken'); // Retrieve stored token
    
    if (!token) {
        alert("Authentication required. Please login.");
        openLogin();
        return;
    }

    try {
        // Assuming your backend endpoint is /candidates
        const response = await fetch(`${CONFIG.API_BASE_URL}/candidates`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            rawCandidates = await response.json();
            candidates = [...rawCandidates];
            populatePositionFilter();
            applyFiltersAndSort();
        } else if (response.status === 401) {
            alert("Session expired. Please login again.");
            localStorage.removeItem('jwtToken');
            openLogin();
        }
    } catch (error) {
        console.error("Error fetching candidates:", error);
    }
}

// DOM elements
const candidateList = document.getElementById('candidateList');
const sortSelect = document.getElementById('sortSelect');
const noResults = document.getElementById('noResults');
const detailModal = document.getElementById('detailModal');
const atsChartCtx = document.getElementById('atsChart');
const positionCheckboxesContainer = document.getElementById('positionCheckboxes');
const filterSidebar = document.getElementById('filterSidebar');

let atsChartInstance = null;

function getCheckedValues(name) {
    const checkboxes = document.querySelectorAll(`input[name="${name}"]:checked`);
    return Array.from(checkboxes).map(cb => cb.value);
}

function updateFilterCounts() {
    const allPositions = [...new Set(rawCandidates.map(c => c.position))];
    allPositions.forEach(position => {
        const id = `count-pos-${position.replace(/\s/g, '-')}`;
        const countElement = document.getElementById(id);
        if (countElement) {
            const count = candidates.filter(c => c.position === position).length;
            countElement.textContent = count;
        }
    });

    let scoreCounts = { '90+': 0, '80-89': 0, '70-79': 0, '<70': 0 };
    candidates.forEach(c => {
        const score = c.score;
        if (score >= 90) scoreCounts['90+']++;
        else if (score >= 80) scoreCounts['80-89']++;
        else if (score >= 70) scoreCounts['70-79']++;
        else scoreCounts['<70']++;
    });

    document.getElementById('count-90').textContent = scoreCounts['90+'];
    document.getElementById('count-80-89').textContent = scoreCounts['80-89'];
    document.getElementById('count-70-79').textContent = scoreCounts['70-79'];
    document.getElementById('count-lt70').textContent = scoreCounts['<70'];
}

function populatePositionFilter() {
    const positions = [...new Set(rawCandidates.map(c => c.position))].sort();
    positionCheckboxesContainer.innerHTML = ''; 
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
    updateFilterCounts();
}

function applyFiltersAndSort() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const sortValue = sortSelect.value;
    const selectedPositions = getCheckedValues('positionFilter');
    const selectedScores = getCheckedValues('scoreFilter');
    const selectedStatuses = getCheckedValues('statusFilter');

    candidates = rawCandidates.filter(candidate => {
        if (searchInput && !candidate.name.toLowerCase().includes(searchInput) && !candidate.position.toLowerCase().includes(searchInput)) return false;
        if (selectedPositions.length > 0 && !selectedPositions.includes(candidate.position)) return false;
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
        if (selectedStatuses.length > 0 && !selectedStatuses.includes(candidate.status)) return false;
        return true;
    });

    candidates.sort((a, b) => {
        switch (sortValue) {
            case 'score_desc': return b.score - a.score;
            case 'score_asc': return a.score - b.score;
            case 'experience_desc': return b.experience - a.experience;
            case 'experience_asc': return a.experience - b.experience;
            default: return b.score - a.score;
        }
    });

    renderCandidateCards(candidates);
    updateSummaryStats();
    updateFilterCounts();
}

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
            card.dataset.id = candidate.id;
            clone.querySelector('.name').textContent = candidate.name;
            clone.querySelector('.position').textContent = candidate.position;
            clone.querySelector('.exp').textContent = `${candidate.experience} yrs`;
            clone.querySelector('.skills').textContent = candidate.skillsMatch;

            const scorePill = clone.querySelector('.score-pill');
            scorePill.textContent = candidate.score;
            if (candidate.score >= 90) scorePill.className += ' bg-green-500 text-white';
            else if (candidate.score >= 80) scorePill.className += ' bg-yellow-500 text-gray-900';
            else if (candidate.score >= 70) scorePill.className += ' bg-blue-500 text-white';
            else scorePill.className += ' bg-red-500 text-white';

            if (candidate.status === 'shortlisted') {
                card.classList.add('shortlisted');
                clone.querySelector('.shortlistCheckbox').checked = true;
            }
            
            const checkbox = clone.querySelector('.shortlistCheckbox');
            checkbox.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleShortlist(parseInt(candidate.id), e.target.checked);
            });
            candidateList.appendChild(clone);
        });
        feather.replace();
    }
}

function updateSummaryStats() {
    const totalCount = rawCandidates.length;
    const shortlistedCount = rawCandidates.filter(c => c.status === 'shortlisted').length;
    const avgScore = totalCount > 0 ? (rawCandidates.reduce((sum, c) => sum + c.score, 0) / totalCount).toFixed(1) : 0;
    const avgExp = totalCount > 0 ? (rawCandidates.reduce((sum, c) => sum + c.experience, 0) / totalCount).toFixed(1) : 0;

    document.getElementById('totalCount').textContent = totalCount;
    document.getElementById('shortlistCount').textContent = shortlistedCount;
    document.getElementById('avgScore').textContent = avgScore;
    document.getElementById('avgExp').textContent = `${avgExp} Yrs`;
}

async function toggleShortlist(id, isShortlisted) {
    const token = localStorage.getItem('jwtToken');
    const newStatus = isShortlisted ? 'shortlisted' : 'consider';

    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/candidates/${id}/status`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            const candidate = rawCandidates.find(c => c.id === id);
            if (candidate) candidate.status = newStatus;
            applyFiltersAndSort();
        }
    } catch (error) {
        console.error("Error updating status:", error);
    }
}

function showDetailModal(id) {
    const candidate = rawCandidates.find(c => c.id === parseInt(id));
    if (!candidate) return;

    if (atsChartInstance) atsChartInstance.destroy();

    document.getElementById('modalName').textContent = candidate.name;
    document.getElementById('modalPosition').textContent = candidate.position;
    document.getElementById('modalScore').textContent = candidate.score;
    document.getElementById('modalExp').textContent = `${candidate.experience} yrs`;

    const atsData = candidate.atsBreakdown || {keywords: 70, format: 80, length: 75};
    atsChartInstance = new Chart(atsChartCtx, {
        type: 'radar',
        data: {
            labels: ['Keywords Match', 'Format & Structure', 'Resume Length'],
            datasets: [{
                label: 'ATS Match Score (%)',
                data: [atsData.keywords, atsData.format, atsData.length],
                fill: true,
                backgroundColor: 'rgba(74, 108, 247, 0.2)',
                borderColor: '#4a6cf7',
                pointBackgroundColor: '#6dd3ff',
                pointBorderColor: '#fff',
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { r: { suggestedMin: 0, suggestedMax: 100 } }
        }
    });

    detailModal.classList.remove('hidden');
    feather.replace();
}

// ===== Initial Load =====
document.addEventListener('DOMContentLoaded', () => {
    fetchCandidates(); // Load real data on startup
});

filterSidebar.addEventListener('change', (e) => {
    if (e.target.type === 'checkbox') applyFiltersAndSort();
});
document.getElementById('searchInput').addEventListener('input', applyFiltersAndSort);
sortSelect.addEventListener('change', applyFiltersAndSort);
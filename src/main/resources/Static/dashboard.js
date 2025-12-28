//  feather.replace();

// // ===== Login/Signup (Kept Simple) =====
// const loginPopup = document.getElementById('loginPopup');
// const signupPopup = document.getElementById('signupPopup');
// const overlay = document.getElementById('overlay');

// function toggleModal(modalId, show) {
//     const modal = document.getElementById(modalId);
//     if (!modal || !overlay) return;

//     if (show) {
//         overlay.classList.remove('hidden');
//         setTimeout(() => overlay.classList.add('opacity-100'), 10);
//         modal.classList.remove('hidden');
//         setTimeout(() => {
//             modal.classList.remove('scale-90', 'opacity-0');
//             modal.classList.add('scale-100', 'opacity-100');
//         }, 10);
//     } else {
//         overlay.classList.remove('opacity-100');
//         modal.classList.remove('scale-100', 'opacity-100');
//         modal.classList.add('scale-90', 'opacity-0');
//         setTimeout(() => {
//             overlay.classList.add('hidden');
//             modal.classList.add('hidden');
//         }, 300);
//     }
// }

// function closePopup() {
//     toggleModal('loginPopup', false);
//     toggleModal('signupPopup', false);
// }

// function openLogin(isSwitch = false) {
//     if (isSwitch) {
//         toggleModal('signupPopup', false);
//         setTimeout(() => toggleModal('loginPopup', true), 100);
//     } else {
//         toggleModal('loginPopup', true);
//     }
// }

// function openSignup(isSwitch = false) {
//     if (isSwitch) {
//         toggleModal('loginPopup', false);
//         setTimeout(() => toggleModal('signupPopup', true), 100);
//     } else {
//         toggleModal('signupPopup', true);
//     }
// }

// async function handleLogin() {
//     const email = document.getElementById('login-email').value.trim();
//     const password = document.getElementById('login-password').value;
//     if (!email || !password) return alert("Fill email and password");

//     try {
//         const response = await fetch(`${CONFIG.API_BASE_URL}/login`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ email, password })
//         });

//         if (response.ok) {
//             const data = await response.json();
//             localStorage.setItem('jwtToken', data.token);
//             alert("Login successful!");
//             window.location.href = "profile.html";
//         } else {
//             alert("Login failed: " + await response.text());
//         }
//     } catch (e) {
//         alert("Network error");
//     }
// }

// async function handleSignup() {
//     const name = document.getElementById('signup-name').value.trim();
//     const email = document.getElementById('signup-email').value.trim();
//     const password = document.getElementById('signup-password').value;
//     if (!name || !email || !password) return alert("Fill all fields");

//     try {
//         const response = await fetch(`${CONFIG.API_BASE_URL}/register`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ name, email, password })
//         });

//         if (response.ok) {
//             alert("Registration successful! Please login.");
//             closePopup();
//             openLogin();
//         } else {
//             alert("Signup failed: " + await response.text());
//         }
//     } catch (e) {
//         alert("Network error");
//     }
// }

// // ===== Dashboard Core =====
// let rawCandidates = [];
// const candidateList = document.getElementById('candidateList');
// const noResults = document.getElementById('noResults');
// const cardTemplate = document.getElementById('cardTemplate');

// function getScoreColor(score) {
//     if (!score) return 'bg-gray-600 text-white';
//     if (score >= 18) return 'bg-green-500 text-white';
//     if (score >= 15) return 'bg-yellow-500 text-white';
//     if (score >= 10) return 'bg-blue-500 text-white';
//     return 'bg-red-500 text-white';
// }

// function formatStatus(status) {
//     if (!status) return 'Pending';
//     const s = status.toUpperCase();
//     return s === 'SHORTLISTED' ? 'Shortlisted' : s === 'REJECTED' ? 'Rejected' : 'Pending';
// }

// function renderCandidates() {
//     candidateList.innerHTML = '';
//     if (rawCandidates.length === 0) {
//         noResults.classList.remove('hidden');
//         return;
//     }
//     noResults.classList.add('hidden');

//     const search = document.getElementById('searchInput').value.toLowerCase();
//     const checkedStatuses = Array.from(document.querySelectorAll('input[name="statusFilter"]:checked'))
//         .map(cb => cb.value.toUpperCase());

//     const filtered = rawCandidates.filter(c => {
//         if (search && !(c.candidateName || '').toLowerCase().includes(search)) return false;

//         if (checkedStatuses.length > 0) {
//             const status = (c.status || 'PENDING').toUpperCase();
//             const norm = status === 'SHORTLISTED' ? 'SHORTLISTED' :
//                         status === 'REJECTED' ? 'REJECTED' : 'PENDING';
//             if (!checkedStatuses.includes(norm)) return false;
//         }
//         return true;
//     });

//     filtered.forEach(candidate => {
//     const clone = cardTemplate.content.cloneNode(true);

//     clone.querySelector('.name').textContent = candidate.candidateName || 'Unknown Candidate';

//     // NEW: Use stored job department/title
//     const jobDept = localStorage.getItem('activeJobDept') || 'Position Not Specified';
//     clone.querySelector('.position').textContent = jobDept;

//     const scorePill = clone.querySelector('.score-pill');
//     scorePill.textContent = candidate.totalScore ?? '—';
//     scorePill.className = `score-pill px-4 py-1.5 rounded-full font-bold text-sm shadow-md ${getScoreColor(candidate.totalScore)}`;

//     const statusEl = clone.querySelector('.status-text');
//     const statusText = formatStatus(candidate.status);
//     const statusColor = candidate.status === 'SHORTLISTED' ? 'text-green-400' :
//                        candidate.status === 'REJECTED' ? 'text-red-400' : 'text-yellow-400';
//     statusEl.textContent = statusText;
//     statusEl.className = `status-text text-sm font-semibold ${statusColor}`;

//     candidateList.appendChild(clone);
// });
//     feather.replace();
// }

// async function loadDashboardStats() {
//     const jobId = localStorage.getItem('jobId');
//     const token = localStorage.getItem('jwtToken');
//     if (!jobId) return alert("No job selected");

//     document.getElementById('totalCount').textContent = '...';
//     document.getElementById('shortlistCount').textContent = '...';
//     document.getElementById('avgScore').textContent = '...';

//     try {
//         const response = await fetch(`${CONFIG.API_BASE_URL.replace('/auth', '')}/dashboard/${jobId}`, {
//             headers: { 'Authorization': `Bearer ${token}` }
//         });
//         if (!response.ok) throw new Error();

//         const data = await response.json();
//         rawCandidates = data;

//         const total = data.length;
//         const shortlisted = data.filter(c => c.status?.toUpperCase() === 'SHORTLISTED').length;
//         const valid = data.filter(c => c.totalScore != null);
//         const avg = valid.length ? (valid.reduce((s, c) => s + c.totalScore, 0) / valid.length).toFixed(1) : '0.0';

//         document.getElementById('totalCount').textContent = total;
//         document.getElementById('shortlistCount').textContent = shortlisted;
//         document.getElementById('avgScore').textContent = avg;

//         renderCandidates();
//     } catch (e) {
//         alert("Failed to load candidates");
//     }
// }

// // Export CSV (Kept as is)
// document.getElementById('exportBtn').addEventListener('click', () => {
//     if (rawCandidates.length === 0) return alert("No data to export");

//     // Get the job department/title from localStorage (same as in cards)
//     const jobDept = localStorage.getItem('activeJobDept') || 'Position Not Specified';

//     const headers = ["S.NO", "Name", "Position", "Total Score", "Status"];
//     const rows = rawCandidates.map((c, index) => [
//         index + 1,  // Serial number
//         c.candidateName || 'Unknown',
//         jobDept,  // Use the same job title for ALL rows
//         c.totalScore || '',
//         formatStatus(c.status)
//     ]);

//     let csv = headers.join(",") + "\n" + 
//               rows.map(r => r.map(f => `"${f}"`).join(",")).join("\n");

//     const blob = new Blob([csv], { type: 'text/csv' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `candidates_${new Date().toISOString().slice(0,10)}.csv`;
//     a.click();
//     URL.revokeObjectURL(url); // Clean up
// });
// // Batch Resume placeholder
// document.getElementById('downloadSelectedBtn').addEventListener('click', () => {
//     if (rawCandidates.length === 0) {
//         alert("No candidates to download.");
//         return;
//     }

//     const confirmDownload = confirm(`Prepare batch summary for ${rawCandidates.length} candidates?`);
    
//     if (confirmDownload) {
//         window.print(); // Opens print dialog with current candidate list
//     }
// });


// // Filters
// document.getElementById('searchInput').addEventListener('input', renderCandidates);
// document.getElementById('filterSidebar').addEventListener('change', renderCandidates);

// // Load on start
// document.addEventListener('DOMContentLoaded', loadDashboardStats);

feather.replace();

// ===== Login/Signup (Kept Simple) =====
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

function openSignup(isSwitch = false) {
    if (isSwitch) {
        toggleModal('loginPopup', false);
        setTimeout(() => toggleModal('signupPopup', true), 100);
    } else {
        toggleModal('signupPopup', true);
    }
}

// ===== Dashboard Core =====
let rawCandidates = [];
const candidateList = document.getElementById('candidateList');
const noResults = document.getElementById('noResults');
const cardTemplate = document.getElementById('cardTemplate');

function getScoreColor(score) {
    if (!score) return 'bg-gray-600 text-white';
    if (score >= 18) return 'bg-green-500 text-white';
    if (score >= 15) return 'bg-yellow-500 text-white';
    if (score >= 10) return 'bg-blue-500 text-white';
    return 'bg-red-500 text-white';
}

function formatStatus(status) {
    if (!status) return 'Pending';
    const s = status.toUpperCase();
    return s === 'SHORTLISTED' ? 'Shortlisted' : s === 'REJECTED' ? 'Rejected' : 'Pending';
}

function renderCandidates() {
    if (!candidateList) return;
    
    candidateList.innerHTML = '';
    if (rawCandidates.length === 0) {
        if (noResults) noResults.classList.remove('hidden');
        return;
    }
    if (noResults) noResults.classList.add('hidden');

    const searchInput = document.getElementById('searchInput');
    const search = searchInput ? searchInput.value.toLowerCase() : '';
    
    const checkedStatuses = Array.from(document.querySelectorAll('input[name="statusFilter"]:checked'))
        .map(cb => cb.value.toUpperCase());

    const filtered = rawCandidates.filter(c => {
        if (search && !(c.candidateName || '').toLowerCase().includes(search)) return false;

        if (checkedStatuses.length > 0) {
            const status = (c.status || 'PENDING').toUpperCase();
            const norm = status === 'SHORTLISTED' ? 'SHORTLISTED' :
                        status === 'REJECTED' ? 'REJECTED' : 'PENDING';
            if (!checkedStatuses.includes(norm)) return false;
        }
        return true;
    });

    if (!cardTemplate) return;

    filtered.forEach(candidate => {
        const clone = cardTemplate.content.cloneNode(true);
        const nameEl = clone.querySelector('.name');
        if (nameEl) nameEl.textContent = candidate.candidateName || 'Unknown Candidate';

        const jobDept = localStorage.getItem('activeJobDept') || 'Position Not Specified';
        const posEl = clone.querySelector('.position');
        if (posEl) posEl.textContent = jobDept;

        const scorePill = clone.querySelector('.score-pill');
        if (scorePill) {
            scorePill.textContent = candidate.totalScore ?? '—';
            scorePill.className = `score-pill px-4 py-1.5 rounded-full font-bold text-sm shadow-md ${getScoreColor(candidate.totalScore)}`;
        }

        const statusEl = clone.querySelector('.status-text');
        if (statusEl) {
            const statusText = formatStatus(candidate.status);
            const statusColor = candidate.status === 'SHORTLISTED' ? 'text-green-400' :
                               candidate.status === 'REJECTED' ? 'text-red-400' : 'text-yellow-400';
            statusEl.textContent = statusText;
            statusEl.className = `status-text text-sm font-semibold ${statusColor}`;
        }

        candidateList.appendChild(clone);
    });
    feather.replace();
}
async function loadDashboardStats() {
    const jobId = localStorage.getItem('activeJobId'); // Ensure 'activeJobId' use ho raha hai
    const token = localStorage.getItem('jwtToken');
    
    if (!jobId) {
        console.error("No active job found to fetch data.");
        return;
    }

    try {
        // API URL mein jobId filter sahi se pass ho raha hai ya nahi check karein
        const response = await fetch(`${CONFIG.API_BASE_URL.replace('/auth', '')}/dashboard/${jobId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        // ... rest of the code
    } catch (e) {
        console.error("Failed to load candidates", e);
    }
}

async function loadDashboardStats() {
    const jobId = localStorage.getItem('jobId');
    const token = localStorage.getItem('jwtToken');
    if (!jobId) return; // Silent return if no job selected

    // Basic UI Reset
    const elements = ['totalCount', 'shortlistCount', 'avgScore'];
    elements.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '...';
    });

    try {
        const response = await fetch(`${CONFIG.API_BASE_URL.replace('/auth', '')}/dashboard/${jobId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error();

        const data = await response.json();
        rawCandidates = data;

        const total = data.length;
        const shortlisted = data.filter(c => c.status?.toUpperCase() === 'SHORTLISTED').length;
        const valid = data.filter(c => c.totalScore != null);
        const avg = valid.length ? (valid.reduce((s, c) => s + c.totalScore, 0) / valid.length).toFixed(1) : '0.0';

        const tEl = document.getElementById('totalCount');
        const sEl = document.getElementById('shortlistCount');
        const aEl = document.getElementById('avgScore');

        if (tEl) tEl.textContent = total;
        if (sEl) sEl.textContent = shortlisted;
        if (aEl) aEl.textContent = avg;

        renderCandidates();
    } catch (e) {
        console.error("Dashboard Load Error:", e);
    }
}

// ===== Event Listeners with Safe Checks (Fixes the Error) =====
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial Load
    loadDashboardStats();

    // 2. Export Button
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            if (rawCandidates.length === 0) return alert("No data to export");
            const jobDept = localStorage.getItem('activeJobDept') || 'Position Not Specified';
            const headers = ["S.NO", "Name", "Position", "Total Score", "Status"];
            const rows = rawCandidates.map((c, index) => [
                index + 1,
                c.candidateName || 'Unknown',
                jobDept,
                c.totalScore || '',
                formatStatus(c.status)
            ]);
            let csv = headers.join(",") + "\n" + rows.map(r => r.map(f => `"${f}"`).join(",")).join("\n");
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `candidates_${new Date().toISOString().slice(0,10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        });
    }

    // 3. Download/Print Button
    const downloadBtn = document.getElementById('downloadSelectedBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            if (rawCandidates.length === 0) return alert("No candidates to download.");
            if (confirm(`Prepare batch summary for ${rawCandidates.length} candidates?`)) {
                window.print();
            }
        });
    }

    // 4. Search Input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', renderCandidates);
    }

    // 5. Sidebar Filters
    const filterSidebar = document.getElementById('filterSidebar');
    if (filterSidebar) {
        filterSidebar.addEventListener('change', renderCandidates);
    }
});
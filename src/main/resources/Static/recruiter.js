// DOM Elements
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
const clearFilesBtn = document.getElementById('clearFiles');
const processFilesBtn = document.getElementById('processFiles');
const resultsSection = document.getElementById('resultsSection');
const resultsTableBody = document.getElementById('resultsTableBody');
const exportCsvBtn = document.getElementById('exportCsv');
const shortlistBtn = document.getElementById('shortlistCandidates');
const logoutBtn = document.getElementById('logoutBtn');

// State
let uploadedFiles = [];
let processedCandidates = [];
let selectedSkills = new Set();

// Available skills for the skills selector
const availableSkills = [
    'JavaScript', 'React', 'HTML', 'CSS', 'Node.js', 'Python', 'Java', 'SQL',
    'MongoDB', 'Express', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'Git', 'REST API',
    'GraphQL', 'Redux', 'TypeScript', 'Angular', 'Vue.js', 'SASS', 'LESS', 'Bootstrap',
    'Tailwind CSS', 'jQuery', 'PHP', 'Laravel', 'Django', 'Flask', 'Spring', '.NET',
    'C#', 'C++', 'Ruby', 'Ruby on Rails', 'Swift', 'Kotlin', 'Go', 'Rust', 'Machine Learning',
    'Data Analysis', 'Data Visualization', 'Tableau', 'Power BI', 'Excel', 'R', 'TensorFlow',
    'PyTorch', 'NLP', 'Computer Vision', 'Deep Learning', 'Data Science', 'Big Data', 'Hadoop',
    'Spark', 'Kafka', 'Elasticsearch', 'Redis', 'PostgreSQL', 'MySQL', 'Oracle', 'MongoDB',
    'DynamoDB', 'Firebase', 'CI/CD', 'Jenkins', 'GitHub Actions', 'Terraform', 'Ansible',
    'Linux', 'Bash', 'Shell Scripting', 'Agile', 'Scrum', 'Jira', 'Confluence', 'Figma',
    'Sketch', 'Adobe XD', 'UI/UX Design', 'Responsive Design', 'Mobile Development',
    'iOS', 'Android', 'React Native', 'Flutter', 'Ionic', 'WordPress', 'Shopify', 'Magento'
].sort();

// Sample job positions (in a real app, this would come from an API)
const jobPositions = [
    { id: 'frontend', name: 'Frontend Developer', skills: ['JavaScript', 'React', 'HTML', 'CSS'] },
    { id: 'backend', name: 'Backend Developer', skills: ['Node.js', 'Python', 'Java', 'SQL'] },
    { id: 'fullstack', name: 'Full Stack Developer', skills: ['JavaScript', 'Node.js', 'React', 'Express', 'MongoDB'] }
];

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Set up event listeners
    setupEventListeners();
    
    // Check for any previously uploaded files (in a real app, this would come from a backend)
    const savedFiles = JSON.parse(localStorage.getItem('uploadedFiles')) || [];
    if (savedFiles.length > 0) {
        uploadedFiles = savedFiles;
        updateFileList();
    }
});

// Set up event listeners
function setupEventListeners() {
    // Drag and drop events
    if (dropZone) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, unhighlight, false);
        });

        dropZone.addEventListener('drop', handleDrop, false);
    }
    
    // File input change
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelect, false);
    }
    
    // Button clicks
    if (clearFilesBtn) clearFilesBtn.addEventListener('click', clearFiles);
    if (processFilesBtn) processFilesBtn.addEventListener('click', processFiles);
    if (exportCsvBtn) exportCsvBtn.addEventListener('click', exportToCsv);
    if (shortlistBtn) shortlistBtn.addEventListener('click', shortlistCandidates);
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    
    // Initialize job role and skills components
    initJobRoleSelector();
    initSkillsManager();
}

// Initialize job role selector
function initJobRoleSelector() {
    const jobRoleSelect = document.getElementById('jobRole');
    
    // Set up job role change event
    jobRoleSelect.addEventListener('change', function() {
        const selectedRole = this.value;
        // Here you can add logic to update skills based on job role if needed
        console.log('Selected job role:', selectedRole);
        
        // Example: Auto-populate skills based on job role
        // This is just an example - you can customize the skills for each role
        if (selectedRole === 'frontend') {
            const frontendSkills = ['JavaScript', 'React', 'HTML', 'CSS', 'Responsive Design'];
            updateSelectedSkills(new Set(frontendSkills));
        } else if (selectedRole === 'backend') {
            const backendSkills = ['Node.js', 'Python', 'Java', 'SQL', 'REST API'];
            updateSelectedSkills(new Set(backendSkills));
        } else if (selectedRole === 'fullstack') {
            const fullstackSkills = ['JavaScript', 'Node.js', 'React', 'Express', 'MongoDB'];
            updateSelectedSkills(new Set(fullstackSkills));
        } else if (selectedRole === 'data_scientist') {
            const dataScienceSkills = ['Python', 'Machine Learning', 'Data Analysis', 'SQL', 'TensorFlow'];
            updateSelectedSkills(new Set(dataScienceSkills));
        }
    });
}

// Initialize skills manager
function initSkillsManager() {
    const addSkillBtn = document.getElementById('addSkillBtn');
    const skillsDropdown = document.getElementById('skillsDropdown');
    const skillsList = document.getElementById('skillsList');
    const skillSearch = document.getElementById('skillSearch');
    const selectedSkillsContainer = document.getElementById('selectedSkills');
    const skillCounter = document.getElementById('skillCounter');
    
    // Populate skills list
    function populateSkillsList(filter = '') {
        skillsList.innerHTML = '';
        const filteredSkills = availableSkills.filter(skill => 
            skill.toLowerCase().includes(filter.toLowerCase())
        );
        
        filteredSkills.forEach(skill => {
            const skillItem = document.createElement('div');
            skillItem.className = `skill-item ${selectedSkills.has(skill) ? 'selected' : ''}`;
            skillItem.innerHTML = `
                <i class="fas fa-check check-icon"></i>
                <span>${skill}</span>
            `;
            
            skillItem.addEventListener('click', () => {
                toggleSkill(skill);
                renderSelectedSkills();
                renderSkillsList();
                closeSkillsDropdown();
            });
            
            skillsList.appendChild(skillItem);
        });
    }
    
    // Toggle skill selection
    function toggleSkill(skill) {
        if (selectedSkills.has(skill)) {
            selectedSkills.delete(skill);
        } else if (selectedSkills.size < 10) {
            selectedSkills.add(skill);
        }
        updateSkillCounter();
    }
    
    // Update skill counter
    function updateSkillCounter() {
        skillCounter.textContent = selectedSkills.size;
        if (selectedSkills.size >= 10) {
            skillCounter.parentElement.classList.add('limit-reached');
        } else {
            skillCounter.parentElement.classList.remove('limit-reached');
        }
    }
    
    // Render selected skills as tags
    function renderSelectedSkills() {
        selectedSkillsContainer.innerHTML = '';
        selectedSkills.forEach(skill => {
            const tag = document.createElement('div');
            tag.className = 'skill-tag';
            tag.innerHTML = `
                ${skill}
                <span class="remove-skill" data-skill="${skill}">&times;</span>
            `;
            selectedSkillsContainer.appendChild(tag);
        });
        
        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-skill').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const skill = btn.getAttribute('data-skill');
                selectedSkills.delete(skill);
                renderSelectedSkills();
                renderSkillsList();
                updateSkillCounter();
            });
        });
    }
    
    // Render skills list with current search filter
    function renderSkillsList() {
        const filter = skillSearch.value;
        populateSkillsList(filter);
    }
    
    // Toggle skills dropdown
    function toggleSkillsDropdown() {
        const willShow = !skillsDropdown.classList.contains('show');
        skillsDropdown.classList.toggle('show');
        skillsDropdown.style.display = willShow ? 'block' : 'none';
        if (willShow) {
            if (skillSearch) skillSearch.focus();
            renderSkillsList();
        }
    }

    // Helper: close dropdown
    function closeSkillsDropdown(clearSearch = true) {
        skillsDropdown.classList.remove('show');
        skillsDropdown.style.display = 'none';
        if (clearSearch) {
            skillSearch.value = '';
        }
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.skills-input-container')) {
            closeSkillsDropdown();
        }
    });
    
    // Event listeners
    addSkillBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleSkillsDropdown();
    });
    
    selectedSkillsContainer.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!skillsDropdown.classList.contains('show')) {
            toggleSkillsDropdown();
        }
    });
    
    skillSearch.addEventListener('input', () => {
        renderSkillsList();
    });
    
    skillSearch.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const query = skillSearch.value.trim().toLowerCase();
            const exact = availableSkills.find(s => s.toLowerCase() === query);
            const filtered = availableSkills.filter(s => s.toLowerCase().includes(query));
            const toAdd = exact || filtered[0];
            if (toAdd) {
                if (!selectedSkills.has(toAdd) && selectedSkills.size < 10) {
                    selectedSkills.add(toAdd);
                    updateSkillCounter();
                }
                renderSelectedSkills();
                renderSkillsList();
                closeSkillsDropdown();
            }
        }
    });
    
    // Initialize
    updateSkillCounter();
    renderSelectedSkills();
}

// Update selected skills
function updateSelectedSkills(skills) {
    selectedSkills = new Set([...skills]);
    
    // Update UI
    const selectedSkillsContainer = document.getElementById('selectedSkills');
    if (selectedSkillsContainer) {
        renderSelectedSkills();
        updateSkillCounter();
    }
}

// Prevent default drag and drop behavior
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Highlight drop zone when dragging files over it
function highlight() {
    dropZone.style.borderColor = '#4a6cf7';
    dropZone.style.backgroundColor = 'rgba(74, 108, 247, 0.1)';
}

// Remove highlight when leaving drop zone
function unhighlight() {
    dropZone.style.borderColor = '#ddd';
    dropZone.style.backgroundColor = 'transparent';
}

// Handle dropped files
function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

// Handle file selection via file input
function handleFileSelect(e) {
    const files = e.target.files;
    handleFiles(files);
}

// Process selected files
function handleFiles(files) {
    if (!files || files.length === 0) return;
    
    // Convert FileList to array and add to uploadedFiles
    Array.from(files).forEach(file => {
        // Check if file already exists
        const fileExists = uploadedFiles.some(f => f.name === file.name && f.size === file.size);
        
        // Check file type
        const fileType = file.name.split('.').pop().toLowerCase();
        const allowedTypes = ['pdf', 'doc', 'docx'];
        
        if (!allowedTypes.includes(fileType)) {
            alert(`Unsupported file type: ${file.name}. Please upload PDF, DOC, or DOCX files.`);
            return;
        }
        
        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert(`File too large: ${file.name}. Maximum file size is 10MB.`);
            return;
        }
        
        // Add file if it doesn't exist and we haven't reached the limit
        if (!fileExists && uploadedFiles.length < 20) {
            uploadedFiles.push(file);
        } else if (uploadedFiles.length >= 20) {
            alert('Maximum of 20 files allowed. Please remove some files before adding more.');
        }
    });
    
    // Update the file list display
    updateFileList();
    
    // Save to localStorage (in a real app, this would be an API call)
    saveFiles();
}

// Update the file list display
function updateFileList() {
    fileList.innerHTML = '';
    
    if (uploadedFiles.length === 0) {
        fileList.innerHTML = '<p>No files uploaded yet.</p>';
        return;
    }
    
    uploadedFiles.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <div class="file-info">
                <i class="fas fa-file-alt"></i>
                <span>${file.name} (${formatFileSize(file.size)})</span>
            </div>
            <div class="file-remove" data-index="${index}">
                <i class="fas fa-times"></i>
            </div>
        `;
        fileList.appendChild(fileItem);
    });
    
    // Add event listeners to remove buttons
    document.querySelectorAll('.file-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.currentTarget.getAttribute('data-index'));
            removeFile(index);
        });
    });
}

// Remove a file from the list
function removeFile(index) {
    uploadedFiles.splice(index, 1);
    updateFileList();
    saveFiles();
}

// Clear all files
function clearFiles() {
    if (confirm('Are you sure you want to remove all files?')) {
        uploadedFiles = [];
        updateFileList();
        saveFiles();
    }
}

// Save files to localStorage (in a real app, this would be an API call)
function saveFiles() {
    // In a real app, you would upload files to a server here
    // For this demo, we'll just save to localStorage
    localStorage.setItem('uploadedFiles', JSON.stringify(uploadedFiles));
}

// Process the uploaded resumes
function processFiles() {
    if (uploadedFiles.length === 0) {
        alert('Please upload at least one resume before processing.');
        return;
    }
    
    // Show loading state
    processFilesBtn.disabled = true;
    processFilesBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    
    // Simulate API call with timeout (in a real app, this would be an actual API call)
    setTimeout(() => {
        // Generate mock processed data
        processedCandidates = uploadedFiles.map((file, index) => {
            const name = file.name.split('.')[0].replace(/[_-]/g, ' ');
            const email = `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`;
            const job = jobPositions[Math.floor(Math.random() * jobPositions.length)];
            const score = Math.floor(60 + Math.random() * 40); // Random score between 60-100
            const status = score >= 70 ? 'Eligible' : 'Not Eligible';
            
            return {
                id: `candidate-${Date.now()}-${index}`,
                name: name.charAt(0).toUpperCase() + name.slice(1),
                email,
                position: job.name,
                positionId: job.id,
                skills: job.skills.slice(0, 2 + Math.floor(Math.random() * 2)).join(', '),
                score,
                status,
                file: file
            };
        });
        
        // Sort by score (highest first)
        processedCandidates.sort((a, b) => b.score - a.score);
        
        // Update the results table
        updateResultsTable();
        
        // Show the results section
        resultsSection.style.display = 'block';
        
        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth' });
        
        // Reset button state
        processFilesBtn.disabled = false;
        processFilesBtn.textContent = 'Process Resumes';
    }, 2000);
}

// Update the results table
function updateResultsTable() {
    resultsTableBody.innerHTML = '';
    
    if (processedCandidates.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="7" style="text-align: center;">No candidates to display.</td>';
        resultsTableBody.appendChild(row);
        return;
    }
    
    processedCandidates.forEach((candidate, index) => {
        const row = document.createElement('tr');
        row.setAttribute('data-status', candidate.status.toLowerCase().replace(' ', '-'));
        row.setAttribute('data-position', candidate.positionId);
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${candidate.name}</td>
            <td>${candidate.email}</td>
            <td>${candidate.position}</td>
            <td>${candidate.score}%</td>
            <td>
                <span class="status-badge status-${candidate.status.toLowerCase().replace(' ', '-')}">
                    ${candidate.status}
                </span>
            </td>
            <td>
                <button class="btn btn-outline btn-sm view-resume" data-id="${candidate.id}">
                    <i class="fas fa-eye"></i> View
                </button>
                <input type="checkbox" class="candidate-checkbox" data-id="${candidate.id}">
            </td>
        `;
        
        resultsTableBody.appendChild(row);
    });
    
    // Add event listeners to view buttons
    document.querySelectorAll('.view-resume').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const candidateId = e.currentTarget.getAttribute('data-id');
            viewResume(candidateId);
        });
    });
}

 

// View a candidate's resume
function viewResume(candidateId) {
    const candidate = processedCandidates.find(c => c.id === candidateId);
    if (!candidate) return;
    
    // In a real app, this would open the actual resume file
    // For this demo, we'll just show an alert with the candidate's details
    alert(`Viewing resume for: ${candidate.name}\n\n` +
          `Email: ${candidate.email}\n` +
          `Position: ${candidate.position}\n` +
          `Skills: ${candidate.skills}\n` +
          `Score: ${candidate.score}%\n` +
          `Status: ${candidate.status}`);
}

// Export results to CSV
function exportToCsv() {
    if (processedCandidates.length === 0) {
        alert('No data to export.');
        return;
    }
    
    // Get visible rows (after filtering)
    const visibleRows = Array.from(resultsTableBody.querySelectorAll('tr'))
        .filter(row => row.style.display !== 'none');
    
    if (visibleRows.length === 0) {
        alert('No visible data to export with current filters.');
        return;
    }
    
    // Get headers
    const headers = ['#', 'Name', 'Email', 'Position', 'Score', 'Status'];
    
    // Get data rows
    const rows = [];
    visibleRows.forEach((row, index) => {
        const cells = row.querySelectorAll('td');
        const rowData = [
            index + 1,
            cells[1].textContent,
            cells[2].textContent,
            cells[3].textContent,
            cells[4].textContent,
            cells[5].textContent.trim()
        ];
        rows.push(rowData.join(','));
    });
    
    // Combine headers and rows
    const csvContent = [headers.join(','), ...rows].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `candidates_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Shortlist selected candidates
function shortlistCandidates() {
    const selectedCheckboxes = document.querySelectorAll('.candidate-checkbox:checked');
    
    if (selectedCheckboxes.length === 0) {
        alert('Please select at least one candidate to shortlist.');
        return;
    }
    
    const selectedIds = Array.from(selectedCheckboxes).map(checkbox => checkbox.getAttribute('data-id'));
    const selectedCandidates = processedCandidates.filter(candidate => 
        selectedIds.includes(candidate.id)
    );
    
    // In a real app, this would be an API call to save the shortlisted candidates
    console.log('Shortlisted candidates:', selectedCandidates);
    
    alert(`Successfully shortlisted ${selectedCandidates.length} candidate(s).`);
}

// Handle logout
function handleLogout() {
    // In a real app, this would clear the session and redirect to login
    if (confirm('Are you sure you want to logout?')) {
        // Clear any stored data
        localStorage.removeItem('uploadedFiles');
        
        // Redirect to login page (in a real app)
        window.location.href = 'index.html';
    }
}

// Helper function to format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

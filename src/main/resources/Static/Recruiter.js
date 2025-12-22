/**
 * Recruiter.js
 * Handles AOS init, Popups, File Uploads, and Skill Management
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Init AOS ---
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true,
            offset: 100,
            mirror: false
        });
    }

    // --- 2. Set Year ---
    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // --- 3. Popup Logic ---
    const loginPopup = document.getElementById('loginPopup');
    const signupPopup = document.getElementById('signupPopup');
    const overlay = document.getElementById('overlay');
    
    // Helper to toggle modal visibility safely
    window.toggleModal = function(modalId, show) {
        const modal = document.getElementById(modalId);
        const overlay = document.getElementById('overlay');
        
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
    };

    window.closePopup = function() {
        toggleModal('loginPopup', false);
        toggleModal('signupPopup', false);
    };

    window.openLogin = function(isSwitch = false) {
        if (isSwitch) {
            toggleModal('signupPopup', false);
            setTimeout(() => toggleModal('loginPopup', true), 100); 
        } else {
            toggleModal('loginPopup', true);
        }
    };

    window.openSignup = function(isSwitch = false) {
        if (isSwitch) {
            toggleModal('loginPopup', false);
            setTimeout(() => toggleModal('signupPopup', true), 100);
        } else {
            toggleModal('signupPopup', true);
        }
    };

    // --- 4. Mobile Menu ---
    const btn = document.getElementById('mobile-menu-btn'); // Ensure you have this ID in HTML if used
    const menu = document.getElementById('mobile-menu');
    if (btn && menu) {
        btn.addEventListener('click', () => {
            menu.classList.toggle('hidden');
        });
    }

    // --- 5. File Upload Logic (Visual + Validation) ---
    // Handle multiple file inputs (Resumes & JDs)
    const fileInputs = ['fileInput', 'jdInput'];
    const MAX_FILES = 20;
    const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx'];
    
    function isAllowedExtension(fileName) {
        const parts = fileName.split('.');
        if (parts.length < 2) return false;
        const ext = parts.pop().toLowerCase();
        return ALLOWED_EXTENSIONS.includes(ext);
    }

    fileInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        const listId = inputId === 'fileInput' ? 'fileList' : 'jdList'; 
        const list = document.getElementById(listId);

        if (input && list) {
            input.addEventListener('change', (e) => {
                const files = Array.from(e.target.files || []);

                // Frontend max file count validation
                if (files.length > MAX_FILES) {
                    alert(`You can upload a maximum of ${MAX_FILES} files at once.`);
                    input.value = '';
                    list.innerHTML = '';
                    return;
                }

                list.innerHTML = ''; // Clear current list

                files.forEach(file => {
                    const validType = isAllowedExtension(file.name);
                    const row = document.createElement('div');
                    row.className = 'flex justify-between items-center bg-brand-dark p-2 rounded border border-gray-700 mt-2';
                    row.dataset.fileName = file.name;

                    const nameSpan = document.createElement('span');
                    nameSpan.className = 'truncate max-w-[60%]';
                    nameSpan.textContent = file.name;

                    const statusSpan = document.createElement('span');
                    statusSpan.className = 'text-xs';

                    if (!validType) {
                        statusSpan.textContent = 'Invalid file type';
                        statusSpan.classList.add('text-red-400');
                    } else {
                        statusSpan.textContent = 'Ready';
                        statusSpan.classList.add('text-gray-400');
                    }

                    row.appendChild(nameSpan);
                    row.appendChild(statusSpan);
                    list.appendChild(row);
                });
            });
        }
    });


    // --- 6. SKILL MANAGEMENT SYSTEM (The Fix) ---
    const jobDomainSelect = document.getElementById('jobDomainSelect');
    const skillSelect = document.getElementById('skillSelect'); 
    const skillTagsContainer = document.getElementById('skillTags');
    const addSkillBtn = document.getElementById('addSkillBtn'); // Optional if you have a button

    // Map Domains to Skills
    const domainToSkillsMap = {
        "Sales & Marketing": ["Market Research", "SEO", "Content Strategy", "CRM (Salesforce)", "Email Marketing", "Social Media Advertising", "Lead Generation", "Public Relations", "Brand Management"],
        "Data Science & Analytics": ["Python", "R", "SQL", "Machine Learning", "Data Visualization", "Big Data", "Statistical Analysis", "Deep Learning", "Pandas", "NumPy"],
        "Human Resources": ["Recruitment", "Onboarding", "Employee Relations", "HRIS", "Compensation & Benefits", "Labor Law", "Performance Management", "Talent Acquisition"],
        "Social Media Management": ["Instagram Marketing", "Facebook Ads", "Community Management", "TikTok Strategy", "Content Scheduling", "Analytics", "Crisis Communication", "Influencer Marketing"],
        "Digital Marketing": ["Google Ads", "SEO", "PPC", "Google Analytics", "Content Marketing", "CRO", "Email Marketing", "Marketing Automation", "HubSpot"],
        "Graphic Design": ["Adobe Photoshop", "Adobe Illustrator", "InDesign", "Branding", "Typography", "UI/UX Design", "Print Design", "Vector Graphics", "Figma"],
        "Video Editing": ["Adobe Premiere Pro", "Final Cut Pro", "Motion Graphics", "Color Correction", "Sound Design", "After Effects", "Davinci Resolve"],
        "Full Stack Developer": ["JavaScript", "Node.js", "React", "Python", "SQL", "NoSQL", "AWS", "REST APIs", "Git"],
        "MERN Stack Developer": ["MongoDB", "Express.js", "React", "Node.js", "Redux", "REST APIs", "Mongoose", "JWT"],
        "E-Mail & Outreaching": ["Cold Emailing", "Outreach Tools", "A/B Testing", "Sequencing", "Lead Generation", "HubSpot", "Mailchimp"],
        "Content Writing": ["Blogging", "Copywriting", "SEO Content", "Technical Writing", "Editing", "Research", "Content Strategy"],
        "Content Creator": ["Videography", "Scripting", "Social Media Strategy", "Community Management", "Live Streaming", "Storytelling", "Adobe Creative Suite"],
        "UI/UX Designing": ["Figma", "Sketch", "Prototyping", "User Research", "Wireframing", "Usability Testing", "Design Systems", "Adobe XD"],
        "Front-End Developer": ["HTML/CSS", "JavaScript", "React", "Angular", "Vue", "Tailwind CSS", "Responsive Design", "Webpack", "Accessibility"],
        "Back-End Developer": ["Node.js", "Python", "Java", "Database Design", "API Development", "Security", "Microservices", "Docker"]
    };

    if (jobDomainSelect && skillSelect && skillTagsContainer) {
        
        // Function to update dropdown options
        function updateSkillOptions() {
            const selectedDomain = jobDomainSelect.value;
            console.log("Domain Changed to:", selectedDomain); // Debugging log

            const skills = domainToSkillsMap[selectedDomain] || [];

            // Reset dropdown
            skillSelect.innerHTML = '<option disabled selected value="">Select a Skill</option>';

            // Populate new options
            skills.forEach(skill => {
                const option = document.createElement('option');
                option.value = skill;
                option.textContent = skill;
                skillSelect.appendChild(option);
            });
            
            // Force reset selected index
            skillSelect.selectedIndex = 0;
        }

        // Create a visual tag for a skill
        function createSkillTag(skillName) {
            const skillText = skillName.trim();
            if (!skillText || skillText === "Select a Skill") return null;

            const span = document.createElement('span');
            span.className = 'bg-brand-accent text-brand-dark px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2 transition duration-200 ease-in-out transform hover:scale-105';
            span.innerHTML = `${skillText} <i class="fas fa-times cursor-pointer hover:text-red-600 remove-skill"></i>`;
            return span;
        }

        // Add skill logic
        function addSkill() {
            const skillName = skillSelect.value;
            
            // Validation
            if (!skillName || skillName === "") {
                skillSelect.selectedIndex = 0;
                return;
            }

            // Duplicate Check
            const currentTags = Array.from(skillTagsContainer.querySelectorAll('span')).map(s => s.textContent.trim().split(' ')[0]); // simplistic split
            // Better duplicate check: check innerText excluding the 'X'
            let isDuplicate = false;
            skillTagsContainer.querySelectorAll('span').forEach(tag => {
                if(tag.innerText.includes(skillName)) isDuplicate = true;
            });

            if (isDuplicate) {
                skillSelect.selectedIndex = 0;
                return;
            }

            // Create and Append
            const newTag = createSkillTag(skillName);
            if (newTag) {
                skillTagsContainer.appendChild(newTag);
            }

            // Reset Dropdown
            skillSelect.selectedIndex = 0;
        }

        // --- Event Listeners ---
        
        // 1. When Domain Changes -> Update Skills
        jobDomainSelect.addEventListener('change', updateSkillOptions);

        // 2. When Skill Selected -> Add Tag
        skillSelect.addEventListener('change', addSkill);

        // 3. Remove Tag (Delegation)
        skillTagsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-skill')) {
                e.target.closest('span').remove();
            }
        });

        // 4. Manual Add Button (if exists)
        if (addSkillBtn) {
            addSkillBtn.addEventListener('click', addSkill);
        }

        // Initialize empty state
        updateSkillOptions();
    } else {
        console.error("Critical Elements Missing: Check IDs 'jobDomainSelect', 'skillSelect', 'skillTags'");
    }

    // --- 7. Clear All Button ---
    const clearAllBtn = document.getElementById('clearAllBtn');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', () => {
            // Reset files
            document.querySelectorAll('input[type="file"]').forEach(input => input.value = '');
            document.getElementById('fileList').innerHTML = '';
            const jdList = document.getElementById('jdList');
            if(jdList) jdList.innerHTML = '';

            const progressWrapper = document.getElementById('resumeUploadProgressWrapper');
            const progressBar = document.getElementById('resumeUploadProgressBar');
            const progressText = document.getElementById('resumeUploadProgressText');
            if (progressWrapper && progressBar && progressText) {
                progressWrapper.classList.add('hidden');
                progressBar.style.width = '0%';
                progressText.textContent = '0%';
            }

            // Reset Domain
            if(jobDomainSelect) jobDomainSelect.selectedIndex = 0;
            
            // Reset Skills
            if(skillSelect) {
                skillSelect.innerHTML = '<option disabled selected value="">Select a Skill</option>';
            }
            if(skillTagsContainer) skillTagsContainer.innerHTML = '';

            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- 8. Scroll to Top ---
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollTopBtn.classList.remove('translate-y-24', 'opacity-0');
                scrollTopBtn.classList.add('translate-y-0', 'opacity-100');
            } else {
                scrollTopBtn.classList.add('translate-y-24', 'opacity-0');
                scrollTopBtn.classList.remove('translate-y-0', 'opacity-100');
            }
        });
    }
}); // End DOMContentLoaded

// let uploadedJobId = localStorage.getItem('activeJobId') || null;
// let uploadedJobDepartment = localStorage.getItem('activeJobDept') || null;

// if(uploadedJobId) {
//     console.log("Restored Session - Job ID:", uploadedJobId);
// }


window.uploadResumesToBackend = async function() {
    // 1. Get User Data
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('jwtToken');

    if (!userId || !token) {
        alert("Please login first.");
        return;
    }

    // 2. Get Files
    const fileInput = document.getElementById('fileInput');
    const files = Array.from(fileInput.files || []);

    if (files.length === 0) {
        alert("Please select files to upload.");
        return;
    }

    // Frontend validation: max count + allowed extensions
    if (files.length > 20) {
        alert("You can upload a maximum of 20 resumes at once.");
        return;
    }

    const invalidFiles = files.filter(f => {
        const parts = f.name.split('.');
        const ext = parts.length > 1 ? parts.pop().toLowerCase() : '';
        return !['pdf', 'doc', 'docx'].includes(ext);
    });

    if (invalidFiles.length > 0) {
        const names = invalidFiles.map(f => f.name).join(', ');
        alert(`Only PDF, DOC, and DOCX files are allowed. Invalid: ${names}`);
        return;
    }

    // 3. Prepare Form Data
    const formData = new FormData();
    files.forEach(file => {
        formData.append("files", file); // Must match @RequestPart("files") in backend
    });

    // 4. Send Request with progress tracking (XMLHttpRequest to support upload.onprogress)
    const btn = document.getElementById('resumeUploadBtn') ||
        document.querySelector('button[onclick="uploadResumesToBackend()"]');
    const originalText = btn ? btn.innerHTML : '';

    const progressWrapper = document.getElementById('resumeUploadProgressWrapper');
    const progressBar = document.getElementById('resumeUploadProgressBar');
    const progressText = document.getElementById('resumeUploadProgressText');

    if (progressWrapper && progressBar && progressText) {
        progressWrapper.classList.remove('hidden');
        progressBar.style.width = '0%';
        progressText.textContent = '0%';
    }

    if (btn) {
        btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Uploading...`;
        btn.disabled = true;
    }

    try {
        const baseUrl = CONFIG.API_BASE_URL.replace('/auth', '');
        const url = `${baseUrl}/resumes/upload/${userId}`;

        const responseData = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', url, true);
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);

            xhr.upload.onprogress = function (event) {
                if (!event.lengthComputable || !progressBar || !progressText) return;
                const percent = Math.round((event.loaded / event.total) * 100);
                progressBar.style.width = `${percent}%`;
                progressText.textContent = `${percent}%`;
            };

            xhr.onreadystatechange = function () {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            const json = xhr.responseText ? JSON.parse(xhr.responseText) : null;
                            resolve(json);
                        } catch (e) {
                            // Backend might not return JSON – treat as generic success
                            resolve(null);
                        }
                    } else {
                        reject(new Error(xhr.responseText || `Upload failed with status ${xhr.status}`));
                    }
                }
            };

            xhr.onerror = function () {
                reject(new Error('Network error during upload.'));
            };

            xhr.send(formData);
        });

        // Update UI: mark per-file success/failure if backend returned structured data
        const list = document.getElementById('fileList');
        if (Array.isArray(responseData) && list) {
            responseData.forEach(item => {
                if (!item || !item.fileName) return;
                const row = list.querySelector(`[data-file-name="${CSS.escape(item.fileName)}"]`);
                if (!row) return;
                const statusSpan = row.querySelector('span.text-xs') || row.lastElementChild;
                if (!statusSpan) return;

                const isSuccess = String(item.status || '').toUpperCase() === 'SUCCESS';
                statusSpan.textContent = isSuccess
                    ? (item.message || 'Uploaded')
                    : (item.message || 'Failed');
                statusSpan.classList.remove('text-gray-400', 'text-red-400', 'text-green-400');
                statusSpan.classList.add(isSuccess ? 'text-green-400' : 'text-red-400');
            });
        } else if (list) {
            // Fallback: mark all as success
            list.querySelectorAll('[data-file-name]').forEach(row => {
                const statusSpan = row.querySelector('span.text-xs') || row.lastElementChild;
                if (!statusSpan) return;
                statusSpan.textContent = 'Uploaded';
                statusSpan.classList.remove('text-gray-400', 'text-red-400');
                statusSpan.classList.add('text-green-400');
            });
        }

        alert("Upload completed.");
        const statusBadge = document.getElementById('uploadStatus');
        if (statusBadge) {
            statusBadge.classList.remove('hidden');
        }

        if (btn) {
            btn.innerHTML = `<i class="fas fa-check"></i> Done`;
        }
    } catch (e) {
        console.error(e);
        alert(`Upload Failed: ${e.message}`);
    } finally {
        if (btn) {
            setTimeout(() => {
                btn.innerHTML = originalText || '<i class="fas fa-upload"></i> Upload Resumes';
                btn.disabled = false;
            }, 1500);
        }
    }
};


let uploadedJobId = null;
let uploadedJobDepartment = null;


window.uploadJDToBackend = async function() {
    console.log("Starting JD Upload & Analysis...");

    // 1. Auth Check
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('jwtToken');

    if (!userId || !token) {
        alert("Please login first.");
        return;
    }

    // 2. Get Files
    const jdInput = document.getElementById('jdInput');
    const files = jdInput.files;

    if (files.length === 0) {
        alert("Please select Job Description files first!");
        return;
    }
    
    const formData = new FormData();

    formData.append("file", files[0]);  // single file
    formData.append("userId", userId);
    
    // 4. API Call
    const baseUrl = CONFIG.API_BASE_URL.replace('/auth', ''); 
    const uploadUrl = `${baseUrl}/job-postings/upload`;
    
    // Button UI
    const btn = document.querySelector('button[onclick="uploadJDToBackend()"]');
    const originalContent = btn.innerHTML;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Analyzing...`;
    btn.disabled = true;

    let uploadedJobId = null;
    let uploadedJobDepartment = "";
    try {
        
        const response = await fetch(uploadUrl, {
            method: 'POST',
            // headers: {
            //     'Authorization': `Bearer ${token}`
            // },
            body: formData
        });
        
        console.log("here")

        if (response.ok) {
           
            const job = await response.json();

            uploadedJobId = job.id;
            uploadedJobDepartment = job.department || job.title || "";
            localStorage.setItem('jobId', job.id);
            localStorage.setItem('activeJobId', job.id);
            localStorage.setItem('activeJobDept', uploadedJobDepartment);

            alert(`Success! JD Analyzed. Extracted Department: ${uploadedJobDepartment}`);
            
            document.getElementById('jdUploadStatus').classList.remove('hidden');
            btn.innerHTML = `<i class="fas fa-check"></i> Done`;
            
            setTimeout(() => {
                btn.innerHTML = originalContent;
                btn.disabled = false;
            }, 3000);

        } else {
            console.log("zarur galti hai ");
            
            throw new Error(await response.text());
        }

    } catch (error) {
        console.log(error.stack);
        alert("Upload Failed: " + error.message);
        btn.innerHTML = originalContent;
        btn.disabled = false;
    }
};

window.saveRequirements = async function() {
    // 1. Get Data from UI
    const jobDomainSelect = document.getElementById('jobDomainSelect');
    const selectedDomain = jobDomainSelect.value;
    const skillTags = document.querySelectorAll('#skillTags span');
    
    // Clean up skill text
    const skills = Array.from(skillTags).map(tag => tag.textContent.replace(' ', '').trim()); 
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('jwtToken');

    // 2. RETRIEVE JOB ID (Fix for "null" error after refresh)
    // If global variable is empty, try to get it from storage
    if (!uploadedJobId) {
        uploadedJobId = localStorage.getItem('activeJobId');
    }

    // 3. Validation
    if (!userId || !token) { 
        alert("Please login first."); 
        return; 
    }

    if (!uploadedJobId) {
        // If still null, it means they truly haven't uploaded a JD yet
        alert("No Job ID found. Please upload a Job Description in Section 2 first.");
        return;
    }

    if (selectedDomain === "Select Domain" || !selectedDomain) {
        alert("Please select a Job Domain.");
        jobDomainSelect.focus();
        return;
    }

    if (skills.length === 0) {
        alert("Please add at least one required skill.");
        document.getElementById('skillSelect').focus();
        return;
    }

    // (Validation logic for Domain Comparison has been REMOVED as requested)

    // 4. Send to Backend
    const baseUrl = CONFIG.API_BASE_URL.replace('/auth', '');
    const url = `${baseUrl}/job-postings/save-requirements`;

    // Button Feedback
    const saveBtn = document.querySelector('button[onclick="saveRequirements()"]');
    const originalBtnText = saveBtn ? saveBtn.innerHTML : 'Save Requirements';
    if (saveBtn) {
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        saveBtn.disabled = true;
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                jobId: uploadedJobId, 
                userId: userId, 
                jobDomain: selectedDomain,
                skills: skills
            })
        });

        // ✅ FIX: Robust Response Handling (Prevents "Unexpected token S")
        const responseText = await response.text();
        let result;
        
        try {
            // Try to parse as JSON
            result = JSON.parse(responseText);
        } catch (e) {
            // If backend returned plain text (e.g. "Skills saved successfully"), handle it gracefully
            console.warn("Backend returned non-JSON:", responseText);
            if (response.ok) {
                result = { message: responseText, jobId: uploadedJobId };
            } else {
                result = { message: responseText }; // Fallback for error text
            }
        }

        if (response.ok) {
            alert(`Requirements saved successfully!\n(Job ID: ${result.jobId || uploadedJobId})`);
        } else {
            throw new Error(result.error || result.message || "Unknown Error");
        }

    } catch (e) {
        console.error("Save Error:", e);
        alert("Failed to save requirements: " + e.message);
    } finally {
        // Reset Button
        if (saveBtn) {
            saveBtn.innerHTML = originalBtnText;
            saveBtn.disabled = false;
        }
    }
};

window.analyzeCandidates = async function() {
    // 1. Auth Check
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('jwtToken');

    if (!userId || !token) {
        alert("Please login first.");
        return;
    }

    // 2. Button State Loading
    const btn = document.getElementById('analyzeBtn1');
    const originalText = btn.innerHTML;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Analyzing...`;
    btn.disabled = true;
    
    // 3. User Feedback
    alert("Analysis started! This uses Gemini AI to read your resumes. Please wait...");

    try {
        // 4. API Call
        const baseUrl = CONFIG.API_BASE_URL.replace('/auth', '');
        const url = `${baseUrl}/resumes/analyze/all/${userId}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const result = await response.json();
            console.log("Analysis Result:", result);
            // 5. Success Popup
            alert(`Analysis Complete!\n\n` +
                  `✅ Successfully extracted data from: ${result.processed} new resumes.\n` +
                  `⏭️ Skipped (already analyzed): ${result.skipped}`);
            
            // Optional: Redirect to results page
            // window.location.href = "dashboard.html"; 

        } else {
            const errorText = await response.text();
            throw new Error(errorText);
        }
        } catch (error) {
        console.error("Analysis Error:", error);
        alert("Analysis Failed: " + error.message);
    } finally {
        // 6. Reset Button
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
};


// Add this function to Recruiter.js

window.finishAndAnalyze = async function() {
    console.log("Starting Candidate Analysis...");

    // 1. Retrieve active Job ID
    let jobId = uploadedJobId || localStorage.getItem('activeJobId');
    if (!jobId) {
        alert("No active Job ID found. Please upload a Job Description first.");
        return;
    }

    // 2. Auth Check
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        alert("Please login first.");
        return;
    }

    // 3. Button Feedback
    const btn = document.getElementById('analyzeFinalBtn');
    const originalContent = btn ? btn.innerHTML : 'Analyze Candidates';
    if (btn) {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
        btn.disabled = true;
    }

    try {
        // 4. Construct URL (assuming CONFIG.API_BASE_URL is set correctly, e.g., 'http://localhost:8080/api/auth')
        const baseUrl = CONFIG.API_BASE_URL.replace('/auth', ''); // Adjusts to root API path
        const url = `${baseUrl}/score/${jobId}`;
        console.log("Analysis URL:", url);

        // 5. Make POST request to trigger scoring
        const response = await fetch(url, {
            method: 'POST',
        });

        if (response.ok) {
            const result = await response.json();
            // Optional: Redirect to dashboard.html to view results
            window.location.href = 'dashboard.html';
        } else {
            const errorText = await response.text();
            throw new Error(errorText || `Failed with status ${response.status}`);
        }
    } catch (error) {
        console.error("Analysis Error:", error);
        alert(`Analysis Failed: ${error.message}`);
    } finally {
        // Reset Button
        if (btn) {
            btn.innerHTML = originalContent;
            btn.disabled = false;
        }
    }
};


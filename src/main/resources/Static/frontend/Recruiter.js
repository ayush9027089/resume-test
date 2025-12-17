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

    // --- 5. File Upload Logic (Visual Only) ---
    // Handle multiple file inputs (Resumes & JDs)
    const fileInputs = ['fileInput', 'jdInput'];
    
    fileInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        // Find the specific list container associated with this input
        // (Assuming the list is immediately after the parent section or found by ID)
        // For simplicity, we'll map IDs to their list containers if they are unique
        let listId = inputId === 'fileInput' ? 'fileList' : 'jdList'; 
        const list = document.getElementById(listId);

        if (input && list) {
            input.addEventListener('change', (e) => {
                const files = Array.from(e.target.files);
                list.innerHTML = ''; // Clear current list
                files.forEach(file => {
                    const div = document.createElement('div');
                    div.className = 'flex justify-between items-center bg-brand-dark p-2 rounded border border-gray-700 mt-2';
                    div.innerHTML = `<span class="truncate max-w-[80%]">${file.name}</span> <i class="fas fa-check text-green-400"></i>`;
                    list.appendChild(div);
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

// Signup validation: ensure required fields are filled before allowing signup
window.handleSignup = function() {
    const nameEl = document.getElementById('signup-name');
    const emailEl = document.getElementById('signup-email');
    const passEl = document.getElementById('signup-password');
    const errorEl = document.getElementById('signupError');
    const popup = document.getElementById('signupPopup');

    if (!nameEl || !emailEl || !passEl || !errorEl) {
        alert('Signup elements are missing from the page.');
        return;
    }

    // Clear previous state
    errorEl.textContent = '';
    errorEl.classList.add('hidden');
    [nameEl, emailEl, passEl].forEach(i => i.classList.remove('ring-2', 'ring-red-500'));

    const name = nameEl.value.trim();
    const email = emailEl.value.trim();
    const password = passEl.value;

    const errors = [];
    if (!name) errors.push('Full name is required.');
    // Basic email check
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!email) errors.push('Email address is required.');
    else if (!emailRegex.test(email)) errors.push('Please enter a valid email address.');
    if (!password) errors.push('Password is required.');
    else if (password.length < 6) errors.push('Password must be at least 6 characters.');

    if (errors.length > 0) {
        // Show messages
        errorEl.innerHTML = errors.join(' ');
        errorEl.classList.remove('hidden');

        // Add red ring to invalid inputs
        if (!name) nameEl.classList.add('ring-2', 'ring-red-500');
        if (!email || (email && !emailRegex.test(email))) emailEl.classList.add('ring-2', 'ring-red-500');
        if (!password || (password && password.length < 6)) passEl.classList.add('ring-2', 'ring-red-500');

        // Briefly highlight popup to draw attention
        if (popup) {
            popup.classList.add('animate-pulse');
            setTimeout(() => popup.classList.remove('animate-pulse'), 600);
        }
        return;
    }

    // If validation passes — placeholder behavior
    errorEl.classList.add('hidden');
    alert('Signup successful (demo).');
    // Close the signup modal
    if (typeof toggleModal === 'function') toggleModal('signupPopup', false);
};


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
    const files = fileInput.files;

    if (files.length === 0) {
        alert("Please select files to upload.");
        return;
    }

    // 3. Prepare Form Data
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]); // Must match @RequestPart("files") in backend
    }

    // 4. Send Request
    const btn = document.querySelector('button[onclick="uploadResumesToBackend()"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Uploading...`;
    btn.disabled = true;

    try {
        // Construct URL: http://localhost:8080/api/resumes/upload/{userId}
        const baseUrl = CONFIG.API_BASE_URL.replace('/auth', '');
        const response = await fetch(`${baseUrl}/resumes/upload/${userId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (response.ok) {
            alert("Upload Successful!");
            btn.innerHTML = `<i class="fas fa-check"></i> Done`;
            document.getElementById('uploadStatus').classList.remove('hidden');
        } else {
            const err = await response.text();
            alert("Upload Failed: " + err);
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    } catch (e) {
        console.error(e);
        alert("Network Error");
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
};


window.uploadJDToBackend = async function() {
    console.log("Starting JD Upload...");

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

    // 3. Prepare Form Data
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
    }
    formData.append("userId", userId);

    // 4. API Call
    // URL: http://localhost:8080/api/job-postings/upload
    const baseUrl = CONFIG.API_BASE_URL.replace('/auth', ''); 
    const uploadUrl = `${baseUrl}/job-postings/upload`;

    // Button UI
    const btn = document.querySelector('button[onclick="uploadJDToBackend()"]');
    const originalContent = btn.innerHTML;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Uploading...`;
    btn.disabled = true;

    try {
        const response = await fetch(uploadUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (response.ok) {
            const result = await response.json();
            console.log("JD Upload Success:", result);
            
            alert(`Success! ${result.length} Job Descriptions uploaded.`);
            document.getElementById('jdUploadStatus').classList.remove('hidden');
            btn.innerHTML = `<i class="fas fa-check"></i> Done`;
            
            setTimeout(() => {
                btn.innerHTML = originalContent;
                btn.disabled = false;
            }, 3000);

        } else {
            const errorText = await response.text();
            throw new Error(errorText);
        }

    } catch (error) {
        console.error("JD Upload Error:", error);
        alert("Upload Failed: " + error.message);
        btn.innerHTML = originalContent;
        btn.disabled = false;
    }
};
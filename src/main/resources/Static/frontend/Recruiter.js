

// Init AOS
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true,
            offset: 100,
            mirror: false
        });

document.getElementById('year').textContent = new Date().getFullYear();

const loginPopup = document.getElementById('loginPopup');
        const signupPopup = document.getElementById('signupPopup');
        const overlay = document.getElementById('overlay');
        const mobileMenu = document.getElementById('mobile-menu');

        function toggleModal(modalId, show) {
            const modal = document.getElementById(modalId);
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

        function toggleMobileMenu() {
            mobileMenu.classList.toggle();
        }

        function handleSignup() {
            alert("Signup functionality is not implemented yet.");
            // In a real application, you'd handle form submission here
        }

// Scroll to Top Logic (Consolidated and Cleaned)
const scrollTopBtn = document.getElementById('scrollTopBtn');
window.addEventListener('scroll', () => {
    // Show button when page is scrolled down 300px
    if (window.scrollY > 300) {
        scrollTopBtn.classList.remove('translate-y-24', 'opacity-0');
        scrollTopBtn.classList.add('translate-y-0', 'opacity-100');
    } else {
        scrollTopBtn.classList.add('translate-y-24', 'opacity-0');
        scrollTopBtn.classList.remove('translate-y-0', 'opacity-100');
    }
});

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

        // Toggle Mobile Menu
        const btn = document.getElementById('mobile-menu-btn');
        const menu = document.getElementById('mobile-menu');

        btn.addEventListener('click', () => {
            menu.classList.toggle('hidden');
        });

        // Simple file upload interaction demo
        const fileInput = document.getElementById('fileInput');
        const fileList = document.getElementById('fileList');
        
        fileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            fileList.innerHTML = '';
            files.forEach(file => {
                const div = document.createElement('div');
                div.className = 'flex justify-between items-center bg-brand-dark p-2 rounded border border-gray-700';
                div.innerHTML = `<span>${file.name}</span> <i class="fas fa-check text-green-400"></i>`;
                fileList.appendChild(div);
            });
        });

// START: Skill Management Functionality
const jobDomainSelect = document.getElementById('jobDomainSelect'); // New ID
const skillSelect = document.getElementById('skillSelect'); 
const skillTagsContainer = document.getElementById('skillTags');

// 1. Define the Skill Map (UPDATED with Social Media Management and Digital Marketing skills)
const domainToSkillsMap = {
    "Select Domain": [], // Default
    "Sales & Marketing": ["Market Research", "SEO", "Content Strategy", "CRM (Salesforce)", "Email Marketing", "Social Media Advertising", "Lead Generation", "Public Relations", "Brand Management"],
    "Data Science & Analytics": ["Python", "R", "SQL", "Machine Learning", "Data Visualization", "Big Data", "Statistical Analysis", "Deep Learning", "Pandas", "NumPy"],
    "Human Resources": ["Recruitment", "Onboarding", "Employee Relations", "HRIS", "Compensation & Benefits", "Labor Law", "Performance Management", "Talent Acquisition"],
    "Social Media Management": ["Instagram Marketing", "Facebook Ads", "Community Management", "TikTok Strategy", "Content Scheduling", "Analytics (e.g., Buffer/Hootsuite)", "Crisis Communication", "Influencer Marketing"], // ADDED
    "Digital Marketing": ["Google Ads", "Search Engine Optimization (SEO)", "Pay-Per-Click (PPC)", "Google Analytics", "Content Marketing", "Conversion Rate Optimization (CRO)", "Email Marketing", "Marketing Automation", "HubSpot"], // ADDED
    "Graphic Design": ["Adobe Photoshop", "Adobe Illustrator", "InDesign", "Branding", "Typography", "UI/UX Design", "Print Design", "Vector Graphics", "Figma"],
    "Video Editing": ["Adobe Premiere Pro", "Final Cut Pro", "Motion Graphics", "Color Correction", "Sound Design", "After Effects", "Davinci Resolve"],
    "Full Stack Developer": ["JavaScript", "Node.js", "React", "Python", "Databases (SQL/NoSQL)", "Cloud (AWS/Azure)", "REST APIs", "Security", "Git"],
    "MERN Stack Developer": ["MongoDB", "Express.js", "React", "Node.js", "Redux", "REST APIs", "Mongoose", "Authentication (JWT)"],
    "E-Mail & Outreaching": ["Cold Emailing", "Outreach Tools", "A/B Testing", "Sequencing", "Lead Generation", "HubSpot", "Mailchimp", "Email Automation"],
    "Content Writing": ["Blogging", "Copywriting", "SEO Content", "Technical Writing", "Editing", "Grammarly", "Research", "Content Strategy"],
    "Content Creator": ["Videography", "Scripting", "Social Media Strategy", "Community Management", "Live Streaming", "Storytelling", "Adobe Creative Suite"],
    "UI/UX Designing": ["Figma", "Sketch", "Prototyping", "User Research", "Wireframing", "Usability Testing", "Design Systems", "Adobe XD"],
    "Front-End Developer": ["HTML/CSS", "JavaScript", "React/Vue/Angular", "Tailwind CSS", "Responsive Design", "Webpack", "SASS/LESS", "Accessibility"],
    "Back-End Developer": ["Node.js/Python/Java", "Database Design", "API Development", "Security", "Server Management", "Microservices", "Docker", "Testing"],
};

if (jobDomainSelect && skillSelect && skillTagsContainer) {

    // Function to dynamically update skill options based on domain
    function updateSkillOptions() {
        const selectedDomain = jobDomainSelect.value;
        const skills = domainToSkillsMap[selectedDomain] || [];

        // Clear existing options
        skillSelect.innerHTML = '<option disabled selected value="">Select a Skill</option>';

        // Populate with new options
        skills.forEach(skill => {
            const option = document.createElement('option');
            option.value = skill;
            option.textContent = skill;
            skillSelect.appendChild(option);
        });

        // FIX: Ensure placeholder is selected by index (0)
        skillSelect.selectedIndex = 0; 
    }

    // Attach listener to Job Domain dropdown
    jobDomainSelect.addEventListener('change', updateSkillOptions);

    // Initial call to ensure the skill dropdown is cleared/populated on load
    updateSkillOptions(); 
    
    // Function to create a new skill tag element
    function createSkillTag(skillName) {
        const skillText = skillName.trim();
        // Don't add if the text is empty or the default placeholder
        if (skillText === "" || skillText === "Select a Skill") return null;

        const span = document.createElement('span');
        span.className = 'bg-brand-accent text-brand-dark px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2 transition duration-200 ease-in-out transform hover:scale-105';
        span.innerHTML = `${skillText} <i class="fas fa-times cursor-pointer hover:text-red-600 remove-skill" aria-label="Remove skill ${skillText}"></i>`;
        return span;
    }

    // Function to add a skill
    function addSkill() {
        const skillName = skillSelect.value.trim(); // Read value from the select element
        
        // 1. Check for placeholder (value is empty string)
        // If the placeholder is selected, reset the index and exit.
        if (skillName.length === 0) { 
            skillSelect.selectedIndex = 0;
            return; 
        }

        // 2. Check for duplicates
        const existingSkills = Array.from(skillTagsContainer.querySelectorAll('span')).map(s => s.textContent.split(' ')[0].trim().toLowerCase());
        
        if (existingSkills.includes(skillName.toLowerCase())) {
            // Reset selection using selectedIndex even if duplicate to allow re-selection later
            skillSelect.selectedIndex = 0; 
            return; 
        }

        // 3. Add skill
        const newTag = createSkillTag(skillName);
        if (newTag) {
            skillTagsContainer.appendChild(newTag);
        }
        
        // 4. CRITICAL FIX: Reset the select box using selectedIndex (0)
        // This is the key step that allows the change event to fire again 
        // when the same option is subsequently re-selected.
        skillSelect.selectedIndex = 0;
    }

    // Event listener for the Add button
    const addBtn = document.getElementById('addSkillBtn');
    if (addBtn) {
        addBtn.addEventListener('click', addSkill);
    }
    
    // Event listener for selecting an option from the dropdown (also triggers addSkill)
    skillSelect.addEventListener('change', addSkill);

    // Event listener for removing a skill using event delegation on the container
    skillTagsContainer.addEventListener('click', (e) => {
        const removeIcon = e.target.closest('.remove-skill');
        if (removeIcon) {
            removeIcon.closest('span').remove();
        }
    });

    // Clear All button functionality: resets file inputs, file lists, domain and skills
    const clearAllBtn = document.getElementById('clearAllBtn');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', () => {
            // Clear all file inputs found on the page
            document.querySelectorAll('input[type="file"]').forEach(fi => { try { fi.value = ''; } catch(e) {} });

            // Clear all file list displays (there may be multiple with same id in markup)
            document.querySelectorAll('#fileList').forEach(fl => fl.innerHTML = '');

            // Reset job domain and skill dropdowns
            if (jobDomainSelect) jobDomainSelect.selectedIndex = 0;
            if (typeof updateSkillOptions === 'function') updateSkillOptions();
            if (skillSelect) skillSelect.selectedIndex = 0;

            // Remove any selected skill tags
            if (skillTagsContainer) skillTagsContainer.innerHTML = '';

            // Optionally move focus to top so user can start again
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}
// END: Skill Management Functionality
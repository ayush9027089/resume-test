/**
 * profile.js
 */

// --- 1. Mobile Menu Toggle ---
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    if (!mobileMenu) return; // Guard clause
    mobileMenu.classList.toggle('hidden');
}

// --- 2. Scroll to Top Functionality ---
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleScrollToTopButton() {
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (!scrollTopBtn) return;

    if (window.scrollY > 300) {
        scrollTopBtn.classList.remove('translate-y-24', 'opacity-0');
        scrollTopBtn.classList.add('translate-y-0', 'opacity-100');
    } else {
        scrollTopBtn.classList.remove('translate-y-0', 'opacity-100');
        scrollTopBtn.classList.add('translate-y-24', 'opacity-0');
    }
}

// --- 3. Navigation Bar Scroll Styling ---
function handleNavbarScroll() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    if (window.scrollY > 50) {
        navbar.classList.add('shadow-xl', 'border-opacity-0');
    } else {
        navbar.classList.remove('shadow-xl', 'border-opacity-0');
    }
}

// --- 4. Profile Editing Functionality ---
const editProfileModal = document.getElementById('edit-profile-modal');
const editModalContent = document.getElementById('edit-modal-content');

function loadProfileDataToForm() {
    document.getElementById('edit-name').value = document.getElementById('profile-name').textContent;
    document.getElementById('edit-title').value = document.getElementById('profile-title').textContent;
    document.getElementById('edit-location').value = document.getElementById('profile-location').textContent;
    document.getElementById('edit-about').value = document.getElementById('profile-about').textContent;
}

function openEditProfileModal() {
    if (!editProfileModal || !editModalContent) return;
    loadProfileDataToForm();
    editProfileModal.classList.remove('hidden');
    void editProfileModal.offsetWidth; 
    editProfileModal.classList.add('opacity-100');
    editModalContent.classList.remove('scale-95', 'opacity-0');
    editModalContent.classList.add('scale-100', 'opacity-100');
}

function closeEditProfileModal() {
    if (!editProfileModal || !editModalContent) return;
    editProfileModal.classList.remove('opacity-100');
    editModalContent.classList.remove('scale-100', 'opacity-100');
    editModalContent.classList.add('scale-95', 'opacity-0');
    setTimeout(() => { editProfileModal.classList.add('hidden'); }, 300);
}

function saveProfileChanges(event) {
    event.preventDefault();
    document.getElementById('profile-name').textContent = document.getElementById('edit-name').value;
    document.getElementById('profile-title').textContent = document.getElementById('edit-title').value;
    document.getElementById('profile-location').textContent = document.getElementById('edit-location').value;
    document.getElementById('profile-about').textContent = document.getElementById('edit-about').value;
    closeEditProfileModal();
}

// --- 5. Profile Photo Functionality ---
function handlePhotoUpload(event) {
    const file = event.target.files[0];
    const profilePhoto = document.getElementById('profile-photo');
    const photoPlaceholder = document.getElementById('photo-placeholder');
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            profilePhoto.src = e.target.result;
            profilePhoto.classList.remove('hidden');
            photoPlaceholder.classList.add('hidden');
        };
        reader.readAsDataURL(file);
    }
}

// --- 6. Generic Add Modal Functions ---
function openAddModal(type) {
    const modal = document.getElementById(`add-${type}-modal`);
    const content = document.getElementById(`add-${type}-modal-content`);
    const form = document.getElementById(`add-${type}-form`);
    if (!modal || !content) return;
    form.reset();
    modal.classList.remove('hidden');
    void modal.offsetWidth; 
    modal.classList.add('opacity-100');
    content.classList.remove('scale-95', 'opacity-0');
    content.classList.add('scale-100', 'opacity-100');
}

function closeAddModal(type) {
    const modal = document.getElementById(`add-${type}-modal`);
    const content = document.getElementById(`add-${type}-modal-content`);
    if (!modal || !content) return;
    modal.classList.remove('opacity-100');
    content.classList.remove('scale-100', 'opacity-100');
    content.classList.add('scale-95', 'opacity-0');
    setTimeout(() => { modal.classList.add('hidden'); }, 300);
}

// --- 7. Specific Add Functions (Experience, Education, Skill) ---
function addExperience(event) {
    event.preventDefault();
    const title = document.getElementById('exp-title').value;
    const company = document.getElementById('exp-company').value;
    const start = document.getElementById('exp-start').value;
    const end = document.getElementById('exp-end').value;
    const description = document.getElementById('exp-description').value;
    
    const container = document.getElementById('experience-container');
    const newEntry = document.createElement('div');
    newEntry.classList.add('flex', 'items-start');
    newEntry.innerHTML = `
        <div class="w-10 h-10 bg-brand-primary/10 rounded-full flex-shrink-0 flex items-center justify-center mt-1 mr-4">
            <i class="fas fa-briefcase text-brand-primary"></i>
        </div>
        <div>
            <h3 class="text-lg font-semibold text-white">${title}</h3>
            <p class="text-gray-400 text-sm">${company} | ${start} – ${end}</p>
            ${description ? `<p class="text-gray-500 text-sm mt-1">${description}</p>` : ''}
        </div>
    `;
    container.prepend(newEntry);
    closeAddModal('experience');
}

function addEducation(event) {
    event.preventDefault();
    const degree = document.getElementById('edu-degree').value;
    const school = document.getElementById('edu-school').value;
    const startYear = document.getElementById('edu-start-year').value;
    const endYear = document.getElementById('edu-end-year').value;

    const container = document.getElementById('education-container');
    const newEntry = document.createElement('div');
    newEntry.classList.add('flex', 'items-start');
    newEntry.innerHTML = `
        <div class="w-10 h-10 bg-brand-primary/10 rounded-full flex-shrink-0 flex items-center justify-center mt-1 mr-4">
            <i class="fas fa-graduation-cap text-brand-primary"></i>
        </div>
        <div>
            <h3 class="text-lg font-semibold text-white">${degree}</h3>
            <p class="text-gray-400 text-sm">${school} | ${startYear} – ${endYear}</p>
        </div>
    `;
    container.prepend(newEntry);
    closeAddModal('education');
}

function addSkill(event) {
    event.preventDefault();
    const skillName = document.getElementById('skill-name').value;
    const verified = document.getElementById('skill-verified').checked;
    const container = document.getElementById('skills-container');

    const newEntry = document.createElement('span');
    newEntry.classList.add('px-3', 'py-1', 'bg-brand-primary/20', 'text-brand-accent', 'rounded-full', 'text-sm', 'font-medium');
    newEntry.textContent = skillName;
    if (verified) { newEntry.innerHTML += ` <i class="fas fa-check-circle ml-1"></i>`; }
    container.appendChild(newEntry);
    closeAddModal('skill');
}

// --- 8. LOGOUT FUNCTIONALITY (New) ---
function handleLogout() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userName'); // Clean up name too
    localStorage.removeItem('activeJobId');
    localStorage.removeItem('jobId');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    
    // Simply redirect to home. 
    // nav.js will handle the UI state if they stay on a page that allows public access.
    window.location.href = "index.html";
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // Set Year
    const yearSpan = document.getElementById('year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    // Init AOS
    if (typeof AOS !== 'undefined') {
        AOS.init({
            disable: false, startEvent: 'DOMContentLoaded', initClassName: 'aos-init', 
            animatedClassName: 'aos-animate', useClassNames: false, disableMutationObserver: false, 
            debounceDelay: 50, throttleDelay: 99, offset: 120, delay: 0, duration: 800, 
            easing: 'ease', once: true, mirror: false, anchorPlacement: 'top-bottom',
        });
    }

    // Photo Upload
    const photoUploadInput = document.getElementById('photo-upload');
    if (photoUploadInput) {
        photoUploadInput.addEventListener('change', handlePhotoUpload);
    }
});

// Window Event Listeners
window.addEventListener('scroll', () => {
    handleScrollToTopButton();
    handleNavbarScroll();
});

handleScrollToTopButton();
handleNavbarScroll();

// Expose Global Functions
window.toggleMobileMenu = toggleMobileMenu;
window.scrollToTop = scrollToTop;
window.openEditProfileModal = openEditProfileModal;
window.closeEditProfileModal = closeEditProfileModal;
window.saveProfileChanges = saveProfileChanges;
window.openAddModal = openAddModal;
window.closeAddModal = closeAddModal;
window.addExperience = addExperience;
window.addEducation = addEducation;
window.addSkill = addSkill;
window.handleLogout = handleLogout; // Exposed Logout
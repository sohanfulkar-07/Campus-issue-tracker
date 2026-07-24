document.addEventListener('DOMContentLoaded', () => {
    // Load Faculty Profile Data from localStorage
    const profileDataStr = localStorage.getItem('facultyProfile');
    const viewProfileBtn = document.getElementById('viewProfileBtn');
    const profileModal = document.getElementById('profileModal');
    const closeProfileModal = document.getElementById('closeProfileModal');

    const updateProfileFields = (profile) => {
        const elementMap = {
            'facultyNameHeader': profile.name.split(' ')[0],
            'profileName': profile.name,
            'profileDesignation': profile.designation,
            'profileEmpId': profile.empId,
            'profileDept': profile.department,
            'profilePhone': profile.phone,
            'profileEmail': profile.email,
            'modalDesignation': profile.designation,
            'modalEmpId': profile.empId,
            'modalDept': profile.department,
            'modalPhone': profile.phone,
            'modalEmail': profile.email
        };

        for (const [id, value] of Object.entries(elementMap)) {
            const el = document.getElementById(id);
            if (el) el.textContent = value || '--';
        }

        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=0b132a&color=fff&rounded=true`;
        const headerAvatar = document.getElementById('headerAvatar');
        if (headerAvatar) headerAvatar.src = avatarUrl;

        const profileAvatar = document.getElementById('profileAvatar');
        if (profileAvatar) profileAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=0b132a&color=fff&size=100&rounded=true`;
    };

    if (profileDataStr) {
        const profile = JSON.parse(profileDataStr);
        updateProfileFields(profile);
    }

    if (viewProfileBtn && profileModal) {
        viewProfileBtn.addEventListener('click', () => {
            profileModal.classList.add('active');
            profileModal.setAttribute('aria-hidden', 'false');
        });
    }

    if (closeProfileModal && profileModal) {
        closeProfileModal.addEventListener('click', () => {
            profileModal.classList.remove('active');
            profileModal.setAttribute('aria-hidden', 'true');
        });
    }

    if (profileModal) {
        profileModal.addEventListener('click', (event) => {
            if (event.target === profileModal) {
                profileModal.classList.remove('active');
                profileModal.setAttribute('aria-hidden', 'true');
            }
        });
    }
});

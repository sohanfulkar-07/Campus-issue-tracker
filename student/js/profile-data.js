/**
 * Student Dashboard & Profile UI Hydration Script
 * Provides initializeUserProfile for immediate live form submission sync and persistent page load execution.
 */

/**
 * Core Profile DOM Injection Function
 * Updates all Navbar, Header, Sidebar, and Profile Card DOM elements with fresh user data.
 * @param {Object} [data] - Optional explicit profile data object. If omitted, fetches from localStorage.
 */
function initializeUserProfile(data) {
    // Determine profile data source: explicit data -> user-specific storage key -> role fallback key
    if (!data) {
        const userId = localStorage.getItem('currentUserId') || localStorage.getItem('currentUserEmail') || 'student_default_user';
        const userStorageKey = `user_profile_data_${userId.replace(/[^a-zA-Z0-9_@.-]/g, '_')}`;
        
        const rawData = localStorage.getItem(userStorageKey) || localStorage.getItem('studentProfile');
        if (!rawData) return;

        try {
            data = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
        } catch (e) {
            console.error('Error parsing profile data in initializeUserProfile:', e);
            return;
        }
    }

    if (!data || typeof data !== 'object') return;

    const fullName = data.name || data.FullName || 'Student';
    const firstName = fullName.split(' ')[0];
    const department = data.department || data.dept || data.Department || 'Engineering';
    const rollNo = data.rollNo || data.RollNo || data.id || '--';
    const semester = data.semester || data.sem || data.Semester || '--';
    const email = data.email || data.Email || '--';
    const phone = data.phone || data.Phone || '--';
    const regNo = data.regNo || data.RegNo || rollNo;
    const joinDate = data.joinDate || data.JoinDate || 'Aug 2021';
    
    // Avatar image URL with fallback generator
    const avatarUrl = data.avatar || data.AvatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0d6efd&color=fff&rounded=true&size=128`;

    // Helper: Safe text update across multiple IDs/classes
    const setText = (target, text) => {
        if (!target) return;
        const value = text !== undefined && text !== null ? String(text) : '--';
        
        if (Array.isArray(target)) {
            target.forEach(t => setText(t, value));
        } else if (typeof target === 'string') {
            document.querySelectorAll(target).forEach(el => {
                el.textContent = value;
            });
        }
    };

    // Helper: Safe image src update with onerror fallback
    const setAvatar = (selectors, src) => {
        const targets = Array.isArray(selectors) ? selectors : [selectors];
        targets.forEach(sel => {
            document.querySelectorAll(sel).forEach(img => {
                img.src = src;
                img.onerror = function () {
                    this.onerror = null;
                    this.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0d6efd&color=fff&rounded=true&size=128`;
                };
            });
        });
    };

    // --- 1. Top Header & Navbar Sync ---
    setText(['#studentNameHeader', '#navUserName', '#headerUserName', '.user-first-name', '#welcomeFirstName'], firstName);
    setAvatar(['#headerAvatar', '#navUserAvatar'], avatarUrl);

    // --- 2. Sidebar & Profile Card Sync ---
    setText(['#profileName', '#sidebarUserName', '.user-name', '.profile-name'], fullName);
    setText(['#profileRollNo', '#sidebarUserRole', '#studentIdBadge', '.user-roll-no'], rollNo);
    setText(['#profileDept', '#profileDeptIcon', '#sidebarUserDept', '#departmentTextBlock', '.user-dept'], department);
    setText(['#profileSem', '#profileSemIcon', '.user-sem'], semester);
    setText('#profileEmail', email);
    setText('#profilePhone', phone);
    setText('#profileRegNo', regNo);
    setText('#profileJoinDate', joinDate);

    // Profile card avatars
    setAvatar(['#profileAvatar', '#sidebarAvatar', '.user-avatar', '.profile-avatar-img'], avatarUrl);
}

// Expose globally for form submission handlers & external scripts
window.initializeUserProfile = initializeUserProfile;

// --- 2. Page Load Execution Check ---
window.addEventListener('DOMContentLoaded', () => {
    initializeUserProfile();
});

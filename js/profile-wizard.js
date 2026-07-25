/**
 * Profile Setup Wizard, Password Verification Gatekeeper & Dynamic Profile Loader
 * Handles Onboarding, Protected Profile Editing with Password Verification, LocalStorage Persistence & Live DOM Injection.
 */

(function () {
    'use strict';

    class ProfileWizard {
        constructor() {
            this.role = localStorage.getItem('currentUserRole') || this.detectRoleFromPath();
            this.userId = localStorage.getItem('currentUserId') || localStorage.getItem('currentUserEmail') || `${this.role}_default_user`;
            this.storageKey = `user_profile_data_${this.userId.replace(/[^a-zA-Z0-9_@.-]/g, '_')}`;
            
            this.init();
        }

        detectRoleFromPath() {
            const path = window.location.pathname.toLowerCase();
            if (path.includes('/student/')) return 'student';
            if (path.includes('/faculty/')) return 'faculty';
            if (path.includes('/admin/')) return 'admin';
            return 'student';
        }

        init() {
            document.addEventListener('DOMContentLoaded', () => {
                const savedProfile = this.getSavedProfile();

                if (savedProfile) {
                    // Profile exists -> Hydrate UI
                    this.applyProfileToUI(savedProfile);
                    if (typeof window.initializeUserProfile === 'function') {
                        window.initializeUserProfile(savedProfile);
                    }
                } else {
                    // New User -> Block dashboard content & open setup modal
                    this.blockDashboardContent();
                    this.injectModalStyles();
                    this.renderOnboardingModal(false); // New user mode (empty form)
                }

                // Attach listener to any Edit Profile buttons on the page
                this.bindEditProfileButtons();
            });
        }

        bindEditProfileButtons() {
            document.addEventListener('click', (e) => {
                const btn = e.target.closest('#editProfileBtn, .edit-profile-btn, [data-action="edit-profile"]');
                if (btn) {
                    e.preventDefault();
                    this.triggerPasswordVerificationGatekeeper();
                }
            });
        }

        getSavedProfile() {
            try {
                const data = localStorage.getItem(this.storageKey);
                return data ? JSON.parse(data) : null;
            } catch (e) {
                console.error('Error parsing profile from localStorage:', e);
                return null;
            }
        }

        blockDashboardContent() {
            const containers = document.querySelectorAll('.dashboard-container, main, .main-wrapper, .content-container, #app');
            containers.forEach(el => {
                el.style.filter = 'blur(6px)';
                el.style.pointerEvents = 'none';
                el.style.userSelect = 'none';
                el.setAttribute('aria-hidden', 'true');
            });
        }

        unblockDashboardContent() {
            const containers = document.querySelectorAll('.dashboard-container, main, .main-wrapper, .content-container, #app');
            containers.forEach(el => {
                el.style.filter = '';
                el.style.pointerEvents = '';
                el.style.userSelect = '';
                el.removeAttribute('aria-hidden');
            });
        }

        injectModalStyles() {
            if (document.getElementById('profile-wizard-styles')) return;

            const style = document.createElement('style');
            style.id = 'profile-wizard-styles';
            style.textContent = `
                .profile-wizard-overlay {
                    position: fixed;
                    top: 0; left: 0;
                    width: 100vw; height: 100vh;
                    background: rgba(15, 23, 42, 0.75);
                    backdrop-filter: blur(8px);
                    z-index: 99999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 1.5rem;
                    box-sizing: border-box;
                    animation: pwFadeIn 0.3s ease-out;
                }

                .profile-wizard-modal {
                    background: #ffffff;
                    color: #1e293b;
                    width: 100%;
                    max-width: 540px;
                    border-radius: 16px;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
                    overflow: hidden;
                    border: 1px solid #e2e8f0;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                }

                [data-theme="dark"] .profile-wizard-modal,
                body.dark-theme .profile-wizard-modal {
                    background: #1e293b;
                    color: #f8fafc;
                    border-color: #334155;
                }

                .pw-header {
                    background: linear-gradient(135deg, #2563eb, #1d4ed8);
                    color: #ffffff;
                    padding: 1.5rem 1.75rem;
                    text-align: center;
                    position: relative;
                }

                .pw-header h2 { margin: 0 0 0.4rem 0; font-size: 1.4rem; font-weight: 700; }
                .pw-header p { margin: 0; font-size: 0.875rem; opacity: 0.9; }

                .pw-close-btn {
                    position: absolute;
                    top: 1rem; right: 1.25rem;
                    background: rgba(255, 255, 255, 0.2);
                    border: none; color: #fff;
                    width: 32px; height: 32px; border-radius: 50%;
                    cursor: pointer; display: flex; align-items: center; justify-content: center;
                    font-size: 1rem; transition: background 0.2s ease;
                }
                .pw-close-btn:hover { background: rgba(255, 255, 255, 0.35); }

                .pw-body { padding: 1.75rem; max-height: calc(85vh - 100px); overflow-y: auto; }

                .pw-form-group { margin-bottom: 1.25rem; display: flex; flex-direction: column; gap: 0.4rem; }
                .pw-form-group label { font-size: 0.875rem; font-weight: 600; }
                .pw-form-group input, .pw-form-group select {
                    width: 100%; padding: 0.75rem 1rem;
                    border: 1.5px solid #cbd5e1; border-radius: 8px;
                    font-size: 0.95rem; box-sizing: border-box;
                    background-color: inherit; color: inherit;
                }
                .pw-form-group input:focus, .pw-form-group select:focus {
                    outline: none; border-color: #2563eb;
                    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
                }

                .pw-error-alert {
                    color: #ef4444;
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    padding: 0.65rem 0.85rem;
                    border-radius: 8px;
                    font-size: 0.85rem;
                    font-weight: 500;
                    margin-bottom: 1rem;
                    display: none;
                    animation: pwShake 0.3s ease-in-out;
                }

                .pw-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
                @media (max-width: 520px) { .pw-row { grid-template-columns: 1fr; } }

                .pw-avatar-help {
                    font-size: 0.775rem;
                    color: #64748b;
                    margin-bottom: 0.5rem;
                    display: block;
                }
                .pw-avatar-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 0.75rem;
                    margin-top: 0.5rem;
                    margin-bottom: 0.5rem;
                }
                @media (max-width: 480px) {
                    .pw-avatar-grid { grid-template-columns: repeat(4, 1fr); gap: 0.5rem; }
                }
                .pw-avatar-item {
                    position: relative;
                    cursor: pointer;
                    border-radius: 50%;
                    padding: 3px;
                    border: 3px solid transparent;
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(241, 245, 249, 0.6);
                }
                .pw-avatar-item img {
                    width: 54px;
                    height: 54px;
                    border-radius: 50%;
                    object-fit: cover;
                    display: block;
                    transition: transform 0.2s ease;
                }
                .pw-avatar-item:hover {
                    transform: translateY(-2px);
                    border-color: #94a3b8;
                }
                .pw-avatar-item.selected {
                    border: 3px solid #3B82F6;
                    box-shadow: 0 0 12px rgba(59, 130, 246, 0.5);
                    transform: scale(1.08);
                    background: rgba(59, 130, 246, 0.1);
                }
                .pw-avatar-item.selected::after {
                    content: '✓';
                    position: absolute;
                    bottom: 0;
                    right: 0;
                    background: #3B82F6;
                    color: #ffffff;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    font-size: 11px;
                    font-weight: bold;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }

                .pw-submit-btn {
                    width: 100%; padding: 0.85rem; background: #2563eb; color: #ffffff;
                    border: none; border-radius: 10px; font-size: 0.95rem; font-weight: 600;
                    cursor: pointer; margin-top: 0.75rem; transition: background-color 0.2s ease;
                    display: flex; align-items: center; justify-content: center; gap: 0.5rem;
                }
                .pw-submit-btn:hover { background: #1d4ed8; }

                #editProfileBtn, .btn-edit-profile, .edit-profile-btn {
                    background-color: #10b981 !important;
                    background: #10b981 !important;
                    color: #ffffff !important;
                    border: 1px solid #059669 !important;
                    padding: 0.45rem 0.9rem;
                    border-radius: 8px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.4rem;
                    transition: all 0.2s ease;
                    box-shadow: 0 2px 4px rgba(16, 185, 129, 0.25);
                    margin-left: 0.5rem;
                }
                #editProfileBtn:hover, #editProfileBtn:active, #editProfileBtn:focus,
                .btn-edit-profile:hover, .btn-edit-profile:active, .btn-edit-profile:focus,
                .edit-profile-btn:hover, .edit-profile-btn:active, .edit-profile-btn:focus {
                    background-color: #059669 !important;
                    background: #059669 !important;
                    color: #ffffff !important;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 8px rgba(16, 185, 129, 0.35);
                }

                @keyframes pwFadeIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
                @keyframes pwShake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
            `;
            document.head.appendChild(style);
        }

        /**
         * 2. Password Verification Gatekeeper (#passwordAuthModal)
         */
        triggerPasswordVerificationGatekeeper() {
            this.injectModalStyles();

            const existingModal = document.getElementById('passwordAuthModal');
            if (existingModal) existingModal.remove();

            const modal = document.createElement('div');
            modal.id = 'passwordAuthModal';
            modal.className = 'profile-wizard-overlay';

            modal.innerHTML = `
                <div class="profile-wizard-modal" role="dialog" aria-modal="true">
                    <div class="pw-header">
                        <h2>Security Verification</h2>
                        <p>Confirm your password to unlock and edit profile settings.</p>
                        <button class="pw-close-btn" id="closePassModalBtn">&times;</button>
                    </div>
                    <div class="pw-body">
                        <div class="pw-error-alert" id="passwordAuthError"></div>
                        <form id="passwordAuthForm">
                            <div class="pw-form-group">
                                <label for="confirmPasswordInput">Enter Account Password *</label>
                                <input type="password" id="confirmPasswordInput" required placeholder="Enter password" autofocus />
                            </div>
                            <button type="submit" class="pw-submit-btn">
                                <i class="fas fa-lock"></i> Verify & Unlock Profile
                            </button>
                        </form>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            // Close button listener
            modal.querySelector('#closePassModalBtn').addEventListener('click', () => modal.remove());

            // Submit Password Verification
            const form = modal.querySelector('#passwordAuthForm');
            const passwordInput = modal.querySelector('#confirmPasswordInput');
            const errorAlert = modal.querySelector('#passwordAuthError');

            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const enteredPassword = passwordInput.value;

                // Get stored password or fallback default
                const storedPassword = localStorage.getItem('currentUserPassword') || 
                                       localStorage.getItem('facultyPassword') || 
                                       'password123';

                if (enteredPassword && enteredPassword === storedPassword) {
                    // Password verified successfully!
                    modal.remove();
                    
                    // 3. Open Edit Profile Form pre-filled with saved profile data
                    const savedProfile = this.getSavedProfile();
                    this.renderOnboardingModal(true, savedProfile);
                } else {
                    // Password verification failed: Display red error message
                    errorAlert.textContent = "Incorrect password. Access denied.";
                    errorAlert.style.display = "block";
                    errorAlert.style.animation = 'none';
                    void errorAlert.offsetWidth; // Reflow to restart shake animation
                    errorAlert.style.animation = 'pwShake 0.4s ease-in-out';
                    passwordInput.value = "";
                    passwordInput.focus();
                }
            });
        }

        /**
         * 3. Unlock and Render Profile Setup/Edit Form with Visual Avatar Selection Grid
         */
        renderOnboardingModal(isEditMode = false, prefillData = null) {
            this.injectModalStyles();

            const existingModal = document.getElementById('profileSetupModal');
            if (existingModal) existingModal.remove();

            const overlay = document.createElement('div');
            overlay.id = 'profileSetupModal';
            overlay.className = 'profile-wizard-overlay';

            const isStudent = this.role === 'student';
            const modalTitle = isEditMode ? 'Edit Profile Details' : 'Welcome! Set Up Your Profile';
            const modalSub = isEditMode ? 'Update your personal profile information below.' : `Complete your details for your ${this.role.toUpperCase()} account.`;

            // 1. Diverse 8-Avatar Collection
            const nameSeed = this.userId || 'User';
            const avatars = [
                `https://api.dicebear.com/7.x/avataaars/svg?seed=Alex_${nameSeed}`,
                `https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia_${nameSeed}`,
                `https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus_${nameSeed}`,
                `https://api.dicebear.com/7.x/avataaars/svg?seed=Elena_${nameSeed}`,
                `https://api.dicebear.com/7.x/bottts/svg?seed=Bot1_${nameSeed}`,
                `https://api.dicebear.com/7.x/bottts/svg?seed=Bot2_${nameSeed}`,
                `https://ui-avatars.com/api/?name=${encodeURIComponent(nameSeed)}&background=3B82F6&color=fff&size=128&rounded=true`,
                `https://ui-avatars.com/api/?name=Campus+Student&background=10B981&color=fff&size=128&rounded=true`
            ];

            const currentAvatar = (prefillData && prefillData.avatar) ? prefillData.avatar : avatars[0];

            overlay.innerHTML = `
                <div class="profile-wizard-modal" role="dialog" aria-modal="true">
                    <div class="pw-header">
                        <h2>${modalTitle}</h2>
                        <p>${modalSub}</p>
                        ${isEditMode ? '<button class="pw-close-btn" id="closeEditModalBtn">&times;</button>' : ''}
                    </div>
                    <div class="pw-body">
                        <form id="pwSetupForm">
                            <input type="hidden" id="selectedAvatarInput" value="${currentAvatar}" />
                            
                            <div class="pw-form-group">
                                <label for="pwFullName">Full Name *</label>
                                <input type="text" id="pwFullName" required value="${(prefillData && prefillData.name) || ''}" placeholder="e.g. Alex Johnson" />
                            </div>

                            ${isStudent ? `
                                <div class="pw-row">
                                    <div class="pw-form-group">
                                        <label for="pwRollNo">Roll Number *</label>
                                        <input type="text" id="pwRollNo" required value="${(prefillData && (prefillData.rollNo || prefillData.id)) || ''}" placeholder="e.g. 21CS045" />
                                    </div>
                                    <div class="pw-form-group">
                                        <label for="pwSemester">Semester *</label>
                                        <select id="pwSemester" required>
                                            <option value="">Select Semester</option>
                                            ${['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', '5th Semester', '6th Semester', '7th Semester', '8th Semester'].map(sem => `
                                                <option value="${sem}" ${prefillData && (prefillData.semester === sem || prefillData.sem === sem) ? 'selected' : ''}>${sem}</option>
                                            `).join('')}
                                        </select>
                                    </div>
                                </div>
                                <div class="pw-form-group">
                                    <label for="pwDepartment">Department *</label>
                                    <select id="pwDepartment" required>
                                        <option value="">Select Department</option>
                                        ${['Computer Science & Engineering', 'Information Technology', 'Electronics & Communication', 'Mechanical Engineering', 'Civil Engineering'].map(dept => `
                                            <option value="${dept}" ${prefillData && (prefillData.department === dept || prefillData.dept === dept) ? 'selected' : ''}>${dept}</option>
                                        `).join('')}
                                    </select>
                                </div>
                            ` : `
                                <div class="pw-row">
                                    <div class="pw-form-group">
                                        <label for="pwEmpId">Employee ID *</label>
                                        <input type="text" id="pwEmpId" required value="${(prefillData && (prefillData.employeeId || prefillData.empId)) || ''}" placeholder="e.g. EMP-9042" />
                                    </div>
                                    <div class="pw-form-group">
                                        <label for="pwDepartment">Department Assignment *</label>
                                        <select id="pwDepartment" required>
                                            <option value="">Select Department</option>
                                            ${['Computer Science & Engineering', 'Information Technology', 'Electronics & Communication', 'Facilities & Maintenance', 'Administration'].map(dept => `
                                                <option value="${dept}" ${prefillData && (prefillData.department === dept || prefillData.dept === dept) ? 'selected' : ''}>${dept}</option>
                                            `).join('')}
                                        </select>
                                    </div>
                                </div>
                            `}

                            <!-- 1. Visual Avatar Grid Component -->
                            <div class="pw-form-group">
                                <label>Select Your Profile Avatar</label>
                                <span class="pw-avatar-help">Click an avatar below to personalize your profile appearance</span>
                                <div class="pw-avatar-grid" id="pwAvatarGrid">
                                    ${avatars.map((url, idx) => `
                                        <div class="pw-avatar-item ${url === currentAvatar || (idx === 0 && !prefillData) ? 'selected' : ''}" data-avatar="${url}">
                                            <img src="${url}" alt="Avatar Option ${idx + 1}" />
                                        </div>
                                    `).join('')}
                                </div>
                            </div>

                            <button type="submit" class="pw-submit-btn">
                                <i class="fas fa-save"></i> Save Profile & Update UI
                            </button>
                        </form>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);

            if (isEditMode) {
                const closeBtn = overlay.querySelector('#closeEditModalBtn');
                if (closeBtn) closeBtn.addEventListener('click', () => overlay.remove());
            }

            // 2. Interactive Selection State Handler
            let selectedAvatarUrl = currentAvatar;
            const hiddenAvatarInput = overlay.querySelector('#selectedAvatarInput');
            const avatarGridItems = overlay.querySelectorAll('.pw-avatar-item');

            avatarGridItems.forEach(item => {
                item.addEventListener('click', () => {
                    avatarGridItems.forEach(el => el.classList.remove('selected'));
                    item.classList.add('selected');
                    
                    selectedAvatarUrl = item.getAttribute('data-avatar');
                    if (hiddenAvatarInput) hiddenAvatarInput.value = selectedAvatarUrl;
                });
            });

            // 3. Form Submission & Profile Sync
            const form = overlay.querySelector('#pwSetupForm');
            form.addEventListener('submit', (e) => {
                e.preventDefault();

                const fullName = document.getElementById('pwFullName').value.trim();
                const department = document.getElementById('pwDepartment').value;
                const finalAvatar = hiddenAvatarInput ? hiddenAvatarInput.value : selectedAvatarUrl;
                
                const profileData = {
                    id: this.userId,
                    role: this.role,
                    name: fullName,
                    department: department,
                    avatar: finalAvatar,
                    updatedAt: new Date().toISOString()
                };

                if (isStudent) {
                    profileData.rollNo = document.getElementById('pwRollNo').value.trim();
                    profileData.semester = document.getElementById('pwSemester').value;
                    profileData.sem = profileData.semester;
                    profileData.dept = department;
                } else {
                    profileData.employeeId = document.getElementById('pwEmpId').value.trim();
                    profileData.empId = profileData.employeeId;
                    profileData.designation = this.role === 'admin' ? 'System Administrator' : 'Faculty Member';
                }

                // Save to localStorage under dynamic user storage key & fallback keys
                localStorage.setItem(this.storageKey, JSON.stringify(profileData));
                if (isStudent) {
                    localStorage.setItem('studentProfile', JSON.stringify(profileData));
                } else if (this.role === 'faculty') {
                    localStorage.setItem('facultyProfile', JSON.stringify(profileData));
                }

                // Instant DOM Sync across navbar, sidebar, header, & profile cards
                this.applyProfileToUI(profileData);
                if (typeof window.initializeUserProfile === 'function') {
                    window.initializeUserProfile(profileData);
                }

                // Remove modal overlay & unblock dashboard
                overlay.remove();
                this.unblockDashboardContent();
            });
        }

        applyProfileToUI(profile) {
            if (!profile) return;

            const fullName = profile.name || 'User';
            const firstName = fullName.split(' ')[0];
            const department = profile.department || profile.dept || profile.role.toUpperCase();
            const avatarUrl = profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=2563eb&color=fff`;

            const updateText = (selectors, value) => {
                selectors.forEach(selector => {
                    document.querySelectorAll(selector).forEach(el => { el.textContent = value; });
                });
            };

            const updateImage = (selectors, srcUrl) => {
                selectors.forEach(selector => {
                    document.querySelectorAll(selector).forEach(img => {
                        img.src = srcUrl;
                        img.onerror = function () {
                            this.onerror = null;
                            this.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=2563eb&color=fff&size=128`;
                        };
                    });
                });
            };

            updateText(['#navUserName', '#headerUserName', '#studentNameHeader', '#facultyNameHeader', '#adminNameHeader', '.user-name'], fullName);
            updateText(['#welcomeFirstName', '.user-first-name'], firstName);
            updateText(['#navUserDept', '#headerUserDept', '#sidebarUserDept', '#profileDept', '#modalDept', '.user-dept'], department);

            if (profile.rollNo) updateText(['#profileRollNo', '#navUserRole', '#sidebarUserRole'], profile.rollNo);
            if (profile.employeeId || profile.empId) updateText(['#profileEmpId', '#modalEmpId', '#sidebarUserRole'], profile.employeeId || profile.empId);
            if (profile.semester || profile.sem) updateText(['#profileSem', '#profileSemIcon'], profile.semester || profile.sem);

            updateImage(['#navUserAvatar', '#headerAvatar', '#sidebarAvatar', '#profileAvatar', '.user-avatar', '.profile-avatar-img'], avatarUrl);
        }
    }

    // Instantiate globally
    window.ProfileWizard = new ProfileWizard();
})();

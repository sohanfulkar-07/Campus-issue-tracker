document.addEventListener('DOMContentLoaded', () => {
    // --- UI Interactions ---
    
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');
    const closeSidebar = document.getElementById('closeSidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    // Toggle Sidebar
    if (menuToggle && sidebar && sidebarOverlay) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.add('active');
            sidebarOverlay.classList.add('active');
        });
    }

    // Close Sidebar
    const closeMenu = () => {
        if (sidebar) sidebar.classList.remove('active');
        if (sidebarOverlay) sidebarOverlay.classList.remove('active');
    };

    if (closeSidebar) closeSidebar.addEventListener('click', closeMenu);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeMenu);

    // --- Theme Selector Logic ---
    const themeSelector = document.getElementById('themeSelector');
    if (themeSelector) {
        const savedTheme = localStorage.getItem('theme') || 'system';
        themeSelector.value = savedTheme;

        themeSelector.addEventListener('change', (e) => {
            const selectedTheme = e.target.value;
            localStorage.setItem('theme', selectedTheme);
            
            if (selectedTheme === 'dark') {
                document.documentElement.setAttribute('data-theme', 'dark');
            } else if (selectedTheme === 'light') {
                document.documentElement.setAttribute('data-theme', 'light');
            } else {
                if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    document.documentElement.setAttribute('data-theme', 'dark');
                } else {
                    document.documentElement.setAttribute('data-theme', 'light');
                }
            }
        });
    }

    // --- Password Management Modal Logic ---
    const btnChangePassword = document.getElementById('btnChangePassword');
    const changePasswordModal = document.getElementById('changePasswordModal');
    const btnClosePasswordModal = document.getElementById('btnClosePasswordModal');
    const btnCancelPasswordModal = document.getElementById('btnCancelPasswordModal');
    const changePasswordForm = document.getElementById('changePasswordForm');
    const btnSavePassword = document.getElementById('btnSavePassword');

    const currentPasswordInput = document.getElementById('currentPasswordInput');
    const newPasswordInput = document.getElementById('newPasswordInput');
    const confirmPasswordInput = document.getElementById('confirmPasswordInput');

    const currentPasswordError = document.getElementById('currentPasswordError');
    const newPasswordError = document.getElementById('newPasswordError');
    const confirmPasswordError = document.getElementById('confirmPasswordError');
    const passwordAlert = document.getElementById('passwordAlert');

    const passwordStrength = document.getElementById('passwordStrength');
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');

    function resetPasswordForm() {
        if (changePasswordForm) changePasswordForm.reset();

        [currentPasswordError, newPasswordError, confirmPasswordError].forEach(el => {
            if (el) {
                el.textContent = '';
                el.style.display = 'none';
            }
        });

        [currentPasswordInput, newPasswordInput, confirmPasswordInput].forEach(input => {
            if (input) {
                input.type = 'password';
                input.style.borderColor = '';
            }
        });

        document.querySelectorAll('.btn-toggle-pwd i').forEach(icon => {
            icon.className = 'far fa-eye';
        });

        if (passwordAlert) {
            passwordAlert.className = 'alert-box';
            passwordAlert.style.display = 'none';
            passwordAlert.innerHTML = '';
        }

        if (passwordStrength) passwordStrength.style.display = 'none';
        if (strengthBar) {
            strengthBar.style.width = '0%';
            strengthBar.style.backgroundColor = '';
        }
        if (strengthText) strengthText.textContent = '';

        if (btnSavePassword) {
            btnSavePassword.disabled = false;
            btnSavePassword.textContent = 'Update Password';
        }
    }

    function openPasswordModal() {
        resetPasswordForm();
        if (changePasswordModal) {
            changePasswordModal.classList.add('active');
            setTimeout(() => {
                if (currentPasswordInput) currentPasswordInput.focus();
            }, 100);
        }
    }

    function closePasswordModal() {
        if (changePasswordModal) {
            changePasswordModal.classList.remove('active');
        }
    }

    if (btnChangePassword) btnChangePassword.addEventListener('click', openPasswordModal);
    if (btnClosePasswordModal) btnClosePasswordModal.addEventListener('click', closePasswordModal);
    if (btnCancelPasswordModal) btnCancelPasswordModal.addEventListener('click', closePasswordModal);

    if (changePasswordModal) {
        changePasswordModal.addEventListener('click', (e) => {
            if (e.target === changePasswordModal) {
                closePasswordModal();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && changePasswordModal && changePasswordModal.classList.contains('active')) {
            closePasswordModal();
        }
    });

    document.querySelectorAll('.btn-toggle-pwd').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = btn.getAttribute('data-target');
            const input = document.getElementById(targetId);
            const icon = btn.querySelector('i');
            if (input && icon) {
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.className = 'far fa-eye-slash';
                } else {
                    input.type = 'password';
                    icon.className = 'far fa-eye';
                }
            }
        });
    });

    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', () => {
            const val = newPasswordInput.value;
            if (newPasswordError) newPasswordError.style.display = 'none';

            if (!val) {
                if (passwordStrength) passwordStrength.style.display = 'none';
                return;
            }

            if (passwordStrength) passwordStrength.style.display = 'flex';

            let score = 0;
            if (val.length >= 6) score++;
            if (val.length >= 8) score++;
            if (/[A-Z]/.test(val) && /[0-9]/.test(val)) score++;
            if (/[^A-Za-z0-9]/.test(val)) score++;

            if (score <= 1) {
                strengthBar.style.width = '33%';
                strengthBar.style.backgroundColor = 'var(--danger-color)';
                strengthText.textContent = 'Weak';
                strengthText.style.color = 'var(--danger-color)';
            } else if (score <= 2) {
                strengthBar.style.width = '66%';
                strengthBar.style.backgroundColor = 'var(--warning-color)';
                strengthText.textContent = 'Medium';
                strengthText.style.color = 'var(--warning-color)';
            } else {
                strengthBar.style.width = '100%';
                strengthBar.style.backgroundColor = 'var(--success-color)';
                strengthText.textContent = 'Strong';
                strengthText.style.color = 'var(--success-color)';
            }
        });
    }

    if (currentPasswordInput) {
        currentPasswordInput.addEventListener('input', () => {
            if (currentPasswordError) currentPasswordError.style.display = 'none';
        });
    }

    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', () => {
            if (confirmPasswordError) confirmPasswordError.style.display = 'none';
        });
    }

    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const currentPass = currentPasswordInput.value.trim();
            const newPass = newPasswordInput.value.trim();
            const confirmPass = confirmPasswordInput.value.trim();
            const savedPass = localStorage.getItem('studentPassword');

            let hasError = false;

            [currentPasswordError, newPasswordError, confirmPasswordError].forEach(el => {
                if (el) {
                    el.textContent = '';
                    el.style.display = 'none';
                }
            });

            if (passwordAlert) {
                passwordAlert.className = 'alert-box';
                passwordAlert.style.display = 'none';
                passwordAlert.innerHTML = '';
            }

            if (!currentPass) {
                currentPasswordError.textContent = 'Please enter your current password.';
                currentPasswordError.style.display = 'block';
                hasError = true;
            } else if (savedPass && currentPass !== savedPass) {
                currentPasswordError.textContent = 'Incorrect current password. Please try again.';
                currentPasswordError.style.display = 'block';
                hasError = true;
            }

            if (!newPass) {
                newPasswordError.textContent = 'Please enter a new password.';
                newPasswordError.style.display = 'block';
                hasError = true;
            } else if (newPass.length < 6) {
                newPasswordError.textContent = 'New password must be at least 6 characters.';
                newPasswordError.style.display = 'block';
                hasError = true;
            } else if (savedPass && newPass === savedPass) {
                newPasswordError.textContent = 'New password cannot be the same as your current password.';
                newPasswordError.style.display = 'block';
                hasError = true;
            }

            if (!confirmPass) {
                confirmPasswordError.textContent = 'Please confirm your new password.';
                confirmPasswordError.style.display = 'block';
                hasError = true;
            } else if (newPass && confirmPass !== newPass) {
                confirmPasswordError.textContent = 'New passwords do not match.';
                confirmPasswordError.style.display = 'block';
                hasError = true;
            }

            if (hasError) return;

            localStorage.setItem('studentPassword', newPass);

            if (passwordAlert) {
                passwordAlert.className = 'alert-box success';
                passwordAlert.innerHTML = '<i class="fas fa-check-circle"></i> Password updated successfully!';
            }

            if (btnSavePassword) {
                btnSavePassword.disabled = true;
                btnSavePassword.textContent = 'Updated!';
            }

            setTimeout(() => {
                closePasswordModal();
                resetPasswordForm();
            }, 1400);
        });
    }

    // --- Campus Details Panel Logic ---
    const btnViewCampusDetails = document.getElementById('btnViewCampusDetails');
    const campusDetailsPanel = document.getElementById('campusDetailsPanel');
    const campusStudentId = document.getElementById('campusStudentId');
    const campusHostelRoom = document.getElementById('campusHostelRoom');
    const campusDepartment = document.getElementById('campusDepartment');
    const campusAcademicYear = document.getElementById('campusAcademicYear');

    function renderCampusDetails() {
        if (!campusDetailsPanel) return;

        const studentId = 'STU-' + Math.floor(100000 + Math.random() * 900000);
        const roomNumber = 'H-' + Math.floor(101 + Math.random() * 80);
        const departments = ['Computer Science', 'Mechanical', 'Electrical', 'Civil', 'Architecture', 'Business'];
        const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

        const randomDepartment = departments[Math.floor(Math.random() * departments.length)];
        const randomYear = years[Math.floor(Math.random() * years.length)];

        if (campusStudentId) campusStudentId.textContent = studentId;
        if (campusHostelRoom) campusHostelRoom.textContent = roomNumber;
        if (campusDepartment) campusDepartment.textContent = randomDepartment;
        if (campusAcademicYear) campusAcademicYear.textContent = randomYear;

        campusDetailsPanel.classList.add('active');
    }

    if (btnViewCampusDetails) {
        btnViewCampusDetails.addEventListener('click', renderCampusDetails);
    }
});

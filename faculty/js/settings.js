document.addEventListener('DOMContentLoaded', () => {
    // --- Theme Selector Logic ---
    const themeSelector = document.getElementById('themeSelector');
    if (themeSelector) {
        // Sync select with current saved theme
        const savedTheme = localStorage.getItem('theme') || 'system';
        themeSelector.value = savedTheme;

        // Handle changes
        themeSelector.addEventListener('change', (e) => {
            const selectedTheme = e.target.value;
            localStorage.setItem('theme', selectedTheme);
            
            // Apply the theme directly
            if (selectedTheme === 'dark') {
                document.documentElement.setAttribute('data-theme', 'dark');
            } else if (selectedTheme === 'light') {
                document.documentElement.setAttribute('data-theme', 'light');
            } else {
                // System default
                if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    document.documentElement.setAttribute('data-theme', 'dark');
                } else {
                    document.documentElement.setAttribute('data-theme', 'light');
                }
            }
        });
    }

    // --- Privacy Toggles Logic ---
    const togglePublicHide = document.getElementById('togglePublicHide');
    if (togglePublicHide) {
        // Load saved preference
        const isPublicHideEnabled = localStorage.getItem('facultyPublicHide') === 'true';
        togglePublicHide.checked = isPublicHideEnabled;

        // Handle changes
        togglePublicHide.addEventListener('change', (e) => {
            localStorage.setItem('facultyPublicHide', e.target.checked);
            
            if(e.target.checked) {
                // Show a toast or subtle notification in a real app
                console.log("Public Hide Enabled");
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
        
        // Reset field errors
        [currentPasswordError, newPasswordError, confirmPasswordError].forEach(el => {
            if (el) {
                el.textContent = '';
                el.style.display = 'none';
            }
        });

        // Reset inputs border and type
        [currentPasswordInput, newPasswordInput, confirmPasswordInput].forEach(input => {
            if (input) {
                input.type = 'password';
                input.style.borderColor = '';
            }
        });

        // Reset password visibility icons
        document.querySelectorAll('.btn-toggle-pwd i').forEach(icon => {
            icon.className = 'far fa-eye';
        });

        // Reset alert box
        if (passwordAlert) {
            passwordAlert.className = 'alert-box';
            passwordAlert.style.display = 'none';
            passwordAlert.innerHTML = '';
        }

        // Reset strength meter
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

    if (btnChangePassword) {
        btnChangePassword.addEventListener('click', openPasswordModal);
    }

    if (btnClosePasswordModal) {
        btnClosePasswordModal.addEventListener('click', closePasswordModal);
    }

    if (btnCancelPasswordModal) {
        btnCancelPasswordModal.addEventListener('click', closePasswordModal);
    }

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

    // Password Visibility Toggles
    const togglePwdBtns = document.querySelectorAll('.btn-toggle-pwd');
    togglePwdBtns.forEach(btn => {
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

    // Password Strength Evaluator
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

    // Form Submission
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const currentPass = currentPasswordInput.value.trim();
            const newPass = newPasswordInput.value.trim();
            const confirmPass = confirmPasswordInput.value.trim();
            const savedPass = localStorage.getItem('facultyPassword');

            let hasError = false;

            // Reset field errors
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

            // 1. Current Password Validation
            if (!currentPass) {
                currentPasswordError.textContent = 'Please enter your current password.';
                currentPasswordError.style.display = 'block';
                hasError = true;
            } else if (savedPass && currentPass !== savedPass) {
                currentPasswordError.textContent = 'Incorrect current password. Please try again.';
                currentPasswordError.style.display = 'block';
                hasError = true;
            }

            // 2. New Password Validation
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

            // 3. Confirm Password Validation
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

            // Save new password
            localStorage.setItem('facultyPassword', newPass);

            // Show success message
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
});

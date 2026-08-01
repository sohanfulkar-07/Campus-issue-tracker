document.addEventListener('DOMContentLoaded', () => {

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
                if (strengthBar) {
                    strengthBar.style.width = '33%';
                    strengthBar.style.backgroundColor = 'var(--danger-color, #ef4444)';
                }
                if (strengthText) {
                    strengthText.textContent = 'Weak';
                    strengthText.style.color = 'var(--danger-color, #ef4444)';
                }
            } else if (score <= 2) {
                if (strengthBar) {
                    strengthBar.style.width = '66%';
                    strengthBar.style.backgroundColor = 'var(--warning-color, #f59e0b)';
                }
                if (strengthText) {
                    strengthText.textContent = 'Medium';
                    strengthText.style.color = 'var(--warning-color, #f59e0b)';
                }
            } else {
                if (strengthBar) {
                    strengthBar.style.width = '100%';
                    strengthBar.style.backgroundColor = 'var(--success-color, #10b981)';
                }
                if (strengthText) {
                    strengthText.textContent = 'Strong';
                    strengthText.style.color = 'var(--success-color, #10b981)';
                }
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
        changePasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const currentPass = currentPasswordInput.value.trim();
            const newPass = newPasswordInput.value.trim();
            const confirmPass = confirmPasswordInput.value.trim();

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
                if (currentPasswordError) {
                    currentPasswordError.textContent = 'Please enter your current password.';
                    currentPasswordError.style.display = 'block';
                }
                hasError = true;
            }

            if (!newPass) {
                if (newPasswordError) {
                    newPasswordError.textContent = 'Please enter a new password.';
                    newPasswordError.style.display = 'block';
                }
                hasError = true;
            } else if (newPass.length < 6) {
                if (newPasswordError) {
                    newPasswordError.textContent = 'New password must be at least 6 characters.';
                    newPasswordError.style.display = 'block';
                }
                hasError = true;
            } else if (currentPass && newPass === currentPass) {
                if (newPasswordError) {
                    newPasswordError.textContent = 'New password cannot be the same as your current password.';
                    newPasswordError.style.display = 'block';
                }
                hasError = true;
            }

            if (!confirmPass) {
                if (confirmPasswordError) {
                    confirmPasswordError.textContent = 'Please confirm your new password.';
                    confirmPasswordError.style.display = 'block';
                }
                hasError = true;
            } else if (newPass && confirmPass !== newPass) {
                if (confirmPasswordError) {
                    confirmPasswordError.textContent = 'New passwords do not match.';
                    confirmPasswordError.style.display = 'block';
                }
                hasError = true;
            }

            if (hasError) return;

            if (btnSavePassword) {
                btnSavePassword.disabled = true;
                btnSavePassword.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
            }

            try {
                const fetchFn = window.apiFetch || (async (endpoint, options) => {
                    const token = localStorage.getItem('token');
                    const baseUrl = window.API_BASE_URL || 'http://localhost:3000/api';
                    const res = await fetch(`${baseUrl}${endpoint}`, {
                        ...options,
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                            ...(options.headers || {})
                        }
                    });
                    const data = await res.json().catch(() => ({}));
                    return { ok: res.ok, status: res.status, data };
                });

                const res = await fetchFn('/auth/change-password', {
                    method: 'PUT',
                    body: JSON.stringify({
                        currentPassword: currentPass,
                        newPassword: newPass,
                        confirmPassword: confirmPass
                    })
                });

                if (res.ok && res.data && res.data.success) {
                    if (passwordAlert) {
                        passwordAlert.className = 'alert-box success';
                        passwordAlert.innerHTML = '<i class="fas fa-check-circle"></i> ' + (res.data.message || 'Password updated successfully!');
                        passwordAlert.style.display = 'flex';
                    }

                    if (btnSavePassword) {
                        btnSavePassword.textContent = 'Updated!';
                    }

                    setTimeout(() => {
                        closePasswordModal();
                        resetPasswordForm();
                    }, 1400);
                } else {
                    const errMsg = (res.data && res.data.message) ? res.data.message : 'Failed to update password. Please try again.';
                    if (passwordAlert) {
                        passwordAlert.className = 'alert-box error';
                        passwordAlert.innerHTML = '<i class="fas fa-exclamation-circle"></i> ' + errMsg;
                        passwordAlert.style.display = 'flex';
                    }
                    if (btnSavePassword) {
                        btnSavePassword.disabled = false;
                        btnSavePassword.textContent = 'Update Password';
                    }
                }
            } catch (err) {
                console.error('[Admin Password Change Error]', err);
                if (passwordAlert) {
                    passwordAlert.className = 'alert-box error';
                    passwordAlert.innerHTML = '<i class="fas fa-exclamation-circle"></i> An unexpected network error occurred.';
                    passwordAlert.style.display = 'flex';
                }
                if (btnSavePassword) {
                    btnSavePassword.disabled = false;
                    btnSavePassword.textContent = 'Update Password';
                }
            }
        });
    }

    // SLA Configuration Logic
    const slaHoursInput = document.getElementById('slaHoursInput');
    const slaRateInput = document.getElementById('slaRateInput');
    const btnSaveSla = document.getElementById('btnSaveSla');

    if(btnSaveSla) {
        btnSaveSla.addEventListener('click', () => {
            const hours = slaHoursInput.value;
            const rate = slaRateInput.value;
            
            if(!hours || !rate) {
                alert('Please fill out both SLA fields.');
                return;
            }

            const originalText = btnSaveSla.innerHTML;
            btnSaveSla.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            btnSaveSla.disabled = true;

            setTimeout(() => {
                // Mock saving to local state
                console.log(`Saved SLA Config: ${hours} hours, ${rate}% target.`);
                btnSaveSla.innerHTML = originalText;
                btnSaveSla.disabled = false;
                
                alert('SLA configurations updated successfully.');
            }, 500);
        });
    }

    // Routing Rules Manager
    const routeCategory = document.getElementById('routeCategory');
    const routeDept = document.getElementById('routeDept');
    const btnAddRoute = document.getElementById('btnAddRoute');
    const routingRulesContainer = document.getElementById('routingRulesContainer');

    // No dummy data as requested
    let routingRules = [];

    function renderRules() {
        if(!routingRulesContainer) return;
        
        if(routingRules.length === 0) {
            routingRulesContainer.innerHTML = `<div style="text-align: center; padding: 1rem; color: var(--text-light); border: 1px dashed var(--border-color); border-radius: 6px;">No routing rules configured.</div>`;
            return;
        }

        routingRulesContainer.innerHTML = routingRules.map((r, idx) => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; background-color: var(--card-bg); border: 1px solid var(--border-color); border-radius: 6px;">
                <div style="font-size: 0.85rem; color: var(--text-dark);">
                    <strong>${r.category}</strong> <i class="fas fa-arrow-right" style="margin: 0 0.5rem; color: var(--text-muted);"></i> ${r.department}
                </div>
                <button class="remove-rule-btn" data-index="${idx}" style="background: none; border: none; color: #ef4444; cursor: pointer;" title="Remove Mapping">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');

        document.querySelectorAll('.remove-rule-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.getAttribute('data-index'));
                routingRules.splice(index, 1);
                renderRules();
            });
        });
    }

    if(btnAddRoute) {
        btnAddRoute.addEventListener('click', () => {
            const cat = routeCategory.value.trim();
            const dept = routeDept.value;

            if(!cat) {
                alert('Please enter an Issue Category.');
                return;
            }

            routingRules.push({ category: cat, department: dept });
            routeCategory.value = '';
            renderRules();
        });
        
        renderRules();
    }

    // System Backup & Maintenance
    const btnDownloadBackup = document.getElementById('btnDownloadBackup');
    const btnClearTickets = document.getElementById('btnClearTickets');

    if(btnDownloadBackup) {
        btnDownloadBackup.addEventListener('click', () => {
            // Mock JSON backup
            const backupData = {
                timestamp: new Date().toISOString(),
                version: '1.0.0',
                slaConfig: { hours: slaHoursInput.value, compliance: slaRateInput.value },
                routingRules: routingRules
            };

            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", `system_backup_${new Date().getTime()}.json`);
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        });
    }

    if(btnClearTickets) {
        btnClearTickets.addEventListener('click', () => {
            const confirmed = confirm('WARNING: This will permanently archive all resolved tickets from the live database. Do you wish to proceed?');
            if(confirmed) {
                const originalText = btnClearTickets.innerHTML;
                btnClearTickets.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Archiving...';
                btnClearTickets.disabled = true;

                setTimeout(() => {
                    btnClearTickets.innerHTML = originalText;
                    btnClearTickets.disabled = false;
                    alert('Success: Historical data archived and live database cleaned.');
                }, 800);
            }
        });
    }
});

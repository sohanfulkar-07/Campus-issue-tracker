

document.addEventListener('DOMContentLoaded', () => {
    const logoutLinks = document.querySelectorAll('.logout');
    if (logoutLinks.length > 0) {
        if (!document.getElementById('logoutConfirmModal')) {
            const modalHtml = `
                <div id="logoutConfirmModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; justify-content: center; align-items: center; backdrop-filter: blur(4px);">
                    <div style="background: var(--bg-color, #ffffff); padding: 2rem; border-radius: 12px; max-width: 400px; width: 90%; box-shadow: 0 10px 25px rgba(0,0,0,0.2); text-align: center; border: 1px solid var(--border-color, #e2e8f0);">
                        <div style="width: 60px; height: 60px; border-radius: 50%; background: #fee2e2; color: #ef4444; display: flex; justify-content: center; align-items: center; font-size: 1.5rem; margin: 0 auto 1rem auto;">
                            <i class="fas fa-sign-out-alt"></i>
                        </div>
                        <h3 style="margin: 0 0 0.5rem 0; color: var(--text-color, #1e293b); font-size: 1.25rem;">Confirm Logout</h3>
                        <p style="margin: 0 0 1.5rem 0; color: var(--text-light, #64748b);">Are you sure you want to log out of your account?</p>
                        <div style="display: flex; justify-content: center; gap: 1rem;">
                            <button id="cancelLogoutBtn" style="padding: 0.75rem 1.5rem; border: 1px solid var(--border-color, #cbd5e1); background: transparent; border-radius: 8px; cursor: pointer; color: var(--text-color, #334155); font-weight: 500; flex: 1; transition: all 0.2s;">Cancel</button>
                            <button id="proceedLogoutBtn" style="padding: 0.75rem 1.5rem; border: none; background: #ef4444; color: white; border-radius: 8px; cursor: pointer; font-weight: 500; flex: 1; transition: all 0.2s; box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.2);">Proceed</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
        }

        const logoutModal = document.getElementById('logoutConfirmModal');
        const cancelBtn = document.getElementById('cancelLogoutBtn');
        const proceedBtn = document.getElementById('proceedLogoutBtn');
        let logoutTarget = '../index.html';

        logoutLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                logoutTarget = link.getAttribute('href') || '../index.html';
                if (logoutModal) logoutModal.style.display = 'flex';
            });
        });

        if (cancelBtn) {
            cancelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (logoutModal) logoutModal.style.display = 'none';
            });
        }

        if (proceedBtn) {
            proceedBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (typeof window.unifiedLogout === 'function') {
                    window.unifiedLogout(logoutTarget);
                } else {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    localStorage.removeItem('currentUserRole');
                    localStorage.removeItem('currentUserId');
                    sessionStorage.clear();
                    window.location.href = logoutTarget || '../index.html';
                }
            });
        }
        
        if (logoutModal) {
            logoutModal.addEventListener('click', (e) => {
                if (e.target === logoutModal) {
                    logoutModal.style.display = 'none';
                }
            });
        }
    }
});

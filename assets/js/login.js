document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('unifiedLoginForm');
    const userIdInput = document.getElementById('userId');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const eyeIcon = document.getElementById('eyeIcon');
    const loginBtn = document.getElementById('loginBtn');
    const roleTabs = document.querySelectorAll('.role-tab');
    
    // Dynamic Elements
    const dynamicRoleIcon = document.getElementById('dynamicRoleIcon');
    const dynamicRoleTitle = document.getElementById('dynamicRoleTitle');
    const dynamicUserIdLabel = document.getElementById('dynamicUserIdLabel');
    
    // Default redirect
    let currentRedirect = 'student/dashboard.html';
    
    // Handle Role Tab Switching
    roleTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active from all
            roleTabs.forEach(t => t.classList.remove('active'));
            // Add active to clicked
            tab.classList.add('active');
            
            // Get data attributes
            const iconClass = tab.getAttribute('data-icon');
            const title = tab.getAttribute('data-title');
            const label = tab.getAttribute('data-label');
            currentRedirect = tab.getAttribute('data-redirect');
            
            // Trigger quick fade animation
            dynamicRoleIcon.parentElement.style.animation = 'none';
            void dynamicRoleIcon.parentElement.offsetWidth; // Reflow
            dynamicRoleIcon.parentElement.style.animation = 'fadeIn 0.3s ease';
            
            // Update UI
            dynamicRoleIcon.innerHTML = `<i class="fas ${iconClass}"></i>`;
            dynamicRoleTitle.textContent = title;
            dynamicUserIdLabel.textContent = label;
            userIdInput.placeholder = `Enter ${label.split(' ')[0]} ID`;
            
            // Clear errors on switch
            clearError(userIdInput);
            clearError(passwordInput);
        });
    });

    // Toggle Password Visibility
    togglePasswordBtn.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        if (type === 'text') {
            eyeIcon.classList.remove('fa-eye');
            eyeIcon.classList.add('fa-eye-slash');
        } else {
            eyeIcon.classList.remove('fa-eye-slash');
            eyeIcon.classList.add('fa-eye');
        }
    });
    
    // Clear error states on input
    userIdInput.addEventListener('input', () => clearError(userIdInput));
    passwordInput.addEventListener('input', () => clearError(passwordInput));
    
    // Handle Form Submission with Real Backend API (POST /api/auth/login)
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const userId = userIdInput.value.trim();
        const password = passwordInput.value;
        let isValid = true;
        
        if (!userId) {
            showError(userIdInput, `${dynamicUserIdLabel.textContent} is required`);
            isValid = false;
        }
        
        if (!password) {
            showError(passwordInput, 'Password is required');
            isValid = false;
        } else if (password.length < 6) {
            showError(passwordInput, 'Password must be at least 6 characters');
            isValid = false;
        }
        
        if (isValid) {
            loginBtn.classList.add('loading');
            
            const role = currentRedirect.includes('faculty') ? 'faculty' : (currentRedirect.includes('admin') ? 'admin' : 'student');
            const baseUrl = window.API_BASE_URL || ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
                ? 'http://localhost:3000/api'
                : 'https://campus-issue-tracker-j5bp.onrender.com/api');
            const apiUrl = `${baseUrl}/auth/login`;

            fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, password, role })
            })
            .then(async (res) => {
                let data = {};
                try {
                    data = await res.json();
                } catch (e) {
                    console.warn('[Login Parse Warning] Non-JSON or empty response received:', e);
                }
                return { res, data };
            })
            .then(({ res, data }) => {
                loginBtn.classList.remove('loading');
                if (res.ok && data.success && data.token) {
                    showToast('Success', 'Login successful. Redirecting...', 'success');
                    sessionStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    localStorage.setItem('currentUserRole', data.user.role || role);
                    localStorage.setItem('currentUserId', data.user.userId || userId);
                    
                    if (currentRedirect.includes('faculty')) {
                        localStorage.setItem('facultyPassword', password);
                    }
                    
                    setTimeout(() => {
                        window.location.href = currentRedirect;
                    }, 1000);
                } else {
                    const errorMsg = data.message || (res.status >= 500 ? 'Server error during login. Please try again.' : 'Invalid ID or Password.');
                    showToast('Authentication Failed', errorMsg, 'error');
                }
            })
            .catch(err => {
                loginBtn.classList.remove('loading');
                console.error('[Login Error]', err);
                showToast('Server Error', 'Unable to connect to authentication server.', 'error');
            });
        } else {
            showToast('Validation Error', 'Please check your input fields.', 'error');
        }
    });
    
    function showError(inputElement, message) {
        const inputGroup = inputElement.closest('.input-group');
        const errorElement = inputGroup.querySelector('.error-message');
        
        inputGroup.classList.add('error');
        errorElement.textContent = message;
        
        const wrapper = inputElement.closest('.input-wrapper');
        wrapper.style.animation = 'none';
        void wrapper.offsetWidth;
        wrapper.style.animation = 'shake 0.4s ease-in-out';
    }
    
    function clearError(inputElement) {
        const inputGroup = inputElement.closest('.input-group');
        const errorElement = inputGroup.querySelector('.error-message');
        
        inputGroup.classList.remove('error');
        errorElement.textContent = '';
    }
    
    function showToast(title, message, type = 'error') {
        const toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) return;
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const iconClass = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
        
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas ${iconClass}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
        `;
        
        toastContainer.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 4000);
    }
});

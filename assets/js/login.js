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
    
    // Handle Form Submission
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
            
            setTimeout(() => {
                loginBtn.classList.remove('loading');
                
                if (userId && password.length >= 6) {
                    showToast('Success', 'Login successful. Redirecting...', 'success');
                    
                    let role = 'student';
                    if (currentRedirect.includes('faculty')) role = 'faculty';
                    if (currentRedirect.includes('admin')) role = 'admin';
                    
                    localStorage.setItem('currentUserRole', role);
                    localStorage.setItem('currentUserId', userId);
                    localStorage.setItem('currentUserPassword', password);
                    
                    // Save password for faculty edit profile feature
                    if (currentRedirect.includes('faculty')) {
                        localStorage.setItem('facultyPassword', password);
                    }
                    
                    setTimeout(() => {
                        if (currentRedirect.includes('student')) {
                            window.location.href = 'student/onboarding.html';
                            return;
                        } else if (currentRedirect.includes('faculty')) {
                            window.location.href = 'faculty/onboarding.html';
                            return;
                        }
                        window.location.href = currentRedirect;
                    }, 1500);
                } else {
                    showToast('Authentication Failed', 'Invalid ID or Password.', 'error');
                }
            }, 1500);
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

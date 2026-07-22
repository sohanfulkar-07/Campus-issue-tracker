document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const btnEditProfile = document.getElementById('btnEditProfile');
    const btnSaveProfile = document.getElementById('btnSaveProfile');
    const btnCancelEdit = document.getElementById('btnCancelEdit');
    const formControls = document.querySelectorAll('#profileForm .form-control');
    
    // Modal Elements
    const passwordModal = document.getElementById('passwordModal');
    const verifyPasswordInput = document.getElementById('verifyPasswordInput');
    const btnVerifyPassword = document.getElementById('btnVerifyPassword');
    const btnCancelModal = document.getElementById('btnCancelModal');
    const passwordErrorMsg = document.getElementById('passwordErrorMsg');
    
    // Load initial data
    function loadProfileToForm() {
        const profileDataStr = localStorage.getItem('facultyProfile');
        if (profileDataStr) {
            const profile = JSON.parse(profileDataStr);
            document.getElementById('displayName').textContent = profile.name;
            document.getElementById('editName').value = profile.name;
            document.getElementById('editDesignation').value = profile.designation;
            document.getElementById('editEmpId').value = profile.empId;
            document.getElementById('editDept').value = profile.department;
            document.getElementById('editPhone').value = profile.phone;
            document.getElementById('editEmail').value = profile.email;
            
            const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=0b132a&color=fff&size=120&rounded=true`;
            document.getElementById('pageAvatar').src = avatarUrl;
        }
    }
    
    loadProfileToForm();
    
    // Toggle Form Edit State
    function setFormEditable(isEditable) {
        formControls.forEach(ctrl => {
            if (isEditable) {
                ctrl.removeAttribute('readonly');
            } else {
                ctrl.setAttribute('readonly', 'true');
            }
        });
        
        if (isEditable) {
            btnEditProfile.style.display = 'none';
            btnSaveProfile.style.display = 'inline-flex';
            btnCancelEdit.style.display = 'inline-flex';
            document.getElementById('editName').focus();
        } else {
            btnEditProfile.style.display = 'inline-flex';
            btnSaveProfile.style.display = 'none';
            btnCancelEdit.style.display = 'none';
        }
    }
    
    // Modal Interactions
    btnEditProfile.addEventListener('click', () => {
        passwordModal.classList.add('active');
        verifyPasswordInput.value = '';
        verifyPasswordInput.focus();
        passwordErrorMsg.style.display = 'none';
    });
    
    btnCancelModal.addEventListener('click', () => {
        passwordModal.classList.remove('active');
    });
    
    // Verify Password
    btnVerifyPassword.addEventListener('click', () => {
        const enteredPassword = verifyPasswordInput.value;
        const savedPassword = localStorage.getItem('facultyPassword');
        
        // Check if matching (or if no password was saved during dev, allow 'password')
        if (enteredPassword === savedPassword || (!savedPassword && enteredPassword.length >= 6)) {
            passwordModal.classList.remove('active');
            setFormEditable(true);
        } else {
            passwordErrorMsg.style.display = 'block';
            
            // Add shake animation
            verifyPasswordInput.style.animation = 'none';
            void verifyPasswordInput.offsetWidth;
            verifyPasswordInput.style.animation = 'shake 0.4s ease-in-out';
        }
    });
    
    // Allow enter key to submit password
    verifyPasswordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            btnVerifyPassword.click();
        }
    });
    
    // Cancel Edit
    btnCancelEdit.addEventListener('click', () => {
        setFormEditable(false);
        loadProfileToForm(); // Reset values to saved state
    });
    
    // Save Edit
    btnSaveProfile.addEventListener('click', () => {
        const updatedProfile = {
            name: document.getElementById('editName').value,
            designation: document.getElementById('editDesignation').value,
            empId: document.getElementById('editEmpId').value,
            department: document.getElementById('editDept').value,
            phone: document.getElementById('editPhone').value,
            email: document.getElementById('editEmail').value
        };
        
        localStorage.setItem('facultyProfile', JSON.stringify(updatedProfile));
        setFormEditable(false);
        loadProfileToForm(); // Update UI with new values
        
        // Also update the header avatar from profile-data.js dynamically
        const headerAvatar = document.getElementById('headerAvatar');
        if (headerAvatar) {
            headerAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(updatedProfile.name)}&background=0b132a&color=fff&rounded=true`;
        }
    });
});

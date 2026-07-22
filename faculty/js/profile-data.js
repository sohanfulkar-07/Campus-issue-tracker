document.addEventListener('DOMContentLoaded', () => {
    // Load Faculty Profile Data from localStorage
    const profileDataStr = localStorage.getItem('facultyProfile');
    
    if (profileDataStr) {
        const profile = JSON.parse(profileDataStr);
        
        // Element IDs mapped to object keys
        const elementMap = {
            'facultyNameHeader': profile.name.split(' ')[0], // First name for header
            'profileName': profile.name,
            'profileDesignation': profile.designation,
            'profileEmpId': profile.empId,
            'profileDept': profile.department,
            'profilePhone': profile.phone,
            'profileEmail': profile.email
        };
        
        // Update text content
        for (const [id, value] of Object.entries(elementMap)) {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        }
        
        // Update Avatars
        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=0b132a&color=fff&rounded=true`;
        
        const headerAvatar = document.getElementById('headerAvatar');
        if (headerAvatar) headerAvatar.src = avatarUrl;
        
        const profileAvatar = document.getElementById('profileAvatar');
        if (profileAvatar) profileAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=0b132a&color=fff&size=100&rounded=true`;
    }
});

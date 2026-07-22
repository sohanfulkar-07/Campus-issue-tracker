document.addEventListener('DOMContentLoaded', () => {
    const rawData = localStorage.getItem('studentProfile');
    if (!rawData) return;
    
    const profile = JSON.parse(rawData);
    
    // Update elements safely if they exist in the DOM
    const setText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    };
    
    const updateAvatar = (id, name) => {
        const el = document.getElementById(id);
        if (el) {
            el.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0d6efd&color=fff&rounded=true&size=128`;
        }
    };

    // Global / Header
    setText('studentNameHeader', profile.name.split(' ')[0]); // First name
    updateAvatar('headerAvatar', profile.name);
    
    // Profile Cards (Dashboard & Profile page)
    setText('profileName', profile.name);
    updateAvatar('profileAvatar', profile.name);
    setText('profileRollNo', profile.rollNo);
    
    // Detailed Profile Page Only
    setText('profileDept', profile.dept);
    setText('profileSem', profile.sem);
    setText('profileEmail', profile.email);
    setText('profilePhone', profile.phone);
    setText('profileRegNo', profile.regNo);
    setText('profileJoinDate', profile.joinDate);
    
    setText('profileDeptIcon', profile.dept);
    setText('profileSemIcon', profile.sem);
});

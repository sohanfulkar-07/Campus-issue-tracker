document.addEventListener('DOMContentLoaded', () => {
    // --- UI Interactions ---
    
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');
    const closeSidebar = document.getElementById('closeSidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    // Toggle Sidebar
    menuToggle.addEventListener('click', () => {
        sidebar.classList.add('active');
        sidebarOverlay.classList.add('active');
    });

    // Close Sidebar
    const closeMenu = () => {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
    };

    closeSidebar.addEventListener('click', closeMenu);
    sidebarOverlay.addEventListener('click', closeMenu);

    // --- Contact Support Toggle ---
    const contactSupportBtn = document.getElementById('contactSupportBtn');
    const supportDetails = document.getElementById('supportDetails');
    if (contactSupportBtn && supportDetails) {
        contactSupportBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const isOpen = supportDetails.classList.contains('active');
            if (isOpen) {
                supportDetails.classList.remove('active');
                contactSupportBtn.innerHTML = 'Contact Support';
            } else {
                supportDetails.classList.add('active');
                contactSupportBtn.innerHTML = '<i class="fas fa-chevron-up"></i> Hide Support Info';
            }
        });
    }

    // Notifications are rendered by the shared notification engine.
});

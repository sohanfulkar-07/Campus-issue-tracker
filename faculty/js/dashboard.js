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


    // --- Mock Data Rendering for Faculty ---
    
    // (Table rendering is handled by dashboard-data.js)

    // Notifications Data for Faculty
    const notificationsData = [];

    // Render Notifications
    const notificationsList = document.getElementById('notificationsList');
    if (notificationsList) {
        let notifHtml = '';
        notificationsData.forEach(notif => {
            notifHtml += `
                <div class="notification-item">
                    <div class="notif-icon ${notif.iconBg}">
                        <i class="${notif.icon}"></i>
                    </div>
                    <div class="notif-content">
                        <p class="notif-text">${notif.text}</p>
                        <span class="notif-time">${notif.time}</span>
                    </div>
                    ${notif.unread ? '<div class="notif-indicator"></div>' : ''}
                </div>
            `;
        });
        notificationsList.innerHTML = notifHtml;
    }
});

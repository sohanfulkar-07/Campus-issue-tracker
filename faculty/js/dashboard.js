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
    
    // Assigned Issues Data from Master Array
    const issuesData = JSON.parse(localStorage.getItem('campus_tickets_master') || '[]');

    // Render Issues Table
    const tableBody = document.getElementById('issuesTableBody');
    if (tableBody) {
        if (issuesData.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem;">No issues assigned yet.</td></tr>`;
        } else {
            let html = '';
            const displayIssues = issuesData.slice(0, 5);
            displayIssues.forEach(issue => {
                // Map flat properties to UI styles
                let priorityClass = issue.priority === 'High' ? 'priority-high' : (issue.priority === 'Critical' ? 'priority-high' : 'priority-medium');
                let statusClass = 'status-pending';
                if(issue.status === 'Resolved') statusClass = 'status-resolved';
                if(issue.status === 'In Progress') statusClass = 'status-in-progress';
                if(issue.status === 'New / Unassigned') statusClass = 'status-pending';

                html += `
                    <tr>
                        <td class="td-id">${issue.id}</td>
                        <td><strong>${issue.title}</strong></td>
                        <td>
                            <div class="user-cell">
                                <i class="far fa-user"></i> ${issue.user || 'Unknown User'}
                            </div>
                        </td>
                        <td><span class="badge-priority ${priorityClass}">${issue.priority}</span></td>
                        <td><span class="badge-status ${statusClass}">${issue.status}</span></td>
                        <td>${issue.date}</td>
                        <td>
                            <div class="action-links">
                                <a href="#" class="action-link">View</a>
                                <a href="#" class="action-link">Update</a>
                            </div>
                        </td>
                    </tr>
                `;
            });
            tableBody.innerHTML = html;
            
            const viewAllBtn = document.getElementById('viewAllIssuesContainer');
            if (viewAllBtn) {
                if (issuesData.length > 5) {
                    viewAllBtn.style.display = 'block';
                } else {
                    viewAllBtn.style.display = 'none';
                }
            }
        }
    }

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

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


    // --- Mock Data Rendering ---
    
    // Complaints Data from Master Array
    const complaintsData = JSON.parse(localStorage.getItem('campus_tickets_master') || '[]');

    // Render Complaints Table
    const tableBody = document.getElementById('complaintsTableBody');
    if (tableBody) {
        if (complaintsData.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem;">No complaints reported yet.</td></tr>`;
        } else {
            let html = '';
            const displayComplaints = complaintsData.slice(0, 5);
            displayComplaints.forEach(complaint => {
                // Map flat properties to UI styles
                let priorityClass = complaint.priority === 'High' ? 'priority-high' : (complaint.priority === 'Critical' ? 'priority-high' : 'priority-medium');
                let statusClass = 'status-pending';
                if(complaint.status === 'Resolved') statusClass = 'status-resolved';
                if(complaint.status === 'In Progress') statusClass = 'status-in-progress';

                html += `
                    <tr>
                        <td class="td-id">${complaint.id}</td>
                        <td><strong>${complaint.title}</strong></td>
                        <td>
                            <div class="category-cell">
                                <i class="fas fa-tag" style="color: #64748b"></i> 
                                ${complaint.department || complaint.category}
                            </div>
                        </td>
                        <td><span class="badge-priority ${priorityClass}">${complaint.priority}</span></td>
                        <td><span class="badge-status ${statusClass}">${complaint.status}</span></td>
                        <td>${complaint.date}</td>
                        <td>
                            <a href="#" class="action-view"><i class="far fa-eye"></i> View</a>
                        </td>
                    </tr>
                `;
            });
            tableBody.innerHTML = html;

            const viewAllBtn = document.getElementById('viewAllComplaintsContainer');
            if (viewAllBtn) {
                if (complaintsData.length > 5) {
                    viewAllBtn.style.display = 'block';
                } else {
                    viewAllBtn.style.display = 'none';
                }
            }
        }
    }

    // Notifications Data
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

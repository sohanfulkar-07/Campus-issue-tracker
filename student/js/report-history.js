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

    // --- Mock Data Rendering for History Table ---
    
    // History Data Array (Empty by default for dynamic rendering)
    const historyData = [];

    const tableBody = document.getElementById('historyTableBody');
    if (tableBody) {
        if (historyData.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem;">No complaints found in history.</td></tr>`;
        } else {
            let html = '';
            historyData.forEach(complaint => {
                html += `
                    <tr>
                        <td class="td-id">${complaint.id}</td>
                        <td><strong>${complaint.title}</strong></td>
                        <td>
                            <div class="category-cell">
                                <i class="${complaint.category.icon}" style="color: ${complaint.category.color}"></i> 
                                ${complaint.category.name}
                            </div>
                        </td>
                        <td><span class="badge-priority ${complaint.priority.class}">${complaint.priority.level}</span></td>
                        <td><span class="badge-status ${complaint.status.class}">${complaint.status.state}</span></td>
                        <td>${complaint.date}</td>
                        <td>
                            <a href="#" class="action-view"><i class="far fa-eye"></i> View</a>
                        </td>
                    </tr>
                `;
            });
            tableBody.innerHTML = html;
        }
    }
});

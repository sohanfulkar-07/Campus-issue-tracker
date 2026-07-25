document.addEventListener('DOMContentLoaded', () => {
    // 1. Get complaints from local storage
    const complaintsStr = localStorage.getItem('campus_tickets_master');
    const complaints = complaintsStr ? JSON.parse(complaintsStr) : [];

    // Sort newest first
    complaints.sort((a, b) => new Date(b.date) - new Date(a.date));

    // 2. Helper to get status badge class
    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'New / Unassigned': return 'status-pending';
            case 'In Progress': return 'status-progress';
            case 'Resolved': return 'status-resolved';
            default: return 'status-pending';
        }
    };

    // 3. Update Dashboard Stats if we are on dashboard.html
    const statTotal = document.getElementById('statTotal');
    const statPending = document.getElementById('statPending');
    const statInProgress = document.getElementById('statInProgress');
    const statResolved = document.getElementById('statResolved');

    if (statTotal) {
        statTotal.textContent = complaints.length;
        statPending.textContent = complaints.filter(c => c.status === 'New / Unassigned').length;
        statInProgress.textContent = complaints.filter(c => c.status === 'In Progress').length;
        statResolved.textContent = complaints.filter(c => c.status === 'Resolved').length;

        // Link stat cards to report history with filters
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach(card => {
            card.style.cursor = 'pointer';
            card.addEventListener('click', () => {
                let filter = 'all';
                if (card.classList.contains('stat-yellow')) filter = 'New / Unassigned';
                if (card.classList.contains('stat-green')) filter = 'In Progress';
                if (card.classList.contains('stat-purple')) filter = 'Resolved';

                window.location.href = `report-history.html?filter=${encodeURIComponent(filter)}`;
            });
        });
    }

    // 4. Render Table Rows Helper
    const renderRows = (data, limit = 0) => {
        if (data.length === 0) {
            return `<tr><td colspan="7" style="text-align: center; padding: 2rem;">No complaints found.</td></tr>`;
        }

        const rows = (limit > 0 ? data.slice(0, limit) : data).map(c => `
            <tr>
                <td><strong>${c.id}</strong></td>
                <td>${c.title}</td>
                <td>${c.department || c.category}</td>
                <td><span class="badge ${c.priority === 'High' || c.priority === 'Critical' ? 'badge-danger' : 'badge-primary'}">${c.priority}</span></td>
                <td><span class="status-badge ${getStatusBadgeClass(c.status)}">${c.status.toUpperCase()}</span></td>
                <td>${c.date}</td>
                <td>
                    <button class="btn-outline-sm"><i class="far fa-eye"></i> View</button>
                </td>
            </tr>
        `).join('');
        return rows;
    };

    // 5. Update Dashboard Table (only 5 items)
    const dashboardTable = document.getElementById('complaintsTableBody');
    if (dashboardTable) {
        dashboardTable.innerHTML = renderRows(complaints, 5);

        // Show "View All" link if > 5
        const viewAllContainer = document.getElementById('viewAllComplaintsContainer');
        if (viewAllContainer) {
            viewAllContainer.style.display = complaints.length > 5 ? 'block' : 'none';
        }
    }

    // 6. Update Report History Table (all items, with filter)
    const historyTable = document.getElementById('historyTableBody');
    const filterSelect = document.getElementById('statusFilter');

    if (historyTable) {
        // Check URL params for initial filter
        const urlParams = new URLSearchParams(window.location.search);
        const urlFilter = urlParams.get('filter');
        if (urlFilter && filterSelect) {
            filterSelect.value = urlFilter;
        }

        const renderHistory = () => {
            const filterValue = filterSelect ? filterSelect.value : 'all';
            let filteredData = complaints;

            if (filterValue !== 'all') {
                filteredData = complaints.filter(c => c.status === filterValue);
            }

            historyTable.innerHTML = renderRows(filteredData, 0);
        };

        // Initial render
        renderHistory();

        // Handle filter changes
        if (filterSelect) {
            filterSelect.addEventListener('change', renderHistory);
        }
    }
});

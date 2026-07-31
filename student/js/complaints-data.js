document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const apiUrl = (window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1'))
        ? 'http://localhost:3000/api/issues/my-issues'
        : '/api/issues/my-issues';

    fetch(apiUrl, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(res => res.json())
    .then(data => {
        const complaints = data.success ? data.data : [];
        renderStudentDashboard(complaints);
    })
    .catch(err => {
        console.error('[Fetch Student Issues Error]', err);
        renderStudentDashboard([]);
    });

    function getStatusBadgeClass(status) {
        switch (status) {
            case 'New / Unassigned': return 'status-pending';
            case 'In Progress': return 'status-progress';
            case 'Resolved': return 'status-resolved';
            case 'Rejected': return 'status-danger';
            default: return 'status-pending';
        }
    }

    function renderStudentDashboard(complaints) {
        const statTotal = document.getElementById('statTotal');
        const statPending = document.getElementById('statPending');
        const statInProgress = document.getElementById('statInProgress');
        const statResolved = document.getElementById('statResolved');

        if (statTotal) {
            statTotal.textContent = complaints.length;
            if (statPending) statPending.textContent = complaints.filter(c => c.status === 'New / Unassigned').length;
            if (statInProgress) statInProgress.textContent = complaints.filter(c => c.status === 'In Progress').length;
            if (statResolved) statResolved.textContent = complaints.filter(c => c.status === 'Resolved').length;

            const statCards = document.querySelectorAll('.stat-card');
            statCards.forEach(card => {
                card.style.cursor = 'pointer';
                card.onclick = () => {
                    let filter = 'all';
                    if (card.classList.contains('stat-yellow')) filter = 'New / Unassigned';
                    if (card.classList.contains('stat-green')) filter = 'In Progress';
                    if (card.classList.contains('stat-purple')) filter = 'Resolved';
                    window.location.href = `report-history.html?filter=${encodeURIComponent(filter)}`;
                };
            });
        }

        const dashboardTable = document.getElementById('complaintsTableBody');
        if (dashboardTable) {
            dashboardTable.innerHTML = renderRows(complaints, 5);

            const viewAllContainer = document.getElementById('viewAllComplaintsContainer');
            if (viewAllContainer) {
                viewAllContainer.style.display = complaints.length > 5 ? 'block' : 'none';
            }
        }

        const historyTable = document.getElementById('historyTableBody');
        const filterSelect = document.getElementById('statusFilter');

        if (historyTable) {
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

            renderHistory();
            if (filterSelect) {
                filterSelect.onchange = renderHistory;
            }
        }
    }

    function renderRows(data, limit = 0) {
        if (data.length === 0) {
            return `<tr><td colspan="7" style="text-align: center; padding: 2rem;">No complaints found.</td></tr>`;
        }

        return (limit > 0 ? data.slice(0, limit) : data).map(c => `
            <tr>
                <td><strong>${c.id}</strong></td>
                <td>${c.title}</td>
                <td>${c.category || 'General'}</td>
                <td><span class="badge ${c.priority === 'High' || c.priority === 'Critical' ? 'badge-danger' : 'badge-primary'}">${c.priority}</span></td>
                <td><span class="status-badge ${getStatusBadgeClass(c.status)}">${c.status.toUpperCase()}</span></td>
                <td>${c.date}</td>
                <td>
                    <button class="btn-outline-sm"><i class="far fa-eye"></i> View</button>
                </td>
            </tr>
        `).join('');
    }
});

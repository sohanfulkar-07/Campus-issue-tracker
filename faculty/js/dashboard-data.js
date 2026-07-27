document.addEventListener('DOMContentLoaded', () => {
    
    // Function to render everything
    function renderDashboard() {
        const complaintsStr = localStorage.getItem('campus_tickets_master');
        const complaints = complaintsStr ? JSON.parse(complaintsStr) : [];
        
        // 1. Update Stats
        const statTotal = document.getElementById('statTotal');
        const statPending = document.getElementById('statPending');
        const statInProgress = document.getElementById('statInProgress');
        const statResolved = document.getElementById('statResolved');
        
        if (statTotal) {
            statTotal.textContent = complaints.length;
            statPending.textContent = complaints.filter(c => c.status === 'New / Unassigned').length;
            statInProgress.textContent = complaints.filter(c => c.status === 'In Progress').length;
            statResolved.textContent = complaints.filter(c => c.status === 'Resolved').length;
        }

        // 2. Render Table (Pending and In Progress only)
        const tableBody = document.getElementById('issuesTableBody');
        if (tableBody) {
            const activeComplaints = complaints
                .filter(c => c.status === 'New / Unassigned' || c.status === 'In Progress')
                .sort((a, b) => new Date(b.date) - new Date(a.date));

            if (activeComplaints.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem;">No active issues assigned.</td></tr>`;
            } else {
                tableBody.innerHTML = activeComplaints.map(c => `
                    <tr>
                        <td><strong>${c.id}</strong></td>
                        <td>${c.title}</td>
                        <td>Student</td>
                        <td><span class="badge ${c.priority === 'High' || c.priority === 'Critical' ? 'badge-danger' : 'badge-primary'}">${c.priority}</span></td>
                        <td>
                            <span class="status-badge ${c.status === 'New / Unassigned' ? 'status-pending' : 'status-progress'}">
                                ${(c.status || 'Unknown').toUpperCase()}
                            </span>
                        </td>
                        <td>${c.date}</td>
                        <td>
                            <div style="display: flex; gap: 0.5rem;">
                                ${c.status === 'New / Unassigned' ? 
                                    `<button class="btn-outline-sm btn-mark-progress" data-id="${c.id}" title="Mark In Progress"><i class="fas fa-play"></i></button>` 
                                    : ''}
                                <button class="btn-outline-sm btn-resolve" data-id="${c.id}" title="Resolve Issue" style="color: var(--success-color); border-color: var(--success-color);"><i class="fas fa-check"></i></button>
                            </div>
                        </td>
                    </tr>
                `).join('');
                
                // Add Event Listeners to Buttons
                document.querySelectorAll('.btn-mark-progress').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const id = e.currentTarget.getAttribute('data-id');
                        updateComplaintStatus(id, 'In Progress');
                    });
                });
                
                document.querySelectorAll('.btn-resolve').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const id = e.currentTarget.getAttribute('data-id');
                        updateComplaintStatus(id, 'Resolved');
                    });
                });
            }
        }
    }

    // Function to update status in localStorage
    function updateComplaintStatus(id, newStatus) {
        let complaints = JSON.parse(localStorage.getItem('campus_tickets_master') || '[]');
        const index = complaints.findIndex(c => c.id === id);
        
        if (index !== -1) {
            complaints[index].status = newStatus;
            localStorage.setItem('campus_tickets_master', JSON.stringify(complaints));
            
            // Re-render dashboard to reflect changes instantly
            renderDashboard();
        }
    }

    // Initial render
    renderDashboard();
});

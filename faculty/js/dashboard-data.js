document.addEventListener('DOMContentLoaded', () => {
    
    // Function to render everything
    function renderDashboard() {
        const complaintsStr = localStorage.getItem('studentComplaints');
        const complaints = complaintsStr ? JSON.parse(complaintsStr) : [];
        
        // 1. Update Stats
        const statTotal = document.getElementById('statTotal');
        const statPending = document.getElementById('statPending');
        const statInProgress = document.getElementById('statInProgress');
        const statResolved = document.getElementById('statResolved');
        
        if (statTotal) {
            statTotal.textContent = complaints.length;
            statPending.textContent = complaints.filter(c => c.status === 'pending').length;
            statInProgress.textContent = complaints.filter(c => c.status === 'in progress').length;
            statResolved.textContent = complaints.filter(c => c.status === 'resolved').length;
        }

        // 2. Render Table (Pending and In Progress only)
        const tableBody = document.getElementById('issuesTableBody');
        if (tableBody) {
            const activeComplaints = complaints
                .filter(c => c.status === 'pending' || c.status === 'in progress')
                .sort((a, b) => new Date(b.date) - new Date(a.date));

            if (activeComplaints.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem;">No active issues assigned.</td></tr>`;
            } else {
                tableBody.innerHTML = activeComplaints.map(c => `
                    <tr>
                        <td><strong>${c.id}</strong></td>
                        <td>${c.title}</td>
                        <td>Student</td>
                        <td><span class="badge ${c.category.includes('Emergency') ? 'badge-danger' : 'badge-primary'}">Normal</span></td>
                        <td>
                            <span class="status-badge ${c.status === 'pending' ? 'status-pending' : 'status-progress'}">
                                ${c.status.toUpperCase()}
                            </span>
                        </td>
                        <td>${new Date(c.date).toLocaleDateString()}</td>
                        <td>
                            <div style="display: flex; gap: 0.5rem;">
                                ${c.status === 'pending' ? 
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
                        updateComplaintStatus(id, 'in progress');
                    });
                });
                
                document.querySelectorAll('.btn-resolve').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const id = e.currentTarget.getAttribute('data-id');
                        updateComplaintStatus(id, 'resolved');
                    });
                });
            }
        }
    }

    // Function to update status in localStorage
    function updateComplaintStatus(id, newStatus) {
        let complaints = JSON.parse(localStorage.getItem('studentComplaints') || '[]');
        const index = complaints.findIndex(c => c.id === id);
        
        if (index !== -1) {
            complaints[index].status = newStatus;
            localStorage.setItem('studentComplaints', JSON.stringify(complaints));
            
            // Re-render dashboard to reflect changes instantly
            renderDashboard();
        }
    }

    // Initial render
    renderDashboard();
});

document.addEventListener('DOMContentLoaded', () => {
    
    function renderResolvedHistory() {
        const complaintsStr = localStorage.getItem('studentComplaints');
        const complaints = complaintsStr ? JSON.parse(complaintsStr) : [];
        
        // Filter for only resolved issues
        const resolvedComplaints = complaints
            .filter(c => c.status === 'resolved')
            .sort((a, b) => new Date(b.date) - new Date(a.date));
            
        const tableBody = document.getElementById('resolvedTableBody');
        
        if (tableBody) {
            if (resolvedComplaints.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem;">No resolved issues found in history.</td></tr>`;
            } else {
                tableBody.innerHTML = resolvedComplaints.map(c => `
                    <tr>
                        <td><strong>${c.id}</strong></td>
                        <td>${c.title}</td>
                        <td>Student</td>
                        <td><span class="badge ${c.category.includes('Emergency') ? 'badge-danger' : 'badge-primary'}">Normal</span></td>
                        <td>
                            <span class="status-badge status-resolved">
                                RESOLVED
                            </span>
                        </td>
                        <td>${new Date(c.date).toLocaleDateString()}</td>
                        <td>
                            <button class="btn-outline-sm"><i class="far fa-eye"></i> View</button>
                        </td>
                    </tr>
                `).join('');
            }
        }
    }

    renderResolvedHistory();
});

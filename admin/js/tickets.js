document.addEventListener('DOMContentLoaded', () => {
    // 1. DOM Elements
    const tableBody = document.getElementById('ticketsTableBody');
    const searchInput = document.getElementById('searchTickets');
    const statusFilter = document.getElementById('filterStatus');
    const priorityFilter = document.getElementById('filterPriority');
    const categoryFilter = document.getElementById('filterCategory');
    const deptFilter = document.getElementById('filterDept');
    
    const statTotal = document.getElementById('statTotal');
    const statOpen = document.getElementById('statOpen');
    const statResolved = document.getElementById('statResolved');

    // Modal Elements
    const modal = document.getElementById('ticketModal');
    const closeBtn = document.getElementById('closeModalBtn');
    const cancelBtn = document.getElementById('cancelModalBtn');
    const saveBtn = document.getElementById('saveModalBtn');
    
    const modalTitle = document.getElementById('modalTicketTitle');
    const modalId = document.getElementById('modalTicketId');
    const modalUser = document.getElementById('modalTicketUser');
    const modalCategory = document.getElementById('modalTicketCategory');
    const modalDept = document.getElementById('modalTicketDept');
    const modalDesc = document.getElementById('modalTicketDesc');
    const modalLayer = document.getElementById('modalTicketLayer');
    const modalStatus = document.getElementById('modalStatusSelect');

    let currentEditingId = null;

    // 2. Fetch Tickets from Backend API (GET /api/issues)
    function fetchTickets() {
        const token = localStorage.getItem('token');
        const statusVal = statusFilter ? statusFilter.value : 'All';
        const priorityVal = priorityFilter ? priorityFilter.value : 'All';
        const categoryVal = categoryFilter ? categoryFilter.value : 'All';
        const deptVal = deptFilter ? deptFilter.value : 'All';
        const searchVal = searchInput ? searchInput.value.trim() : '';

        const queryParams = new URLSearchParams();
        if (statusVal !== 'All') queryParams.append('status', statusVal);
        if (priorityVal !== 'All') queryParams.append('priority', priorityVal);
        if (categoryVal !== 'All') queryParams.append('category', categoryVal);
        if (deptVal !== 'All') queryParams.append('department', deptVal);
        if (searchVal) queryParams.append('search', searchVal);

        const baseUrl = window.API_BASE_URL || ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
            ? 'http://localhost:3000/api'
            : 'https://campus-issue-tracker-j5bp.onrender.com/api');

        const apiUrl = `${baseUrl}/issues?${queryParams.toString()}`;

        fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(res => res.json())
        .then(data => {
            const tickets = data.success ? data.data : [];
            renderTable(tickets);
        })
        .catch(err => {
            console.error('[Admin Tickets Fetch Error]', err);
            renderTable([]);
        });
    }

    // 3. Render Table
    function renderTable(tickets) {
        // Update Stats
        if (statTotal) statTotal.textContent = tickets.length;
        if (statOpen) statOpen.textContent = tickets.filter(t => t.status === 'New / Unassigned').length;
        if (statResolved) statResolved.textContent = tickets.filter(t => t.status === 'Resolved').length;

        // Render HTML
        if (!tableBody) return;

        if (tickets.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 3rem; color: var(--text-light);">No tickets found matching your criteria.</td></tr>`;
            return;
        }

        tableBody.innerHTML = tickets.map(t => {
            // Priority Badge
            let priorityHtml = '';
            if(t.priority === 'High' || t.priority === 'Critical') priorityHtml = `<span style="background: #fee2e2; color: #ef4444; padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600;">${t.priority}</span>`;
            else if(t.priority === 'Medium') priorityHtml = `<span style="background: #fef3c7; color: #d97706; padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600;">Medium</span>`;
            else priorityHtml = `<span style="background: #e0f2fe; color: #0284c7; padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600;">Low</span>`;

            // Status Badge
            let statusHtml = '';
            if(t.status === 'New / Unassigned') statusHtml = `<span style="background: #fee2e2; color: #ef4444; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; border: 1px solid #fecaca;"><i class="fas fa-exclamation-circle" style="margin-right:4px;"></i>New</span>`;
            else if(t.status === 'In Progress') statusHtml = `<span style="background: #fffbeb; color: #d97706; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; border: 1px solid #fde68a;"><i class="fas fa-spinner fa-spin" style="margin-right:4px;"></i>In Progress</span>`;
            else if(t.status === 'Resolved') statusHtml = `<span style="background: #d1fae5; color: #059669; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; border: 1px solid #a7f3d0;"><i class="fas fa-check-circle" style="margin-right:4px;"></i>Resolved</span>`;
            else statusHtml = `<span style="background: #f3f4f6; color: #374151; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">${t.status}</span>`;

            const deptText = t.assignedFaculty ? (t.assignedFaculty.department || t.department) : (t.department && t.department !== t.category ? t.department : 'Unassigned');

            return `
                <tr>
                    <td style="font-weight: 600; color: var(--primary-blue); padding: 1rem 1.5rem;">${t.id}</td>
                    <td style="font-weight: 500; color: var(--text-dark);">${t.title}</td>
                    <td><span style="background: rgba(99, 102, 241, 0.15); color: #818cf8; padding: 0.25rem 0.6rem; border-radius: 4px; font-size: 0.8rem; font-weight: 500;">${t.category || 'General'}</span></td>
                    <td>${deptText}</td>
                    <td>${t.user || 'Student'}</td>
                    <td>${priorityHtml}</td>
                    <td>${statusHtml}</td>
                    <td style="color: var(--text-muted); font-size: 0.8rem;">${t.date}</td>
                    <td style="text-align: center; padding: 1rem 1.5rem;">
                        <button class="view-btn" data-id="${t.id}" style="background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.35); padding: 0.45rem 0.9rem; border-radius: 6px; cursor: pointer; color: #60a5fa; font-weight: 600; font-size: 0.8rem; transition: all 0.2s;">
                            <i class="fas fa-eye" style="margin-right: 4px; color: #60a5fa;"></i> View
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        // Attach event listeners to new buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                openModal(e.currentTarget.getAttribute('data-id'));
            });
        });
    }

    // 4. Filtering Event Listeners
    if (searchInput) searchInput.addEventListener('input', fetchTickets);
    if (statusFilter) statusFilter.addEventListener('change', fetchTickets);
    if (priorityFilter) priorityFilter.addEventListener('change', fetchTickets);
    if (categoryFilter) categoryFilter.addEventListener('change', fetchTickets);
    if (deptFilter) deptFilter.addEventListener('change', fetchTickets);

    // 5. Modal Logic with Live Backend Fetch (GET /api/issues/:id)
    function openModal(id) {
        currentEditingId = id;
        const token = localStorage.getItem('token');
        const baseUrl = window.API_BASE_URL || ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
            ? 'http://localhost:3000/api'
            : 'https://campus-issue-tracker-j5bp.onrender.com/api');
        const apiUrl = `${baseUrl}/issues/${id}`;

        fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(res => res.json())
        .then(resData => {
            if (!resData.success || !resData.data) {
                alert('Issue details not found');
                return;
            }

            const ticket = resData.data;
            if (modalTitle) modalTitle.textContent = ticket.title || 'Untitled Ticket';
            if (modalId) modalId.textContent = ticket.id || '#TKT-0000';
            if (modalUser) modalUser.textContent = ticket.user || 'Student';
            if (modalCategory) modalCategory.textContent = ticket.category || 'General';
            if (modalDept) modalDept.textContent = ticket.assignedFaculty ? (ticket.assignedFaculty.department || ticket.department) : (ticket.department && ticket.department !== ticket.category ? ticket.department : 'Unassigned');
            if (modalDesc) modalDesc.textContent = ticket.description || 'No description provided.';
            
            const layerText = (ticket.category && ticket.location) ? `${ticket.category} -> ${ticket.location}` : (ticket.category || 'General');
            if (modalLayer) modalLayer.textContent = layerText;

            if (modalStatus) modalStatus.value = ticket.status || 'New / Unassigned';

            if (modal) modal.style.display = 'flex';
        })
        .catch(err => {
            console.error('[Fetch Issue Details Error]', err);
            alert('Error loading issue details.');
        });
    }

    function closeModal() {
        if (modal) modal.style.display = 'none';
        currentEditingId = null;
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if(e.target === modal) closeModal();
        });
    }

    // Save Changes via PUT /api/issues/:id/status
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            if(currentEditingId) {
                const token = localStorage.getItem('token');
                const originalText = saveBtn.innerHTML;
                saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
                saveBtn.disabled = true;

                const baseUrl = window.API_BASE_URL || ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
                    ? 'http://localhost:3000/api'
                    : 'https://campus-issue-tracker-j5bp.onrender.com/api');
                const apiUrl = `${baseUrl}/issues/${currentEditingId}/status`;

                fetch(apiUrl, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        status: modalStatus ? modalStatus.value : 'New / Unassigned'
                    })
                })
                .then(res => res.json())
                .then(data => {
                    saveBtn.innerHTML = originalText;
                    saveBtn.disabled = false;
                    if (data.success) {
                        closeModal();
                        fetchTickets();
                    } else {
                        alert('Error updating status: ' + (data.message || 'Server error'));
                    }
                })
                .catch(err => {
                    console.error('[Save Status Error]', err);
                    saveBtn.innerHTML = originalText;
                    saveBtn.disabled = false;
                    alert('Network error saving status update.');
                });
            }
        });
    }

    // Initial fetch
    fetchTickets();
});

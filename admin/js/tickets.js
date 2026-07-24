document.addEventListener('DOMContentLoaded', () => {
    // 1. Dummy Data Array
    let tickets = [];

    // 2. DOM Elements
    const tableBody = document.getElementById('ticketsTableBody');
    const searchInput = document.getElementById('searchTickets');
    const statusFilter = document.getElementById('filterStatus');
    const priorityFilter = document.getElementById('filterPriority');
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
    const modalDept = document.getElementById('modalTicketDept');
    const modalDesc = document.getElementById('modalTicketDesc');
    const modalLayer = document.getElementById('modalTicketLayer');
    const modalStatus = document.getElementById('modalStatusSelect');

    let currentEditingId = null;

    // 3. Render Function
    function renderTable() {
        const searchTerm = searchInput.value.toLowerCase();
        const statusVal = statusFilter.value;
        const priorityVal = priorityFilter.value;
        const deptVal = deptFilter.value;

        // Filter data
        const filtered = tickets.filter(t => {
            const matchesSearch = t.title.toLowerCase().includes(searchTerm) || 
                                  t.id.toLowerCase().includes(searchTerm) || 
                                  t.user.toLowerCase().includes(searchTerm);
            const matchesStatus = statusVal === 'All' || t.status === statusVal;
            const matchesPriority = priorityVal === 'All' || t.priority === priorityVal;
            const matchesDept = deptVal === 'All' || t.department === deptVal;
            
            return matchesSearch && matchesStatus && matchesPriority && matchesDept;
        });

        // Update Stats
        statTotal.textContent = filtered.length;
        statOpen.textContent = filtered.filter(t => t.status === 'Open').length;
        statResolved.textContent = filtered.filter(t => t.status === 'Resolved').length;

        // Render HTML
        if (filtered.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 3rem; color: var(--text-light);">No tickets found matching your criteria.</td></tr>`;
            return;
        }

        tableBody.innerHTML = filtered.map(t => {
            // Priority Badge
            let priorityHtml = '';
            if(t.priority === 'High') priorityHtml = `<span style="background: #fee2e2; color: #ef4444; padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600;">High</span>`;
            else if(t.priority === 'Medium') priorityHtml = `<span style="background: #fef3c7; color: #d97706; padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600;">Medium</span>`;
            else priorityHtml = `<span style="background: #e0f2fe; color: #0284c7; padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600;">Low</span>`;

            // Status Badge
            let statusHtml = '';
            if(t.status === 'Open') statusHtml = `<span style="background: #fee2e2; color: #ef4444; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; border: 1px solid #fecaca;"><i class="fas fa-exclamation-circle" style="margin-right:4px;"></i>Open</span>`;
            else if(t.status === 'In Progress') statusHtml = `<span style="background: #fffbeb; color: #d97706; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; border: 1px solid #fde68a;"><i class="fas fa-spinner fa-spin" style="margin-right:4px;"></i>In Progress</span>`;
            else statusHtml = `<span style="background: #d1fae5; color: #059669; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; border: 1px solid #a7f3d0;"><i class="fas fa-check-circle" style="margin-right:4px;"></i>Resolved</span>`;

            return `
                <tr>
                    <td style="font-weight: 600; color: var(--primary-blue); padding: 1rem 1.5rem;">${t.id}</td>
                    <td style="font-weight: 500; color: var(--text-dark);">${t.title}</td>
                    <td>${t.department}</td>
                    <td>${t.user}</td>
                    <td>${priorityHtml}</td>
                    <td>${statusHtml}</td>
                    <td style="color: var(--text-muted); font-size: 0.8rem;">${t.date}</td>
                    <td style="text-align: center; padding: 1rem 1.5rem;">
                        <button class="view-btn" data-id="${t.id}" style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 0.4rem 0.8rem; border-radius: 4px; cursor: pointer; color: var(--text-dark); font-weight: 500; font-size: 0.8rem; transition: all 0.2s;">
                            <i class="fas fa-eye" style="margin-right: 4px; color: var(--text-muted);"></i> View
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        // Attach event listeners to new buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Optional: visual hover effect handled by css, but inline script adds dynamic behavior
                openModal(e.currentTarget.getAttribute('data-id'));
            });
            
            // Add a simple hover effect since it's inline styled
            btn.addEventListener('mouseover', function() { this.style.background = '#e2e8f0'; });
            btn.addEventListener('mouseout', function() { this.style.background = '#f1f5f9'; });
        });
    }

    // 4. Filtering Event Listeners
    searchInput.addEventListener('input', renderTable);
    statusFilter.addEventListener('change', renderTable);
    priorityFilter.addEventListener('change', renderTable);
    deptFilter.addEventListener('change', renderTable);

    // 5. Modal Logic
    function openModal(id) {
        const ticket = tickets.find(t => t.id === id);
        if(!ticket) return;

        currentEditingId = id;
        
        modalTitle.textContent = ticket.title;
        modalId.textContent = ticket.id;
        modalUser.textContent = ticket.user;
        modalDept.textContent = ticket.department;
        modalDesc.textContent = ticket.description;
        modalLayer.textContent = ticket.layer;
        modalStatus.value = ticket.status;

        modal.style.display = 'flex';
    }

    function closeModal() {
        modal.style.display = 'none';
        currentEditingId = null;
    }

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    // Close on overlay click
    modal.addEventListener('click', (e) => {
        if(e.target === modal) closeModal();
    });

    saveBtn.addEventListener('click', () => {
        if(currentEditingId) {
            const ticketIndex = tickets.findIndex(t => t.id === currentEditingId);
            if(ticketIndex !== -1) {
                // Add some visual feedback
                const originalText = saveBtn.innerHTML;
                saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
                saveBtn.disabled = true;

                setTimeout(() => {
                    tickets[ticketIndex].status = modalStatus.value;
                    renderTable();
                    closeModal();
                    
                    saveBtn.innerHTML = originalText;
                    saveBtn.disabled = false;
                }, 400); // simulate network delay for better UX
            }
        }
    });

    // Initial render
    renderTable();
});

document.addEventListener('DOMContentLoaded', () => {
    // 1. Master User Data Array (No dummy data as requested)
    let users = [];
    
    // Internal ID counter for new creations
    let nextUserId = 1;

    // 2. DOM Elements
    const tableBody = document.getElementById('usersTableBody');
    const searchInput = document.getElementById('searchUsers');
    const roleFilter = document.getElementById('filterRole');
    
    const addUserBtn = document.getElementById('addUserBtn');

    // Modal Elements
    const modal = document.getElementById('userModal');
    const closeBtn = document.getElementById('closeUserModalBtn');
    const cancelBtn = document.getElementById('cancelUserModalBtn');
    const saveBtn = document.getElementById('saveUserModalBtn');
    
    const modalTitle = document.getElementById('modalUserTitle');
    const modalName = document.getElementById('modalUserName');
    const modalEmail = document.getElementById('modalUserEmail');
    const modalRole = document.getElementById('modalUserRole');
    const modalDept = document.getElementById('modalUserDept');

    let currentEditingId = null;

    // Handle Department dropdown disabled state based on Role
    modalRole.addEventListener('change', () => {
        if (modalRole.value === 'Student') {
            modalDept.value = 'None';
            modalDept.disabled = true;
            modalDept.style.opacity = '0.6';
        } else {
            modalDept.disabled = false;
            modalDept.style.opacity = '1';
        }
    });

    // 3. Render Function
    function renderTable() {
        const searchTerm = searchInput.value.toLowerCase();
        const roleVal = roleFilter.value;

        // Filter data
        const filtered = users.filter(u => {
            const matchesSearch = u.name.toLowerCase().includes(searchTerm) || 
                                  u.email.toLowerCase().includes(searchTerm);
            const matchesRole = roleVal === 'All' || u.role === roleVal;
            
            return matchesSearch && matchesRole;
        });

        // Render HTML
        if (filtered.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 3rem; color: var(--text-light);">No users found matching your criteria.</td></tr>`;
            return;
        }

        tableBody.innerHTML = filtered.map(u => {
            // Avatar
            const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=e2e8f0&color=475569&rounded=true`;
            
            // Role Badge
            let roleHtml = '';
            if(u.role === 'Super Admin') roleHtml = `<span style="background: #e0e7ff; color: #4338ca; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">Super Admin</span>`;
            else if(u.role === 'Department Admin') roleHtml = `<span style="background: #fce7f3; color: #be185d; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">Dept Admin</span>`;
            else if(u.role === 'Faculty') roleHtml = `<span style="background: #e0f2fe; color: #0284c7; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">Faculty</span>`;
            else roleHtml = `<span style="background: #f1f5f9; color: #475569; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">Student</span>`;

            // Status Toggle Badge
            const isAct = u.status === 'Active';
            const statusBg = isAct ? '#d1fae5' : '#fee2e2';
            const statusColor = isAct ? '#059669' : '#ef4444';
            const statusBorder = isAct ? '#a7f3d0' : '#fecaca';
            
            const statusHtml = `
                <button class="status-toggle-btn" data-id="${u.id}" style="background: ${statusBg}; color: ${statusColor}; padding: 0.2rem 0.8rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; border: 1px solid ${statusBorder}; cursor: pointer; transition: opacity 0.2s;" title="Toggle Status">
                    ${isAct ? 'Active' : 'Inactive'}
                </button>
            `;

            return `
                <tr>
                    <td style="padding: 1rem 1.5rem;"><img src="${avatarUrl}" alt="Avatar" style="width: 32px; height: 32px; border-radius: 50%;"></td>
                    <td style="font-weight: 500; color: var(--text-dark);">${u.name}</td>
                    <td style="color: var(--text-muted);">${u.email}</td>
                    <td>${roleHtml}</td>
                    <td><span style="color: var(--text-muted);">${u.department}</span></td>
                    <td>${statusHtml}</td>
                    <td style="text-align: center; padding: 1rem 1.5rem;">
                        <button class="edit-btn" data-id="${u.id}" style="background: transparent; border: none; cursor: pointer; color: var(--primary-blue); font-size: 0.9rem; margin-right: 0.5rem; transition: color 0.2s;" title="Edit User">
                            <i class="fas fa-edit"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        // Attach listeners for Edit
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.getAttribute('data-id'));
                openModal(id);
            });
            btn.addEventListener('mouseover', function() { this.style.color = 'var(--primary-blue-hover)'; });
            btn.addEventListener('mouseout', function() { this.style.color = 'var(--primary-blue)'; });
        });

        // Attach listeners for Status Toggle
        document.querySelectorAll('.status-toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.getAttribute('data-id'));
                toggleStatus(id);
            });
            btn.addEventListener('mouseover', function() { this.style.opacity = '0.8'; });
            btn.addEventListener('mouseout', function() { this.style.opacity = '1'; });
        });
    }

    // 4. Action Functions
    searchInput.addEventListener('input', renderTable);
    roleFilter.addEventListener('change', renderTable);

    function toggleStatus(id) {
        const user = users.find(u => u.id === id);
        if(user) {
            user.status = user.status === 'Active' ? 'Inactive' : 'Active';
            renderTable();
        }
    }

    // 5. Modal Logic
    addUserBtn.addEventListener('click', () => {
        openModal(null); // null means new user
    });

    function openModal(id) {
        currentEditingId = id;
        
        if (id) {
            // Edit Mode
            const user = users.find(u => u.id === id);
            if(!user) return;
            
            modalTitle.textContent = 'Edit User';
            modalName.value = user.name;
            modalEmail.value = user.email;
            modalRole.value = user.role;
            modalDept.value = user.department;
            
        } else {
            // Add Mode
            modalTitle.textContent = 'Add New User';
            modalName.value = '';
            modalEmail.value = '';
            modalRole.value = 'Student';
            modalDept.value = 'None';
        }
        
        // Trigger change event to set department field disabled state correctly
        modalRole.dispatchEvent(new Event('change'));
        
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
        // Basic validation
        if(!modalName.value.trim() || !modalEmail.value.trim()) {
            alert('Please fill in both name and email.');
            return;
        }

        const newUserData = {
            name: modalName.value.trim(),
            email: modalEmail.value.trim(),
            role: modalRole.value,
            department: modalDept.value
        };

        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        saveBtn.disabled = true;

        setTimeout(() => {
            if (currentEditingId) {
                // Update existing
                const index = users.findIndex(u => u.id === currentEditingId);
                if(index !== -1) {
                    users[index] = { ...users[index], ...newUserData };
                }
            } else {
                // Add new
                users.push({
                    id: nextUserId++,
                    ...newUserData,
                    status: 'Active' // Default to active for new users
                });
            }
            
            renderTable();
            closeModal();
            
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
        }, 300); // Simulate network delay
    });

    // Initial render
    renderTable();
});

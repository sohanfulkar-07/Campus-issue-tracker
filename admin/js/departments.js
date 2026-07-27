document.addEventListener('DOMContentLoaded', () => {
    // 1. Master Departments Array (No dummy data as requested)
    let departments = [];
    
    // Internal ID counter
    let nextDeptId = 1;

    // 2. DOM Elements
    const gridContainer = document.getElementById('departmentsGrid');
    const searchInput = document.getElementById('searchDepts');
    const addDeptBtn = document.getElementById('addDeptBtn');

    // Modal Elements
    const modal = document.getElementById('deptModal');
    const closeBtn = document.getElementById('closeDeptModalBtn');
    const cancelBtn = document.getElementById('cancelDeptModalBtn');
    const saveBtn = document.getElementById('saveDeptModalBtn');
    
    const modalTitle = document.getElementById('modalDeptTitle');
    const modalName = document.getElementById('modalDeptName');
    const modalManager = document.getElementById('modalDeptManager');
    const modalSla = document.getElementById('modalDeptSla');
    
    const categoryTagsContainer = document.getElementById('modalCategoryTags');
    const newCategoryInput = document.getElementById('newCategoryInput');
    const addCategoryBtn = document.getElementById('addCategoryBtn');

    let currentEditingId = null;
    let currentModalCategories = []; // working array for tags

    // 3. Render Function
    function renderGrid() {
        const searchTerm = searchInput.value.toLowerCase();

        // Filter data
        const filtered = departments.filter(d => {
            return d.name.toLowerCase().includes(searchTerm) || 
                   d.manager.toLowerCase().includes(searchTerm);
        });

        // Render HTML
        if (filtered.length === 0) {
            gridContainer.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem; background: var(--card-bg); border-radius: var(--border-radius); border: 1px solid var(--border-color); color: var(--text-light);">No departments found matching your criteria.</div>`;
            return;
        }

        gridContainer.innerHTML = filtered.map(d => {
            const tagsHtml = d.categories.map(cat => `<span class="dept-tag">#${cat}</span>`).join('');
            
            return `
                <div class="dept-card">
                    <div class="dept-card-header">
                        <h3 class="dept-card-title">${d.name}</h3>
                    </div>
                    
                    <div class="dept-manager-info">
                        <div class="dept-icon-wrapper">
                            <i class="fas fa-tools"></i>
                        </div>
                        <div class="dept-manager-details">
                            <p>Manager:</p>
                            <h4>${d.manager}</h4>
                        </div>
                    </div>

                    <div class="dept-stats-row">
                        <span>Active Load: <strong>${d.activeTickets} Tickets</strong></span>
                        <div style="display:flex; gap: -5px;">
                            <img src="https://ui-avatars.com/api/?name=U1&background=random&color=fff&rounded=true&size=24" style="border: 2px solid #fff; border-radius: 50%; margin-left: -5px;">
                            <img src="https://ui-avatars.com/api/?name=U2&background=random&color=fff&rounded=true&size=24" style="border: 2px solid #fff; border-radius: 50%; margin-left: -5px;">
                            <div style="width: 24px; height: 24px; border-radius: 50%; background: #475569; color: white; display: flex; justify-content: center; align-items: center; font-size: 0.6rem; border: 2px solid #fff; margin-left: -5px;">AD</div>
                        </div>
                    </div>

                    <div class="dept-sla-row">
                        <div class="dept-sla-item">
                            <p>SLA Target:</p>
                            <h4>< ${d.slaHours} hrs</h4>
                        </div>
                        <div class="dept-sla-item">
                            <p>Compliance:</p>
                            <h4>${d.compliance}%</h4>
                        </div>
                    </div>

                    <div class="dept-tags-section">
                        <h4>Assigned Issue Categories</h4>
                        <div class="dept-tags-container">
                            ${tagsHtml || '<span style="font-size: 0.75rem; color: var(--text-light);">No routing rules assigned.</span>'}
                        </div>
                    </div>

                    <div class="dept-actions">
                        <button class="dept-btn dept-btn-outline edit-btn" data-id="${d.id}">
                            <i class="fas fa-pen" style="margin-right: 4px;"></i> Edit Details
                        </button>
                        <button class="dept-btn dept-btn-outline route-btn" data-id="${d.id}">
                            Routing Rules
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // Attach listeners
        document.querySelectorAll('.edit-btn, .route-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.getAttribute('data-id'));
                openModal(id);
            });
        });
    }

    // 4. Listeners
    searchInput.addEventListener('input', renderGrid);

    // 5. Modal & Tag Logic
    addDeptBtn.addEventListener('click', () => {
        openModal(null);
    });

    function renderModalTags() {
        categoryTagsContainer.innerHTML = currentModalCategories.map((cat, idx) => `
            <div style="background: var(--primary-blue); color: white; padding: 0.25rem 0.6rem; border-radius: 12px; font-size: 0.75rem; font-weight: 500; display: flex; align-items: center; gap: 0.4rem;">
                #${cat}
                <i class="fas fa-times remove-tag-btn" data-index="${idx}" style="cursor: pointer; opacity: 0.8;"></i>
            </div>
        `).join('');

        document.querySelectorAll('.remove-tag-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.getAttribute('data-index'));
                currentModalCategories.splice(index, 1);
                renderModalTags();
            });
        });
    }

    addCategoryBtn.addEventListener('click', () => {
        const val = newCategoryInput.value.trim();
        if(val && !currentModalCategories.includes(val)) {
            currentModalCategories.push(val);
            newCategoryInput.value = '';
            renderModalTags();
        }
    });

    newCategoryInput.addEventListener('keypress', (e) => {
        if(e.key === 'Enter') {
            e.preventDefault(); // Prevent form submission
            addCategoryBtn.click();
        }
    });

    function openModal(id) {
        currentEditingId = id;
        
        if (id) {
            const dept = departments.find(d => d.id === id);
            if(!dept) return;
            
            modalTitle.textContent = 'Edit Department';
            modalName.value = dept.name;
            modalManager.value = dept.managerEmail || dept.manager;
            modalSla.value = dept.slaHours;
            currentModalCategories = [...dept.categories];
            
        } else {
            modalTitle.textContent = 'Add New Department';
            modalName.value = '';
            modalManager.value = '';
            modalSla.value = '24';
            currentModalCategories = [];
        }
        
        renderModalTags();
        modal.style.display = 'flex';
    }

    function closeModal() {
        modal.style.display = 'none';
        currentEditingId = null;
    }

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    modal.addEventListener('click', (e) => {
        if(e.target === modal) closeModal();
    });

    saveBtn.addEventListener('click', () => {
        if(!modalName.value.trim() || !modalManager.value.trim() || !modalSla.value) {
            alert('Please fill in all required fields.');
            return;
        }

        const newDeptData = {
            name: modalName.value.trim(),
            manager: modalManager.value.trim(), // Normally would resolve to a name, but we'll use email/name here
            managerEmail: modalManager.value.trim(),
            slaHours: modalSla.value,
            categories: [...currentModalCategories],
            // Simulated data for view consistency
            activeTickets: currentEditingId ? departments.find(d => d.id === currentEditingId).activeTickets : 0,
            compliance: currentEditingId ? departments.find(d => d.id === currentEditingId).compliance : 100
        };

        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        saveBtn.disabled = true;

        setTimeout(() => {
            if (currentEditingId) {
                const index = departments.findIndex(d => d.id === currentEditingId);
                if(index !== -1) {
                    departments[index] = { ...departments[index], ...newDeptData };
                }
            } else {
                departments.push({
                    id: nextDeptId++,
                    ...newDeptData
                });
            }
            
            renderGrid();
            closeModal();
            
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
        }, 300);
    });

    // Initial render
    renderGrid();
});

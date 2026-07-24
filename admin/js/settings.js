document.addEventListener('DOMContentLoaded', () => {

    // Theme logic (if not handled globally)
    const themeSelector = document.getElementById('themeSelector');
    if (themeSelector) {
        themeSelector.addEventListener('change', (e) => {
            const val = e.target.value;
            // Simulated theme change (in reality, applies data-theme on body)
            if (val === 'dark') {
                document.body.setAttribute('data-theme', 'dark');
            } else if (val === 'light') {
                document.body.setAttribute('data-theme', 'light');
            } else {
                document.body.removeAttribute('data-theme');
            }
        });
    }

    // SLA Configuration Logic
    const slaHoursInput = document.getElementById('slaHoursInput');
    const slaRateInput = document.getElementById('slaRateInput');
    const btnSaveSla = document.getElementById('btnSaveSla');

    if(btnSaveSla) {
        btnSaveSla.addEventListener('click', () => {
            const hours = slaHoursInput.value;
            const rate = slaRateInput.value;
            
            if(!hours || !rate) {
                alert('Please fill out both SLA fields.');
                return;
            }

            const originalText = btnSaveSla.innerHTML;
            btnSaveSla.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            btnSaveSla.disabled = true;

            setTimeout(() => {
                // Mock saving to local state
                console.log(`Saved SLA Config: ${hours} hours, ${rate}% target.`);
                btnSaveSla.innerHTML = originalText;
                btnSaveSla.disabled = false;
                
                alert('SLA configurations updated successfully.');
            }, 500);
        });
    }

    // Routing Rules Manager
    const routeCategory = document.getElementById('routeCategory');
    const routeDept = document.getElementById('routeDept');
    const btnAddRoute = document.getElementById('btnAddRoute');
    const routingRulesContainer = document.getElementById('routingRulesContainer');

    // No dummy data as requested
    let routingRules = [];

    function renderRules() {
        if(!routingRulesContainer) return;
        
        if(routingRules.length === 0) {
            routingRulesContainer.innerHTML = `<div style="text-align: center; padding: 1rem; color: var(--text-light); border: 1px dashed var(--border-color); border-radius: 6px;">No routing rules configured.</div>`;
            return;
        }

        routingRulesContainer.innerHTML = routingRules.map((r, idx) => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; background-color: var(--card-bg); border: 1px solid var(--border-color); border-radius: 6px;">
                <div style="font-size: 0.85rem; color: var(--text-dark);">
                    <strong>${r.category}</strong> <i class="fas fa-arrow-right" style="margin: 0 0.5rem; color: var(--text-muted);"></i> ${r.department}
                </div>
                <button class="remove-rule-btn" data-index="${idx}" style="background: none; border: none; color: #ef4444; cursor: pointer;" title="Remove Mapping">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');

        document.querySelectorAll('.remove-rule-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.getAttribute('data-index'));
                routingRules.splice(index, 1);
                renderRules();
            });
        });
    }

    if(btnAddRoute) {
        btnAddRoute.addEventListener('click', () => {
            const cat = routeCategory.value.trim();
            const dept = routeDept.value;

            if(!cat) {
                alert('Please enter an Issue Category.');
                return;
            }

            routingRules.push({ category: cat, department: dept });
            routeCategory.value = '';
            renderRules();
        });
        
        renderRules();
    }

    // System Backup & Maintenance
    const btnDownloadBackup = document.getElementById('btnDownloadBackup');
    const btnClearTickets = document.getElementById('btnClearTickets');

    if(btnDownloadBackup) {
        btnDownloadBackup.addEventListener('click', () => {
            // Mock JSON backup
            const backupData = {
                timestamp: new Date().toISOString(),
                version: '1.0.0',
                slaConfig: { hours: slaHoursInput.value, compliance: slaRateInput.value },
                routingRules: routingRules
            };

            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", `system_backup_${new Date().getTime()}.json`);
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        });
    }

    if(btnClearTickets) {
        btnClearTickets.addEventListener('click', () => {
            const confirmed = confirm('WARNING: This will permanently archive all resolved tickets from the live database. Do you wish to proceed?');
            if(confirmed) {
                const originalText = btnClearTickets.innerHTML;
                btnClearTickets.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Archiving...';
                btnClearTickets.disabled = true;

                setTimeout(() => {
                    btnClearTickets.innerHTML = originalText;
                    btnClearTickets.disabled = false;
                    alert('Success: Historical data archived and live database cleaned.');
                }, 800);
            }
        });
    }
});

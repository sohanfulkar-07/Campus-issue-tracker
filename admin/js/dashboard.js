document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Sidebar Navigation Engine & UI Setup ---
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');
    const closeSidebar = document.getElementById('closeSidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    if(menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.add('active');
            if(sidebarOverlay) sidebarOverlay.classList.add('active');
        });
    }

    const closeMenu = () => {
        if(sidebar) sidebar.classList.remove('active');
        if(sidebarOverlay) sidebarOverlay.classList.remove('active');
    };

    if(closeSidebar) closeSidebar.addEventListener('click', closeMenu);
    if(sidebarOverlay) sidebarOverlay.addEventListener('click', closeMenu);

    // Logout handling
    const logoutLinks = document.querySelectorAll('.logout');
    if (logoutLinks.length > 0) {
        const modalHtml = `
            <div id="logoutConfirmModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; justify-content: center; align-items: center; backdrop-filter: blur(4px);">
                <div style="background: var(--card-bg, #ffffff); padding: 2rem; border-radius: 12px; max-width: 400px; width: 90%; box-shadow: 0 10px 25px rgba(0,0,0,0.2); text-align: center; border: 1px solid var(--border-color, #e2e8f0);">
                    <div style="width: 60px; height: 60px; border-radius: 50%; background: var(--danger-bg); color: var(--danger-color); display: flex; justify-content: center; align-items: center; font-size: 1.5rem; margin: 0 auto 1rem auto;">
                        <i class="fas fa-sign-out-alt"></i>
                    </div>
                    <h3 style="margin: 0 0 0.5rem 0; color: var(--text-dark); font-size: 1.25rem;">Confirm Logout</h3>
                    <p style="margin: 0 0 1.5rem 0; color: var(--text-light);">Are you sure you want to log out of your account?</p>
                    <div style="display: flex; justify-content: center; gap: 1rem;">
                        <button id="cancelLogoutBtn" style="padding: 0.75rem 1.5rem; border: 1px solid var(--border-color); background: transparent; border-radius: 8px; cursor: pointer; color: var(--text-dark); font-weight: 500; flex: 1; transition: all 0.2s;">Cancel</button>
                        <button id="proceedLogoutBtn" style="padding: 0.75rem 1.5rem; border: none; background: var(--danger-color); color: white; border-radius: 8px; cursor: pointer; font-weight: 500; flex: 1; transition: all 0.2s; box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.2);">Proceed</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        const logoutModal = document.getElementById('logoutConfirmModal');
        const cancelBtn = document.getElementById('cancelLogoutBtn');
        const proceedBtn = document.getElementById('proceedLogoutBtn');
        let logoutTarget = '../index.html';

        logoutLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                logoutTarget = link.getAttribute('href');
                logoutModal.style.display = 'flex';
            });
        });

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                logoutModal.style.display = 'none';
            });
        }

        if (proceedBtn) {
            proceedBtn.addEventListener('click', () => {
                if (window.unifiedLogout) {
                    window.unifiedLogout();
                } else {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    localStorage.removeItem('currentUserRole');
                    sessionStorage.clear();
                    window.location.href = logoutTarget;
                }
            });
        }
        
        if (logoutModal) {
            logoutModal.addEventListener('click', (e) => {
                if(e.target === logoutModal) logoutModal.style.display = 'none';
            });
        }
    }

    // --- 2. Operational Dataset (Live from Backend API: GET /api/issues) ---
    let rawDataset = [];
    let currentDataset = [];

    function fetchAdminDashboardData() {
        const token = localStorage.getItem('token');
        const baseUrl = (window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1'))
            ? 'http://localhost:3000/api/issues'
            : '/api/issues';

        fetch(baseUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(res => res.json())
        .then(data => {
            rawDataset = data.success ? data.data : [];
            currentDataset = [...rawDataset];
            recalculateKPIs();
            renderCharts();
            renderScorecard();
        })
        .catch(err => {
            console.error('[Admin Dashboard Fetch Error]', err);
            rawDataset = [];
            currentDataset = [];
            recalculateKPIs();
            renderCharts();
            renderScorecard();
        });
    }

    // --- 3. Dynamic KPI Calculator ---
    const SLA_TARGET_HOURS = 24;

    function recalculateKPIs() {
        const totalActive = currentDataset.filter(t => t.status !== 'Resolved').length;
        
        const resolvedTickets = currentDataset.filter(t => t.status === 'Resolved');
        let avgResolution = 0;
        let slaComplianceRate = 0;

        if(resolvedTickets.length > 0) {
            const totalHours = resolvedTickets.reduce((sum, t) => sum + (t.resolutionHours || 0), 0);
            avgResolution = (totalHours / resolvedTickets.length).toFixed(1);

            const compliantTickets = resolvedTickets.filter(t => (t.resolutionHours || 0) <= SLA_TARGET_HOURS).length;
            slaComplianceRate = ((compliantTickets / resolvedTickets.length) * 100).toFixed(1);
        }

        const criticalTickets = currentDataset.filter(t => t.priority === 'Critical' && t.status !== 'Resolved').length;

        // Inject into DOM
        const kpiTotalComplaints = document.getElementById('kpiTotalComplaints');
        const kpiAvgResolution = document.getElementById('kpiAvgResolution');
        const kpiSlaCompliance = document.getElementById('kpiSlaCompliance');
        const kpiCritical = document.getElementById('kpiCritical');

        if(kpiTotalComplaints) kpiTotalComplaints.innerText = totalActive;
        if(kpiAvgResolution) kpiAvgResolution.innerText = resolvedTickets.length > 0 ? `${avgResolution} hrs` : '--';
        if(kpiSlaCompliance) kpiSlaCompliance.innerText = resolvedTickets.length > 0 ? `${slaComplianceRate}%` : '--';
        if(kpiCritical) kpiCritical.innerText = criticalTickets;
    }

    // --- 4. Live Chart Generation ---
    let barChartInst = null;
    let donutChartInst = null;

    function renderCharts() {
        const barCtx = document.getElementById('barChart');
        const donutCtx = document.getElementById('donutChart');

        // Prepare Data for Bar Chart
        const deptMap = {};
        const resolvedTickets = currentDataset.filter(t => t.status === 'Resolved');
        
        resolvedTickets.forEach(t => {
            const deptKey = t.department || t.category || 'General';
            if(!deptMap[deptKey]) deptMap[deptKey] = { sum: 0, count: 0 };
            deptMap[deptKey].sum += (t.resolutionHours || 0);
            deptMap[deptKey].count += 1;
        });

        const barLabels = Object.keys(deptMap);
        const barData = barLabels.map(dept => (deptMap[dept].sum / deptMap[dept].count).toFixed(1));

        if(barCtx && typeof Chart !== 'undefined') {
            const barCtx2d = barCtx.getContext('2d');
            const barGradient = barCtx2d.createLinearGradient(0, 0, 0, 400);
            barGradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)');
            barGradient.addColorStop(1, 'rgba(59, 130, 246, 0.1)');

            if(barChartInst) barChartInst.destroy();
            barChartInst = new Chart(barCtx2d, {
                type: 'bar',
                data: {
                    labels: barLabels.length > 0 ? barLabels : ['No Data'],
                    datasets: [{
                        label: 'Hours Elapsed',
                        data: barData.length > 0 ? barData : [0],
                        backgroundColor: barLabels.length > 0 ? barGradient : '#1e293b',
                        borderColor: '#3b82f6',
                        borderWidth: 1,
                        borderRadius: 4,
                        barThickness: 45
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: 'rgba(11, 15, 25, 0.9)',
                            titleColor: '#fff',
                            bodyColor: '#fff',
                            borderColor: 'rgba(255,255,255,0.1)',
                            borderWidth: 1,
                            padding: 10,
                            callbacks: { label: (context) => `${context.raw} Hours` }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { font: { size: 10, family: "'Inter', sans-serif" }, color: '#94a3b8' },
                            grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false },
                            title: { display: true, text: 'Hours Elapsed', font: { size: 10, family: "'Inter', sans-serif" }, color: '#94a3b8' }
                        },
                        x: {
                            grid: { display: false, drawBorder: false },
                            ticks: { font: { size: 10, family: "'Inter', sans-serif" }, color: '#94a3b8' }
                        }
                    }
                }
            });
        }

        // Prepare Data for Donut Chart
        const catMap = {};
        const activeTickets = currentDataset.filter(t => t.status !== 'Resolved');
        activeTickets.forEach(t => {
            const catKey = t.category || t.department || 'General';
            catMap[catKey] = (catMap[catKey] || 0) + 1;
        });

        const donutLabels = Object.keys(catMap);
        const dData = donutLabels.map(cat => catMap[cat]);
        const dColors = ['#3b82f6', '#1d4ed8', '#10b981', '#ef4444', '#f59e0b'];

        if(donutCtx && typeof Chart !== 'undefined') {
            if(donutChartInst) donutChartInst.destroy();
            donutChartInst = new Chart(donutCtx.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: donutLabels.length > 0 ? donutLabels : ['Empty'],
                    datasets: [{
                        data: dData.length > 0 ? dData : [1],
                        backgroundColor: dData.length > 0 ? dColors.slice(0, donutLabels.length) : ['#1e293b'],
                        borderWidth: dData.length > 0 ? 2 : 1,
                        borderColor: dData.length > 0 ? '#0B0F19' : 'rgba(255,255,255,0.05)',
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '60%',
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: 'rgba(11, 15, 25, 0.9)',
                            titleColor: '#fff',
                            bodyColor: '#fff',
                            borderColor: 'rgba(255,255,255,0.1)',
                            borderWidth: 1,
                            padding: 10
                        }
                    }
                }
            });

            // Render Custom Legend
            const legendContainer = document.getElementById('donutLegend');
            if(legendContainer) {
                if(donutLabels.length === 0) {
                    legendContainer.innerHTML = '<div style="color: var(--text-light); text-align: center;">No active workload</div>';
                } else {
                    let legendHtml = '';
                    donutLabels.forEach((label, index) => {
                        legendHtml += `
                            <div class="legend-item" style="display: flex; align-items: center; margin-top: 0.5rem; font-size: 0.85rem; color: var(--text-muted);">
                                <div class="legend-color" style="width: 12px; height: 12px; border-radius: 50%; background-color: ${dColors[index % dColors.length]}; margin-right: 0.5rem;"></div>
                                <span>${label}</span>
                            </div>
                        `;
                    });
                    legendContainer.innerHTML = legendHtml;
                }
            }
        }
    }

    // --- 5. Live Department Scorecard Table ---
    function renderScorecard() {
        const tableBody = document.getElementById('scorecardTableBody');
        if(!tableBody) return;

        const depts = [...new Set(currentDataset.map(t => t.department || t.category || 'General'))];
        
        if(depts.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 2rem; color: var(--text-light);">No scorecard data available.</td></tr>`;
            return;
        }

        let rowsHtml = '';
        depts.forEach(dept => {
            const deptTickets = currentDataset.filter(t => (t.department || t.category || 'General') === dept);
            const openLoad = deptTickets.filter(t => t.status !== 'Resolved').length;
            
            const ackTimes = deptTickets.map(t => t.ackHours).filter(h => h !== null && h !== undefined);
            const avgAck = ackTimes.length > 0 ? (ackTimes.reduce((a,b)=>a+b, 0) / ackTimes.length).toFixed(1) : 0;
            
            const satisfactions = deptTickets.map(t => t.satisfaction).filter(s => s !== null && s !== undefined);
            const avgSat = satisfactions.length > 0 ? (satisfactions.reduce((a,b)=>a+b, 0) / satisfactions.length).toFixed(0) : 100;
            
            let barColor = '#10b981'; // Green
            if(avgSat < 75) barColor = '#ef4444'; // Red
            else if(avgSat < 90) barColor = '#f59e0b'; // Yellow

            rowsHtml += `
                <tr>
                    <td style="font-weight: 500;">${dept}</td>
                    <td>${openLoad}</td>
                    <td>${avgAck} hrs</td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <div style="flex: 1; height: 6px; background-color: var(--border-color); border-radius: 3px; overflow: hidden;">
                                <div style="height: 100%; width: ${avgSat}%; background-color: ${barColor};"></div>
                            </div>
                            <span style="font-size: 0.8rem; font-weight: 600;">${avgSat}%</span>
                        </div>
                    </td>
                </tr>
            `;
        });

        tableBody.innerHTML = rowsHtml;
    }

    // --- 6. Global Filtering Interceptor ---
    const filterZone = document.getElementById('filterZone');
    const filterBranch = document.getElementById('filterBranch');
    const filterLayer = document.getElementById('filterLayer');
    const filterSemester = document.getElementById('filterSemester');

    function applyFilters() {
        const valZone = filterZone ? filterZone.value : 'All Zones (Global View)';
        const valBranch = filterBranch ? filterBranch.value : 'All Institutional Branches';
        const valLayer = filterLayer ? filterLayer.value : 'All Infrastructure Layers';
        const valSemester = filterSemester ? filterSemester.value : 'Current Semester';

        currentDataset = rawDataset.filter(t => {
            let match = true;
            if(valZone !== 'All Zones (Global View)' && t.zone !== valZone && t.zone !== 'All Zones (Global View)') match = false;
            if(valBranch !== 'All Institutional Branches' && t.branch !== valBranch && t.branch !== 'All Institutional Branches') match = false;
            if(valLayer !== 'All Infrastructure Layers' && t.category !== valLayer && t.department !== valLayer) match = false;
            if(valSemester !== 'Full Year' && t.semester !== valSemester) match = false;
            return match;
        });

        recalculateKPIs();
        renderCharts();
        renderScorecard();
    }

    [filterZone, filterBranch, filterLayer, filterSemester].forEach(el => {
        if(el) el.addEventListener('change', applyFilters);
    });

    // Initial Fetch & Render
    fetchAdminDashboardData();

    // --- 7. PDF Export Functionality ---
    const exportBtn = document.querySelector('.export-btn');
    const mainWrapper = document.querySelector('.main-wrapper');
    
    if (exportBtn && mainWrapper) {
        exportBtn.addEventListener('click', () => {
            const originalMargin = mainWrapper.style.marginLeft;
            const originalWidth = mainWrapper.style.width;
            
            if(sidebar) sidebar.style.display = 'none';
            mainWrapper.style.marginLeft = '0';
            mainWrapper.style.width = '100%';
            
            const originalBtnHtml = exportBtn.innerHTML;
            exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';
            exportBtn.disabled = true;
            
            const opt = {
                margin:       10,
                filename:     'Campus_Executive_Report.pdf',
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, useCORS: true, scrollY: 0 },
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
            };
            
            if (typeof html2pdf !== 'undefined') {
                html2pdf().set(opt).from(mainWrapper).save().then(() => {
                    if(sidebar) sidebar.style.display = '';
                    mainWrapper.style.marginLeft = originalMargin;
                    mainWrapper.style.width = originalWidth;
                    exportBtn.innerHTML = originalBtnHtml;
                    exportBtn.disabled = false;
                }).catch(err => {
                    console.error('PDF generation failed', err);
                    if(sidebar) sidebar.style.display = '';
                    mainWrapper.style.marginLeft = originalMargin;
                    mainWrapper.style.width = originalWidth;
                    exportBtn.innerHTML = originalBtnHtml;
                    exportBtn.disabled = false;
                });
            } else {
                alert('PDF export plugin not loaded');
                if(sidebar) sidebar.style.display = '';
                mainWrapper.style.marginLeft = originalMargin;
                mainWrapper.style.width = originalWidth;
                exportBtn.innerHTML = originalBtnHtml;
                exportBtn.disabled = false;
            }
        });
    }

});

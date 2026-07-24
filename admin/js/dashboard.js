document.addEventListener('DOMContentLoaded', () => {
    // --- UI Interactions ---
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');
    const closeSidebar = document.getElementById('closeSidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    menuToggle.addEventListener('click', () => {
        sidebar.classList.add('active');
        sidebarOverlay.classList.add('active');
    });

    const closeMenu = () => {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
    };

    closeSidebar.addEventListener('click', closeMenu);
    sidebarOverlay.addEventListener('click', closeMenu);


    // --- Chart.js Implementations ---
    
    // Bar Chart Data (Department Efficiency)
    const barCtx = document.getElementById('barChart').getContext('2d');
    new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: [], // Populated dynamically
            datasets: [{
                label: 'Hours Elapsed',
                data: [], // Populated dynamically
                backgroundColor: [
                    '#3b82f6', '#ef4444', '#10b981', '#f59e0b'
                ],
                borderRadius: 2,
                barThickness: 45
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.raw} Hours`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 60,
                    ticks: {
                        stepSize: 10,
                        font: { size: 10, family: "'Poppins', sans-serif" },
                        color: '#94a3b8'
                    },
                    grid: {
                        color: '#f1f5f9',
                        drawBorder: false
                    },
                    title: {
                        display: true,
                        text: 'Hours Elapsed',
                        font: { size: 10, family: "'Poppins', sans-serif" },
                        color: '#94a3b8'
                    }
                },
                x: {
                    grid: { display: false, drawBorder: false },
                    ticks: {
                        font: { size: 10, family: "'Poppins', sans-serif" },
                        color: '#64748b'
                    }
                }
            }
        }
    });

    // Donut Chart Data (Active Ticket Volume By Category)
    const donutCtx = document.getElementById('donutChart').getContext('2d');
    
    const donutData = {
        labels: [], // Populated dynamically
        data: [], // Populated dynamically
        colors: ['#3b82f6', '#1d4ed8', '#10b981', '#ef4444', '#f59e0b']
    };

    new Chart(donutCtx, {
        type: 'doughnut',
        data: {
            labels: donutData.labels,
            datasets: [{
                data: donutData.data,
                backgroundColor: donutData.colors,
                borderWidth: 2,
                borderColor: '#ffffff',
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '50%',
            plugins: {
                legend: { display: false } // We use custom HTML legend
            }
        }
    });

    // Render Custom Donut Legend
    const legendContainer = document.getElementById('donutLegend');
    let legendHtml = '';
    donutData.labels.forEach((label, index) => {
        legendHtml += `
            <div class="legend-item">
                <div class="legend-color" style="background-color: ${donutData.colors[index]}"></div>
                <span>${label}</span>
            </div>
        `;
    });
    legendContainer.innerHTML = legendHtml;
});

document.addEventListener('DOMContentLoaded', () => {
    const logoutLinks = document.querySelectorAll('.logout');
    if (logoutLinks.length > 0) {
        const modalHtml = `
            <div id="logoutConfirmModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; justify-content: center; align-items: center; backdrop-filter: blur(4px);">
                <div style="background: var(--bg-color, #ffffff); padding: 2rem; border-radius: 12px; max-width: 400px; width: 90%; box-shadow: 0 10px 25px rgba(0,0,0,0.2); text-align: center; border: 1px solid var(--border-color, #e2e8f0);">
                    <div style="width: 60px; height: 60px; border-radius: 50%; background: #fee2e2; color: #ef4444; display: flex; justify-content: center; align-items: center; font-size: 1.5rem; margin: 0 auto 1rem auto;">
                        <i class="fas fa-sign-out-alt"></i>
                    </div>
                    <h3 style="margin: 0 0 0.5rem 0; color: var(--text-color, #1e293b); font-size: 1.25rem;">Confirm Logout</h3>
                    <p style="margin: 0 0 1.5rem 0; color: var(--text-light, #64748b);">Are you sure you want to log out of your account?</p>
                    <div style="display: flex; justify-content: center; gap: 1rem;">
                        <button id="cancelLogoutBtn" style="padding: 0.75rem 1.5rem; border: 1px solid var(--border-color, #cbd5e1); background: transparent; border-radius: 8px; cursor: pointer; color: var(--text-color, #334155); font-weight: 500; flex: 1; transition: all 0.2s;">Cancel</button>
                        <button id="proceedLogoutBtn" style="padding: 0.75rem 1.5rem; border: none; background: #ef4444; color: white; border-radius: 8px; cursor: pointer; font-weight: 500; flex: 1; transition: all 0.2s; box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.2);">Proceed</button>
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

        cancelBtn.addEventListener('click', () => {
            logoutModal.style.display = 'none';
        });

        proceedBtn.addEventListener('click', () => {
            window.location.href = logoutTarget;
        });
        
        logoutModal.addEventListener('click', (e) => {
            if(e.target === logoutModal) {
                logoutModal.style.display = 'none';
            }
        });
    }
});

// --- PDF Export Functionality ---
document.addEventListener('DOMContentLoaded', () => {
    const exportBtn = document.querySelector('.export-btn');
    const mainWrapper = document.querySelector('.main-wrapper');
    const sidebar = document.getElementById('sidebar');
    
    if (exportBtn && mainWrapper) {
        exportBtn.addEventListener('click', () => {
            // Store original styles to restore them after PDF generation
            const originalMargin = mainWrapper.style.marginLeft;
            const originalWidth = mainWrapper.style.width;
            
            // Hide sidebar and reset wrapper margin for a clean PDF layout
            if(sidebar) sidebar.style.display = 'none';
            mainWrapper.style.marginLeft = '0';
            mainWrapper.style.width = '100%';
            
            // Visual feedback on button
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
            
            // Generate PDF
            html2pdf().set(opt).from(mainWrapper).save().then(() => {
                // Restore original layout
                if(sidebar) sidebar.style.display = '';
                mainWrapper.style.marginLeft = originalMargin;
                mainWrapper.style.width = originalWidth;
                
                // Restore button
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
        });
    }
});

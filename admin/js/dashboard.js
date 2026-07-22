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

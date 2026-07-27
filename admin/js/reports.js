document.addEventListener('DOMContentLoaded', () => {
    
    // Elements
    const startDateInput = document.getElementById('reportStartDate');
    const endDateInput = document.getElementById('reportEndDate');
    const deptFilter = document.getElementById('reportDept');
    const formatFilter = document.getElementById('reportFormat');
    const generateBtn = document.getElementById('generateReportBtn');
    const errorDiv = document.getElementById('reportError');
    
    const placeholder = document.getElementById('reportPlaceholder');
    const viewport = document.getElementById('reportViewport');
    const downloadBtn = document.getElementById('downloadReportBtn');
    
    const reportTitle = document.getElementById('reportTitle');
    const reportSubtitle = document.getElementById('reportSubtitle');
    const valAvgRes = document.getElementById('valAvgRes');
    const valRatio = document.getElementById('valRatio');
    const valRatioText = document.getElementById('valRatioText');
    const categoryTableBody = document.getElementById('categoryTableBody');

    // Historical Sample Dataset
    const historicalData = [
        { id: 'T-1001', date: '2026-07-01', dept: 'IT Support', category: 'Wi-Fi Issue', status: 'Closed', resolutionHours: 4 },
        { id: 'T-1002', date: '2026-07-02', dept: 'Hostel Maintenance', category: 'Water Leakage', status: 'Closed', resolutionHours: 26 },
        { id: 'T-1003', date: '2026-07-05', dept: 'Academic Operations', category: 'Projector Failure', status: 'Open', resolutionHours: null },
        { id: 'T-1004', date: '2026-07-10', dept: 'IT Support', category: 'Account Lockout', status: 'Closed', resolutionHours: 1 },
        { id: 'T-1005', date: '2026-07-15', dept: 'Hostel Maintenance', category: 'Furniture Repair', status: 'Closed', resolutionHours: 48 },
        { id: 'T-1006', date: '2026-07-18', dept: 'IT Support', category: 'Wi-Fi Issue', status: 'Open', resolutionHours: null },
        { id: 'T-1007', date: '2026-07-20', dept: 'Hostel Maintenance', category: 'Water Leakage', status: 'Closed', resolutionHours: 12 },
        { id: 'T-1008', date: '2026-07-22', dept: 'Academic Operations', category: 'Room Scheduling', status: 'Closed', resolutionHours: 8 }
    ];

    generateBtn.addEventListener('click', () => {
        // Reset state
        errorDiv.style.display = 'none';
        
        const start = startDateInput.value;
        const end = endDateInput.value;
        const dept = deptFilter.value;

        // Validation
        if (!start || !end) {
            errorDiv.textContent = 'Please select both Start Date and End Date.';
            errorDiv.style.display = 'block';
            viewport.style.display = 'none';
            placeholder.style.display = 'block';
            return;
        }

        const dStart = new Date(start);
        const dEnd = new Date(end);

        if (dStart > dEnd) {
            errorDiv.textContent = 'Error: Start Date cannot be after End Date.';
            errorDiv.style.display = 'block';
            viewport.style.display = 'none';
            placeholder.style.display = 'block';
            return;
        }

        // Generate data based on filters
        const filtered = historicalData.filter(t => {
            const tDate = new Date(t.date);
            const inRange = tDate >= dStart && tDate <= dEnd;
            const matchesDept = dept === 'All Departments' || t.dept === dept;
            return inRange && matchesDept;
        });

        // Compute metrics
        let closedCount = 0;
        let openCount = 0;
        let totalHours = 0;
        const categoryMap = {};

        filtered.forEach(t => {
            if (t.status === 'Closed') {
                closedCount++;
                totalHours += t.resolutionHours;
                
                // Track category resolution
                if(!categoryMap[t.category]) categoryMap[t.category] = 0;
                categoryMap[t.category]++;
            } else {
                openCount++;
            }
        });

        const totalTickets = closedCount + openCount;
        const avgHours = closedCount > 0 ? (totalHours / closedCount).toFixed(1) : 0;
        const closureRate = totalTickets > 0 ? Math.round((closedCount / totalTickets) * 100) : 0;

        // Populate DOM
        valAvgRes.textContent = `${avgHours} hrs`;
        valRatio.textContent = `${closedCount} / ${openCount}`;
        valRatioText.textContent = `${closureRate}% closure rate`;

        reportTitle.textContent = `Report: ${dept}`;
        reportSubtitle.textContent = `From ${start} to ${end}`;

        // Populate Grid
        if (Object.keys(categoryMap).length === 0) {
            categoryTableBody.innerHTML = `<tr><td colspan="2" style="text-align: center; padding: 2rem; color: var(--text-light);">No resolved tickets found for this period.</td></tr>`;
        } else {
            categoryTableBody.innerHTML = Object.entries(categoryMap)
                .sort((a, b) => b[1] - a[1]) // Sort desc by count
                .map(([cat, count]) => `
                    <tr>
                        <td style="padding: 1rem 1.5rem; font-weight: 500; color: var(--text-dark);">${cat}</td>
                        <td style="padding: 1rem 1.5rem; text-align: right; color: var(--text-muted);">${count}</td>
                    </tr>
                `).join('');
        }

        // Show Viewport
        placeholder.style.display = 'none';
        viewport.style.display = 'block';
    });

    // Export Logic
    downloadBtn.addEventListener('click', () => {
        const format = formatFilter.value;
        
        if (format === 'pdf') {
            window.print();
        } else if (format === 'csv') {
            downloadCSV();
        } else {
            // Default summary view, just alert
            alert('Summary Dashboard View is currently displayed.');
        }
    });

    function downloadCSV() {
        const start = startDateInput.value;
        const end = endDateInput.value;
        
        // Generate mock CSV string
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Report ID,Date,Department,Category,Status,Resolution Hours\n";
        
        historicalData.forEach(row => {
            csvContent += `${row.id},${row.date},${row.dept},${row.category},${row.status},${row.resolutionHours || ''}\n`;
        });
        
        // Trigger download
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Report_${start}_to_${end}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});

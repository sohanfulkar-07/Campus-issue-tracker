/**
 * Global Authentication & Role-Based Routing
 * Ensures users can only access their authorized dashboard.
 */
(function () {
    const path = window.location.pathname.toLowerCase();
    let requiredRole = null;
    let loginRedirectPath = '../index.html';

    // Determine role based on folder path
    if (path.includes('/admin/')) {
        requiredRole = 'admin';
    } else if (path.includes('/student/')) {
        requiredRole = 'student';
    } else if (path.includes('/faculty/')) {
        requiredRole = 'faculty';
    }

    if (requiredRole) {
        const currentUserRole = localStorage.getItem('currentUserRole');
        const isLoggedIn = sessionStorage.getItem('isLoggedIn');
        if (!isLoggedIn || !currentUserRole || currentUserRole !== requiredRole) {
            console.warn(`Unauthorized access or inactive session. Redirecting to login.`);
            window.location.href = loginRedirectPath;
            return; // Stop execution
        }
    }

    // Data Migration: Ensure old mock data doesn't crash the new unified dashboard logic
    try {
        let master = JSON.parse(localStorage.getItem('campus_tickets_master') || '[]');
        let updated = false;
        master = master.map(ticket => {
            if (ticket.status && typeof ticket.status === 'object') {
                let state = ticket.status.state || 'New / Unassigned';
                if (state === 'Open') state = 'New / Unassigned';
                ticket.status = state;
                updated = true;
            }
            if (ticket.priority && typeof ticket.priority === 'object') {
                ticket.priority = ticket.priority.level || 'Medium';
                updated = true;
            }
            if (ticket.category && typeof ticket.category === 'object') {
                ticket.category = ticket.category.name || 'Other';
                updated = true;
            }
            return ticket;
        });
        if (updated) {
            localStorage.setItem('campus_tickets_master', JSON.stringify(master));
        }
    } catch (e) {
        console.error("Data migration failed", e);
    }

    // Expose global logout function
    window.unifiedLogout = function (e) {
        if (e) e.preventDefault();
        // Keep master tickets, but clear session identity
        localStorage.removeItem('currentUserRole');
        sessionStorage.clear();
        window.location.href = loginRedirectPath;
    };

    // Attach to logout links once DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        const logoutLinks = document.querySelectorAll('.logout, [href="../index.html"], [href="index.html"]');
        logoutLinks.forEach(link => {
            // Only attach to actual logout buttons, not brand logos (using simple heuristic)
            if (link.textContent.toLowerCase().includes('logout') || link.classList.contains('logout')) {
                // If there's an existing click listener, we might need to override it or use capture
                // Using an inline click to override
                link.onclick = window.unifiedLogout;
            }
        });
    });
})();

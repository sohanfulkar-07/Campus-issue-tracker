/**
 * Global Authentication & Role-Based Routing
 * Ensures users can only access their authorized dashboard.
 */
(function() {
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
        if (!currentUserRole || currentUserRole !== requiredRole) {
            console.warn(`Unauthorized access. Required: ${requiredRole}, Found: ${currentUserRole}`);
            window.location.href = loginRedirectPath;
            return; // Stop execution
        }
    }

    // Expose global logout function
    window.unifiedLogout = function(e) {
        if(e) e.preventDefault();
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

/**
 * Global Authentication & Role-Based Routing
 * Ensures users can only access their authorized dashboard using live JWT backend verification.
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
        const token = localStorage.getItem('token');
        const currentUserRole = localStorage.getItem('currentUserRole');

        if (!token || !currentUserRole || currentUserRole !== requiredRole) {
            console.warn(`Unauthorized access or missing token. Redirecting to login.`);
            window.location.href = loginRedirectPath;
            return;
        }

        // Validate Token asynchronously via GET /api/auth/me
        const apiUrl = (window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1'))
            ? 'http://localhost:3000/api/auth/me'
            : '/api/auth/me';

        fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(res => res.json())
        .then(data => {
            if (!data.success || !data.user) {
                console.warn('[Auth Guard] Invalid token. Redirecting to login.');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('currentUserRole');
                sessionStorage.clear();
                window.location.href = loginRedirectPath;
            } else {
                localStorage.setItem('user', JSON.stringify(data.user));
            }
        })
        .catch(err => {
            console.error('[Auth Guard Error]', err);
        });
    }

    // Expose global logout function
    window.unifiedLogout = function (e) {
        if (e) e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('currentUserRole');
        localStorage.removeItem('currentUserId');
        sessionStorage.clear();
        window.location.href = loginRedirectPath;
    };

    // Attach to logout links once DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        const logoutLinks = document.querySelectorAll('.logout, [href="../index.html"], [href="index.html"]');
        logoutLinks.forEach(link => {
            if (link.textContent.toLowerCase().includes('logout') || link.classList.contains('logout')) {
                link.onclick = window.unifiedLogout;
            }
        });
    });
})();

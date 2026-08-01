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

        const baseUrl = window.API_BASE_URL || ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
            ? 'http://localhost:3000/api'
            : 'https://campus-issue-tracker-j5bp.onrender.com/api');
        const apiUrl = `${baseUrl}/auth/me`;
        fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(async res => {
            const text = await res.text();

            let data = {};

            try {
                data = text ? JSON.parse(text) : {};
            } catch (error) {
                throw new Error(`Authentication server returned invalid response (HTTP ${res.status})`);
            }

            if (!res.ok) {
                throw new Error(data.message || `Authentication request failed (HTTP ${res.status})`);
            }

            return data;
        })
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
    window.unifiedLogout = function (targetPath) {
        if (targetPath && typeof targetPath === 'object' && typeof targetPath.preventDefault === 'function') {
            targetPath.preventDefault();
            targetPath = null;
        }
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('currentUserRole');
        localStorage.removeItem('currentUserId');
        sessionStorage.clear();
        const destPath = (typeof targetPath === 'string' && targetPath) ? targetPath : loginRedirectPath;
        window.location.href = destPath;
    };
})();

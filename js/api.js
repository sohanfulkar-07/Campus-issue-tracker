/**
 * Centralized API Fetch Helper for Campus Issue Tracker
 * Manages Base URL, Bearer Token Authorization, JSON Headers, and Error Handling.
 */
(function() {
    const API_BASE_URL = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
        ? 'http://localhost:3000/api'
        : '/api';

    async function apiFetch(endpoint, options = {}) {
        const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
        
        const token = localStorage.getItem('token');
        
        const headers = {
            ...options.headers
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // Only set Content-Type if payload is not FormData
        if (!(options.body instanceof FormData) && !headers['Content-Type']) {
            headers['Content-Type'] = 'application/json';
        }

        const config = {
            ...options,
            headers
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json().catch(() => ({}));

            if (response.status === 401) {
                console.warn('[API Fetch] Session expired or unauthorized. Redirecting to login.');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('currentUserRole');
                sessionStorage.clear();
                
                const loginPath = window.location.pathname.includes('/student/') || 
                                  window.location.pathname.includes('/faculty/') || 
                                  window.location.pathname.includes('/admin/')
                                  ? '../index.html'
                                  : 'index.html';
                
                if (!window.location.pathname.endsWith('index.html') && !window.location.pathname.endsWith('login-selection.html')) {
                    window.location.href = loginPath;
                }
            }

            return {
                ok: response.ok,
                status: response.status,
                data
            };
        } catch (error) {
            console.error('[API Fetch Error]', error);
            return {
                ok: false,
                status: 500,
                data: { success: false, message: 'Network error or server unreachable.' }
            };
        }
    }

    // Expose globally
    window.API_BASE_URL = API_BASE_URL;
    window.apiFetch = apiFetch;
})();

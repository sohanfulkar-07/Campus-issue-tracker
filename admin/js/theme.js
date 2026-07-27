(function() {
    function applyTheme() {
        const savedTheme = localStorage.getItem('admin_theme');
        if (savedTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else if (savedTheme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
        } else {
            // System default
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.documentElement.setAttribute('data-theme', 'dark');
            } else {
                document.documentElement.setAttribute('data-theme', 'light');
            }
        }
    }
    
    // Apply theme immediately
    applyTheme();

    // Listen for system changes if on system default
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        const savedTheme = localStorage.getItem('admin_theme');
        if (!savedTheme || savedTheme === 'system') {
            applyTheme();
        }
    });
})();

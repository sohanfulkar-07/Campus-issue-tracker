document.addEventListener('DOMContentLoaded', () => {
    // --- UI Interactions ---
    
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');
    const closeSidebar = document.getElementById('closeSidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    // Toggle Sidebar
    menuToggle.addEventListener('click', () => {
        sidebar.classList.add('active');
        sidebarOverlay.classList.add('active');
    });

    // Close Sidebar
    const closeMenu = () => {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
    };

    closeSidebar.addEventListener('click', closeMenu);
    sidebarOverlay.addEventListener('click', closeMenu);

    // --- Theme Selector Logic ---
    const themeSelector = document.getElementById('themeSelector');
    if (themeSelector) {
        // Sync select with current saved theme
        const savedTheme = localStorage.getItem('theme') || 'system';
        themeSelector.value = savedTheme;

        // Handle changes
        themeSelector.addEventListener('change', (e) => {
            const selectedTheme = e.target.value;
            localStorage.setItem('theme', selectedTheme);
            
            // Apply the theme directly
            if (selectedTheme === 'dark') {
                document.documentElement.setAttribute('data-theme', 'dark');
            } else if (selectedTheme === 'light') {
                document.documentElement.setAttribute('data-theme', 'light');
            } else {
                // System default
                if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    document.documentElement.setAttribute('data-theme', 'dark');
                } else {
                    document.documentElement.setAttribute('data-theme', 'light');
                }
            }
        });
    }
});

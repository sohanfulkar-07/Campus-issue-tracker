/**
 * Client-Side Router for Campus Issue Tracker Dashboards
 * Handles view switching without page reloads using data-target attributes.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Select all navigation items that have a data-target attribute
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item[data-target]');
    const views = document.querySelectorAll('.dashboard-view');

    if (navItems.length === 0 || views.length === 0) {
        return; // Routing elements not found on this page
    }

    /**
     * Switches the active view based on the target ID.
     * @param {string} targetId - The ID of the view container to show.
     */
    function switchView(targetId) {
        // Hide all views
        views.forEach(view => {
            view.classList.remove('active');
        });

        // Remove active class from all nav items
        navItems.forEach(item => {
            item.classList.remove('active');
        });

        // Show target view
        const targetView = document.getElementById(targetId);
        if (targetView) {
            targetView.classList.add('active');
        }

        // Highlight active nav item
        const activeNav = document.querySelector(`.sidebar-nav .nav-item[data-target="${targetId}"]`);
        if (activeNav) {
            activeNav.classList.add('active');
        }

        // Update URL hash for browser history state without scrolling
        if(history.pushState) {
            history.pushState(null, null, `#${targetId.replace('-view', '')}`);
        } else {
            window.location.hash = `#${targetId.replace('-view', '')}`;
        }
        
        // Dispatch custom event in case plugins like Chart.js need to resize/re-render
        window.dispatchEvent(new CustomEvent('viewChanged', { detail: { targetId } }));
    }

    // Attach click listeners to all routing nav items
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('data-target');
            if (targetId) {
                switchView(targetId);
            }
        });
    });

    // Handle initial load based on URL hash
    const currentHash = window.location.hash.replace('#', '');
    if (currentHash) {
        const expectedTarget = `${currentHash}-view`;
        const exists = document.getElementById(expectedTarget);
        if (exists) {
            switchView(expectedTarget);
        } else {
            // Default fallback
            const firstTarget = navItems[0].getAttribute('data-target');
            switchView(firstTarget);
        }
    } else {
        // No hash, load the first item's target (usually Analytics)
        const firstTarget = navItems[0].getAttribute('data-target');
        switchView(firstTarget);
    }
});

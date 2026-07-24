document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    const currentPath = window.location.pathname;
    const pageName = currentPath.split('/').pop() || 'dashboard.html';

    navItems.forEach(item => {
        const itemHref = item.getAttribute('href');
        // Check if the href matches the current page name
        if (itemHref === pageName) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
});

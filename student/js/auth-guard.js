(function() {
    // Auth Guard now defers first-time onboarding to ProfileWizard overlay on dashboard load
    const role = localStorage.getItem('currentUserRole');
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if ((!role || !isLoggedIn) && !window.location.href.includes('index.html')) {
        window.location.href = '../index.html';
    }
})();

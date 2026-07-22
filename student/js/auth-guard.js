(function() {
    const profile = localStorage.getItem('studentProfile');
    // Ensure we are not already on the onboarding page
    if (!profile && !window.location.href.includes('onboarding.html')) {
        window.location.replace('onboarding.html');
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('facultyRequestForm');
    const submitBtn = document.getElementById('submitBtn');
    const successMessage = document.getElementById('successMessage');
    
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get values
            const requestType = document.getElementById('requestType').value;
            const urgency = document.getElementById('urgency').value;
            const title = document.getElementById('requestTitle').value;
            const quantity = document.getElementById('quantity').value;
            const desc = document.getElementById('requestDesc').value;
            
            // Get faculty profile for context
            const profileStr = localStorage.getItem('facultyProfile');
            const facultyName = profileStr ? JSON.parse(profileStr).name : 'Unknown Faculty';
            
            // Create request object
            const newRequest = {
                id: 'REQ-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
                facultyName: facultyName,
                category: requestType,
                urgency: urgency,
                title: title,
                quantity: quantity,
                description: desc,
                status: 'pending',
                date: new Date().toISOString()
            };
            
            // Save to localStorage
            const existingRequestsStr = localStorage.getItem('facultyRequests');
            const requests = existingRequestsStr ? JSON.parse(existingRequestsStr) : [];
            requests.push(newRequest);
            localStorage.setItem('facultyRequests', JSON.stringify(requests));
            
            // Show success UI
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            submitBtn.disabled = true;
            
            setTimeout(() => {
                form.reset();
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Request';
                submitBtn.disabled = false;
                
                successMessage.classList.add('active');
                
                // Hide success message after 5 seconds
                setTimeout(() => {
                    successMessage.classList.remove('active');
                }, 5000);
            }, 800);
        });
    }
});

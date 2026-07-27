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
            
            const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            // Create request object mapped to master schema
            const newRequest = {
                id: 'REQ-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
                title: title,
                category: requestType,
                department: requestType, // Map to department
                location: 'Faculty Office', // Mock
                description: `Quantity: ${quantity}. ${desc}`,
                status: 'New / Unassigned',
                priority: urgency === 'Urgent' ? 'High' : 'Medium',
                user: facultyName,
                date: dateStr,
                fullDate: new Date().toISOString()
            };
            
            // Save to localStorage
            const existingRequestsStr = localStorage.getItem('campus_tickets_master');
            const requests = existingRequestsStr ? JSON.parse(existingRequestsStr) : [];
            requests.push(newRequest);
            localStorage.setItem('campus_tickets_master', JSON.stringify(requests));
            
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

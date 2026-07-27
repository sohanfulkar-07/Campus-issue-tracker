document.addEventListener('DOMContentLoaded', () => {
    // Media Array to hold attached media
    let mediaAttachments = [];

    // DOM Elements
    const btnTakePhoto = document.getElementById('btnTakePhoto');
    const btnRecordVideo = document.getElementById('btnRecordVideo');
    const fileUploadInput = document.getElementById('fileUploadInput');
    const mediaPreviewContainer = document.getElementById('mediaPreviewContainer');
    
    // Camera Modal Elements
    const cameraModal = document.getElementById('cameraModal');
    const closeCameraBtn = document.getElementById('closeCameraBtn');
    const cameraStream = document.getElementById('cameraStream');
    const capturePhotoBtn = document.getElementById('capturePhotoBtn');
    const recordVideoBtn = document.getElementById('recordVideoBtn');
    const photoCanvas = document.getElementById('photoCanvas');
    
    let stream = null;
    let mediaRecorder = null;
    let recordedChunks = [];
    let isRecording = false;

    // ----- UI Rendering for Media -----
    function renderMediaPreviews() {
        mediaPreviewContainer.innerHTML = '';
        mediaAttachments.forEach((media, index) => {
            const box = document.createElement('div');
            box.className = 'media-preview-box';
            
            if (media.type.startsWith('image/')) {
                const img = document.createElement('img');
                img.src = media.url;
                box.appendChild(img);
            } else if (media.type.startsWith('video/')) {
                const video = document.createElement('video');
                video.src = media.url;
                video.muted = true;
                box.appendChild(video);
            }
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-btn';
            removeBtn.innerHTML = '<i class="fas fa-times"></i>';
            removeBtn.onclick = () => {
                mediaAttachments.splice(index, 1);
                renderMediaPreviews();
            };
            
            box.appendChild(removeBtn);
            mediaPreviewContainer.appendChild(box);
        });
    }

    // ----- Camera Operations -----
    async function openCamera(mode) {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: mode === 'video' });
            cameraStream.srcObject = stream;
            cameraModal.classList.add('active');
            
            if (mode === 'photo') {
                capturePhotoBtn.style.display = 'flex';
                recordVideoBtn.style.display = 'none';
            } else {
                capturePhotoBtn.style.display = 'none';
                recordVideoBtn.style.display = 'flex';
            }
        } catch (err) {
            console.error("Error accessing camera: ", err);
            alert("Could not access camera. Please ensure permissions are granted.");
        }
    }

    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
        cameraStream.srcObject = null;
        cameraModal.classList.remove('active');
        
        if (isRecording) {
            mediaRecorder.stop();
            isRecording = false;
            recordVideoBtn.classList.remove('recording');
        }
    }

    // Event Listeners for Camera
    btnTakePhoto.addEventListener('click', () => openCamera('photo'));
    btnRecordVideo.addEventListener('click', () => openCamera('video'));
    closeCameraBtn.addEventListener('click', stopCamera);

    capturePhotoBtn.addEventListener('click', () => {
        // Draw to canvas
        const context = photoCanvas.getContext('2d');
        photoCanvas.width = cameraStream.videoWidth;
        photoCanvas.height = cameraStream.videoHeight;
        context.drawImage(cameraStream, 0, 0, photoCanvas.width, photoCanvas.height);
        
        // Convert to Base64
        const dataUrl = photoCanvas.toDataURL('image/jpeg');
        mediaAttachments.push({ type: 'image/jpeg', url: dataUrl });
        
        stopCamera();
        renderMediaPreviews();
    });

    recordVideoBtn.addEventListener('click', () => {
        if (!isRecording) {
            // Start recording
            recordedChunks = [];
            mediaRecorder = new MediaRecorder(stream);
            
            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    recordedChunks.push(e.data);
                }
            };
            
            mediaRecorder.onstop = () => {
                const blob = new Blob(recordedChunks, { type: 'video/webm' });
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = () => {
                    mediaAttachments.push({ type: 'video/webm', url: reader.result });
                    renderMediaPreviews();
                };
            };
            
            mediaRecorder.start();
            isRecording = true;
            recordVideoBtn.classList.add('recording');
        } else {
            // Stop recording
            mediaRecorder.stop();
            isRecording = false;
            recordVideoBtn.classList.remove('recording');
            stopCamera();
        }
    });

    // ----- File Upload Operations -----
    fileUploadInput.addEventListener('change', (e) => {
        const files = e.target.files;
        if (!files.length) return;
        
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                mediaAttachments.push({ type: file.type, url: ev.target.result });
                renderMediaPreviews();
            };
            reader.readAsDataURL(file);
        });
        
        fileUploadInput.value = '';
    });

    // ----- Form Submission -----
    const issueForm = document.getElementById('issueForm');
    const submitBtn = document.getElementById('submitIssueBtn');
    
    issueForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const newComplaint = {
            id: 'FAC-ISSUE-' + Math.floor(Math.random() * 1000000),
            title: document.getElementById('issueTitle').value,
            category: document.getElementById('issueCategory').value,
            department: document.getElementById('issueCategory').value,
            location: document.getElementById('issueLocation').value,
            description: document.getElementById('issueDescription').value,
            status: 'New / Unassigned',
            priority: 'Medium',
            user: 'Faculty Member',
            date: dateStr,
            fullDate: new Date().toISOString(),
            media: mediaAttachments // Base64 data urls
        };
        
        let complaints = JSON.parse(localStorage.getItem('campus_tickets_master') || '[]');
        complaints.push(newComplaint);
        
        submitBtn.textContent = 'Saving...';
        submitBtn.disabled = true;
        
        try {
            localStorage.setItem('campus_tickets_master', JSON.stringify(complaints));
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 500);
            
        } catch (e) {
            console.error("Storage limit exceeded", e);
            alert("Error: Storage limit exceeded! Your photos/videos are too large for browser Local Storage. Try submitting without media or with smaller files.");
            submitBtn.textContent = 'Submit Issue Report';
            submitBtn.disabled = false;
            
            // Remove the failing complaint
            complaints.pop();
        }
    });
});

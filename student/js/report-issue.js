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
        if (!mediaPreviewContainer) return;
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
        if (cameraStream) cameraStream.srcObject = null;
        if (cameraModal) cameraModal.classList.remove('active');
        
        if (isRecording) {
            mediaRecorder.stop();
            isRecording = false;
            if (recordVideoBtn) recordVideoBtn.classList.remove('recording');
        }
    }

    // Event Listeners for Camera
    if (btnTakePhoto) btnTakePhoto.addEventListener('click', () => openCamera('photo'));
    if (btnRecordVideo) btnRecordVideo.addEventListener('click', () => openCamera('video'));
    if (closeCameraBtn) closeCameraBtn.addEventListener('click', stopCamera);

    if (capturePhotoBtn) {
        capturePhotoBtn.addEventListener('click', () => {
            const context = photoCanvas.getContext('2d');
            photoCanvas.width = cameraStream.videoWidth;
            photoCanvas.height = cameraStream.videoHeight;
            context.drawImage(cameraStream, 0, 0, photoCanvas.width, photoCanvas.height);
            
            const dataUrl = photoCanvas.toDataURL('image/jpeg');
            mediaAttachments.push({ type: 'image/jpeg', url: dataUrl });
            
            stopCamera();
            renderMediaPreviews();
        });
    }

    if (recordVideoBtn) {
        recordVideoBtn.addEventListener('click', () => {
            if (!isRecording) {
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
                mediaRecorder.stop();
                isRecording = false;
                recordVideoBtn.classList.remove('recording');
                stopCamera();
            }
        });
    }

    // ----- File Upload Operations -----
    if (fileUploadInput) {
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
    }

    // ----- Form Submission with Backend API (POST /api/issues) -----
    const issueForm = document.getElementById('issueForm');
    const submitBtn = document.getElementById('submitIssueBtn');
    
    if (issueForm) {
        issueForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const title = document.getElementById('issueTitle').value;
            const category = document.getElementById('issueCategory').value;
            const location = document.getElementById('issueLocation').value;
            const description = document.getElementById('issueDescription').value;

            if (!title || !category || !location || !description) {
                alert('Please fill in all required fields.');
                return;
            }

            submitBtn.textContent = 'Saving...';
            submitBtn.disabled = true;

            const token = localStorage.getItem('token');
            const apiUrl = (window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1'))
                ? 'http://localhost:3000/api/issues'
                : '/api/issues';

            fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title,
                    category,
                    location,
                    description,
                    priority: 'Medium',
                    media: mediaAttachments.map(m => m.url)
                })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    window.location.href = 'dashboard.html';
                } else {
                    alert('Error submitting issue: ' + (data.message || 'Server error'));
                    submitBtn.textContent = 'Submit Issue Report';
                    submitBtn.disabled = false;
                }
            })
            .catch(err => {
                console.error('[Submit Issue Error]', err);
                alert('Network error while submitting issue.');
                submitBtn.textContent = 'Submit Issue Report';
                submitBtn.disabled = false;
            });
        });
    }
});

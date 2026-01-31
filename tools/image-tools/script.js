// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tool-section').forEach(s => s.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).classList.add('active');
    });
});

// Utility functions
function showLoading(text = 'Processing image...') {
    document.getElementById('loadingText').textContent = text;
    document.getElementById('loadingOverlay').classList.add('active');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('active');
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function setupDropZone(dropZoneId, inputId, onFileLoad) {
    const dropZone = document.getElementById(dropZoneId);
    const input = document.getElementById(inputId);

    dropZone.addEventListener('click', () => input.click());
    
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });
    
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            onFileLoad(file);
        }
    });
    
    input.addEventListener('change', (e) => {
        if (e.target.files[0]) {
            onFileLoad(e.target.files[0]);
        }
    });
}

// ==================== RESIZE TOOL ====================
let resizeImage = null;
let resizeAspectRatio = 1;

function initResize() {
    setupDropZone('resizeDropZone', 'resizeInput', loadResizeImage);
    
    document.getElementById('resizeWidth').addEventListener('input', updateResizeFromWidth);
    document.getElementById('resizeHeight').addEventListener('input', updateResizeFromHeight);
    document.getElementById('resizeScale').addEventListener('input', updateResizeFromScale);
    document.getElementById('applyResize').addEventListener('click', applyResize);
    document.getElementById('downloadResize').addEventListener('click', downloadResize);
    document.getElementById('clearResize').addEventListener('click', clearResize);
    
    document.querySelectorAll('input[name="resizeFormat"]').forEach(radio => {
        radio.addEventListener('change', updateFormatUI);
    });
    
    document.getElementById('resizeQuality').addEventListener('input', (e) => {
        document.getElementById('qualityValue').textContent = e.target.value;
    });
}

function updateFormatUI() {
    const format = document.querySelector('input[name="resizeFormat"]:checked').value;
    const qualityControl = document.getElementById('qualityControl');
    qualityControl.style.display = format !== 'image/png' ? 'block' : 'none';
}

function loadResizeImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        resizeImage = new Image();
        resizeImage.onload = () => {
            resizeAspectRatio = resizeImage.width / resizeImage.height;
            
            document.getElementById('resizeOriginal').src = e.target.result;
            document.getElementById('resizeWidth').value = resizeImage.width;
            document.getElementById('resizeHeight').value = resizeImage.height;
            document.getElementById('resizeScale').value = 100;
            
            document.getElementById('resizeInfo').innerHTML = 
                `Original: <span>${resizeImage.width} × ${resizeImage.height}</span> | 
                 File size: <span>${formatFileSize(file.size)}</span> | 
                 Type: <span>${file.type}</span>`;
            
            document.getElementById('resizePreview').style.display = 'block';
            applyResize();
        };
        resizeImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function updateResizeFromWidth() {
    if (!resizeImage) return;
    const width = parseInt(document.getElementById('resizeWidth').value) || 1;
    if (document.getElementById('maintainAspect').checked) {
        document.getElementById('resizeHeight').value = Math.round(width / resizeAspectRatio);
    }
    updateScaleFromDimensions();
}

function updateResizeFromHeight() {
    if (!resizeImage) return;
    const height = parseInt(document.getElementById('resizeHeight').value) || 1;
    if (document.getElementById('maintainAspect').checked) {
        document.getElementById('resizeWidth').value = Math.round(height * resizeAspectRatio);
    }
    updateScaleFromDimensions();
}

function updateScaleFromDimensions() {
    if (!resizeImage) return;
    const width = parseInt(document.getElementById('resizeWidth').value) || 1;
    const scale = (width / resizeImage.width) * 100;
    document.getElementById('resizeScale').value = Math.round(scale);
}

function updateResizeFromScale() {
    if (!resizeImage) return;
    const scale = parseInt(document.getElementById('resizeScale').value) || 1;
    document.getElementById('resizeWidth').value = Math.round(resizeImage.width * scale / 100);
    document.getElementById('resizeHeight').value = Math.round(resizeImage.height * scale / 100);
}

function applyResize() {
    if (!resizeImage) return;
    
    const canvas = document.getElementById('resizeCanvas');
    const ctx = canvas.getContext('2d');
    const width = parseInt(document.getElementById('resizeWidth').value) || 1;
    const height = parseInt(document.getElementById('resizeHeight').value) || 1;
    
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(resizeImage, 0, 0, width, height);
}

function downloadResize() {
    const canvas = document.getElementById('resizeCanvas');
    const format = document.querySelector('input[name="resizeFormat"]:checked').value;
    const quality = parseInt(document.getElementById('resizeQuality').value) / 100;
    
    const link = document.createElement('a');
    link.download = `resized-${Date.now()}.${format.split('/')[1]}`;
    link.href = canvas.toDataURL(format, quality);
    link.click();
}

function clearResize() {
    resizeImage = null;
    document.getElementById('resizeInput').value = '';
    document.getElementById('resizePreview').style.display = 'none';
}

// ==================== CROP TOOL ====================
let cropImage = null;
let cropData = { x: 0, y: 0, width: 100, height: 100 };
let cropAspectRatio = null;
let isDragging = false;
let isResizing = false;
let dragStart = { x: 0, y: 0 };
let resizeHandle = null;
let imageScale = 1;

function initCrop() {
    setupDropZone('cropDropZone', 'cropInput', loadCropImage);
    
    document.getElementById('applyCrop').addEventListener('click', applyCrop);
    document.getElementById('downloadCrop').addEventListener('click', downloadCrop);
    document.getElementById('clearCrop').addEventListener('click', clearCrop);
    
    document.querySelectorAll('.aspect-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.aspect-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            setAspectRatio(btn.dataset.ratio);
        });
    });
    
    ['cropX', 'cropY', 'cropWidth', 'cropHeight'].forEach(id => {
        document.getElementById(id).addEventListener('input', updateCropFromInputs);
    });
    
    setupCropInteraction();
}

function loadCropImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        cropImage = new Image();
        cropImage.onload = () => {
            const imgEl = document.getElementById('cropImage');
            imgEl.src = e.target.result;
            
            // Calculate image scale
            imgEl.onload = () => {
                imageScale = imgEl.naturalWidth / imgEl.clientWidth;
                
                // Set initial crop to center 80%
                const initialWidth = Math.round(cropImage.width * 0.8);
                const initialHeight = Math.round(cropImage.height * 0.8);
                
                cropData = {
                    x: Math.round((cropImage.width - initialWidth) / 2),
                    y: Math.round((cropImage.height - initialHeight) / 2),
                    width: initialWidth,
                    height: initialHeight
                };
                
                updateCropInputs();
                updateCropOverlay();
                
                document.getElementById('cropInfo').innerHTML = 
                    `Original: <span>${cropImage.width} × ${cropImage.height}</span> | 
                     File size: <span>${formatFileSize(file.size)}</span>`;
                
                document.getElementById('cropPreview').style.display = 'block';
                document.getElementById('cropOverlay').style.display = 'block';
                
                applyCrop();
            };
        };
        cropImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function setAspectRatio(ratio) {
    if (ratio === 'free') {
        cropAspectRatio = null;
    } else {
        const [w, h] = ratio.split(':').map(Number);
        cropAspectRatio = w / h;
        
        // Adjust current crop to match ratio
        const currentCenterX = cropData.x + cropData.width / 2;
        const currentCenterY = cropData.y + cropData.height / 2;
        
        let newWidth = cropData.width;
        let newHeight = newWidth / cropAspectRatio;
        
        if (newHeight > cropImage.height) {
            newHeight = cropImage.height * 0.8;
            newWidth = newHeight * cropAspectRatio;
        }
        
        cropData.width = Math.round(newWidth);
        cropData.height = Math.round(newHeight);
        cropData.x = Math.max(0, Math.min(cropImage.width - cropData.width, Math.round(currentCenterX - newWidth / 2)));
        cropData.y = Math.max(0, Math.min(cropImage.height - cropData.height, Math.round(currentCenterY - newHeight / 2)));
        
        updateCropInputs();
        updateCropOverlay();
        applyCrop();
    }
}

function setupCropInteraction() {
    const overlay = document.getElementById('cropOverlay');
    const cropWrapper = document.querySelector('.crop-wrapper');
    
    overlay.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('crop-handle')) {
            isResizing = true;
            resizeHandle = e.target.classList[1];
        } else {
            isDragging = true;
        }
        dragStart = { x: e.clientX, y: e.clientY };
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging && !isResizing) return;
        
        const imgEl = document.getElementById('cropImage');
        const rect = imgEl.getBoundingClientRect();
        const scaleX = cropImage.width / rect.width;
        const scaleY = cropImage.height / rect.height;
        
        const deltaX = (e.clientX - dragStart.x) * scaleX;
        const deltaY = (e.clientY - dragStart.y) * scaleY;
        
        if (isDragging) {
            cropData.x = Math.max(0, Math.min(cropImage.width - cropData.width, cropData.x + deltaX));
            cropData.y = Math.max(0, Math.min(cropImage.height - cropData.height, cropData.y + deltaY));
        } else if (isResizing) {
            handleResize(deltaX, deltaY);
        }
        
        dragStart = { x: e.clientX, y: e.clientY };
        updateCropInputs();
        updateCropOverlay();
    });
    
    document.addEventListener('mouseup', () => {
        if (isDragging || isResizing) {
            applyCrop();
        }
        isDragging = false;
        isResizing = false;
        resizeHandle = null;
    });
    
    // Click on image to start new crop
    cropWrapper.addEventListener('mousedown', (e) => {
        if (e.target === document.getElementById('cropImage')) {
            const rect = e.target.getBoundingClientRect();
            const scaleX = cropImage.width / rect.width;
            const scaleY = cropImage.height / rect.height;
            
            cropData.x = (e.clientX - rect.left) * scaleX;
            cropData.y = (e.clientY - rect.top) * scaleY;
            cropData.width = 10;
            cropData.height = 10;
            
            isResizing = true;
            resizeHandle = 'se';
            dragStart = { x: e.clientX, y: e.clientY };
            
            updateCropOverlay();
        }
    });
}

function handleResize(deltaX, deltaY) {
    const minSize = 20;
    
    if (resizeHandle.includes('e')) {
        cropData.width = Math.max(minSize, Math.min(cropImage.width - cropData.x, cropData.width + deltaX));
    }
    if (resizeHandle.includes('w')) {
        const newX = cropData.x + deltaX;
        const newWidth = cropData.width - deltaX;
        if (newX >= 0 && newWidth >= minSize) {
            cropData.x = newX;
            cropData.width = newWidth;
        }
    }
    if (resizeHandle.includes('s')) {
        cropData.height = Math.max(minSize, Math.min(cropImage.height - cropData.y, cropData.height + deltaY));
    }
    if (resizeHandle.includes('n')) {
        const newY = cropData.y + deltaY;
        const newHeight = cropData.height - deltaY;
        if (newY >= 0 && newHeight >= minSize) {
            cropData.y = newY;
            cropData.height = newHeight;
        }
    }
    
    if (cropAspectRatio) {
        if (resizeHandle.includes('e') || resizeHandle.includes('w')) {
            cropData.height = cropData.width / cropAspectRatio;
        } else {
            cropData.width = cropData.height * cropAspectRatio;
        }
    }
    
    cropData.x = Math.round(cropData.x);
    cropData.y = Math.round(cropData.y);
    cropData.width = Math.round(cropData.width);
    cropData.height = Math.round(cropData.height);
}

function updateCropInputs() {
    document.getElementById('cropX').value = Math.round(cropData.x);
    document.getElementById('cropY').value = Math.round(cropData.y);
    document.getElementById('cropWidth').value = Math.round(cropData.width);
    document.getElementById('cropHeight').value = Math.round(cropData.height);
}

function updateCropFromInputs() {
    cropData.x = parseInt(document.getElementById('cropX').value) || 0;
    cropData.y = parseInt(document.getElementById('cropY').value) || 0;
    cropData.width = parseInt(document.getElementById('cropWidth').value) || 100;
    cropData.height = parseInt(document.getElementById('cropHeight').value) || 100;
    
    updateCropOverlay();
    applyCrop();
}

function updateCropOverlay() {
    const overlay = document.getElementById('cropOverlay');
    const imgEl = document.getElementById('cropImage');
    const rect = imgEl.getBoundingClientRect();
    
    const scaleX = rect.width / cropImage.width;
    const scaleY = rect.height / cropImage.height;
    
    overlay.style.left = (cropData.x * scaleX) + 'px';
    overlay.style.top = (cropData.y * scaleY) + 'px';
    overlay.style.width = (cropData.width * scaleX) + 'px';
    overlay.style.height = (cropData.height * scaleY) + 'px';
}

function applyCrop() {
    if (!cropImage) return;
    
    const canvas = document.getElementById('cropCanvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = cropData.width;
    canvas.height = cropData.height;
    
    ctx.drawImage(
        cropImage,
        cropData.x, cropData.y, cropData.width, cropData.height,
        0, 0, cropData.width, cropData.height
    );
}

function downloadCrop() {
    const canvas = document.getElementById('cropCanvas');
    const link = document.createElement('a');
    link.download = `cropped-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

function clearCrop() {
    cropImage = null;
    cropAspectRatio = null;
    document.getElementById('cropInput').value = '';
    document.getElementById('cropPreview').style.display = 'none';
    document.getElementById('cropOverlay').style.display = 'none';
    document.querySelectorAll('.aspect-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.aspect-btn[data-ratio="free"]').classList.add('active');
}

// ==================== BACKGROUND REMOVAL TOOL ====================
let bgImage = null;

function initBgRemoval() {
    setupDropZone('bgDropZone', 'bgInput', loadBgImage);
    
    document.getElementById('applyBgRemoval').addEventListener('click', applyBgRemoval);
    document.getElementById('downloadBg').addEventListener('click', downloadBg);
    document.getElementById('clearBg').addEventListener('click', clearBg);
    
    document.getElementById('bgTransparent').addEventListener('change', (e) => {
        document.getElementById('bgColor').disabled = e.target.checked;
    });
}

function loadBgImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        bgImage = new Image();
        bgImage.onload = () => {
            document.getElementById('bgOriginal').src = e.target.result;
            
            document.getElementById('bgInfo').innerHTML = 
                `Original: <span>${bgImage.width} × ${bgImage.height}</span> | 
                 File size: <span>${formatFileSize(file.size)}</span>`;
            
            document.getElementById('bgPreview').style.display = 'block';
            
            // Show original in result canvas initially
            const canvas = document.getElementById('bgCanvas');
            const ctx = canvas.getContext('2d');
            canvas.width = bgImage.width;
            canvas.height = bgImage.height;
            ctx.drawImage(bgImage, 0, 0);
        };
        bgImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function applyBgRemoval() {
    if (!bgImage) return;
    
    showLoading('Removing background... This may take a moment.');
    
    setTimeout(() => {
        const canvas = document.getElementById('bgCanvas');
        const ctx = canvas.getContext('2d');
        const threshold = parseInt(document.getElementById('bgThreshold').value);
        const useTransparent = document.getElementById('bgTransparent').checked;
        const bgColorHex = document.getElementById('bgColor').value;
        
        canvas.width = bgImage.width;
        canvas.height = bgImage.height;
        ctx.drawImage(bgImage, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Get background color from corners (average)
        const corners = [
            0, // top-left
            (canvas.width - 1) * 4, // top-right
            (canvas.height - 1) * canvas.width * 4, // bottom-left
            ((canvas.height - 1) * canvas.width + canvas.width - 1) * 4 // bottom-right
        ];
        
        let bgR = 0, bgG = 0, bgB = 0;
        corners.forEach(idx => {
            bgR += data[idx];
            bgG += data[idx + 1];
            bgB += data[idx + 2];
        });
        bgR = Math.round(bgR / 4);
        bgG = Math.round(bgG / 4);
        bgB = Math.round(bgB / 4);
        
        // Parse replacement color
        const replaceR = parseInt(bgColorHex.slice(1, 3), 16);
        const replaceG = parseInt(bgColorHex.slice(3, 5), 16);
        const replaceB = parseInt(bgColorHex.slice(5, 7), 16);
        
        // Calculate threshold based on slider (0-100 maps to color distance)
        const colorThreshold = (100 - threshold) * 2.55 * 1.5; // Invert so higher = more removal
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Calculate color distance from background
            const distance = Math.sqrt(
                Math.pow(r - bgR, 2) +
                Math.pow(g - bgG, 2) +
                Math.pow(b - bgB, 2)
            );
            
            if (distance < colorThreshold) {
                if (useTransparent) {
                    // Make transparent with smooth edge
                    const alpha = Math.min(255, distance * 255 / colorThreshold);
                    data[i + 3] = Math.round(alpha);
                } else {
                    // Replace with color
                    const blend = Math.min(1, distance / colorThreshold);
                    data[i] = Math.round(r * blend + replaceR * (1 - blend));
                    data[i + 1] = Math.round(g * blend + replaceG * (1 - blend));
                    data[i + 2] = Math.round(b * blend + replaceB * (1 - blend));
                }
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
        hideLoading();
    }, 100);
}

function downloadBg() {
    const canvas = document.getElementById('bgCanvas');
    const link = document.createElement('a');
    link.download = `no-bg-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

function clearBg() {
    bgImage = null;
    document.getElementById('bgInput').value = '';
    document.getElementById('bgPreview').style.display = 'none';
}

// Initialize all tools
document.addEventListener('DOMContentLoaded', () => {
    initResize();
    initCrop();
    initBgRemoval();
});

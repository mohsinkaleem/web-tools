// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tool-section').forEach(s => s.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).classList.add('active');
    });
});

function showLoading(text = 'Loading...') {
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

function setupDropZone(dropZoneId, inputId, onFileLoad, multiple = false) {
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
        const files = multiple ? Array.from(e.dataTransfer.files) : [e.dataTransfer.files[0]];
        onFileLoad(files);
    });
    
    input.addEventListener('change', (e) => {
        const files = multiple ? Array.from(e.target.files) : [e.target.files[0]];
        if (files[0]) onFileLoad(files);
    });
}

// ==================== ENHANCED PDF VIEWER ====================
let pdfDoc = null;
let currentPage = 1;
let pdfData = null;
let currentRotation = 0;
let viewMode = 'single';

function initViewer() {
    setupDropZone('viewerDropZone', 'viewerInput', (files) => loadPdf(files[0]));
    
    document.getElementById('prevPage').addEventListener('click', () => {
        if (viewMode === 'continuous') {
            goToPage(currentPage - 20);
        } else {
            goToPage(currentPage - 1);
        }
    });
    document.getElementById('nextPage').addEventListener('click', () => {
        if (viewMode === 'continuous') {
            goToPage(currentPage + 20);
        } else {
            goToPage(currentPage + 1);
        }
    });
    document.getElementById('pageNum').addEventListener('change', (e) => goToPage(parseInt(e.target.value)));
    document.getElementById('zoomLevel').addEventListener('change', () => renderCurrentView());
    document.getElementById('viewMode').addEventListener('change', (e) => {
        viewMode = e.target.value;
        renderCurrentView();
    });
    document.getElementById('rotatePdf').addEventListener('click', () => {
        currentRotation = (currentRotation + 90) % 360;
        renderCurrentView();
    });
    document.getElementById('downloadPdf').addEventListener('click', downloadCurrentPdf);
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (pdfDoc && document.getElementById('viewerContent').style.display !== 'none') {
            if (e.key === 'ArrowLeft' || e.key === 'PageUp') goToPage(currentPage - 1);
            if (e.key === 'ArrowRight' || e.key === 'PageDown') goToPage(currentPage + 1);
            if (e.key === 'Home') goToPage(1);
            if (e.key === 'End') goToPage(pdfDoc.numPages);
        }
    });
}

async function loadPdf(file, password = null) {
    showLoading('Loading PDF...');
    
    try {
        const arrayBuffer = await file.arrayBuffer();
        pdfData = arrayBuffer;
        
        const loadingTask = pdfjsLib.getDocument({
            data: arrayBuffer,
            password: password
        });
        
        pdfDoc = await loadingTask.promise;
        currentRotation = 0;
        
        document.getElementById('totalPages').textContent = pdfDoc.numPages;
        document.getElementById('pageNum').max = pdfDoc.numPages;
        
        document.getElementById('pdfInfo').innerHTML = 
            `File: <span>${file.name}</span> | 
             Pages: <span>${pdfDoc.numPages}</span> | 
             Size: <span>${formatFileSize(file.size)}</span>`;
        
        document.getElementById('viewerContent').style.display = 'block';
        
        await generateThumbnails();
        await goToPage(1);
    } catch (error) {
        console.error('Error loading PDF:', error);
        if (error.name === 'PasswordException') {
            const pwd = prompt('This PDF is password protected. Please enter the password:');
            if (pwd) {
                await loadPdf(file, pwd);
                return;
            }
        }
        alert('Error loading PDF. Please make sure it\'s a valid PDF file.');
    }
    
    hideLoading();
}

async function generateThumbnails() {
    const sidebar = document.getElementById('pdfSidebar');
    sidebar.innerHTML = '';
    
    for (let i = 1; i <= Math.min(pdfDoc.numPages, 50); i++) { // Limit thumbnails for performance
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: 0.15 });
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        await page.render({ canvasContext: ctx, viewport: viewport }).promise;
        
        const thumbDiv = document.createElement('div');
        thumbDiv.className = 'pdf-thumbnail' + (i === 1 ? ' active' : '');
        thumbDiv.dataset.page = i;
        thumbDiv.appendChild(canvas);
        
        const label = document.createElement('div');
        label.className = 'pdf-thumbnail-label';
        label.textContent = `${i}`;
        thumbDiv.appendChild(label);
        
        thumbDiv.addEventListener('click', () => goToPage(i));
        sidebar.appendChild(thumbDiv);
    }
    
    if (pdfDoc.numPages > 50) {
        const moreLabel = document.createElement('div');
        moreLabel.style.cssText = 'text-align: center; padding: 10px; color: var(--text-muted); font-size: 0.85rem;';
        moreLabel.textContent = `... and ${pdfDoc.numPages - 50} more pages`;
        sidebar.appendChild(moreLabel);
    }
}

async function goToPage(num) {
    if (!pdfDoc || num < 1 || num > pdfDoc.numPages) return;
    
    currentPage = num;
    document.getElementById('pageNum').value = num;
    
    // Update thumbnail selection
    document.querySelectorAll('.pdf-thumbnail').forEach(t => t.classList.remove('active'));
    const activeThumb = document.querySelector(`.pdf-thumbnail[data-page="${num}"]`);
    if (activeThumb) {
        activeThumb.classList.add('active');
        activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    await renderCurrentView();
}

async function renderCurrentView() {
    const container = document.getElementById('pdfCanvasContainer');
    container.innerHTML = '';
    
    if (viewMode === 'single') {
        await renderPage(currentPage, container);
    } else {
        // Continuous mode - render 20 pages starting from current page
        const pagesToRender = 20;
        const totalPages = pdfDoc.numPages;
        const endPage = Math.min(currentPage + pagesToRender - 1, totalPages);
        
        if (totalPages > pagesToRender) {
            const warning = document.createElement('div');
            warning.className = 'view-warning';
            warning.textContent = `Displaying pages ${currentPage} to ${endPage} of ${totalPages}.`;
            container.appendChild(warning);
        }
        
        for (let i = currentPage; i <= endPage; i++) {
            await renderPage(i, container);
        }
    }
}

async function renderPage(num, container) {
    const page = await pdfDoc.getPage(num);
    let zoomValue = document.getElementById('zoomLevel').value;
    let scale = 1.5;
    
    const containerWidth = container.clientWidth - 40;
    const containerHeight = container.clientHeight - 40;
    const originalViewport = page.getViewport({ scale: 1, rotation: currentRotation });
    
    if (zoomValue === 'fit-width') {
        scale = containerWidth / originalViewport.width;
    } else if (zoomValue === 'fit-page') {
        const scaleX = containerWidth / originalViewport.width;
        const scaleY = containerHeight / originalViewport.height;
        scale = Math.min(scaleX, scaleY);
    } else {
        scale = parseFloat(zoomValue) * 1.5;
    }
    
    const viewport = page.getViewport({ scale: scale, rotation: currentRotation });
    
    const canvas = document.createElement('canvas');
    canvas.id = `page-${num}`;
    const ctx = canvas.getContext('2d');
    
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    await page.render({
        canvasContext: ctx,
        viewport: viewport
    }).promise;
    
    container.appendChild(canvas);
}

function downloadCurrentPdf() {
    if (!pdfData) return;
    
    const blob = new Blob([pdfData], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'document.pdf';
    link.click();
    URL.revokeObjectURL(link.href);
}

// ==================== PDF MERGE ====================
let pdfFiles = [];

function initMerge() {
    setupDropZone('mergeDropZone', 'mergeInput', addPdfFiles, true);
    
    document.getElementById('mergePdfs').addEventListener('click', mergePdfs);
    document.getElementById('clearMerge').addEventListener('click', clearMerge);
}

async function addPdfFiles(files) {
    for (const file of files) {
        if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
            try {
                const arrayBuffer = await file.arrayBuffer();
                const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
                const pdf = await loadingTask.promise;
                
                pdfFiles.push({
                    name: file.name,
                    size: file.size,
                    pages: pdf.numPages,
                    data: arrayBuffer
                });
            } catch (error) {
                if (error.name === 'PasswordException') {
                    const password = prompt(`The file "${file.name}" is password protected. Enter password to add:`);
                    if (password) {
                        try {
                            const arrayBuffer = await file.arrayBuffer();
                            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer, password });
                            const pdf = await loadingTask.promise;
                            pdfFiles.push({
                                name: file.name,
                                size: file.size,
                                pages: pdf.numPages,
                                data: arrayBuffer,
                                password: password
                            });
                        } catch (e) {
                            alert(`Failed to add "${file.name}": Incorrect password.`);
                        }
                    }
                } else {
                    console.error('Error adding PDF:', error);
                }
            }
        }
    }
    
    updateMergeList();
}

function updateMergeList() {
    const list = document.getElementById('mergeList');
    
    if (pdfFiles.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: var(--text-muted);">No PDFs added yet</p>';
        document.getElementById('mergePdfs').disabled = true;
        return;
    }
    
    document.getElementById('mergePdfs').disabled = pdfFiles.length < 2;
    
    list.innerHTML = pdfFiles.map((file, index) => `
        <div class="pdf-item" draggable="true" data-index="${index}">
            <span class="pdf-item-handle">☰</span>
            <span class="pdf-item-icon">📄</span>
            <div class="pdf-item-info">
                <div class="pdf-item-name">${file.name}</div>
                <div class="pdf-item-meta">${file.pages} pages • ${formatFileSize(file.size)}</div>
            </div>
            <button class="pdf-item-remove" onclick="removePdf(${index})">×</button>
        </div>
    `).join('');
    
    // Setup drag and drop reordering
    setupDragReorder();
}

function removePdf(index) {
    pdfFiles.splice(index, 1);
    updateMergeList();
}

function setupDragReorder() {
    const items = document.querySelectorAll('.pdf-item');
    let draggedItem = null;
    
    items.forEach(item => {
        item.addEventListener('dragstart', () => {
            draggedItem = item;
            setTimeout(() => item.classList.add('dragging'), 0);
        });
        
        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
            draggedItem = null;
        });
        
        item.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (draggedItem && draggedItem !== item) {
                const list = document.getElementById('mergeList');
                const items = Array.from(list.children);
                const draggedIndex = items.indexOf(draggedItem);
                const targetIndex = items.indexOf(item);
                
                if (draggedIndex < targetIndex) {
                    item.after(draggedItem);
                } else {
                    item.before(draggedItem);
                }
                
                // Update array order
                const [removed] = pdfFiles.splice(draggedIndex, 1);
                pdfFiles.splice(targetIndex, 0, removed);
            }
        });
    });
}

async function mergePdfs() {
    if (pdfFiles.length < 2) return;
    
    showLoading('Merging PDFs...');
    
    try {
        const { PDFDocument } = PDFLib;
        const mergedPdf = await PDFDocument.create();
        
        for (const file of pdfFiles) {
            const pdf = await PDFDocument.load(file.data, { 
                password: file.password,
                ignoreEncryption: false 
            });
            const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            pages.forEach(page => mergedPdf.addPage(page));
        }
        
        const mergedBytes = await mergedPdf.save();
        const blob = new Blob([mergedBytes], { type: 'application/pdf' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `merged-${Date.now()}.pdf`;
        link.click();
        URL.revokeObjectURL(link.href);
    } catch (error) {
        console.error('Error merging PDFs:', error);
        alert('Error merging PDFs. Please try again.');
    }
    
    hideLoading();
}

function clearMerge() {
    pdfFiles = [];
    document.getElementById('mergeInput').value = '';
    updateMergeList();
}

// ==================== PDF SPLIT ====================
let splitPdfData = null;
let splitPdfDoc = null;

function initSplit() {
    setupDropZone('splitDropZone', 'splitInput', (files) => loadSplitPdf(files[0]));
    
    document.getElementById('extractPages').addEventListener('click', extractPages);
    document.getElementById('clearSplit').addEventListener('click', clearSplit);
}

async function loadSplitPdf(file) {
    showLoading('Loading PDF...');
    
    try {
        const arrayBuffer = await file.arrayBuffer();
        splitPdfData = arrayBuffer;
        splitPdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        document.getElementById('splitInfo').innerHTML = 
            `File: <span>${file.name}</span> | 
             Pages: <span>${splitPdfDoc.numPages}</span> | 
             Size: <span>${formatFileSize(file.size)}</span>`;
        
        document.getElementById('pageRange').placeholder = `1-${splitPdfDoc.numPages}`;
        document.getElementById('splitContent').style.display = 'block';
    } catch (error) {
        console.error('Error loading PDF:', error);
        alert('Error loading PDF. Please make sure it\'s a valid PDF file.');
    }
    
    hideLoading();
}

function parsePageRange(rangeStr, maxPages) {
    const pages = new Set();
    const parts = rangeStr.split(',').map(s => s.trim());
    
    for (const part of parts) {
        if (part.includes('-')) {
            const [start, end] = part.split('-').map(n => parseInt(n.trim()));
            for (let i = start; i <= end && i <= maxPages; i++) {
                if (i >= 1) pages.add(i);
            }
        } else {
            const num = parseInt(part);
            if (num >= 1 && num <= maxPages) pages.add(num);
        }
    }
    
    return Array.from(pages).sort((a, b) => a - b);
}

async function extractPages() {
    if (!splitPdfData) return;
    
    const rangeStr = document.getElementById('pageRange').value;
    if (!rangeStr) {
        alert('Please enter a page range.');
        return;
    }
    
    const pages = parsePageRange(rangeStr, splitPdfDoc.numPages);
    if (pages.length === 0) {
        alert('Invalid page range.');
        return;
    }
    
    showLoading('Extracting pages...');
    
    try {
        const { PDFDocument } = PDFLib;
        const srcPdf = await PDFDocument.load(splitPdfData);
        const newPdf = await PDFDocument.create();
        
        const pageIndices = pages.map(p => p - 1);
        const copiedPages = await newPdf.copyPages(srcPdf, pageIndices);
        copiedPages.forEach(page => newPdf.addPage(page));
        
        const pdfBytes = await newPdf.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `extracted-pages-${Date.now()}.pdf`;
        link.click();
        URL.revokeObjectURL(link.href);
    } catch (error) {
        console.error('Error extracting pages:', error);
        alert('Error extracting pages. Please try again.');
    }
    
    hideLoading();
}

function clearSplit() {
    splitPdfData = null;
    splitPdfDoc = null;
    document.getElementById('splitInput').value = '';
    document.getElementById('pageRange').value = '';
    document.getElementById('splitContent').style.display = 'none';
}

// ==================== PDF PASSWORD REMOVER ====================
let unlockPdfFile = null;
let unlockPdfData = null;

function initUnlock() {
    setupDropZone('unlockDropZone', 'unlockInput', (files) => loadUnlockPdf(files[0]));
    
    document.getElementById('unlockPdf').addEventListener('click', removePassword);
    document.getElementById('clearUnlock').addEventListener('click', clearUnlock);
    document.getElementById('pdfPassword').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') removePassword();
    });
}

async function loadUnlockPdf(file) {
    showLoading('Checking PDF...');
    unlockPdfFile = file;
    
    try {
        const arrayBuffer = await file.arrayBuffer();
        unlockPdfData = arrayBuffer;
        
        document.getElementById('unlockInfo').innerHTML = 
            `File: <span>${file.name}</span> | Size: <span>${formatFileSize(file.size)}</span>`;
        
        document.getElementById('unlockContent').style.display = 'block';
        
        // Try to open without password to check if it's encrypted
        try {
            const { PDFDocument } = PDFLib;
            await PDFDocument.load(arrayBuffer);
            
            // PDF opened successfully - no password
            const statusEl = document.getElementById('passwordStatus');
            statusEl.className = 'password-status no-password';
            statusEl.innerHTML = '<span class="icon">📄</span><div><strong>Status: </strong>This PDF is not password protected.</div>';
            document.getElementById('passwordSection').style.display = 'none';
        } catch (e) {
            // PDF is likely encrypted
            const statusEl = document.getElementById('passwordStatus');
            statusEl.className = 'password-status encrypted';
            statusEl.innerHTML = '<span class="icon">🔒</span><div><strong>Status: </strong>This PDF is password protected. Enter the password below to unlock.</div>';
            document.getElementById('passwordSection').style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading PDF:', error);
        alert('Error loading PDF file.');
    }
    
    hideLoading();
}

async function removePassword() {
    const password = document.getElementById('pdfPassword').value;
    if (!password) {
        alert('Please enter the PDF password.');
        return;
    }
    
    showLoading('Removing password protection...');
    
    try {
        // First, try to open with pdf.js to decrypt
        const loadingTask = pdfjsLib.getDocument({
            data: unlockPdfData,
            password: password
        });
        
        const pdfDocument = await loadingTask.promise;
        
        // Get the decrypted data by re-saving with pdf-lib
        // We need to render and recreate since pdf-lib can't directly remove encryption
        const { PDFDocument } = PDFLib;
        
        // Try loading with password
        const pdfDoc = await PDFDocument.load(unlockPdfData, {
            password: password,
            ignoreEncryption: false
        });
        
        // Save without encryption
        const unlockedBytes = await pdfDoc.save();
        
        // Download the unlocked PDF
        const blob = new Blob([unlockedBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `unlocked-${unlockPdfFile.name}`;
        link.click();
        URL.revokeObjectURL(link.href);
        
        // Update status
        const statusEl = document.getElementById('passwordStatus');
        statusEl.className = 'password-status unlocked';
        statusEl.innerHTML = '<span class="icon">✅</span><div><strong>Success! </strong>Password removed. The unlocked PDF has been downloaded.</div>';
        document.getElementById('passwordSection').style.display = 'none';
        
    } catch (error) {
        console.error('Error removing password:', error);
        if (error.name === 'PasswordException' || error.message.includes('password')) {
            alert('Incorrect password. Please try again.');
        } else {
            alert('Error processing PDF: ' + error.message);
        }
    }
    
    hideLoading();
}

function clearUnlock() {
    unlockPdfFile = null;
    unlockPdfData = null;
    document.getElementById('unlockInput').value = '';
    document.getElementById('pdfPassword').value = '';
    document.getElementById('unlockContent').style.display = 'none';
}

// ==================== ENHANCED EPUB READER (epub.js) ====================
let book = null;
let rendition = null;

function initEpub() {
    setupDropZone('epubDropZone', 'epubInput', (files) => loadEpub(files[0]));
    
    document.getElementById('prevChapter').addEventListener('click', () => {
        if (rendition) rendition.prev();
    });
    document.getElementById('nextChapter').addEventListener('click', () => {
        if (rendition) rendition.next();
    });
    document.getElementById('epubFontSize').addEventListener('change', updateEpubStyle);
    document.getElementById('epubTheme').addEventListener('change', updateEpubTheme);
    document.getElementById('epubFont').addEventListener('change', updateEpubStyle);
    
    document.getElementById('progressSlider').addEventListener('input', (e) => {
        if (book && rendition) {
            const cfi = book.locations.cfiFromPercentage(e.target.value / 100);
            rendition.display(cfi);
        }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (rendition && document.getElementById('epubContent').style.display !== 'none') {
            if (e.key === 'ArrowLeft') rendition.prev();
            if (e.key === 'ArrowRight') rendition.next();
        }
    });
}

async function loadEpub(file) {
    showLoading('Loading EPUB...');
    
    try {
        // Clean up previous book
        if (book) {
            book.destroy();
        }
        
        // Use Blob/File directly which is more robust
        book = ePub(file);
        
        // Wait for book to be ready
        await book.ready;
        
        // Get metadata
        const metadata = await book.loaded.metadata;
        const title = metadata.title || 'Unknown Title';
        const author = metadata.creator || 'Unknown Author';
        
        document.getElementById('epubInfo').innerHTML = 
            `Title: <span>${title}</span> | Author: <span>${author}</span>`;
        
        document.getElementById('epubContent').style.display = 'block';
        
        // Create rendition
        rendition = book.renderTo('epub-reader', {
            width: '100%',
            height: '100%',
            spread: 'none',
            flow: 'scrolled-doc'
        });
        
        // Display first chapter
        await rendition.display();
        
        // Generate locations for progress
        await book.locations.generate(1024);
        
        // Build table of contents
        const toc = await book.loaded.navigation;
        buildToc(toc.toc);
        
        // Apply initial styles
        updateEpubTheme();
        updateEpubStyle();
        
        // Track progress
        rendition.on('relocated', (location) => {
            const percent = book.locations.percentageFromCfi(location.start.cfi);
            const percentRounded = Math.round(percent * 100);
            document.getElementById('currentPercent').textContent = percentRounded + '%';
            document.getElementById('progressSlider').value = percentRounded;
            
            // Update TOC active state
            updateTocActive(location);
        });
        
    } catch (error) {
        console.error('Error loading EPUB:', error);
        alert('Error loading EPUB. Please make sure it\'s a valid EPUB file.');
    }
    
    hideLoading();
}

function buildToc(toc, container = null, level = 0) {
    const tocList = container || document.getElementById('tocList');
    if (!container) tocList.innerHTML = '';
    
    toc.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'toc-item' + (level > 0 ? ' nested' : '');
        div.textContent = item.label.trim();
        div.dataset.href = item.href;
        div.style.paddingLeft = (12 + level * 12) + 'px';
        
        div.addEventListener('click', () => {
            if (rendition) {
                rendition.display(item.href);
            }
            document.querySelectorAll('.toc-item').forEach(t => t.classList.remove('active'));
            div.classList.add('active');
        });
        
        tocList.appendChild(div);
        
        if (item.subitems && item.subitems.length > 0) {
            buildToc(item.subitems, tocList, level + 1);
        }
    });
}

function updateTocActive(location) {
    const href = location.start.href;
    document.querySelectorAll('.toc-item').forEach(item => {
        const itemHref = item.dataset.href;
        if (itemHref && href.includes(itemHref.split('#')[0])) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

function updateEpubTheme() {
    if (!rendition) return;
    
    const theme = document.getElementById('epubTheme').value;
    const container = document.getElementById('epubReaderContainer');
    
    container.classList.remove('dark', 'sepia');
    if (theme !== 'light') {
        container.classList.add(theme);
    }
    
    const themes = {
        light: { body: { background: '#ffffff', color: '#1a1a1a' } },
        sepia: { body: { background: '#f4ecd8', color: '#5c4b37' } },
        dark: { body: { background: '#1e1e1e', color: '#e0e0e0' } }
    };
    
    rendition.themes.default(themes[theme]);
}

function updateEpubStyle() {
    if (!rendition) return;
    
    const fontSize = document.getElementById('epubFontSize').value;
    const fontFamily = document.getElementById('epubFont').value;
    
    rendition.themes.fontSize(fontSize + '%');
    rendition.themes.font(fontFamily);
}

// Initialize all tools
document.addEventListener('DOMContentLoaded', () => {
    initViewer();
    initMerge();
    initSplit();
    initUnlock();
    initEpub();
});
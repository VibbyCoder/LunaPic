let currentDir = '', imagesList = [], currentIndex = -1, fullPath = '';
let scale = 1, panX = 0, panY = 0, isDragging = false, startX, startY;

const imgElement = document.getElementById('viewer-img');
const emptyState = document.getElementById('empty-state');
const hud = document.getElementById('hud');
const metaOverlay = document.getElementById('meta-overlay');

document.getElementById('btn-minimize').onclick = () => window.api.windowMinimize();
document.getElementById('btn-maximize').onclick = () => window.api.windowMaximize();
document.getElementById('btn-close').onclick = () => window.api.windowClose();

async function loadFile(filePath) {
    const data = await window.api.getFolderImages(filePath);
    if (!data) return;
    currentDir = data.dir;
    imagesList = data.images;
    currentIndex = imagesList.indexOf(data.currentFileName);
    if (currentIndex === -1) currentIndex = 0;
    renderCurrentImage();
}

window.api.onOpenFile((filePath) => loadFile(filePath));
window.addEventListener('dragover', (e) => { e.preventDefault(); e.stopPropagation(); });
window.addEventListener('drop', (e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.dataTransfer.files.length > 0) loadFile(window.api.getPathForFile(e.dataTransfer.files[0]));
});

// FIX: Define onload globally so it ALWAYS fires when src changes, guaranteeing resolution shows
imgElement.onload = () => {
    const w = imgElement.naturalWidth;
    const h = imgElement.naturalHeight;
    let ratioString = '';
    const ratio = w / h;
    
    if (Math.abs(ratio - 16/9) < 0.02) ratioString = '16:9';
    else if (Math.abs(ratio - 4/3) < 0.02) ratioString = '4:3';
    else if (Math.abs(ratio - 21/9) < 0.02) ratioString = '21:9';
    else if (Math.abs(ratio - 1/1) < 0.02) ratioString = '1:1';
    else if (Math.abs(ratio - 9/16) < 0.02) ratioString = '9:16';
    else {
        const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
        const divisor = gcd(w, h);
        ratioString = `${w/divisor}:${h/divisor}`;
    }
    document.getElementById('meta-res').innerText = `${w} × ${h} (${ratioString})`;
};

async function renderCurrentImage() {
    if (imagesList.length === 0) return;
    const fileName = imagesList[currentIndex];
    const separator = currentDir.includes('\\') ? '\\' : '/';
    fullPath = `${currentDir}${separator}${fileName}`;

    // Clear old resolution text instantly on load
    document.getElementById('meta-res').innerText = '...';
    
    imgElement.src = `local://${encodeURIComponent(fullPath)}`;
    imgElement.style.display = 'block';
    emptyState.style.display = 'none';
    document.getElementById('canvas-container').style.cursor = 'grab';

    const meta = await window.api.getFileMeta(fullPath);
    document.getElementById('meta-date').innerText = meta.date;
    document.getElementById('meta-size').innerText = meta.sizeMB;
    document.getElementById('meta-loc').innerText = meta.location; 
    document.getElementById('meta-path').innerText = fullPath;

    scale = 1; panX = 0; panY = 0;
    updateTransform();
    
    document.getElementById('hud-filename').innerText = fileName;
    document.getElementById('hud-counter').innerText = `${currentIndex + 1} / ${imagesList.length}`;
    showHudTemporarily();
}

function updateTransform() {
    imgElement.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
}

window.addEventListener('keydown', (e) => {
    if (imagesList.length === 0) return;
    if (e.key === 'ArrowRight') { currentIndex = (currentIndex + 1) % imagesList.length; renderCurrentImage(); } 
    else if (e.key === 'ArrowLeft') { currentIndex = (currentIndex - 1 + imagesList.length) % imagesList.length; renderCurrentImage(); } 
    else if (e.key === 'Escape') { window.api.windowClose(); }
});

window.addEventListener('wheel', (e) => {
    if (imgElement.style.display === 'none') return;
    const zoomSensitivity = 0.1;
    if (e.deltaY < 0) scale += zoomSensitivity;
    else scale = Math.max(1, scale - zoomSensitivity);
    
    document.getElementById('hud-zoom').innerText = `${Math.round(scale * 100)}%`;
    showHudTemporarily();
    updateTransform();
});

const container = document.getElementById('canvas-container');
container.addEventListener('click', async () => {
    if (imagesList.length === 0) {
        const filePath = await window.api.openFileDialog();
        if (filePath) loadFile(filePath);
    }
});
if (imagesList.length === 0) container.style.cursor = 'pointer';

container.addEventListener('dblclick', (e) => {
    if (imagesList.length === 0) return;
    if (scale > 1) { scale = 1; panX = 0; panY = 0; } 
    else {
        scale = 2.5; 
        panX = (e.clientX - window.innerWidth / 2) * (1 - scale);
        panY = (e.clientY - window.innerHeight / 2) * (1 - scale);
    }
    document.getElementById('hud-zoom').innerText = `${Math.round(scale * 100)}%`;
    showHudTemporarily();
    updateTransform();
});

container.addEventListener('mousedown', (e) => {
    if (scale <= 1) return;
    isDragging = true; startX = e.clientX - panX; startY = e.clientY - panY;
});
window.addEventListener('mousemove', (e) => {
    if (imagesList.length > 0) showHudTemporarily();
    if (!isDragging) return;
    panX = e.clientX - startX; panY = e.clientY - startY;
    updateTransform();
});
window.addEventListener('mouseup', () => isDragging = false);

let hudTimeout;
function showHudTemporarily() {
    hud.classList.remove('hidden');
    metaOverlay.classList.remove('hidden');
    clearTimeout(hudTimeout);
    hudTimeout = setTimeout(() => {
        hud.classList.add('hidden');
        metaOverlay.classList.add('hidden');
    }, 2500);
}
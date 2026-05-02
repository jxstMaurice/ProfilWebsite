// =============================================================
// Profile Website
// =============================================================

const GITHUB_USER = 'jxstMaurice';

// === UI Helpers ===
const $ = (id) => document.getElementById(id);

const setText = (id, text) => {
    const el = $(id);
    if (el) el.innerText = text;
};

const notify = (message) => {
    const el = $('notification');
    el.innerText = message;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2000);
};

const copyToClipboard = (text, label) =>
    navigator.clipboard.writeText(text).then(() => notify(`${label} kopiert!`));

// === Modals ===
const toggleModal = (id) => {
    const modal = $(id);
    if (!modal) return;
    modal.classList.toggle('hidden');
    if (!modal.classList.contains('hidden')) {
        modal.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    if (id === 'info-modal') loadVisitorInfo();
};

const toggleWalletModal = () => toggleModal('wallet-modal');
const toggleInfoModal = () => toggleModal('info-modal');
const toggleConverterModal = () => toggleModal('converter-modal');

const enterPortfolio = () => {
    document.body.classList.add('entered');
    loadVisitorInfo();
};

// === Visitor Info ===
let visitorInfoLoaded = false;

const detectBrowser = (ua) => {
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Edg')) return 'Edge';
    if (ua.includes('OPR') || ua.includes('Opera')) return 'Opera';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';
    return 'Unbekannt';
};

const detectOS = (ua) => {
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Android')) return 'Android';
    if (/iPhone|iPad/.test(ua)) return 'iOS';
    if (ua.includes('Mac OS')) return 'Mac OS';
    if (ua.includes('Linux')) return 'Linux';
    return 'Unbekannt';
};

async function loadVisitorInfo() {
    if (visitorInfoLoaded) { updateCookies(); return; }

    try {
        const data = await fetch('https://ipapi.co/json/').then(r => r.json());
        setText('visitor-ip', `IP: ${data.ip} (${data.city || 'Unbekannt'}, ${data.country_name || '??'})`);
        setText('visitor-isp', `Provider: ${data.org || '-'}`);
    } catch {
        setText('visitor-isp', 'Provider: Nicht verfügbar');
        try {
            const data = await fetch('https://api.ipify.org?format=json').then(r => r.json());
            setText('visitor-ip', `IP: ${data.ip}`);
        } catch {
            setText('visitor-ip', 'IP: Nicht verfügbar');
        }
    }

    setText('visitor-screen', `Auflösung: ${screen.width}x${screen.height}`);
    setText('visitor-lang', `Sprache: ${navigator.language || '-'}`);

    let referrer = 'Direkt';
    if (document.referrer) {
        try { referrer = new URL(document.referrer).hostname; } catch { referrer = 'Unbekannt'; }
    }
    setText('visitor-referrer', `Herkunft: ${referrer}`);

    const ua = navigator.userAgent;
    setText('visitor-browser', `Browser: ${detectBrowser(ua)} (${detectOS(ua)})`);

    const cores = navigator.hardwareConcurrency || '-';
    const ram = navigator.deviceMemory ? `${navigator.deviceMemory} GB` : '-';
    setText('visitor-hardware', `Hardware: ${cores} Kerne / ${ram} RAM`);
    setText('visitor-tz', `Zeitzone: ${Intl.DateTimeFormat().resolvedOptions().timeZone || '-'}`);

    updateStatus();

    const [perf] = performance.getEntriesByType('navigation');
    if (perf) {
        const loadTime = perf.loadEventEnd > 0 ? perf.loadEventEnd - perf.startTime : performance.now();
        setText('visitor-load', `Ladezeit: ${loadTime.toFixed(0)}ms`);
    }

    visitorInfoLoaded = true;
    updateCookies();
}

const updateCookies = () => {
    const cookies = document.cookie;
    const display = cookies ? (cookies.length > 50 ? cookies.slice(0, 50) + '...' : cookies) : 'Keine gefunden';
    setText('visitor-cookies', `Cookies: ${display}`);
};

const updateStatus = () => setText('visitor-status', `Status: ${navigator.onLine ? 'Online' : 'Offline'}`);

const updatePing = async () => {
    if (!$('visitor-ping')) return;
    const start = performance.now();
    try {
        await fetch('https://api.ipify.org?format=json', { method: 'HEAD', mode: 'no-cors', cache: 'no-cache' });
        setText('visitor-ping', `Ping: ${(performance.now() - start).toFixed(0)}ms`);
    } catch {
        setText('visitor-ping', 'Ping: Fehler');
    }
};

setInterval(updateStatus, 1000);
setInterval(updatePing, 3000);
updatePing();

// === Drag ===
const initDrag = (element, skipSelector = 'i, a, .wallet-item') => {
    if (!element) return;
    let lastX = 0, lastY = 0;

    const onMove = (e) => {
        e.preventDefault();
        const dx = e.clientX - lastX, dy = e.clientY - lastY;
        lastX = e.clientX; lastY = e.clientY;
        const m = (element.style.transform || '').match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);
        const x = m ? parseFloat(m[1]) : 0, y = m ? parseFloat(m[2]) : 0;
        element.style.transform = `translate(${x + dx}px, ${y + dy}px)`;
    };

    const onUp = () => {
        document.removeEventListener('mouseup', onUp);
        document.removeEventListener('mousemove', onMove);
        element.style.cursor = 'grab';
    };

    element.addEventListener('mousedown', (e) => {
        if (e.target.closest(skipSelector)) return;
        e.preventDefault();
        lastX = e.clientX; lastY = e.clientY;
        document.addEventListener('mouseup', onUp);
        document.addEventListener('mousemove', onMove);
        element.style.cursor = 'grabbing';
    });
};

initDrag($('wallet-modal'));
initDrag($('info-modal'));
initDrag($('converter-modal'), 'button, input, select, label, .drop-zone, .close-modal');

// === Title Animation ===
const animateTitle = (title) => {
    let i = 0, dir = 1;
    setInterval(() => {
        i += dir;
        if (i === title.length) dir = -1;
        else if (i === 1) dir = 1;
        document.title = title.substring(0, i);
    }, 500);
};

animateTitle("Maurice's coole Website");

// === Misc ===
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('dragstart', e => { if (e.target.tagName === 'IMG') e.preventDefault(); });

// === GitHub Avatar ===
(async () => {
    try {
        const data = await fetch(`https://api.github.com/users/${GITHUB_USER}`).then(r => r.json());
        if (data.avatar_url) $('github-avatar').src = data.avatar_url;
    } catch (e) {
        console.error('Avatar konnte nicht geladen werden:', e);
    }
})();

// =============================================================
// File Converter
// =============================================================

const CONVERTER_FORMATS = {
    'image/heic':       ['jpeg', 'png', 'webp', 'pdf'],
    'image/heif':       ['jpeg', 'png', 'webp', 'pdf'],
    'image/png':        ['jpeg', 'webp', 'pdf'],
    'image/jpeg':       ['png', 'webp', 'pdf'],
    'image/webp':       ['png', 'jpeg', 'pdf'],
    'image/gif':        ['png', 'jpeg', 'pdf'],
    'image/svg+xml':    ['png', 'jpeg', 'webp', 'pdf'],
    'image/bmp':        ['png', 'jpeg', 'webp', 'pdf'],
    'image/tiff':       ['png', 'jpeg', 'pdf'],
    'text/plain':       ['html', 'json', 'csv', 'xml', 'pdf'],
    'text/markdown':    ['html', 'txt', 'pdf'],
    'text/html':        ['txt', 'md', 'pdf'],
    'application/json': ['csv', 'xml', 'yaml', 'toml', 'xlsx', 'html', 'txt', 'pdf'],
    'text/csv':         ['json', 'xml', 'xlsx', 'html', 'pdf'],
    'application/xml':  ['json', 'csv'],
    'application/yaml': ['json'],
    'application/toml': ['json'],
    'text/x-ini':       ['json'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['csv', 'json', 'pdf'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['html', 'txt', 'pdf'],
};

// MIME aliases that map to a primary type above
const MIME_ALIAS = {
    'text/xml':         'application/xml',
    'application/x-yaml': 'application/yaml',
    'text/yaml':        'application/yaml',
    'application/vnd.ms-excel': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

const FORMAT_LABELS = {
    jpeg: 'JPEG', png: 'PNG', webp: 'WebP', pdf: 'PDF',
    html: 'HTML', json: 'JSON', txt: 'TXT', md: 'Markdown',
    csv: 'CSV', xml: 'XML', yaml: 'YAML', toml: 'TOML',
    xlsx: 'Excel (XLSX)',
};

const EXT_TO_MIME = {
    heic: 'image/heic', heif: 'image/heif',
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
    webp: 'image/webp', gif: 'image/gif', svg: 'image/svg+xml',
    bmp: 'image/bmp', tiff: 'image/tiff', tif: 'image/tiff',
    txt: 'text/plain', json: 'application/json',
    csv: 'text/csv', xml: 'application/xml',
    yaml: 'application/yaml', yml: 'application/yaml',
    toml: 'application/toml',
    ini: 'text/x-ini', cfg: 'text/x-ini', conf: 'text/x-ini',
    html: 'text/html', htm: 'text/html',
    md: 'text/markdown',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    xls: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

let converterFile = null;
let convertedBlob = null;
let convertedFilename = '';

// === Converter Helpers ===
const escapeHtml = (s) =>
    String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const wrapHtml = (body, css = '') =>
    `<!DOCTYPE html>\n<html>\n<head><meta charset="UTF-8">${css ? `<style>${css}</style>` : ''}</head>\n<body>${body}</body>\n</html>`;

const TABLE_CSS = 'table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:8px}th{background:#f2f2f2}';

const tableHtml = (headers, rows) => {
    const head = `<tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>`;
    const body = rows.map(r => `<tr>${headers.map(h => `<td>${r[h] ?? ''}</td>`).join('')}</tr>`).join('');
    return wrapHtml(`<table>${head}${body}</table>`, TABLE_CSS);
};

const csvEscape = (v) => {
    const s = String(v ?? '');
    return /[,"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const writeXlsx = (rows, isAoa = false) => {
    if (!window.XLSX) throw new Error('Excel-Library nicht geladen');
    const ws = isAoa ? XLSX.utils.aoa_to_sheet(rows) : XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    return new Blob([XLSX.write(wb, { type: 'array', bookType: 'xlsx' })], { type: XLSX_MIME });
};

const canvasToBlob = (canvas, format) => new Promise((resolve, reject) => {
    const mime = format === 'jpeg' ? 'image/jpeg' : `image/${format}`;
    canvas.toBlob(b => b ? resolve(b) : reject(new Error('Canvas-Konvertierung fehlgeschlagen')), mime, 0.92);
});

const canvasToPdf = (canvas) => {
    if (!window.jspdf) throw new Error('PDF-Library nicht geladen');
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const ratio = Math.min((pageW - 20) / canvas.width, (pageH - 20) / canvas.height);
    const w = canvas.width * ratio, h = canvas.height * ratio;
    doc.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', (pageW - w) / 2, (pageH - h) / 2, w, h);
    return doc.output('blob');
};

const textToPdf = (text) => {
    if (!window.jspdf) throw new Error('PDF-Library nicht geladen');
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const margin = 15, lineH = 6;
    const maxW = doc.internal.pageSize.getWidth() - 2 * margin;
    const pageH = doc.internal.pageSize.getHeight();
    doc.setFontSize(11);
    let y = margin;
    for (const line of doc.splitTextToSize(text, maxW)) {
        if (y + lineH > pageH - margin) { doc.addPage(); y = margin; }
        doc.text(line, margin, y);
        y += lineH;
    }
    return doc.output('blob');
};

const loadImage = (file, mime) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        if (mime === 'image/svg+xml') {
            const url = URL.createObjectURL(new Blob([e.target.result], { type: 'image/svg+xml' }));
            img.onload = () => { resolve(img); URL.revokeObjectURL(url); };
            img.onerror = () => reject(new Error('SVG konnte nicht geladen werden'));
            img.src = url;
        } else {
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('Bild konnte nicht geladen werden'));
            img.src = e.target.result;
        }
    };
    if (mime === 'image/svg+xml') reader.readAsText(file);
    else reader.readAsDataURL(file);
});

const drawToCanvas = (img) => {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width || 800;
    canvas.height = img.naturalHeight || img.height || 600;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    return canvas;
};

const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
};

const guessFileMime = (name) =>
    EXT_TO_MIME[name.split('.').pop().toLowerCase()] || 'application/octet-stream';

const normalizeMime = (mime) => MIME_ALIAS[mime] || mime;

// === Converter UI ===
const showConverterError = (msg) => {
    const el = $('converter-error');
    el.textContent = msg;
    el.classList.remove('hidden');
};

const initConverter = () => {
    const dropZone = $('converter-drop');
    dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
    dropZone.addEventListener('drop', e => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file) handleConverterFile(file);
    });
};

function handleConverterFile(file) {
    converterFile = file;
    convertedBlob = null;

    $('converter-filename').textContent = `${file.name} (${formatFileSize(file.size)})`;
    $('converter-file-info').classList.remove('hidden');
    $('converter-result').classList.add('hidden');
    $('converter-error').classList.add('hidden');

    const mime = normalizeMime(file.type || guessFileMime(file.name));
    const targets = CONVERTER_FORMATS[mime];

    if (!targets?.length) {
        showConverterError('Dateityp wird nicht unterstützt.');
        $('converter-options').classList.add('hidden');
        return;
    }

    const select = $('converter-format');
    select.innerHTML = '';
    for (const fmt of targets) {
        const opt = document.createElement('option');
        opt.value = fmt;
        opt.textContent = FORMAT_LABELS[fmt] || fmt.toUpperCase();
        select.appendChild(opt);
    }

    $('converter-options').classList.remove('hidden');
}

async function runConversion() {
    if (!converterFile) return;

    const format = $('converter-format').value;
    const mime = normalizeMime(converterFile.type || guessFileMime(converterFile.name));
    const baseName = converterFile.name.replace(/\.[^.]+$/, '');
    const btn = document.querySelector('#converter-options .converter-btn');

    $('converter-error').classList.add('hidden');
    $('converter-result').classList.add('hidden');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Läuft...';

    try {
        convertedBlob = await dispatchConversion(converterFile, mime, format);
        convertedFilename = `${baseName}_konvertiert.${format}`;
        $('converter-result').classList.remove('hidden');
    } catch (e) {
        showConverterError('Fehler: ' + e.message);
    }

    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-cogs"></i> Konvertieren';
}

async function dispatchConversion(file, mime, format) {
    if (mime === 'image/heic' || mime === 'image/heif') return convertHeic(file, format);
    if (mime.startsWith('image/')) return convertImage(file, mime, format);

    const handlers = {
        'application/json':  convertJson,
        'text/csv':          convertCsv,
        'text/plain':        convertText,
        'text/markdown':     convertMarkdown,
        'text/html':         convertHtml,
        'application/xml':   convertXml,
        'application/yaml':  convertYaml,
        'application/toml':  convertToml,
        'text/x-ini':        convertIni,
        [XLSX_MIME]:         convertXlsx,
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': convertDocx,
    };

    const fn = handlers[mime];
    if (!fn) throw new Error('Nicht unterstützt');
    return fn(file, format);
}

function downloadConverted() {
    if (!convertedBlob) return;
    const url = URL.createObjectURL(convertedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = convertedFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// === Image ===
async function convertImage(file, fromMime, format) {
    const canvas = drawToCanvas(await loadImage(file, fromMime));
    return format === 'pdf' ? canvasToPdf(canvas) : canvasToBlob(canvas, format);
}

// === HEIC ===
let _libheifModule = null;

const getLibheif = async () => {
    if (_libheifModule) return _libheifModule;
    if (!window.libheif) throw new Error('HEIC-Library nicht geladen');
    _libheifModule = typeof window.libheif === 'function' ? await window.libheif() : window.libheif;
    return _libheifModule;
};

async function convertHeic(file, format) {
    const libheif = await getLibheif();
    if (!libheif.HeifDecoder) throw new Error('HeifDecoder nicht verfügbar');

    const decoder = new libheif.HeifDecoder();
    const images = decoder.decode(new Uint8Array(await file.arrayBuffer()));
    if (!images?.length) throw new Error('HEIC konnte nicht dekodiert werden (siehe Browser-Konsole)');

    const heif = images[0];
    const width = heif.get_width();
    const height = heif.get_height();
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(width, height);

    await new Promise((resolve, reject) => {
        heif.display(imageData, (result) => {
            if (!result) return reject(new Error('HEIC-Dekodierung fehlgeschlagen'));
            ctx.putImageData(result, 0, 0);
            resolve();
        });
    });

    return format === 'pdf' ? canvasToPdf(canvas) : canvasToBlob(canvas, format);
}

// === JSON ===
async function convertJson(file, format) {
    const data = JSON.parse(await file.text());
    const arr = Array.isArray(data) ? data : [data];
    const keys = Object.keys(arr[0] || {});

    switch (format) {
        case 'csv': {
            const rows = [keys.join(','), ...arr.map(r => keys.map(k => csvEscape(r[k])).join(','))];
            return new Blob([rows.join('\n')], { type: 'text/csv' });
        }
        case 'xml':  return new Blob([buildXml(data)], { type: 'application/xml' });
        case 'yaml': return new Blob([window.jsyaml ? window.jsyaml.dump(data) : buildYaml(data)], { type: 'text/yaml' });
        case 'toml': return new Blob([buildToml(data)], { type: 'application/toml' });
        case 'html': return new Blob([tableHtml(keys, arr)], { type: 'text/html' });
        case 'xlsx': return writeXlsx(arr);
        case 'pdf':  return textToPdf(JSON.stringify(data, null, 2));
        default:     return new Blob([JSON.stringify(data, null, 2)], { type: 'text/plain' });
    }
}

const buildXml = (data) => {
    const toXml = (val) => {
        if (Array.isArray(val)) return val.map(item => `<item>${toXml(item)}</item>`).join('');
        if (typeof val === 'object' && val !== null) {
            return Object.entries(val).map(([k, v]) => `<${k}>${toXml(v)}</${k}>`).join('');
        }
        return escapeHtml(val);
    };
    return `<?xml version="1.0" encoding="UTF-8"?>\n<root>${toXml(data)}</root>`;
};

const buildYaml = (obj, indent = 0) => {
    const pad = '  '.repeat(indent);
    if (Array.isArray(obj)) {
        if (!obj.length) return `${pad}[]`;
        return obj.map(item => typeof item === 'object' && item !== null
            ? `${pad}-\n${buildYaml(item, indent + 1)}`
            : `${pad}- ${item}`
        ).join('\n');
    }
    if (typeof obj === 'object' && obj !== null) {
        return Object.entries(obj).map(([k, v]) => typeof v === 'object' && v !== null
            ? `${pad}${k}:\n${buildYaml(v, indent + 1)}`
            : `${pad}${k}: ${v}`
        ).join('\n');
    }
    return `${pad}${obj}`;
};

const buildToml = (obj, prefix = '') => {
    let scalars = '', sections = '';
    for (const [k, v] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${k}` : k;
        if (typeof v === 'string') scalars += `${k} = "${v.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"\n`;
        else if (typeof v === 'number' || typeof v === 'boolean') scalars += `${k} = ${v}\n`;
        else if (Array.isArray(v) && v.every(i => typeof i !== 'object')) {
            scalars += `${k} = [${v.map(i => typeof i === 'string' ? `"${i}"` : i).join(', ')}]\n`;
        } else if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
            sections += `\n[${fullKey}]\n${buildToml(v, fullKey)}`;
        }
    }
    return scalars + sections;
};

// === CSV ===
async function convertCsv(file, format) {
    const text = await file.text();
    const rows = text.trim().split('\n').map(r => r.split(',').map(c => c.trim().replace(/^"|"$/g, '')));
    const headers = rows[0];
    const data = rows.slice(1).map(row => Object.fromEntries(headers.map((h, i) => [h, row[i] ?? ''])));

    switch (format) {
        case 'json': return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        case 'xml': {
            const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<data>\n${data.map(row =>
                `  <row>\n${Object.entries(row).map(([k, v]) => `    <${k}>${v}</${k}>`).join('\n')}\n  </row>`
            ).join('\n')}\n</data>`;
            return new Blob([xml], { type: 'application/xml' });
        }
        case 'xlsx': return writeXlsx(rows, true);
        case 'html': return new Blob([tableHtml(headers, data)], { type: 'text/html' });
        case 'pdf':  return textToPdf(text);
        default:     return new Blob([text], { type: 'text/csv' });
    }
}

// === Text ===
async function convertText(file, format) {
    const text = await file.text();
    switch (format) {
        case 'html':
            return new Blob([wrapHtml(`<pre>${escapeHtml(text)}</pre>`)], { type: 'text/html' });
        case 'json':
            return new Blob([JSON.stringify(text.split('\n').filter(Boolean), null, 2)], { type: 'application/json' });
        case 'csv': {
            const lines = text.split('\n').filter(Boolean);
            return new Blob([lines.map(l => `"${l.replace(/"/g, '""')}"`).join('\n')], { type: 'text/csv' });
        }
        case 'xml': {
            const lines = text.split('\n').filter(Boolean);
            const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<document>\n${lines.map(l => `  <line>${escapeHtml(l)}</line>`).join('\n')}\n</document>`;
            return new Blob([xml], { type: 'application/xml' });
        }
        case 'pdf': return textToPdf(text);
        default:    return new Blob([text], { type: 'text/plain' });
    }
}

// === Markdown ===
async function convertMarkdown(file, format) {
    const text = await file.text();
    switch (format) {
        case 'html': {
            const body = window.marked ? marked.parse(text) : escapeHtml(text).replace(/\n/g, '<br>');
            return new Blob([wrapHtml(body)], { type: 'text/html' });
        }
        case 'txt': {
            const html = window.marked ? marked.parse(text) : text;
            const doc = new DOMParser().parseFromString(html, 'text/html');
            return new Blob([doc.body.textContent || text], { type: 'text/plain' });
        }
        case 'pdf': return textToPdf(text);
        default:    return new Blob([text], { type: 'text/markdown' });
    }
}

// === HTML ===
async function convertHtml(file, format) {
    const text = await file.text();
    const doc = new DOMParser().parseFromString(text, 'text/html');
    const txt = doc.body.innerText || doc.body.textContent || '';
    switch (format) {
        case 'txt': return new Blob([txt], { type: 'text/plain' });
        case 'md':  return new Blob([htmlToMarkdown(doc.body)], { type: 'text/markdown' });
        case 'pdf': return textToPdf(txt);
        default:    return new Blob([text], { type: 'text/html' });
    }
}

const MD_TAGS = {
    h1: i => `\n# ${i}\n\n`,    h2: i => `\n## ${i}\n\n`,
    h3: i => `\n### ${i}\n\n`,  h4: i => `\n#### ${i}\n\n`,
    p:  i => `${i}\n\n`,
    strong: i => `**${i}**`,    b: i => `**${i}**`,
    em: i => `*${i}*`,          i: i => `*${i}*`,
    code: i => `\`${i}\``,
    pre:  i => `\`\`\`\n${i}\n\`\`\`\n\n`,
    li: i => `- ${i}\n`,
    ul: i => `\n${i}`,          ol: i => `\n${i}`,
    br: () => '\n',
    hr: () => '\n---\n\n',
};

const SKIP_TAGS = new Set(['head', 'script', 'style']);

function htmlToMarkdown(node) {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent;
    const tag = node.tagName?.toLowerCase();
    const inner = () => Array.from(node.childNodes).map(htmlToMarkdown).join('');

    if (tag === 'a') return `[${inner()}](${node.getAttribute('href') || ''})`;
    if (tag === 'img') return `![${node.getAttribute('alt') || ''}](${node.getAttribute('src') || ''})`;
    if (tag === 'blockquote') return inner().split('\n').filter(Boolean).map(l => `> ${l}`).join('\n') + '\n\n';
    if (SKIP_TAGS.has(tag)) return '';
    if (MD_TAGS[tag]) return MD_TAGS[tag](inner());
    return inner();
}

// === XML ===
async function convertXml(file, format) {
    const text = await file.text();
    const doc = new DOMParser().parseFromString(text, 'application/xml');

    const nodeToObj = (node) => {
        if (!node.children.length) return node.textContent.trim();
        const obj = {};
        for (const child of node.children) {
            const val = nodeToObj(child);
            if (obj[child.tagName] !== undefined) {
                if (!Array.isArray(obj[child.tagName])) obj[child.tagName] = [obj[child.tagName]];
                obj[child.tagName].push(val);
            } else {
                obj[child.tagName] = val;
            }
        }
        return obj;
    };

    const parsed = nodeToObj(doc.documentElement);
    if (format === 'json') return new Blob([JSON.stringify(parsed, null, 2)], { type: 'application/json' });

    const arr = Array.isArray(parsed) ? parsed : (typeof parsed === 'object' ? [parsed] : [{ value: parsed }]);
    const keys = Object.keys(arr[0] || {});
    const csv = [keys.join(','), ...arr.map(r => keys.map(k => r[k] ?? '').join(','))].join('\n');
    return new Blob([csv], { type: 'text/csv' });
}

// === YAML / TOML / INI ===
async function convertYaml(file) {
    if (!window.jsyaml) throw new Error('YAML-Library nicht geladen');
    return new Blob([JSON.stringify(window.jsyaml.load(await file.text()), null, 2)], { type: 'application/json' });
}

async function convertToml(file) {
    return new Blob([JSON.stringify(parseToml(await file.text()), null, 2)], { type: 'application/json' });
}

const parseTomlValue = (val) => {
    if (val === 'true') return true;
    if (val === 'false') return false;
    if (/^-?\d+$/.test(val)) return parseInt(val);
    if (/^-?\d+\.\d+$/.test(val)) return parseFloat(val);
    if (val.startsWith('"') && val.endsWith('"')) return val.slice(1, -1).replace(/\\"/g, '"');
    if (val.startsWith("'") && val.endsWith("'")) return val.slice(1, -1);
    if (val.startsWith('[')) {
        const inner = val.slice(1, -1).trim();
        return inner ? inner.split(',').map(s => parseTomlValue(s.trim())) : [];
    }
    return val;
};

const parseToml = (text) => {
    const result = {};
    let current = result;
    for (let line of text.split('\n')) {
        line = line.trim();
        if (!line || line.startsWith('#')) continue;
        const sectionMatch = line.match(/^\[([^\]]+)\]$/);
        if (sectionMatch) {
            current = result;
            for (const part of sectionMatch[1].split('.')) {
                if (typeof current[part] !== 'object') current[part] = {};
                current = current[part];
            }
            continue;
        }
        const kvMatch = line.match(/^([^=]+)=(.+)$/);
        if (kvMatch) current[kvMatch[1].trim()] = parseTomlValue(kvMatch[2].trim());
    }
    return result;
};

async function convertIni(file) {
    const text = await file.text();
    const result = {};
    let section = null;
    for (let line of text.split('\n')) {
        line = line.trim();
        if (!line || line.startsWith(';') || line.startsWith('#')) continue;
        const sectionMatch = line.match(/^\[(.+)\]$/);
        if (sectionMatch) { section = sectionMatch[1]; result[section] = {}; continue; }
        const kvMatch = line.match(/^([^=]+)=(.*)$/);
        if (kvMatch) {
            const [, k, v] = kvMatch;
            (section ? result[section] : result)[k.trim()] = v.trim();
        }
    }
    return new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
}

// === Office (XLSX, DOCX) ===
async function convertXlsx(file, format) {
    if (!window.XLSX) throw new Error('Excel-Library nicht geladen');
    const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    if (format === 'csv')  return new Blob([XLSX.utils.sheet_to_csv(ws)], { type: 'text/csv' });
    if (format === 'json') return new Blob([JSON.stringify(XLSX.utils.sheet_to_json(ws), null, 2)], { type: 'application/json' });
    if (format === 'pdf')  return textToPdf(XLSX.utils.sheet_to_csv(ws));
}

async function convertDocx(file, format) {
    if (!window.mammoth) throw new Error('DOCX-Library nicht geladen');
    const { value: html } = await window.mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() });
    if (format === 'html') return new Blob([wrapHtml(html)], { type: 'text/html' });
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const txt = doc.body.innerText || doc.body.textContent || '';
    if (format === 'txt') return new Blob([txt], { type: 'text/plain' });
    if (format === 'pdf') return textToPdf(txt);
}

initConverter();

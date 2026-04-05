function enterPortfolio() {
    document.body.classList.add('entered');
}

function copyToClipboard(text, label) {
    navigator.clipboard.writeText(text).then(() => {
        const notification = document.getElementById('notification');
        notification.innerText = label + " kopiert!";
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, 2000);
    });
}

function toggleWalletModal() {
    toggleModal('wallet-modal');
}

function toggleInfoModal() {
    loadVisitorInfo();
    toggleModal('info-modal');
}

let visitorInfoLoaded = false;
let initialLoadTime = "-";

async function loadVisitorInfo() {
    // Daten nur einmal laden
    if (!visitorInfoLoaded) {
        // ... (fetches)
        fetch('https://ipapi.co/json/')
            .then(res => res.json())
            .then(data => {
                document.getElementById('visitor-ip').innerText = "IP: " + data.ip + " (" + (data.city || "Unbekannt") + ", " + (data.country_name || "??") + ")";
                document.getElementById('visitor-isp').innerText = "Provider: " + (data.org || "-");
            })
            .catch(() => {
                document.getElementById('visitor-isp').innerText = "Provider: Nicht verfügbar";
                // Fallback zu ipify falls ipapi fehlschlägt
                fetch('https://api.ipify.org?format=json')
                    .then(res => res.json())
                    .then(data => {
                        document.getElementById('visitor-ip').innerText = "IP: " + data.ip;
                    })
                    .catch(() => {
                        document.getElementById('visitor-ip').innerText = "IP: Nicht verfügbar";
                    });
            });

        // Screen
        document.getElementById('visitor-screen').innerText = "Auflösung: " + window.screen.width + "x" + window.screen.height;

        // Language
        document.getElementById('visitor-lang').innerText = "Sprache: " + (navigator.language || navigator.userLanguage);

        // Referrer
        let ref = "Direkt";
        if (document.referrer) {
            try {
                ref = new URL(document.referrer).hostname;
            } catch (e) {
                ref = "Unbekannt";
            }
        }
        document.getElementById('visitor-referrer').innerText = "Herkunft: " + ref;

        // Browser & OS Info
        const ua = navigator.userAgent;
        let b = "Unbekannt";
        if (ua.includes("Firefox")) b = "Firefox";
        else if (ua.includes("Chrome") && !ua.includes("Edge") && !ua.includes("OPR")) b = "Chrome";
        else if (ua.includes("Safari") && !ua.includes("Chrome")) b = "Safari";
        else if (ua.includes("Edge") || ua.includes("Edg")) b = "Edge";
        else if (ua.includes("Opera") || ua.includes("OPR")) b = "Opera";

        let os = "Unbekannt";
        if (ua.includes("Windows")) os = "Windows";
        else if (ua.includes("Mac OS")) os = "Mac OS";
        else if (ua.includes("Linux")) os = "Linux";
        else if (ua.includes("Android")) os = "Android";
        else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

        document.getElementById('visitor-browser').innerText = "Browser: " + b + " (" + os + ")";
        
        // Hardware
        const cores = navigator.hardwareConcurrency || "-";
        const ram = navigator.deviceMemory ? navigator.deviceMemory + " GB" : "-";
        document.getElementById('visitor-hardware').innerText = "Hardware: " + cores + " Kerne / " + ram + " RAM";

        // Timezone
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "-";
        document.getElementById('visitor-tz').innerText = "Zeitzone: " + tz;

        // Status
        document.getElementById('visitor-status').innerText = "Status: " + (navigator.onLine ? "Online" : "Offline");

        // Load Time
        const [perf] = performance.getEntriesByType("navigation");
        if (perf) {
            initialLoadTime = perf.loadEventEnd > 0 ? (perf.loadEventEnd - perf.startTime).toFixed(0) : (performance.now()).toFixed(0);
            document.getElementById('visitor-load').innerText = "Ladezeit: " + initialLoadTime + "ms";
        }
        
        visitorInfoLoaded = true;
    }

    // Cookies jedes Mal aktualisieren
    const cookies = document.cookie;
    document.getElementById('visitor-cookies').innerText = "Cookies: " + (cookies ? (cookies.length > 50 ? cookies.substring(0, 50) + "..." : cookies) : "Keine gefunden");
}

function toggleModal(id) {
    const modal = document.getElementById(id);
    const content = modal.querySelector('.modal-content');
    modal.classList.toggle('show');

    if (modal.classList.contains('show')) {
        content.style.top = '';
        content.style.left = '';
        content.style.transform = '';
    }
}

// Drag-Funktionalität für Modals
function initDraggableModals() {
    const modals = ['wallet-modal', 'info-modal'];
    
    modals.forEach(id => {
        const modal = document.getElementById(id);
        const content = modal.querySelector('.modal-content');

        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

        content.onmousedown = (e) => {
            if (e.target.closest('.wallet-item, .info-item, .close-button')) {
                return;
            }

            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = () => {
                document.onmouseup = null;
                document.onmousemove = null;
                content.style.transition = 'transform 0.3s ease';
            };
            document.onmousemove = (e) => {
                e.preventDefault();
                pos1 = pos3 - e.clientX;
                pos2 = pos4 - e.clientY;
                pos3 = e.clientX;
                pos4 = e.clientY;
                content.style.top = (content.offsetTop - pos2) + "px";
                content.style.left = (content.offsetLeft - pos1) + "px";
            };

            content.style.transition = 'none';
            const rect = content.getBoundingClientRect();
            content.style.top = rect.top + 'px';
            content.style.left = rect.left + 'px';
            content.style.transform = 'scale(1)';
            content.style.margin = '0';
        };
    });
}

// Initialisiere die Drag-Funktion
initDraggableModals();

// Live-Updates für ms-Werte, Status und Ping
function startLiveUpdates() {
    setInterval(() => {
        // Status (Live)
        const statusEl = document.getElementById('visitor-status');
        if (statusEl) {
            statusEl.innerText = "Status: " + (navigator.onLine ? "Online" : "Offline");
        }
    }, 50);

    // Ping-Update alle 3 Sekunden
    setInterval(updatePing, 3000);
    updatePing();
}

async function updatePing() {
    const pingEl = document.getElementById('visitor-ping');
    if (!pingEl) return;
    
    const start = performance.now();
    try {
        // HEAD request für minimalen Traffic
        await fetch('https://api.ipify.org?format=json', { method: 'HEAD', mode: 'no-cors', cache: 'no-cache' });
        const end = performance.now();
        pingEl.innerText = "Ping: " + (end - start).toFixed(0) + "ms";
    } catch (e) {
        pingEl.innerText = "Ping: Fehler";
    }
}

startLiveUpdates();

// Schließe die Modals, wenn man außerhalb klickt
window.onclick = function(event) {
    const modals = [document.getElementById('wallet-modal'), document.getElementById('info-modal')];
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.classList.remove('show');
        }
    });
}

function animateTitle(title) {
    let index = 0;
    let direction = 1;

    setInterval(() => {
        index += direction;
        if (index === title.length) {
            direction = -1;
        } else if (index === 1) {
            direction = 1;
        }
        document.title = title.substring(0, index);
    }, 500);
}

animateTitle("Maurice's coole Website");

// Verhindere Rechtsklick und Drag-and-Drop von Bildern
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('dragstart', e => {
    if (e.target.tagName === 'IMG') e.preventDefault();
});
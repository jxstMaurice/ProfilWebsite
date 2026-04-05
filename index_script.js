function enterPortfolio() {
    document.body.classList.add('entered');
    loadVisitorInfo();
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
    const modal = document.getElementById('wallet-modal');
    modal.classList.toggle('hidden');
    if (!modal.classList.contains('hidden')) {
        modal.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function toggleInfoModal() {
    loadVisitorInfo();
    const modal = document.getElementById('info-modal');
    modal.classList.toggle('hidden');
    if (!modal.classList.contains('hidden')) {
        modal.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
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

// Drag-Funktionalität für die Modale
function initDrag(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    element.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        // Ignoriere Klicks auf interaktive Elemente (Icons, Links, Wallet-Items)
        if (e.target.closest('i, a, .wallet-item')) return;

        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
        element.style.cursor = 'grabbing';
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;

        let transform = element.style.transform || "translate(0px, 0px)";
        let matches = transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);
        let currentX = matches ? parseFloat(matches[1]) : 0;
        let currentY = matches ? parseFloat(matches[2]) : 0;

        element.style.transform = `translate(${currentX - pos1}px, ${currentY - pos2}px)`;
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
        element.style.cursor = 'grab';
    }
}

// Initialisiere Drag für beide Modals
initDrag(document.getElementById('wallet-modal'));
initDrag(document.getElementById('info-modal'));

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

// Schließe die Modals (Deaktiviert für permanente Anzeige)
window.onclick = function(event) {
    // Hier passiert nichts mehr, damit Modals offen bleiben
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

// Verhindere Rechtsklick und das Ziehen von Bildern
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('dragstart', e => {
    if (e.target.tagName === 'IMG') e.preventDefault();
});
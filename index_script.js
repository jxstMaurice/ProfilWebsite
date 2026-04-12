const GITHUB_USER = 'jxstMaurice';

const enterPortfolio = () => {
    document.body.classList.add('entered');
    loadVisitorInfo();
};

const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
        const notification = document.getElementById('notification');
        notification.innerText = `${label} kopiert!`;
        notification.classList.add('show');
        setTimeout(() => notification.classList.remove('show'), 2000);
    });
};

const toggleModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.classList.toggle('hidden');
    if (!modal.classList.contains('hidden')) {
        modal.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    if (modalId === 'info-modal') {
        loadVisitorInfo();
    }
};

const toggleWalletModal = () => toggleModal('wallet-modal');
const toggleInfoModal = () => toggleModal('info-modal');

let visitorInfoLoaded = false;

async function loadVisitorInfo() {
    if (visitorInfoLoaded) {
        updateCookies();
        return;
    }

    try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        document.getElementById('visitor-ip').innerText = `IP: ${data.ip} (${data.city || "Unbekannt"}, ${data.country_name || "??"})`;
        document.getElementById('visitor-isp').innerText = `Provider: ${data.org || "-"}`;
    } catch (e) {
        document.getElementById('visitor-isp').innerText = "Provider: Nicht verfügbar";
        try {
            const res = await fetch('https://api.ipify.org?format=json');
            const data = await res.json();
            document.getElementById('visitor-ip').innerText = `IP: ${data.ip}`;
        } catch (err) {
            document.getElementById('visitor-ip').innerText = "IP: Nicht verfügbar";
        }
    }

    document.getElementById('visitor-screen').innerText = `Auflösung: ${window.screen.width}x${window.screen.height}`;
    document.getElementById('visitor-lang').innerText = `Sprache: ${navigator.language || navigator.userLanguage}`;

    let ref = "Direkt";
    if (document.referrer) {
        try {
            ref = new URL(document.referrer).hostname;
        } catch (e) {
            ref = "Unbekannt";
        }
    }
    document.getElementById('visitor-referrer').innerText = `Herkunft: ${ref}`;

    const ua = navigator.userAgent;
    let browser = "Unbekannt";
    if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("Chrome") && !ua.includes("Edge") && !ua.includes("OPR")) browser = "Chrome";
    else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
    else if (ua.includes("Edge") || ua.includes("Edg")) browser = "Edge";
    else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera";

    let os = "Unbekannt";
    if (ua.includes("Windows")) os = "Windows";
    else if (ua.includes("Mac OS")) os = "Mac OS";
    else if (ua.includes("Linux")) os = "Linux";
    else if (ua.includes("Android")) os = "Android";
    else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

    document.getElementById('visitor-browser').innerText = `Browser: ${browser} (${os})`;
    
    const cores = navigator.hardwareConcurrency || "-";
    const ram = navigator.deviceMemory ? `${navigator.deviceMemory} GB` : "-";
    document.getElementById('visitor-hardware').innerText = `Hardware: ${cores} Kerne / ${ram} RAM`;

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "-";
    document.getElementById('visitor-tz').innerText = `Zeitzone: ${tz}`;

    updateStatus();

    const [perf] = performance.getEntriesByType("navigation");
    if (perf) {
        const loadTime = perf.loadEventEnd > 0 ? (perf.loadEventEnd - perf.startTime).toFixed(0) : (performance.now()).toFixed(0);
        document.getElementById('visitor-load').innerText = `Ladezeit: ${loadTime}ms`;
    }
    
    visitorInfoLoaded = true;
    updateCookies();
}

function updateCookies() {
    const cookies = document.cookie;
    const cookieEl = document.getElementById('visitor-cookies');
    if (cookieEl) {
        cookieEl.innerText = `Cookies: ${cookies ? (cookies.length > 50 ? cookies.substring(0, 50) + "..." : cookies) : "Keine gefunden"}`;
    }
}

function updateStatus() {
    const statusEl = document.getElementById('visitor-status');
    if (statusEl) {
        statusEl.innerText = `Status: ${navigator.onLine ? "Online" : "Offline"}`;
    }
}

const initDrag = (element) => {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    const dragMouseDown = (e) => {
        if (e.target.closest('i, a, .wallet-item')) return;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
        element.style.cursor = 'grabbing';
    };

    const elementDrag = (e) => {
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;

        const transform = element.style.transform || "translate(0px, 0px)";
        const matches = transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/i);
        const currentX = matches ? parseFloat(matches[1]) : 0;
        const currentY = matches ? parseFloat(matches[2]) : 0;

        element.style.transform = `translate(${currentX - pos1}px, ${currentY - pos2}px)`;
    };

    const closeDragElement = () => {
        document.onmouseup = null;
        document.onmousemove = null;
        element.style.cursor = 'grab';
    };

    element.onmousedown = dragMouseDown;
};

initDrag(document.getElementById('wallet-modal'));
initDrag(document.getElementById('info-modal'));

const startLiveUpdates = () => {
    setInterval(updateStatus, 1000);
    setInterval(updatePing, 3000);
    updatePing();
};

const updatePing = async () => {
    const pingEl = document.getElementById('visitor-ping');
    if (!pingEl) return;
    
    const start = performance.now();
    try {
        await fetch('https://api.ipify.org?format=json', { method: 'HEAD', mode: 'no-cors', cache: 'no-cache' });
        const end = performance.now();
        pingEl.innerText = `Ping: ${(end - start).toFixed(0)}ms`;
    } catch (e) {
        pingEl.innerText = "Ping: Fehler";
    }
};

startLiveUpdates();

const animateTitle = (title) => {
    let index = 0;
    let direction = 1;

    setInterval(() => {
        index += direction;
        if (index === title.length) direction = -1;
        else if (index === 1) direction = 1;
        document.title = title.substring(0, index);
    }, 500);
};

animateTitle("Maurice's coole Website");

document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('dragstart', e => {
    if (e.target.tagName === 'IMG') e.preventDefault();
});

const fetchGitHubAvatar = async () => {
    try {
        const response = await fetch(`https://api.github.com/users/${GITHUB_USER}`);
        const data = await response.json();
        if (data.avatar_url) {
            document.getElementById('github-avatar').src = data.avatar_url;
        }
    } catch (error) {
        console.error("Fehler beim Laden des GitHub-Avatars:", error);
    }
};

fetchGitHubAvatar();
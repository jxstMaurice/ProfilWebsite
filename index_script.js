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
    const modal = document.getElementById('wallet-modal');
    const content = modal.querySelector('.modal-content');
    modal.classList.toggle('show');

    // Zurücksetzen der Position beim Öffnen
    if (modal.classList.contains('show')) {
        content.style.top = '';
        content.style.left = '';
        content.style.transform = '';
    }
}

// Drag-Funktionalität für das Wallet-Modal
function initDraggableModal() {
    const modal = document.getElementById('wallet-modal');
    const content = modal.querySelector('.modal-content');

    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    // Gesamter Inhalt als Griff (Handle), außer man klickt auf Buttons/Items
    content.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        // Ignoriere Drag, wenn auf interaktive Elemente geklickt wird
        if (e.target.closest('.wallet-item') || e.target.closest('.close-button')) {
            return;
        }

        e.preventDefault();
        // Aktuelle Mausposition beim Start
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;

        // Transition entfernen, damit es beim Ziehen nicht ruckelt/verzögert
        content.style.transition = 'none';

        // Wechsel von translate(-50%, -50%) zu fixen Pixelwerten
        const rect = content.getBoundingClientRect();
        content.style.top = rect.top + 'px';
        content.style.left = rect.left + 'px';
        content.style.transform = 'scale(1)';
        content.style.margin = '0';
    }

    function elementDrag(e) {
        e.preventDefault();
        // Neue Position berechnen
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // Neue Werte setzen
        content.style.top = (content.offsetTop - pos2) + "px";
        content.style.left = (content.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
        // Transition für das nächste Mal (Öffnen/Schließen) wieder aktivieren
        content.style.transition = 'transform 0.3s ease';
    }
}

// Initialisiere die Drag-Funktion
initDraggableModal();

// Schließe das Modal, wenn man außerhalb klickt
window.onclick = function(event) {
    const modal = document.getElementById('wallet-modal');
    if (event.target === modal) {
        modal.classList.remove('show');
    }
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
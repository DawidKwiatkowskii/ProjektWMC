let balance = getCookie('balance') !== null ? getCookie('balance') : 500; // Startguthaben aus Cookie oder 500
let currentBet = 0; // Aktueller Einsatz
let selectedBet = null; // Gewählte Wette

function getCookie(name) { // Cookie lesen
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parseFloat(parts.pop().split(';').shift());
    return null;
}

function setCookie(name, value, days = 365) { // Cookie setzen
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value.toFixed(2)};${expires};path=/`;
}

function shuffle(array) { // Array mischen
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function updateBalance() { // Guthaben aktualisieren
    setCookie('balance', balance);
    document.getElementById('money').innerText = balance.toFixed(2);
    const spinBtn = document.getElementById('spin');
    const betAmount = parseInt(document.getElementById('bet-amount').value) || 0;
    spinBtn.disabled = balance < betAmount || !selectedBet;
}

function createWheel() { // Roulette-Rad erstellen
    const slotsContainer = document.getElementById('wheel-slots');
    slotsContainer.innerHTML = '';
    
    const baseSlots = [
        'Black', 'Black', 'Black', 'Black', 'Black', 'Black', 'Black',
        'Red', 'Red', 'Red', 'Red', 'Red', 'Red', 'Red',
        'Dice'
    ];
    const shuffledSlots = shuffle([...baseSlots]);
    const extendedSlots = [...shuffledSlots, ...shuffledSlots, ...shuffledSlots];

    extendedSlots.forEach((symbol, index) => {
        const slot = document.createElement('div');
        slot.classList.add('slot');
        slot.classList.add(symbol.toLowerCase());
        slot.innerText = symbol === 'Dice' ? '🎲' : symbol.charAt(0);
        slot.id = `slot-${index % 15}`;
        slotsContainer.appendChild(slot);
    });

    return shuffledSlots;
}

function selectBet(event) { // Wette auswählen
    const btn = event.target;
    if (!btn.classList.contains('bet-btn')) return;

    document.querySelectorAll('.bet-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    selectedBet = btn.dataset.type;
    updateBalance();
}

function spinWheel() { // Rad drehen
    const betInput = document.getElementById('bet-amount');
    currentBet = parseInt(betInput.value);

    if (isNaN(currentBet) || currentBet <= 0) {
        document.getElementById('message').innerText = 'Ungültiger Einsatz!';
        return;
    }

    if (currentBet > balance) {
        document.getElementById('message').innerText = 'Nicht genug Chips!';
        return;
    }

    if (!selectedBet) {
        document.getElementById('message').innerText = 'Wette auswählen!';
        return;
    }

    balance -= currentBet;
    updateBalance();

    const spinBtn = document.getElementById('spin');
    spinBtn.disabled = true;
    document.getElementById('message').innerText = 'Dreht...';

    const shuffledSlots = createWheel();
    const wheel = document.getElementById('wheel-slots');
    const wheelWidth = window.innerWidth <= 600 ? 400 : 600;
    const actualSlotWidth = wheelWidth / 15;
    const baseSlots = shuffledSlots.length;
    const randomSlot = Math.floor(Math.random() * baseSlots);
    const pointerOffset = wheelWidth / 2 - actualSlotWidth / 2;
    const extraSpins = baseSlots * 2;
    const finalSlotIndex = extraSpins + randomSlot;
    const finalPosition = -(finalSlotIndex * actualSlotWidth - pointerOffset);

    wheel.style.transition = 'none';
    wheel.style.left = '0px';
    requestAnimationFrame(() => {
        wheel.style.transition = 'left 4s ease-out';
        wheel.style.left = `${finalPosition}px`;
    });

    setTimeout(() => {
        const landingSlotIndex = randomSlot;
        const winningSlotIndex = (landingSlotIndex - 1 + baseSlots) % baseSlots;
        const landingSlotId = `slot-${landingSlotIndex}`;
        const winningSlotId = `slot-${winningSlotIndex}`;
        const landingSlot = document.getElementById(landingSlotId);
        const result = shuffledSlots[winningSlotIndex];

        console.log({
            landingSlotIndex,
            winningSlotIndex,
            landingSlot: landingSlot.innerText,
            result
        });

        document.getElementById('result').innerText = `Ergebnis: ${result}`;
        checkWin(result);
        wheel.style.transition = 'none';
        wheel.style.left = '0px';
        spinBtn.disabled = balance <= 0 || !selectedBet;
        if (balance <= 0) {
            document.getElementById('message').innerText += ' Spiel vorbei! Keine Chips mehr.';
        }
    }, 4000);
}

function checkWin(result) { // Gewinn prüfen
    let winnings = 0;
    if (selectedBet === result) {
        if (result === 'Dice') {
            winnings = currentBet * 14;
        } else {
            winnings = currentBet * 2;
        }
    }

    if (winnings > 0) {
        balance += winnings;
        document.getElementById('message').innerText = `Gewonnen: $${(winnings - currentBet).toFixed(2)}!`;
    } else {
        document.getElementById('message').innerText = 'Verloren!';
    }
    updateBalance();
}

// Event-Listener für Wett-Buttons
document.querySelectorAll('.bet-btn').forEach(btn => {
    btn.addEventListener('click', selectBet);
});

// Start einrichten
createWheel();
updateBalance();

// Event-Listener für Spin-Button
document.getElementById('spin').addEventListener('click', spinWheel);
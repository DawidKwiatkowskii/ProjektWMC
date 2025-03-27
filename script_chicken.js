let balance = getCookie('balance') !== null ? getCookie('balance') : 1000; // Startguthaben aus Cookie oder 1000
const roadSpaces = 5; // Anzahl der Straßenabschnitte
let currentPosition = 0; // Aktuelle Position
let prize = 0; // Aktueller Gewinn
let betAmount = 0; // Einsatz
let gameActive = false; // Spiel läuft

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

function updateBalance() { // Guthaben aktualisieren
    setCookie('balance', balance);
    document.getElementById('balance').textContent = balance.toFixed(2);
    const moveButton = document.getElementById('move-button');
    const cashoutButton = document.getElementById('cashout-button');
    const betInput = document.getElementById('bet-amount');
    const currentBet = parseFloat(betInput.value) || 0;
    moveButton.disabled = (gameActive && currentPosition > 0) || balance < currentBet;
    cashoutButton.disabled = !gameActive || currentPosition === 0;
}

function moveChicken() { // Huhn bewegen
    const betInput = document.getElementById('bet-amount');
    betAmount = parseFloat(betInput.value);
    const chicken = document.getElementById('chicken');
    const car = document.getElementById('car');
    const resultDisplay = document.getElementById('result');
    const messageDisplay = document.getElementById('message');
    const moveButton = document.getElementById('move-button');
    const cashoutButton = document.getElementById('cashout-button');

    if (isNaN(betAmount) || betAmount <= 0) {
        messageDisplay.textContent = 'Ungültiger Einsatz!';
        return;
    }

    if (betAmount > balance && !gameActive) {
        messageDisplay.textContent = 'Nicht genug Guthaben!';
        return;
    }

    if (!gameActive) {
        // Neues Spiel starten
        balance -= betAmount;
        prize = betAmount;
        currentPosition = 0;
        gameActive = true;
        updateBalance();
        resultDisplay.textContent = 'Huhn überquert...';
        messageDisplay.textContent = `Gewinn beginnt bei $${prize.toFixed(2)}`;
    }

    moveButton.disabled = true;
    cashoutButton.disabled = true;

    const roadWidth = window.innerWidth <= 600 ? 300 : 600;
    const spaceWidth = roadWidth / (roadSpaces + 1);

    // 50/50 Überlebenschance
    const survives = Math.random() >= 0.5;

    if (!survives) {
        car.style.left = chicken.style.left; // Auto folgt Huhn
        animateCar(() => {
            resultDisplay.textContent = `Huhn bei Abschnitt ${currentPosition + 1} getroffen! Verloren!`;
            messageDisplay.textContent = `Gewinn war $${prize.toFixed(2)}, aber kein Gewinn.`;
            gameActive = false;
            chicken.style.left = '0px';
            car.style.top = '-50px';
            updateBalance();
        });
        return;
    }

    // Nächster Abschnitt und Gewinn verdoppeln
    currentPosition++;
    prize *= 2;
    chicken.style.left = `${currentPosition * spaceWidth}px`;
    messageDisplay.textContent = `Abschnitt ${currentPosition}: Gewinn ist jetzt $${prize.toFixed(2)}`;

    if (currentPosition >= roadSpaces) {
        // Huhn hat es geschafft
        balance += prize;
        resultDisplay.textContent = `Huhn hat es geschafft! Gewonnen: $${prize.toFixed(2)}!`;
        messageDisplay.textContent = '';
        gameActive = false;
        chicken.style.left = '0px';
        updateBalance();
    } else {
        moveButton.disabled = false;
        cashoutButton.disabled = false;
    }
}

function cashOut() { // Auszahlen
    const chicken = document.getElementById('chicken');
    const resultDisplay = document.getElementById('result');
    const messageDisplay = document.getElementById('message');

    if (!gameActive || currentPosition === 0) return;

    balance += prize;
    resultDisplay.textContent = `Bei Abschnitt ${currentPosition} ausgezahlt! Gewonnen: $${prize.toFixed(2)}!`;
    messageDisplay.textContent = '';
    gameActive = false;
    chicken.style.left = '0px';
    updateBalance();
}

function animateCar(callback) { // Auto animieren
    const car = document.getElementById('car');
    car.style.top = '100%';
    setTimeout(() => {
        car.style.top = '-50px';
        callback();
    }, 1000);
}

document.getElementById('move-button').addEventListener('click', moveChicken);
document.getElementById('cashout-button').addEventListener('click', cashOut);

// Start einrichten
updateBalance();
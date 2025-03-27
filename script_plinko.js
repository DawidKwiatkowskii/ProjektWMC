let balance = getCookie('balance') !== null ? getCookie('balance') : 1000; // Startguthaben aus Cookie oder 1000
const boardWidth = 600; // Breite des Spielfelds
const boardHeight = 600; // Höhe des Spielfelds
const pegSize = 10; // Größe der Stifte
const ballSize = 20; // Größe des Balls
const slotHeight = 50; // Höhe der Slots
const rows = 8; // Anzahl Reihen
const cols = 9; // Anzahl Spalten
const slotMultipliers = [500, 50, 10, 8, 3, 2, 1, 0.5, 0.2, 0.2, 0.5, 1, 2, 3, 8, 10, 50, 500]; // Multiplikatoren
let activeBalls = 0; // Aktive Bälle

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
    const dropButton = document.getElementById('drop-button');
    const ballPrice = parseFloat(document.getElementById('ball-price').value) || 10;
    dropButton.disabled = balance < ballPrice;
}

function createBoard() { // Spielfeld erstellen
    const board = document.getElementById('plinko-board');
    const isMobile = window.innerWidth <= 600;
    const width = isMobile ? 300 : boardWidth;
    const height = isMobile ? 300 : boardHeight;
    const pegSpacingX = width / cols;
    const pegSpacingY = (height - slotHeight) / rows;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const peg = document.createElement('div');
            peg.className = 'peg';
            let x = col * pegSpacingX + pegSpacingX / 2;
            if (row % 2 === 0) x += pegSpacingX / 2;
            const y = row * pegSpacingY + pegSpacingY / 2;
            peg.style.left = `${x - pegSize / 2}px`;
            peg.style.top = `${y - pegSize / 2}px`;
            board.appendChild(peg);
        }
    }

    const slotWidth = width / slotMultipliers.length;
    slotMultipliers.forEach((multiplier, index) => {
        const slot = document.createElement('div');
        slot.className = 'slot';
        slot.style.width = `${slotWidth}px`;
        slot.style.left = `${index * slotWidth}px`;
        slot.textContent = `${multiplier}x`;
        board.appendChild(slot);
    });
}

function dropBall() { // Ball fallen lassen
    const board = document.getElementById('plinko-board');
    const ballPriceInput = document.getElementById('ball-price');
    const ballPrice = parseFloat(ballPriceInput.value) || 10;

    if (balance < ballPrice || isNaN(ballPrice) || ballPrice <= 0) {
        alert('Nicht genug Geld oder ungültiger Preis!');
        return;
    }

    balance -= ballPrice;
    activeBalls++;
    updateBalance();

    const isMobile = window.innerWidth <= 600;
    const width = isMobile ? 300 : boardWidth;
    const height = isMobile ? 300 : boardHeight;
    const ball = document.createElement('div');
    ball.className = 'ball';
    const startX = width / 2 - ballSize / 2 + (Math.random() - 0.5) * 20;
    let currentY = 0;
    ball.style.left = `${startX}px`;
    ball.style.top = `${currentY}px`;
    board.appendChild(ball);

    const pegSpacingX = width / cols;
    const pegSpacingY = (height - slotHeight) / rows;
    let velocityX = 0;
    let velocityY = 0;

    function animate() { // Ball animieren
        velocityY += 0.5;
        currentY += velocityY;
        velocityX += (Math.random() - 0.5) * 2;
        velocityX = Math.max(Math.min(velocityX, 5), -5);
        let positionX = parseFloat(ball.style.left) + velocityX;

        const row = Math.floor(currentY / pegSpacingY);
        const col = Math.floor(positionX / pegSpacingX);
        if (row < rows && col >= 0 && col < cols) {
            const pegX = col * pegSpacingX + (row % 2 === 0 ? pegSpacingX : pegSpacingX / 2);
            const pegY = row * pegSpacingY + pegSpacingY / 2;
            const dx = positionX - pegX;
            const dy = currentY - pegY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < (ballSize + pegSize) / 2) {
                velocityX = -velocityX * 0.7;
                velocityY = -Math.abs(velocityY) * 0.5;
                positionX += velocityX * 2;
                currentY += velocityY;
            }
        }

        positionX = Math.max(ballSize / 2, Math.min(positionX, width - ballSize / 2));
        ball.style.left = `${positionX}px`;
        ball.style.top = `${currentY}px`;

        if (currentY < height - slotHeight - ballSize) {
            requestAnimationFrame(animate);
        } else {
            const slotIndex = Math.min(
                Math.floor(positionX / (width / slotMultipliers.length)),
                slotMultipliers.length - 1
            );
            const multiplier = slotMultipliers[slotIndex];
            const winnings = ballPrice * multiplier;
            balance += winnings;
            activeBalls--;
            updateBalance();
            ball.remove();
        }
    }

    requestAnimationFrame(animate);
}

document.getElementById('drop-button').addEventListener('click', dropBall);

// Start einrichten
createBoard();
updateBalance();
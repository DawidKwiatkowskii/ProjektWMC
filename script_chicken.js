let balance = getCookie('balance') !== null ? getCookie('balance') : 1000;
const roadSpaces = 5; // Number of spaces to cross
let currentPosition = 0;
let prize = 0;
let betAmount = 0;
let gameActive = false;

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parseFloat(parts.pop().split(';').shift());
    return null;
}

function setCookie(name, value, days = 365) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value.toFixed(2)};${expires};path=/`;
}

function updateBalance() {
    setCookie('balance', balance);
    document.getElementById('balance').textContent = balance.toFixed(2);
    const moveButton = document.getElementById('move-button');
    const cashoutButton = document.getElementById('cashout-button');
    const betInput = document.getElementById('bet-amount');
    const currentBet = parseFloat(betInput.value) || 0;
    moveButton.disabled = (gameActive && currentPosition > 0) || balance < currentBet;
    cashoutButton.disabled = !gameActive || currentPosition === 0;
}

function moveChicken() {
    const betInput = document.getElementById('bet-amount');
    betAmount = parseFloat(betInput.value);
    const chicken = document.getElementById('chicken');
    const car = document.getElementById('car');
    const resultDisplay = document.getElementById('result');
    const messageDisplay = document.getElementById('message');
    const moveButton = document.getElementById('move-button');
    const cashoutButton = document.getElementById('cashout-button');

    if (isNaN(betAmount) || betAmount <= 0) {
        messageDisplay.textContent = 'Please enter a valid bet amount!';
        return;
    }

    if (betAmount > balance && !gameActive) {
        messageDisplay.textContent = 'Not enough balance to place this bet!';
        return;
    }

    if (!gameActive) {
        // Start new game
        balance -= betAmount;
        prize = betAmount;
        currentPosition = 0;
        gameActive = true;
        updateBalance();
        resultDisplay.textContent = 'Chicken is crossing...';
        messageDisplay.textContent = `Prize starts at $${prize.toFixed(2)}`;
    }

    moveButton.disabled = true;
    cashoutButton.disabled = true; // Disable during move

    const roadWidth = window.innerWidth <= 600 ? 300 : 600;
    const spaceWidth = roadWidth / (roadSpaces + 1); // +1 for start position

    // 50/50 chance of survival
    const survives = Math.random() >= 0.5;

    if (!survives) {
        car.style.left = chicken.style.left; // Match chicken's horizontal position
        animateCar(() => {
            resultDisplay.textContent = `Chicken got hit at space ${currentPosition + 1}! You lost!`;
            messageDisplay.textContent = `Prize reached $${prize.toFixed(2)} but no payout.`;
            gameActive = false;
            chicken.style.left = '0px';
            car.style.top = '-50px';
            updateBalance();
        });
        return;
    }

    // Move to next space and double prize
    currentPosition++;
    prize *= 2;
    chicken.style.left = `${currentPosition * spaceWidth}px`;
    messageDisplay.textContent = `Space ${currentPosition}: Prize is now $${prize.toFixed(2)}`;

    if (currentPosition >= roadSpaces) {
        // Chicken crossed successfully
        balance += prize;
        resultDisplay.textContent = `Chicken crossed! You won $${prize.toFixed(2)}!`;
        messageDisplay.textContent = '';
        gameActive = false;
        chicken.style.left = '0px';
        updateBalance();
    } else {
        moveButton.disabled = false;
        cashoutButton.disabled = false; // Re-enable after move
    }
}

function cashOut() {
    const chicken = document.getElementById('chicken');
    const resultDisplay = document.getElementById('result');
    const messageDisplay = document.getElementById('message');

    if (!gameActive || currentPosition === 0) return;

    balance += prize;
    resultDisplay.textContent = `Cashed out at space ${currentPosition}! You won $${prize.toFixed(2)}!`;
    messageDisplay.textContent = '';
    gameActive = false;
    chicken.style.left = '0px';
    updateBalance();
}

function animateCar(callback) {
    const car = document.getElementById('car');
    car.style.top = '100%'; // Move car from top to bottom
    setTimeout(() => {
        car.style.top = '-50px'; // Reset to top
        callback();
    }, 1000); // Car animation duration
}

document.getElementById('move-button').addEventListener('click', moveChicken);
document.getElementById('cashout-button').addEventListener('click', cashOut);

// Initial setup
updateBalance();
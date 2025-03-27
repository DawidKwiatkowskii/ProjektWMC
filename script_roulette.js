let balance = getCookie('balance') !== null ? getCookie('balance') : 500; // Load from cookie or default to 500
let currentBet = 0;
let selectedBet = null;

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

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function updateBalance() {
    setCookie('balance', balance); // Save to cookie on every update
    document.getElementById('money').innerText = balance.toFixed(2);
    const spinBtn = document.getElementById('spin');
    const betAmount = parseInt(document.getElementById('bet-amount').value) || 0;
    spinBtn.disabled = balance < betAmount || !selectedBet; // Disable if insufficient funds or no bet selected
}

function createWheel() {
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

function selectBet(event) {
    const btn = event.target;
    if (!btn.classList.contains('bet-btn')) return;

    document.querySelectorAll('.bet-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    selectedBet = btn.dataset.type;
    updateBalance(); // Update button state when bet is selected
}

function spinWheel() {
    const betInput = document.getElementById('bet-amount');
    currentBet = parseInt(betInput.value);

    if (isNaN(currentBet) || currentBet <= 0) {
        document.getElementById('message').innerText = 'Please enter a valid bet amount!';
        return;
    }

    if (currentBet > balance) {
        document.getElementById('message').innerText = 'Not enough chips to place this bet!';
        return;
    }

    if (!selectedBet) {
        document.getElementById('message').innerText = 'Please select a bet!';
        return;
    }

    balance -= currentBet;
    updateBalance();

    const spinBtn = document.getElementById('spin');
    spinBtn.disabled = true;
    document.getElementById('message').innerText = 'Spinning...';

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

        document.getElementById('result').innerText = `Result: ${result}`;
        checkWin(result);
        wheel.style.transition = 'none';
        wheel.style.left = '0px';
        spinBtn.disabled = balance <= 0 || !selectedBet;
        if (balance <= 0) {
            document.getElementById('message').innerText += ' Game over! You\'re out of chips.';
        }
    }, 4000);
}

function checkWin(result) {
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
        document.getElementById('message').innerText = `You won $${(winnings - currentBet).toFixed(2)}!`;
    } else {
        document.getElementById('message').innerText = 'You lost!';
    }
    updateBalance();
}

// Event listeners for bet buttons
document.querySelectorAll('.bet-btn').forEach(btn => {
    btn.addEventListener('click', selectBet);
});

// Initial setup
createWheel();
updateBalance();

// Remove inline onclick and add event listener
document.getElementById('spin').addEventListener('click', spinWheel);
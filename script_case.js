let balance = getCookie('balance') !== null ? getCookie('balance') : 1000; // Startguthaben aus Cookie oder 1000
const caseCost = 5; // Kosten für eine Kiste

const items = [
    { name: "P250 | Sand Dune", rarity: "common", image: "P250.png", price: 0.10 },
    { name: "MP7 | Urban Hazard", rarity: "uncommon", image: "MP7.png", price: 0.25 },
    { name: "Glock-18 | Candy Apple", rarity: "rare", image: "glock.png", price: 0.50 },
    { name: "USP-S | Torque", rarity: "mythical", image: "usp.png", price: 1.00 },
    { name: "M4A4 | Evil Daimyo", rarity: "legendary", image: "m4a1.png", price: 2.50 },
    { name: "AK-47 | Redline", rarity: "ancient", image: "AK 47.png", price: 10.00 },
    { name: "AWP | Dragon Lore", rarity: "exceedingly-rare", image: "AWP.png", price: 5000.00 },
    { name: "Desert Eagle | Blaze", rarity: "legendary", image: "desert eagle.png", price: 50.00 },
    { name: "P90 | Asiimov", rarity: "ancient", image: "P90.png", price: 5.00 },
    { name: "M9 Bayonet | Fade", rarity: "exceedingly-rare", image: "M9.png", price: 800.00 }
];

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
    document.getElementById('balance').textContent = balance.toFixed(2);
    const openButton = document.getElementById('open-case');
    openButton.disabled = balance < caseCost;
}

function createCaseWheel() { // Kistenrad erstellen
    const slotsContainer = document.getElementById('item-slots');
    slotsContainer.innerHTML = '';
    
    const baseItems = shuffle([...items, ...items, ...items]); // 30 Gegenstände
    const extendedItems = [...baseItems, ...baseItems, ...baseItems]; // 90 Gegenstände

    extendedItems.forEach((item, index) => {
        const slot = document.createElement('div');
        slot.classList.add('item', item.rarity);
        slot.id = `item-${index % 30}`;
        const img = document.createElement('img');
        img.src = item.image;
        img.alt = item.name;
        slot.appendChild(img);
        slotsContainer.appendChild(slot);
    });

    return baseItems;
}

function openCase() { // Kiste öffnen
    if (balance < caseCost || isNaN(balance)) {
        document.getElementById('message').innerText = 'Nicht genug Geld!';
        return;
    }

    balance -= caseCost;
    updateBalance();

    const openBtn = document.getElementById('open-case');
    openBtn.disabled = true;
    document.getElementById('message').innerText = 'Kiste wird geöffnet...';

    const shuffledItems = createCaseWheel();
    const wheel = document.getElementById('item-slots');
    const wheelWidth = window.innerWidth <= 800 ? 400 : 800;
    const actualSlotWidth = window.innerWidth <= 800 ? 80 : 100;
    const baseItemsCount = shuffledItems.length;
    const randomSlot = Math.floor(Math.random() * baseItemsCount);
    const pointerOffset = wheelWidth / 2 - actualSlotWidth / 2;
    const extraSpins = baseItemsCount * 2;
    const finalSlotIndex = extraSpins + randomSlot;
    const finalPosition = -(finalSlotIndex * actualSlotWidth - pointerOffset);

    wheel.style.transition = 'none';
    wheel.style.left = '0px';
    requestAnimationFrame(() => {
        wheel.style.transition = 'left 5s ease-out';
        wheel.style.left = `${finalPosition}px`;
    });

    setTimeout(() => {
        const result = shuffledItems[randomSlot];
        balance += result.price;
        updateBalance();

        document.getElementById('result').innerText = `Gewonnen: ${result.name} ($${result.price.toFixed(2)}) - ${result.rarity}`;
        document.getElementById('message').innerText = `Kiste geöffnet! Gewinn: $${result.price.toFixed(2)}`;
        wheel.style.transition = 'none';
        wheel.style.left = '0px';
        openBtn.disabled = balance < caseCost;
    }, 5000);
}

// Start einrichten
createCaseWheel();
updateBalance();
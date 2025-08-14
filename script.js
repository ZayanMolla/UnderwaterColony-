// ====================== GAME STATE ======================
let resources = {
    metal: 25,
    energy: 15,
    food: 25,
    oxygen: 25,
    storageUsed: 90,
    storageCap: 90
};

let modules = [];
let selectedModule = null;
let gridSize = 10;
let droneCooldown = 1000;
let lastDroneTime = 0;

// ====================== MODULE DATA ======================
const modulesData = {
    "Living Space": { metal: 10, energy: 5, food: 0 },
    "Farm": { metal: 15, energy: 5, food: 0 },
    "Oxygen Generator": { metal: 25, energy: 15, food: 0 },
    "Power Plant": { metal: 20, energy: 0, food: 0 }
};

// ====================== INIT ======================
function initGame() {
    const grid = document.getElementById("grid");
    grid.innerHTML = "";
    modules = [];

    for (let i = 0; i < gridSize * gridSize; i++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.addEventListener("click", () => buildModule(i));
        grid.appendChild(cell);
        modules.push(null);
    }

    updateResourcesDisplay();
}
window.onload = initGame;

// ====================== BUILDING ======================
function selectModule(module) {
    selectedModule = module;
}

function buildModule(index) {
    if (!selectedModule) return;
    if (modules[index]) return; // already built

    let cost = modulesData[selectedModule];
    if (
        resources.metal >= cost.metal &&
        resources.energy >= cost.energy &&
        resources.food >= cost.food
    ) {
        resources.metal -= cost.metal;
        resources.energy -= cost.energy;
        resources.food -= cost.food;

        modules[index] = selectedModule;
        document.getElementsByClassName("cell")[index].classList.add("built");
        document.getElementsByClassName("cell")[index].textContent =
            selectedModule[0];

        if (selectedModule === "Living Space") {
            resources.storageCap += 10;
        }

        logEvent(`${selectedModule} built!`);
        updateStorageUsed();
        updateResourcesDisplay();
    } else {
        logEvent(`Not enough resources for ${selectedModule}!`);
    }
}

// ====================== DRONE EXPLORATION ======================
function explore() {
    let now = Date.now();
    if (now - lastDroneTime < droneCooldown) {
        logEvent("Drone cooling down...");
        return;
    }
    lastDroneTime = now;

    // Drone always finds metal
    let metalFound = Math.floor(Math.random() * 10) + 5;
    addResource("metal", metalFound);
}

// ====================== RESOURCE ADDING WITH STORAGE CHECK ======================
function addResource(type, amount) {
    if (resources.storageUsed >= resources.storageCap) {
        logEvent(`No storage space! ${amount} ${type} wasted.`);
        return;
    }

    let availableSpace = resources.storageCap - resources.storageUsed;
    let amountToAdd = Math.min(amount, availableSpace);

    resources[type] += amountToAdd;
    resources.storageUsed += amountToAdd;

    if (amountToAdd < amount) {
        logEvent(
            `Storage full! ${amount - amountToAdd} ${type} wasted.`
        );
    } else {
        logEvent(`Gained ${amountToAdd} ${type}.`);
    }

    updateResourcesDisplay();
}

// ====================== RESOURCE TICKS ======================
setInterval(() => {
    // Farms give food
    let farms = modules.filter(m => m === "Farm").length;
    if (farms > 0) addResource("food", farms * 5);

    // Oxygen generators give oxygen
    let oxy = modules.filter(m => m === "Oxygen Generator").length;
    if (oxy > 0) addResource("oxygen", oxy * 5);

    // Power plants give energy faster
    let plants = modules.filter(m => m === "Power Plant").length;
    if (plants > 0) addResource("energy", plants * 15);
}, 5000);

// Consume resources every 10 seconds
setInterval(() => {
    let moduleCount = modules.filter(m => m !== null).length;
    let consumption = moduleCount * 1; // 1 food & oxygen per building

    resources.food -= consumption;
    resources.oxygen -= consumption;

    let gameOverReason = [];
    if (resources.food < 0) gameOverReason.push("food");
    if (resources.oxygen < 0) gameOverReason.push("oxygen");

    if (gameOverReason.length > 0) {
        const reasonText = gameOverReason.join(" and ");
        logEvent(`Your colony ran out of ${reasonText}! Game Over.`);
        alert(`Game Over! You ran out of ${reasonText}.`);
        location.reload();
    }

    updateStorageUsed();
    updateResourcesDisplay();
}, 10000);

// ====================== STORAGE ======================
function updateStorageUsed() {
    resources.storageUsed =
        resources.metal +
        resources.energy +
        resources.food +
        resources.oxygen;
}

// ====================== UI ======================
function updateResourcesDisplay() {
    document.getElementById("metal").textContent = resources.metal;
    document.getElementById("energy").textContent = resources.energy;
    document.getElementById("food").textContent = resources.food;
    document.getElementById("oxygen").textContent = resources.oxygen;
    document.getElementById(
        "storage"
    ).textContent = `${resources.storageUsed}/${resources.storageCap}`;
}

function logEvent(msg) {
    const log = document.getElementById("log");
    const entry = document.createElement("div");
    entry.textContent = msg;
    log.prepend(entry);
}

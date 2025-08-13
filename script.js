// Resources (hard mode)
let resources = { metal: 30, energy: 20, food: 10 };

// Max storage
let maxStorage = { metal: 50, energy: 50, food: 50 };

// Grid setup
const gridSize = 5;
let grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null));
const gridElement = document.getElementById('grid');

// Modules data
const modulesData = {
    'Living Quarters': { metal: 30, energy: 0, food: 5 },
    'Oxygen Generator': { metal: 25, energy: 15, food: 0 },
    'Farm': { metal: 15, energy: 10, food: 10 }
};

// Drone cooldown
let droneReady = true;
const droneCooldown = 1000; // 1 second cooldown
let cooldownTimer;

// Populate grid
for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.x = x;
        cell.dataset.y = y;
        cell.title = 'Click to build a module';
        cell.addEventListener('click', () => buildModuleAt(x, y));
        gridElement.appendChild(cell);
    }
}

function updateResources() {
    // Cap resources at max
    resources.metal = Math.min(resources.metal, maxStorage.metal);
    resources.energy = Math.min(resources.energy, maxStorage.energy);
    resources.food = Math.min(resources.food, maxStorage.food);

    document.getElementById('metal').textContent = resources.metal;
    document.getElementById('metalMax').textContent = maxStorage.metal;
    document.getElementById('energy').textContent = resources.energy;
    document.getElementById('energyMax').textContent = maxStorage.energy;
    document.getElementById('food').textContent = resources.food;
    document.getElementById('foodMax').textContent = maxStorage.food;
}

function logEvent(msg) {
    const eventLog = document.getElementById('eventLog');
    eventLog.textContent = msg;
}

// Food decay over time
setInterval(() => {
    if (resources.food > 0) {
        resources.food -= 1;
        updateResources();
        logEvent("Food decreased due to colony consumption!");
    } else {
        logEvent("Warning: Food depleted!");
    }
}, 10000); // every 10 seconds

// Build module at grid cell
function buildModuleAt(x, y) {
    if (grid[y][x]) {
        logEvent('Cell already occupied.');
        return;
    }

    const select = document.getElementById('moduleSelect');
    const name = select.value;
    const mod = modulesData[name];

    if (resources.metal >= mod.metal && resources.energy >= mod.energy) {
        resources.metal -= mod.metal;
        resources.energy -= mod.energy;
        resources.food += mod.food;
        grid[y][x] = name;

        // Increase max storage if Living Quarters
        if(name === 'Living Quarters') {
            maxStorage.metal += 20;
            maxStorage.energy += 20;
            maxStorage.food += 20;
        }

        updateResources();
        renderGrid();
        logEvent(`Built ${name} at (${x},${y})`);
    } else {
        logEvent(`Not enough resources for ${name}`);
    }
}

// Render grid
function renderGrid() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        const x = cell.dataset.x;
        const y = cell.dataset.y;
        if (grid[y][x]) {
            cell.classList.add('module');
            cell.textContent = grid[y][x];
        } else {
            cell.classList.remove('module');
            cell.textContent = '';
        }
    });
}

// Start cooldown display
function startCooldownDisplay(duration) {
    let remaining = duration / 1000;
    document.getElementById('cooldownDisplay').textContent = ` (${remaining}s)`;
    clearInterval(cooldownTimer);
    cooldownTimer = setInterval(() => {
        remaining--;
        if (remaining <= 0) {
            clearInterval(cooldownTimer);
            document.getElementById('cooldownDisplay').textContent = '';
        } else {
            document.getElementById('cooldownDisplay').textContent = ` (${remaining}s)`;
        }
    }, 1000);
}

// Exploration
const drone = document.getElementById('drone');
function explore() {
    if (!droneReady) {
        logEvent("Drone is recharging! Wait a few seconds.");
        return;
    }

    droneReady = false;
    document.querySelector('.explore button').disabled = true;
    startCooldownDisplay(droneCooldown);

    const biome = document.getElementById('biome').value;
    let metalFound = 0, energyFound = 0, foodFound = 0, hazardChance = 0;

    switch(biome) {
        case 'shallow':
            metalFound = Math.floor(Math.random()*8);
            energyFound = Math.floor(Math.random()*4);
            foodFound = Math.floor(Math.random()*6);
            hazardChance = 0.2;
            break;
        case 'deep':
            metalFound = Math.floor(Math.random()*15);
            energyFound = Math.floor(Math.random()*8);
            foodFound = Math.floor(Math.random()*4);
            hazardChance = 0.4;
            break;
        case 'abyss':
            metalFound = Math.floor(Math.random()*25);
            energyFound = Math.floor(Math.random()*12);
            foodFound = Math.floor(Math.random()*2);
            hazardChance = 0.6;
            break;
    }

    // Animate drone
    drone.style.left = '0px';
    let pos = 0;
    const interval = setInterval(() => {
        pos += 5;
        drone.style.left = pos + 'px';
        if (pos >= 300) clearInterval(interval);
    }, 20);

    resources.metal += metalFound;
    resources.energy += energyFound;
    resources.food += foodFound;

    // Hazard
    if (Math.random() < hazardChance) {
        const builtModules = [];
        for (let y=0; y<gridSize; y++){
            for (let x=0; x<gridSize; x++){
                if (grid[y][x]) builtModules.push({x, y});
            }
        }
        if (builtModules.length > 0) {
            const destroyed = builtModules[Math.floor(Math.random()*builtModules.length)];
            logEvent(`Hazard during ${biome} exploration! Module ${grid[destroyed.y][destroyed.x]} destroyed!`);
            grid[destroyed.y][destroyed.x] = null;
            renderGrid();
        } else {
            logEvent(`Hazard during ${biome} exploration! But no modules to destroy.`);
        }
        const lostMetal = Math.floor(Math.random()*10);
        const lostFood = Math.floor(Math.random()*5);
        resources.metal = Math.max(0, resources.metal - lostMetal);
        resources.food = Math.max(0, resources.food - lostFood);
    } else {
        logEvent(`Exploration successful in ${biome}! +${metalFound} metal, +${energyFound} energy, +${foodFound} food.`);
    }

    updateResources();

    // End cooldown
    setTimeout(() => {
        droneReady = true;
        document.querySelector('.explore button').disabled = false;
        logEvent("Drone is ready to explore again!");
    }, droneCooldown);
}

updateResources();
renderGrid();

// Resources
let resources = { metal: 50, energy: 30, food: 20 };

// Grid setup
const gridSize = 5;
let grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null));
const gridElement = document.getElementById('grid');

// Populate grid
for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.x = x;
        cell.dataset.y = y;
        cell.addEventListener('click', () => buildModuleAt(x, y));
        gridElement.appendChild(cell);
    }
}

function updateResources() {
    document.getElementById('metal').textContent = resources.metal;
    document.getElementById('energy').textContent = resources.energy;
    document.getElementById('food').textContent = resources.food;
}

function logEvent(msg) {
    document.getElementById('eventLog').textContent = msg;
}

// Module building
const modulesData = {
    'Living Quarters': { metal: 20, energy: 0, food: 5 },
    'Oxygen Generator': { metal: 15, energy: 10, food: 0 },
    'Farm': { metal: 10, energy: 5, food: 10 }
};

function buildModuleAt(x, y) {
    if (grid[y][x]) {
        logEvent('Cell already occupied.');
        return;
    }
    // Choose module to build (for simplicity, random module)
    const moduleNames = Object.keys(modulesData);
    const name = moduleNames[Math.floor(Math.random() * moduleNames.length)];
    const mod = modulesData[name];

    if (resources.metal >= mod.metal && resources.energy >= mod.energy) {
        resources.metal -= mod.metal;
        resources.energy -= mod.energy;
        resources.food += mod.food;
        grid[y][x] = name;
        updateResources();
        renderGrid();
        logEvent(`Built ${name} at (${x},${y})`);
    } else {
        logEvent(`Not enough resources for ${name}`);
    }
}

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

// Exploration
const drone = document.getElementById('drone');
function explore() {
    const biome = document.getElementById('biome').value;
    let metalFound = 0, energyFound = 0, foodFound = 0, hazardChance = 0;

    switch(biome) {
        case 'shallow':
            metalFound = Math.floor(Math.random()*10);
            energyFound = Math.floor(Math.random()*5);
            foodFound = Math.floor(Math.random()*8);
            hazardChance = 0.1;
            break;
        case 'deep':
            metalFound = Math.floor(Math.random()*20);
            energyFound = Math.floor(Math.random()*10);
            foodFound = Math.floor(Math.random()*5);
            hazardChance = 0.3;
            break;
        case 'abyss':
            metalFound = Math.floor(Math.random()*30);
            energyFound = Math.floor(Math.random()*15);
            foodFound = Math.floor(Math.random()*3);
            hazardChance = 0.5;
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

    if (Math.random() < hazardChance) {
        const lostMetal = Math.floor(Math.random()*10);
        const lostFood = Math.floor(Math.random()*5);
        resources.metal = Math.max(0, resources.metal - lostMetal);
        resources.food = Math.max(0, resources.food - lostFood);
        logEvent(`Hazard during ${biome} exploration! Lost ${lostMetal} metal and ${lostFood} food.`);
    } else {
        logEvent(`Exploration successful in ${biome}! +${metalFound} metal, +${energyFound} energy, +${foodFound} food.`);
    }

    updateResources();
}

updateResources();
renderGrid();

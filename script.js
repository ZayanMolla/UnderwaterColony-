// Resources
let resources = {
    metal: 50,
    energy: 30,
    food: 20
};

// Modules
let modules = [];

function updateResources() {
    document.getElementById('metal').textContent = resources.metal;
    document.getElementById('energy').textContent = resources.energy;
    document.getElementById('food').textContent = resources.food;
}

function updateModules() {
    const list = document.getElementById('modulesList');
    list.innerHTML = '';
    modules.forEach(mod => {
        const li = document.createElement('li');
        li.textContent = `${mod.name}`;
        list.appendChild(li);
    });
}

function buildModule(name, metalCost, energyCost, foodGain) {
    if (resources.metal >= metalCost && resources.energy >= energyCost) {
        resources.metal -= metalCost;
        resources.energy -= energyCost;
        resources.food += foodGain;
        modules.push({name});
        updateResources();
        updateModules();
        logEvent(`Built ${name}!`);
    } else {
        logEvent(`Not enough resources to build ${name}.`);
    }
}

// Exploration
function explore() {
    const metalFound = Math.floor(Math.random() * 20);
    const energyFound = Math.floor(Math.random() * 10);
    const foodFound = Math.floor(Math.random() * 15);

    resources.metal += metalFound;
    resources.energy += energyFound;
    resources.food += foodFound;

    updateResources();

    // Random hazard
    if (Math.random() < 0.3) {
        const lostMetal = Math.floor(Math.random() * 10);
        const lostFood = Math.floor(Math.random() * 5);
        resources.metal = Math.max(0, resources.metal - lostMetal);
        resources.food = Math.max(0, resources.food - lostFood);
        updateResources();
        logEvent(`Hazard! Lost ${lostMetal} metal and ${lostFood} food.`);
    } else {
        logEvent(`Exploration successful! Gained ${metalFound} metal, ${energyFound} energy, ${foodFound} food.`);
    }
}

function logEvent(msg) {
    const eventLog = document.getElementById('eventLog');
    eventLog.textContent = msg;
}

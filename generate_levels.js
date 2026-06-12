import fs from 'fs';

function generateMaze(size, theme) {
    // Generate a simple random maze with a guaranteed path
    let grid = Array(size).fill(0).map(() => Array(size).fill(0));
    
    // Choose start and end
    let start = { r: Math.floor(Math.random() * size), c: 0 };
    let target = { r: Math.floor(Math.random() * size), c: size - 1 };
    
    // Create a guaranteed path using random walk
    let curr = { ...start };
    let path = new Set();
    path.add(`${curr.r},${curr.c}`);
    
    while (curr.c < target.c || curr.r !== target.r) {
        let options = [];
        if (curr.c < target.c) options.push({ r: curr.r, c: curr.c + 1 });
        if (curr.r < target.r) options.push({ r: curr.r + 1, c: curr.c });
        if (curr.r > target.r) options.push({ r: curr.r - 1, c: curr.c });
        
        let next = options[Math.floor(Math.random() * options.length)];
        path.add(`${next.r},${next.c}`);
        curr = next;
    }
    path.add(`${target.r},${target.c}`);
    
    // Add random obstacles
    let obstacles = [];
    let numObstacles = Math.floor(size * size * 0.35); // 35% density
    
    for (let i = 0; i < numObstacles; i++) {
        let r = Math.floor(Math.random() * size);
        let c = Math.floor(Math.random() * size);
        let key = `${r},${c}`;
        if (!path.has(key) && !(r === start.r && c === start.c) && !(r === target.r && c === target.c)) {
            obstacles.push({ r, c });
        }
    }

    return {
        theme, size, start, target, obstacles
    };
}

let newLevels = [];
const themes = ['fox', 'rabbit', 'dog', 'cat', 'monkey', 'bear', 'mouse', 'penguin', 'frog', 'alien'];

for(let i = 0; i < 5; i++) {
    newLevels.push(generateMaze(8, themes[i % themes.length]));
}
for(let i = 0; i < 5; i++) {
    newLevels.push(generateMaze(9, themes[(i + 5) % themes.length]));
}

fs.writeFileSync('new_levels.json', JSON.stringify(newLevels, null, 2));
console.log("Created new_levels.json");

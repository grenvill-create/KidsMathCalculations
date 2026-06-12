const LEVELS = [
  // 1
  { theme: 'fox', size: 4, start: { r: 3, c: 0 }, target: { r: 0, c: 3 }, obstacles: [{ r: 1, c: 1 }, { r: 2, c: 1 }, { r: 1, c: 2 }] },
  // 2
  { theme: 'rabbit', size: 5, start: { r: 4, c: 0 }, target: { r: 0, c: 4 }, obstacles: [{ r: 3, c: 1 }, { r: 2, c: 1 }, { r: 2, c: 2 }, { r: 2, c: 3 }, { r: 1, c: 3 }] },
  // 3
  { theme: 'dog', size: 5, start: { r: 4, c: 2 }, target: { r: 0, c: 2 }, obstacles: [{ r: 3, c: 0 }, { r: 3, c: 1 }, { r: 3, c: 3 }, { r: 3, c: 4 }, { r: 1, c: 2 }] },
  // 4
  { theme: 'cat', size: 6, start: { r: 5, c: 0 }, target: { r: 0, c: 5 }, obstacles: [{ r: 4, c: 2 }, { r: 3, c: 2 }, { r: 2, c: 2 }, { r: 2, c: 3 }, { r: 2, c: 4 }, { r: 4, c: 4 }] },
  // 5
  { theme: 'monkey', size: 6, start: { r: 0, c: 0 }, target: { r: 5, c: 5 }, obstacles: [{ r: 0, c: 1 }, { r: 1, c: 1 }, { r: 2, c: 1 }, { r: 2, c: 3 }, { r: 3, c: 3 }, { r: 4, c: 3 }, { r: 4, c: 5 }] },
  // 6
  { theme: 'bear', size: 6, start: { r: 5, c: 3 }, target: { r: 0, c: 2 }, obstacles: [{ r: 4, c: 2 }, { r: 4, c: 3 }, { r: 4, c: 4 }, { r: 2, c: 1 }, { r: 2, c: 2 }, { r: 2, c: 3 }] },
  // 7
  { theme: 'mouse', size: 7, start: { r: 6, c: 0 }, target: { r: 0, c: 6 }, obstacles: [{ r: 5, c: 1 }, { r: 4, c: 1 }, { r: 3, c: 1 }, { r: 2, c: 1 }, { r: 2, c: 2 }, { r: 2, c: 3 }, { r: 2, c: 4 }, { r: 2, c: 5 }] },
  // 8 (Fixed: Removed {r:3, c:4})
  { theme: 'penguin', size: 7, start: { r: 3, c: 3 }, target: { r: 0, c: 0 }, obstacles: [{ r: 2, c: 3 }, { r: 4, c: 3 }, { r: 3, c: 2 }, { r: 1, c: 1 }] },
  // 9
  { theme: 'frog', size: 7, start: { r: 6, c: 6 }, target: { r: 0, c: 0 }, obstacles: [{ r: 5, c: 5 }, { r: 4, c: 4 }, { r: 3, c: 3 }, { r: 2, c: 2 }, { r: 1, c: 1 }] },
  // 10
  { theme: 'alien', size: 7, start: { r: 6, c: 3 }, target: { r: 0, c: 3 }, obstacles: [{ r: 5, c: 2 }, { r: 5, c: 3 }, { r: 5, c: 4 }, { r: 3, c: 1 }, { r: 3, c: 2 }, { r: 3, c: 4 }, { r: 3, c: 5 }, { r: 1, c: 2 }, { r: 1, c: 3 }, { r: 1, c: 4 }] },
  // 11
  { theme: 'penguin', size: 6, start: { r: 5, c: 0 }, target: { r: 0, c: 5 }, obstacles: [{ r: 4, c: 0 }, { r: 4, c: 1 }, { r: 4, c: 2 }, { r: 4, c: 3 }, { r: 2, c: 2 }, { r: 2, c: 3 }, { r: 2, c: 4 }, { r: 2, c: 5 }] },
  // 12
  { theme: 'frog', size: 6, start: { r: 5, c: 5 }, target: { r: 0, c: 0 }, obstacles: [{ r: 1, c: 0 }, { r: 1, c: 1 }, { r: 1, c: 2 }, { r: 3, c: 3 }, { r: 3, c: 4 }, { r: 3, c: 5 }] },
  // 13
  { theme: 'monkey', size: 7, start: { r: 6, c: 0 }, target: { r: 0, c: 6 }, obstacles: [{ r: 5, c: 2 }, { r: 4, c: 2 }, { r: 3, c: 2 }, { r: 2, c: 2 }, { r: 2, c: 3 }, { r: 2, c: 4 }, { r: 2, c: 5 }, { r: 4, c: 4 }, { r: 5, c: 4 }, { r: 6, c: 4 }] },
  // 14
  { theme: 'bear', size: 7, start: { r: 6, c: 3 }, target: { r: 0, c: 3 }, obstacles: [{ r: 5, c: 3 }, { r: 3, c: 3 }, { r: 1, c: 3 }, { r: 4, c: 1 }, { r: 4, c: 5 }, { r: 2, c: 1 }, { r: 2, c: 5 }] },
  // 15
  { theme: 'alien', size: 7, start: { r: 3, c: 0 }, target: { r: 3, c: 6 }, obstacles: [{ r: 3, c: 3 }, { r: 2, c: 3 }, { r: 4, c: 3 }, { r: 1, c: 2 }, { r: 5, c: 2 }, { r: 1, c: 4 }, { r: 5, c: 4 }] },
  // 16 (Fixed: Removed {r:3, c:3})
  { theme: 'rabbit', size: 6, start: { r: 0, c: 3 }, target: { r: 5, c: 3 }, obstacles: [{ r: 2, c: 0 }, { r: 2, c: 1 }, { r: 2, c: 2 }, { r: 2, c: 3 }, { r: 3, c: 4 }, { r: 3, c: 5 }] },
  // 17
  { theme: 'cat', size: 7, start: { r: 6, c: 6 }, target: { r: 0, c: 0 }, obstacles: [{ r: 5, c: 6 }, { r: 4, c: 5 }, { r: 3, c: 4 }, { r: 2, c: 3 }, { r: 1, c: 2 }, { r: 0, c: 1 }, { r: 5, c: 1 }, { r: 1, c: 5 }] },
  // 18 (Fixed: Removed {r:1, c:1})
  { theme: 'dog', size: 7, start: { r: 0, c: 0 }, target: { r: 6, c: 6 }, obstacles: [{ r: 2, c: 2 }, { r: 3, c: 3 }, { r: 4, c: 4 }, { r: 5, c: 5 }, { r: 0, c: 2 }, { r: 2, c: 0 }, { r: 4, c: 6 }, { r: 6, c: 4 }] },
  // 19
  { theme: 'fox', size: 7, start: { r: 6, c: 3 }, target: { r: 0, c: 3 }, obstacles: [{ r: 5, c: 2 }, { r: 5, c: 3 }, { r: 5, c: 4 }, { r: 3, c: 0 }, { r: 3, c: 1 }, { r: 3, c: 2 }, { r: 3, c: 4 }, { r: 3, c: 5 }, { r: 3, c: 6 }, { r: 1, c: 2 }, { r: 1, c: 3 }, { r: 1, c: 4 }] },
  // 20 (Fixed: Removed {r:3, c:4})
  { theme: 'mouse', size: 7, start: { r: 3, c: 3 }, target: { r: 0, c: 6 }, obstacles: [{ r: 2, c: 2 }, { r: 2, c: 3 }, { r: 2, c: 4 }, { r: 3, c: 2 }, { r: 4, c: 2 }, { r: 4, c: 3 }, { r: 4, c: 4 }, { r: 0, c: 0 }, { r: 6, c: 6 }] }
];

function checkLevel(level, index) {
  const { size, start, target, obstacles } = level;
  const queue = [start];
  const visited = new Set();
  visited.add(`${start.r},${start.c}`);
  
  const isObstacle = (r, c) => obstacles.some(o => o.r === r && o.c === c);
  const isValid = (r, c) => r >= 0 && r < size && c >= 0 && c < size;
  
  while (queue.length > 0) {
    const { r, c } = queue.shift();
    if (r === target.r && c === target.c) {
      return true;
    }
    
    const neighbors = [
      { r: r - 1, c }, { r: r + 1, c }, { r, c: c - 1 }, { r, c: c + 1 }
    ];
    
    for (const n of neighbors) {
      if (isValid(n.r, n.c) && !isObstacle(n.r, n.c)) {
        const key = `${n.r},${n.c}`;
        if (!visited.has(key)) {
          visited.add(key);
          queue.push(n);
        }
      }
    }
  }
  return false;
}

for (let i = 0; i < LEVELS.length; i++) {
  if (!checkLevel(LEVELS[i], i)) {
    console.log(`Level ${i + 1} is unsolvable!`);
  }
}

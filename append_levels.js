import fs from 'fs';

let jsx = fs.readFileSync('src/components/CodingMazeGame.jsx', 'utf8');
let newLevels = JSON.parse(fs.readFileSync('new_levels.json', 'utf8'));

// Format new levels
let appendStr = '';
newLevels.forEach((l, idx) => {
    appendStr += `  // ${21 + idx}\n  ${JSON.stringify(l).replace(/"([^"]+)":/g, '$1:')},\n`;
});

// Remove trailing comma from last item
appendStr = appendStr.trim().replace(/,\n$/, '\n');

// Find the end of LEVELS array
let newJsx = jsx.replace(/\n];\n\nexport default function CodingMazeGame/, `,\n  ${appendStr}\n];\n\nexport default function CodingMazeGame`);

fs.writeFileSync('src/components/CodingMazeGame.jsx', newJsx);
console.log('Appended to CodingMazeGame.jsx');

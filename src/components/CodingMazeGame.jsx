import React, { useState, useEffect, useRef } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, X, ZoomIn, ZoomOut, RefreshCw, Play, RotateCcw, Settings } from 'lucide-react';
import confetti from 'canvas-confetti';
import { mathGenerator } from '../utils/mathGenerator';
import bg1 from '../assets/bg_random_1.jpg';
import bg2 from '../assets/bg_random_2.jpg';
import bg3 from '../assets/bg_random_3.jpg';
import bg4 from '../assets/bg_random_4.jpg';
import bg5 from '../assets/bg_random_5.jpg';
import { audioSynth } from '../utils/audioSynth';

const BACKGROUNDS = [bg1, bg2, bg3, bg4, bg5];

const THEMES = {
  fox: { hero: '🦊', target: '⭐', obstacle: '🌲', bgFloor: '#f8fafc', bgAlt: '#e2e8f0', bgObstacle: '#fecdd3' },
  rabbit: { hero: '🐰', target: '🥕', obstacle: '🪨', bgFloor: '#fffbeb', bgAlt: '#fef3c7', bgObstacle: '#d6d3d1' },
  dog: { hero: '🐶', target: '🦴', obstacle: '🌵', bgFloor: '#f0fdf4', bgAlt: '#dcfce7', bgObstacle: '#fef08a' },
  cat: { hero: '🐱', target: '🐟', obstacle: '📦', bgFloor: '#e0e7ff', bgAlt: '#c7d2fe', bgObstacle: '#fed7aa' },
  monkey: { hero: '🐵', target: '🍌', obstacle: '🌴', bgFloor: '#fdf4ff', bgAlt: '#fae8ff', bgObstacle: '#bbf7d0' },
  bear: { hero: '🐻', target: '🍯', obstacle: '🐝', bgFloor: '#ffedd5', bgAlt: '#ffedd5', bgObstacle: '#fde047' },
  mouse: { hero: '🐭', target: '🧀', obstacle: '🪤', bgFloor: '#f1f5f9', bgAlt: '#e2e8f0', bgObstacle: '#cbd5e1' },
  penguin: { hero: '🐧', target: '🐟', obstacle: '🧊', bgFloor: '#f0f9ff', bgAlt: '#e0f2fe', bgObstacle: '#bae6fd' },
  frog: { hero: '🐸', target: '🪰', obstacle: '🍄', bgFloor: '#ecfdf5', bgAlt: '#d1fae5', bgObstacle: '#fbcfe8' },
  alien: { hero: '👽', target: '🛸', obstacle: '☄️', bgFloor: '#1e293b', bgAlt: '#334155', bgObstacle: '#ef4444' }
};

const RAW_LEVELS = [
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
  { theme: 'alien', size: 7, start: { r: 3, c: 0 }, target: { r: 3, c: 6 }, obstacles: [{ r: 3, c: 3 }, { r: 2, c: 3 }, { r: 4, c: 3 }, { r: 1, c: 2 }, { r: 5, c: 2 }, { r: 1, c: 4 }, { r: 5, c: 4 }], enemies: [{ start: {r: 1, c: 3}, commands: ['DOWN', 'UP'] }, { start: {r: 5, c: 3}, commands: ['UP', 'DOWN'] }] },
  // 16 (Fixed: Removed {r:2, c:3})
  { theme: 'rabbit', size: 6, start: { r: 0, c: 3 }, target: { r: 5, c: 3 }, obstacles: [{ r: 2, c: 0 }, { r: 2, c: 1 }, { r: 2, c: 2 }, { r: 3, c: 4 }, { r: 3, c: 5 }] },
  // 17
  { theme: 'cat', size: 7, start: { r: 6, c: 6 }, target: { r: 0, c: 0 }, obstacles: [{ r: 5, c: 6 }, { r: 4, c: 5 }, { r: 3, c: 4 }, { r: 2, c: 3 }, { r: 1, c: 2 }, { r: 0, c: 1 }, { r: 5, c: 1 }, { r: 1, c: 5 }] },
  // 18 (Fixed: Removed {r:3, c:3})
  { theme: 'dog', size: 7, start: { r: 0, c: 0 }, target: { r: 6, c: 6 }, obstacles: [{ r: 1, c: 1 }, { r: 2, c: 2 }, { r: 4, c: 4 }, { r: 5, c: 5 }, { r: 0, c: 2 }, { r: 2, c: 0 }, { r: 4, c: 6 }, { r: 6, c: 4 }] },
  // 19
  { theme: 'fox', size: 7, start: { r: 6, c: 3 }, target: { r: 0, c: 3 }, obstacles: [{ r: 5, c: 2 }, { r: 5, c: 3 }, { r: 5, c: 4 }, { r: 3, c: 0 }, { r: 3, c: 1 }, { r: 3, c: 2 }, { r: 3, c: 4 }, { r: 3, c: 5 }, { r: 3, c: 6 }, { r: 1, c: 2 }, { r: 1, c: 3 }, { r: 1, c: 4 }] },
  // 20 (Fixed: Removed {r:3, c:4})
  { theme: 'mouse', size: 7, start: { r: 3, c: 3 }, target: { r: 0, c: 6 }, obstacles: [{ r: 2, c: 2 }, { r: 2, c: 3 }, { r: 2, c: 4 }, { r: 3, c: 2 }, { r: 4, c: 2 }, { r: 4, c: 3 }, { r: 4, c: 4 }, { r: 0, c: 0 }, { r: 6, c: 6 }], enemies: [{ start: {r: 1, c: 1}, commands: ['RIGHT', 'RIGHT', 'LEFT', 'LEFT'] }] },
  // 21
  {theme:"fox",size:8,start:{r:5,c:0},target:{r:3,c:7},obstacles:[{r:7,c:4},{r:5,c:4},{r:6,c:5},{r:7,c:1},{r:7,c:6},{r:0,c:3},{r:6,c:7},{r:0,c:0},{r:2,c:0},{r:7,c:7},{r:4,c:6},{r:0,c:4},{r:4,c:6},{r:7,c:6},{r:1,c:1},{r:0,c:4},{r:2,c:1},{r:4,c:6},{r:2,c:6},{r:1,c:6},{r:5,c:3}]},
  // 22
  {theme:"rabbit",size:8,start:{r:2,c:0},target:{r:7,c:7},obstacles:[{r:3,c:7},{r:7,c:0},{r:0,c:4},{r:4,c:0},{r:1,c:0},{r:3,c:0},{r:5,c:0},{r:2,c:6},{r:1,c:3},{r:1,c:6},{r:1,c:1},{r:7,c:4},{r:0,c:5},{r:1,c:7},{r:1,c:6},{r:3,c:7},{r:3,c:1},{r:5,c:0}]},
  // 23
  {theme:"dog",size:8,start:{r:3,c:0},target:{r:6,c:7},obstacles:[{r:0,c:7},{r:4,c:7},{r:4,c:6},{r:3,c:5},{r:2,c:4},{r:5,c:2},{r:2,c:6},{r:6,c:0},{r:1,c:7},{r:0,c:4},{r:2,c:3},{r:2,c:5},{r:4,c:7},{r:2,c:0},{r:5,c:3},{r:5,c:3},{r:7,c:4},{r:2,c:2},{r:5,c:5}]},
  // 24
  {theme:"cat",size:8,start:{r:2,c:0},target:{r:5,c:7},obstacles:[{r:7,c:6},{r:5,c:1},{r:3,c:4},{r:7,c:1},{r:1,c:0},{r:0,c:6},{r:2,c:6},{r:2,c:2},{r:1,c:0},{r:1,c:3},{r:1,c:7},{r:5,c:1},{r:5,c:0},{r:2,c:6},{r:6,c:2},{r:1,c:4},{r:1,c:3}]},
  // 25
  {theme:"monkey",size:8,start:{r:7,c:0},target:{r:4,c:7},obstacles:[{r:6,c:1},{r:2,c:5},{r:0,c:2},{r:3,c:0},{r:2,c:1},{r:1,c:5},{r:0,c:1},{r:6,c:2},{r:6,c:5},{r:1,c:7},{r:5,c:4},{r:3,c:0},{r:1,c:0},{r:1,c:0},{r:2,c:7},{r:7,c:5},{r:6,c:1},{r:2,c:5}], enemies: [{ start: {r: 3, c: 4}, commands: ['UP', 'UP', 'DOWN', 'DOWN'] }]},
  // 26
  {theme:"bear",size:9,start:{r:4,c:0},target:{r:5,c:8},obstacles:[{r:6,c:0},{r:2,c:1},{r:3,c:1},{r:4,c:6},{r:2,c:1},{r:4,c:8},{r:6,c:6},{r:6,c:1},{r:4,c:5},{r:1,c:8},{r:8,c:7},{r:4,c:5},{r:4,c:7},{r:0,c:7},{r:7,c:4},{r:2,c:8},{r:2,c:0},{r:3,c:2},{r:1,c:2},{r:2,c:8},{r:0,c:6},{r:7,c:7}]},
  // 27
  {theme:"mouse",size:9,start:{r:4,c:0},target:{r:3,c:8},obstacles:[{r:0,c:6},{r:4,c:8},{r:8,c:0},{r:0,c:4},{r:5,c:2},{r:8,c:7},{r:2,c:2},{r:4,c:7},{r:6,c:1},{r:5,c:0},{r:6,c:6},{r:5,c:6},{r:7,c:2},{r:5,c:8},{r:6,c:4},{r:6,c:6},{r:0,c:5},{r:1,c:7},{r:5,c:0},{r:0,c:4},{r:0,c:5},{r:7,c:1},{r:4,c:2}]},
  // 28
  {theme:"penguin",size:9,start:{r:2,c:0},target:{r:6,c:8},obstacles:[{r:8,c:0},{r:1,c:5},{r:0,c:6},{r:1,c:0},{r:2,c:3},{r:0,c:0},{r:1,c:2},{r:8,c:1},{r:1,c:4},{r:1,c:7},{r:8,c:2},{r:8,c:5},{r:3,c:8},{r:1,c:8},{r:1,c:0},{r:8,c:2},{r:5,c:7},{r:2,c:5},{r:7,c:7},{r:0,c:6},{r:4,c:6}]},
  // 29
  {theme:"frog",size:9,start:{r:3,c:0},target:{r:3,c:8},obstacles:[{r:1,c:5},{r:8,c:7},{r:4,c:4},{r:0,c:3},{r:5,c:4},{r:6,c:0},{r:7,c:8},{r:8,c:3},{r:0,c:5},{r:6,c:8},{r:2,c:6},{r:0,c:8},{r:6,c:2},{r:5,c:7},{r:2,c:0},{r:7,c:4},{r:7,c:8},{r:4,c:0},{r:5,c:2},{r:8,c:7},{r:7,c:1},{r:0,c:4},{r:6,c:5},{r:5,c:8},{r:4,c:3},{r:4,c:6}]},
  // 30
  {theme:"alien",size:9,start:{r:0,c:0},target:{r:0,c:8},obstacles:[{r:7,c:7},{r:2,c:0},{r:1,c:4},{r:2,c:7},{r:4,c:7},{r:3,c:8},{r:8,c:2},{r:8,c:0},{r:6,c:3},{r:7,c:2},{r:1,c:2},{r:6,c:4},{r:4,c:8},{r:5,c:2},{r:4,c:3},{r:3,c:2},{r:3,c:0},{r:8,c:4},{r:5,c:4},{r:2,c:3},{r:8,c:4},{r:7,c:3},{r:8,c:3},{r:6,c:7}], enemies: [{ start: {r: 1, c: 1}, commands: ['DOWN', 'UP'] }, { start: {r: 8, c: 7}, commands: ['LEFT', 'RIGHT'] }]},
];

const LEVELS = RAW_LEVELS.map((lvl, idx) => {
  let newLvl = { ...lvl, obstacles: [...lvl.obstacles] };

  // 从第8关开始(index >= 7)，如果没有小蛇，自动添加一条小蛇
  if (idx >= 7) {
    if (!newLvl.enemies || newLvl.enemies.length === 0) {
      let snakePos = null;
      for (let r = 0; r < newLvl.size; r++) {
        for (let c = 0; c < newLvl.size; c++) {
          if ((r === newLvl.start.r && c === newLvl.start.c) || (r === newLvl.target.r && c === newLvl.target.c)) continue;
          if (newLvl.obstacles.some(o => o.r === r && o.c === c)) continue;
          snakePos = { r, c };
          break;
        }
        if (snakePos) break;
      }
      if (snakePos) {
        newLvl.enemies = [{ start: snakePos, commands: ['DOWN', 'UP', 'RIGHT', 'LEFT'] }];
      }
    }
  }

  // 第十关之后的关卡 (index >= 10 表示第11关及以后)
  if (idx >= 10) {
    const sr = newLvl.start.r, sc = newLvl.start.c;
    const neighbors = [
      {r: sr - 1, c: sc}, {r: sr + 1, c: sc}, {r: sr, c: sc - 1}, {r: sr, c: sc + 1}
    ].filter(n => n.r >= 0 && n.r < newLvl.size && n.c >= 0 && n.c < newLvl.size);
    
    neighbors.forEach(n => {
      const isTarget = (n.r === newLvl.target.r && n.c === newLvl.target.c);
      const hasObs = newLvl.obstacles.some(o => o.r === n.r && o.c === n.c);
      if (!isTarget && !hasObs) {
        newLvl.obstacles.push({r: n.r, c: n.c});
      }
    });
  }
  return newLvl;
});

const getThemeWeather = (theme) => {
  if (['frog', 'mouse'].includes(theme)) return 'rain';
  if (['penguin', 'bear'].includes(theme)) return 'snow';
  if (['alien', 'cat'].includes(theme)) return 'fog';
  return 'sun';
};

const getThemeBackground = (theme) => {
  if (['fox', 'dog'].includes(theme)) return '/backgrounds/bg_forest.png';
  if (['rabbit', 'monkey'].includes(theme)) return '/backgrounds/bg_meadow.png';
  if (['frog'].includes(theme)) return '/backgrounds/bg_pond.png';
  if (['penguin', 'bear'].includes(theme)) return '/backgrounds/bg_ice.png';
  if (['alien'].includes(theme)) return '/backgrounds/bg_space.png';
  return '/backgrounds/bg_indoor.png'; // cat, mouse
};

const WeatherOverlay = ({ weather }) => {
  if (weather === 'sun') {
    return (
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(circle at top left, rgba(255, 255, 200, 0.4) 0%, transparent 50%)',
        mixBlendMode: 'screen'
      }} />
    );
  }
  if (weather === 'fog') {
    return (
      <div style={{
        position: 'absolute', top: '-10%', left: '-10%', right: '-10%', bottom: '-10%',
        pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.4) 100%)',
        animation: 'fogPan 20s infinite ease-in-out',
        mixBlendMode: 'screen',
        filter: 'blur(10px)'
      }} />
    );
  }
  if (weather === 'snow' || weather === 'rain') {
    const isSnow = weather === 'snow';
    const count = isSnow ? 30 : 40;
    const particles = [];
    for (let i=0; i<count; i++) {
      const left = Math.random() * 100 + '%';
      const animDuration = isSnow ? (3 + Math.random() * 3 + 's') : (0.5 + Math.random() * 0.5 + 's');
      const delay = Math.random() * -5 + 's';
      particles.push(
        <div key={i} style={{
          position: 'absolute',
          left,
          top: isSnow ? '-10px' : '-20px',
          width: isSnow ? '6px' : '2px',
          height: isSnow ? '6px' : '15px',
          background: isSnow ? 'white' : 'rgba(255,255,255,0.5)',
          borderRadius: isSnow ? '50%' : '0',
          animation: `${isSnow ? 'snowFall' : 'rainFall'} ${animDuration} linear ${delay} infinite`,
          pointerEvents: 'none'
        }} />
      );
    }
    return (
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        {particles}
      </div>
    );
  }
  return null;
};

export default function CodingMazeGame({ lang, onBack }) {
  const [levelIdx, setLevelIdx] = useState(() => {
    const saved = localStorage.getItem('codingMazeLevel');
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (isNaN(parsed)) return 0;
      return Math.min(Math.max(0, parsed), LEVELS.length - 1);
    }
    return 0;
  });

  const currentLevel = LEVELS[levelIdx] || LEVELS[0];
  const [commands, setCommands] = useState([]);
  const [pos, setPos] = useState({ ...currentLevel.start });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [executingIdx, setExecutingIdx] = useState(-1);
  const [isShaking, setIsShaking] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [isWalking, setIsWalking] = useState(false);
  const [trail, setTrail] = useState([]);
  const [pendingBombs, setPendingBombs] = useState([]);
  const [currentWeather, setCurrentWeather] = useState(getThemeWeather(currentLevel.theme));
  const [zoomScale, setZoomScale] = useState(1.0);
  const [bombCount, setBombCount] = useState(() => {
    const saved = localStorage.getItem('codingMazeBombs');
    if (saved) {
      const parsed = parseInt(saved, 10);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  });
  const [isBombMode, setIsBombMode] = useState(false);
  const [destroyedObstacles, setDestroyedObstacles] = useState([]);
  const [destroyedEnemies, setDestroyedEnemies] = useState([]);
  const [enemyPositions, setEnemyPositions] = useState([]);
  
  const [showMathQuiz, setShowMathQuiz] = useState(false);
  const [mathProblem, setMathProblem] = useState(null);
  const [mathInput, setMathInput] = useState('');
  const [isMathShaking, setIsMathShaking] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showParentGate, setShowParentGate] = useState(false);
  const [parentGateProblem, setParentGateProblem] = useState(null);
  const [parentGateInput, setParentGateInput] = useState('');
  const [isParentGateShaking, setIsParentGateShaking] = useState(false);
  const [customMinInput, setCustomMinInput] = useState(1);
  const [customMaxInput, setCustomMaxInput] = useState(20);
  const [mathMin, setMathMin] = useState(1);
  const [mathMax, setMathMax] = useState(20);
  const [isMobile, setIsMobile] = useState(false);
  const resetTimeoutRef = useRef(null);
  const containerRef = useRef(null);
  const [mazeSize, setMazeSize] = useState(200);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const handleMouseMove = (e) => {
    if (isMobile || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const nx = (x / rect.width) * 2 - 1;
    const ny = (y / rect.height) * 2 - 1;
    setTilt({ rx: -ny * 8, ry: nx * 8 });
  };

  const handleMouseLeave = () => {
    if (!isMobile) setTilt({ rx: 0, ry: 0 });
  };

  useEffect(() => {
    setCurrentWeather(getThemeWeather(currentLevel.theme));
  }, [currentLevel.theme]);

  // Pure CSS layout handles the actual dimensions.
  // We use ResizeObserver ONLY to read the final size and compute font sizes.
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 600);
    handleResize();
    window.addEventListener('resize', handleResize);

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setMazeSize(Math.min(width, height));
        }
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    resetLevel();
  }, [levelIdx]);

  const triggerSettings = () => {
    audioSynth.playClick();
    const num1 = Math.floor(Math.random() * 5) + 5; // 5-9
    const num2 = Math.floor(Math.random() * 5) + 5; // 5-9
    setParentGateProblem({ num1, num2, ans: num1 * num2 });
    setParentGateInput('');
    setShowParentGate(true);
  };

  const resetLevel = () => {
    if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    setPos({ ...currentLevel.start });
    setCommands([]);
    setIsPlaying(false);
    setIsSolved(false);
    setStatusMsg('');
    setExecutingIdx(-1);
    setIsShaking(false);
    setIsJumping(false);
    setIsWalking(false);
    setIsBombMode(false);
    setTrail([]);
    setPendingBombs([]);
    setDestroyedObstacles([]);
    setDestroyedEnemies([]);
    setEnemyPositions(currentLevel.enemies ? currentLevel.enemies.map(e => ({...e.start})) : []);
  };

  const resetToStart = () => {
    if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    setIsShaking(false);
    setIsJumping(false);
    setIsWalking(false);
    setTrail([]);
    setPos({ ...currentLevel.start });
    setStatusMsg('');
    setEnemyPositions(currentLevel.enemies ? currentLevel.enemies.map((e, i) => destroyedEnemies.includes(i) ? null : ({...e.start})) : []);
  };

  const triggerMathQuiz = () => {
    audioSynth.playClick();
    const q = mathGenerator.generateQuestion(4, { minNumber: mathMin, maxNumber: mathMax, operations: ['add', 'sub'], lang: lang });
    setMathProblem({ a: q.num1, b: q.num2, op: q.symbol, ans: q.answer });
    setMathInput('');
    setShowMathQuiz(true);
  };

  const handleMathSubmit = (e) => {
    e.preventDefault();
    if (parseInt(mathInput, 10) === mathProblem.ans) {
      audioSynth.playCorrect();
      const newBombs = bombCount + 2;
      setBombCount(newBombs);
      localStorage.setItem('codingMazeBombs', newBombs.toString());
      setShowMathQuiz(false);
    } else {
      audioSynth.playIncorrect();
      setIsMathShaking(true);
      setMathInput('');
      setTimeout(() => setIsMathShaking(false), 500);
    }
  };

  const addCommand = (cmd) => {
    if (isPlaying || isSolved) return;
    audioSynth.playClick();
    if (commands.length < 30) {
      setCommands([...commands, cmd]);
      resetToStart();
    }
  };

  const removeCommand = (idx) => {
    if (isPlaying || isSolved) return;
    audioSynth.playClick();
    setCommands(commands.filter((_, i) => i !== idx));
    resetToStart();
  };

  const executeCommands = async () => {
    if (commands.length === 0 || isPlaying || isSolved) return;
    audioSynth.playClick();
    setIsPlaying(true);
    setStatusMsg(lang === 'en' ? 'Running...' : '运行中...');

    if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);

    let currentPos = { ...currentLevel.start };
    setPos(currentPos);
    setTrail([]);
    let currentEnemyPositions = currentLevel.enemies ? currentLevel.enemies.map((e, i) => destroyedEnemies.includes(i) ? null : ({...e.start})) : [];
    setEnemyPositions(currentEnemyPositions);

    for (let i = 0; i < commands.length; i++) {
      setExecutingIdx(i);
      const cmd = commands[i];
      setIsWalking(true);
      
      await new Promise(res => setTimeout(res, 450));
      setIsWalking(false);

      let nextR = currentPos.r;
      let nextC = currentPos.c;

      if (cmd === 'UP') nextR--;
      if (cmd === 'DOWN') nextR++;
      if (cmd === 'LEFT') nextC--;
      if (cmd === 'RIGHT') nextC++;

      if (nextR < 0 || nextR >= currentLevel.size || nextC < 0 || nextC >= currentLevel.size) {
        audioSynth.playIncorrect();
        setStatusMsg(lang === 'en' ? 'Oops! Hit a wall.' : '哎呀，撞墙了。');
        setIsPlaying(false);
        setExecutingIdx(-1);
        setIsShaking(true);
        resetTimeoutRef.current = setTimeout(() => {
          setIsShaking(false);
          setPos({ ...currentLevel.start });
          setEnemyPositions(currentLevel.enemies ? currentLevel.enemies.map((e, i) => destroyedEnemies.includes(i) ? null : ({...e.start})) : []);
        }, 500);
        return;
      }

      const hitObstacle = currentLevel.obstacles.some(o => o.r === nextR && o.c === nextC);
      const isDestroyed = destroyedObstacles.some(o => o.r === nextR && o.c === nextC);
      if (hitObstacle && !isDestroyed) {
        audioSynth.playIncorrect();
        setStatusMsg(lang === 'en' ? 'Oops! Hit an obstacle.' : '哎呀，撞到障碍物了。');
        setIsPlaying(false);
        setExecutingIdx(-1);
        setIsShaking(true);
        resetTimeoutRef.current = setTimeout(() => {
          setIsShaking(false);
          setPos({ ...currentLevel.start });
          setEnemyPositions(currentLevel.enemies ? currentLevel.enemies.map((e, i) => destroyedEnemies.includes(i) ? null : ({...e.start})) : []);
        }, 500);
        return;
      }

      if (currentLevel.enemies) {
        currentEnemyPositions = currentEnemyPositions.map((ep, eIdx) => {
          if (!ep) return null;
          const enemyDef = currentLevel.enemies[eIdx];
          const eCmd = enemyDef.commands[i % enemyDef.commands.length];
          let er = ep.r, ec = ep.c;
          if (eCmd === 'UP') er--;
          if (eCmd === 'DOWN') er++;
          if (eCmd === 'LEFT') ec--;
          if (eCmd === 'RIGHT') ec++;
          return {r: er, c: ec};
        });
        setEnemyPositions(currentEnemyPositions);
      }

      const hitEnemy = currentEnemyPositions.some(ep => ep && ep.r === nextR && ep.c === nextC);
      if (hitEnemy) {
        audioSynth.playIncorrect();
        setStatusMsg(lang === 'en' ? 'Oops! Caught by a snake.' : '哎呀，撞到巡逻的小蛇了。');
        setIsPlaying(false);
        setExecutingIdx(-1);
        setIsShaking(true);
        resetTimeoutRef.current = setTimeout(() => {
          setIsShaking(false);
          setPos({ ...currentLevel.start });
          setEnemyPositions(currentLevel.enemies ? currentLevel.enemies.map((e, i) => destroyedEnemies.includes(i) ? null : ({...e.start})) : []);
        }, 500);
        return;
      }

      setTrail(prev => [...prev, { ...currentPos }]);
      currentPos = { r: nextR, c: nextC };
      setPos(currentPos);
      audioSynth.playClick();
    }

    setExecutingIdx(-1);
    await new Promise(res => setTimeout(res, 300));

    if (currentPos.r === currentLevel.target.r && currentPos.c === currentLevel.target.c) {
      audioSynth.playCorrect();
      setStatusMsg(lang === 'en' ? 'Target reached!' : '到达终点啦！');
      setIsSolved(true);
      setIsJumping(true);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff5d9e', '#ffd6e8', '#ffadd2', '#bbf7d0', '#fef08a']
      });
    } else {
      audioSynth.playIncorrect();
      setStatusMsg(lang === 'en' ? 'Did not reach the target.' : '还没到达终点呢。');
      setIsShaking(true);
      resetTimeoutRef.current = setTimeout(() => {
        setIsShaking(false);
        setPos({ ...currentLevel.start });
        setEnemyPositions(currentLevel.enemies ? currentLevel.enemies.map((e, i) => destroyedEnemies.includes(i) ? null : ({...e.start})) : []);
      }, 500);
    }
    setIsPlaying(false);
  };

  const nextLevel = () => {
    audioSynth.playClick();
    const nextIdx = (levelIdx + 1) % LEVELS.length;
    setLevelIdx(nextIdx);
    localStorage.setItem('codingMazeLevel', nextIdx.toString());
    const newBombs = bombCount + 1;
    setBombCount(newBombs);
    localStorage.setItem('codingMazeBombs', newBombs.toString());
    setIsBombMode(false);
    setDestroyedObstacles([]);
  };

  const resetAllProgress = () => {
    if (window.confirm(lang === 'en' ? 'Reset all progress?' : '确定要重置所有闯关进度并回到第一关吗？')) {
      audioSynth.playClick();
      localStorage.removeItem('codingMazeLevel');
      localStorage.removeItem('codingMazeBombs');
      setLevelIdx(0);
      setBombCount(0);
      setIsBombMode(false);
      setDestroyedObstacles([]);
      setDestroyedEnemies([]);
    }
  };

  const handleZoomIn = () => setZoomScale(prev => Math.min(prev + 0.1, 1.5));
  const handleZoomOut = () => setZoomScale(prev => Math.max(prev - 0.1, 0.4));

  const size = currentLevel.size;
  const gridPadding = isMobile ? 4 : 10;
  const gridGap = isMobile ? 3 : 6;
  const cellSize = Math.max(10, (mazeSize - 2 * gridPadding - (size - 1) * gridGap) / size);
  
  // Compact sizes for mobile controls
  const cmdBtnSize = isMobile ? 28 : 45;
  const dirBtnSize = isMobile ? 40 : 56;

  const renderGrid = () => {
    const tTheme = THEMES[currentLevel.theme] || THEMES.fox;
    const grid = [];
    
    const getPathPoints = () => {
      const allPoints = [...trail, pos];
      return allPoints.map(p => {
        const cx = gridPadding + p.c * (cellSize + gridGap) + cellSize / 2;
        const cy = gridPadding + p.r * (cellSize + gridGap) + cellSize / 2;
        return `${cx},${cy}`;
      }).join(' ');
    };
    for (let r = 0; r < currentLevel.size; r++) {
      const row = [];
      for (let c = 0; c < currentLevel.size; c++) {
        let content = null;
        let bg = (r + c) % 2 === 0 ? tTheme.bgFloor : tTheme.bgAlt;
        let shadowColor = (r + c) % 2 === 0 ? tTheme.bgAlt : '#cbd5e1';
        let borderColor = (r + c) % 2 === 0 ? tTheme.bgAlt : '#cbd5e1';

        const isObstacle = currentLevel.obstacles.some(o => o.r === r && o.c === c);
        const isDestroyed = destroyedObstacles.some(o => o.r === r && o.c === c);

        const enemyIdx = enemyPositions.findIndex(ep => ep && ep.r === r && ep.c === c);
        const isEnemy = enemyIdx !== -1;
        const isEnemyDestroyed = currentLevel.enemies?.some((e, i) => destroyedEnemies.includes(i) && e.start.r === r && e.start.c === c);

        const isPendingBomb = pendingBombs.some(p => p.r === r && p.c === c);
        const isFootprint = trail.some(t => t.r === r && t.c === c);

        if (isPendingBomb) {
          content = <span style={{ animation: 'fuseBurn 0.2s infinite alternate', display: 'inline-block' }}>🧨</span>;
        } else if (r === currentLevel.target.r && c === currentLevel.target.c) {
          content = <span style={{ animation: 'targetPulse 1.5s infinite', display: 'inline-block' }}>{tTheme.target}</span>;
          bg = '#bbf7d0';
          shadowColor = '#86efac';
          borderColor = '#4ade80';
        } else if (isObstacle && !isDestroyed) {
          content = <span style={{ animation: 'obstacleSway 3s infinite ease-in-out', display: 'inline-block', transformOrigin: 'bottom center' }}>{tTheme.obstacle}</span>;
          bg = tTheme.bgObstacle;
          shadowColor = '#fca5a5';
          borderColor = '#f87171';
        } else if ((isObstacle && isDestroyed) || isEnemyDestroyed) {
          content = null;
        } else if (isFootprint) {
          content = <span style={{ opacity: 0.3, fontSize: `${cellSize * 0.4}px` }}>🐾</span>;
        }

        const canBomb = isBombMode && ((isObstacle && !isDestroyed) || isEnemy);

        row.push(
          <div key={`${r}-${c}`} style={{
            flex: 1,
            height: '100%',
            backgroundColor: bg,
            borderRadius: isMobile ? '6px' : '12px',
            border: `${isMobile ? 1 : 2}px solid ${borderColor}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: `${cellSize * 0.6}px`,
            boxShadow: `0 ${isMobile ? 2 : 4}px 0 ${shadowColor}`,
            position: 'relative',
            cursor: canBomb ? 'crosshair' : 'default',
            outline: canBomb ? '2px solid red' : 'none',
            outlineOffset: '-2px'
          }} onClick={() => {
            if (canBomb && !isPendingBomb) {
              setPendingBombs([...pendingBombs, {r, c}]);
              audioSynth.playClick();
              setTimeout(() => {
                audioSynth.playBomb();
                setIsShaking(true);
                setTimeout(() => setIsShaking(false), 300);
                
                if (containerRef.current) {
                  const rect = containerRef.current.getBoundingClientRect();
                  const cellW = rect.width / currentLevel.size;
                  const cellH = rect.height / currentLevel.size;
                  const absX = rect.left + c * cellW + cellW / 2;
                  const absY = rect.top + r * cellH + cellH / 2;
                  
                  confetti({
                    particleCount: 80,
                    spread: 100,
                    startVelocity: 30,
                    origin: {
                      x: absX / window.innerWidth,
                      y: absY / window.innerHeight
                    },
                    colors: ['#ef4444', '#f97316', '#eab308', '#27272a', '#64748b'],
                    ticks: 100,
                    gravity: 1.2
                  });
                }
                
                setPendingBombs(prev => prev.filter(p => p.r !== r || p.c !== c));
                
                if (isEnemy) {
                  setDestroyedEnemies(prev => [...prev, enemyIdx]);
                  const newEp = [...enemyPositions];
                  newEp[enemyIdx] = null;
                  setEnemyPositions(newEp);
                } else {
                  setDestroyedObstacles(prev => [...prev, { r, c }]);
                }
                const newBombs = bombCount - 1;
                setBombCount(newBombs);
                localStorage.setItem('codingMazeBombs', newBombs.toString());
              }, 500);
              setIsBombMode(false);
            }
          }}>
            {content}
          </div>
        );
      }
      grid.push(
        <div key={r} style={{ display: 'flex', gap: `${gridGap}px`, flex: 1 }}>
          {row}
        </div>
      );
    }
    return (
      <div className="maze-grid-container" key={levelIdx} style={{
        animation: 'bounceInDrop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: `${gridGap}px`,
        padding: `${gridPadding}px`,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderRadius: isMobile ? '12px' : '24px',
        border: `${isMobile ? 2 : 4}px solid rgba(255, 255, 255, 0.9)`,
        boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
        boxSizing: 'border-box'
      }}>
        <style>
          {`
            @keyframes targetPulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.12); filter: brightness(1.15); }
            }
            @keyframes heroShake {
              0%, 100% { transform: translateX(0); }
              25% { transform: translateX(-6px) rotate(-8deg); }
              50% { transform: translateX(6px) rotate(8deg); }
              75% { transform: translateX(-6px) rotate(-8deg); }
            }
            @keyframes heroJump {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-14px) scale(1.08); }
            }
            @keyframes cmdActive {
              0% { transform: scale(1); box-shadow: 0 3px 0 #1e40af; }
              50% { transform: scale(1.12); box-shadow: 0 6px 10px rgba(59, 130, 246, 0.6), 0 3px 0 #1e40af; z-index: 10; }
              100% { transform: scale(1); box-shadow: 0 3px 0 #1e40af; }
            }
            @keyframes obstacleSway {
              0%, 100% { transform: rotate(0deg); }
              50% { transform: rotate(4deg); }
            }
            @keyframes floatFloat {
              0%, 100% { transform: translateY(0) rotate(0deg); }
              50% { transform: translateY(-8px) rotate(3deg); }
            }
            @keyframes twinkleScale {
              0%, 100% { transform: scale(1); opacity: 0.7; }
              50% { transform: scale(1.3); opacity: 1; }
            }
            @keyframes bombExplosion {
              0% { transform: scale(0.2); opacity: 1; filter: brightness(2) drop-shadow(0 0 10px #ef4444); }
              40% { transform: scale(1.6); opacity: 1; filter: brightness(1.5) drop-shadow(0 0 20px #ef4444); }
              70% { transform: scale(1.1); opacity: 0.8; filter: drop-shadow(0 0 5px #ef4444); }
              100% { transform: scale(1); opacity: 0.3; filter: grayscale(100%); }
            }
            @keyframes bombPulse {
              0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); transform: scale(1); }
              70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); transform: scale(1.05); }
              100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); transform: scale(1); }
            }
          `}
        </style>
        

        {grid}
        {trail.length > 0 && (
          <svg style={{
            position: 'absolute',
            top: 0, left: 0,
            width: '100%', height: '100%',
            pointerEvents: 'none',
            zIndex: 5
          }}>
            <polyline 
              points={getPathPoints()}
              fill="none"
              stroke="#fef08a"
              strokeWidth={isMobile ? "4" : "6"}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                filter: 'drop-shadow(0 0 8px #fde047)',
                strokeDasharray: '10, 15',
                animation: 'dashFlow 1s linear infinite'
              }}
            />
          </svg>
        )}
        {/* Hero overlay */}
        <div style={{
          position: 'absolute',
          top: `calc(${gridPadding}px + ${pos.r} * (100% - ${2 * gridPadding}px + ${gridGap}px) / ${size})`,
          left: `calc(${gridPadding}px + ${pos.c} * (100% - ${2 * gridPadding}px + ${gridGap}px) / ${size})`,
          width: `calc((100% - ${2 * gridPadding}px - ${(size - 1) * gridGap}px) / ${size})`,
          height: `calc((100% - ${2 * gridPadding}px - ${(size - 1) * gridGap}px) / ${size})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: `${cellSize * 0.7}px`,
          transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
          animation: isShaking ? 'heroShake 0.4s' : (isJumping ? 'heroJump 0.5s infinite' : (isWalking ? 'wobbleWalk 0.4s infinite' : 'none')),
          zIndex: 10,
          filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.25))'
        }}>
          {tTheme.hero}
        </div>
        {/* Enemy overlays */}
        {enemyPositions.map((ep, i) => {
          if (!ep) return null;
          return (
            <div key={`enemy-${i}`} style={{
              position: 'absolute',
              top: `calc(${gridPadding}px + ${ep.r} * (100% - ${2 * gridPadding}px + ${gridGap}px) / ${size})`,
              left: `calc(${gridPadding}px + ${ep.c} * (100% - ${2 * gridPadding}px + ${gridGap}px) / ${size})`,
              width: `calc((100% - ${2 * gridPadding}px - ${(size - 1) * gridGap}px) / ${size})`,
              height: `calc((100% - ${2 * gridPadding}px - ${(size - 1) * gridGap}px) / ${size})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: `${cellSize * 0.7}px`,
              transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
              zIndex: 9,
              pointerEvents: 'none',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
            }}>
              🐍
            </div>
          );
        })}
      </div>
    );
  };

  const getCmdIcon = (cmd) => {
    const s = isMobile ? 16 : 20;
    if (cmd === 'UP') return <ArrowUp size={s} />;
    if (cmd === 'DOWN') return <ArrowDown size={s} />;
    if (cmd === 'LEFT') return <ArrowLeft size={s} />;
    if (cmd === 'RIGHT') return <ArrowRight size={s} />;
    return null;
  };


  return (
    <div className="screen-wrapper fade-in" style={{
      padding: isMobile ? '4px' : '16px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
      backgroundImage: `url(${getThemeBackground(currentLevel.theme)})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      transition: 'background-image 0.5s ease-in-out'
    }}>
      <WeatherOverlay weather={currentWeather} />
      
      {/* Transparent card holding all controls */}
      <div style={{
        width: '100%',
        height: '100%',
        maxWidth: '600px',
        display: 'flex',
        flexDirection: 'column',
        padding: isMobile ? '8px' : '20px',
        boxSizing: 'border-box'
      }}>
      <div style={{ 
        flex: '1 1 0',
        minHeight: 0,
        width: '100%', 
        maxWidth: '600px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        padding: isMobile ? '6px 8px' : '20px',
        boxSizing: 'border-box'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMobile ? '3px' : '12px', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: isMobile ? '2px' : '6px' }}>
            <button className="bouncy-button secondary" onClick={onBack} style={{ padding: isMobile ? '5px 7px' : '8px 12px' }}>
              <ArrowLeft size={isMobile ? 16 : 20} />
            </button>
            <button className="bouncy-button secondary" onClick={resetAllProgress} style={{ padding: isMobile ? '5px 7px' : '8px 12px' }} title={lang === 'en' ? 'Reset Progress' : '重置所有进度'}>
              <RotateCcw size={isMobile ? 16 : 20} />
            </button>
          </div>
          <h2 style={{ color: '#c0487a', margin: 0, fontSize: isMobile ? '0.9rem' : '1.4rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {lang === 'en' ? `Maze (${levelIdx + 1}/${LEVELS.length})` : `编程迷宫 (${levelIdx + 1}/${LEVELS.length})`}
          </h2>
          <div style={{ display: 'flex', gap: isMobile ? '2px' : '6px' }}>
            <button className="bouncy-button secondary" onClick={triggerSettings} style={{ padding: isMobile ? '4px 6px' : '6px 10px' }} title={lang === 'en' ? 'Settings' : '设置'}>
              <Settings size={isMobile ? 14 : 18} />
            </button>
            <button className="bouncy-button secondary" onClick={handleZoomOut} style={{ padding: isMobile ? '4px 6px' : '6px 10px' }} title="缩小">
              <ZoomOut size={isMobile ? 14 : 18} />
            </button>
            <button className="bouncy-button secondary" onClick={handleZoomIn} style={{ padding: isMobile ? '4px 6px' : '6px 10px' }} title="放大">
              <ZoomIn size={isMobile ? 14 : 18} />
            </button>
            <button className="bouncy-button secondary" onClick={() => { audioSynth.playClick(); resetLevel(); }} style={{ padding: isMobile ? '4px 6px' : '8px 12px', marginLeft: isMobile ? '0' : '4px' }}>
              <RefreshCw size={isMobile ? 16 : 20} />
            </button>
          </div>
        </div>

        {/* Maze Container (Flex area that takes remaining vertical space) */}
        <div 
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
          flex: '1 1 auto',
          minHeight: 0,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: isMobile ? '3px' : '10px',
          perspective: '1000px'
        }}>
          {/* Inner container forced to be a square, sizing itself purely by CSS constraints */}
          <div ref={containerRef} style={{
             height: '100%',
             maxWidth: '100%',
             aspectRatio: '1 / 1',
             position: 'relative',
             transform: `scale(${zoomScale}) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
             transformOrigin: 'center center',
             transition: tilt.rx === 0 && tilt.ry === 0 ? 'transform 0.5s ease-out' : 'transform 0.1s ease-out',
             transformStyle: 'preserve-3d'
          }}>
            {renderGrid()}
          </div>
        </div>

        {/* Status */}
        <div style={{ flexShrink: 0, height: isMobile ? '16px' : '22px', fontSize: isMobile ? '0.8rem' : '0.95rem', fontWeight: 'bold', color: isSolved ? '#16a34a' : '#c0487a', marginBottom: isMobile ? '2px' : '6px' }}>
          {statusMsg}
        </div>

        {/* Commands strip */}
        <div style={{ 
          width: '100%', 
          flexShrink: 0,
          minHeight: `${cmdBtnSize + 8}px`, 
          maxHeight: `${cmdBtnSize * 2 + 16}px`,
          overflowY: 'auto',
          border: '2px solid #cbd5e1', 
          borderRadius: '10px', 
          display: 'flex', 
          flexWrap: 'wrap', 
          alignContent: 'flex-start',
          gap: isMobile ? '3px' : '6px', 
          padding: isMobile ? '3px' : '6px', 
          marginBottom: isMobile ? '4px' : '12px',
          backgroundColor: '#f8fafc', 
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.04)',
          boxSizing: 'border-box'
        }}>
          {commands.length === 0 && <div style={{ color: '#94a3b8', width: '100%', textAlign: 'center', fontWeight: 'bold', fontSize: isMobile ? '0.75rem' : '0.9rem', lineHeight: `${cmdBtnSize}px` }}>{lang === 'en' ? 'Add commands below' : '在下方添加指令'}</div>}
          {commands.map((cmd, idx) => (
            <div key={idx} onClick={() => removeCommand(idx)} style={{
              width: `${cmdBtnSize}px`, 
              height: `${cmdBtnSize}px`, 
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white',
              borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: isPlaying || isSolved ? 'default' : 'pointer', 
              boxShadow: `0 ${isMobile ? 2 : 3}px 0 #1e40af`,
              position: 'relative',
              animation: idx === executingIdx ? 'glowPulse 0.5s infinite' : 'none',
              zIndex: idx === executingIdx ? 10 : 1,
              flexShrink: 0
            }}>
              {getCmdIcon(cmd)}
              
              {/* Step badge */}
              <div style={{ 
                position: 'absolute', 
                top: -3, left: -3, 
                background: '#10b981', color: 'white', 
                fontSize: '0.55rem', fontWeight: 'bold', 
                width: '14px', height: '14px', 
                borderRadius: '50%', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 1px 2px rgba(0,0,0,0.2)' 
              }}>
                {idx + 1}
              </div>

              {!isPlaying && !isSolved && (
                <div style={{ 
                  position: 'absolute', top: -3, right: -3, 
                  background: '#ef4444', borderRadius: '50%', 
                  padding: '1px', color: 'white', 
                  boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                  lineHeight: 0
                }}>
                  <X size={8} strokeWidth={3} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Direction buttons */}
        <div style={{ display: 'flex', flexShrink: 0, gap: isMobile ? '6px' : '12px', marginBottom: isMobile ? '4px' : '12px' }}>
          {['UP', 'DOWN', 'LEFT', 'RIGHT'].map(cmd => (
            <button key={cmd} onClick={() => addCommand(cmd)} disabled={isPlaying || isSolved}
              style={{
                width: `${dirBtnSize}px`, 
                height: `${dirBtnSize}px`,
                borderRadius: '12px',
                background: isPlaying || isSolved ? '#cbd5e1' : 'linear-gradient(135deg, #fcd34d, #f59e0b)',
                border: 'none', color: isPlaying || isSolved ? '#94a3b8' : 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: isPlaying || isSolved ? 'none' : `0 ${isMobile ? 2 : 4}px 0 #d97706`,
                cursor: isPlaying || isSolved ? 'default' : 'pointer',
                transition: 'all 0.1s'
              }}
              onMouseDown={e => { if(!isPlaying && !isSolved) { e.currentTarget.style.transform = 'translateY(2px)'; e.currentTarget.style.boxShadow = '0 0 0 #d97706'; } }}
              onMouseUp={e => { if(!isPlaying && !isSolved) { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 ${isMobile ? 2 : 4}px 0 #d97706`; } }}
              onMouseLeave={e => { if(!isPlaying && !isSolved) { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 ${isMobile ? 2 : 4}px 0 #d97706`; } }}
            >
              {getCmdIcon(cmd)}
            </button>
          ))}
        </div>

        {/* Controls and Run area */}
        <div style={{ display: 'flex', flexShrink: 0, gap: isMobile ? '6px' : '12px', width: '100%', justifyContent: 'center', alignItems: 'stretch' }}>
          
          <button 
             className="bouncy-button secondary" 
             onClick={() => { 
               if(bombCount > 0 && !isPlaying && !isSolved) setIsBombMode(!isBombMode); 
               else if(bombCount === 0 && !isPlaying && !isSolved) triggerMathQuiz();
             }}
             style={{ 
                padding: isMobile ? '6px 10px' : '10px 18px', 
                fontSize: isMobile ? '0.9rem' : '1rem',
                background: bombCount === 0 ? '#bfdbfe' : (isBombMode ? '#fca5a5' : '#f8fafc'),
                border: `2px solid ${bombCount === 0 ? '#3b82f6' : (isBombMode ? '#ef4444' : '#cbd5e1')}`,
                color: bombCount === 0 ? '#1e40af' : '#334155',
                display: 'flex', alignItems: 'center', gap: '4px',
                borderRadius: '12px',
                boxShadow: `0 ${isMobile ? 2 : 4}px 0 ${bombCount === 0 ? '#60a5fa' : '#94a3b8'}`,
                animation: isBombMode ? 'bombPulse 1.5s infinite' : 'none'
             }}
             title={bombCount === 0 ? (lang === 'en' ? 'Get Bombs' : '获取炸弹') : (lang === 'en' ? 'Use Bomb' : '使用炸弹（点击后选择要炸毁的障碍物）')}
          >
            {bombCount > 0 ? (
              <>💣 <span style={{fontWeight:'bold'}}>x {bombCount}</span></>
            ) : (
              <span style={{fontWeight:'bold'}}>{lang === 'en' ? '➕ Get Bombs' : '➕ 获取炸弹'}</span>
            )}
          </button>

          {isSolved ? (
            <button className="bouncy-button primary" onClick={nextLevel} style={{ flexShrink: 0, padding: isMobile ? '6px 14px' : '10px 22px', fontSize: isMobile ? '0.9rem' : '1.15rem' }}>
              {lang === 'en' ? 'Next Maze ➔' : '下一关 ➔'}
            </button>
          ) : (
            <button className="bouncy-button primary" onClick={executeCommands} disabled={isPlaying || commands.length === 0} style={{ flexShrink: 0, padding: isMobile ? '6px 14px' : '10px 22px', fontSize: isMobile ? '0.9rem' : '1.15rem', display: 'flex', alignItems: 'center', gap: '6px', background: isPlaying ? '#94a3b8' : '' }}>
              <Play size={isMobile ? 14 : 18} fill="white" /> {lang === 'en' ? 'Run Code' : '运行程序'}
            </button>
          )}
        </div>

      </div>
      </div>

      {/* Math Quiz Modal */}
      {showMathQuiz && mathProblem && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, margin: 0, padding: 0
        }}>
          <div className={isMathShaking ? 'shake-animation' : ''} style={{
            background: 'white', padding: isMobile ? '20px' : '30px', borderRadius: '24px',
            textAlign: 'center', width: '85%', maxWidth: '350px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            border: '4px solid #60a5fa'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#1e40af', fontSize: '1.4rem' }}>
              {lang === 'en' ? 'Math Challenge' : '算术挑战'}
            </h3>
            <p style={{ margin: '0 0 20px 0', color: '#475569', fontSize: '0.95rem' }}>
              {lang === 'en' ? 'Solve it to get 2 bombs!' : '算对这道题，就能获得 2 颗炸弹哦！'}
            </p>
            
            <div style={{ fontSize: '2.8rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '25px', letterSpacing: '3px' }}>
              {mathProblem.a} {mathProblem.op} {mathProblem.b} = ?
            </div>
            
            <form onSubmit={handleMathSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input 
                type="number" 
                value={mathInput}
                onChange={(e) => setMathInput(e.target.value)}
                autoFocus
                style={{
                  fontSize: '2rem', padding: '10px', textAlign: 'center',
                  borderRadius: '12px', border: '3px solid #cbd5e1', outline: 'none',
                  color: '#0f172a', fontWeight: 'bold'
                }}
                placeholder="?"
              />
              <button type="submit" className="bouncy-button primary" style={{ padding: '14px', fontSize: '1.2rem', borderRadius: '12px' }}>
                {lang === 'en' ? 'Submit' : '提交答案'}
              </button>
            </form>
            
            <button 
              onClick={() => { audioSynth.playClick(); setShowMathQuiz(false); }}
              style={{
                marginTop: '15px', background: 'none', border: 'none', color: '#94a3b8',
                textDecoration: 'underline', cursor: 'pointer', fontSize: '1rem',
                padding: '10px'
              }}
            >
              {lang === 'en' ? 'Cancel' : '放弃挑战'}
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="bounce-in card-shadow" style={{
            background: 'white', borderRadius: '24px', padding: '24px',
            width: '90%', maxWidth: '340px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#334155', textAlign: 'center' }}>
              {lang === 'en' ? 'Bomb Math Difficulty' : '获取炸弹难度设置'}
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '10px' }}>
              {lang === 'en' ? 'Numerical range (e.g. 10 to 20):' : '计算数值范围 (例如 10 到 20)：'}
            </p>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px' }}>
              <input 
                type="number" 
                value={customMinInput}
                onChange={e => setCustomMinInput(e.target.value)}
                style={{
                  flex: 1, padding: '12px', fontSize: '1.2rem', borderRadius: '12px',
                  border: '2px solid #cbd5e1', textAlign: 'center', minWidth: 0
                }}
                placeholder="10"
              />
              <span style={{ fontSize: '1.2rem', color: '#64748b', fontWeight: 'bold' }}>-</span>
              <input 
                type="number" 
                value={customMaxInput}
                onChange={e => setCustomMaxInput(e.target.value)}
                style={{
                  flex: 1, padding: '12px', fontSize: '1.2rem', borderRadius: '12px',
                  border: '2px solid #cbd5e1', textAlign: 'center', minWidth: 0
                }}
                placeholder="20"
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => { audioSynth.playClick(); setShowSettings(false); }}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#e2e8f0', color: '#475569', fontWeight: 'bold' }}
              >
                {lang === 'en' ? 'Cancel' : '取消'}
              </button>
              <button 
                onClick={() => {
                  audioSynth.playClick();
                  let vMin = parseInt(customMinInput);
                  let vMax = parseInt(customMaxInput);
                  if (isNaN(vMin) || vMin < 1) vMin = 1;
                  if (isNaN(vMax) || vMax < vMin) vMax = vMin + 5;
                  if (vMax > 1000) vMax = 1000;
                  setMathMin(vMin);
                  setMathMax(vMax);
                  setCustomMinInput(vMin);
                  setCustomMaxInput(vMax);
                  setShowSettings(false);
                }}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#3b82f6', color: 'white', fontWeight: 'bold' }}
              >
                {lang === 'en' ? 'Save' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Parent Gate Modal */}
      {showParentGate && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100
        }}>
          <div className={`bounce-in card-shadow ${isParentGateShaking ? 'shake' : ''}`} style={{
            background: 'white', borderRadius: '24px', padding: '24px',
            width: '90%', maxWidth: '340px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#dc2626', textAlign: 'center' }}>
              {lang === 'en' ? 'Parental Gate' : '家长锁'}
            </h3>
            <p style={{ fontSize: '0.95rem', color: '#64748b', marginBottom: '20px', textAlign: 'center' }}>
              {lang === 'en' ? 'Please solve this to continue:' : '请完成乘法计算以继续：'}
            </p>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1e293b', textAlign: 'center', marginBottom: '20px' }}>
              {parentGateProblem?.num1} × {parentGateProblem?.num2} = ?
            </div>
            <input 
              type="number" 
              autoFocus
              value={parentGateInput}
              onChange={e => setParentGateInput(e.target.value)}
              style={{
                width: '100%', padding: '12px', fontSize: '1.2rem', borderRadius: '12px',
                border: '2px solid #cbd5e1', marginBottom: '20px', textAlign: 'center'
              }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => { audioSynth.playClick(); setShowParentGate(false); }}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#e2e8f0', color: '#475569', fontWeight: 'bold' }}
              >
                {lang === 'en' ? 'Cancel' : '取消'}
              </button>
              <button 
                onClick={() => {
                  if (parseInt(parentGateInput, 10) === parentGateProblem?.ans) {
                    audioSynth.playCorrect();
                    setShowParentGate(false);
                    setShowSettings(true);
                  } else {
                    audioSynth.playIncorrect();
                    setIsParentGateShaking(true);
                    setParentGateInput('');
                    setTimeout(() => setIsParentGateShaking(false), 500);
                  }
                }}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#dc2626', color: 'white', fontWeight: 'bold' }}
              >
                {lang === 'en' ? 'Verify' : '验证'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

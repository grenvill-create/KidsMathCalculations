import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Clock, Star, Play, MinusCircle, ListTree } from 'lucide-react';
import { audioSynth } from '../utils/audioSynth';

const ROWS = 6;
const COLS = 5;
const CELL_SIZE = 65;
const BUBBLE_SIZE = 55;

// Ocean/Sky cool tones for Subtraction game
const BUBBLE_COLORS = [
  '#93c5fd', // 1 light blue
  '#60a5fa', // 2 blue
  '#3b82f6', // 3 strong blue
  '#a78bfa', // 4 purple
  '#8b5cf6', // 5 strong purple
  '#34d399', // 6 emerald
  '#10b981', // 7 green
  '#f472b6', // 8 pink
  '#fb923c'  // 9 orange
];

const randomValue = () => Math.floor(Math.random() * 9) + 1;
const generateId = () => Math.random().toString(36).substr(2, 9);

function hasPossibleMatchTarget(grid, targetDiff) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const val = grid[r][c]?.val;
      if (!val) continue;
      if (c < COLS - 1 && grid[r][c + 1] && Math.abs(val - grid[r][c + 1].val) === targetDiff) return true;
      if (r < ROWS - 1 && grid[r + 1][c] && Math.abs(val - grid[r + 1][c].val) === targetDiff) return true;
    }
  }
  return false;
}

function hasPossibleMatchEquation(grid) {
  // We need to find A - B = C in adjacent cells
  // We'll just check simple horizontal and vertical triplets for existence
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const val = grid[r][c]?.val;
      if (!val) continue;
      
      // Horizontal right
      if (c < COLS - 2 && grid[r][c+1] && grid[r][c+2]) {
         if (val - grid[r][c+1].val === grid[r][c+2].val) return true;
      }
      // Horizontal left
      if (c > 1 && grid[r][c-1] && grid[r][c-2]) {
         if (val - grid[r][c-1].val === grid[r][c-2].val) return true;
      }
      // Vertical down
      if (r < ROWS - 2 && grid[r+1][c] && grid[r+2][c]) {
         if (val - grid[r+1][c].val === grid[r+2][c].val) return true;
      }
      // Vertical up
      if (r > 1 && grid[r-1][c] && grid[r-2][c]) {
         if (val - grid[r-1][c].val === grid[r-2][c].val) return true;
      }
    }
  }
  return false;
}

function generateBoard(mode, targetDiff) {
  let grid = Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
  let bubbles = [];

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const b = { id: generateId(), r, c, val: randomValue(), popping: false };
      grid[r][c] = b;
      bubbles.push(b);
    }
  }

  // Guarantee match
  if (mode === 'target') {
    if (!hasPossibleMatchTarget(grid, targetDiff)) {
      const start = Math.floor(Math.random() * (9 - targetDiff)) + 1;
      bubbles[0].val = start + targetDiff;
      bubbles[1].val = start;
    }
  } else {
    if (!hasPossibleMatchEquation(grid)) {
      bubbles[0].val = 8;
      bubbles[1].val = 5;
      bubbles[2].val = 3;
    }
  }

  return bubbles;
}

function applyGravity(bubbles, poppedIds, mode, targetDiff) {
  const remaining = bubbles.filter(b => !poppedIds.includes(b.id));
  const cols = Array.from({ length: COLS }, () => []);
  remaining.forEach(b => cols[b.c].push(b));
  cols.forEach(col => col.sort((a, b) => b.r - a.r));

  const newBubbles = [];
  let grid = Array(ROWS).fill(null).map(() => Array(COLS).fill(null));

  for (let c = 0; c < COLS; c++) {
    let currentRow = ROWS - 1;
    for (const b of cols[c]) {
      const updatedBubble = { ...b, r: currentRow };
      newBubbles.push(updatedBubble);
      grid[currentRow][c] = updatedBubble;
      currentRow--;
    }
    while (currentRow >= 0) {
      const newB = { id: generateId(), r: currentRow, c, val: randomValue(), popping: false };
      newBubbles.push(newB);
      grid[currentRow][c] = newB;
      currentRow--;
    }
  }

  // Ensure match exists
  let attempts = 0;
  if (mode === 'target') {
    while (!hasPossibleMatchTarget(grid, targetDiff) && attempts < 20) {
      newBubbles.forEach(b => b.val = randomValue());
      newBubbles.forEach(b => { grid[b.r][b.c] = b; });
      attempts++;
    }
  } else {
    while (!hasPossibleMatchEquation(grid) && attempts < 20) {
      newBubbles.forEach(b => b.val = randomValue());
      newBubbles.forEach(b => { grid[b.r][b.c] = b; });
      attempts++;
    }
  }

  return newBubbles;
}

export default function SubPopGame({ lang, onBack }) {
  const [mode, setMode] = useState('target'); // 'target' | 'equation'
  const [targetDiff, setTargetDiff] = useState(2);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameState, setGameState] = useState('playing'); // playing | won | lost

  const [bubbles, setBubbles] = useState(() => generateBoard(mode, targetDiff));
  const [selIds, setSelIds] = useState([]);
  const [shake, setShake] = useState(false);

  const goalScore = round * 100;

  // Timer
  useEffect(() => {
    if (gameState !== 'playing') return;
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(interval);
          setGameState('lost');
          audioSynth.playIncorrect();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState]);

  const switchMode = (newMode) => {
    if (gameState !== 'playing') return;
    audioSynth.playClick();
    setMode(newMode);
    let newTarget = targetDiff;
    if (newMode === 'target') {
        newTarget = Math.floor(Math.random() * 5) + 1; // 1 to 5
        setTargetDiff(newTarget);
    }
    setBubbles(generateBoard(newMode, newTarget));
    setSelIds([]);
    setScore(0);
    setTimeLeft(60);
    setRound(1);
  };

  const handleBubbleClick = (clickedBubble) => {
    if (gameState !== 'playing' || clickedBubble.popping) return;

    const currentSels = [...selIds];

    // Deselect if already selected
    if (currentSels.includes(clickedBubble.id)) {
      audioSynth.playClick();
      setSelIds(currentSels.filter(id => id !== clickedBubble.id));
      return;
    }

    // Check adjacency with the LAST selected bubble
    if (currentSels.length > 0) {
      const lastId = currentSels[currentSels.length - 1];
      const lastBubble = bubbles.find(b => b.id === lastId);
      const isAdjacent = Math.abs(lastBubble.r - clickedBubble.r) + Math.abs(lastBubble.c - clickedBubble.c) === 1;
      
      if (!isAdjacent) {
        audioSynth.playClick();
        setSelIds([clickedBubble.id]); // Reset selection to the new one
        return;
      }
    }

    audioSynth.playClick();
    const newSels = [...currentSels, clickedBubble.id];
    
    // Evaluate logic based on mode
    if (mode === 'target') {
      if (newSels.length === 2) {
        const b1 = bubbles.find(b => b.id === newSels[0]);
        const b2 = bubbles.find(b => b.id === newSels[1]);
        
        if (Math.abs(b1.val - b2.val) === targetDiff) {
            handleMatch(newSels);
        } else {
            handleMismatch();
        }
      } else {
        setSelIds(newSels);
      }
    } else if (mode === 'equation') {
      if (newSels.length === 3) {
        const b1 = bubbles.find(b => b.id === newSels[0]);
        const b2 = bubbles.find(b => b.id === newSels[1]);
        const b3 = bubbles.find(b => b.id === newSels[2]);
        
        if (b1.val - b2.val === b3.val) {
            handleMatch(newSels);
        } else {
            handleMismatch();
        }
      } else {
        setSelIds(newSels);
      }
    }
  };

  const handleMatch = (matchedIds) => {
      audioSynth.playCorrect();
      setSelIds([]);
      setBubbles(prev => prev.map(b => matchedIds.includes(b.id) ? { ...b, popping: true } : b));
      
      let won = false;
      const points = mode === 'target' ? 10 : 20; // More points for equation
      
      setScore(s => {
        const newScore = s + points;
        if (newScore >= goalScore) won = true;
        return newScore;
      });

      setTimeout(() => {
        if (won) {
          setGameState('won');
          audioSynth.playWin();
        } else {
          setBubbles(prev => applyGravity(prev, matchedIds, mode, targetDiff));
        }
      }, 300);
  };

  const handleMismatch = () => {
      audioSynth.playIncorrect();
      setSelIds([]);
      setShake(true);
      setTimeout(() => setShake(false), 400);
  };

  const startNextRound = () => {
    setRound(r => r + 1);
    setTimeLeft(t => t + 40);
    if (mode === 'target') {
        setTargetDiff(Math.floor(Math.random() * 5) + 1);
    }
    setBubbles(generateBoard(mode, targetDiff)); // targetDiff might be old here, it's fine, next render loop uses new
    setSelIds([]);
    setGameState('playing');
  };

  // Helper effect to cleanly regen board when targetDiff changes (if next round triggered it)
  useEffect(() => {
      if (gameState === 'playing' && score === 0 && round > 1) {
           setBubbles(generateBoard(mode, targetDiff));
      }
  }, [targetDiff]);

  const restartGame = () => {
    setRound(1);
    setScore(0);
    setTimeLeft(60);
    setBubbles(generateBoard(mode, targetDiff));
    setSelIds([]);
    setGameState('playing');
  };

  return (
    <div className="screen-wrapper fade-in" style={{ padding: '20px', overflowY: 'auto' }}>
      <style>{`
        .subpop-board {
          position: relative;
          box-sizing: content-box;
          width: ${COLS * CELL_SIZE}px;
          height: ${ROWS * CELL_SIZE}px;
          background: rgba(255,255,255,0.7);
          border-radius: 16px;
          border: 4px solid #cbd5e1;
          overflow: hidden;
          margin: 15px auto;
        }
        .bubble-sp {
          position: absolute;
          width: ${BUBBLE_SIZE}px;
          height: ${BUBBLE_SIZE}px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 800;
          color: white;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: inset -4px -4px 10px rgba(0,0,0,0.15), 0 4px 6px rgba(0,0,0,0.1);
          user-select: none;
        }
        .bubble-sp::after {
          content: '';
          position: absolute;
          top: 15%;
          left: 20%;
          width: 30%;
          height: 30%;
          background: rgba(255,255,255,0.4);
          border-radius: 50%;
        }
        .bubble-sp.selected {
          transform: scale(1.15);
          box-shadow: 0 0 0 4px white, 0 0 15px rgba(0,0,0,0.2);
          z-index: 10;
        }
        .bubble-sp.selected-1 {
          border: 3px solid #fef08a;
        }
        .bubble-sp.selected-2 {
          border: 3px solid #4ade80;
        }
        .bubble-sp.selected-3 {
          border: 3px solid #60a5fa;
        }
        .bubble-sp.popping {
          transform: scale(0);
          opacity: 0;
        }
        @keyframes shake-sp {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
        .shake-board-sp {
          animation: shake-sp 0.4s ease-in-out;
        }
        .mode-btn {
          flex: 1; padding: 10px; border-radius: 12px; font-weight: 700; border: none; cursor: pointer; transition: all 0.2s;
        }
        .mode-btn.active {
          background: #3b82f6; color: white; box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3);
        }
        .mode-btn.inactive {
          background: #e2e8f0; color: #64748b;
        }
      `}</style>

      <div className="card-shadow" style={{
        width: '100%', maxWidth: '500px', margin: '0 auto',
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)',
        padding: '24px', borderRadius: '24px'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
          <button className="bouncy-button secondary" onClick={onBack} style={{ padding: '8px 12px' }}>
            <ArrowLeft size={20}/>
          </button>
          
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>
              <span>{lang === 'en' ? `Round ${round}` : `第 ${round} 关`}</span>
              <span>{score} / {goalScore}</span>
            </div>
            <div style={{ background: '#f1f5f9', borderRadius: '99px', height: '10px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'linear-gradient(90deg, #60a5fa, #3b82f6)', width: `${Math.min(100, (score/goalScore)*100)}%`, transition: 'width 0.3s ease' }} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: timeLeft <= 10 ? '#fef2f2' : '#eff6ff', padding: '8px 14px', borderRadius: '20px', fontWeight: 800, color: timeLeft <= 10 ? '#ef4444' : '#3b82f6' }}>
            <Clock size={16}/>
            {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
          </div>
        </div>

        {/* Mode Toggles */}
        {gameState === 'playing' && (
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <button className={`mode-btn ${mode === 'target' ? 'active' : 'inactive'}`} onClick={() => switchMode('target')}>
               <MinusCircle size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
               {lang === 'en' ? 'Target Diff' : '目标差法'}
            </button>
            <button className={`mode-btn ${mode === 'equation' ? 'active' : 'inactive'}`} onClick={() => switchMode('equation')}>
               <ListTree size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
               {lang === 'en' ? 'Equation' : '算式消除'}
            </button>
          </div>
        )}

        {/* Game Area */}
        {gameState === 'playing' && (
          <>
            <div style={{ textAlign: 'center', background: '#eff6ff', borderRadius: '12px', padding: '10px', color: '#1e40af', fontWeight: 800 }}>
              {mode === 'target' ? (
                  <>🎯 {lang === 'en' ? `Find 2 bubbles with difference of ` : `找出相差为 `} <span style={{ fontSize: '1.4rem', color: '#dc2626' }}>{targetDiff}</span> {lang === 'en' ? '' : '的两个气泡'}</>
              ) : (
                  <>🧮 {lang === 'en' ? `Click 3 bubbles to form A - B = C` : `连按 3 个气泡组成 被减数 - 减数 = 差`}</>
              )}
            </div>
            
            <div className={`subpop-board ${shake ? 'shake-board-sp' : ''}`}>
              {bubbles.map(b => {
                const selIndex = selIds.indexOf(b.id);
                const isSelected = selIndex !== -1;
                const orderClass = isSelected ? `selected-${selIndex + 1}` : '';
                return (
                    <div key={b.id}
                        className={`bubble-sp ${isSelected ? 'selected' : ''} ${orderClass} ${b.popping ? 'popping' : ''}`}
                        style={{
                        background: BUBBLE_COLORS[b.val - 1],
                        left: b.c * CELL_SIZE + (CELL_SIZE - BUBBLE_SIZE) / 2,
                        top: b.r * CELL_SIZE + (CELL_SIZE - BUBBLE_SIZE) / 2,
                        }}
                        onClick={() => handleBubbleClick(b)}>
                    {b.val}
                    </div>
                );
              })}
            </div>
          </>
        )}

        {/* Win Screen */}
        {gameState === 'won' && (
          <div className="bounce-in" style={{ textAlign: 'center', padding: '40px 20px', background: '#f0fdf4', borderRadius: '20px', border: '3px solid #86efac', margin: '20px 0' }}>
            <div style={{ fontSize: '4rem', marginBottom: '10px' }}>🌟</div>
            <h2 style={{ color: '#166534', margin: '0 0 10px 0' }}>
              {lang === 'en' ? `Round ${round} Cleared!` : `第 ${round} 关通过！`}
            </h2>
            <p style={{ color: '#15803d', fontWeight: 700 }}>
              {lang === 'en' ? '+40 seconds bonus!' : '+40秒奖励时间！'}
            </p>
            <button className="bouncy-button primary" onClick={startNextRound} style={{ marginTop: '20px', padding: '14px 30px', fontSize: '1.1rem' }}>
              <Play size={20} style={{ marginRight: '8px' }}/>
              {lang === 'en' ? 'Next Round' : '下一关'}
            </button>
          </div>
        )}

        {/* Lose Screen */}
        {gameState === 'lost' && (
          <div className="bounce-in" style={{ textAlign: 'center', padding: '40px 20px', background: '#fef2f2', borderRadius: '20px', border: '3px solid #fca5a5', margin: '20px 0' }}>
            <div style={{ fontSize: '4rem', marginBottom: '10px' }}>⏰</div>
            <h2 style={{ color: '#991b1b', margin: '0 0 10px 0' }}>
              {lang === 'en' ? "Time's Up!" : '时间到了！'}
            </h2>
            <button className="bouncy-button primary" onClick={restartGame} style={{ marginTop: '20px', padding: '14px 30px', fontSize: '1.1rem', background: '#ef4444' }}>
              <RefreshCw size={20} style={{ marginRight: '8px' }}/>
              {lang === 'en' ? 'Try Again' : '再试一次'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

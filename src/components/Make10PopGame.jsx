import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Clock, Star, Play } from 'lucide-react';
import { audioSynth } from '../utils/audioSynth';

const ROWS = 6;
const COLS = 5;
const CELL_SIZE = 65;
const BUBBLE_SIZE = 55;

const BUBBLE_COLORS = [
  '#f87171', // 1
  '#fb923c', // 2
  '#fbbf24', // 3
  '#a3e635', // 4
  '#34d399', // 5
  '#22d3ee', // 6
  '#60a5fa', // 7
  '#a78bfa', // 8
  '#f472b6'  // 9
];

const randomValue = () => Math.floor(Math.random() * 9) + 1;
const generateId = () => Math.random().toString(36).substr(2, 9);

function hasPossibleMatch(grid) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const val = grid[r][c]?.val;
      if (!val) continue;
      // check right
      if (c < COLS - 1 && grid[r][c + 1] && val + grid[r][c + 1].val === 10) return true;
      // check down
      if (r < ROWS - 1 && grid[r + 1][c] && val + grid[r + 1][c].val === 10) return true;
    }
  }
  return false;
}

function generateBoard() {
  let grid = Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
  let bubbles = [];

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const b = { id: generateId(), r, c, val: randomValue(), popping: false };
      grid[r][c] = b;
      bubbles.push(b);
    }
  }

  // Guarantee at least one match
  if (!hasPossibleMatch(grid)) {
    bubbles[0].val = 4;
    bubbles[1].val = 6;
  }

  return bubbles;
}

function applyGravity(bubbles, poppedIds) {
  // 1. Remove popped bubbles
  const remaining = bubbles.filter(b => !poppedIds.includes(b.id));

  // 2. Group by column
  const cols = Array.from({ length: COLS }, () => []);
  remaining.forEach(b => cols[b.c].push(b));

  // 3. Sort by row (bottom first, i.e. highest r value)
  cols.forEach(col => col.sort((a, b) => b.r - a.r));

  // 4. Re-assign rows and spawn new
  const newBubbles = [];
  let grid = Array(ROWS).fill(null).map(() => Array(COLS).fill(null));

  for (let c = 0; c < COLS; c++) {
    let currentRow = ROWS - 1;

    // Existing bubbles fall down
    for (const b of cols[c]) {
      const updatedBubble = { ...b, r: currentRow };
      newBubbles.push(updatedBubble);
      grid[currentRow][c] = updatedBubble;
      currentRow--;
    }

    // Spawn new bubbles at top
    while (currentRow >= 0) {
      const newB = { id: generateId(), r: currentRow, c, val: randomValue(), popping: false };
      newBubbles.push(newB);
      grid[currentRow][c] = newB;
      currentRow--;
    }
  }

  // 5. Ensure match exists
  let attempts = 0;
  while (!hasPossibleMatch(grid) && attempts < 20) {
    newBubbles.forEach(b => b.val = randomValue());
    // Update grid with new values
    newBubbles.forEach(b => { grid[b.r][b.c] = b; });
    attempts++;
  }

  return newBubbles;
}

export default function Make10PopGame({ lang, onBack }) {
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameState, setGameState] = useState('playing'); // playing | won | lost

  const [bubbles, setBubbles] = useState(() => generateBoard());
  const [selIds, setSelIds] = useState([]);
  const [shake, setShake] = useState(false);

  const targetScore = round * 100;

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

  const handleBubbleClick = (clickedBubble) => {
    if (gameState !== 'playing' || clickedBubble.popping) return;

    if (selIds.length === 0) {
      audioSynth.playClick();
      setSelIds([clickedBubble.id]);
      return;
    }

    const firstId = selIds[0];
    if (firstId === clickedBubble.id) {
      // Deselect
      audioSynth.playClick();
      setSelIds([]);
      return;
    }

    const b1 = bubbles.find(b => b.id === firstId);
    const b2 = clickedBubble;

    // Check adjacency
    const isAdjacent = Math.abs(b1.r - b2.r) + Math.abs(b1.c - b2.c) === 1;
    if (!isAdjacent) {
      audioSynth.playClick();
      setSelIds([clickedBubble.id]);
      return;
    }

    // Check sum
    if (b1.val + b2.val === 10) {
      audioSynth.playCorrect();
      setSelIds([]);

      // Mark as popping
      setBubbles(prev => prev.map(b => (b.id === b1.id || b.id === b2.id) ? { ...b, popping: true } : b));

      // Update score and check win
      let won = false;
      setScore(s => {
        const newScore = s + 10;
        if (newScore >= targetScore) won = true;
        return newScore;
      });

      // Apply gravity after animation
      setTimeout(() => {
        if (won) {
          setGameState('won');
          audioSynth.playWin();
        } else {
          setBubbles(prev => applyGravity(prev, [b1.id, b2.id]));
        }
      }, 300);

    } else {
      // Wrong match
      audioSynth.playIncorrect();
      setSelIds([]);
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
  };

  const startNextRound = () => {
    setRound(r => r + 1);
    setTimeLeft(t => t + 40); // Bonus time
    setBubbles(generateBoard());
    setSelIds([]);
    setGameState('playing');
  };

  const restartGame = () => {
    setRound(1);
    setScore(0);
    setTimeLeft(60);
    setBubbles(generateBoard());
    setSelIds([]);
    setGameState('playing');
  };

  return (
    <div className="screen-wrapper fade-in" style={{ padding: '20px', overflowY: 'auto' }}>
      <style>{`
        .make10-board {
          position: relative;
          box-sizing: content-box;
          width: ${COLS * CELL_SIZE}px;
          height: ${ROWS * CELL_SIZE}px;
          background: rgba(255,255,255,0.6);
          border-radius: 16px;
          border: 4px solid #e2e8f0;
          overflow: hidden;
          margin: 20px auto;
        }
        .bubble {
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
        .bubble::after {
          content: '';
          position: absolute;
          top: 15%;
          left: 20%;
          width: 30%;
          height: 30%;
          background: rgba(255,255,255,0.4);
          border-radius: 50%;
        }
        .bubble.selected {
          transform: scale(1.15);
          box-shadow: 0 0 0 4px white, 0 0 15px rgba(0,0,0,0.2);
          z-index: 10;
        }
        .bubble.popping {
          transform: scale(0);
          opacity: 0;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
        .shake-board {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>

      <div className="card-shadow" style={{
        width: '100%', maxWidth: '500px', margin: '0 auto',
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)',
        padding: '24px', borderRadius: '24px'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
          <button className="bouncy-button secondary" onClick={onBack} style={{ padding: '8px 12px' }}>
            <ArrowLeft size={20}/>
          </button>
          
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>
              <span>{lang === 'en' ? `Round ${round}` : `第 ${round} 关`}</span>
              <span>{score} / {targetScore}</span>
            </div>
            <div style={{ background: '#f1f5f9', borderRadius: '99px', height: '10px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'linear-gradient(90deg, #f87171, #ef4444)', width: `${Math.min(100, (score/targetScore)*100)}%`, transition: 'width 0.3s ease' }} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: timeLeft <= 10 ? '#fef2f2' : '#eff6ff', padding: '8px 14px', borderRadius: '20px', fontWeight: 800, color: timeLeft <= 10 ? '#ef4444' : '#3b82f6' }}>
            <Clock size={16}/>
            {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
          </div>
        </div>

        {/* Game Area */}
        {gameState === 'playing' && (
          <>
            <p style={{ textAlign: 'center', color: '#64748b', fontWeight: 700, margin: 0, fontSize: '0.95rem' }}>
              {lang === 'en' ? 'Click adjacent bubbles that sum to 10!' : '点击相邻的两个气泡，让它们相加等于10！'}
            </p>
            
            <div className={`make10-board ${shake ? 'shake-board' : ''}`}>
              {bubbles.map(b => (
                <div key={b.id}
                     className={`bubble ${selIds.includes(b.id) ? 'selected' : ''} ${b.popping ? 'popping' : ''}`}
                     style={{
                       background: BUBBLE_COLORS[b.val - 1],
                       left: b.c * CELL_SIZE + (CELL_SIZE - BUBBLE_SIZE) / 2,
                       top: b.r * CELL_SIZE + (CELL_SIZE - BUBBLE_SIZE) / 2,
                     }}
                     onClick={() => handleBubbleClick(b)}>
                  {b.val}
                </div>
              ))}
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

        {/* Restart Button */}
        {gameState === 'playing' && (
          <button className="bouncy-button secondary" onClick={restartGame} style={{ width: '100%', padding: '12px' }}>
            <RefreshCw size={18} style={{ marginRight: '8px' }}/>
            {lang === 'en' ? 'Restart Game' : '重新开始'}
          </button>
        )}

      </div>
    </div>
  );
}

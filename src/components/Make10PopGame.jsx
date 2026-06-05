import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RefreshCw, Star, Clock } from 'lucide-react';
import { audioSynth } from '../utils/audioSynth';

const ROWS = 6;
const COLS = 5;
const CELL_SIZE = 60; // Size of each grid cell
const BUBBLE_SIZE = 50; // Size of the bubble itself

// Helper to generate a random number 1-9
const randNum = () => Math.floor(Math.random() * 9) + 1;

// Helper to generate a unique ID
const genId = () => Math.random().toString(36).substr(2, 9);

export default function Make10PopGame({ lang, onBack }) {
  const [bubbles, setBubbles] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameState, setGameState] = useState('playing'); // 'playing', 'gameover', 'roundComplete'
  const [isShaking, setIsShaking] = useState(false);
  const [combo, setCombo] = useState(0);
  const [round, setRound] = useState(1);
  const targetScore = round * 100;

  // Initialize board
  useEffect(() => {
    initBoard();
  }, []);

  // Timer logic
  useEffect(() => {
    if (gameState !== 'playing') return;
    if (timeLeft <= 0) {
      setGameState('gameover');
      audioSynth.playWin();
      return;
    }
    
    // Check round complete
    if (score >= targetScore) {
      setGameState('roundComplete');
      audioSynth.playWin();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, gameState, score, targetScore]);

  const initBoard = (fullReset = true) => {
    let initialBubbles = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        initialBubbles.push({
          id: genId(),
          r,
          c,
          num: randNum(),
          isPopping: false
        });
      }
    }
    // Ensure there's at least one match
    if (!hasMatch(initialBubbles)) {
      initialBubbles[0].num = 3;
      initialBubbles[1].num = 7;
    }
    setBubbles(initialBubbles);
    
    if (fullReset) {
      setScore(0);
      setTimeLeft(60);
      setRound(1);
    }
    setGameState('playing');
    setSelectedIds([]);
    setCombo(0);
  };

  const nextRound = () => {
    setRound(r => r + 1);
    setTimeLeft(prev => prev + 45); // Bonus time!
    initBoard(false);
  };

  const hasMatch = (bList) => {
    const map = Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
    bList.forEach(b => {
      if (!b.isPopping) map[b.r][b.c] = b;
    });

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const b = map[r][c];
        if (!b) continue;
        // Check right
        if (c < COLS - 1 && map[r][c+1] && b.num + map[r][c+1].num === 10) return true;
        // Check down
        if (r < ROWS - 1 && map[r+1][c] && b.num + map[r+1][c].num === 10) return true;
      }
    }
    return false;
  };

  const isAdjacent = (b1, b2) => {
    const dr = Math.abs(b1.r - b2.r);
    const dc = Math.abs(b1.c - b2.c);
    return (dr === 1 && dc === 0) || (dr === 0 && dc === 1);
  };

  const handleBubbleClick = (clickedBubble) => {
    if (gameState !== 'playing') return;
    if (clickedBubble.isPopping) return;

    audioSynth.playClick();

    // Deselect if already selected
    if (selectedIds.includes(clickedBubble.id)) {
      setSelectedIds(selectedIds.filter(id => id !== clickedBubble.id));
      return;
    }

    const newSelected = [...selectedIds, clickedBubble.id];
    
    if (newSelected.length === 1) {
      setSelectedIds(newSelected);
      return;
    }

    if (newSelected.length === 2) {
      const b1 = bubbles.find(b => b.id === newSelected[0]);
      const b2 = clickedBubble;

      // Check adjacency
      if (!isAdjacent(b1, b2)) {
        // If not adjacent, just select the new one instead
        setSelectedIds([b2.id]);
        return;
      }

      // Check sum
      if (b1.num + b2.num === 10) {
        // MATCH!
        audioSynth.playCorrect();
        
        // 1. Mark as popping
        setBubbles(prev => prev.map(b => 
          newSelected.includes(b.id) ? { ...b, isPopping: true } : b
        ));
        setSelectedIds([]);
        setScore(s => s + 10 + combo * 2);
        setCombo(c => c + 1);

        // 2. Wait for animation, then remove and apply gravity
        setTimeout(() => {
          applyGravityAndRefill(newSelected);
        }, 300);

      } else {
        // NO MATCH
        audioSynth.playIncorrect();
        setIsShaking(true);
        setCombo(0);
        setTimeout(() => {
          setIsShaking(false);
          setSelectedIds([]);
        }, 400);
      }
    }
  };

  const applyGravityAndRefill = (poppedIds) => {
    setBubbles(prev => {
      // Filter out popped
      let remaining = prev.filter(b => !poppedIds.includes(b.id));
      
      // Group by column
      let columns = Array(COLS).fill(null).map(() => []);
      remaining.forEach(b => {
        columns[b.c].push(b);
      });

      // Sort each column by row (bottom to top)
      columns.forEach(col => col.sort((a, b) => b.r - a.r));

      let nextBubbles = [];

      // Apply gravity
      for (let c = 0; c < COLS; c++) {
        let col = columns[c];
        let currentR = ROWS - 1; // start from bottom
        
        for (let i = 0; i < col.length; i++) {
          col[i].r = currentR; // fall down
          nextBubbles.push(col[i]);
          currentR--;
        }
        
        // Refill top
        while (currentR >= 0) {
          nextBubbles.push({
            id: genId(),
            r: currentR, 
            c: c,
            num: randNum(),
            isPopping: false
          });
          currentR--;
        }
      }

      // Check for deadlock after next tick
      setTimeout(() => {
        setBubbles(latest => {
          let newBubbles = [...latest];
          let attempts = 0;
          while (!hasMatch(newBubbles) && attempts < 20) {
            newBubbles = newBubbles.map(b => ({ ...b, num: randNum() }));
            attempts++;
          }
          if (!hasMatch(newBubbles)) {
            newBubbles[0].num = 3;
            newBubbles[1].num = 7;
          }
          return newBubbles;
        });
      }, 350);

      return nextBubbles;
    });
  };

  const getBubbleColor = (num) => {
    // Soft pastel-ish but still cute and vivid colors for children
    const colors = [
      '#f87171', // soft red (1)
      '#fb923c', // soft orange (2)
      '#fbbf24', // soft amber (3)
      '#a3e635', // soft lime (4)
      '#34d399', // soft emerald (5)
      '#22d3ee', // soft cyan (6)
      '#60a5fa', // soft blue (7)
      '#a78bfa', // soft violet (8)
      '#f472b6', // soft pink (9)
    ];
    return colors[num - 1] || '#60a5fa';
  };

  return (
    <div className="screen-wrapper fade-in" style={{ padding: '20px', overflowY: 'auto' }}>
      <style>
        {`
          .bubble-grid {
            position: relative;
            width: ${COLS * CELL_SIZE}px;
            height: ${ROWS * CELL_SIZE}px;
            background: rgba(255,255,255,0.5);
            border-radius: 16px;
            border: 4px solid #e2e8f0;
            overflow: hidden;
            margin: 0 auto;
          }
          .bubble {
            position: absolute;
            width: ${BUBBLE_SIZE}px;
            height: ${BUBBLE_SIZE}px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: 800;
            color: white;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            box-shadow: inset -4px -4px 10px rgba(0,0,0,0.2), 0 4px 6px rgba(0,0,0,0.1);
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
            box-shadow: 0 0 0 4px white, 0 0 15px rgba(255,255,255,0.8);
            z-index: 10;
          }
          .bubble.popping {
            transform: scale(0);
            opacity: 0;
          }
          @keyframes popShake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }
          .shake-board {
            animation: popShake 0.4s ease-in-out;
          }
        `}
      </style>

      <div className="card-shadow" style={{ width: '100%', maxWidth: '500px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <button className="bouncy-button secondary" onClick={onBack} style={{ padding: '8px 12px' }}>
            <ArrowLeft size={20} />
          </button>
          
          {/* Progress bar to target score */}
          <div style={{ flex: 1, margin: '0 15px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: '#6b7280' }}>
               <span>{lang === 'en' ? `Round ${round}` : `第 ${round} 关`}</span>
               <span>{score} / {targetScore}</span>
             </div>
             <div style={{ background: '#f1f5f9', borderRadius: '99px', height: '8px', overflow: 'hidden' }}>
               <div style={{ 
                 height: '100%', 
                 background: 'linear-gradient(90deg, #f87171, #ef4444)', 
                 width: `${Math.min(100, (score / targetScore) * 100)}%`,
                 transition: 'width 0.3s'
               }} />
             </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: timeLeft <= 10 ? '#fecaca' : '#e0e7ff', padding: '6px 12px', borderRadius: '20px', fontWeight: 'bold', color: timeLeft <= 10 ? '#991b1b' : '#3730a3' }}>
              <Clock size={18} />
              00:{timeLeft.toString().padStart(2, '0')}
            </div>
          </div>
        </div>

        {gameState === 'playing' ? (
          <>
            <p style={{ color: '#4b5563', marginBottom: '16px', fontWeight: 'bold' }}>
              {lang === 'en' ? 'Connect two adjacent bubbles that add up to 10!' : '点击两个相邻的气泡，让它们相加等于10！'}
            </p>
            <div className={`bubble-grid ${isShaking ? 'shake-board' : ''}`}>
              {bubbles.map(b => (
                <div
                  key={b.id}
                  className={`bubble ${selectedIds.includes(b.id) ? 'selected' : ''} ${b.isPopping ? 'popping' : ''}`}
                  style={{
                    backgroundColor: getBubbleColor(b.num),
                    left: b.c * CELL_SIZE + (CELL_SIZE - BUBBLE_SIZE) / 2,
                    top: b.r * CELL_SIZE + (CELL_SIZE - BUBBLE_SIZE) / 2,
                  }}
                  onClick={() => handleBubbleClick(b)}
                >
                  {b.num}
                </div>
              ))}
            </div>
          </>
        ) : gameState === 'roundComplete' ? (
          <div className="bounce-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0' }}>
            <h1 style={{ fontSize: '3rem', margin: '0 0 10px 0' }}>🎉</h1>
            <h2 style={{ color: '#059669', margin: '0 0 10px 0' }}>{lang === 'en' ? `Round ${round} Cleared!` : `第 ${round} 关完成！`}</h2>
            <div style={{ fontSize: '1.2rem', marginBottom: '30px', color: '#4b5563', textAlign: 'center' }}>
              {lang === 'en' ? 'Great job! Get ready for the next level!' : '太棒啦！准备好迎接下一关吧！'}<br/>
              <span style={{ color: '#ca8a04', fontWeight: 'bold', fontSize: '1.4rem' }}>+{45}s</span>
            </div>
            <button className="bouncy-button primary" onClick={nextRound} style={{ padding: '12px 30px', fontSize: '1.2rem', background: 'linear-gradient(135deg, #34d399, #10b981)', borderColor: '#059669' }}>
              {lang === 'en' ? 'Next Round' : '下一关'}
            </button>
          </div>
        ) : (
          <div className="bounce-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0' }}>
            <h1 style={{ fontSize: '3rem', margin: '0 0 10px 0' }}>⏰</h1>
            <h2 style={{ color: '#c0487a', margin: '0 0 20px 0' }}>{lang === 'en' ? 'Time\'s Up!' : '时间到！'}</h2>
            <div style={{ fontSize: '1.5rem', marginBottom: '30px', color: '#4b5563' }}>
              {lang === 'en' ? 'Score: ' : '最终得分：'} <span style={{ color: '#ca8a04', fontWeight: 'bold', fontSize: '2rem' }}>{score}</span>
            </div>
            <button className="bouncy-button primary" onClick={() => initBoard(true)} style={{ padding: '12px 30px', fontSize: '1.2rem' }}>
              <RefreshCw size={20} style={{ marginRight: '8px' }} />
              {lang === 'en' ? 'Play Again' : '再玩一次'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

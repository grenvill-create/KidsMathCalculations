import React, { useState, useEffect } from 'react';
import { RefreshCw, ArrowLeft, Check } from 'lucide-react';
import { audioSynth } from '../utils/audioSynth';
import { t } from '../utils/translations';

// Simple pixel art patterns (half of the image)
const PATTERNS = [
  {
    name: 'heart',
    grid: [
      [0, 1, 1, 0, 0],
      [1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1],
      [0, 0, 1, 1, 1],
      [0, 0, 0, 1, 1]
    ]
  },
  {
    name: 'butterfly',
    grid: [
      [1, 0, 0, 0, 1],
      [1, 1, 0, 1, 1],
      [0, 1, 1, 1, 0],
      [1, 1, 0, 1, 1],
      [1, 0, 0, 0, 1]
    ]
  },
  {
    name: 'house',
    grid: [
      [0, 0, 1, 0, 0],
      [0, 1, 1, 1, 0],
      [1, 1, 1, 1, 1],
      [0, 1, 1, 1, 0],
      [0, 1, 1, 1, 0]
    ]
  }
];

export default function SymmetryGame({ lang, onBack }) {
  const [level, setLevel] = useState(0);
  const [userGrid, setUserGrid] = useState([]);
  const [isSolved, setIsSolved] = useState(false);
  const [cellSize, setCellSize] = useState(40);

  useEffect(() => {
    const updateSize = () => {
      const w = window.innerWidth;
      let size = Math.floor((w - 100) / 10);
      if (size > 40) size = 40;
      if (size < 15) size = 15;
      setCellSize(size);
    };
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const currentPattern = PATTERNS[level];

  // Initialize empty right grid (mirror of the left)
  const initGrid = () => {
    const rows = currentPattern.grid.length;
    const cols = currentPattern.grid[0].length;
    // Create an empty grid of the same dimensions
    const newGrid = Array(rows).fill().map(() => Array(cols).fill(0));
    setUserGrid(newGrid);
    setIsSolved(false);
  };

  useEffect(() => {
    initGrid();
  }, [level]);

  const handleCellClick = (r, c) => {
    if (isSolved) return;
    audioSynth.playClick();
    const newGrid = [...userGrid];
    newGrid[r] = [...newGrid[r]];
    newGrid[r][c] = newGrid[r][c] === 0 ? 1 : 0;
    setUserGrid(newGrid);
  };

  const checkAnswer = () => {
    // The right side should be a horizontal mirror of the left side.
    // For a left grid cell at (r, c), the mirror position on right grid is (r, cols - 1 - c).
    const cols = currentPattern.grid[0].length;
    let correct = true;
    for (let r = 0; r < currentPattern.grid.length; r++) {
      for (let c = 0; c < cols; c++) {
        // userGrid[r][c] must match currentPattern.grid[r][cols - 1 - c]
        if (userGrid[r][c] !== currentPattern.grid[r][cols - 1 - c]) {
          correct = false;
          break;
        }
      }
      if (!correct) break;
    }

    if (correct) {
      audioSynth.playCorrect();
      setIsSolved(true);
    } else {
      audioSynth.playIncorrect();
    }
  };

  const nextLevel = () => {
    audioSynth.playClick();
    setLevel((prev) => (prev + 1) % PATTERNS.length);
  };

  const leftColor = '#ec4899'; // pink
  const rightColor = '#3b82f6'; // blue

  return (
    <div className="screen-wrapper fade-in" style={{ padding: '20px', overflowY: 'auto' }}>
      <div className="card-shadow" style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <button className="bouncy-button secondary" onClick={onBack} style={{ padding: '8px 12px' }}>
            <ArrowLeft size={20} />
          </button>
          <h2 style={{ color: '#c0487a', margin: 0 }}>{lang === 'en' ? 'Symmetry Game' : '对称图形'}</h2>
          <button className="bouncy-button secondary" onClick={() => { audioSynth.playClick(); initGrid(); }} style={{ padding: '8px 12px' }}>
            <RefreshCw size={20} />
          </button>
        </div>

        <p style={{ color: '#4b5563', marginBottom: '20px', textAlign: 'center' }}>
          {lang === 'en' ? 'Draw the mirror image on the right side!' : '在右侧画出左侧图案的镜像！'}
        </p>

        {/* Game Area */}
        <div style={{ display: 'flex', alignItems: 'stretch', justifyContent: 'center', gap: '4px', marginBottom: '30px' }}>
          {/* Left Grid (Fixed) */}
          <div style={{ display: 'grid', gridTemplateRows: `repeat(${currentPattern.grid.length}, ${cellSize}px)`, gap: '2px', border: `3px solid ${leftColor}`, padding: '4px', borderRadius: '8px', background: '#fdf2f8' }}>
            {currentPattern.grid.map((row, r) => (
              <div key={`l-row-${r}`} style={{ display: 'flex', gap: '2px' }}>
                {row.map((val, c) => (
                  <div key={`l-${r}-${c}`} style={{
                    width: `${cellSize}px`, height: `${cellSize}px`,
                    backgroundColor: val ? leftColor : 'white',
                    border: '1px solid #fbcfe8',
                    borderRadius: '4px'
                  }} />
                ))}
              </div>
            ))}
          </div>

          {/* Mirror Line */}
          <div style={{ width: '4px', backgroundColor: '#94a3b8', borderRadius: '2px', alignSelf: 'stretch', margin: '0 10px' }} />

          {/* Right Grid (Interactive) */}
          <div style={{ display: 'grid', gridTemplateRows: `repeat(${userGrid.length}, ${cellSize}px)`, gap: '2px', border: `3px dashed ${rightColor}`, padding: '4px', borderRadius: '8px', background: '#eff6ff' }}>
            {userGrid.map((row, r) => (
              <div key={`r-row-${r}`} style={{ display: 'flex', gap: '2px' }}>
                {row.map((val, c) => (
                  <div key={`r-${r}-${c}`} 
                    onClick={() => handleCellClick(r, c)}
                    style={{
                      width: `${cellSize}px`, height: `${cellSize}px`,
                      backgroundColor: val ? rightColor : 'white',
                      border: '1px solid #bfdbfe',
                      borderRadius: '4px',
                      cursor: isSolved ? 'default' : 'pointer',
                      transition: 'background-color 0.2s'
                  }} />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        {isSolved ? (
          <div className="bounce-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '1.4rem', color: '#22c55e', fontWeight: '700', marginBottom: '16px' }}>
              🌟 {lang === 'en' ? 'Perfect symmetry!' : '完美的对称！'}
            </div>
            <button className="bouncy-button primary" onClick={nextLevel} style={{ padding: '12px 24px', fontSize: '1.2rem' }}>
              {lang === 'en' ? 'Next Pattern ➔' : '下一关 ➔'}
            </button>
          </div>
        ) : (
          <button className="bouncy-button primary" onClick={checkAnswer} style={{ padding: '12px 24px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Check size={24} /> {lang === 'en' ? 'Check Mirror' : '检查镜像'}
          </button>
        )}

      </div>
    </div>
  );
}

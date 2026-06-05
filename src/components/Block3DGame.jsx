import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Check, RotateCw } from 'lucide-react';
import { audioSynth } from '../utils/audioSynth';

const PALETTES = {
  blue: { top: '#93c5fd', left: '#3b82f6', right: '#1d4ed8', edge1: '#bfdbfe', edge2: '#60a5fa', edge3: '#2563eb' },
  pink: { top: '#f9a8d4', left: '#ec4899', right: '#be185d', edge1: '#fbcfe8', edge2: '#f472b6', edge3: '#db2777' },
  orange: { top: '#fcd34d', left: '#f59e0b', right: '#b45309', edge1: '#fde68a', edge2: '#fbbf24', edge3: '#d97706' },
  green: { top: '#86efac', left: '#22c55e', right: '#15803d', edge1: '#bbf7d0', edge2: '#4ade80', edge3: '#16a34a' },
  purple: { top: '#d8b4fe', left: '#a855f7', right: '#7e22ce', edge1: '#e9d5ff', edge2: '#c084fc', edge3: '#9333ea' },
  red: { top: '#fca5a5', left: '#ef4444', right: '#b91c1c', edge1: '#fecaca', edge2: '#f87171', edge3: '#dc2626' },
  cyan: { top: '#67e8f9', left: '#06b6d4', right: '#0e7490', edge1: '#a5f3fc', edge2: '#22d3ee', edge3: '#0891b2' },
};
const COLOR_KEYS = Object.keys(PALETTES);

const LEVELS = [
  // 1. Line of 3
  { coords: [{x:0,y:0,z:0}, {x:1,y:0,z:0}, {x:2,y:0,z:0}], answer: 3 },
  // 2. L-shape
  { coords: [{x:0,y:0,z:0}, {x:1,y:0,z:0}, {x:2,y:0,z:0}, {x:0,y:1,z:0}], answer: 4 },
  // 3. Simple column
  { coords: [{x:0,y:0,z:0}, {x:0,y:0,z:1}, {x:0,y:0,z:2}], answer: 3 },
  // 4. Column + 1
  { coords: [{x:0,y:0,z:0}, {x:0,y:0,z:1}, {x:1,y:0,z:0}], answer: 3 },
  // 5. Stairs (3 steps)
  { coords: [{x:0,y:0,z:0}, {x:1,y:0,z:0}, {x:2,y:0,z:0}, {x:0,y:0,z:1}, {x:1,y:0,z:1}, {x:0,y:0,z:2}], answer: 6 },
  // 6. Two columns
  { coords: [{x:0,y:0,z:0}, {x:0,y:0,z:1}, {x:0,y:0,z:2}, {x:0,y:1,z:0}, {x:0,y:1,z:1}], answer: 5 },
  // 7. Line with a branch and height
  { coords: [{x:0,y:0,z:0}, {x:1,y:0,z:0}, {x:2,y:0,z:0}, {x:1,y:1,z:0}, {x:1,y:0,z:1}], answer: 5 },
  // 8. U-shape
  { coords: [{x:0,y:0,z:0}, {x:1,y:0,z:0}, {x:2,y:0,z:0}, {x:0,y:1,z:0}, {x:2,y:1,z:0}], answer: 5 },
  // 9. Large Stairs
  { coords: [{x:0,y:0,z:0}, {x:1,y:0,z:0}, {x:2,y:0,z:0}, {x:3,y:0,z:0}, {x:0,y:0,z:1}, {x:1,y:0,z:1}, {x:2,y:0,z:1}, {x:0,y:0,z:2}, {x:1,y:0,z:2}, {x:0,y:0,z:3}], answer: 10 },
  // 10. Podium
  { coords: [{x:0,y:1,z:0}, {x:1,y:0,z:0}, {x:1,y:1,z:0}, {x:1,y:2,z:0}, {x:2,y:1,z:0}, {x:1,y:1,z:1}], answer: 6 }
];

const IsoCube = ({ cx, cy, size, colorType = 'blue' }) => {
  const dx = size * Math.cos(Math.PI / 6);
  const dy = size * Math.sin(Math.PI / 6);
  const p = PALETTES[colorType];
  
  const top = `${cx},${cy - size} ${cx + dx},${cy - size + dy} ${cx},${cy} ${cx - dx},${cy - size + dy}`;
  const left = `${cx - dx},${cy - size + dy} ${cx},${cy} ${cx},${cy + size} ${cx - dx},${cy + dy}`;
  const right = `${cx},${cy} ${cx + dx},${cy - size + dy} ${cx + dx},${cy + dy} ${cx},${cy + size}`;

  return (
    <g>
      <polygon points={top} fill={p.top} stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" strokeLinejoin="round" />
      <polygon points={left} fill={p.left} stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" strokeLinejoin="round" />
      <polygon points={right} fill={p.right} stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" strokeLinejoin="round" />
    </g>
  );
};

export default function Block3DGame({ lang, onBack }) {
  const [levelIdx, setLevelIdx] = useState(0);
  const [userAns, setUserAns] = useState('');
  const [isSolved, setIsSolved] = useState(false);
  const [rotation, setRotation] = useState(0);

  const currentLevel = LEVELS[levelIdx];

  useEffect(() => {
    setUserAns('');
    setIsSolved(false);
    setRotation(0);
  }, [levelIdx]);

  const checkAnswer = () => {
    if (parseInt(userAns) === currentLevel.answer) {
      audioSynth.playCorrect();
      setIsSolved(true);
    } else {
      audioSynth.playIncorrect();
      setUserAns('');
    }
  };

  const nextLevel = () => {
    audioSynth.playClick();
    setLevelIdx((prev) => (prev + 1) % LEVELS.length);
  };

  const padPress = (val) => {
    audioSynth.playClick();
    if (val === 'C') {
      setUserAns('');
    } else {
      if (userAns.length < 2) setUserAns(prev => prev + val);
    }
  };

  const renderBaseGrid = (baseX, baseY, size) => {
    const dx = size * Math.cos(Math.PI / 6);
    const dy = size * Math.sin(Math.PI / 6);
    const grid = [];
    
    // Add shadow filter
    grid.push(
      <defs key="defs">
        <filter id="shadow-blur">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>
    );

    // Add shadow polygon
    const shadowPts = `${baseX},${baseY} ${baseX + 3*dx},${baseY + 3*dy} ${baseX},${baseY + 6*dy} ${baseX - 3*dx},${baseY + 3*dy}`;
    grid.push(
      <polygon 
        key="base-shadow" 
        points={shadowPts} 
        fill="rgba(0,0,0,0.15)" 
        transform="translate(0, 15)" 
        filter="url(#shadow-blur)" 
      />
    );

    // Draw a 3x3 base grid
    for(let x=2; x>=0; x--) {
      for(let y=2; y>=0; y--) {
        const cx = baseX + (x - y) * dx;
        const cy = baseY + (x + y) * dy;
        const pts = `${cx},${cy} ${cx + dx},${cy + dy} ${cx},${cy + 2*dy} ${cx - dx},${cy + dy}`;
        grid.push(<polygon key={`base-${x}-${y}`} points={pts} fill="rgba(255,255,255,0.4)" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" strokeLinejoin="round" />);
      }
    }
    return grid;
  };

  const getRotatedCoords = (x, y, r) => {
    if (r === 1) return { rx: 2 - y, ry: x };
    if (r === 2) return { rx: 2 - x, ry: 2 - y };
    if (r === 3) return { rx: y, ry: 2 - x };
    return { rx: x, ry: y };
  };

  const renderCubes = () => {
    const sorted = [...currentLevel.coords].sort((a, b) => {
      const ra = getRotatedCoords(a.x, a.y, rotation);
      const rb = getRotatedCoords(b.x, b.y, rotation);
      if (ra.rx + ra.ry !== rb.rx + rb.ry) return (ra.rx + ra.ry) - (rb.rx + rb.ry);
      if (a.z !== b.z) return a.z - b.z;
      return ra.rx - rb.rx;
    });

    const size = 30;
    const dx = size * Math.cos(Math.PI / 6);
    const dy = size * Math.sin(Math.PI / 6);
    
    const baseX = 150;
    const baseY = 160; // Adjusted for 3x3 base grid offset

    return (
      <svg width="100%" height="300" viewBox="0 0 300 300" style={{ overflow: 'visible', filter: 'drop-shadow(0 15px 25px rgba(37,99,235,0.2))' }}>
        <style>
          {`
            @keyframes float3d {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-10px); }
            }
          `}
        </style>
        <g style={{ animation: 'float3d 4s ease-in-out infinite', transformOrigin: 'center' }}>
          {renderBaseGrid(baseX, baseY, size)}
          {sorted.map((c, i) => {
            const rCoords = getRotatedCoords(c.x, c.y, rotation);
            const screenX = baseX + (rCoords.rx - rCoords.ry) * dx;
            const screenY = baseY + (rCoords.rx + rCoords.ry) * dy - (c.z + 1) * size; // +1 to place on top of base grid
            
            // Use a single solid color for all blocks in the current level
            const colorType = COLOR_KEYS[levelIdx % COLOR_KEYS.length];
            
            return <IsoCube key={i} cx={screenX} cy={screenY} size={size} colorType={colorType} />;
          })}
        </g>
      </svg>
    );
  };

  return (
    <div className="screen-wrapper fade-in" style={{ padding: '20px', overflowY: 'auto' }}>
      <div className="card-shadow" style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <button className="bouncy-button secondary" onClick={onBack} style={{ padding: '8px 12px' }}>
            <ArrowLeft size={20} />
          </button>
          <h2 style={{ color: '#c0487a', margin: 0 }}>{lang === 'en' ? 'Count the Blocks' : '数立体积木'}</h2>
          <button className="bouncy-button secondary" onClick={() => { audioSynth.playClick(); setUserAns(''); setIsSolved(false); }} style={{ padding: '8px 12px' }}>
            <RefreshCw size={20} />
          </button>
        </div>

        <p style={{ color: '#4b5563', marginBottom: '10px' }}>
          {lang === 'en' ? 'How many blocks are there in total?' : '这里一共有多少个积木？'}
        </p>

        {/* 3D Render Area */}
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px', background: '#f8fafc', borderRadius: '16px', border: '2px solid #e2e8f0' }}>
          <button 
            onClick={() => { audioSynth.playClick(); setRotation(r => (r + 1) % 4); }}
            style={{ position: 'absolute', top: 12, right: 12, width: '45px', height: '45px', borderRadius: '50%', background: 'white', border: '2px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', color: '#3b82f6', transition: 'all 0.2s', zIndex: 100 }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            title={lang === 'en' ? 'Rotate View' : '旋转视角'}
          >
            <RotateCw size={24} />
          </button>
          {renderCubes()}
        </div>

        {/* Input & Keypad */}
        <div className="equation-container" style={{ marginBottom: '20px' }}>
          <span>{lang === 'en' ? 'Total: ' : '一共：'}</span>
          <div className="answer-box">
            {userAns === '' ? '?' : userAns}
          </div>
        </div>

        {isSolved ? (
          <div className="bounce-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '1.4rem', color: '#22c55e', fontWeight: '700', marginBottom: '16px' }}>
              🌟 {lang === 'en' ? 'Correct!' : '答对啦！'}
            </div>
            <button className="bouncy-button primary" onClick={nextLevel} style={{ padding: '12px 24px', fontSize: '1.2rem' }}>
              {lang === 'en' ? 'Next Puzzle ➔' : '下一关 ➔'}
            </button>
          </div>
        ) : (
          <div className="keypad-grid">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(val => (
              <button key={val} className="keypad-btn" onClick={() => padPress(val)}>{val}</button>
            ))}
            <button className="keypad-btn action-clear" onClick={() => padPress('C')}>❌</button>
            <button className="keypad-btn" onClick={() => padPress('0')}>0</button>
            <button className="keypad-btn action-submit" onClick={checkAnswer}>✅</button>
          </div>
        )}

      </div>
    </div>
  );
}

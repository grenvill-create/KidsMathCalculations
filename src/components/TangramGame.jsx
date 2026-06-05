import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RefreshCcw, Star, Lightbulb, Grid } from 'lucide-react';
import { audioSynth } from '../utils/audioSynth';

const SHAPES = {
  square: "-50,-50 50,-50 50,50 -50,50",
  largeTriangle: "-100,50 100,50 0,-50",
  mediumTriangle: "-70,35 70,35 0,-35",
  smallTriangle: "-50,25 50,25 0,-25",
  parallelogram: "-75,-25 25,-25 75,25 -25,25"
};

const LEVELS = [
  {
    id: 1,
    nameZh: '小鱼',
    nameEn: 'Fish',
    emoji: '🐟',
    pieces: [
      { id: 'f1', shape: 'square', color: '#fca5a5', targetX: 400, targetY: 300, rotation: 45 },
      { id: 'f2', shape: 'mediumTriangle', color: '#6ee7b7', targetX: 294, targetY: 300, rotation: 90 }, // Tail
      { id: 'f3', shape: 'smallTriangle', color: '#93c5fd', targetX: 435, targetY: 229, rotation: -45 }, // Top fin
    ]
  },
  {
    id: 2,
    nameZh: '小猫',
    nameEn: 'Cat',
    emoji: '🐱',
    pieces: [
      { id: 'c1', shape: 'square', color: '#fde047', targetX: 400, targetY: 200, rotation: 0 }, // head
      { id: 'c2', shape: 'smallTriangle', color: '#fca5a5', targetX: 375, targetY: 138, rotation: 45 }, // left ear
      { id: 'c3', shape: 'smallTriangle', color: '#93c5fd', targetX: 425, targetY: 138, rotation: -45 }, // right ear
      { id: 'c4', shape: 'largeTriangle', color: '#86efac', targetX: 400, targetY: 300, rotation: 180 }, // body
      { id: 'c5', shape: 'parallelogram', color: '#c4b5fd', targetX: 525, targetY: 350, rotation: 45 }, // tail
    ]
  },
  {
    id: 3,
    nameZh: '兔子',
    nameEn: 'Rabbit',
    emoji: '🐰',
    pieces: [
      { id: 'r1', shape: 'smallTriangle', color: '#93c5fd', targetX: 450, targetY: 150, rotation: 90 }, // Ear 1
      { id: 'r2', shape: 'smallTriangle', color: '#fca5a5', targetX: 450, targetY: 250, rotation: 90 }, // Ear 2
      { id: 'r3', shape: 'square', color: '#fde047', targetX: 375, targetY: 325, rotation: 45 }, // Head
      { id: 'r4', shape: 'largeTriangle', color: '#6ee7b7', targetX: 269, targetY: 431, rotation: 135 }, // Body
      { id: 'r5', shape: 'mediumTriangle', color: '#c4b5fd', targetX: 194, targetY: 537, rotation: -45 }, // Foot
    ]
  },
  {
    id: 4,
    nameZh: '天鹅',
    nameEn: 'Swan',
    emoji: '🦢',
    pieces: [
      { id: 'sw1', shape: 'smallTriangle', color: '#a78bfa', targetX: 250, targetY: 150, rotation: 180 },
      { id: 'sw2', shape: 'mediumTriangle', color: '#fca5a5', targetX: 300, targetY: 215, rotation: 90 },
      { id: 'sw3', shape: 'largeTriangle', color: '#93c5fd', targetX: 390, targetY: 300, rotation: 0 },
      { id: 'sw4', shape: 'smallTriangle', color: '#fde047', targetX: 490, targetY: 300, rotation: -90 },
      { id: 'sw5', shape: 'parallelogram', color: '#6ee7b7', targetX: 390, targetY: 200, rotation: 45 },
    ]
  },
  {
    id: 5,
    nameZh: '狐狸',
    nameEn: 'Fox',
    emoji: '🦊',
    pieces: [
      { id: 'fx1', shape: 'square', color: '#f97316', targetX: 400, targetY: 200, rotation: 45 },
      { id: 'fx2', shape: 'smallTriangle', color: '#fb7185', targetX: 330, targetY: 130, rotation: 45 },
      { id: 'fx3', shape: 'smallTriangle', color: '#fb7185', targetX: 470, targetY: 130, rotation: -45 },
      { id: 'fx4', shape: 'largeTriangle', color: '#fca5a5', targetX: 400, targetY: 310, rotation: 180 },
      { id: 'fx5', shape: 'mediumTriangle', color: '#c4b5fd', targetX: 505, targetY: 380, rotation: -45 },
    ]
  },
  {
    id: 6,
    nameZh: '小狗',
    nameEn: 'Dog',
    emoji: '🐶',
    pieces: [
      { id: 'dg1', shape: 'square', color: '#b45309', targetX: 300, targetY: 200, rotation: 45 },
      { id: 'dg2', shape: 'smallTriangle', color: '#fde047', targetX: 230, targetY: 130, rotation: -45 },
      { id: 'dg3', shape: 'smallTriangle', color: '#ef4444', targetX: 330, targetY: 270, rotation: 45 },
      { id: 'dg4', shape: 'largeTriangle', color: '#6ee7b7', targetX: 420, targetY: 330, rotation: 135 },
      { id: 'dg5', shape: 'mediumTriangle', color: '#93c5fd', targetX: 420, targetY: 440, rotation: 45 },
      { id: 'dg6', shape: 'smallTriangle', color: '#c4b5fd', targetX: 520, targetY: 280, rotation: 90 },
    ]
  },
  {
    id: 7,
    nameZh: '小鸟',
    nameEn: 'Bird',
    emoji: '🐦',
    pieces: [
      { id: 'bd1', shape: 'largeTriangle', color: '#38bdf8', targetX: 380, targetY: 300, rotation: 0 },
      { id: 'bd2', shape: 'mediumTriangle', color: '#fb7185', targetX: 320, targetY: 230, rotation: 90 },
      { id: 'bd3', shape: 'square', color: '#fcd34d', targetX: 450, targetY: 230, rotation: 45 },
      { id: 'bd4', shape: 'smallTriangle', color: '#f97316', targetX: 520, targetY: 200, rotation: -45 },
      { id: 'bd5', shape: 'smallTriangle', color: '#a78bfa', targetX: 280, targetY: 370, rotation: 45 },
    ]
  },
  {
    id: 8,
    nameZh: '小鸭子',
    nameEn: 'Duck',
    emoji: '🦆',
    pieces: [
      { id: 'dk1', shape: 'square', color: '#facc15', targetX: 300, targetY: 180, rotation: 0 },
      { id: 'dk2', shape: 'smallTriangle', color: '#f97316', targetX: 230, targetY: 180, rotation: 90 },
      { id: 'dk3', shape: 'mediumTriangle', color: '#60a5fa', targetX: 335, targetY: 250, rotation: 0 },
      { id: 'dk4', shape: 'largeTriangle', color: '#4ade80', targetX: 420, targetY: 320, rotation: 180 },
      { id: 'dk5', shape: 'smallTriangle', color: '#f472b6', targetX: 515, targetY: 285, rotation: -45 },
    ]
  }
];

export default function TangramGame({ lang, onBack }) {
  const [levelIdx, setLevelIdx] = useState(0);
  const [pieces, setPieces] = useState([]);
  const [isWon, setIsWon] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  const [isHardMode, setIsHardMode] = useState(false);
  
  const svgRef = useRef(null);
  const dragInfo = useRef({ id: null, offsetX: 0, offsetY: 0, hasMoved: false });
  const clickStart = useRef({ x: 0, y: 0, time: 0 });

  const currentLevel = LEVELS[levelIdx];

  const isRotationMatch = (rot1, rot2, shape) => {
    const r1 = (rot1 % 360 + 360) % 360;
    const r2 = (rot2 % 360 + 360) % 360;
    const diff = Math.abs(r1 - r2) % 360;
    
    if (shape === 'square') {
      return diff % 90 === 0;
    }
    if (shape === 'parallelogram') {
      return diff % 180 === 0;
    }
    return diff === 0;
  };

  const initLevel = () => {
    setIsWon(false);
    const rotations = [0, 45, 90, 135, 180, 225, 270, 315];
    const newPieces = currentLevel.pieces.map((p, idx) => {
      let initialRotation = p.rotation;
      if (isHardMode) {
        // Find a random rotation
        initialRotation = rotations[Math.floor(Math.random() * rotations.length)];
      }
      
      return {
        ...p,
        rotation: initialRotation,
        // Scatter pieces safely within the bottom play area bounds
        x: 150 + (idx * 110) % 520,
        y: 450 + Math.random() * 30,
        isLocked: false
      };
    });
    setPieces(newPieces);
  };

  useEffect(() => {
    initLevel();
  }, [levelIdx, isHardMode]);

  useEffect(() => {
    // Check win condition
    if (pieces.length > 0 && pieces.every(p => p.isLocked)) {
      setIsWon(true);
      audioSynth.playCorrect();
      // Speak the animal name
      setTimeout(() => {
        audioSynth.speak(lang === 'en' ? currentLevel.nameEn : currentLevel.nameZh, lang);
      }, 300);
    }
  }, [pieces]);

  // Transform screen/pointer coords to SVG viewBox coords
  const getMousePosition = (evt) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const CTM = svgRef.current.getScreenCTM();
    if (!CTM) return { x: 0, y: 0 };
    if (evt.touches && evt.touches.length > 0) {
      return {
        x: (evt.touches[0].clientX - CTM.e) / CTM.a,
        y: (evt.touches[0].clientY - CTM.f) / CTM.d
      };
    }
    return {
      x: (evt.clientX - CTM.e) / CTM.a,
      y: (evt.clientY - CTM.f) / CTM.d
    };
  };

  const startDrag = (evt, piece) => {
    if (piece.isLocked) return;
    const pos = getMousePosition(evt);
    
    clickStart.current = {
      x: evt.clientX || (evt.touches && evt.touches[0].clientX) || 0,
      y: evt.clientY || (evt.touches && evt.touches[0].clientY) || 0,
      time: Date.now()
    };

    dragInfo.current = {
      id: piece.id,
      offsetX: pos.x - piece.x,
      offsetY: pos.y - piece.y,
      hasMoved: false
    };

    // Bring to front by moving it to end of array
    setPieces(prev => {
      const filtered = prev.filter(p => p.id !== piece.id);
      return [...filtered, prev.find(p => p.id === piece.id)];
    });
    evt.target.setPointerCapture(evt.pointerId);
  };

  const drag = (evt) => {
    if (!dragInfo.current.id) return;
    evt.preventDefault();
    const pos = getMousePosition(evt);
    const id = dragInfo.current.id;

    // Check if pointer moved significantly to count as drag
    const clientX = evt.clientX || (evt.touches && evt.touches[0].clientX) || 0;
    const clientY = evt.clientY || (evt.touches && evt.touches[0].clientY) || 0;
    const moveDist = Math.hypot(clientX - clickStart.current.x, clientY - clickStart.current.y);
    if (moveDist > 6) {
      dragInfo.current.hasMoved = true;
    }

    setPieces(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          x: pos.x - dragInfo.current.offsetX,
          y: pos.y - dragInfo.current.offsetY
        };
      }
      return p;
    }));
  };

  const endDrag = (evt) => {
    if (!dragInfo.current.id) return;
    const id = dragInfo.current.id;
    const piece = pieces.find(p => p.id === id);
    if (!piece) return;

    const duration = Date.now() - clickStart.current.time;

    if (!dragInfo.current.hasMoved && duration < 300) {
      // It is a click/tap! Rotate clockwise by 45 degrees
      audioSynth.playClick();
      setPieces(prev => prev.map(p => {
        if (p.id === id) {
          const nextRotation = (p.rotation + 45) % 360;
          const target = currentLevel.pieces.find(tp => tp.id === p.id);
          const dist = Math.hypot(p.x - p.targetX, p.y - p.targetY);
          const fitsRotation = !isHardMode || isRotationMatch(nextRotation, target.rotation, p.shape);
          
          if (dist < 40 && fitsRotation) {
            return { ...p, x: p.targetX, y: p.targetY, rotation: target.rotation, isLocked: true };
          }
          return { ...p, rotation: nextRotation };
        }
        return p;
      }));
    } else {
      // Standard drop snap check
      const target = currentLevel.pieces.find(tp => tp.id === id);
      const dist = Math.hypot(piece.x - piece.targetX, piece.y - piece.targetY);
      const fitsRotation = !isHardMode || isRotationMatch(piece.rotation, target.rotation, piece.shape);
      
      if (dist < 40 && fitsRotation) {
        setPieces(prev => prev.map(p => {
          if (p.id === id) {
            audioSynth.playClick();
            return { ...p, x: p.targetX, y: p.targetY, rotation: target.rotation, isLocked: true };
          }
          return p;
        }));
      }
    }

    dragInfo.current = { id: null, offsetX: 0, offsetY: 0, hasMoved: false };
    try {
      evt.target.releasePointerCapture(evt.pointerId);
    } catch (e) {}
  };

  const nextLevel = () => {
    if (levelIdx < LEVELS.length - 1) {
      setLevelIdx(levelIdx + 1);
    } else {
      setLevelIdx(0); // loop back
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'Fredoka, sans-serif',
      userSelect: 'none'
    }}>
      <style>{`
        @keyframes happy-bounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.15); }
        }
        .happy-bounce {
          animation: happy-bounce 0.8s infinite ease-in-out;
          display: inline-block;
        }
        @keyframes pulse-hint {
          0%, 100% { stroke-width: 4; stroke-opacity: 0.6; }
          50% { stroke-width: 6; stroke-opacity: 1; }
        }
        .pulse-hint {
          animation: pulse-hint 1.5s infinite ease-in-out;
        }
      `}</style>

      {/* Header */}
      <div style={{
        padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(10px)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)', zIndex: 10
      }}>
        <button onClick={onBack} style={{
          background: 'white', border: 'none', borderRadius: '50%',
          width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)', cursor: 'pointer', color: '#db2777'
        }}>
          <ArrowLeft size={24} />
        </button>
        
        {/* Title and Level Selector Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#4f46e5' }}>
            {lang === 'en' ? 'Tangram Puzzles' : '趣味七巧板'}
          </div>
          <button 
            onClick={() => {
              audioSynth.playClick();
              setShowLevelSelect(true);
            }} 
            style={{
              background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
              border: '1.5px solid #818cf8',
              borderRadius: '20px',
              padding: '6px 14px',
              fontSize: '0.95rem',
              fontWeight: 'bold',
              color: '#4338ca',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(99,102,241,0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'transform 0.1s'
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Grid size={18} />
            <span>{currentLevel.emoji} {lang === 'en' ? currentLevel.nameEn : currentLevel.nameZh}</span>
          </button>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* Difficulty Toggle */}
          <button
            onClick={() => {
              audioSynth.playClick();
              setIsHardMode(!isHardMode);
            }}
            style={{
              background: isHardMode ? 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' : '#e2e8f0',
              border: 'none',
              borderRadius: '15px',
              padding: '6px 14px',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              color: isHardMode ? 'white' : '#64748b',
              cursor: 'pointer',
              boxShadow: isHardMode ? '0 2px 6px rgba(225,29,72,0.3)' : 'none',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>{isHardMode ? '🔥' : '🌱'}</span>
            <span>{isHardMode ? (lang === 'en' ? 'Hard' : '挑战模式') : (lang === 'en' ? 'Easy' : '普通模式')}</span>
          </button>

          <button 
            onClick={() => {
              audioSynth.playClick();
              setShowHint(!showHint);
            }} 
            style={{
              background: showHint ? '#fef08a' : 'white', 
              border: 'none', borderRadius: '50%',
              width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)', cursor: 'pointer', 
              color: showHint ? '#ca8a04' : '#64748b',
              transition: 'background-color 0.2s'
            }}
            title={lang === 'en' ? 'Toggle color hints' : '显示/隐藏颜色提示'}
          >
            <Lightbulb size={22} />
          </button>
          
          <button onClick={initLevel} style={{
            background: 'white', border: 'none', borderRadius: '50%',
            width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)', cursor: 'pointer', color: '#64748b'
          }}>
            <RefreshCcw size={22} />
          </button>
        </div>
      </div>

      {/* Play Area */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
        
        {/* Win Overlay */}
        {isWon && (
          <div className="bounce-in" style={{
            position: 'absolute', top: '15%', zIndex: 50,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            background: 'rgba(255,255,255,0.92)', padding: '24px 44px', borderRadius: '30px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)', border: '4px solid #fde047',
            backdropFilter: 'blur(5px)'
          }}>
            <div style={{ fontSize: '3rem', display: 'flex', gap: '10px' }}>
              <Star color="#fde047" fill="#fde047" />
              <Star color="#fde047" fill="#fde047" />
              <Star color="#fde047" fill="#fde047" />
            </div>
            
            <div className="happy-bounce" style={{ fontSize: '5.5rem', margin: '8px 0' }}>
              {currentLevel.emoji}
            </div>

            <h2 style={{ color: '#22c55e', margin: '5px 0', fontSize: '1.8rem' }}>
              {lang === 'en' ? `Completed: ${currentLevel.nameEn}!` : `拼好啦：${currentLevel.nameZh}!`}
            </h2>

            <button onClick={nextLevel} style={{
              background: 'linear-gradient(135deg, #a78bfa, #8b5cf6)', color: 'white',
              border: 'none', padding: '12px 36px', fontSize: '1.25rem', borderRadius: '24px',
              cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(139,92,246,0.4)',
              marginTop: '15px'
            }}>
              {lang === 'en' ? 'Next Puzzle' : '下一关 ➔'}
            </button>
          </div>
        )}

        <svg
          ref={svgRef}
          viewBox="0 0 800 600"
          style={{ width: '100%', height: '100%', maxWidth: '900px', touchAction: 'none', overflow: 'visible' }}
          onPointerMove={drag}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
        >
          <defs>
            <filter id="shadow">
              <feDropShadow dx="2" dy="5" stdDeviation="3.5" floodOpacity="0.2"/>
            </filter>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Target Outlines / Hint Areas */}
          {currentLevel.pieces.map(target => (
            <polygon
              key={`target-${target.id}`}
              points={SHAPES[target.shape]}
              transform={`translate(${target.targetX}, ${target.targetY}) rotate(${target.rotation})`}
              fill={showHint ? target.color : 'none'}
              fillOpacity={showHint ? 0.25 : 0}
              stroke={showHint ? target.color : '#cbd5e1'}
              strokeWidth={showHint ? "4" : "3"}
              strokeDasharray={showHint ? "none" : "6 6"}
              className={showHint ? "pulse-hint" : ""}
              style={{ transition: 'all 0.3s' }}
            />
          ))}

          {/* Movable Pieces */}
          {pieces.map(piece => (
            <polygon
              key={piece.id}
              points={SHAPES[piece.shape]}
              transform={`translate(${piece.x}, ${piece.y}) rotate(${piece.rotation})`}
              onPointerDown={(e) => startDrag(e, piece)}
              fill={piece.color}
              stroke="white"
              strokeWidth="3.5"
              filter={piece.isLocked ? '' : 'url(#shadow)'}
              style={{ 
                cursor: piece.isLocked ? 'default' : 'grab', 
                transition: dragInfo.current.id === piece.id ? 'none' : 'transform 0.12s cubic-bezier(0.25, 0.8, 0.25, 1)',
                opacity: piece.isLocked ? 0.95 : 1
              }}
            />
          ))}
        </svg>
      </div>
      
      {/* Level Selection Drawer / Modal */}
      {showLevelSelect && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(248, 250, 252, 0.96)',
          backdropFilter: 'blur(16px)',
          zIndex: 100,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', padding: '30px 20px',
          overflowY: 'auto'
        }}>
          <h2 style={{ color: '#4f46e5', fontSize: '2.2rem', marginBottom: '24px', fontWeight: 'bold' }}>
            {lang === 'en' ? 'Select a Tangram Puzzle' : '选择一个拼图'}
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
            gap: '20px',
            width: '100%',
            maxWidth: '640px',
            marginBottom: '35px'
          }}>
            {LEVELS.map((level, idx) => (
              <button
                key={level.id}
                onClick={() => {
                  setLevelIdx(idx);
                  setShowLevelSelect(false);
                  audioSynth.playClick();
                }}
                style={{
                  background: 'white',
                  border: levelIdx === idx ? '3.5px solid #4f46e5' : '3.5px solid #e2e8f0',
                  borderRadius: '24px',
                  padding: '22px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: levelIdx === idx ? '0 8px 24px rgba(79,70,229,0.15)' : '0 4px 12px rgba(0,0,0,0.03)',
                  transition: 'all 0.2s',
                  transform: levelIdx === idx ? 'scale(1.06)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (levelIdx !== idx) e.currentTarget.style.borderColor = '#c7d2fe';
                }}
                onMouseLeave={(e) => {
                  if (levelIdx !== idx) e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              >
                <span style={{ fontSize: '3.2rem' }}>{level.emoji}</span>
                <span style={{ fontWeight: 'bold', fontSize: '1.05rem', color: '#1e293b' }}>
                  {lang === 'en' ? level.nameEn : level.nameZh}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  {level.pieces.length} {lang === 'en' ? 'pieces' : '块'}
                </span>
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              audioSynth.playClick();
              setShowLevelSelect(false);
            }}
            style={{
              background: '#475569',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              padding: '12px 36px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
            }}
          >
            {lang === 'en' ? 'Cancel' : '取消'}
          </button>
        </div>
      )}

      {/* Shelf area at the bottom */}
      <div style={{
        height: '140px', background: 'rgba(255,255,255,0.7)', borderTop: '3px solid rgba(255,255,255,0.9)',
        backdropFilter: 'blur(8px)', position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: -1
      }}>
        {/* Label for shelf */}
        <div style={{
          position: 'absolute', top: '10px', left: '20px', fontSize: '0.85rem', color: '#94a3b8', fontWeight: 'bold'
        }}>
          {isHardMode 
            ? (lang === 'en' ? 'Drag pieces to place, tap a piece to rotate it!' : '从这里拖拽碎片，点击可以旋转角度哦！')
            : (lang === 'en' ? 'Drag pieces from here:' : '从这里拖拽碎片：')
          }
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RefreshCcw, Star } from 'lucide-react';
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
    name: '小鱼 (Fish)',
    pieces: [
      { id: 'f1', shape: 'square', color: '#fca5a5', targetX: 400, targetY: 300, rotation: 45 },
      { id: 'f2', shape: 'mediumTriangle', color: '#6ee7b7', targetX: 294, targetY: 300, rotation: 90 }, // Tail
      { id: 'f3', shape: 'smallTriangle', color: '#93c5fd', targetX: 435, targetY: 229, rotation: -45 }, // Top fin
    ]
  },
  {
    id: 2,
    name: '小猫 (Cat)',
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
    name: '兔子 (Rabbit)',
    pieces: [
      { id: 'r1', shape: 'smallTriangle', color: '#93c5fd', targetX: 450, targetY: 150, rotation: 90 }, // Ear 1
      { id: 'r2', shape: 'smallTriangle', color: '#fca5a5', targetX: 450, targetY: 250, rotation: 90 }, // Ear 2
      { id: 'r3', shape: 'square', color: '#fde047', targetX: 375, targetY: 325, rotation: 45 }, // Head
      { id: 'r4', shape: 'largeTriangle', color: '#6ee7b7', targetX: 269, targetY: 431, rotation: 135 }, // Body
      { id: 'r5', shape: 'mediumTriangle', color: '#c4b5fd', targetX: 194, targetY: 537, rotation: -45 }, // Foot
    ]
  }
];

export default function TangramGame({ lang, onBack }) {
  const [levelIdx, setLevelIdx] = useState(0);
  const [pieces, setPieces] = useState([]);
  const [isWon, setIsWon] = useState(false);
  
  const svgRef = useRef(null);
  const dragInfo = useRef({ id: null, offsetX: 0, offsetY: 0 });

  const currentLevel = LEVELS[levelIdx];

  const initLevel = () => {
    setIsWon(false);
    const newPieces = currentLevel.pieces.map((p, idx) => ({
      ...p,
      // Scatter pieces at the bottom
      x: 150 + (idx * 120) % 500,
      y: 500 + Math.random() * 50,
      isLocked: false
    }));
    setPieces(newPieces);
  };

  useEffect(() => {
    initLevel();
  }, [levelIdx]);

  useEffect(() => {
    // Check win condition
    if (pieces.length > 0 && pieces.every(p => p.isLocked)) {
      setIsWon(true);
      audioSynth.playCorrect(); // You could use a special fanfare here
    }
  }, [pieces]);

  // Transform screen/pointer coords to SVG viewBox coords
  const getMousePosition = (evt) => {
    const CTM = svgRef.current.getScreenCTM();
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
    dragInfo.current = {
      id: piece.id,
      offsetX: pos.x - piece.x,
      offsetY: pos.y - piece.y
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
    
    // Check snap distance
    const dist = Math.hypot(piece.x - piece.targetX, piece.y - piece.targetY);
    if (dist < 40) { // Snap threshold
      setPieces(prev => prev.map(p => {
        if (p.id === id) {
          audioSynth.playClick(); // Snap sound
          return { ...p, x: p.targetX, y: p.targetY, isLocked: true };
        }
        return p;
      }));
    } else {
      // Play a soft bump sound or nothing
    }

    dragInfo.current = { id: null, offsetX: 0, offsetY: 0 };
    evt.target.releasePointerCapture(evt.pointerId);
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
      fontFamily: 'Fredoka, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)', zIndex: 10
      }}>
        <button onClick={onBack} style={{
          background: 'white', border: 'none', borderRadius: '50%',
          width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)', cursor: 'pointer', color: '#db2777'
        }}>
          <ArrowLeft size={24} />
        </button>
        
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#6366f1' }}>
          {lang === 'en' ? 'Tangram Puzzles' : '趣味七巧板'} - {currentLevel.name}
        </div>

        <button onClick={initLevel} style={{
          background: 'white', border: 'none', borderRadius: '50%',
          width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)', cursor: 'pointer', color: '#64748b'
        }}>
          <RefreshCcw size={22} />
        </button>
      </div>

      {/* Play Area */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
        
        {/* Win Overlay */}
        {isWon && (
          <div className="bounce-in" style={{
            position: 'absolute', top: '15%', zIndex: 50,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            background: 'rgba(255,255,255,0.9)', padding: '20px 40px', borderRadius: '30px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)', border: '3px solid #fde047'
          }}>
            <div style={{ fontSize: '3rem', display: 'flex', gap: '10px' }}>
              <Star color="#fde047" fill="#fde047" />
              <Star color="#fde047" fill="#fde047" />
              <Star color="#fde047" fill="#fde047" />
            </div>
            <h2 style={{ color: '#22c55e', margin: '10px 0' }}>{lang === 'en' ? 'Great Job!' : '拼得太棒啦！'}</h2>
            <button onClick={nextLevel} style={{
              background: 'linear-gradient(135deg, #a78bfa, #8b5cf6)', color: 'white',
              border: 'none', padding: '12px 30px', fontSize: '1.2rem', borderRadius: '20px',
              cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(139,92,246,0.4)'
            }}>
              {lang === 'en' ? 'Next Puzzle' : '下一关 ➔'}
            </button>
          </div>
        )}

        <svg
          ref={svgRef}
          viewBox="0 0 800 600"
          style={{ width: '100%', height: '100%', maxWidth: '1000px', touchAction: 'none' }}
          onPointerMove={drag}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
        >
          <defs>
            <filter id="shadow">
              <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.2"/>
            </filter>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Target Outlines */}
          {currentLevel.pieces.map(target => (
            <g key={`target-${target.id}`} transform={`translate(${target.targetX}, ${target.targetY}) rotate(${target.rotation})`}>
              <polygon
                points={SHAPES[target.shape]}
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="4"
                strokeDasharray="8 8"
                style={{ transition: 'all 0.3s' }}
              />
            </g>
          ))}

          {/* Movable Pieces */}
          {pieces.map(piece => (
            <g 
              key={piece.id}
              transform={`translate(${piece.x}, ${piece.y}) rotate(${piece.rotation})`}
              onPointerDown={(e) => startDrag(e, piece)}
              style={{ cursor: piece.isLocked ? 'default' : 'grab', transition: dragInfo.current.id === piece.id ? 'none' : 'transform 0.1s ease-out' }}
            >
              <polygon
                points={SHAPES[piece.shape]}
                fill={piece.color}
                stroke="white"
                strokeWidth="3"
                filter={piece.isLocked ? '' : 'url(#shadow)'}
              />
            </g>
          ))}
        </svg>
      </div>
      
      {/* Decorative shelf at the bottom */}
      <div style={{
        height: '120px', background: 'rgba(255,255,255,0.6)', borderTop: '2px solid rgba(255,255,255,0.8)',
        backdropFilter: 'blur(5px)', position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: -1
      }}></div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RefreshCcw, Star } from 'lucide-react';
import { audioSynth } from '../utils/audioSynth';

const SHAPES = ['circle', 'square', 'triangle'];

const ITEMS = [
  // Circle items
  { id: 'c1', shape: 'circle', emoji: '🍩', name: 'Donut' },
  { id: 'c2', shape: 'circle', emoji: '🍪', name: 'Cookie' },
  { id: 'c3', shape: 'circle', emoji: '⚽', name: 'Ball' },
  // Square items
  { id: 's1', shape: 'square', emoji: '🎁', name: 'Gift' },
  { id: 's2', shape: 'square', emoji: '📘', name: 'Book' },
  { id: 's3', shape: 'square', emoji: '🖼️', name: 'Frame' },
  // Triangle items
  { id: 't1', shape: 'triangle', emoji: '🍕', name: 'Pizza' },
  { id: 't2', shape: 'triangle', emoji: '🍉', name: 'Watermelon' },
  { id: 't3', shape: 'triangle', emoji: '⛺', name: 'Tent' },
];

const WAGON_COLORS = {
  circle: '#fca5a5',   // Red-ish
  square: '#6ee7b7',   // Green-ish
  triangle: '#93c5fd', // Blue-ish
};

const SHAPE_ICONS = {
  circle: '🔴',
  square: '🟩',
  triangle: '🔺'
};

export default function ShapeTrainGame({ lang, onBack }) {
  const [level, setLevel] = useState(1);
  const [trainState, setTrainState] = useState('arriving'); // arriving, playing, departing
  const [items, setItems] = useState([]);
  const [wagons, setWagons] = useState([]);
  
  const containerRef = useRef(null);
  const dragInfo = useRef({ id: null, offsetX: 0, offsetY: 0 });

  const initLevel = () => {
    setTrainState('arriving');
    
    // Select shapes for this level
    const levelShapes = [...SHAPES];
    // Shuffle shapes for wagon order
    levelShapes.sort(() => Math.random() - 0.5);
    
    const newWagons = levelShapes.map((shape, idx) => ({
      id: `w-${idx}`,
      shape,
      color: WAGON_COLORS[shape],
      // Approximate X position of the wagon based on index.
      // Train goes right to left or sits in middle? Let's say locomotive is at right, wagons follow to the left.
      // E.g., Locomotive at 700px. Wagon 0 at 500, Wagon 1 at 300, Wagon 2 at 100.
      targetX: window.innerWidth > 800 ? (window.innerWidth / 2 + 150) - (idx + 1) * 200 : (window.innerWidth / 2 + 100) - (idx + 1) * 140
    }));
    setWagons(newWagons);

    // Pick 2 items for each shape
    let newItems = [];
    levelShapes.forEach(shape => {
      const shapeItems = ITEMS.filter(i => i.shape === shape).sort(() => Math.random() - 0.5).slice(0, 2);
      newItems = newItems.concat(shapeItems);
    });

    // Scatter items in the sky
    newItems = newItems.map((item, idx) => ({
      ...item,
      uid: `${item.id}-${Date.now()}`,
      x: 50 + Math.random() * (window.innerWidth > 600 ? window.innerWidth - 100 : 300),
      y: 80 + Math.random() * 150,
      isLoaded: false,
      wagonIdx: null
    }));
    setItems(newItems.sort(() => Math.random() - 0.5));

    // After 2s, train stops
    setTimeout(() => {
      setTrainState('playing');
    }, 2000);
  };

  useEffect(() => {
    initLevel();
    // Handle resize
    const handleResize = () => {
      setWagons(prev => {
        const next = prev.map((w, idx) => ({
          ...w,
          targetX: window.innerWidth > 800 ? (window.innerWidth / 2 + 150) - (idx + 1) * 200 : (window.innerWidth / 2 + 100) - (idx + 1) * 140
        }));
        
        setItems(prevItems => prevItems.map(item => {
          if (item.isLoaded && item.wagonIdx !== null && item.wagonIdx !== undefined) {
            const wagon = next[item.wagonIdx];
            if (wagon) {
              return {
                ...item,
                x: wagon.targetX - 40,
                y: window.innerHeight - 150 - (item.yOffset || 0)
              };
            }
          }
          return item;
        }));
        
        return next;
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [level]);

  useEffect(() => {
    if (trainState === 'playing' && items.length > 0 && items.every(i => i.isLoaded)) {
      // All loaded! Win!
      audioSynth.playCorrect();
      setTrainState('all-loaded');
      
      const timer = setTimeout(() => {
        setTrainState('departing');
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [items, trainState]);

  useEffect(() => {
    if (trainState === 'departing') {
      const timer = setTimeout(() => {
        setLevel(l => l + 1);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [trainState]);

  const startDrag = (evt, item) => {
    if (item.isLoaded || trainState !== 'playing') return;
    evt.preventDefault();
    
    // For touch support, get clientX/Y from touches
    const clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
    const clientY = evt.touches ? evt.touches[0].clientY : evt.clientY;

    dragInfo.current = {
      id: item.uid,
      offsetX: clientX - item.x,
      offsetY: clientY - item.y
    };
    
    // Bring to front
    setItems(prev => {
      const filtered = prev.filter(i => i.uid !== item.uid);
      return [...filtered, prev.find(i => i.uid === item.uid)];
    });
  };

  const drag = (evt) => {
    if (!dragInfo.current.id || trainState !== 'playing') return;
    // evt.preventDefault(); // Sometimes needed for touch
    const clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
    const clientY = evt.touches ? evt.touches[0].clientY : evt.clientY;
    
    const id = dragInfo.current.id;

    setItems(prev => prev.map(i => {
      if (i.uid === id) {
        return {
          ...i,
          x: clientX - dragInfo.current.offsetX,
          y: clientY - dragInfo.current.offsetY
        };
      }
      return i;
    }));
  };

  const endDrag = (evt) => {
    if (!dragInfo.current.id || trainState !== 'playing') return;
    const id = dragInfo.current.id;
    const item = items.find(i => i.uid === id);
    
    // Check if dropped near the correct wagon
    // Wagons are vertically around bottom: 100px. Let's say y > window.innerHeight - 300
    const itemCenterY = item.y + 40; // Approx center
    const itemCenterX = item.x + 40;

    let loaded = false;

    if (itemCenterY > window.innerHeight - 300) {
      // Check which wagon it's closest to
      const correctWagonIndex = wagons.findIndex(w => w.shape === item.shape);
      const wagon = wagons[correctWagonIndex];
      
      // If within horizontal bounds of the correct wagon
      if (Math.abs(itemCenterX - wagon.targetX) < 100) {
        loaded = true;
        audioSynth.playClick();
        const yOffset = Math.random() * 20;
        setItems(prev => prev.map(i => {
          if (i.uid === id) {
            return { 
              ...i, 
              isLoaded: true, 
              x: wagon.targetX - 40, // Center in wagon
              y: window.innerHeight - 150 - yOffset, // Inside wagon
              wagonIdx: correctWagonIndex,
              yOffset: yOffset
            };
          }
          return i;
        }));
      }
    }

    if (!loaded) {
      // Play error sound and bounce back
      // Simple implementation: just snap back to sky
      setItems(prev => prev.map(i => {
        if (i.uid === id) {
          return { ...i, y: 100 + Math.random() * 100 }; // bounce back up
        }
        return i;
      }));
    }

    dragInfo.current = { id: null, offsetX: 0, offsetY: 0 };
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={drag}
      onMouseUp={endDrag}
      onMouseLeave={endDrag}
      onTouchMove={drag}
      onTouchEnd={endDrag}
      style={{
        position: 'fixed', inset: 0,
        background: 'linear-gradient(to bottom, #87ceeb 0%, #e0f6ff 100%)', // Sky background
        display: 'flex', flexDirection: 'column',
        fontFamily: 'Fredoka, sans-serif',
        overflow: 'hidden',
        touchAction: 'none'
      }}
    >
      <style>{`
        @keyframes puff {
          0% { transform: scale(0.5) translateY(0); opacity: 0.8; }
          100% { transform: scale(2) translateY(-50px); opacity: 0; }
        }
        .smoke {
          position: absolute;
          background: white;
          border-radius: 50%;
          animation: puff 1.5s infinite linear;
        }
      `}</style>

      {/* Header */}
      <div style={{
        padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)', zIndex: 100
      }}>
        <button onClick={onBack} style={{
          background: 'white', border: 'none', borderRadius: '50%',
          width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)', cursor: 'pointer', color: '#db2777'
        }}>
          <ArrowLeft size={24} />
        </button>
        
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>
          {lang === 'en' ? 'Shape Sorting Train' : '形状分类小火车'} - Lv {level}
        </div>

        <button onClick={initLevel} style={{
          background: 'white', border: 'none', borderRadius: '50%',
          width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)', cursor: 'pointer', color: '#64748b'
        }}>
          <RefreshCcw size={22} />
        </button>
      </div>

      {/* Draggable Items */}
      {items.map(item => (
        <div
          key={item.uid}
          onMouseDown={(e) => startDrag(e, item)}
          onTouchStart={(e) => startDrag(e, item)}
          style={{
            position: 'absolute',
            left: 0, top: 0,
            transform: `translate(${item.x}px, ${item.y}px) ${item.isLoaded ? 'scale(0.8)' : 'scale(1)'} ${
              trainState === 'departing' ? 'translateX(-100vw)' : ''
            }`,
            fontSize: '4rem',
            cursor: item.isLoaded ? 'default' : 'grab',
            zIndex: item.isLoaded ? 10 : 50,
            transition: dragInfo.current.id === item.uid 
              ? 'none' 
              : trainState === 'departing'
                ? 'transform 3s ease-in'
                : 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
            userSelect: 'none'
          }}
        >
          {item.emoji}
        </div>
      ))}

      {/* Ground */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '120px',
        background: '#86efac', borderTop: '10px solid #22c55e', zIndex: 1
      }}>
        {/* Tracks */}
        <div style={{ position: 'absolute', top: '10px', left: 0, right: 0, height: '8px', background: '#94a3b8' }}></div>
        <div style={{ position: 'absolute', top: '30px', left: 0, right: 0, height: '8px', background: '#94a3b8' }}></div>
        {/* Sleepers */}
        {Array.from({length: 40}).map((_, i) => (
          <div key={i} style={{ position: 'absolute', top: '5px', left: `${i * 30}px`, width: '8px', height: '38px', background: '#78350f' }}></div>
        ))}
      </div>

      {/* Train Assembly */}
      <div style={{
        position: 'absolute',
        bottom: '80px',
        left: 0,
        height: '200px',
        width: '100%',
        zIndex: 20,
        transform: trainState === 'arriving' 
          ? 'translateX(100vw)' 
          : trainState === 'departing' 
            ? 'translateX(-100vw)' 
            : 'translateX(0)',
        transition: trainState === 'playing' ? 'transform 2s ease-out' : 'transform 3s ease-in',
        pointerEvents: 'none' // Let drops pass through
      }}>
        
        {/* Locomotive */}
        <div style={{
          position: 'absolute',
          left: `${window.innerWidth > 800 ? window.innerWidth / 2 + 150 : window.innerWidth / 2 + 100}px`,
          bottom: '40px',
          width: '140px', height: '120px',
        }}>
          {/* Cab */}
          <div style={{ position: 'absolute', right: 0, bottom: 0, width: '60px', height: '120px', background: '#ef4444', borderRadius: '10px 10px 0 0' }}></div>
          {/* Window */}
          <div style={{ position: 'absolute', right: '10px', bottom: '60px', width: '40px', height: '40px', background: '#bae6fd', borderRadius: '5px' }}></div>
          {/* Boiler */}
          <div style={{ position: 'absolute', right: '60px', bottom: 0, width: '80px', height: '70px', background: '#ef4444', borderRadius: '35px 0 0 0' }}></div>
          {/* Chimney */}
          <div style={{ position: 'absolute', right: '110px', bottom: '70px', width: '20px', height: '40px', background: '#1f2937' }}></div>
          {/* Wheels */}
          <div style={{ position: 'absolute', right: '10px', bottom: '-20px', width: '40px', height: '40px', background: '#1f2937', borderRadius: '50%', border: '4px solid #94a3b8' }}></div>
          <div style={{ position: 'absolute', right: '80px', bottom: '-20px', width: '40px', height: '40px', background: '#1f2937', borderRadius: '50%', border: '4px solid #94a3b8' }}></div>
          
          {/* Smoke */}
          {trainState !== 'playing' && (
            <>
              <div className="smoke" style={{ width: '30px', height: '30px', right: '105px', bottom: '110px', animationDelay: '0s' }}></div>
              <div className="smoke" style={{ width: '25px', height: '25px', right: '105px', bottom: '110px', animationDelay: '0.5s' }}></div>
              <div className="smoke" style={{ width: '35px', height: '35px', right: '105px', bottom: '110px', animationDelay: '1s' }}></div>
            </>
          )}
        </div>

        {/* Wagons */}
        {wagons.map((wagon, idx) => (
          <div key={wagon.id} style={{
            position: 'absolute',
            left: `${wagon.targetX - 70}px`, // center is targetX
            bottom: '40px',
            width: '140px', height: '80px',
            background: wagon.color,
            borderRadius: '10px 10px 0 0',
            border: '4px solid rgba(0,0,0,0.1)',
            display: 'flex', justifyContent: 'center', alignItems: 'center'
          }}>
            {/* Connector */}
            <div style={{ position: 'absolute', right: '-20px', bottom: '10px', width: '20px', height: '6px', background: '#475569' }}></div>
            
            {/* Shape Label */}
            <div style={{ 
              fontSize: '3rem', 
              background: 'rgba(255,255,255,0.4)', 
              width: '60px', height: '60px', 
              borderRadius: '50%', 
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
            }}>
              {SHAPE_ICONS[wagon.shape]}
            </div>

            {/* Wheels */}
            <div style={{ position: 'absolute', left: '10px', bottom: '-20px', width: '30px', height: '30px', background: '#1f2937', borderRadius: '50%', border: '3px solid #94a3b8' }}></div>
            <div style={{ position: 'absolute', right: '10px', bottom: '-20px', width: '30px', height: '30px', background: '#1f2937', borderRadius: '50%', border: '3px solid #94a3b8' }}></div>
          </div>
        ))}

      </div>

    </div>
  );
}

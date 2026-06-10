import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowUp, ArrowDown, ArrowRight, Play, RefreshCw, X } from 'lucide-react';
import { audioSynth } from '../utils/audioSynth';

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

const LEVELS = [
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
  // 8
  { theme: 'penguin', size: 7, start: { r: 3, c: 3 }, target: { r: 0, c: 0 }, obstacles: [{ r: 2, c: 3 }, { r: 4, c: 3 }, { r: 3, c: 2 }, { r: 3, c: 4 }, { r: 1, c: 1 }] },
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
  { theme: 'alien', size: 7, start: { r: 3, c: 0 }, target: { r: 3, c: 6 }, obstacles: [{ r: 3, c: 3 }, { r: 2, c: 3 }, { r: 4, c: 3 }, { r: 1, c: 2 }, { r: 5, c: 2 }, { r: 1, c: 4 }, { r: 5, c: 4 }] },
  // 16
  { theme: 'rabbit', size: 6, start: { r: 0, c: 3 }, target: { r: 5, c: 3 }, obstacles: [{ r: 2, c: 0 }, { r: 2, c: 1 }, { r: 2, c: 2 }, { r: 2, c: 3 }, { r: 3, c: 3 }, { r: 3, c: 4 }, { r: 3, c: 5 }] },
  // 17
  { theme: 'cat', size: 7, start: { r: 6, c: 6 }, target: { r: 0, c: 0 }, obstacles: [{ r: 5, c: 6 }, { r: 4, c: 5 }, { r: 3, c: 4 }, { r: 2, c: 3 }, { r: 1, c: 2 }, { r: 0, c: 1 }, { r: 5, c: 1 }, { r: 1, c: 5 }] },
  // 18
  { theme: 'dog', size: 7, start: { r: 0, c: 0 }, target: { r: 6, c: 6 }, obstacles: [{ r: 1, c: 1 }, { r: 2, c: 2 }, { r: 3, c: 3 }, { r: 4, c: 4 }, { r: 5, c: 5 }, { r: 0, c: 2 }, { r: 2, c: 0 }, { r: 4, c: 6 }, { r: 6, c: 4 }] },
  // 19
  { theme: 'fox', size: 7, start: { r: 6, c: 3 }, target: { r: 0, c: 3 }, obstacles: [{ r: 5, c: 2 }, { r: 5, c: 3 }, { r: 5, c: 4 }, { r: 3, c: 0 }, { r: 3, c: 1 }, { r: 3, c: 2 }, { r: 3, c: 4 }, { r: 3, c: 5 }, { r: 3, c: 6 }, { r: 1, c: 2 }, { r: 1, c: 3 }, { r: 1, c: 4 }] },
  // 20
  { theme: 'mouse', size: 7, start: { r: 3, c: 3 }, target: { r: 0, c: 6 }, obstacles: [{ r: 2, c: 2 }, { r: 2, c: 3 }, { r: 2, c: 4 }, { r: 3, c: 2 }, { r: 3, c: 4 }, { r: 4, c: 2 }, { r: 4, c: 3 }, { r: 4, c: 4 }, { r: 0, c: 0 }, { r: 6, c: 6 }] }
];

export default function CodingMazeGame({ lang, onBack }) {
  const [levelIdx, setLevelIdx] = useState(0);
  const [commands, setCommands] = useState([]);
  const [pos, setPos] = useState({ ...LEVELS[0].start });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [executingIdx, setExecutingIdx] = useState(-1);
  const [isShaking, setIsShaking] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  
  const [isMobile, setIsMobile] = useState(false);
  const resetTimeoutRef = useRef(null);
  const [mazeSize, setMazeSize] = useState(200);

  const currentLevel = LEVELS[levelIdx];

  // Calculate maze size from actual viewport dimensions
  useEffect(() => {
    const calcLayout = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const mobile = vw < 600;
      setIsMobile(mobile);

      // Fixed UI heights (header + status + commands + controls + run button + paddings)
      // On mobile: header~36 + status~22 + commands~48 + controls~52 + button~40 + gaps/margins~50 + card padding~20 + viewport padding~24 = ~292
      // On desktop: header~48 + status~28 + commands~70 + controls~72 + button~52 + gaps/margins~80 + card padding~48 + viewport padding~44 = ~442
      const fixedUIHeight = mobile ? 280 : 420;
      const availableHeight = vh - fixedUIHeight;
      
      // Width constraint: card max-width 600, minus card padding, minus outer padding
      const cardPadX = mobile ? 20 : 48;
      const outerPadX = mobile ? 8 : 40;
      const viewportPadX = 32; // #app-viewport padding
      const availableWidth = Math.min(vw - outerPadX - viewportPadX, 600 - cardPadX);

      // Maze must be square, take the smaller dimension, clamp to reasonable min/max
      const raw = Math.min(availableWidth, availableHeight);
      const clamped = Math.max(120, Math.min(raw, 500));
      setMazeSize(clamped);
    };

    calcLayout();
    window.addEventListener('resize', calcLayout);
    // Also recalc on orientation change for mobile
    window.addEventListener('orientationchange', () => setTimeout(calcLayout, 150));
    return () => {
      window.removeEventListener('resize', calcLayout);
      window.removeEventListener('orientationchange', calcLayout);
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    resetLevel();
  }, [levelIdx]);

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
  };

  const resetToStart = () => {
    if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    setIsShaking(false);
    setIsJumping(false);
    setPos({ ...currentLevel.start });
    setStatusMsg('');
  };

  const addCommand = (cmd) => {
    if (isPlaying || isSolved) return;
    audioSynth.playClick();
    if (commands.length < 15) {
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

    for (let i = 0; i < commands.length; i++) {
      setExecutingIdx(i);
      const cmd = commands[i];
      await new Promise(res => setTimeout(res, 450));

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
        }, 500);
        return;
      }

      const hitObstacle = currentLevel.obstacles.some(o => o.r === nextR && o.c === nextC);
      if (hitObstacle) {
        audioSynth.playIncorrect();
        setStatusMsg(lang === 'en' ? 'Oops! Hit an obstacle.' : '哎呀，撞到障碍物了。');
        setIsPlaying(false);
        setExecutingIdx(-1);
        setIsShaking(true);
        resetTimeoutRef.current = setTimeout(() => {
          setIsShaking(false);
          setPos({ ...currentLevel.start });
        }, 500);
        return;
      }

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
    } else {
      audioSynth.playIncorrect();
      setStatusMsg(lang === 'en' ? 'Did not reach the target.' : '还没到达终点呢。');
      setIsShaking(true);
      resetTimeoutRef.current = setTimeout(() => {
        setIsShaking(false);
        setPos({ ...currentLevel.start });
      }, 500);
    }
    setIsPlaying(false);
  };

  const nextLevel = () => {
    audioSynth.playClick();
    setLevelIdx((prev) => (prev + 1) % LEVELS.length);
  };

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
    for (let r = 0; r < currentLevel.size; r++) {
      const row = [];
      for (let c = 0; c < currentLevel.size; c++) {
        let content = null;
        let bg = (r + c) % 2 === 0 ? tTheme.bgFloor : tTheme.bgAlt;
        let shadowColor = (r + c) % 2 === 0 ? tTheme.bgAlt : '#cbd5e1';
        let borderColor = (r + c) % 2 === 0 ? tTheme.bgAlt : '#cbd5e1';

        if (r === currentLevel.target.r && c === currentLevel.target.c) {
          content = <span style={{ animation: 'targetPulse 1.5s infinite', display: 'inline-block' }}>{tTheme.target}</span>;
          bg = '#bbf7d0';
          shadowColor = '#86efac';
          borderColor = '#4ade80';
        } else if (currentLevel.obstacles.some(o => o.r === r && o.c === c)) {
          content = <span style={{ animation: 'obstacleSway 3s infinite ease-in-out', display: 'inline-block', transformOrigin: 'bottom center' }}>{tTheme.obstacle}</span>;
          bg = tTheme.bgObstacle;
          shadowColor = '#fca5a5';
          borderColor = '#f87171';
        }

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
            position: 'relative'
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
      <div className="maze-grid-container" style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: `${gridGap}px`,
        padding: `${gridPadding}px`,
        backgroundColor: 'rgba(255,255,255,0.6)',
        borderRadius: isMobile ? '12px' : '20px',
        border: `${isMobile ? 2 : 3}px solid #e2e8f0`,
        width: `${mazeSize}px`,
        height: `${mazeSize}px`,
        boxSizing: 'border-box',
        flexShrink: 0
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
          `}
        </style>
        {grid}
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
          animation: isShaking ? 'heroShake 0.4s' : (isJumping ? 'heroJump 0.5s infinite' : 'none'),
          zIndex: 10,
          filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.25))'
        }}>
          {tTheme.hero}
        </div>
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
      padding: isMobile ? '2px' : '16px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div className="card-shadow" style={{ 
        width: '100%', 
        maxWidth: '600px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        background: 'rgba(255,255,255,0.88)', 
        backdropFilter: 'blur(10px)',
        padding: isMobile ? '6px 8px' : '20px',
        boxSizing: 'border-box'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMobile ? '3px' : '12px' }}>
          <button className="bouncy-button secondary" onClick={onBack} style={{ padding: isMobile ? '5px 7px' : '8px 12px' }}>
            <ArrowLeft size={isMobile ? 16 : 20} />
          </button>
          <h2 style={{ color: '#c0487a', margin: 0, fontSize: isMobile ? '1rem' : '1.4rem' }}>
            {lang === 'en' ? `Maze (${levelIdx + 1}/${LEVELS.length})` : `编程迷宫 (${levelIdx + 1}/${LEVELS.length})`}
          </h2>
          <button className="bouncy-button secondary" onClick={() => { audioSynth.playClick(); resetLevel(); }} style={{ padding: isMobile ? '5px 7px' : '8px 12px' }}>
            <RefreshCw size={isMobile ? 16 : 20} />
          </button>
        </div>

        {/* Maze */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          marginBottom: isMobile ? '3px' : '10px'
        }}>
          {renderGrid()}
        </div>

        {/* Status */}
        <div style={{ height: isMobile ? '16px' : '22px', fontSize: isMobile ? '0.8rem' : '0.95rem', fontWeight: 'bold', color: isSolved ? '#16a34a' : '#c0487a', marginBottom: isMobile ? '2px' : '6px' }}>
          {statusMsg}
        </div>

        {/* Commands strip */}
        <div style={{ 
          width: '100%', 
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
              animation: idx === executingIdx ? 'cmdActive 0.5s' : 'none',
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
        <div style={{ display: 'flex', gap: isMobile ? '6px' : '12px', marginBottom: isMobile ? '4px' : '12px' }}>
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

        {/* Run / Next button */}
        {isSolved ? (
          <button className="bouncy-button primary" onClick={nextLevel} style={{ padding: isMobile ? '6px 14px' : '10px 22px', fontSize: isMobile ? '0.9rem' : '1.15rem' }}>
            {lang === 'en' ? 'Next Maze ➔' : '下一关 ➔'}
          </button>
        ) : (
          <button className="bouncy-button primary" onClick={executeCommands} disabled={isPlaying || commands.length === 0} style={{ padding: isMobile ? '6px 14px' : '10px 22px', fontSize: isMobile ? '0.9rem' : '1.15rem', display: 'flex', alignItems: 'center', gap: '6px', background: isPlaying ? '#94a3b8' : '' }}>
            <Play size={isMobile ? 14 : 18} fill="white" /> {lang === 'en' ? 'Run Code' : '运行程序'}
          </button>
        )}

      </div>
    </div>
  );
}

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
  const [pos, setPos] = useState({ ...LEVELS[0].start }); // Current execution position
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [executingIdx, setExecutingIdx] = useState(-1);
  const [isShaking, setIsShaking] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  
  const [isMobile, setIsMobile] = useState(false);
  const resetTimeoutRef = useRef(null);
  const containerRef = useRef(null);
  const [mazeSize, setMazeSize] = useState(300);

  const currentLevel = LEVELS[levelIdx];

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
      // small delay for animation
      await new Promise(res => setTimeout(res, 500));

      let nextR = currentPos.r;
      let nextC = currentPos.c;

      if (cmd === 'UP') nextR--;
      if (cmd === 'DOWN') nextR++;
      if (cmd === 'LEFT') nextC--;
      if (cmd === 'RIGHT') nextC++;

      // Check bounds
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

      // Check obstacles
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
      audioSynth.playClick(); // step sound
    }

    setExecutingIdx(-1);
    await new Promise(res => setTimeout(res, 300));

    // Check if target reached
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

  // Dynamic layout parameters based on measured mazeSize
  const size = currentLevel.size;
  const gridPadding = isMobile ? 6 : 12;
  const gridGap = isMobile ? 4 : 8;
  const cellSize = (mazeSize - 2 * gridPadding - (size - 1) * gridGap) / size;

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
          content = <span style={{ animation: 'obstacleSway 3s infinite ease-in-out', display: 'inline-block', transformOrigin: 'bottom center', transform: `scale(${isMobile ? 1.05 : 1.2}) translateY(-5px)` }}>{tTheme.obstacle}</span>;
          bg = tTheme.bgObstacle;
          shadowColor = '#fca5a5';
          borderColor = '#f87171';
        }

        row.push(
          <div key={`${r}-${c}`} style={{
            flex: 1,
            height: '100%',
            backgroundColor: bg,
            borderRadius: isMobile ? '8px' : '14px',
            border: `2px solid ${borderColor}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: `${cellSize * 0.65}px`,
            boxShadow: `0 ${isMobile ? 3 : 6}px 0 ${shadowColor}, 0 ${isMobile ? 4 : 8}px ${isMobile ? 5 : 10}px rgba(0,0,0,0.1)`,
            position: 'relative',
            transform: `translateY(-${isMobile ? 3 : 6}px)`
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
        borderRadius: isMobile ? '16px' : '24px',
        border: '4px solid #e2e8f0',
        width: `${mazeSize}px`,
        height: `${mazeSize}px`,
        boxSizing: 'border-box'
      }}>
        <style>
          {`
            @keyframes targetPulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.15); filter: brightness(1.2); }
            }
            @keyframes heroShake {
              0%, 100% { transform: translateX(0); }
              25% { transform: translateX(-8px) rotate(-10deg); }
              50% { transform: translateX(8px) rotate(10deg); }
              75% { transform: translateX(-8px) rotate(-10deg); }
            }
            @keyframes heroJump {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-20px) scale(1.1); }
            }
            @keyframes cmdActive {
              0% { transform: scale(1) translateY(-2px); box-shadow: 0 4px 0 #1e40af; }
              50% { transform: scale(1.15) translateY(-6px); box-shadow: 0 8px 15px rgba(59, 130, 246, 0.7), 0 4px 0 #1e40af; z-index: 10; }
              100% { transform: scale(1) translateY(-2px); box-shadow: 0 4px 0 #1e40af; }
            }
            @keyframes obstacleSway {
              0%, 100% { transform: rotate(0deg); }
              50% { transform: rotate(5deg); }
            }
          `}
        </style>
        {grid}
        {/* Animated Robot Overlay - perfectly aligned via percentages of parent width/height */}
        <div style={{
          position: 'absolute',
          top: `calc(${gridPadding}px + ${pos.r} * (100% - ${2 * gridPadding}px + ${gridGap}px) / ${size})`,
          left: `calc(${gridPadding}px + ${pos.c} * (100% - ${2 * gridPadding}px + ${gridGap}px) / ${size})`,
          width: `calc((100% - ${2 * gridPadding}px - ${(size - 1) * gridGap}px) / ${size})`,
          height: `calc((100% - ${2 * gridPadding}px - ${(size - 1) * gridGap}px) / ${size})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: `${cellSize * 0.75}px`,
          transition: 'all 0.45s cubic-bezier(0.25, 1, 0.5, 1)',
          animation: isShaking ? 'heroShake 0.4s' : (isJumping ? 'heroJump 0.5s infinite' : 'none'),
          zIndex: 10,
          filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))'
        }}>
          {tTheme.hero}
        </div>
      </div>
    );
  };

  const getCmdIcon = (cmd) => {
    if (cmd === 'UP') return <ArrowUp size={20} />;
    if (cmd === 'DOWN') return <ArrowDown size={20} />;
    if (cmd === 'LEFT') return <ArrowLeft size={20} />;
    if (cmd === 'RIGHT') return <ArrowRight size={20} />;
    return null;
  };

  return (
    <div className="screen-wrapper fade-in" style={{ padding: isMobile ? '4px' : '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="card-shadow" style={{ 
        width: '100%', 
        height: '100%',
        maxWidth: '600px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        background: 'rgba(255,255,255,0.85)', 
        backdropFilter: 'blur(10px)',
        padding: isMobile ? '8px 10px' : '24px',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMobile ? '4px' : '16px', flexShrink: 0 }}>
          <button className="bouncy-button secondary" onClick={onBack} style={{ padding: isMobile ? '6px 8px' : '8px 12px' }}>
            <ArrowLeft size={isMobile ? 16 : 20} />
          </button>
          <h2 style={{ color: '#c0487a', margin: 0, fontSize: isMobile ? '1.1rem' : '1.5rem' }}>
            {lang === 'en' ? `Coding Maze (${levelIdx + 1}/${LEVELS.length})` : `编程迷宫 (第 ${levelIdx + 1}/${LEVELS.length} 关)`}
          </h2>
          <button className="bouncy-button secondary" onClick={() => { audioSynth.playClick(); resetLevel(); }} style={{ padding: isMobile ? '6px 8px' : '8px 12px' }}>
            <RefreshCw size={isMobile ? 16 : 20} />
          </button>
        </div>

        {/* Maze Container */}
        <div ref={containerRef} style={{ 
          flex: '1 1 0', 
          width: '100%', 
          minHeight: '150px',
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          marginBottom: isMobile ? '4px' : '12px'
        }}>
          {mazeSize > 0 && renderGrid()}
        </div>

        {/* Status Msg */}
        <div style={{ height: isMobile ? '18px' : '24px', flexShrink: 0, fontSize: isMobile ? '0.85rem' : '1rem', fontWeight: 'bold', color: isSolved ? '#16a34a' : '#c0487a', marginBottom: isMobile ? '4px' : '8px' }}>
          {statusMsg}
        </div>

        {/* Commands Line */}
        <div style={{ 
          width: '100%', 
          flexShrink: 0,
          minHeight: isMobile ? '40px' : '60px', 
          maxHeight: isMobile ? '80px' : '120px',
          overflowY: 'auto',
          border: '3px solid #cbd5e1', 
          borderRadius: '12px', 
          display: 'flex', 
          flexWrap: 'wrap', 
          alignContent: 'flex-start',
          gap: isMobile ? '4px' : '8px', 
          padding: isMobile ? '4px' : '8px', 
          marginBottom: isMobile ? '8px' : '16px',
          backgroundColor: '#f8fafc', 
          boxShadow: 'inset 0 4px 6px rgba(0,0,0,0.05)',
          boxSizing: 'border-box'
        }}>
          {commands.length === 0 && <div style={{ color: '#94a3b8', width: '100%', textAlign: 'center', fontWeight: 'bold', fontSize: isMobile ? '0.8rem' : '1rem', marginTop: '4px' }}>{lang === 'en' ? 'Add commands below' : '在下方添加指令'}</div>}
          {commands.map((cmd, idx) => (
            <div key={idx} onClick={() => removeCommand(idx)} style={{
              width: isMobile ? '30px' : '45px', 
              height: isMobile ? '30px' : '45px', 
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white',
              borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: isPlaying || isSolved ? 'default' : 'pointer', 
              boxShadow: `0 ${isMobile ? 2 : 4}px 0 #1e40af`,
              position: 'relative',
              transform: `translateY(-${isMobile ? 1 : 2}px)`,
              animation: idx === executingIdx ? 'cmdActive 0.5s' : 'none',
              zIndex: idx === executingIdx ? 10 : 1
            }}>
              <span style={{ transform: isMobile ? 'scale(0.75)' : 'none' }}>{getCmdIcon(cmd)}</span>
              
              {/* Step Number Badge */}
              <div style={{ 
                position: 'absolute', 
                top: isMobile ? -3 : -6, 
                left: isMobile ? -3 : -6, 
                background: '#10b981', 
                color: 'white', 
                fontSize: isMobile ? '0.6rem' : '0.75rem', 
                fontWeight: 'bold', 
                width: isMobile ? '13px' : '20px', 
                height: isMobile ? '13px' : '20px', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)' 
              }}>
                {idx + 1}
              </div>

              {!isPlaying && !isSolved && (
                <div style={{ 
                  position: 'absolute', 
                  top: isMobile ? -3 : -6, 
                  right: isMobile ? -3 : -6, 
                  background: '#ef4444', 
                  borderRadius: '50%', 
                  padding: '1px', 
                  color: 'white', 
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)' 
                }}>
                  <X size={isMobile ? 8 : 12} strokeWidth={3} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', flexShrink: 0, gap: isMobile ? '8px' : '15px', marginBottom: isMobile ? '8px' : '16px' }}>
          {['UP', 'DOWN', 'LEFT', 'RIGHT'].map(cmd => (
            <button key={cmd} onClick={() => addCommand(cmd)} disabled={isPlaying || isSolved}
              style={{
                width: isMobile ? '44px' : '60px', 
                height: isMobile ? '44px' : '60px',
                borderRadius: '16px',
                background: isPlaying || isSolved ? '#cbd5e1' : 'linear-gradient(135deg, #fcd34d, #f59e0b)',
                border: 'none', color: isPlaying || isSolved ? '#94a3b8' : 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: isPlaying || isSolved ? 'none' : `0 ${isMobile ? 3 : 6}px 0 #d97706`,
                cursor: isPlaying || isSolved ? 'default' : 'pointer',
                transform: `translateY(-${isMobile ? 1 : 2}px)`,
                transition: 'all 0.1s'
              }}
              onMouseDown={e => { if(!isPlaying && !isSolved) { e.currentTarget.style.transform = `translateY(${isMobile ? 2 : 4}px)`; e.currentTarget.style.boxShadow = '0 0 0 #d97706'; } }}
              onMouseUp={e => { if(!isPlaying && !isSolved) { e.currentTarget.style.transform = `translateY(-${isMobile ? 1 : 2}px)`; e.currentTarget.style.boxShadow = `0 ${isMobile ? 3 : 6}px 0 #d97706`; } }}
              onMouseLeave={e => { if(!isPlaying && !isSolved) { e.currentTarget.style.transform = `translateY(-${isMobile ? 1 : 2}px)`; e.currentTarget.style.boxShadow = `0 ${isMobile ? 3 : 6}px 0 #d97706`; } }}
            >
              <span style={{ transform: isMobile ? 'scale(0.8)' : 'none' }}>{getCmdIcon(cmd)}</span>
            </button>
          ))}
        </div>

        {isSolved ? (
          <button className="bouncy-button primary" onClick={nextLevel} style={{ flexShrink: 0, padding: isMobile ? '8px 16px' : '12px 24px', fontSize: isMobile ? '0.95rem' : '1.2rem', marginBottom: '8px' }}>
            {lang === 'en' ? 'Next Maze ➔' : '下一关 ➔'}
          </button>
        ) : (
          <button className="bouncy-button primary" onClick={executeCommands} disabled={isPlaying || commands.length === 0} style={{ flexShrink: 0, padding: isMobile ? '8px 16px' : '12px 24px', fontSize: isMobile ? '0.95rem' : '1.2rem', display: 'flex', alignItems: 'center', gap: '8px', background: isPlaying ? '#94a3b8' : '', marginBottom: '8px' }}>
            <Play size={isMobile ? 14 : 20} fill="white" /> {lang === 'en' ? 'Run Code' : '运行程序'}
          </button>
        )}

      </div>
    </div>
  );
}

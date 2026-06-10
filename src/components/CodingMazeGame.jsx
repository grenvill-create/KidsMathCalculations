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

  const currentLevel = LEVELS[levelIdx];

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 600);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
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

  const addCommand = (cmd) => {
    if (isPlaying || isSolved) return;
    audioSynth.playClick();
    if (commands.length < 15) {
      setCommands([...commands, cmd]);
    }
  };

  const removeCommand = (idx) => {
    if (isPlaying || isSolved) return;
    audioSynth.playClick();
    setCommands(commands.filter((_, i) => i !== idx));
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
        }, 1200);
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
        }, 1200);
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
      }, 1200);
    }
    setIsPlaying(false);
  };

  const nextLevel = () => {
    audioSynth.playClick();
    setLevelIdx((prev) => (prev + 1) % LEVELS.length);
  };

  // Grid scaling math for mobile layouts
  const size = currentLevel.size;
  let cellSize = 60;
  let colGap = 8;
  let rowGap = 14;
  let padding = 20;

  if (isMobile) {
    if (size >= 7) {
      cellSize = 36;
      colGap = 4;
      rowGap = 8;
      padding = 10;
    } else if (size === 6) {
      cellSize = 42;
      colGap = 5;
      rowGap = 10;
      padding = 12;
    } else {
      cellSize = 48;
      colGap = 6;
      rowGap = 12;
      padding = 15;
    }
  } else {
    if (size >= 7) {
      cellSize = 50;
      colGap = 6;
      rowGap = 10;
      padding = 16;
    }
  }

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
            width: `${cellSize}px`, height: `${cellSize}px`,
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
      grid.push(<div key={r} style={{ display: 'flex', gap: `${colGap}px` }}>{row}</div>);
    }
    return (
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: `${rowGap}px`, padding: `${padding}px`, backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: '24px', border: '4px solid #e2e8f0' }}>
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
        {/* Animated Robot Overlay */}
        <div style={{
          position: 'absolute',
          top: `calc(${padding}px + ${pos.r * (cellSize + rowGap)}px)`,
          left: `calc(${padding}px + ${pos.c * (cellSize + colGap)}px)`,
          width: `${cellSize}px`, height: `${cellSize}px`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: `${cellSize * 0.75}px`,
          transition: isShaking || isJumping ? 'none' : 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
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
    <div className="screen-wrapper fade-in" style={{ padding: isMobile ? '10px 6px' : '20px', overflowY: 'auto' }}>
      <div className="card-shadow" style={{ 
        width: '100%', 
        maxWidth: '600px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        background: 'rgba(255,255,255,0.85)', 
        backdropFilter: 'blur(10px)',
        padding: isMobile ? '12px 14px' : '24px'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMobile ? '10px' : '20px' }}>
          <button className="bouncy-button secondary" onClick={onBack} style={{ padding: isMobile ? '6px 10px' : '8px 12px' }}>
            <ArrowLeft size={isMobile ? 16 : 20} />
          </button>
          <h2 style={{ color: '#c0487a', margin: 0, fontSize: isMobile ? '1.15rem' : '1.5rem' }}>
            {lang === 'en' ? `Coding Maze (${levelIdx + 1}/${LEVELS.length})` : `编程迷宫 (第 ${levelIdx + 1}/${LEVELS.length} 关)`}
          </h2>
          <button className="bouncy-button secondary" onClick={() => { audioSynth.playClick(); resetLevel(); }} style={{ padding: isMobile ? '6px 10px' : '8px 12px' }}>
            <RefreshCw size={isMobile ? 16 : 20} />
          </button>
        </div>

        {/* Maze & Status */}
        <div style={{ marginBottom: isMobile ? '10px' : '20px' }}>
          {renderGrid()}
        </div>

        <div style={{ height: isMobile ? '20px' : '24px', fontSize: isMobile ? '0.9rem' : '1rem', fontWeight: 'bold', color: isSolved ? '#16a34a' : '#c0487a', marginBottom: isMobile ? '6px' : '10px' }}>
          {statusMsg}
        </div>

        {/* Commands Line */}
        <div style={{ 
          width: '100%', 
          minHeight: isMobile ? '52px' : '70px', 
          border: '3px solid #cbd5e1', 
          borderRadius: '16px', 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: isMobile ? '4px' : '8px', 
          padding: isMobile ? '6px' : '12px', 
          marginBottom: isMobile ? '10px' : '20px',
          backgroundColor: '#f8fafc', 
          boxShadow: 'inset 0 4px 6px rgba(0,0,0,0.05)'
        }}>
          {commands.length === 0 && <div style={{ color: '#94a3b8', alignSelf: 'center', width: '100%', textAlign: 'center', fontWeight: 'bold', fontSize: isMobile ? '0.85rem' : '1rem' }}>{lang === 'en' ? 'Add commands below' : '在下方添加指令'}</div>}
          {commands.map((cmd, idx) => (
            <div key={idx} onClick={() => removeCommand(idx)} style={{
              width: isMobile ? '34px' : '45px', 
              height: isMobile ? '34px' : '45px', 
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white',
              borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: isPlaying || isSolved ? 'default' : 'pointer', 
              boxShadow: `0 ${isMobile ? 2 : 4}px 0 #1e40af`,
              position: 'relative',
              transform: `translateY(-${isMobile ? 1 : 2}px)`,
              animation: idx === executingIdx ? 'cmdActive 0.5s' : 'none',
              zIndex: idx === executingIdx ? 10 : 1
            }}>
              <span style={{ transform: isMobile ? 'scale(0.8)' : 'none' }}>{getCmdIcon(cmd)}</span>
              
              {/* Step Number Badge */}
              <div style={{ 
                position: 'absolute', 
                top: isMobile ? -4 : -6, 
                left: isMobile ? -4 : -6, 
                background: '#10b981', 
                color: 'white', 
                fontSize: isMobile ? '0.65rem' : '0.75rem', 
                fontWeight: 'bold', 
                width: isMobile ? '15px' : '20px', 
                height: isMobile ? '15px' : '20px', 
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
                  top: isMobile ? -4 : -6, 
                  right: isMobile ? -4 : -6, 
                  background: '#ef4444', 
                  borderRadius: '50%', 
                  padding: '1px', 
                  color: 'white', 
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)' 
                }}>
                  <X size={isMobile ? 10 : 12} strokeWidth={3} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: isMobile ? '10px' : '15px', marginBottom: isMobile ? '12px' : '25px' }}>
          {['UP', 'DOWN', 'LEFT', 'RIGHT'].map(cmd => (
            <button key={cmd} onClick={() => addCommand(cmd)} disabled={isPlaying || isSolved}
              style={{
                width: isMobile ? '50px' : '60px', 
                height: isMobile ? '50px' : '60px',
                borderRadius: '16px',
                background: isPlaying || isSolved ? '#cbd5e1' : 'linear-gradient(135deg, #fcd34d, #f59e0b)',
                border: 'none', color: isPlaying || isSolved ? '#94a3b8' : 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: isPlaying || isSolved ? 'none' : `0 ${isMobile ? 4 : 6}px 0 #d97706`,
                cursor: isPlaying || isSolved ? 'default' : 'pointer',
                transform: `translateY(-${isMobile ? 1 : 2}px)`,
                transition: 'all 0.1s'
              }}
              onMouseDown={e => { if(!isPlaying && !isSolved) { e.currentTarget.style.transform = `translateY(${isMobile ? 3 : 4}px)`; e.currentTarget.style.boxShadow = '0 0 0 #d97706'; } }}
              onMouseUp={e => { if(!isPlaying && !isSolved) { e.currentTarget.style.transform = `translateY(-${isMobile ? 1 : 2}px)`; e.currentTarget.style.boxShadow = `0 ${isMobile ? 4 : 6}px 0 #d97706`; } }}
              onMouseLeave={e => { if(!isPlaying && !isSolved) { e.currentTarget.style.transform = `translateY(-${isMobile ? 1 : 2}px)`; e.currentTarget.style.boxShadow = `0 ${isMobile ? 4 : 6}px 0 #d97706`; } }}
            >
              <span style={{ transform: isMobile ? 'scale(0.85)' : 'none' }}>{getCmdIcon(cmd)}</span>
            </button>
          ))}
        </div>

        {isSolved ? (
          <button className="bouncy-button primary" onClick={nextLevel} style={{ padding: isMobile ? '10px 20px' : '12px 24px', fontSize: isMobile ? '1rem' : '1.2rem' }}>
            {lang === 'en' ? 'Next Maze ➔' : '下一关 ➔'}
          </button>
        ) : (
          <button className="bouncy-button primary" onClick={executeCommands} disabled={isPlaying || commands.length === 0} style={{ padding: isMobile ? '10px 20px' : '12px 24px', fontSize: isMobile ? '1rem' : '1.2rem', display: 'flex', alignItems: 'center', gap: '8px', background: isPlaying ? '#94a3b8' : '' }}>
            <Play size={isMobile ? 16 : 20} fill="white" /> {lang === 'en' ? 'Run Code' : '运行程序'}
          </button>
        )}

      </div>
    </div>
  );
}

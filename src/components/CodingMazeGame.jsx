import React, { useState, useEffect } from 'react';
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
  { theme: 'alien', size: 7, start: { r: 6, c: 3 }, target: { r: 0, c: 3 }, obstacles: [{ r: 5, c: 2 }, { r: 5, c: 3 }, { r: 5, c: 4 }, { r: 3, c: 1 }, { r: 3, c: 2 }, { r: 3, c: 4 }, { r: 3, c: 5 }, { r: 1, c: 2 }, { r: 1, c: 3 }, { r: 1, c: 4 }] }
];

export default function CodingMazeGame({ lang, onBack }) {
  const [levelIdx, setLevelIdx] = useState(0);
  const [commands, setCommands] = useState([]);
  const [pos, setPos] = useState({ r: 3, c: 0 }); // Current execution position
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [executingIdx, setExecutingIdx] = useState(-1);
  const [isShaking, setIsShaking] = useState(false);
  const [isJumping, setIsJumping] = useState(false);

  const currentLevel = LEVELS[levelIdx];

  useEffect(() => {
    resetLevel();
  }, [levelIdx]);

  const resetLevel = () => {
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
        setTimeout(() => setIsShaking(false), 500);
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
        setTimeout(() => setIsShaking(false), 500);
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
    }
    setIsPlaying(false);
  };

  const nextLevel = () => {
    audioSynth.playClick();
    setLevelIdx((prev) => (prev + 1) % LEVELS.length);
  };

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
          content = <span style={{ animation: 'obstacleSway 3s infinite ease-in-out', display: 'inline-block', transformOrigin: 'bottom center', transform: 'scale(1.2) translateY(-5px)' }}>{tTheme.obstacle}</span>;
          bg = tTheme.bgObstacle;
          shadowColor = '#fca5a5';
          borderColor = '#f87171';
        }

        row.push(
          <div key={`${r}-${c}`} style={{
            width: '60px', height: '60px',
            backgroundColor: bg,
            borderRadius: '14px',
            border: `2px solid ${borderColor}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.5rem',
            boxShadow: `0 6px 0 ${shadowColor}, 0 8px 10px rgba(0,0,0,0.1)`,
            position: 'relative',
            transform: 'translateY(-6px)'
          }}>
            {content}
          </div>
        );
      }
      grid.push(<div key={r} style={{ display: 'flex', gap: '8px' }}>{row}</div>);
    }
    return (
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '14px', padding: '20px', backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: '24px', border: '4px solid #e2e8f0' }}>
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
          top: `calc(20px + ${pos.r * 74}px)`, // 60px + 14px gap
          left: `calc(20px + ${pos.c * 68}px)`, // 60px + 8px gap
          width: '60px', height: '60px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '3rem',
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
    <div className="screen-wrapper fade-in" style={{ padding: '20px', overflowY: 'auto' }}>
      <div className="card-shadow" style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <button className="bouncy-button secondary" onClick={onBack} style={{ padding: '8px 12px' }}>
            <ArrowLeft size={20} />
          </button>
          <h2 style={{ color: '#c0487a', margin: 0 }}>{lang === 'en' ? 'Coding Maze' : '编程迷宫'}</h2>
          <button className="bouncy-button secondary" onClick={() => { audioSynth.playClick(); resetLevel(); }} style={{ padding: '8px 12px' }}>
            <RefreshCw size={20} />
          </button>
        </div>

        {/* Maze & Status */}
        <div style={{ marginBottom: '20px' }}>
          {renderGrid()}
        </div>

        <div style={{ height: '24px', fontWeight: 'bold', color: isSolved ? '#16a34a' : '#c0487a', marginBottom: '10px' }}>
          {statusMsg}
        </div>

        {/* Commands Line */}
        <div style={{ 
          width: '100%', minHeight: '70px', border: '3px solid #cbd5e1', borderRadius: '16px', 
          display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '12px', marginBottom: '20px',
          backgroundColor: '#f8fafc', boxShadow: 'inset 0 4px 6px rgba(0,0,0,0.05)'
        }}>
          {commands.length === 0 && <div style={{ color: '#94a3b8', alignSelf: 'center', width: '100%', textAlign: 'center', fontWeight: 'bold' }}>{lang === 'en' ? 'Add commands below' : '在下方添加指令'}</div>}
          {commands.map((cmd, idx) => (
            <div key={idx} onClick={() => removeCommand(idx)} style={{
              width: '45px', height: '45px', 
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white',
              borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: isPlaying || isSolved ? 'default' : 'pointer', 
              boxShadow: '0 4px 0 #1e40af',
              position: 'relative',
              transform: 'translateY(-2px)',
              animation: idx === executingIdx ? 'cmdActive 0.5s' : 'none',
              zIndex: idx === executingIdx ? 10 : 1
            }}>
              {getCmdIcon(cmd)}
              
              {/* Step Number Badge */}
              <div style={{ position: 'absolute', top: -6, left: -6, background: '#10b981', color: 'white', fontSize: '0.75rem', fontWeight: 'bold', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                {idx + 1}
              </div>

              {!isPlaying && !isSolved && (
                <div style={{ position: 'absolute', top: -6, right: -6, background: '#ef4444', borderRadius: '50%', padding: '2px', color: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                  <X size={12} strokeWidth={3} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
          {['UP', 'DOWN', 'LEFT', 'RIGHT'].map(cmd => (
            <button key={cmd} onClick={() => addCommand(cmd)} disabled={isPlaying || isSolved}
              style={{
                width: '60px', height: '60px',
                borderRadius: '16px',
                background: isPlaying || isSolved ? '#cbd5e1' : 'linear-gradient(135deg, #fcd34d, #f59e0b)',
                border: 'none', color: isPlaying || isSolved ? '#94a3b8' : 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: isPlaying || isSolved ? 'none' : '0 6px 0 #d97706',
                cursor: isPlaying || isSolved ? 'default' : 'pointer',
                transform: 'translateY(-2px)',
                transition: 'all 0.1s'
              }}
              onMouseDown={e => { if(!isPlaying && !isSolved) { e.currentTarget.style.transform = 'translateY(4px)'; e.currentTarget.style.boxShadow = '0 0 0 #d97706'; } }}
              onMouseUp={e => { if(!isPlaying && !isSolved) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 0 #d97706'; } }}
              onMouseLeave={e => { if(!isPlaying && !isSolved) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 0 #d97706'; } }}
            >
              {getCmdIcon(cmd)}
            </button>
          ))}
        </div>

        {isSolved ? (
          <button className="bouncy-button primary" onClick={nextLevel} style={{ padding: '12px 24px', fontSize: '1.2rem' }}>
            {lang === 'en' ? 'Next Maze ➔' : '下一关 ➔'}
          </button>
        ) : (
          <button className="bouncy-button primary" onClick={executeCommands} disabled={isPlaying || commands.length === 0} style={{ padding: '12px 24px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px', background: isPlaying ? '#94a3b8' : '' }}>
            <Play size={20} fill="white" /> {lang === 'en' ? 'Run Code' : '运行程序'}
          </button>
        )}

      </div>
    </div>
  );
}

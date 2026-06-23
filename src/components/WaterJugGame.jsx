import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Play, Droplets, Trash2, ArrowRightCircle, ArrowLeftCircle } from 'lucide-react';
import { audioSynth } from '../utils/audioSynth';

const LEVELS = [
  { round: 1, maxA: 3, maxB: 5, target: 4 },
  { round: 2, maxA: 3, maxB: 7, target: 5 },
  { round: 3, maxA: 4, maxB: 9, target: 6 },
];

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

function generateRandomLevel(round) {
  let a, b, target;
  // Make sure a and b are coprime so that any target is possible
  do {
    a = Math.floor(Math.random() * 5) + 3; // 3 to 7
    b = Math.floor(Math.random() * 6) + a + 1; // a+1 to a+6
  } while (gcd(a, b) !== 1);
  
  // Pick a target that is neither a nor b
  do {
    target = Math.floor(Math.random() * b) + 1;
  } while (target === a || target === b);
  
  return { round, maxA: a, maxB: b, target };
}

export default function WaterJugGame({ lang, onBack }) {
  const [round, setRound] = useState(1);
  const [levelInfo, setLevelInfo] = useState(LEVELS[0]);
  const [jugA, setJugA] = useState(0);
  const [jugB, setJugB] = useState(0);
  const [gameState, setGameState] = useState('playing'); // playing | won
  const [moves, setMoves] = useState(0);

  const [history, setHistory] = useState([]);
  const [animatingPour, setAnimatingPour] = useState(null);

  useEffect(() => {
    if (gameState === 'playing' && !animatingPour) {
      if (jugA === levelInfo.target || jugB === levelInfo.target) {
        setGameState('won');
        audioSynth.playWin();
      }
    }
  }, [jugA, jugB, levelInfo.target, gameState, animatingPour]);

  const saveHistory = () => {
    setHistory(prev => [...prev, { jugA, jugB, moves }]);
  };

  const undo = () => {
    if (gameState !== 'playing' || history.length === 0 || animatingPour) return;
    audioSynth.playClick();
    const last = history[history.length - 1];
    setJugA(last.jugA);
    setJugB(last.jugB);
    setMoves(last.moves);
    setHistory(history.slice(0, -1));
  };

  const fillA = () => {
    if (gameState !== 'playing' || jugA === levelInfo.maxA || animatingPour) return;
    audioSynth.playClick();
    saveHistory();
    setJugA(levelInfo.maxA);
    setMoves(m => m + 1);
  };

  const fillB = () => {
    if (gameState !== 'playing' || jugB === levelInfo.maxB || animatingPour) return;
    audioSynth.playClick();
    saveHistory();
    setJugB(levelInfo.maxB);
    setMoves(m => m + 1);
  };

  const emptyA = () => {
    if (gameState !== 'playing' || jugA === 0 || animatingPour) return;
    audioSynth.playClick();
    saveHistory();
    setJugA(0);
    setMoves(m => m + 1);
  };

  const emptyB = () => {
    if (gameState !== 'playing' || jugB === 0 || animatingPour) return;
    audioSynth.playClick();
    saveHistory();
    setJugB(0);
    setMoves(m => m + 1);
  };

  const pourAtoB = () => {
    if (gameState !== 'playing' || jugA === 0 || jugB === levelInfo.maxB || animatingPour) return;
    audioSynth.playCorrect(); // subtle sound for pour
    saveHistory();
    const amount = Math.min(jugA, levelInfo.maxB - jugB);
    setAnimatingPour('AtoB');
    setTimeout(() => {
      setJugA(jugA - amount);
      setJugB(jugB + amount);
      setMoves(m => m + 1);
      setAnimatingPour(null);
    }, 600);
  };

  const pourBtoA = () => {
    if (gameState !== 'playing' || jugB === 0 || jugA === levelInfo.maxA || animatingPour) return;
    audioSynth.playCorrect();
    saveHistory();
    const amount = Math.min(jugB, levelInfo.maxA - jugA);
    setAnimatingPour('BtoA');
    setTimeout(() => {
      setJugB(jugB - amount);
      setJugA(jugA + amount);
      setMoves(m => m + 1);
      setAnimatingPour(null);
    }, 600);
  };

  const nextRound = () => {
    const nextRnd = round + 1;
    setRound(nextRnd);
    if (nextRnd <= LEVELS.length) {
      setLevelInfo(LEVELS[nextRnd - 1]);
    } else {
      setLevelInfo(generateRandomLevel(nextRnd));
    }
    setJugA(0);
    setJugB(0);
    setMoves(0);
    setHistory([]);
    setGameState('playing');
  };

  const restartLevel = () => {
    setJugA(0);
    setJugB(0);
    setMoves(0);
    setHistory([]);
    setGameState('playing');
  };

  return (
    <div className="screen-wrapper fade-in" style={{ padding: '20px', overflowY: 'auto' }}>
      <style>{`
        .jug-container {
          position: relative;
          width: 100px;
          border: 6px solid rgba(255, 255, 255, 0.8);
          border-top: none;
          border-bottom-left-radius: 20px;
          border-bottom-right-radius: 20px;
          background: rgba(255, 255, 255, 0.3);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1), inset 0 0 20px rgba(255,255,255,0.5);
          backdrop-filter: blur(5px);
          overflow: hidden;
          display: flex;
          align-items: flex-end;
          margin: 0 auto;
        }
        .water {
          width: 100%;
          background: linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%);
          transition: height 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: inset 0 4px 6px rgba(255,255,255,0.4);
          position: relative;
        }
        .water::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 6px;
          background: rgba(255,255,255,0.3);
        }
        .action-btn {
          padding: 8px 12px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.9rem;
          border: none;
          cursor: pointer;
          transition: transform 0.1s, box-shadow 0.1s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .action-btn:active {
          transform: scale(0.95);
        }
        .btn-fill {
          background: #eff6ff; color: #3b82f6; box-shadow: 0 4px 0 #bfdbfe;
        }
        .btn-empty {
          background: #fef2f2; color: #ef4444; box-shadow: 0 4px 0 #fecaca;
        }
        .btn-pour {
          background: #fdf4ff; color: #d946ef; box-shadow: 0 4px 0 #f5d0fe; width: 60px; height: 60px; border-radius: 50%;
        }
        @keyframes pour-stream-AtoB {
          0% { clip-path: inset(0 100% 0 0); }
          50% { clip-path: inset(0 0 0 0); }
          100% { clip-path: inset(0 0 0 100%); }
        }
        @keyframes pour-stream-BtoA {
          0% { clip-path: inset(0 0 0 100%); }
          50% { clip-path: inset(0 0 0 0); }
          100% { clip-path: inset(0 100% 0 0); }
        }
      `}</style>

      <div className="card-shadow" style={{
        width: '100%', maxWidth: '600px', margin: '0 auto',
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)',
        padding: '24px', borderRadius: '24px'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
          <button className="bouncy-button secondary" onClick={onBack} style={{ padding: '8px 12px' }}>
            <ArrowLeft size={20}/>
          </button>
          
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>
              <span>{lang === 'en' ? `Level ${round}` : `第 ${round} 关`}</span>
              <span>{lang === 'en' ? `Moves: ${moves}` : `步数: ${moves}`}</span>
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
              {lang === 'en' ? `Target: Get exactly ` : `目标：倒出刚好 `}
              <span style={{ color: '#ef4444', fontSize: '1.6rem' }}>{levelInfo.target}L</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="bouncy-button secondary" onClick={undo} disabled={history.length === 0} style={{ padding: '8px 12px', opacity: history.length === 0 ? 0.5 : 1 }}>
              {lang === 'en' ? 'Undo' : '撤销'}
            </button>
            <button className="bouncy-button secondary" onClick={restartLevel} style={{ padding: '8px 12px' }}>
              <RefreshCw size={20} />
            </button>
          </div>
        </div>

        {/* Game Area */}
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '40px', padding: '0 10px', minHeight: '260px' }}>
          
          {animatingPour && (
            <div style={{
               position: 'absolute', top: '40px', left: '25%', right: '25%', height: '100px',
               borderTop: '8px solid #60a5fa', borderRadius: '50%', borderBottom: 'none', borderLeft: 'none', borderRight: 'none',
               animation: animatingPour === 'AtoB' ? 'pour-stream-AtoB 0.6s ease-in-out forwards' : 'pour-stream-BtoA 0.6s ease-in-out forwards', 
               pointerEvents: 'none', zIndex: 10
            }} />
          )}

          {/* Jug A Area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', zIndex: 5 }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#3b82f6' }}>
               {jugA}L / {levelInfo.maxA}L
            </div>
            <div className="jug-container" style={{ height: `${levelInfo.maxA * 30}px` }}>
              <div className="water" style={{ height: `${(jugA / levelInfo.maxA) * 100}%` }} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
               <button className="action-btn btn-fill" onClick={fillA} disabled={gameState !== 'playing' || animatingPour}>
                 <Droplets size={16} /> {lang === 'en' ? 'Fill' : '装满'}
               </button>
               <button className="action-btn btn-empty" onClick={emptyA} disabled={gameState !== 'playing' || animatingPour}>
                 <Trash2 size={16} /> {lang === 'en' ? 'Empty' : '倒空'}
               </button>
            </div>
          </div>

          {/* Pour Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', paddingBottom: '45px', zIndex: 5 }}>
             <button className="action-btn btn-pour" onClick={pourAtoB} disabled={gameState !== 'playing' || jugA === 0 || jugB === levelInfo.maxB || animatingPour} style={{ transform: gameState !== 'playing' || jugA === 0 || jugB === levelInfo.maxB || animatingPour ? 'scale(0.9) opacity(0.5)' : '' }}>
               <ArrowRightCircle size={32} />
             </button>
             <button className="action-btn btn-pour" onClick={pourBtoA} disabled={gameState !== 'playing' || jugB === 0 || jugA === levelInfo.maxA || animatingPour} style={{ transform: gameState !== 'playing' || jugB === 0 || jugA === levelInfo.maxA || animatingPour ? 'scale(0.9) opacity(0.5)' : '' }}>
               <ArrowLeftCircle size={32} />
             </button>
          </div>

          {/* Jug B Area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', zIndex: 5 }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#3b82f6' }}>
               {jugB}L / {levelInfo.maxB}L
            </div>
            <div className="jug-container" style={{ height: `${levelInfo.maxB * 30}px` }}>
              <div className="water" style={{ height: `${(jugB / levelInfo.maxB) * 100}%` }} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
               <button className="action-btn btn-fill" onClick={fillB} disabled={gameState !== 'playing' || animatingPour}>
                 <Droplets size={16} /> {lang === 'en' ? 'Fill' : '装满'}
               </button>
               <button className="action-btn btn-empty" onClick={emptyB} disabled={gameState !== 'playing' || animatingPour}>
                 <Trash2 size={16} /> {lang === 'en' ? 'Empty' : '倒空'}
               </button>
            </div>
          </div>

        </div>

        {/* Win Screen */}
        {gameState === 'won' && (
          <div className="bounce-in" style={{ textAlign: 'center', padding: '30px 20px', background: '#f0fdf4', borderRadius: '20px', border: '3px solid #86efac', marginTop: '30px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🌟</div>
            <h2 style={{ color: '#166534', margin: '0 0 10px 0' }}>
              {lang === 'en' ? `Success!` : `挑战成功！`}
            </h2>
            <p style={{ color: '#15803d', fontWeight: 700 }}>
              {lang === 'en' ? `You measured exactly ${levelInfo.target}L!` : `你成功量出了 ${levelInfo.target}升 水！`}
            </p>
            <button className="bouncy-button primary" onClick={nextRound} style={{ marginTop: '20px', padding: '14px 30px', fontSize: '1.1rem' }}>
              <Play size={20} style={{ marginRight: '8px' }}/>
              {lang === 'en' ? 'Next Level' : '下一关'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

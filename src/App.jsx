import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Settings, Home, X, Check, BookOpen } from 'lucide-react';
import { audioSynth } from './utils/audioSynth';
import { mathGenerator } from './utils/mathGenerator';
import { progressManager } from './utils/progressManager';
import MathManipulatives from './components/MathManipulatives';
import ShapeGame from './components/ShapeGame';
import CompareGame from './components/CompareGame';
import ClockGame from './components/ClockGame';
import NumberSortGame from './components/NumberSortGame';
import SequenceFillGame from './components/SequenceFillGame';
import MakeTenGame from './components/MakeTenGame';
import MultiplicationIntroGame from './components/MultiplicationIntroGame';
import PatternGame from './components/PatternGame';
import ShapeCountGame from './components/ShapeCountGame';
import SpatialGame from './components/SpatialGame';
import ColorGame from './components/ColorGame';
import WeekdayGame from './components/WeekdayGame';
import SeasonGame from './components/SeasonGame';
import ShoppingGame from './components/ShoppingGame';

// Reusable category card for the welcome screen game sections
function GameSection({ title, color, buttons, onScreen }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(12px)',
      borderRadius: '24px', border: '2.5px solid rgba(255,255,255,0.85)',
      boxShadow: '0 8px 30px rgba(255,93,158,0.1)', padding: '12px 14px',
      width: '92%', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '8px',
      flexShrink: 0,
    }}>
      <div style={{ fontSize: '0.82rem', fontWeight: '700', color, textAlign: 'center', letterSpacing: '0.5px' }}>
        {title}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(62px, 1fr))', gap: '7px' }}>
        {buttons.map(({ label, emoji, screen, bg, shadow }) => (
          <button key={screen} onClick={() => onScreen(screen)}
            style={{
              padding: '10px 4px', borderRadius: '16px',
              background: bg, color: 'white', border: 'none',
              fontFamily: 'Fredoka, sans-serif', fontWeight: '700', fontSize: '0.82rem',
              boxShadow: `0 4px 10px ${shadow}`, cursor: 'pointer', lineHeight: 1.3,
            }}>
            {emoji}<br />{label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Preset ranges selectable by parents
const RANGE_PRESETS = [
  { label: '10 以内', value: 10 },
  { label: '20 以内', value: 20 },
  { label: '30 以内', value: 30 },
  { label: '50 以内', value: 50 },
  { label: '100 以内', value: 100 },
];

export default function App() {
  const [screen, setScreen] = useState('welcome'); // welcome, guardian, settings, playing, review
  const [gameState, setGameState] = useState(progressManager.getInitialState());

  // Settings snapshot — used by Cancel to revert unsaved changes
  const [settingsSnapshot, setSettingsSnapshot] = useState(null);

  // Settings sync
  const [syncCodeInput, setSyncCodeInput] = useState('');
  const [generatedSyncCode, setGeneratedSyncCode] = useState('');

  // Guardian
  const [guardianQ, setGuardianQ] = useState(null);
  const [guardianA, setGuardianA] = useState('');

  // Gameplay
  const [currentQ, setCurrentQ] = useState(null);
  const [userAns, setUserAns] = useState('');
  const [errorCount, setErrorCount] = useState(0);
  const [basketFull, setBasketFull] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);

  // Challenge Mode
  const [challengeQs, setChallengeQs] = useState([]);
  const [challengeAns, setChallengeAns] = useState({});
  const [challengeSubmitted, setChallengeSubmitted] = useState(false);
  const [challengeScore, setChallengeScore] = useState(0);

  useEffect(() => {
    progressManager.saveState(gameState);
  }, [gameState]);

  // --- GUARDIAN ---
  const openGuardian = () => {
    audioSynth.playClick();
    const a = Math.floor(Math.random() * 20) + 15;
    const b = Math.floor(Math.random() * 20) + 15;
    setGuardianQ({ str: `${a} + ${b} = ?`, ans: a + b });
    setGuardianA('');
    setScreen('guardian');
  };

  const checkGuardian = () => {
    if (parseInt(guardianA) === guardianQ.ans) {
      // Snapshot current state so Cancel can restore it
      setSettingsSnapshot(JSON.parse(JSON.stringify(gameState)));
      setGeneratedSyncCode(progressManager.generateSyncCode());
      setScreen('settings');
    } else {
      setScreen('welcome');
    }
  };

  const cancelSettings = () => {
    if (settingsSnapshot) {
      // Restore state from snapshot (discards any unsaved changes)
      setGameState(settingsSnapshot);
      progressManager.saveState(settingsSnapshot);
    }
    setScreen('welcome');
  };

  const saveSettings = () => {
    // Validate minNumber and maxNumber
    let min = parseInt(gameState.minNumber) ?? 1;
    let max = parseInt(gameState.maxNumber) ?? 10;
    
    if (isNaN(min) || min < 1) min = 1;
    if (isNaN(max) || max < 2) max = 2;
    
    if (min > max) {
      const temp = min;
      min = max;
      max = temp;
    }
    
    // Ensure max is at least 5 if it's too small
    if (max < 5) max = 5;
    
    const finalState = { ...gameState, minNumber: min, maxNumber: max };
    setGameState(finalState);
    progressManager.saveState(finalState);
    setScreen('welcome');
  };

  // --- SETTINGS ---
  const importSync = () => {
    if (progressManager.importSyncCode(syncCodeInput)) {
      alert('同步成功！');
      setGameState(progressManager.getInitialState());
    } else {
      alert('无效的同步码');
    }
  };

  const clearMistakes = () => {
    if (confirm('确定要清空所有错题记录吗？')) {
      const newState = { ...gameState, mistakes: [] };
      setGameState(newState);
      progressManager.saveState(newState);
    }
  };

  const resetProgress = () => {
    if (confirm('⚠️ 警告：这将清空所有的错题本、解题数量记录，并将阶段重置为1。确定要继续吗？')) {
      localStorage.removeItem('km_stage');
      localStorage.removeItem('km_mistakes');
      localStorage.removeItem('km_history');
      localStorage.removeItem('km_minNumber');
      localStorage.removeItem('km_maxNumber');
      localStorage.removeItem('km_operations');
      setGameState(progressManager.getInitialState());
      alert('进度已成功重置！');
    }
  };

  // --- RANGE SETTINGS ---
  const setRange = (minVal, maxVal) => {
    const newState = { ...gameState, minNumber: minVal, maxNumber: maxVal };
    setGameState(newState);
  };

  const toggleOperation = (op) => {
    const ops = gameState.operations ?? ['add', 'sub'];
    let newOps;
    if (ops.includes(op)) {
      if (ops.length === 1) return; // must keep at least one
      newOps = ops.filter(o => o !== op);
    } else {
      newOps = [...ops, op];
    }
    setGameState({ ...gameState, operations: newOps });
  };

  // --- GAMEPLAY ---
  const startGame = () => {
    audioSynth.playClick();
    setSessionCount(1);
    startNewQuestion('playing');
  };

  const startReview = () => {
    if (gameState.mistakes.length === 0) {
      alert('太棒啦！目前没有错题记录！');
      return;
    }
    audioSynth.playClick();
    startNewQuestion('review');
  };

  const startChallenge = () => {
    audioSynth.playClick();
    const opts = {
      minNumber: gameState.minNumber ?? 1,
      maxNumber: gameState.maxNumber ?? 10,
      operations: gameState.operations ?? ['add', 'sub'],
    };
    const qs = mathGenerator.generateChallenge(10, gameState.stage, opts);
    setChallengeQs(qs);
    setChallengeAns({});
    setChallengeSubmitted(false);
    setChallengeScore(0);
    setScreen('challenge');
  };

  const startNewQuestion = (mode) => {
    setUserAns('');
    setErrorCount(0);
    setBasketFull(false);
    setShowHelp(false);

    if (mode === 'playing') {
      const opts = {
        minNumber: gameState.minNumber ?? 1,
        maxNumber: gameState.maxNumber ?? 10,
        operations: gameState.operations ?? ['add', 'sub'],
      };
      setCurrentQ(mathGenerator.generateQuestion(gameState.stage, opts));
      setScreen('playing');
    } else if (mode === 'review') {
      const m = gameState.mistakes[Math.floor(Math.random() * gameState.mistakes.length)];
      setCurrentQ({
        problemStr: m.problemStr,
        num1: m.num1,
        num2: m.num2,
        symbol: m.symbol,
        answer: m.answer,
        spokenText: `${m.num1} ${m.symbol === '+' ? '加' : '减'} ${m.num2} 等于几？`,
        stage: 2,
      });
      setScreen('review');
    }
  };

  const padPress = (val) => {
    audioSynth.playClick();
    if (val === 'C') {
      setUserAns('');
    } else {
      if (userAns.length < 3) setUserAns(prev => prev + val);
    }
  };

  const submitAnswer = () => {
    if (userAns === '' || !currentQ) return;

    if (parseInt(userAns) === currentQ.answer) {
      audioSynth.playCorrect();

      let nextState = { ...gameState };
      nextState.history.totalSolved += 1;

      if (screen === 'review' && errorCount === 0 && !showHelp) {
        nextState.mistakes = nextState.mistakes.filter(m => m.problemStr !== currentQ.problemStr);
      }

      setGameState(nextState);
      setUserAns('');

      if (screen === 'playing') {
        setSessionCount(prev => prev + 1);
      }

      if (screen === 'review' && nextState.mistakes.length === 0) {
        alert('恭喜！所有错题都被你消灭啦！');
        setScreen('welcome');
        return;
      }

      setTimeout(() => {
        startNewQuestion(screen);
      }, 1000);
    } else {
      audioSynth.playIncorrect();
      setUserAns('');
      const newErr = errorCount + 1;
      setErrorCount(newErr);

      progressManager.recordMistake(currentQ.problemStr, currentQ.num1, currentQ.num2, currentQ.symbol, currentQ.answer);
      setGameState(progressManager.getInitialState());

      if (newErr >= 2) {
        audioSynth.speak('再仔细数一数哦。');
      }
    }
  };

  const submitChallenge = () => {
    audioSynth.playClick();
    let score = 0;
    let nextState = { ...gameState };
    
    challengeQs.forEach((q, index) => {
      const userA = parseInt(challengeAns[index]);
      if (userA === q.answer) {
        score += 10;
        nextState.history.totalSolved += 1;
      } else {
        progressManager.recordMistake(q.problemStr, q.num1, q.num2, q.symbol, q.answer);
      }
    });
    
    if (score >= 80) {
      audioSynth.playCorrect();
    } else {
      audioSynth.playClick();
    }
    
    setGameState(nextState);
    setChallengeScore(score);
    setChallengeSubmitted(true);
  };

  const toggleMute = () => {
    audioSynth.setMuteState(!audioSynth.getMuteState());
    setGameState(prev => ({ ...prev }));
  };

  const isKeypadLocked = () => false;

  // Derive a label for the current range on the welcome screen
  const currentRangeLabel = (gameState.minNumber ?? 1) === 1 
    ? `${gameState.maxNumber ?? 10} 以内` 
    : `${gameState.minNumber ?? 1} ~ ${gameState.maxNumber ?? 10}`;
  const opsLabel = (() => {
    const ops = gameState.operations ?? ['add', 'sub'];
    if (ops.includes('add') && ops.includes('sub')) return '加减法';
    if (ops.includes('add')) return '加法';
    return '减法';
  })();

  return (
    <div id="app-viewport">
      {/* HEADER */}
      <div className="app-header">
        <button className="bouncy-button secondary" onClick={toggleMute} style={{ padding: '10px 14px' }}>
          {audioSynth.getMuteState() ? <VolumeX size={22} color="#e07a9e" /> : <Volume2 size={22} />}
        </button>
        {screen !== 'welcome' && screen !== 'guardian' && screen !== 'settings' && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {screen === 'playing' && (
              <span style={{
                background: 'linear-gradient(135deg, #4ade80, #22c55e)',
                color: 'white', borderRadius: '50px', padding: '6px 14px',
                fontSize: '0.9rem', fontWeight: '700',
                boxShadow: '0 4px 10px rgba(34,197,94,0.3)'
              }}>📝 第 {sessionCount} 题</span>
            )}
            {screen === 'review' && (
              <span style={{
                background: 'linear-gradient(135deg, #ff85b8, #ff5d9e)',
                color: 'white', borderRadius: '50px', padding: '6px 14px',
                fontSize: '0.9rem', fontWeight: '700',
                boxShadow: '0 4px 10px rgba(255,93,158,0.3)'
              }}>⭐ 错题复习</span>
            )}
            <button className="bouncy-button secondary" onClick={() => setScreen('welcome')} style={{ padding: '10px 14px' }}>
              <Home size={22} />
            </button>
          </div>
        )}
        {screen === 'welcome' && (
          <button className="bouncy-button secondary" onClick={openGuardian} style={{ padding: '10px 18px', gap: '6px' }}>
            <Settings size={20} /> 家长
          </button>
        )}
      </div>

      {/* --- WELCOME SCREEN --- */}
      {screen === 'welcome' && (
        <div className="screen-wrapper fade-in"
          style={{ justifyContent: 'center', height: '100%', gap: '12px', overflowY: 'auto', paddingBottom: '12px' }}>

          {/* Hero star with orbiting decos */}
          <div style={{ position: 'relative', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span className="star-float" style={{ fontSize: '4rem' }}>🌟</span>
            <span className="deco-emoji" style={{ top: 0, right: 0, animationDelay: '0s', fontSize: '1.2rem' }}>✨</span>
            <span className="deco-emoji" style={{ bottom: 4, left: 0, animationDelay: '-2s', fontSize: '1.1rem' }}>🍭</span>
            <span className="deco-emoji" style={{ top: 8, left: -8, animationDelay: '-1s', fontSize: '1rem' }}>⭐</span>
          </div>

          <h1 className="title-glow" style={{ fontSize: '2.4rem', margin: '0', lineHeight: 1.1 }}>
            奇妙数学冒险
          </h1>

          {/* Mode badge */}
          <div className="mode-badge">
            <span>🎯</span>
            <span>{currentRangeLabel}</span>
            <span style={{ opacity: 0.5 }}>·</span>
            <span>{opsLabel}</span>
          </div>

          {/* Main action card */}
          <div className="welcome-card" style={{ gap: '10px' }}>
            <button className="bouncy-button primary" onClick={startGame}
              style={{ width: '100%', padding: '15px', fontSize: '1.3rem', borderRadius: '22px' }}>
              🚀 马上开始
            </button>
            <div style={{ position: 'relative', width: '100%' }}>
              <button className="bouncy-button secondary" onClick={startReview}
                style={{ width: '100%', padding: '13px', fontSize: '1.1rem', borderRadius: '22px' }}>
                <BookOpen size={22} /> 错题大作战
              </button>
              {gameState.mistakes.length > 0 && (
                <span style={{
                  position: 'absolute', top: -8, right: -4,
                  background: 'linear-gradient(135deg, #ff85b8, #ff5d9e)',
                  color: 'white', borderRadius: '50px',
                  padding: '3px 11px', fontSize: '0.95rem',
                  border: '2.5px solid white',
                  boxShadow: '0 3px 8px rgba(255,93,158,0.35)',
                  fontWeight: '700',
                  zIndex: 10
                }}>
                  {gameState.mistakes.length}
                </span>
              )}
            </div>
            <button className="bouncy-button primary" onClick={startChallenge}
              style={{ width: '100%', padding: '13px', fontSize: '1.05rem', borderRadius: '22px', background: 'linear-gradient(135deg, #fde047, #f59e0b)', borderColor: '#fbbf24' }}>
              ⚡ 挑战模式 (10题连答)
            </button>
          </div>

          {/* Stats */}
          <div className="stats-row">
            <span>🏅</span>
            <span>已累计解题</span>
            <span style={{
              background: 'linear-gradient(135deg, #ff85b8, #ff5d9e)',
              color: 'white', borderRadius: '50px',
              padding: '2px 12px', fontWeight: '700',
              boxShadow: '0 3px 8px rgba(255,93,158,0.25)',
            }}>{gameState.history.totalSolved}</span>
            <span>道题</span>
          </div>

          {/* ── Section: 数感与数字 ── */}
          <GameSection title="🔢 数感与数字" color="#5bb8d4" buttons={[
            { label: '比大小',     emoji: '⚖️',  screen: 'compare',    bg: 'linear-gradient(135deg, #6dd99a, #3dc87a)', shadow: 'rgba(61,200,122,0.35)' },
            { label: '数字排序',   emoji: '🔢',  screen: 'numberSort', bg: 'linear-gradient(135deg, #5bb8d4, #3b9fc4)', shadow: 'rgba(59,159,196,0.35)' },
            { label: '数列填空',   emoji: '❓',  screen: 'seqFill',    bg: 'linear-gradient(135deg, #87ceeb, #5bb8d4)', shadow: 'rgba(91,184,212,0.35)' },
            { label: '凑十法',     emoji: '🎯',  screen: 'makeTen',    bg: 'linear-gradient(135deg, #ffb347, #f59e0b)', shadow: 'rgba(245,158,11,0.35)' },
            { label: '乘法启蒙',   emoji: '✖️',  screen: 'multiIntro', bg: 'linear-gradient(135deg, #a78bfa, #7c3aed)', shadow: 'rgba(124,58,237,0.35)' },
          ]} onScreen={(s) => { audioSynth.playClick(); setScreen(s); }} />

          {/* ── Section: 图形与空间 ── */}
          <GameSection title="🔷 图形与空间" color="#a57bc4" buttons={[
            { label: '认形状',   emoji: '🔷', screen: 'shape',      bg: 'linear-gradient(135deg, #87ceeb, #5bb8d4)', shadow: 'rgba(91,184,212,0.35)' },
            { label: '找规律',   emoji: '🔁', screen: 'pattern',    bg: 'linear-gradient(135deg, #c9a0dc, #a57bc4)', shadow: 'rgba(165,123,196,0.35)' },
            { label: '数形状',   emoji: '🔍', screen: 'shapeCount', bg: 'linear-gradient(135deg, #f9a8d4, #ec4899)', shadow: 'rgba(236,72,153,0.35)' },
            { label: '空间方位', emoji: '🧭', screen: 'spatial',    bg: 'linear-gradient(135deg, #86efac, #22c55e)', shadow: 'rgba(34,197,94,0.35)' },
          ]} onScreen={(s) => { audioSynth.playClick(); setScreen(s); }} />

          {/* ── Section: 综合认知 ── */}
          <GameSection title="🌈 综合认知" color="#f97316" buttons={[
            { label: '时钟练习', emoji: '🕐', screen: 'clock',    bg: 'linear-gradient(135deg, #c9a0dc, #a57bc4)', shadow: 'rgba(165,123,196,0.35)' },
            { label: '认颜色',   emoji: '🎨', screen: 'color',    bg: 'linear-gradient(135deg, #f9a8d4, #ec4899)', shadow: 'rgba(236,72,153,0.35)' },
            { label: '认星期',   emoji: '📅', screen: 'weekday',  bg: 'linear-gradient(135deg, #fbbf24, #f59e0b)', shadow: 'rgba(251,191,36,0.35)' },
            { label: '认季节',   emoji: '🌍', screen: 'season',   bg: 'linear-gradient(135deg, #6ee7b7, #10b981)', shadow: 'rgba(16,185,129,0.35)' },
            { label: '购物启蒙', emoji: '🛒', screen: 'shopping', bg: 'linear-gradient(135deg, #fca5a5, #ef4444)', shadow: 'rgba(239,68,68,0.35)' },
          ]} onScreen={(s) => { audioSynth.playClick(); setScreen(s); }} />

        </div>
      )}

      {/* --- GUARDIAN GATE --- */}
      {screen === 'guardian' && guardianQ && (
        <div className="screen-wrapper fade-in">
          <div className="card-shadow" style={{ padding: '30px', textAlign: 'center', width: '90%', maxWidth: '400px' }}>
            <h2 className="title-glow" style={{ color: '#E07A5F' }}>家长通道</h2>
            <div style={{ fontSize: '2rem', margin: '20px 0' }}>{guardianQ.str}</div>
            <input
              type="number"
              value={guardianA}
              onChange={e => setGuardianA(e.target.value)}
              style={{ fontSize: '2rem', width: '100px', textAlign: 'center', marginBottom: '20px' }}
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button className="bouncy-button secondary" onClick={() => setScreen('welcome')}><X /></button>
              <button className="bouncy-button primary" onClick={checkGuardian}><Check /></button>
            </div>
          </div>
        </div>
      )}

      {/* --- SETTINGS --- */}
      {screen === 'settings' && (
        <div className="screen-wrapper fade-in">
          <div className="card-shadow" style={{ padding: '20px', width: '100%', maxWidth: '500px', overflowY: 'auto', maxHeight: '85vh' }}>
            <h2 className="title-glow">教案配置室</h2>

            {/* ── Custom Calculation Range ── */}
            <div style={{ margin: '20px 0', borderBottom: '1px solid #f0c0d0', paddingBottom: '20px' }}>
              <h3 style={{ marginBottom: '10px' }}>🎯 自定义计算范围</h3>
              <p style={{ opacity: 0.7, fontSize: '0.9rem', marginBottom: '12px' }}>选择或自己设置数字范围（例如 10 到 20），让练习更有针对性！</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
                {RANGE_PRESETS.map(preset => {
                  const isActive = (gameState.minNumber ?? 1) === 1 && (gameState.maxNumber ?? 10) === preset.value;
                  return (
                    <button
                      key={preset.value}
                      onClick={() => setRange(1, preset.value)}
                      style={{
                        padding: '10px 18px',
                        borderRadius: '25px',
                        border: '3px solid',
                        borderColor: isActive ? '#e07a5f' : '#f5c0d0',
                        background: isActive ? 'linear-gradient(135deg, #ffb5c8, #ff8fab)' : 'white',
                        color: isActive ? 'white' : '#c06080',
                        fontWeight: '700',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        fontFamily: 'Fredoka, sans-serif',
                        boxShadow: isActive ? '0 4px 12px rgba(255,100,150,0.35)' : '0 2px 6px rgba(0,0,0,0.08)',
                        transition: 'all 0.2s ease',
                        transform: isActive ? 'scale(1.08)' : 'scale(1)',
                      }}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>

              {/* Custom input */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <label style={{ fontWeight: '600', color: '#b5558a', fontSize: '0.95rem' }}>自定义数值范围：</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="number"
                    min={1}
                    max={9999}
                    value={gameState.minNumber ?? 1}
                    onChange={e => {
                      const v = parseInt(e.target.value);
                      if (!isNaN(v)) {
                        setGameState({ ...gameState, minNumber: v });
                      }
                    }}
                    style={{
                      width: '75px', padding: '8px 8px',
                      borderRadius: '15px', border: '2px solid #f5c0d0',
                      fontSize: '1.1rem', textAlign: 'center',
                      fontFamily: 'Fredoka, sans-serif', color: '#b5558a',
                      fontWeight: '700',
                    }}
                  />
                  <span style={{ fontWeight: '600', color: '#b5558a' }}>到</span>
                  <input
                    type="number"
                    min={1}
                    max={9999}
                    value={gameState.maxNumber ?? 10}
                    onChange={e => {
                      const v = parseInt(e.target.value);
                      if (!isNaN(v)) {
                        setGameState({ ...gameState, maxNumber: v });
                      }
                    }}
                    style={{
                      width: '75px', padding: '8px 8px',
                      borderRadius: '15px', border: '2px solid #f5c0d0',
                      fontSize: '1.1rem', textAlign: 'center',
                      fontFamily: 'Fredoka, sans-serif', color: '#b5558a',
                      fontWeight: '700',
                    }}
                  />
                </div>
                <span style={{ opacity: 0.6, fontSize: '0.85rem' }}>（最小值 ≥ 1，最大值 ≤ 9999）</span>
              </div>
            </div>

            {/* ── Operation Types ── */}
            <div style={{ margin: '20px 0', borderBottom: '1px solid #f0c0d0', paddingBottom: '20px' }}>
              <h3 style={{ marginBottom: '10px' }}>➕➖ 运算类型</h3>
              <div style={{ display: 'flex', gap: '14px' }}>
                {[
                  { key: 'add', emoji: '➕', label: '加法' },
                  { key: 'sub', emoji: '➖', label: '减法' },
                ].map(({ key, emoji, label }) => {
                  const ops = gameState.operations ?? ['add', 'sub'];
                  const active = ops.includes(key);
                  return (
                    <button
                      key={key}
                      onClick={() => toggleOperation(key)}
                      style={{
                        flex: 1, padding: '14px',
                        borderRadius: '20px',
                        border: '3px solid',
                        borderColor: active ? '#e07a5f' : '#f5c0d0',
                        background: active ? 'linear-gradient(135deg, #ffb5c8, #ff8fab)' : 'white',
                        color: active ? 'white' : '#c06080',
                        fontWeight: '700', fontSize: '1.1rem',
                        cursor: 'pointer', fontFamily: 'Fredoka, sans-serif',
                        boxShadow: active ? '0 4px 12px rgba(255,100,150,0.35)' : '0 2px 6px rgba(0,0,0,0.08)',
                        transition: 'all 0.2s ease',
                        opacity: active ? 1 : 0.6,
                      }}
                    >
                      {emoji} {label}
                    </button>
                  );
                })}
              </div>
              <p style={{ opacity: 0.55, fontSize: '0.85rem', marginTop: '8px' }}>※ 至少需要选择一种运算类型</p>
            </div>

            {/* ── Stage selector ── */}
            <div style={{ margin: '20px 0', borderBottom: '1px solid #f0c0d0', paddingBottom: '10px' }}>
              <h3>🏅 调整学习阶段（控制教具显示）</h3>
              <select
                value={gameState.stage}
                onChange={(e) => setGameState({ ...gameState, stage: parseInt(e.target.value) })}
                style={{ width: '100%', padding: '10px', fontSize: '1.1rem', marginTop: '10px', borderRadius: '12px', border: '2px solid #f5c0d0', fontFamily: 'Fredoka, sans-serif' }}
              >
                <option value="1">阶段一：感知与计数（显示拖拽教具）</option>
                <option value="2">阶段二：具象加减法（显示拖拽教具）</option>
                <option value="3">阶段三：半抽象运算（按需显示教具）</option>
                <option value="4">阶段四：纯计算（无教具，直接答题）</option>
              </select>
            </div>

            {/* ── Mistake book ── */}
            <div style={{ margin: '20px 0', borderBottom: '1px solid #f0c0d0', paddingBottom: '10px' }}>
              <h3>📖 错题本数据</h3>
              <p>当前记录错题数量：{gameState.mistakes.length}</p>
              <button className="bouncy-button mistake" onClick={clearMistakes} style={{ marginTop: '10px' }}>
                清空错题本
              </button>
            </div>

            {/* ── Sync ── */}
            <div style={{ margin: '20px 0', borderBottom: '1px solid #f0c0d0', paddingBottom: '10px' }}>
              <h3>☁️ 进度跨设备同步</h3>
              <p style={{ opacity: 0.7, fontSize: '0.9rem', marginBottom: '10px' }}>通过"同步码"可以在 iPad 和电脑之间互传进度与设置。</p>
              <p><strong>本机同步码导出：</strong></p>
              <textarea readOnly value={generatedSyncCode} style={{ width: '100%', height: '60px', fontSize: '0.8rem', borderRadius: '10px', border: '2px solid #f5c0d0' }} />
              <p style={{ marginTop: '10px' }}><strong>从其他设备导入：</strong></p>
              <div style={{ display: 'flex', gap: '5px' }}>
                <input type="text" value={syncCodeInput} onChange={e => setSyncCodeInput(e.target.value)} placeholder="粘贴同步码" style={{ flex: 1, borderRadius: '12px', border: '2px solid #f5c0d0', padding: '8px', fontFamily: 'Fredoka, sans-serif' }} />
                <button className="bouncy-button secondary" onClick={importSync}>导入</button>
              </div>
            </div>

            {/* ── Danger zone ── */}
            <div style={{ margin: '20px 0', borderBottom: '1px solid #f0c0d0', paddingBottom: '10px' }}>
              <h3 style={{ color: '#E07A5F' }}>⚠️ 危险区域</h3>
              <p style={{ opacity: 0.7, fontSize: '0.9rem', marginBottom: '10px' }}>如果你想让孩子重新开始学习，可以初始化所有进度。</p>
              <button className="bouncy-button mistake" onClick={resetProgress} style={{ width: '100%' }}>
                重置所有进度
              </button>
            </div>

            {/* ── Save / Cancel ── */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
              <button
                onClick={saveSettings}
                style={{
                  flex: 1, padding: '16px',
                  borderRadius: '30px',
                  border: '3px solid #ff8fab',
                  background: 'linear-gradient(135deg, #ffb5c8, #ff8fab)',
                  color: 'white',
                  fontWeight: '700', fontSize: '1.1rem',
                  cursor: 'pointer', fontFamily: 'Fredoka, sans-serif',
                  boxShadow: '0 4px 14px rgba(255,100,150,0.4)',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                onTouchStart={e => e.currentTarget.style.transform = 'scale(0.95)'}
                onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                ✓ 保存
              </button>
              <button
                onClick={cancelSettings}
                style={{
                  flex: 1, padding: '16px',
                  borderRadius: '30px',
                  border: '3px solid #f5c0d0',
                  background: 'white',
                  color: '#b5558a',
                  fontWeight: '700', fontSize: '1.1rem',
                  cursor: 'pointer', fontFamily: 'Fredoka, sans-serif',
                  boxShadow: '0 3px 10px rgba(0,0,0,0.08)',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                onTouchStart={e => e.currentTarget.style.transform = 'scale(0.95)'}
                onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                ✕ 取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- PLAYING / REVIEW SCREEN --- */}
      {(screen === 'playing' || screen === 'review') && currentQ && (
        <div className="screen-wrapper fade-in" style={{ justifyContent: 'flex-start', gap: '12px', paddingBottom: '20px', overflowY: 'auto' }}>

          <div className="equation-container">
            <span>{currentQ.num1}</span>
            <span className="math-operator">{currentQ.symbol}</span>
            <span>{currentQ.num2}</span>
            <span style={{ opacity: 0.85 }}>=</span>
            <div className="answer-box">
              {userAns === '' ? '?' : userAns}
            </div>
          </div>

          {/* Range hint pill */}
          <div className="range-hint">
            🎯 {currentRangeLabel} · {opsLabel}
          </div>

          {/* Manipulatives area */}
          {(currentQ.stage <= 2 || showHelp) ? (
            <MathManipulatives currentQ={currentQ} onBasketFull={setBasketFull} />
          ) : (
            <div style={{ minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <button className="bouncy-button secondary" onClick={() => setShowHelp(true)}>
                [?] 帮帮我
              </button>
            </div>
          )}

          {/* Keypad */}
          <div className="keypad-grid" style={{ opacity: isKeypadLocked() ? 0.3 : 1, transition: 'opacity 0.3s' }}>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(val => (
              <button key={val} className="keypad-btn" onClick={() => !isKeypadLocked() && padPress(val)}>
                {val}
              </button>
            ))}
            <button className="keypad-btn action-clear" onClick={() => !isKeypadLocked() && padPress('C')}>
              ❌
            </button>
            <button className="keypad-btn" onClick={() => !isKeypadLocked() && padPress('0')}>
              0
            </button>
            <button className="keypad-btn action-submit" onClick={() => !isKeypadLocked() && submitAnswer()}>
              ✅
            </button>
          </div>

        </div>
      )}

      {/* --- CHALLENGE SCREEN --- */}
      {screen === 'challenge' && (
        <div className="screen-wrapper fade-in" style={{ alignItems: 'center', padding: '20px 10px', overflowY: 'auto' }}>
          
          {challengeSubmitted && (
            <div className="score-banner">
              🎯 挑战完成！得分：{challengeScore} / 100
            </div>
          )}

          <div className="challenge-list">
            {challengeQs.map((q, index) => {
              const userVal = challengeAns[index] || '';
              const isCorrect = challengeSubmitted ? parseInt(userVal) === q.answer : null;
              
              return (
                <div key={index} className="challenge-item">
                  <div className="challenge-row">
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.2rem', color: '#94a3b8', width: '30px' }}>{index + 1}.</span>
                      <span>{q.num1}</span>
                      <span className="math-operator" style={{ margin: '0 5px' }}>{q.symbol}</span>
                      <span>{q.num2}</span>
                      <span style={{ opacity: 0.85, margin: '0 5px' }}>=</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input
                        type="number"
                        className={`challenge-input ${challengeSubmitted ? (isCorrect ? 'correct' : 'wrong') : ''}`}
                        value={userVal}
                        onChange={(e) => {
                          if (!challengeSubmitted) {
                            setChallengeAns(prev => ({ ...prev, [index]: e.target.value }));
                          }
                        }}
                        disabled={challengeSubmitted}
                      />
                      {challengeSubmitted && isCorrect && <span style={{ fontSize: '1.8rem' }}>🌟</span>}
                      {challengeSubmitted && !isCorrect && <span style={{ fontSize: '1.8rem' }}>❌</span>}
                    </div>
                  </div>
                  
                  {challengeSubmitted && !isCorrect && (
                    <div className="challenge-analysis">
                      <strong>💡 解析：</strong>正确答案是 {q.answer}。<br />
                      {mathGenerator.generateExplanation(q)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!challengeSubmitted ? (
            <button className="bouncy-button primary" onClick={submitChallenge}
              style={{ width: '100%', maxWidth: '500px', marginTop: '20px', padding: '16px', fontSize: '1.4rem' }}>
              ✅ 交 卷
            </button>
          ) : (
            <button className="bouncy-button secondary" onClick={() => setScreen('welcome')}
              style={{ width: '100%', maxWidth: '500px', marginTop: '20px', padding: '14px', fontSize: '1.2rem' }}>
              🏠 返回主页
            </button>
          )}
        </div>
      )}
      {screen === 'shape'      && <ShapeGame />}
      {screen === 'compare'    && <CompareGame />}
      {screen === 'clock'      && <ClockGame />}
      {screen === 'numberSort' && <NumberSortGame />}
      {screen === 'seqFill'    && <SequenceFillGame />}
      {screen === 'makeTen'    && <MakeTenGame />}
      {screen === 'multiIntro' && <MultiplicationIntroGame />}
      {screen === 'pattern'    && <PatternGame />}
      {screen === 'shapeCount' && <ShapeCountGame />}
      {screen === 'spatial'    && <SpatialGame />}
      {screen === 'color'      && <ColorGame />}
      {screen === 'weekday'    && <WeekdayGame />}
      {screen === 'season'     && <SeasonGame />}
      {screen === 'shopping'   && <ShoppingGame />}
    </div>
  );
}

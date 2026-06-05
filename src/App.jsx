import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Settings, Home, X, Check, BookOpen } from 'lucide-react';
import { audioSynth } from './utils/audioSynth';
import { mathGenerator } from './utils/mathGenerator';
import { progressManager } from './utils/progressManager';
import { t } from './utils/translations';
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
import BreakingTenGame from './components/BreakingTenGame';
import PlaceValueGame from './components/PlaceValueGame';
import OddOneOutGame from './components/OddOneOutGame';
import MultiStepGame from './components/MultiStepGame';
import SortClassifyGame from './components/SortClassifyGame';
import MeasurementGame from './components/MeasurementGame';
import MultiplicationTableGame from './components/MultiplicationTableGame';
import FractionsGame from './components/FractionsGame';
import TimeDiffGame from './components/TimeDiffGame';
import MissingNumberGame from './components/MissingNumberGame';
import MathMatchingGame from './components/MathMatchingGame';
import ColumnMathGame from './components/ColumnMathGame';
import DivisionIntroGame from './components/DivisionIntroGame';
import NumberLineGame from './components/NumberLineGame';
import AreaPerimeterGame from './components/AreaPerimeterGame';
import DataChartsGame from './components/DataChartsGame';
import MoneyGame from './components/MoneyGame';
import TemperatureGame from './components/TemperatureGame';
import BubbleBondsGame from './components/BubbleBondsGame';
import TangramGame from './components/TangramGame';
import SymmetryGame from './components/SymmetryGame';
import CodingMazeGame from './components/CodingMazeGame';
import Block3DGame from './components/Block3DGame';
import BalanceScaleGame from './components/BalanceScaleGame';
import ProbabilityGame from './components/ProbabilityGame';
import Make10PopGame from './components/Make10PopGame';
import MathLinkGame from './components/MathLinkGame';
import SubPopGame from './components/SubPopGame';
import WaterJugGame from './components/WaterJugGame';
import philosophyImg from './assets/philosophy.jpg';

// Reusable category card for the welcome screen game sections
function GameSection({ title, color, buttons, onScreen }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(12px)',
      borderRadius: '24px', border: '2.5px solid rgba(255,255,255,0.85)',
      boxShadow: '0 8px 30px rgba(255,93,158,0.1)', padding: '12px 14px',
      width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '8px',
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
              fontFamily: 'Fredoka, sans-serif', fontWeight: '600', fontSize: '0.82rem',
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
  const [showPhilosophy, setShowPhilosophy] = useState(false);
  const [isSolved, setIsSolved] = useState(false);

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

  useEffect(() => {
    if (currentQ && currentQ.spokenText) {
      audioSynth.speak(currentQ.spokenText, gameState.lang);
    }
  }, [currentQ]);

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
    setIsSolved(false);

    if (mode === 'playing') {
      const opts = {
        minNumber: gameState.minNumber ?? 1,
        maxNumber: gameState.maxNumber ?? 10,
        operations: gameState.operations ?? ['add', 'sub'],
        lang: gameState.lang,
      };
      setCurrentQ(mathGenerator.generateQuestion(gameState.stage, opts));
      setScreen('playing');
    } else if (mode === 'review') {
      const m = gameState.mistakes[Math.floor(Math.random() * gameState.mistakes.length)];
      const spokenText = gameState.lang === 'en'
        ? `What is ${m.num1} ${m.symbol === '+' ? 'plus' : 'minus'} ${m.num2}?`
        : `${m.num1} ${m.symbol === '+' ? '加' : '减'} ${m.num2} 等于几？`;
      setCurrentQ({
        problemStr: m.problemStr,
        num1: m.num1,
        num2: m.num2,
        symbol: m.symbol,
        answer: m.answer,
        spokenText,
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

      if (gameState.autoAdvance) {
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
        setIsSolved(true);
      }
    } else {
      audioSynth.playIncorrect();
      setUserAns('');
      const newErr = errorCount + 1;
      setErrorCount(newErr);

      progressManager.recordMistake(currentQ.problemStr, currentQ.num1, currentQ.num2, currentQ.symbol, currentQ.answer);
      setGameState(progressManager.getInitialState());

      if (newErr >= 2) {
        audioSynth.speak(gameState.lang === 'en' ? 'Count carefully again.' : '再仔细数一数哦。', gameState.lang);
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

  const handleNextQuestion = () => {
    audioSynth.playClick();
    if (screen === 'playing') {
      setSessionCount(prev => prev + 1);
    }
    if (screen === 'review' && gameState.mistakes.length === 0) {
      const isEn = gameState.lang === 'en';
      alert(isEn ? 'Congratulations! You solved all the mistakes!' : '恭喜！所有错题都被你消灭啦！');
      setScreen('welcome');
      return;
    }
    startNewQuestion(screen);
  };

  const isKeypadLocked = () => isSolved;

  // Derive a label for the current range on the welcome screen
  const currentRangeLabel = (gameState.minNumber ?? 1) === 1 
    ? (gameState.lang === 'en' ? `Within ${gameState.maxNumber ?? 10}` : `${gameState.maxNumber ?? 10} 以内`)
    : `${gameState.minNumber ?? 1} ~ ${gameState.maxNumber ?? 10}`;
  const opsLabel = (() => {
    const ops = gameState.operations ?? ['add', 'sub'];
    if (ops.includes('add') && ops.includes('sub')) return gameState.lang === 'en' ? 'Add & Sub' : '加减法';
    if (ops.includes('add')) return gameState.lang === 'en' ? 'Addition' : '加法';
    return gameState.lang === 'en' ? 'Subtraction' : '减法';
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
              }}>📝 {t('questionNum', gameState.lang).replace('{num}', sessionCount)}</span>
            )}
            {screen === 'review' && (
              <span style={{
                background: 'linear-gradient(135deg, #ff85b8, #ff5d9e)',
                color: 'white', borderRadius: '50px', padding: '6px 14px',
                fontSize: '0.9rem', fontWeight: '700',
                boxShadow: '0 4px 10px rgba(255,93,158,0.3)'
              }}>{t('reviewMistakes', gameState.lang)}</span>
            )}
            <button className="bouncy-button secondary" onClick={() => setScreen('welcome')} style={{ padding: '10px 14px' }}>
              <Home size={22} />
            </button>
          </div>
        )}
        {screen === 'welcome' && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              className="bouncy-button secondary"
              onClick={() => {
                audioSynth.playClick();
                const nextLang = gameState.lang === 'zh' ? 'en' : 'zh';
                setGameState(prev => ({ ...prev, lang: nextLang }));
              }}
              style={{
                padding: '10px 16px',
                fontSize: '0.9rem',
                fontWeight: '600',
                fontFamily: 'Fredoka, sans-serif',
                background: 'linear-gradient(135deg, #e0f2fe, #bae6fd)',
                borderColor: '#7dd3fc',
                color: '#0369a1',
                boxShadow: '0 4px 10px rgba(125,211,252,0.3)',
              }}
            >
              🌐 {gameState.lang === 'zh' ? 'EN' : '中文'}
            </button>
            <button
              className="bouncy-button secondary"
              onClick={() => {
                audioSynth.playClick();
                setShowPhilosophy(true);
              }}
              style={{
                padding: '10px 14px',
                fontSize: '0.9rem',
                fontWeight: '600',
                fontFamily: 'Fredoka, sans-serif',
                background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                borderColor: '#fcd34d',
                color: '#b45309',
                boxShadow: '0 4px 10px rgba(251,191,36,0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              💡 {t('philosophy', gameState.lang)}
            </button>
            <button className="bouncy-button secondary" onClick={openGuardian} style={{ padding: '10px 18px', gap: '6px' }}>
              <Settings size={20} /> {t('parent', gameState.lang)}
            </button>
          </div>
        )}
      </div>

      {/* --- WELCOME SCREEN --- */}
      {screen === 'welcome' && (
        <div className="screen-wrapper fade-in"
          style={{ justifyContent: 'flex-start', gap: '12px', overflowY: 'auto', paddingBottom: '24px', paddingTop: '10px' }}>


          {/* Hero star with orbiting decos */}
          <div style={{ position: 'relative', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span className="star-float" style={{ fontSize: '4rem' }}>🌟</span>
            <span className="deco-emoji" style={{ top: 0, right: 0, animationDelay: '0s', fontSize: '1.2rem' }}>✨</span>
            <span className="deco-emoji" style={{ bottom: 4, left: 0, animationDelay: '-2s', fontSize: '1.1rem' }}>🍭</span>
            <span className="deco-emoji" style={{ top: 8, left: -8, animationDelay: '-1s', fontSize: '1rem' }}>⭐</span>
          </div>

          <h1 className="title-glow" style={{ fontSize: '2.4rem', margin: '0', lineHeight: 1.1 }}>
            {t('appTitle', gameState.lang)}
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
              {t('startBtn', gameState.lang)}
            </button>
            <div style={{ position: 'relative', width: '100%' }}>
              <button className="bouncy-button secondary" onClick={startReview}
                style={{ width: '100%', padding: '13px', fontSize: '1.1rem', borderRadius: '22px' }}>
                <BookOpen size={22} /> {t('mistakesBtn', gameState.lang)}
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
              {t('challengeBtn', gameState.lang)}
            </button>
          </div>

          {/* Stats */}
          <div className="stats-row">
            <span>🏅</span>
            <span>{t('solvedStats', gameState.lang).replace('{count}', gameState.history.totalSolved)}</span>
          </div>

          {/* ── Section: 数感与数字 ── */}
          <GameSection title={t('catNumber', gameState.lang)} color="#5bb8d4" buttons={[
            { label: t('gameBubbleBonds', gameState.lang), emoji: '🫧', screen: 'bubbleBonds', bg: 'linear-gradient(135deg, #38bdf8, #0ea5e9)', shadow: 'rgba(14,165,233,0.35)' },
            { label: t('gameCompare', gameState.lang),     emoji: '⚖️',  screen: 'compare',    bg: 'linear-gradient(135deg, #6dd99a, #3dc87a)', shadow: 'rgba(61,200,122,0.35)' },
            { label: t('gameSort', gameState.lang),   emoji: '🔢',  screen: 'numberSort', bg: 'linear-gradient(135deg, #5bb8d4, #3b9fc4)', shadow: 'rgba(59,159,196,0.35)' },
            { label: t('gameSeqFill', gameState.lang),   emoji: '❓',  screen: 'seqFill',    bg: 'linear-gradient(135deg, #87ceeb, #5bb8d4)', shadow: 'rgba(91,184,212,0.35)' },
            { label: t('gameMakeTen', gameState.lang),     emoji: '🎯',  screen: 'makeTen',    bg: 'linear-gradient(135deg, #ffb347, #f59e0b)', shadow: 'rgba(245,158,11,0.35)' },
            { label: t('gameBreakingTen', gameState.lang), emoji: '🎋',  screen: 'breakingTen',bg: 'linear-gradient(135deg, #ff758c, #ff7eb3)', shadow: 'rgba(255,117,140,0.35)' },
            { label: t('gameMultiIntro', gameState.lang),   emoji: '✖️',  screen: 'multiIntro', bg: 'linear-gradient(135deg, #a78bfa, #7c3aed)', shadow: 'rgba(124,58,237,0.35)' },
            { label: t('gamePlaceValue', gameState.lang),  emoji: '📦',  screen: 'placeValue', bg: 'linear-gradient(135deg, #c4b5fd, #7c3aed)', shadow: 'rgba(124,58,237,0.35)' },
            { label: t('gameOddOneOut', gameState.lang),   emoji: '🔍',  screen: 'oddOneOut',  bg: 'linear-gradient(135deg, #fde68a, #f59e0b)', shadow: 'rgba(245,158,11,0.35)' },
            { label: t('gameMultiStep', gameState.lang),   emoji: '🔗',  screen: 'multiStep',  bg: 'linear-gradient(135deg, #7dd3fc, #3b82f6)', shadow: 'rgba(59,130,246,0.35)' },
            { label: t('gameMissingNum', gameState.lang),  emoji: '❓',  screen: 'missingNum', bg: 'linear-gradient(135deg, #fde68a, #eab308)', shadow: 'rgba(234,179,8,0.35)' },
            { label: t('gameMathMatch', gameState.lang),   emoji: '🔗',  screen: 'mathMatch',  bg: 'linear-gradient(135deg, #c4b5fd, #8b5cf6)', shadow: 'rgba(139,92,246,0.35)' },
            { label: t('gameColumnMath', gameState.lang),  emoji: '📝',  screen: 'columnMath', bg: 'linear-gradient(135deg, #93c5fd, #3b82f6)', shadow: 'rgba(59,130,246,0.35)' },
            { label: t('gameDivision', gameState.lang),    emoji: '➗',  screen: 'division',   bg: 'linear-gradient(135deg, #86efac, #22c55e)', shadow: 'rgba(34,197,94,0.35)' },
            { label: t('gameNumberLine', gameState.lang),  emoji: '📐',  screen: 'numberLine', bg: 'linear-gradient(135deg, #7dd3fc, #0284c7)', shadow: 'rgba(2,132,199,0.35)' },
            { label: gameState.lang === 'en' ? 'Make-10 Pop' : '凑十消消乐', emoji: '💥', screen: 'make10Pop', bg: 'linear-gradient(135deg, #f87171, #ef4444)', shadow: 'rgba(239,68,68,0.35)' },
            { label: gameState.lang === 'en' ? 'Sub Pop' : '减法消消乐', emoji: '➖', screen: 'subpop', bg: 'linear-gradient(135deg, #60a5fa, #3b82f6)', shadow: 'rgba(59,130,246,0.35)' },
            { label: gameState.lang === 'en' ? 'Equation Link' : '算式连连看', emoji: '🔗', screen: 'mathLink', bg: 'linear-gradient(135deg, #a78bfa, #6366f1)', shadow: 'rgba(99,102,241,0.35)' },
          ]} onScreen={(s) => { audioSynth.playClick(); setScreen(s); }} />

          {/* ── Section: 图形与空间 ── */}
          <GameSection title={t('catShape', gameState.lang)} color="#a57bc4" buttons={[
            { label: t('gameTangram', gameState.lang), emoji: '🧩', screen: 'tangram',    bg: 'linear-gradient(135deg, #c4b5fd, #8b5cf6)', shadow: 'rgba(139,92,246,0.35)' },
            { label: t('gameShape', gameState.lang),   emoji: '🔷', screen: 'shape',      bg: 'linear-gradient(135deg, #87ceeb, #5bb8d4)', shadow: 'rgba(91,184,212,0.35)' },
            { label: t('gamePattern', gameState.lang),   emoji: '🔁', screen: 'pattern',    bg: 'linear-gradient(135deg, #c9a0dc, #a57bc4)', shadow: 'rgba(165,123,196,0.35)' },
            { label: t('gameShapeCount', gameState.lang),   emoji: '🔍', screen: 'shapeCount', bg: 'linear-gradient(135deg, #f9a8d4, #ec4899)', shadow: 'rgba(236,72,153,0.35)' },
            { label: t('gameSpatial', gameState.lang), emoji: '🧭', screen: 'spatial',    bg: 'linear-gradient(135deg, #86efac, #22c55e)', shadow: 'rgba(34,197,94,0.35)' },
            { label: t('gameSymmetry', gameState.lang), emoji: '🦋', screen: 'symmetry',    bg: 'linear-gradient(135deg, #fcd34d, #f59e0b)', shadow: 'rgba(245,158,11,0.35)' },
            { label: t('gameCodingMaze', gameState.lang), emoji: '🤖', screen: 'codingMaze',    bg: 'linear-gradient(135deg, #86efac, #10b981)', shadow: 'rgba(16,185,129,0.35)' },
            { label: t('game3DBlock', gameState.lang), emoji: '🧊', screen: 'block3D',    bg: 'linear-gradient(135deg, #93c5fd, #3b82f6)', shadow: 'rgba(59,130,246,0.35)' },
          ]} onScreen={(s) => { audioSynth.playClick(); setScreen(s); }} />

          {/* ── Section: 综合认知 ── */}
          <GameSection title={t('catCognitive', gameState.lang)} color="#f97316" buttons={[
            { label: t('gameClock', gameState.lang), emoji: '🕐', screen: 'clock',    bg: 'linear-gradient(135deg, #c9a0dc, #a57bc4)', shadow: 'rgba(165,123,196,0.35)' },
            { label: t('gameColor', gameState.lang),   emoji: '🎨', screen: 'color',    bg: 'linear-gradient(135deg, #f9a8d4, #ec4899)', shadow: 'rgba(236,72,153,0.35)' },
            { label: t('gameWeekday', gameState.lang),   emoji: '📅', screen: 'weekday',  bg: 'linear-gradient(135deg, #fbbf24, #f59e0b)', shadow: 'rgba(251,191,36,0.35)' },
            { label: t('gameSeason', gameState.lang),   emoji: '🌍', screen: 'season',   bg: 'linear-gradient(135deg, #6ee7b7, #10b981)', shadow: 'rgba(16,185,129,0.35)' },
            { label: t('gameShopping', gameState.lang), emoji: '🛒', screen: 'shopping', bg: 'linear-gradient(135deg, #fca5a5, #ef4444)', shadow: 'rgba(239,68,68,0.35)' },
            { label: t('gameSortClassify', gameState.lang), emoji: '🎯', screen: 'sortClassify', bg: 'linear-gradient(135deg, #ddd6fe, #7c3aed)', shadow: 'rgba(124,58,237,0.35)' },
            { label: t('gameMeasurement', gameState.lang),  emoji: '📍', screen: 'measurement', bg: 'linear-gradient(135deg, #6ee7b7, #059669)', shadow: 'rgba(5,150,105,0.35)' },
            { label: t('gameMultiTable', gameState.lang),   emoji: '✖️', screen: 'multiTable',  bg: 'linear-gradient(135deg, #fcd34d, #d97706)', shadow: 'rgba(217,119,6,0.35)' },
            { label: t('gameFractions', gameState.lang),    emoji: '🍕', screen: 'fractions',   bg: 'linear-gradient(135deg, #f9a8d4, #ec4899)', shadow: 'rgba(236,72,153,0.35)' },
            { label: t('gameTimeDiff', gameState.lang),     emoji: '⏱️', screen: 'timeDiff',    bg: 'linear-gradient(135deg, #7dd3fc, #0284c7)', shadow: 'rgba(2,132,199,0.35)' },
            { label: gameState.lang === 'en' ? 'Water Jug' : '神奇倒水', emoji: '💧', screen: 'waterJug', bg: 'linear-gradient(135deg, #60a5fa, #2563eb)', shadow: 'rgba(37,99,235,0.35)' },
            { label: t('gameAreaPerim', gameState.lang),     emoji: '📐', screen: 'areaPerim',   bg: 'linear-gradient(135deg, #c4b5fd, #7c3aed)', shadow: 'rgba(124,58,237,0.35)' },
            { label: t('gameDataCharts', gameState.lang),    emoji: '📊', screen: 'dataCharts',  bg: 'linear-gradient(135deg, #5eead4, #0d9488)', shadow: 'rgba(13,148,136,0.35)' },
            { label: t('gameMoney', gameState.lang),         emoji: '💰', screen: 'money',       bg: 'linear-gradient(135deg, #86efac, #16a34a)', shadow: 'rgba(22,163,74,0.35)' },
            { label: t('gameTemp', gameState.lang),          emoji: '🌡️', screen: 'temperature', bg: 'linear-gradient(135deg, #fde68a, #f59e0b)', shadow: 'rgba(245,158,11,0.35)' },
            { label: t('gameBalance', gameState.lang),     emoji: '⚖️', screen: 'balance',   bg: 'linear-gradient(135deg, #fca5a5, #ef4444)', shadow: 'rgba(239,68,68,0.35)' },
            { label: t('gameProbability', gameState.lang),    emoji: '🎡', screen: 'probability',  bg: 'linear-gradient(135deg, #c4b5fd, #8b5cf6)', shadow: 'rgba(139,92,246,0.35)' },
          ]} onScreen={(s) => { audioSynth.playClick(); setScreen(s); }} />

        </div>
      )}

      {/* --- GUARDIAN GATE --- */}
      {screen === 'guardian' && guardianQ && (
        <div className="screen-wrapper fade-in">
          <div className="card-shadow" style={{ padding: '30px', textAlign: 'center', width: '90%', maxWidth: '400px' }}>
            <h2 className="title-glow" style={{ color: '#E07A5F' }}>{t('guardianTitle', gameState.lang)}</h2>
            <p style={{ opacity: 0.8, fontSize: '0.95rem', marginBottom: '10px' }}>{t('guardianQText', gameState.lang)}</p>
            <div style={{ fontSize: '2rem', margin: '15px 0' }}>{guardianQ.str}</div>
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
            <h2 className="title-glow">{t('settingsTitle', gameState.lang)}</h2>

            {/* ── Custom Calculation Range ── */}
            <div style={{ margin: '20px 0', borderBottom: '1px solid #f0c0d0', paddingBottom: '20px' }}>
              <h3 style={{ marginBottom: '10px' }}>{t('rangeTitle', gameState.lang)}</h3>
              <p style={{ opacity: 0.7, fontSize: '0.9rem', marginBottom: '12px', lineHeight: 1.35 }}>{t('rangeDesc', gameState.lang)}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
                {RANGE_PRESETS.map(preset => {
                  const isActive = (gameState.minNumber ?? 1) === 1 && (gameState.maxNumber ?? 10) === preset.value;
                  const label = gameState.lang === 'en' ? `Within ${preset.value}` : `${preset.value} 以内`;
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
                        fontWeight: '600',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        fontFamily: 'Fredoka, sans-serif',
                        boxShadow: isActive ? '0 4px 12px rgba(255,100,150,0.35)' : '0 2px 6px rgba(0,0,0,0.08)',
                        transition: 'all 0.2s ease',
                        transform: isActive ? 'scale(1.08)' : 'scale(1)',
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Custom input */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <label style={{ fontWeight: '600', color: '#b5558a', fontSize: '0.95rem' }}>{t('customRange', gameState.lang)}</label>
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
                  <span style={{ fontWeight: '600', color: '#b5558a' }}>{t('to', gameState.lang)}</span>
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
                <span style={{ opacity: 0.6, fontSize: '0.85rem' }}>{t('rangeLimits', gameState.lang)}</span>
              </div>
            </div>

            {/* ── Operation Types ── */}
            <div style={{ margin: '20px 0', borderBottom: '1px solid #f0c0d0', paddingBottom: '20px' }}>
              <h3 style={{ marginBottom: '10px' }}>{t('opsTitle', gameState.lang)}</h3>
              <div style={{ display: 'flex', gap: '14px' }}>
                {[
                  { key: 'add', emoji: '➕', label: t('add', gameState.lang) },
                  { key: 'sub', emoji: '➖', label: t('sub', gameState.lang) },
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
                        fontWeight: '600', fontSize: '1.1rem',
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
              <p style={{ opacity: 0.55, fontSize: '0.85rem', marginTop: '8px' }}>{t('opsDesc', gameState.lang)}</p>
            </div>

            {/* ── Auto-advance Toggle ── */}
            <div style={{ margin: '20px 0', borderBottom: '1px solid #f0c0d0', paddingBottom: '20px' }}>
              <h3 style={{ marginBottom: '10px' }}>{t('autoAdvanceTitle', gameState.lang)}</h3>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
                <div style={{ paddingRight: '12px' }}>
                  <span style={{ fontWeight: '700', color: '#b5558a', fontSize: '1.05rem' }}>{t('autoAdvanceLabel', gameState.lang)}</span>
                  <p style={{ opacity: 0.6, fontSize: '0.85rem', margin: '4px 0 0 0', lineHeight: 1.3 }}>
                    {t('autoAdvanceDesc', gameState.lang)}
                  </p>
                </div>
                <button
                  onClick={() => setGameState({ ...gameState, autoAdvance: !gameState.autoAdvance })}
                  style={{
                    width: '64px',
                    height: '34px',
                    borderRadius: '20px',
                    border: 'none',
                    background: gameState.autoAdvance ? 'linear-gradient(135deg, #4ade80, #22c55e)' : '#e2e8f0',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background 0.3s ease',
                    boxShadow: gameState.autoAdvance ? '0 4px 10px rgba(34,197,94,0.3)' : 'none',
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: 'white',
                      position: 'absolute',
                      top: '4px',
                      left: gameState.autoAdvance ? '34px' : '4px',
                      transition: 'left 0.3s ease',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                    }}
                  />
                </button>
              </div>
            </div>

            {/* ── Stage selector ── */}
            <div style={{ margin: '20px 0', borderBottom: '1px solid #f0c0d0', paddingBottom: '10px' }}>
              <h3>{t('stageTitle', gameState.lang)}</h3>
              <select
                value={gameState.stage}
                onChange={(e) => setGameState({ ...gameState, stage: parseInt(e.target.value) })}
                style={{ width: '100%', padding: '10px', fontSize: '1.1rem', marginTop: '10px', borderRadius: '12px', border: '2px solid #f5c0d0', fontFamily: 'Fredoka, sans-serif' }}
              >
                <option value="1">{t('stage1', gameState.lang)}</option>
                <option value="2">{t('stage2', gameState.lang)}</option>
                <option value="3">{t('stage3', gameState.lang)}</option>
                <option value="4">{t('stage4', gameState.lang)}</option>
              </select>
            </div>

            {/* ── Difficulty Mode selector ── */}
            <div style={{ margin: '20px 0', borderBottom: '1px solid #f0c0d0', paddingBottom: '10px' }}>
              <h3>{t('difficultyTitle', gameState.lang)}</h3>
              <select
                value={gameState.difficultyMode || 'adaptive'}
                onChange={(e) => setGameState({ ...gameState, difficultyMode: e.target.value })}
                style={{ width: '100%', padding: '10px', fontSize: '1.1rem', marginTop: '10px', borderRadius: '12px', border: '2px solid #f5c0d0', fontFamily: 'Fredoka, sans-serif', fontWeight: '600', color: '#c0487a' }}
              >
                <option value="adaptive">{t('diffAdaptive', gameState.lang)}</option>
                <option value="easy">{t('diffEasy', gameState.lang)}</option>
                <option value="medium">{t('diffMedium', gameState.lang)}</option>
                <option value="hard">{t('diffHard', gameState.lang)}</option>
              </select>
            </div>

            {/* ── Mistake book ── */}
            <div style={{ margin: '20px 0', borderBottom: '1px solid #f0c0d0', paddingBottom: '10px' }}>
              <h3>{t('mistakesTitle', gameState.lang)}</h3>
              <p>{t('mistakesCount', gameState.lang).replace('{count}', gameState.mistakes.length)}</p>
              <button className="bouncy-button mistake" onClick={clearMistakes} style={{ marginTop: '10px' }}>
                {t('clearMistakesBtn', gameState.lang)}
              </button>
            </div>

            {/* ── Sync ── */}
            <div style={{ margin: '20px 0', borderBottom: '1px solid #f0c0d0', paddingBottom: '10px' }}>
              <h3>{t('syncTitle', gameState.lang)}</h3>
              <p style={{ opacity: 0.7, fontSize: '0.9rem', marginBottom: '10px', lineHeight: 1.35 }}>{t('syncDesc', gameState.lang)}</p>
              <p><strong>{t('syncExport', gameState.lang)}</strong></p>
              <textarea readOnly value={generatedSyncCode} style={{ width: '100%', height: '60px', fontSize: '0.8rem', borderRadius: '10px', border: '2px solid #f5c0d0' }} />
              <p style={{ marginTop: '10px' }}><strong>{t('syncImport', gameState.lang)}</strong></p>
              <div style={{ display: 'flex', gap: '5px' }}>
                <input type="text" value={syncCodeInput} onChange={e => setSyncCodeInput(e.target.value)} placeholder={t('syncPlaceholder', gameState.lang)} style={{ flex: 1, borderRadius: '12px', border: '2px solid #f5c0d0', padding: '8px', fontFamily: 'Fredoka, sans-serif' }} />
                <button className="bouncy-button secondary" onClick={importSync}>{t('syncImportBtn', gameState.lang)}</button>
              </div>
            </div>

            {/* ── Danger zone ── */}
            <div style={{ margin: '20px 0', borderBottom: '1px solid #f0c0d0', paddingBottom: '10px' }}>
              <h3 style={{ color: '#E07A5F' }}>{t('dangerTitle', gameState.lang)}</h3>
              <p style={{ opacity: 0.7, fontSize: '0.9rem', marginBottom: '10px', lineHeight: 1.35 }}>{t('dangerDesc', gameState.lang)}</p>
              <button className="bouncy-button mistake" onClick={resetProgress} style={{ width: '100%' }}>
                {t('resetBtn', gameState.lang)}
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
                  fontWeight: '600', fontSize: '1.1rem',
                  cursor: 'pointer', fontFamily: 'Fredoka, sans-serif',
                  boxShadow: '0 4px 14px rgba(255,100,150,0.4)',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                onTouchStart={e => e.currentTarget.style.transform = 'scale(0.95)'}
                onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                {t('save', gameState.lang)}
              </button>
              <button
                onClick={cancelSettings}
                style={{
                  flex: 1, padding: '16px',
                  borderRadius: '30px',
                  border: '3px solid #f5c0d0',
                  background: 'white',
                  color: '#b5558a',
                  fontWeight: '600', fontSize: '1.1rem',
                  cursor: 'pointer', fontFamily: 'Fredoka, sans-serif',
                  boxShadow: '0 3px 10px rgba(0,0,0,0.08)',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                onTouchStart={e => e.currentTarget.style.transform = 'scale(0.95)'}
                onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                {t('cancel', gameState.lang)}
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
                {t('helpBtn', gameState.lang)}
              </button>
            </div>
          )}

          {/* Keypad or Manual Next Button */}
          {isSolved ? (
            <div className="bounce-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '360px', marginTop: '10px' }}>
              <div style={{ fontSize: '1.4rem', color: '#22c55e', fontWeight: '700', marginBottom: '16px', textShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                {t('correctCelebration', gameState.lang)}
              </div>
              <button
                onClick={handleNextQuestion}
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '1.3rem',
                  fontWeight: '600',
                  color: 'white',
                  background: 'linear-gradient(135deg, #ff758c, #ff7eb3)',
                  border: 'none',
                  borderRadius: '24px',
                  boxShadow: '0 8px 20px rgba(255,117,140,0.4)',
                  cursor: 'pointer',
                  fontFamily: 'Fredoka, sans-serif',
                  transition: 'transform 0.1s ease',
                }}
                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                {t('nextBtn', gameState.lang)}
              </button>
            </div>
          ) : (
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
          )}

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
      {screen === 'bubbleBonds'  && <BubbleBondsGame lang={gameState.lang} onBack={() => setScreen('welcome')} />}
      {screen === 'tangram'      && <TangramGame lang={gameState.lang} onBack={() => setScreen('welcome')} />}
      {screen === 'shape'      && <ShapeGame autoAdvance={gameState.autoAdvance} lang={gameState.lang} difficultyMode={gameState.difficultyMode || 'adaptive'} />}
      {screen === 'compare'    && <CompareGame autoAdvance={gameState.autoAdvance} lang={gameState.lang} difficultyMode={gameState.difficultyMode || 'adaptive'} />}
      {screen === 'clock'      && <ClockGame autoAdvance={gameState.autoAdvance} lang={gameState.lang} difficultyMode={gameState.difficultyMode || 'adaptive'} />}
      {screen === 'numberSort' && <NumberSortGame autoAdvance={gameState.autoAdvance} lang={gameState.lang} difficultyMode={gameState.difficultyMode || 'adaptive'} />}
      {screen === 'seqFill'    && <SequenceFillGame autoAdvance={gameState.autoAdvance} lang={gameState.lang} difficultyMode={gameState.difficultyMode || 'adaptive'} />}
      {screen === 'makeTen'    && <MakeTenGame autoAdvance={gameState.autoAdvance} lang={gameState.lang} difficultyMode={gameState.difficultyMode || 'adaptive'} />}
      {screen === 'breakingTen'&& <BreakingTenGame autoAdvance={gameState.autoAdvance} lang={gameState.lang} difficultyMode={gameState.difficultyMode || 'adaptive'} />}
      {screen === 'multiIntro' && <MultiplicationIntroGame autoAdvance={gameState.autoAdvance} lang={gameState.lang} difficultyMode={gameState.difficultyMode || 'adaptive'} />}
      {screen === 'pattern'    && <PatternGame autoAdvance={gameState.autoAdvance} lang={gameState.lang} difficultyMode={gameState.difficultyMode || 'adaptive'} />}
      {screen === 'shapeCount' && <ShapeCountGame autoAdvance={gameState.autoAdvance} lang={gameState.lang} difficultyMode={gameState.difficultyMode || 'adaptive'} />}
      {screen === 'spatial'    && <SpatialGame autoAdvance={gameState.autoAdvance} lang={gameState.lang} difficultyMode={gameState.difficultyMode || 'adaptive'} />}
      {screen === 'color'      && <ColorGame autoAdvance={gameState.autoAdvance} lang={gameState.lang} difficultyMode={gameState.difficultyMode || 'adaptive'} />}
      {screen === 'weekday'    && <WeekdayGame autoAdvance={gameState.autoAdvance} lang={gameState.lang} difficultyMode={gameState.difficultyMode || 'adaptive'} />}
      {screen === 'season'     && <SeasonGame autoAdvance={gameState.autoAdvance} lang={gameState.lang} difficultyMode={gameState.difficultyMode || 'adaptive'} />}
      {screen === 'shopping'      && <ShoppingGame autoAdvance={gameState.autoAdvance} lang={gameState.lang} difficultyMode={gameState.difficultyMode || 'adaptive'} />}
      {screen === 'placeValue'     && <PlaceValueGame lang={gameState.lang} onBack={() => setScreen('welcome')} />}
      {screen === 'oddOneOut'      && <OddOneOutGame lang={gameState.lang} onBack={() => setScreen('welcome')} />}
      {screen === 'multiStep'      && <MultiStepGame lang={gameState.lang} onBack={() => setScreen('welcome')} />}
      {screen === 'sortClassify'   && <SortClassifyGame lang={gameState.lang} onBack={() => setScreen('welcome')} />}
      {screen === 'measurement'    && <MeasurementGame lang={gameState.lang} onBack={() => setScreen('welcome')} />}
      {screen === 'multiTable'     && <MultiplicationTableGame lang={gameState.lang} onBack={() => setScreen('welcome')} />}
      {screen === 'fractions'      && <FractionsGame lang={gameState.lang} onBack={() => setScreen('welcome')} />}
      {screen === 'timeDiff'       && <TimeDiffGame lang={gameState.lang} onBack={() => setScreen('welcome')} />}
      {screen === 'missingNum'     && <MissingNumberGame lang={gameState.lang} onBack={() => setScreen('welcome')} />}
      {screen === 'mathMatch'      && <MathMatchingGame lang={gameState.lang} onBack={() => setScreen('welcome')} />}
      {screen === 'columnMath'     && <ColumnMathGame lang={gameState.lang} onBack={() => setScreen('welcome')} />}
      {screen === 'division'       && <DivisionIntroGame lang={gameState.lang} onBack={() => setScreen('welcome')} />}
      {screen === 'numberLine'     && <NumberLineGame lang={gameState.lang} onBack={() => setScreen('welcome')} />}
      {screen === 'areaPerim'      && <AreaPerimeterGame lang={gameState.lang} onBack={() => setScreen('welcome')} />}
      {screen === 'dataCharts'     && <DataChartsGame lang={gameState.lang} onBack={() => setScreen('welcome')} />}
      {screen === 'money'          && <MoneyGame lang={gameState.lang} onBack={() => setScreen('welcome')} />}
      {screen === 'temperature'    && <TemperatureGame lang={gameState.lang} onBack={() => setScreen('welcome')} />}
      {screen === 'symmetry'       && <SymmetryGame lang={gameState.lang} onBack={() => setScreen('welcome')} />}
      {screen === 'codingMaze'     && <CodingMazeGame lang={gameState.lang} onBack={() => setScreen('welcome')} />}
      {screen === 'block3D'        && <Block3DGame lang={gameState.lang} onBack={() => setScreen('welcome')} />}
      {screen === 'balance'        && <BalanceScaleGame lang={gameState.lang} onBack={() => setScreen('welcome')} />}
      {screen === 'probability'    && <ProbabilityGame lang={gameState.lang} onBack={() => setScreen('welcome')} />}
      {screen === 'make10Pop'      && <Make10PopGame lang={gameState.lang} onBack={() => setScreen('welcome')} />}
      {screen === 'mathLink'       && <MathLinkGame lang={gameState.lang} onBack={() => setScreen('welcome')} />}
      {screen === 'subpop'         && <SubPopGame lang={gameState.lang} onBack={() => setScreen('welcome')} />}
      {screen === 'waterJug'       && <WaterJugGame lang={gameState.lang} onBack={() => setScreen('welcome')} />}
      {/* --- EDUCATION PHILOSOPHY MODAL --- */}
      {showPhilosophy && (
        <div className="fade-in" style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          padding: '16px'
        }}>
          <div className="card-shadow bounce-in" style={{
            width: '100%', maxWidth: '460px', maxHeight: '85vh',
            padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px',
            overflowY: 'auto', position: 'relative', background: 'white', borderRadius: '32px'
          }}>
            {/* Close Button */}
            <button onClick={() => { audioSynth.playClick(); setShowPhilosophy(false); }}
              style={{
                position: 'absolute', top: '16px', right: '16px', border: 'none',
                background: 'rgba(0,0,0,0.05)', width: '32px', height: '32px',
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#db2777', zIndex: 10
              }}>
              <X size={20} />
            </button>

            <h2 className="title-glow" style={{ fontSize: '1.8rem', color: '#c0487a', margin: '10px 0 0 0', textAlign: 'center', flexShrink: 0 }}>
              {t('philosophyTitle', gameState.lang)}
            </h2>

            {/* Short introductory text */}
            <div style={{
              background: '#fffbeb', border: '1.5px solid #fef3c7', borderRadius: '16px',
              padding: '12px 14px', fontSize: '0.85rem', color: '#92400e', lineHeight: 1.45,
              fontWeight: '600', flexShrink: 0
            }}>
              {t('philosophyQuote', gameState.lang)}
            </div>

            {/* Infographic Poster */}
            <div style={{ borderRadius: '16px', overflow: 'hidden', border: '2px solid #ffd6e8', boxShadow: '0 4px 12px rgba(255,93,158,0.1)', flexShrink: 0 }}>
              <img src={philosophyImg} alt="Our Philosophy" style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

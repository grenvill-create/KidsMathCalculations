import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Settings, Home, X, Check, BookOpen } from 'lucide-react';
import { audioSynth } from './utils/audioSynth';
import { mathGenerator } from './utils/mathGenerator';
import { progressManager } from './utils/progressManager';
import MathManipulatives from './components/MathManipulatives';

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
    // gameState already reflects the edits; just persist and go back
    progressManager.saveState(gameState);
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
      localStorage.removeItem('km_maxNumber');
      localStorage.removeItem('km_operations');
      setGameState(progressManager.getInitialState());
      alert('进度已成功重置！');
    }
  };

  // --- RANGE SETTINGS ---
  const setMaxNumber = (val) => {
    const newState = { ...gameState, maxNumber: val };
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

  const startNewQuestion = (mode) => {
    setUserAns('');
    setErrorCount(0);
    setBasketFull(false);
    setShowHelp(false);

    if (mode === 'playing') {
      const opts = {
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

  const toggleMute = () => {
    audioSynth.setMuteState(!audioSynth.getMuteState());
    setGameState(prev => ({ ...prev }));
  };

  const isKeypadLocked = () => false;

  // Derive a label for the current range on the welcome screen
  const currentRangeLabel = `${gameState.maxNumber ?? 10} 以内`;
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
            <button className="bouncy-button secondary" onClick={startReview}
              style={{ position: 'relative', width: '100%', padding: '13px', fontSize: '1.1rem', borderRadius: '22px' }}>
              <BookOpen size={22} /> 错题大作战
              {gameState.mistakes.length > 0 && (
                <span style={{
                  position: 'absolute', top: -10, right: -8,
                  background: 'linear-gradient(135deg, #ff85b8, #ff5d9e)',
                  color: 'white', borderRadius: '50px',
                  padding: '3px 11px', fontSize: '0.95rem',
                  border: '2.5px solid white',
                  boxShadow: '0 3px 8px rgba(255,93,158,0.35)',
                  fontWeight: '700',
                }}>
                  {gameState.mistakes.length}
                </span>
              )}
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
              <p style={{ opacity: 0.7, fontSize: '0.9rem', marginBottom: '12px' }}>选择小朋友计算的数字范围，数字越大越有挑战性哦！</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
                {RANGE_PRESETS.map(preset => (
                  <button
                    key={preset.value}
                    onClick={() => setMaxNumber(preset.value)}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '25px',
                      border: '3px solid',
                      borderColor: (gameState.maxNumber ?? 10) === preset.value ? '#e07a5f' : '#f5c0d0',
                      background: (gameState.maxNumber ?? 10) === preset.value ? 'linear-gradient(135deg, #ffb5c8, #ff8fab)' : 'white',
                      color: (gameState.maxNumber ?? 10) === preset.value ? 'white' : '#c06080',
                      fontWeight: '700',
                      fontSize: '1rem',
                      cursor: 'pointer',
                      fontFamily: 'Fredoka, sans-serif',
                      boxShadow: (gameState.maxNumber ?? 10) === preset.value ? '0 4px 12px rgba(255,100,150,0.35)' : '0 2px 6px rgba(0,0,0,0.08)',
                      transition: 'all 0.2s ease',
                      transform: (gameState.maxNumber ?? 10) === preset.value ? 'scale(1.08)' : 'scale(1)',
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Custom input */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <label style={{ fontWeight: '600', color: '#b5558a', fontSize: '0.95rem' }}>自定义数值：</label>
                <input
                  type="number"
                  min={5}
                  max={9999}
                  value={gameState.maxNumber ?? 10}
                  onChange={e => {
                    const v = parseInt(e.target.value);
                    if (!isNaN(v) && v >= 5) setMaxNumber(v);
                  }}
                  style={{
                    width: '90px', padding: '8px 12px',
                    borderRadius: '15px', border: '2px solid #f5c0d0',
                    fontSize: '1.1rem', textAlign: 'center',
                    fontFamily: 'Fredoka, sans-serif', color: '#b5558a',
                    fontWeight: '700',
                  }}
                />
                <span style={{ opacity: 0.6, fontSize: '0.9rem' }}>（最小 5，最大 9999）</span>
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
    </div>
  );
}

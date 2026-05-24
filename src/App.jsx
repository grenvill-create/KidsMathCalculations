import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Settings, Home, X, Check, BookOpen } from 'lucide-react';
import { audioSynth } from './utils/audioSynth';
import { mathGenerator } from './utils/mathGenerator';
import { progressManager } from './utils/progressManager';
import MathManipulatives from './components/MathManipulatives';

export default function App() {
  const [screen, setScreen] = useState('welcome'); // welcome, guardian, settings, playing, review
  const [gameState, setGameState] = useState(progressManager.getInitialState());
  
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
  const [basketFull, setBasketFull] = useState(false); // Used to unlock keypad in early stages
  const [showHelp, setShowHelp] = useState(false); // Used in stage 3

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
      setGeneratedSyncCode(progressManager.generateSyncCode());
      setScreen('settings');
    } else {
      setScreen('welcome');
    }
  };

  // --- SETTINGS ---
  const importSync = () => {
    if (progressManager.importSyncCode(syncCodeInput)) {
      alert("同步成功！");
      setGameState(progressManager.getInitialState());
    } else {
      alert("无效的同步码");
    }
  };

  const clearMistakes = () => {
    if (confirm("确定要清空所有错题记录吗？")) {
      const newState = { ...gameState, mistakes: [] };
      setGameState(newState);
      progressManager.saveState(newState);
    }
  };

  // --- GAMEPLAY ---
  const startGame = () => {
    audioSynth.playClick();
    startNewQuestion('playing');
  };

  const startReview = () => {
    if (gameState.mistakes.length === 0) {
      alert("太棒啦！目前没有错题记录！");
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
      setCurrentQ(mathGenerator.generateQuestion(gameState.stage));
      setScreen('playing');
    } else if (mode === 'review') {
      // Pick random mistake
      const m = gameState.mistakes[Math.floor(Math.random() * gameState.mistakes.length)];
      setCurrentQ({
        problemStr: m.problemStr, num1: m.num1, num2: m.num2, symbol: m.symbol, answer: m.answer,
        spokenText: `${m.num1} ${m.symbol === '+' ? '加' : '减'} ${m.num2} 等于几？`,
        stage: 2 // Treat reviews as stage 2 (visual help)
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
      
      // If it was a review and correct on first try, resolve it
      if (screen === 'review' && errorCount === 0 && !showHelp) {
        nextState.mistakes = nextState.mistakes.filter(m => m.problemStr !== currentQ.problemStr);
      }

      setGameState(nextState);
      
      setUserAns('');
      
      if (screen === 'review' && nextState.mistakes.length === 0) {
        alert("恭喜！所有错题都被你消灭啦！");
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
      
      // Record mistake
      progressManager.recordMistake(currentQ.problemStr, currentQ.num1, currentQ.num2, currentQ.symbol, currentQ.answer);
      setGameState(progressManager.getInitialState());

      if (newErr >= 2) {
        audioSynth.speak("再仔细数一数哦。");
      }
    }
  };

  const toggleMute = () => {
    audioSynth.setMuteState(!audioSynth.getMuteState());
    setGameState(prev => ({...prev})); // force render
  };

  const isKeypadLocked = () => {
    // Unlocked completely per user request. Dragging is optional.
    return false;
  };

  return (
    <div id="app-viewport">
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px' }}>
        <button className="bouncy-button secondary" onClick={toggleMute}>
          {audioSynth.getMuteState() ? <VolumeX size={24} color="#E07A5F" /> : <Volume2 size={24} />}
        </button>
        {screen !== 'welcome' && screen !== 'guardian' && screen !== 'settings' && (
          <button className="bouncy-button secondary" onClick={() => setScreen('welcome')}>
            <Home size={24} />
          </button>
        )}
        {screen === 'welcome' && (
          <button className="bouncy-button secondary" onClick={openGuardian}>
            <Settings size={24} /> 家长
          </button>
        )}
      </div>

      {/* --- WELCOME SCREEN --- */}
      {screen === 'welcome' && (
        <div className="screen-wrapper fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          
          <div className="hero-animation" style={{ fontSize: '5rem', marginBottom: '-20px', animation: 'float 3s ease-in-out infinite' }}>
            🌟
          </div>

          <h1 className="title-glow" style={{ fontSize: '3.5rem', margin: '20px 0', textShadow: '4px 4px 0 white, -2px -2px 0 white' }}>
            奇妙数学冒险
          </h1>
          <p style={{ opacity: 0.8, marginBottom: '40px', fontSize: '1.2rem', fontWeight: 'bold' }}>开始你的奇妙计算之旅吧！</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '90%', maxWidth: '350px' }}>
            <button className="bouncy-button primary" onClick={startGame} style={{ padding: '20px', fontSize: '1.5rem', borderRadius: '30px' }}>
              🚀 马上开始 (阶段 {gameState.stage})
            </button>
            <button className="bouncy-button secondary" onClick={startReview} style={{ position: 'relative', padding: '15px', fontSize: '1.2rem', borderRadius: '30px' }}>
              <BookOpen size={24} /> 错题大作战
              {gameState.mistakes.length > 0 && (
                <span style={{ position: 'absolute', top: -10, right: -10, background: '#ffb5a7', color: 'white', borderRadius: '15px', padding: '4px 12px', fontSize: '1rem', border: '3px solid white', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
                  {gameState.mistakes.length}
                </span>
              )}
            </button>
          </div>
          
          <p style={{ marginTop: '40px', opacity: 0.6, fontSize: '0.9rem' }}>已累计解题: {gameState.history.totalSolved}</p>
          
          <style>{`
            @keyframes float {
              0% { transform: translateY(0px) rotate(0deg); }
              50% { transform: translateY(-20px) rotate(10deg); }
              100% { transform: translateY(0px) rotate(0deg); }
            }
            .hero-animation { filter: drop-shadow(0 10px 10px rgba(0,0,0,0.1)); }
          `}</style>
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
              <button className="bouncy-button secondary" onClick={() => setScreen('welcome')}><X/></button>
              <button className="bouncy-button primary" onClick={checkGuardian}><Check/></button>
            </div>
          </div>
        </div>
      )}

      {/* --- SETTINGS --- */}
      {screen === 'settings' && (
        <div className="screen-wrapper fade-in">
          <div className="card-shadow" style={{ padding: '20px', width: '100%', maxWidth: '500px', overflowY: 'auto', maxHeight: '80vh' }}>
            <h2 className="title-glow">教案配置室</h2>
            
            <div style={{ margin: '20px 0', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
              <h3>调整学习阶段</h3>
              <select 
                value={gameState.stage} 
                onChange={(e) => setGameState({...gameState, stage: parseInt(e.target.value)})}
                style={{ width: '100%', padding: '10px', fontSize: '1.2rem', marginTop: '10px' }}
              >
                <option value="1">阶段一：感知与计数 (0-10)</option>
                <option value="2">阶段二：具象加减法 (运算启蒙)</option>
                <option value="3">阶段三：半抽象运算 (去教具化过渡)</option>
                <option value="4">阶段四：十进制引入 (进阶 11-20)</option>
              </select>
            </div>

            <div style={{ margin: '20px 0', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
              <h3>错题本数据</h3>
              <p>当前记录错题数量：{gameState.mistakes.length}</p>
              <button className="bouncy-button mistake" onClick={clearMistakes} style={{ marginTop: '10px' }}>
                清空错题本
              </button>
            </div>

            <div style={{ margin: '20px 0' }}>
              <h3>进度跨设备同步</h3>
              <p style={{ opacity: 0.7, fontSize: '0.9rem', marginBottom: '10px' }}>通过“同步码”可以在iPad和电脑之间互传进度。</p>
              <p><strong>本机同步码导出：</strong></p>
              <textarea readOnly value={generatedSyncCode} style={{ width: '100%', height: '60px', fontSize: '0.8rem' }} />
              
              <p style={{ marginTop: '10px' }}><strong>从其他设备导入：</strong></p>
              <div style={{ display: 'flex', gap: '5px' }}>
                <input type="text" value={syncCodeInput} onChange={e=>setSyncCodeInput(e.target.value)} placeholder="粘贴同步码" style={{ flex: 1 }} />
                <button className="bouncy-button secondary" onClick={importSync}>导入</button>
              </div>
            </div>

            <button className="bouncy-button primary" onClick={() => setScreen('welcome')} style={{ width: '100%' }}>
              返回
            </button>
          </div>
        </div>
      )}

      {/* --- PLAYING / REVIEW SCREEN --- */}
      {(screen === 'playing' || screen === 'review') && currentQ && (
        <div className="screen-wrapper" style={{ justifyContent: 'space-between', paddingBottom: '10px' }}>
          
          <div className="equation-container">
            {screen === 'review' && <span style={{fontSize:'1.5rem', position:'absolute', top: 60, color:'#E07A5F'}}>⭐ 错题复习</span>}
            <span>{currentQ.num1}</span>
            <span className="math-operator">{currentQ.symbol}</span>
            <span>{currentQ.num2}</span>
            <span>=</span>
            <div className="answer-box">
              {userAns === '' ? '?' : userAns}
            </div>
          </div>

          {/* Manipulatives area: Show for stage 1 & 2. For stage 3/4 show if showHelp is true */}
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

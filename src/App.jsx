import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Settings, Home, X, Check } from 'lucide-react';
import { audioSynth } from './utils/audioSynth';
import { mathGenerator } from './utils/mathGenerator';
import VisualCounters from './components/VisualCounters';

const THEMES = [
  { id: 'space', icon: '🚀', className: 'theme-space' },
  { id: 'candy', icon: '🍬', className: 'theme-candy' },
  { id: 'forest', icon: '🍎', className: 'theme-forest' }
];

export default function App() {
  const [screen, setScreen] = useState('welcome'); // welcome, guardian, settings, playing
  const [theme, setTheme] = useState('candy');
  
  // Parental Settings
  const [maxNumber, setMaxNumber] = useState(10);
  const [allowSub, setAllowSub] = useState(true);
  
  // Guardian Gate
  const [guardianQ, setGuardianQ] = useState(null);
  const [guardianA, setGuardianA] = useState('');

  // Game State
  const [currentQ, setCurrentQ] = useState(null);
  const [userAns, setUserAns] = useState('');
  const [errorCount, setErrorCount] = useState(0); // For gentle guidance
  const [errorPulse, setErrorPulse] = useState(false);
  const [stars, setStars] = useState(0);

  useEffect(() => {
    const savedMax = localStorage.getItem('km_maxNum');
    const savedSub = localStorage.getItem('km_allowSub');
    const savedStars = localStorage.getItem('km_stars');
    const savedTheme = localStorage.getItem('km_theme');

    if (savedMax) setMaxNumber(parseInt(savedMax));
    if (savedSub) setAllowSub(savedSub === 'true');
    if (savedStars) setStars(parseInt(savedStars));
    if (savedTheme) setTheme(savedTheme);
  }, []);

  useEffect(() => {
    document.body.className = THEMES.find(t => t.id === theme)?.className || 'theme-candy';
  }, [theme]);

  // Read out the question whenever a new one is generated
  useEffect(() => {
    if (screen === 'playing' && currentQ) {
      setTimeout(() => {
        audioSynth.speak(currentQ.spokenText);
      }, 500); // Slight delay for smoother transition
    }
  }, [currentQ, screen]);

  // Keyboard support
  useEffect(() => {
    const handleKey = (e) => {
      if (screen !== 'playing') return;
      if (e.key >= '0' && e.key <= '9') {
        audioSynth.playClick();
        if (userAns.length < 3) setUserAns(prev => prev + e.key);
      } else if (e.key === 'Backspace') {
        audioSynth.playClick();
        setUserAns(prev => prev.slice(0, -1));
      } else if (e.key === 'Enter') {
        submitAnswer();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [screen, userAns, currentQ]);

  // --- GUARDIAN GATE ---
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
      setScreen('settings');
    } else {
      setScreen('welcome');
    }
  };

  const saveSettings = () => {
    localStorage.setItem('km_maxNum', maxNumber.toString());
    localStorage.setItem('km_allowSub', allowSub.toString());
    localStorage.setItem('km_theme', theme);
    setScreen('welcome');
  };

  // --- GAMEPLAY ---
  const startGame = () => {
    audioSynth.playClick();
    setUserAns('');
    setErrorCount(0);
    setErrorPulse(false);
    setCurrentQ(mathGenerator.generateQuestion(maxNumber, allowSub));
    setScreen('playing');
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
      // Correct!
      audioSynth.playCorrect();
      const nStars = stars + 1;
      setStars(nStars);
      localStorage.setItem('km_stars', nStars.toString());
      
      setUserAns('');
      setErrorCount(0);
      setErrorPulse(false);
      setTimeout(() => {
        setCurrentQ(mathGenerator.generateQuestion(maxNumber, allowSub));
      }, 1000);
    } else {
      // Wrong - Gentle Guidance
      audioSynth.playIncorrect();
      setUserAns('');
      
      const newErr = errorCount + 1;
      setErrorCount(newErr);
      
      // If failed 2 times, highlight the visual counters to guide them
      if (newErr >= 2) {
        setErrorPulse(true);
        audioSynth.speak("数一数上面的图形吧！");
        setTimeout(() => setErrorPulse(false), 2000);
      }
    }
  };

  const toggleMute = () => {
    audioSynth.setMuteState(!audioSynth.getMuteState());
    audioSynth.playClick();
    // Force re-render to update icon
    setStars(prev => prev); 
  };

  return (
    <div id="app-viewport">
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px' }}>
        <button className="bouncy-button secondary" style={{ padding: '8px', borderRadius: '50%' }} onClick={toggleMute}>
          {audioSynth.getMuteState() ? <VolumeX size={24} color="#FF6688" /> : <Volume2 size={24} />}
        </button>

        {screen !== 'welcome' && screen !== 'guardian' && screen !== 'settings' && (
          <button className="bouncy-button secondary" style={{ padding: '8px', borderRadius: '50%' }} onClick={() => setScreen('welcome')}>
            <Home size={24} />
          </button>
        )}

        {screen === 'welcome' && (
          <button className="bouncy-button secondary" style={{ padding: '8px', borderRadius: '50%' }} onClick={openGuardian}>
            <Settings size={24} />
          </button>
        )}
      </div>

      {/* --- WELCOME SCREEN --- */}
      {screen === 'welcome' && (
        <div className="screen-wrapper fade-in" style={{ gap: '30px' }}>
          <div style={{ fontSize: '6rem' }}>{THEMES.find(t=>t.id===theme).icon}</div>
          <h1 className="title-glow" style={{ fontSize: '3rem', textAlign: 'center' }}>快乐算术</h1>
          
          <div className="stat-pill" style={{ fontSize: '1.5rem', padding: '10px 20px', background: 'rgba(255,255,255,0.2)' }}>
            ⭐ {stars}
          </div>

          <button 
            className="bouncy-button primary" 
            style={{ fontSize: '2.5rem', padding: '20px 60px', borderRadius: '40px', marginTop: '20px' }}
            onClick={startGame}
          >
            开始玩！
          </button>
        </div>
      )}

      {/* --- GUARDIAN GATE --- */}
      {screen === 'guardian' && guardianQ && (
        <div className="screen-wrapper fade-in">
          <div className="card-shadow" style={{ padding: '30px', textAlign: 'center', width: '90%', maxWidth: '400px' }}>
            <h2 className="title-glow" style={{ color: '#FF3366', marginBottom: '20px' }}>家长解锁</h2>
            <p style={{ marginBottom: '20px', opacity: 0.8 }}>请回答下列算式以进入设置：</p>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '20px' }}>
              {guardianQ.str}
            </div>
            <input 
              type="number" 
              value={guardianA} 
              onChange={e => setGuardianA(e.target.value)}
              style={{ fontSize: '2rem', width: '100px', textAlign: 'center', padding: '10px', borderRadius: '10px', border: '2px solid #ccc', marginBottom: '20px' }}
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button className="bouncy-button secondary" onClick={() => setScreen('welcome')}><X size={24}/></button>
              <button className="bouncy-button primary" onClick={checkGuardian}><Check size={24}/></button>
            </div>
          </div>
        </div>
      )}

      {/* --- PARENTAL SETTINGS --- */}
      {screen === 'settings' && (
        <div className="screen-wrapper fade-in">
          <div className="card-shadow" style={{ padding: '30px', width: '90%', maxWidth: '450px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 className="title-glow" style={{ textAlign: 'center' }}>家长设置台</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ fontWeight: 'bold' }}>设定最大数值范围 (当前: {maxNumber})</label>
              <input 
                type="range" 
                min="5" max="100" step="1" 
                value={maxNumber} 
                onChange={e => setMaxNumber(parseInt(e.target.value))}
                style={{ width: '100%', height: '20px' }}
              />
              <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>题目生成的所有数字（包括答案）均不会超过此数值。</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ fontWeight: 'bold' }}>启用减法运算</label>
              <input 
                type="checkbox" 
                checked={allowSub} 
                onChange={e => setAllowSub(e.target.checked)}
                style={{ width: '24px', height: '24px' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ fontWeight: 'bold' }}>更换主题</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {THEMES.map(t => (
                  <button 
                    key={t.id} 
                    className={`bouncy-button ${theme === t.id ? 'primary' : 'secondary'}`}
                    onClick={() => setTheme(t.id)}
                    style={{ flex: 1, fontSize: '1.5rem' }}
                  >
                    {t.icon}
                  </button>
                ))}
              </div>
            </div>

            <button className="bouncy-button primary" onClick={saveSettings} style={{ marginTop: '20px' }}>
              保存并返回
            </button>
          </div>
        </div>
      )}

      {/* --- PLAYING SCREEN (5-YEAR-OLD FOCUS) --- */}
      {screen === 'playing' && currentQ && (
        <div className="screen-wrapper" style={{ justifyContent: 'flex-start' }}>
          
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
            <div className="stat-pill" style={{ fontSize: '1.5rem' }}>⭐ {stars}</div>
          </div>

          <div className="math-question-card card-shadow" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '10px' }}>
            
            <div className="equation-container" style={{ fontSize: '4rem', gap: '10px', marginTop: '0' }}>
              <span className="math-number">{currentQ.num1}</span>
              <span className="math-operator">{currentQ.symbol}</span>
              <span className="math-number">{currentQ.num2}</span>
              <span className="math-operator">=</span>
              <div className={`answer-box ${userAns === '' ? 'empty' : ''}`} style={{ fontSize: '4.5rem', minWidth: '100px', minHeight: '80px' }}>
                {userAns === '' ? '?' : userAns}
              </div>
            </div>

            {/* Visual Helpers (Always show if maxNumber is reasonably small <= 20) */}
            {maxNumber <= 20 && (
              <VisualCounters
                num1={currentQ.num1}
                num2={currentQ.num2}
                symbol={currentQ.symbol}
                theme={theme}
                errorPulse={errorPulse}
              />
            )}

            <div style={{ flex: 1 }}></div>

            {/* Giant Toddler Keypad */}
            <div className="keypad-grid" style={{ maxWidth: '100%', gap: '8px', padding: '10px' }}>
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(val => (
                <button key={val} className="keypad-btn" onClick={() => padPress(val)} style={{ fontSize: '2.5rem', borderRadius: '24px' }}>
                  {val}
                </button>
              ))}
              <button className="keypad-btn action-clear" onClick={() => padPress('C')} style={{ fontSize: '2.5rem', borderRadius: '24px' }}>
                ❌
              </button>
              <button className="keypad-btn" onClick={() => padPress('0')} style={{ fontSize: '2.5rem', borderRadius: '24px' }}>
                0
              </button>
              <button className="keypad-btn action-submit" onClick={submitAnswer} style={{ fontSize: '2.5rem', borderRadius: '24px', gridColumn: 'span 1' }}>
                ✅
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

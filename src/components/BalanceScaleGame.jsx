import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Check } from 'lucide-react';
import { audioSynth } from '../utils/audioSynth';

const LEVELS = [
  { leftKnown: 2, rightTotal: 5, ans: 3 }, // X + 2 = 5
  { leftKnown: 4, rightTotal: 10, ans: 6 }, // X + 4 = 10
  { leftKnown: 1, rightTotal: 8, ans: 7 }, // X + 1 = 8
  { leftKnown: 5, rightTotal: 12, ans: 7 }, // X + 5 = 12
  { leftKnown: 8, rightTotal: 15, ans: 7 }, // X + 8 = 15
];

export default function BalanceScaleGame({ lang, onBack }) {
  const [levelIdx, setLevelIdx] = useState(0);
  const [userAns, setUserAns] = useState('');
  const [isSolved, setIsSolved] = useState(false);
  const [scaleAngle, setScaleAngle] = useState(15); // Start unbalanced (left is lighter, so left goes up, right goes down)

  const currentLevel = LEVELS[levelIdx];

  useEffect(() => {
    setUserAns('');
    setIsSolved(false);
    setScaleAngle(-15); // Left side is lighter initially because X is empty
  }, [levelIdx]);

  useEffect(() => {
    // Dynamically adjust scale based on user input
    if (userAns !== '') {
      const val = parseInt(userAns);
      const diff = (val + currentLevel.leftKnown) - currentLevel.rightTotal;
      if (diff === 0) setScaleAngle(0);
      else if (diff < 0) setScaleAngle(-15);
      else setScaleAngle(15);
    } else {
      setScaleAngle(-15);
    }
  }, [userAns, currentLevel]);

  const checkAnswer = () => {
    if (parseInt(userAns) === currentLevel.ans) {
      audioSynth.playCorrect();
      setIsSolved(true);
      setScaleAngle(0); // perfectly balanced
    } else {
      audioSynth.playIncorrect();
      setUserAns('');
    }
  };

  const nextLevel = () => {
    audioSynth.playClick();
    setLevelIdx((prev) => (prev + 1) % LEVELS.length);
  };

  const padPress = (val) => {
    audioSynth.playClick();
    if (val === 'C') {
      setUserAns('');
    } else {
      if (userAns.length < 2) setUserAns(prev => prev + val);
    }
  };

  return (
    <div className="screen-wrapper fade-in" style={{ padding: '20px', overflowY: 'auto' }}>
      <div className="card-shadow" style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <button className="bouncy-button secondary" onClick={onBack} style={{ padding: '8px 12px' }}>
            <ArrowLeft size={20} />
          </button>
          <h2 style={{ color: '#c0487a', margin: 0 }}>{lang === 'en' ? 'Balance Scale' : '天平游戏'}</h2>
          <button className="bouncy-button secondary" onClick={() => { audioSynth.playClick(); setUserAns(''); setIsSolved(false); }} style={{ padding: '8px 12px' }}>
            <RefreshCw size={20} />
          </button>
        </div>

        <p style={{ color: '#4b5563', marginBottom: '20px', textAlign: 'center' }}>
          {lang === 'en' ? 'What is the weight of the mystery box to balance the scale?' : '神秘盒子的重量是多少，才能让天平平衡？'}
        </p>

        {/* Visual Scale Area */}
        <div style={{ position: 'relative', width: '300px', height: '200px', marginBottom: '30px' }}>
          {/* Base */}
          <div style={{ position: 'absolute', bottom: 0, left: '140px', width: '20px', height: '100px', backgroundColor: '#94a3b8', borderRadius: '4px' }} />
          <div style={{ position: 'absolute', bottom: 0, left: '110px', width: '80px', height: '15px', backgroundColor: '#64748b', borderRadius: '8px' }} />
          <div style={{ position: 'absolute', bottom: '100px', left: '140px', width: '0', height: '0', borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderBottom: '20px solid #94a3b8' }} />

          {/* Beam */}
          <div style={{ 
            position: 'absolute', bottom: '110px', left: '30px', width: '240px', height: '10px', 
            backgroundColor: '#fcd34d', borderRadius: '5px',
            transformOrigin: 'center', transform: `rotate(${scaleAngle}deg)`, transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}>
            {/* Left Pan Line & Pan */}
            <div style={{ position: 'absolute', left: 0, top: '5px', width: '2px', height: '50px', backgroundColor: '#94a3b8' }} />
            <div style={{ position: 'absolute', left: '-25px', top: '55px', width: '50px', height: '10px', backgroundColor: '#fbbf24', borderRadius: '5px' }} />
            {/* Left Content: Mystery Box + Known Weight */}
            <div style={{ position: 'absolute', left: '-20px', top: '15px', display: 'flex', alignItems: 'flex-end', gap: '2px' }}>
              <div style={{ width: '30px', height: '30px', backgroundColor: '#c084fc', border: '2px solid #a855f7', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                ?
              </div>
              <div style={{ width: '25px', height: '25px', backgroundColor: '#93c5fd', border: '2px solid #60a5fa', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e3a8a', fontSize: '0.8rem', fontWeight: 'bold' }}>
                {currentLevel.leftKnown}
              </div>
            </div>

            {/* Right Pan Line & Pan */}
            <div style={{ position: 'absolute', right: 0, top: '5px', width: '2px', height: '50px', backgroundColor: '#94a3b8' }} />
            <div style={{ position: 'absolute', right: '-25px', top: '55px', width: '50px', height: '10px', backgroundColor: '#fbbf24', borderRadius: '5px' }} />
            {/* Right Content: Total Known Weight */}
            <div style={{ position: 'absolute', right: '-15px', top: '15px' }}>
              <div style={{ width: '35px', height: '35px', backgroundColor: '#93c5fd', border: '2px solid #60a5fa', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e3a8a', fontSize: '1rem', fontWeight: 'bold' }}>
                {currentLevel.rightTotal}
              </div>
            </div>
          </div>
        </div>

        {/* Input & Keypad */}
        <div className="equation-container" style={{ marginBottom: '20px' }}>
          <span>?</span>
          <span className="math-operator">+</span>
          <span>{currentLevel.leftKnown}</span>
          <span style={{ opacity: 0.85 }}>=</span>
          <span>{currentLevel.rightTotal}</span>
        </div>
        
        <div className="equation-container" style={{ marginBottom: '20px' }}>
          <span>{lang === 'en' ? 'Box = ' : '盒子 = '}</span>
          <div className="answer-box">
            {userAns === '' ? '?' : userAns}
          </div>
        </div>

        {isSolved ? (
          <div className="bounce-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '1.4rem', color: '#22c55e', fontWeight: '700', marginBottom: '16px' }}>
              🌟 {lang === 'en' ? 'Balanced!' : '平衡啦！'}
            </div>
            <button className="bouncy-button primary" onClick={nextLevel} style={{ padding: '12px 24px', fontSize: '1.2rem' }}>
              {lang === 'en' ? 'Next Scale ➔' : '下一关 ➔'}
            </button>
          </div>
        ) : (
          <div className="keypad-grid">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(val => (
              <button key={val} className="keypad-btn" onClick={() => padPress(val)}>{val}</button>
            ))}
            <button className="keypad-btn action-clear" onClick={() => padPress('C')}>❌</button>
            <button className="keypad-btn" onClick={() => padPress('0')}>0</button>
            <button className="keypad-btn action-submit" onClick={checkAnswer}>✅</button>
          </div>
        )}

      </div>
    </div>
  );
}

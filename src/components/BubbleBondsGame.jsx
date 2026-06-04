import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Settings, X, RefreshCcw } from 'lucide-react';
import { audioSynth } from '../utils/audioSynth';

const THEMES = {
  sky: {
    bg: 'linear-gradient(to bottom, #a1c4fd 0%, #c2e9fb 100%)',
    bubbleColor: 'radial-gradient(circle at 30% 30%, #fff0f5, #ffb6c1)', // Soft 3D pink balloon
    bubbleBorder: '2px solid #ff9ebb',
    bubbleShadow: 'inset -5px -5px 15px rgba(255,105,180,0.3), 0 5px 15px rgba(0,0,0,0.1)',
    textColor: '#d81b60',
    icon: '🧸', // Cute teddy bear
    name: '天空彩球'
  }
};

export default function BubbleBondsGame({ lang, onBack }) {
  const themeId = 'sky';
  const theme = THEMES[themeId];

  const [targetSum, setTargetSum] = useState(10);
  const [handNumber, setHandNumber] = useState(0);
  const [bubbles, setBubbles] = useState([]);
  const [score, setScore] = useState(0);
  
  const [showSettings, setShowSettings] = useState(false);
  const [customTargetInput, setCustomTargetInput] = useState(10);
  
  const gameAreaRef = useRef(null);
  const bubbleIdCounter = useRef(0);

  // Generate a new hand number and fresh bubbles
  const startNewRound = (target = targetSum) => {
    // Hand number must be less than target
    const newHand = Math.floor(Math.random() * target);
    setHandNumber(newHand);
    
    // Clear old bubbles and generate new ones immediately
    generateInitialBubbles(target, newHand);
  };

  const generateInitialBubbles = (target, currentHand) => {
    const newBubbles = [];
    const correctAns = target - currentHand;
    
    // Create 5-7 bubbles
    const count = Math.floor(Math.random() * 3) + 5;
    
    // Ensure at least one correct answer
    let hasCorrect = false;
    
    for (let i = 0; i < count; i++) {
      let num;
      if (!hasCorrect && (i === count - 1 || Math.random() > 0.5)) {
        num = correctAns;
        hasCorrect = true;
      } else {
        num = Math.floor(Math.random() * (target + 5));
        if (num === correctAns) num += 1; // avoid accidental duplicate correct
      }
      
      newBubbles.push(createBubble(num));
    }
    setBubbles(newBubbles);
  };

  const createBubble = (number) => {
    bubbleIdCounter.current += 1;
    return {
      id: bubbleIdCounter.current,
      number,
      left: 10 + Math.random() * 70, // percentage 10% to 80%
      size: 60 + Math.random() * 30, // 60px to 90px
      speed: 8 + Math.random() * 7, // 8s to 15s animation duration
      delay: Math.random() * 2, // 0 to 2s delay
      popping: false
    };
  };

  useEffect(() => {
    startNewRound(targetSum);
  }, [targetSum]);

  // Periodically add new bubbles if there are too few
  useEffect(() => {
    const interval = setInterval(() => {
      setBubbles(prev => {
        // Clean up popped bubbles
        const active = prev.filter(b => !b.popping);
        if (active.length < 4) {
          // If correct answer is missing, add it, otherwise random
          const correctAns = targetSum - handNumber;
          const hasCorrect = active.some(b => b.number === correctAns);
          
          let num = hasCorrect 
            ? Math.floor(Math.random() * (targetSum + 5))
            : correctAns;
            
          return [...active, createBubble(num)];
        }
        return active;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [targetSum, handNumber]);

  const handleBubbleClick = (bubble) => {
    if (bubble.popping) return;

    if (bubble.number + handNumber === targetSum) {
      audioSynth.playCorrect();
      setScore(s => s + 1);
      
      // Mark bubble as popping
      setBubbles(prev => prev.map(b => b.id === bubble.id ? { ...b, popping: true } : b));
      
      // Start next round after a short delay
      setTimeout(() => {
        startNewRound(targetSum);
      }, 500);
    } else {
      audioSynth.playError();
      // Shake effect
      const el = document.getElementById(`bubble-${bubble.id}`);
      if (el) {
        el.classList.add('shake');
        setTimeout(() => el.classList.remove('shake'), 400);
      }
    }
  };

  const applySettings = () => {
    let val = parseInt(customTargetInput);
    if (isNaN(val) || val < 5) val = 5;
    if (val > 100) val = 100;
    setTargetSum(val);
    setScore(0);
    setShowSettings(false);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: theme.bg,
      display: 'flex', flexDirection: 'column',
      fontFamily: 'Fredoka, sans-serif',
      overflow: 'hidden',
      transition: 'background 0.5s ease'
    }}>
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(100px) translateX(0px) scale(1); opacity: 0; }
          10% { opacity: 1; transform: translateY(0px) translateX(15px) scale(1); }
          50% { transform: translateY(-50vh) translateX(-20px) scale(1.05); }
          90% { opacity: 1; transform: translateY(-100vh) translateX(15px) scale(1.1); }
          100% { transform: translateY(-120vh) translateX(0px) scale(1.1); opacity: 0; }
        }
        @keyframes popBubble {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.8; }
          100% { transform: scale(2); opacity: 0; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px) rotate(-5deg); }
          75% { transform: translateX(5px) rotate(5deg); }
        }
        .shake { animation: shake 0.4s ease-in-out; }
      `}</style>

      {/* Header */}
      <div style={{
        padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)',
        zIndex: 10
      }}>
        <button onClick={onBack} style={{
          background: 'white', border: 'none', borderRadius: '50%',
          width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)', cursor: 'pointer', color: '#db2777'
        }}>
          <ArrowLeft size={24} />
        </button>
        
        <div style={{
          fontSize: '1.5rem', fontWeight: 'bold', color: 'white',
          textShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>
          {lang === 'en' ? 'Make ' : '凑成 '} <span style={{ color: '#fde047', fontSize: '1.8rem' }}>{targetSum}</span>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setShowSettings(true)} style={{
            background: 'white', border: 'none', borderRadius: '50%',
            width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)', cursor: 'pointer', color: '#0ea5e9'
          }}>
            <Settings size={24} />
          </button>
        </div>
      </div>

      {/* Game Area */}
      <div ref={gameAreaRef} style={{ flex: 1, position: 'relative' }}>
        {bubbles.map(bubble => (
          <div
            key={bubble.id}
            id={`bubble-${bubble.id}`}
            onClick={() => handleBubbleClick(bubble)}
            style={{
              position: 'absolute',
              bottom: '-100px',
              left: `${bubble.left}%`,
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              borderRadius: themeId === 'sky' ? '40% 60% 70% 30% / 40% 50% 60% 50%' : '50%', // Balloons have slightly irregular shape
              background: theme.bubbleColor,
              border: theme.bubbleBorder,
              boxShadow: theme.bubbleShadow,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: `${bubble.size * 0.4}px`,
              fontWeight: 'bold',
              color: theme.textColor,
              cursor: 'pointer',
              userSelect: 'none',
              animation: bubble.popping 
                ? `popBubble 0.3s forwards` 
                : `floatUp ${bubble.speed}s linear ${bubble.delay}s infinite`,
              zIndex: bubble.popping ? 100 : 1
            }}
          >
            {/* Balloon knot and string */}
            {!bubble.popping && (
              <>
                <div style={{
                  position: 'absolute', bottom: '-4px', width: '12px', height: '8px',
                  background: '#ffb6c1', border: '1px solid #ff9ebb', borderRadius: '50%',
                  zIndex: 2
                }} />
                <div style={{
                  position: 'absolute', bottom: '-25px', width: '2px', height: '25px',
                  background: 'rgba(255,255,255,0.8)', zIndex: -1,
                  transform: 'rotate(-5deg)'
                }} />
              </>
            )}
            {bubble.number}
          </div>
        ))}

        {/* Player Character / Hand Area */}
        <div style={{
          position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 50
        }}>
          <div style={{
            background: 'white', padding: '15px 30px', borderRadius: '30px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '15px'
          }}>
            <span style={{ fontSize: '1.2rem', color: '#64748b', fontWeight: '600' }}>
              {lang === 'en' ? 'I have: ' : '我的手牌: '}
            </span>
            <span style={{ fontSize: '2.5rem', color: '#ec4899', fontWeight: '800' }}>
              {handNumber}
            </span>
          </div>
          <div style={{ fontSize: '4rem', marginTop: '10px', filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.2))' }}>
            {theme.icon}
          </div>
        </div>

        {/* Score */}
        <div style={{
          position: 'absolute', top: '20px', left: '20px',
          background: 'rgba(255,255,255,0.8)', padding: '8px 16px', borderRadius: '20px',
          fontWeight: 'bold', color: '#f59e0b', fontSize: '1.2rem',
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
        }}>
          🌟 {score}
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200
        }}>
          <div className="bounce-in" style={{
            background: 'white', borderRadius: '24px', padding: '24px',
            width: '90%', maxWidth: '340px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#334155', textAlign: 'center' }}>
              ⚙️ {lang === 'en' ? 'Target Settings' : '自定义目标'}
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ fontSize: '1rem', color: '#64748b', fontWeight: '600' }}>
                {lang === 'en' ? 'Set Target Number (5 - 100):' : '设定你要凑的数字 (5 - 100):'}
              </label>
              <input 
                type="number" 
                value={customTargetInput} 
                onChange={e => setCustomTargetInput(e.target.value)}
                style={{
                  padding: '12px', fontSize: '1.4rem', borderRadius: '12px',
                  border: '2px solid #cbd5e1', textAlign: 'center', outline: 'none'
                }}
              />
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button onClick={() => setCustomTargetInput(10)} style={{
                  flex: 1, padding: '10px', background: '#f1f5f9', border: 'none', borderRadius: '12px', cursor: 'pointer'
                }}>凑 10</button>
                <button onClick={() => setCustomTargetInput(20)} style={{
                  flex: 1, padding: '10px', background: '#f1f5f9', border: 'none', borderRadius: '12px', cursor: 'pointer'
                }}>凑 20</button>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button onClick={() => setShowSettings(false)} style={{
                  flex: 1, padding: '14px', background: '#f1f5f9', color: '#64748b', border: 'none',
                  borderRadius: '16px', fontSize: '1.1rem', fontWeight: '600', cursor: 'pointer'
                }}>
                  {lang === 'en' ? 'Cancel' : '取消'}
                </button>
                <button onClick={applySettings} style={{
                  flex: 1, padding: '14px', background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)', 
                  color: 'white', border: 'none', borderRadius: '16px', fontSize: '1.1rem', fontWeight: 'bold',
                  cursor: 'pointer', boxShadow: '0 4px 10px rgba(14,165,233,0.3)'
                }}>
                  {lang === 'en' ? 'Apply' : '确定'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { audioSynth } from '../utils/audioSynth';

const LEVELS = [
  { 
    slices: [
      { color: '#ef4444', name: 'Red', ratio: 3 },
      { color: '#3b82f6', name: 'Blue', ratio: 1 }
    ],
    mostLikely: '#ef4444'
  },
  { 
    slices: [
      { color: '#22c55e', name: 'Green', ratio: 1 },
      { color: '#eab308', name: 'Yellow', ratio: 4 }
    ],
    mostLikely: '#eab308'
  },
  { 
    slices: [
      { color: '#a855f7', name: 'Purple', ratio: 5 },
      { color: '#ef4444', name: 'Red', ratio: 2 },
      { color: '#3b82f6', name: 'Blue', ratio: 1 }
    ],
    mostLikely: '#a855f7'
  }
];

export default function ProbabilityGame({ lang, onBack }) {
  const [levelIdx, setLevelIdx] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [userChoice, setUserChoice] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [landedColor, setLandedColor] = useState(null);

  const currentLevel = LEVELS[levelIdx];

  useEffect(() => {
    resetLevel();
  }, [levelIdx]);

  const resetLevel = () => {
    setRotation(0);
    setIsSpinning(false);
    setUserChoice(null);
    setShowResult(false);
    setLandedColor(null);
  };

  const handleChoice = (color) => {
    if (isSpinning || showResult) return;
    audioSynth.playClick();
    setUserChoice(color);
  };

  const spin = () => {
    if (!userChoice || isSpinning) return;
    audioSynth.playClick();
    setIsSpinning(true);

    // Calculate total ratio
    const totalRatio = currentLevel.slices.reduce((acc, s) => acc + s.ratio, 0);
    
    // Pick a random number
    const rand = Math.random() * totalRatio;
    let accumulated = 0;
    let targetSlice = currentLevel.slices[0];
    let targetStartAngle = 0;
    let targetAngleRange = 0;

    let currentAngle = 0;
    for (let s of currentLevel.slices) {
      const sliceAngle = (s.ratio / totalRatio) * 360;
      accumulated += s.ratio;
      if (rand <= accumulated && targetAngleRange === 0) { // found it
        targetSlice = s;
        targetStartAngle = currentAngle;
        targetAngleRange = sliceAngle;
      }
      currentAngle += sliceAngle;
    }

    // Pick a random angle within the target slice
    const angleInSlice = targetStartAngle + Math.random() * targetAngleRange;
    
    // The pointer is at the top (270 degrees in standard SVG math or just 0 rotation).
    // Let's assume pointer is at 12 o'clock. If the wheel rotates by R, the pointer relative to wheel is at -R.
    // We want -R mod 360 to fall in angleInSlice.
    // So R = 360 - angleInSlice + (360 * extraSpins)
    const extraSpins = 5 + Math.floor(Math.random() * 3);
    const finalRotation = 360 - angleInSlice + (360 * extraSpins);

    setRotation(finalRotation);

    setTimeout(() => {
      setLandedColor(targetSlice.color);
      setShowResult(true);
      setIsSpinning(false);
      
      // Check if user guessed the most likely correctly
      if (userChoice === currentLevel.mostLikely) {
        audioSynth.playCorrect();
      } else {
        audioSynth.playIncorrect();
      }
    }, 3000); // match transition duration
  };

  const nextLevel = () => {
    audioSynth.playClick();
    setLevelIdx((prev) => (prev + 1) % LEVELS.length);
  };

  // SVG Pie chart generator
  const createPieSlices = () => {
    const totalRatio = currentLevel.slices.reduce((acc, s) => acc + s.ratio, 0);
    let currentAngle = 0;
    const slices = [];

    const getCoordinatesForPercent = (percent) => {
      const x = Math.cos(2 * Math.PI * percent);
      const y = Math.sin(2 * Math.PI * percent);
      return [x, y];
    };

    currentLevel.slices.forEach((s, i) => {
      const slicePercent = s.ratio / totalRatio;
      const startPercent = currentAngle / 360;
      const endPercent = startPercent + slicePercent;

      const [startX, startY] = getCoordinatesForPercent(startPercent);
      const [endX, endY] = getCoordinatesForPercent(endPercent);

      const largeArcFlag = slicePercent > 0.5 ? 1 : 0;
      const pathData = `M 0 0 L ${startX * 100} ${startY * 100} A 100 100 0 ${largeArcFlag} 1 ${endX * 100} ${endY * 100} Z`;

      slices.push(
        <path key={i} d={pathData} fill={s.color} stroke="white" strokeWidth="2" />
      );

      currentAngle += slicePercent * 360;
    });

    return slices;
  };

  return (
    <div className="screen-wrapper fade-in" style={{ padding: '20px', overflowY: 'auto' }}>
      <div className="card-shadow" style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <button className="bouncy-button secondary" onClick={onBack} style={{ padding: '8px 12px' }}>
            <ArrowLeft size={20} />
          </button>
          <h2 style={{ color: '#c0487a', margin: 0 }}>{lang === 'en' ? 'Probability Spinner' : '转盘概率'}</h2>
          <button className="bouncy-button secondary" onClick={() => { audioSynth.playClick(); resetLevel(); }} style={{ padding: '8px 12px' }}>
            <RefreshCw size={20} />
          </button>
        </div>

        <p style={{ color: '#4b5563', marginBottom: '20px', textAlign: 'center', fontSize: '1.1rem' }}>
          {lang === 'en' ? 'Which color is the spinner most likely to land on?' : '转盘最有可能停在哪个颜色上？'}
        </p>

        {/* Color Choices */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
          {currentLevel.slices.map((s, i) => (
            <div key={i} 
              onClick={() => handleChoice(s.color)}
              style={{
                width: '60px', height: '60px', backgroundColor: s.color, borderRadius: '12px',
                border: userChoice === s.color ? '4px solid #1e293b' : '4px solid transparent',
                cursor: (isSpinning || showResult) ? 'default' : 'pointer',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                transform: userChoice === s.color ? 'scale(1.1)' : 'scale(1)',
                transition: 'all 0.2s'
              }}
            />
          ))}
        </div>

        {/* Spinner Area */}
        <div style={{ position: 'relative', width: '220px', height: '220px', marginBottom: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {/* Pointer */}
          <div style={{ position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', width: '0', height: '0', borderLeft: '15px solid transparent', borderRight: '15px solid transparent', borderTop: '30px solid #1e293b', zIndex: 10 }} />
          
          {/* Wheel */}
          <div style={{
            width: '200px', height: '200px', borderRadius: '50%', border: '4px solid #1e293b', overflow: 'hidden',
            transform: `rotate(${rotation}deg)`, transition: isSpinning ? 'transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
          }}>
            <svg viewBox="-100 -100 200 200" width="100%" height="100%" style={{ transform: 'rotate(-90deg)' }}>
              {createPieSlices()}
            </svg>
          </div>
          {/* Center Pin */}
          <div style={{ position: 'absolute', width: '20px', height: '20px', backgroundColor: '#1e293b', borderRadius: '50%', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
        </div>

        {/* Action Button & Results */}
        {!showResult ? (
          <button className="bouncy-button primary" onClick={spin} disabled={!userChoice || isSpinning} style={{ padding: '12px 30px', fontSize: '1.3rem', opacity: (!userChoice || isSpinning) ? 0.5 : 1 }}>
            {isSpinning ? (lang === 'en' ? 'Spinning...' : '旋转中...') : (lang === 'en' ? 'SPIN!' : '开始旋转！')}
          </button>
        ) : (
          <div className="bounce-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '10px' }}>
              {lang === 'en' ? 'It landed on: ' : '转盘停在了：'}
              <span style={{ display: 'inline-block', width: '20px', height: '20px', backgroundColor: landedColor, borderRadius: '50%', verticalAlign: 'middle', marginLeft: '8px', border: '2px solid #1e293b' }} />
            </div>
            
            {userChoice === currentLevel.mostLikely ? (
              <div style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '15px' }}>
                🌟 {lang === 'en' ? 'You picked the most likely color! Smart!' : '你选对了最有可能的颜色！真聪明！'}
              </div>
            ) : (
              <div style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '15px' }}>
                {lang === 'en' ? 'Oops! Notice which color has the biggest area!' : '哎呀，注意看哪个颜色的面积最大哦！'}
              </div>
            )}

            <button className="bouncy-button primary" onClick={nextLevel} style={{ padding: '12px 24px', fontSize: '1.2rem' }}>
              {lang === 'en' ? 'Next Spinner ➔' : '下一关 ➔'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

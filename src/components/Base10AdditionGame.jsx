import React, { useState, useEffect, useCallback } from 'react';
import { audioSynth } from '../utils/audioSynth';

function generateProblem(level) {
  let a, b;
  if (level === 1) {
    // Level 1: Tens + Ones (e.g. 30 + 5)
    a = (Math.floor(Math.random() * 8) + 1) * 10; // 10..80
    b = Math.floor(Math.random() * 9) + 1; // 1..9
  } else if (level === 2) {
    // Level 2: Tens + Tens (e.g. 30 + 20)
    a = (Math.floor(Math.random() * 7) + 1) * 10; // 10..70
    const maxBTens = 9 - (a / 10);
    b = (Math.floor(Math.random() * maxBTens) + 1) * 10;
  } else {
    // Level 3: Tens + Tens/Ones (e.g. 30 + 12)
    a = (Math.floor(Math.random() * 6) + 1) * 10; // 10..60
    const maxBTens = 8 - (a / 10);
    const bTens = (Math.floor(Math.random() * maxBTens) + 1) * 10;
    const bOnes = Math.floor(Math.random() * 9) + 1; // 1..9
    b = bTens + bOnes;
  }
  return { a, b, answer: a + b };
}

// Visual Base-10 Block components
const TenRod = ({ index, merged }) => (
  <div 
    className={merged ? 'bounce-in' : 'fade-in'}
    style={{
      width: '24px', height: '140px',
      background: 'linear-gradient(180deg, #60a5fa, #3b82f6)',
      borderRadius: '4px',
      border: '2px solid rgba(255,255,255,0.4)',
      boxShadow: '2px 2px 5px rgba(0,0,0,0.2)',
      // stripes to look like 10 blocks
      backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 13px, rgba(255,255,255,0.3) 13px, rgba(255,255,255,0.3) 14px)',
      animationDelay: merged ? `${index * 0.1}s` : '0s'
    }} 
  />
);

const UnitCube = ({ index, merged }) => (
  <div 
    className={merged ? 'bounce-in' : 'fade-in'}
    style={{
      width: '24px', height: '24px',
      background: 'linear-gradient(135deg, #f9a8d4, #ec4899)',
      borderRadius: '4px',
      border: '2px solid rgba(255,255,255,0.4)',
      boxShadow: '1px 1px 3px rgba(0,0,0,0.2)',
      animationDelay: merged ? `${index * 0.05}s` : '0s'
    }} 
  />
);

const BlockGroup = ({ number, isMergedFlag }) => {
  const tens = Math.floor(number / 10);
  const ones = number % 10;
  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', justifyContent: 'center', minHeight: '150px' }}>
      {Array.from({ length: tens }).map((_, i) => <TenRod key={`t-${i}`} index={i} merged={isMergedFlag} />)}
      {ones > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', justifyContent: 'flex-end' }}>
          {Array.from({ length: ones }).map((_, i) => <UnitCube key={`o-${i}`} index={i} merged={isMergedFlag} />)}
        </div>
      )}
    </div>
  );
};

export default function Base10AdditionGame({ lang = 'zh', onBack }) {
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [problem, setProblem] = useState(null);
  const [step, setStep] = useState('initial'); // 'initial', 'merged'
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  
  const zh = lang === 'zh';

  const newProblem = useCallback(() => {
    setProblem(generateProblem(level));
    setStep('initial');
    setInput('');
    setFeedback(null);
  }, [level]);

  useEffect(() => { newProblem(); }, [newProblem]);

  const handleCombine = () => {
    audioSynth.playLevelUp(); // magical sound
    setStep('merged');
  };

  const handlePad = (val) => {
    audioSynth.playClick();
    if (feedback) return;
    setInput(prev => prev.length < 3 ? prev + val : prev);
  };

  const handleClear = () => {
    audioSynth.playClick();
    setInput('');
  };

  const handleSubmit = () => {
    if (!problem || feedback) return;
    if (parseInt(input) === problem.answer) {
      audioSynth.playCorrect();
      setFeedback('correct');
      setStreak(s => s + 1);
      if (streak + 1 >= 3 && level < 3) {
        setLevel(l => l + 1);
        setStreak(0);
      }
    } else {
      audioSynth.playIncorrect();
      setFeedback('wrong');
      setStreak(0);
    }
  };

  if (!problem) return null;

  const cardStyle = {
    background: 'rgba(255,255,255,0.9)',
    backdropFilter: 'blur(16px)',
    borderRadius: '24px',
    padding: '24px',
    border: '3px solid #60a5fa',
    boxShadow: '0 8px 32px rgba(59,130,246,0.15)',
    width: '92%',
    maxWidth: '500px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
  };

  return (
    <div className="screen-wrapper fade-in" style={{ gap: '16px', paddingTop: '10px', paddingBottom: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '92%', maxWidth: '500px' }}>
        <button className="bouncy-button secondary" onClick={onBack} style={{ padding: '10px 16px' }}>🏠</button>
        <div style={{ flex: 1, textAlign: 'center', fontWeight: '800', fontSize: '1.2rem', color: '#1e40af' }}>
          {zh ? '🧱 积木加法' : '🧱 Block Addition'}
        </div>
        <div style={{ background: '#3b82f6', color: 'white', borderRadius: '50px', padding: '6px 14px', fontSize: '0.88rem', fontWeight: '700' }}>
          Lv {level}
        </div>
      </div>

      <div style={cardStyle}>
        <div style={{ fontSize: '1.2rem', color: '#1d4ed8', fontWeight: '700', textAlign: 'center' }}>
          {zh ? '看看积木是怎么合并的！' : 'Watch how the blocks combine!'}
        </div>
        
        {/* Math equation header */}
        <div style={{ fontSize: '3rem', fontWeight: '900', color: '#1e3a8a', display: 'flex', gap: '15px', alignItems: 'center' }}>
          <span>{problem.a}</span>
          <span style={{ color: '#f59e0b' }}>+</span>
          <span>{problem.b}</span>
          <span style={{ color: '#f59e0b' }}>=</span>
          <div style={{ 
            minWidth: '80px', height: '60px', border: '3px dashed #93c5fd', borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#eff6ff', color: '#1d4ed8'
          }}>
            {input || <span style={{ opacity: 0.3 }}>?</span>}
          </div>
        </div>

        {/* Visual Blocks Area */}
        <div style={{ 
          width: '100%', minHeight: '180px', background: '#f8fafc', 
          borderRadius: '16px', border: '2px solid #e2e8f0',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
          position: 'relative', overflow: 'hidden'
        }}>
          {step === 'initial' ? (
            <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-around' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <BlockGroup number={problem.a} isMergedFlag={false} />
                <div style={{ fontWeight: '800', color: '#3b82f6', fontSize: '1.2rem' }}>{problem.a}</div>
              </div>
              
              <div style={{ fontSize: '3rem', fontWeight: '900', color: '#f59e0b' }}>+</div>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <BlockGroup number={problem.b} isMergedFlag={false} />
                <div style={{ fontWeight: '800', color: '#ec4899', fontSize: '1.2rem' }}>{problem.b}</div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', width: '100%' }}>
              <BlockGroup number={problem.answer} isMergedFlag={true} />
              <div className="fade-in" style={{ fontWeight: '800', color: '#8b5cf6', fontSize: '1.4rem', animationDelay: '0.8s' }}>
                {zh ? '合在一起啦！数数看！' : 'Combined! Count them!'}
              </div>
            </div>
          )}
        </div>

        {/* Action / Feedback Area */}
        {step === 'initial' ? (
          <button className="bouncy-button primary" onClick={handleCombine} style={{ padding: '16px 30px', fontSize: '1.3rem', width: '100%', background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
            {zh ? '🪄 施放魔法：合并积木' : '🪄 Magic: Combine Blocks'}
          </button>
        ) : (
          <>
            {feedback ? (
              <div style={{
                padding: '16px 20px', borderRadius: '16px', fontWeight: '700', fontSize: '1.2rem', width: '100%', textAlign: 'center',
                background: feedback === 'correct' ? '#dcfce7' : '#fee2e2',
                color: feedback === 'correct' ? '#16a34a' : '#dc2626',
              }}>
                {feedback === 'correct' 
                  ? (zh ? '🌟 答对啦！太棒了！' : '🌟 Correct! Amazing!')
                  : (zh ? `💡 再数数看！是 ${problem.answer}` : `💡 Count again! It's ${problem.answer}`)}
              </div>
            ) : (
              <div style={{ color: '#64748b', fontWeight: 'bold' }}>
                {zh ? '请输入合起来的总数：' : 'Enter the total amount:'}
              </div>
            )}
            
            {feedback ? (
              <button className="bouncy-button primary" onClick={newProblem} style={{ padding: '16px 32px', fontSize: '1.2rem', width: '100%' }}>
                {zh ? '下一题 ➔' : 'Next ➔'}
              </button>
            ) : (
              <div className="keypad-grid" style={{ width: '100%' }}>
                {['1','2','3','4','5','6','7','8','9','C','0','✓'].map(k => (
                  <button key={k} className={`keypad-btn ${k === 'C' ? 'action-clear' : k === '✓' ? 'action-submit' : ''}`}
                    onClick={() => k === 'C' ? handleClear() : k === '✓' ? handleSubmit() : handlePad(k)}>
                    {k}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

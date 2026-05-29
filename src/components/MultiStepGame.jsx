import React, { useState, useEffect, useCallback } from 'react';
import { audioSynth } from '../utils/audioSynth';

function generateProblem(level) {
  // level 1: a + b + c (all positive, sum ≤ 15)
  // level 2: a + b - c or a - b + c (within 20)
  // level 3: a + b - c with larger numbers (within 50)

  if (level === 1) {
    const a = Math.floor(Math.random() * 5) + 1;
    const b = Math.floor(Math.random() * 4) + 1;
    const c = Math.floor(Math.random() * 4) + 1;
    const answer = a + b + c;
    return { expr: `${a} + ${b} + ${c}`, steps: [a, a + b, answer], ops: ['+', '+'], nums: [a, b, c], answer };
  } else if (level === 2) {
    const useSubFirst = Math.random() > 0.5;
    if (useSubFirst) {
      // a + b - c: ensure a + b > c
      const a = Math.floor(Math.random() * 8) + 3;
      const b = Math.floor(Math.random() * 8) + 1;
      const sumAB = a + b;
      const c = Math.floor(Math.random() * Math.min(sumAB - 1, 8)) + 1;
      const answer = sumAB - c;
      return { expr: `${a} + ${b} - ${c}`, steps: [a, sumAB, answer], ops: ['+', '-'], nums: [a, b, c], answer };
    } else {
      // a - b + c: ensure a > b
      const a = Math.floor(Math.random() * 10) + 5;
      const b = Math.floor(Math.random() * (a - 1)) + 1;
      const c = Math.floor(Math.random() * 8) + 1;
      const afterAB = a - b;
      const answer = afterAB + c;
      return { expr: `${a} - ${b} + ${c}`, steps: [a, afterAB, answer], ops: ['-', '+'], nums: [a, b, c], answer };
    }
  } else {
    // Level 3: larger numbers, mix of +/-
    const useSubFirst = Math.random() > 0.5;
    if (useSubFirst) {
      const a = Math.floor(Math.random() * 20) + 10;
      const b = Math.floor(Math.random() * 15) + 5;
      const sumAB = a + b;
      const c = Math.floor(Math.random() * Math.min(sumAB - 1, 20)) + 5;
      const answer = sumAB - c;
      return { expr: `${a} + ${b} - ${c}`, steps: [a, sumAB, answer], ops: ['+', '-'], nums: [a, b, c], answer };
    } else {
      const a = Math.floor(Math.random() * 30) + 15;
      const b = Math.floor(Math.random() * (a - 5)) + 5;
      const c = Math.floor(Math.random() * 20) + 5;
      const afterAB = a - b;
      const answer = afterAB + c;
      return { expr: `${a} - ${b} + ${c}`, steps: [a, afterAB, answer], ops: ['-', '+'], nums: [a, b, c], answer };
    }
  }
}

export default function MultiStepGame({ lang = 'zh', onBack }) {
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [problem, setProblem] = useState(null);
  const [userAns, setUserAns] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [showSteps, setShowSteps] = useState(false);

  const zh = lang === 'zh';

  const newProblem = useCallback(() => {
    setProblem(generateProblem(level));
    setUserAns('');
    setFeedback(null);
    setShowSteps(false);
  }, [level]);

  useEffect(() => { newProblem(); }, [newProblem]);

  const handlePad = (val) => {
    audioSynth.playClick();
    if (feedback) return;
    if (val === 'C') { setUserAns(''); return; }
    if (userAns.length < 3) setUserAns(prev => prev + val);
  };

  const handleSubmit = () => {
    if (!problem || feedback || userAns === '') return;
    const correct = parseInt(userAns) === problem.answer;
    if (correct) {
      audioSynth.playCorrect();
      setFeedback('correct');
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak >= 4 && level < 3) { setLevel(l => l + 1); setStreak(0); }
    } else {
      audioSynth.playIncorrect();
      setFeedback('wrong');
      setStreak(0);
    }
  };

  if (!problem) return null;

  const { nums, ops, steps } = problem;

  return (
    <div className="screen-wrapper fade-in" style={{ gap: '16px', paddingTop: '10px', paddingBottom: '20px' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '92%', maxWidth: '380px' }}>
        <button className="bouncy-button secondary" onClick={onBack} style={{ padding: '10px 16px' }}>🏠</button>
        <div style={{ flex: 1, textAlign: 'center', fontWeight: '700', fontSize: '1.1rem', color: '#0369a1' }}>
          {zh ? '🔗 连加连减' : '🔗 Multi-Step Math'}
        </div>
        <div style={{ background: 'linear-gradient(135deg, #7dd3fc, #3b82f6)', color: 'white', borderRadius: '50px', padding: '6px 14px', fontSize: '0.88rem', fontWeight: '700' }}>
          Lv {level}
        </div>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(16px)', borderRadius: '28px',
        padding: '24px 18px', border: '2px solid rgba(255,255,255,0.7)',
        boxShadow: '0 8px 32px rgba(59,130,246,0.15)', width: '92%', maxWidth: '380px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px',
      }}>
        {/* Equation display */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {nums.map((n, i) => (
            <React.Fragment key={i}>
              <div style={{
                background: 'linear-gradient(135deg, #bfdbfe, #3b82f6)', color: 'white',
                borderRadius: '14px', padding: '10px 16px', fontSize: '2rem', fontWeight: '900',
                boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
              }}>
                {n}
              </div>
              {i < ops.length && (
                <div style={{
                  width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: ops[i] === '+' ? 'linear-gradient(135deg,#4ade80,#22c55e)' : 'linear-gradient(135deg,#f87171,#ef4444)',
                  color: 'white', fontSize: '1.5rem', fontWeight: '900',
                  boxShadow: '0 3px 8px rgba(0,0,0,0.15)',
                }}>
                  {ops[i]}
                </div>
              )}
            </React.Fragment>
          ))}
          <div style={{ fontSize: '2rem', fontWeight: '900', color: '#1d4ed8' }}>=</div>
          <div style={{
            width: '64px', height: '58px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: feedback === 'correct' ? 'linear-gradient(135deg,#4ade80,#22c55e)' : feedback === 'wrong' ? 'linear-gradient(135deg,#fca5a5,#ef4444)' : 'rgba(219,234,254,0.8)',
            fontSize: '2rem', fontWeight: '900', color: feedback ? 'white' : '#1d4ed8',
            border: '3px solid', borderColor: feedback ? 'transparent' : '#bfdbfe',
            boxShadow: '0 3px 8px rgba(59,130,246,0.15)',
          }}>
            {userAns || <span style={{ opacity: 0.3 }}>?</span>}
          </div>
        </div>

        {/* Step-by-step hint */}
        {showSteps && (
          <div style={{ background: '#eff6ff', borderRadius: '16px', padding: '14px 18px', width: '100%' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#1d4ed8', marginBottom: '8px' }}>
              {zh ? '📝 分步计算：' : '📝 Step by Step:'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontSize: '1rem', color: '#1e40af' }}>
                {zh ? '① 先算：' : '① First: '}{nums[0]} {ops[0]} {nums[1]} = <strong>{steps[1]}</strong>
              </div>
              <div style={{ fontSize: '1rem', color: '#1e40af' }}>
                {zh ? '② 再算：' : '② Then: '}{steps[1]} {ops[1]} {nums[2]} = <strong>{steps[2]}</strong>
              </div>
            </div>
          </div>
        )}

        {feedback && (
          <div style={{
            padding: '12px 20px', borderRadius: '16px', fontWeight: '700', fontSize: '1rem', width: '100%', textAlign: 'center',
            background: feedback === 'correct' ? '#dcfce7' : '#fee2e2',
            color: feedback === 'correct' ? '#16a34a' : '#dc2626',
          }}>
            {feedback === 'correct'
              ? (zh ? '🌟 答对啦！太聪明了！' : '🌟 Correct! You are so smart!')
              : (zh ? `💡 正确答案是 ${problem.answer}（${nums[0]}${ops[0]}${nums[1]}=${steps[1]}，再${ops[1]}${nums[2]}=${steps[2]}）` : `💡 Answer: ${problem.answer} (${nums[0]}${ops[0]}${nums[1]}=${steps[1]}, then ${ops[1]}${nums[2]}=${steps[2]})`)}
          </div>
        )}
      </div>

      {!feedback && (
        <button className="bouncy-button secondary" onClick={() => setShowSteps(s => !s)} style={{ fontSize: '0.9rem', padding: '8px 18px' }}>
          {zh ? (showSteps ? '🙈 隐藏分步' : '💡 分步提示') : (showSteps ? '🙈 Hide Steps' : '💡 Show Steps')}
        </button>
      )}

      {!feedback && (
        <div className="keypad-grid" style={{ maxWidth: '340px' }}>
          {['1','2','3','4','5','6','7','8','9','C','0','✓'].map(k => (
            <button key={k} className={`keypad-btn ${k === 'C' ? 'action-clear' : k === '✓' ? 'action-submit' : ''}`}
              onClick={() => k === '✓' ? handleSubmit() : handlePad(k)}>
              {k}
            </button>
          ))}
        </div>
      )}

      {feedback && (
        <button className="bouncy-button primary" onClick={newProblem} style={{ padding: '14px 32px', fontSize: '1.1rem' }}>
          {zh ? '下一题 ➔' : 'Next ➔'}
        </button>
      )}
    </div>
  );
}

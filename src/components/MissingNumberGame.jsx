import React, { useState, useEffect, useCallback } from 'react';
import { audioSynth } from '../utils/audioSynth';

// Missing number game: one slot in the equation is hidden
// Modes: left operand, right operand, or result is missing
function generateProblem(level) {
  const ops = level <= 2 ? ['+', '-'] : ['+', '-', '×'];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a, b, result;

  if (op === '+') {
    const max = level === 1 ? 10 : level === 2 ? 20 : 50;
    a = Math.floor(Math.random() * (max / 2)) + 1;
    b = Math.floor(Math.random() * (max / 2)) + 1;
    result = a + b;
  } else if (op === '-') {
    const max = level === 1 ? 10 : level === 2 ? 20 : 50;
    result = Math.floor(Math.random() * (max / 2)) + 1;
    b = Math.floor(Math.random() * result) + 1;
    a = result + b;
  } else {
    a = Math.floor(Math.random() * 5) + 2;
    b = Math.floor(Math.random() * 5) + 2;
    result = a * b;
  }

  // Choose which slot to hide: 0=a, 1=b, 2=result
  const hide = Math.floor(Math.random() * 3);
  const answer = hide === 0 ? a : hide === 1 ? b : result;
  const display = {
    left: hide === 0 ? '?' : a,
    right: hide === 1 ? '?' : b,
    res: hide === 2 ? '?' : result,
    op,
    answer,
    hide,
  };
  return display;
}

export default function MissingNumberGame({ lang = 'zh', onBack }) {
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [problem, setProblem] = useState(null);
  const [userAns, setUserAns] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [shake, setShake] = useState(false);

  const zh = lang === 'zh';

  const newProblem = useCallback(() => {
    setProblem(generateProblem(level));
    setUserAns('');
    setFeedback(null);
  }, [level]);

  useEffect(() => { newProblem(); }, [newProblem]);

  const handlePad = (k) => {
    if (feedback) return;
    audioSynth.playClick();
    if (k === 'C') { setUserAns(''); return; }
    if (k === '✓') { submit(); return; }
    if (userAns.length < 3) setUserAns(p => p + k);
  };

  const submit = () => {
    if (!problem || !userAns) return;
    const correct = parseInt(userAns) === problem.answer;
    if (correct) {
      audioSynth.playCorrect();
      setFeedback('correct');
      const ns = streak + 1;
      setStreak(ns);
      if (ns >= 4 && level < 3) { setLevel(l => l + 1); setStreak(0); }
    } else {
      audioSynth.playIncorrect();
      setFeedback('wrong');
      setShake(true);
      setStreak(0);
      setTimeout(() => setShake(false), 600);
    }
  };

  if (!problem) return null;

  const slotStyle = (isHidden) => ({
    minWidth: '64px', height: '64px', borderRadius: '16px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: isHidden ? '2rem' : '2.4rem',
    fontWeight: '900',
    background: isHidden
      ? (feedback === 'correct' ? 'linear-gradient(135deg,#4ade80,#22c55e)' :
         feedback === 'wrong' ? 'linear-gradient(135deg,#fca5a5,#ef4444)' :
         'linear-gradient(135deg,#fde68a,#f59e0b)')
      : 'linear-gradient(135deg,#bfdbfe,#3b82f6)',
    color: 'white',
    boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
    padding: '0 12px',
    transition: 'all 0.3s',
  });

  const opStyle = {
    fontSize: '2rem', fontWeight: '900', color: '#7c3aed',
    width: '40px', textAlign: 'center',
  };

  const hiddenValue = feedback ? problem.answer : (userAns || '?');

  return (
    <div className="screen-wrapper fade-in" style={{ gap: '16px', paddingTop: '10px', paddingBottom: '20px' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '92%', maxWidth: '380px' }}>
        <button className="bouncy-button secondary" onClick={onBack} style={{ padding: '10px 16px' }}>🏠</button>
        <div style={{ flex: 1, textAlign: 'center', fontWeight: '700', fontSize: '1.1rem', color: '#b45309' }}>
          {zh ? '❓ 找缺失数字' : '❓ Missing Number'}
        </div>
        <div style={{ background: 'linear-gradient(135deg,#fcd34d,#f59e0b)', color: 'white', borderRadius: '50px', padding: '6px 14px', fontSize: '0.88rem', fontWeight: '700' }}>
          Lv {level}
        </div>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(16px)',
        borderRadius: '28px', padding: '28px 20px',
        border: '2px solid rgba(255,255,255,0.7)',
        boxShadow: '0 8px 32px rgba(245,158,11,0.15)',
        width: '92%', maxWidth: '380px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '22px',
      }}>
        <div style={{ fontSize: '1rem', color: '#92400e', fontWeight: '700', textAlign: 'center' }}>
          {zh ? '🔍 找出问号代表的数字！' : '🔍 Find the number that replaces the ?!'}
        </div>

        {/* Equation display */}
        <div className={shake ? 'shake-anim' : ''} style={{
          display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'center',
        }}>
          <div style={slotStyle(problem.hide === 0)}>
            {problem.hide === 0 ? hiddenValue : problem.left}
          </div>
          <div style={opStyle}>{problem.op}</div>
          <div style={slotStyle(problem.hide === 1)}>
            {problem.hide === 1 ? hiddenValue : problem.right}
          </div>
          <div style={opStyle}>=</div>
          <div style={slotStyle(problem.hide === 2)}>
            {problem.hide === 2 ? hiddenValue : problem.res}
          </div>
        </div>

        {feedback && (
          <div style={{
            padding: '12px 20px', borderRadius: '16px',
            fontWeight: '700', fontSize: '1rem', width: '100%', textAlign: 'center',
            background: feedback === 'correct' ? '#dcfce7' : '#fee2e2',
            color: feedback === 'correct' ? '#16a34a' : '#dc2626',
          }}>
            {feedback === 'correct'
              ? (zh ? '🌟 答对啦！太厉害了！' : '🌟 Correct! Well done!')
              : (zh ? `💡 答案是 ${problem.answer}，看看式子想想为什么！` : `💡 The answer is ${problem.answer}. Think about why!`)}
          </div>
        )}
      </div>

      {!feedback && (
        <div className="keypad-grid" style={{ maxWidth: '340px' }}>
          {['1','2','3','4','5','6','7','8','9','C','0','✓'].map(k => (
            <button key={k}
              className={`keypad-btn ${k === 'C' ? 'action-clear' : k === '✓' ? 'action-submit' : ''}`}
              onClick={() => handlePad(k)}>
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

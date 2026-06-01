import React, { useState, useEffect, useCallback } from 'react';
import { audioSynth } from '../utils/audioSynth';

function generateProblem(level) {
  if (level === 1) {
    // Simple addition within 20, no carry
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * 9) + 1;
    // Ensure no carry: ones digits sum < 10
    const aOnes = a % 10, bOnes = b % 10;
    if (aOnes + bOnes >= 10) return generateProblem(level); // retry
    return { op: '+', a, b, result: a + b, hasCarry: false, hasBorrow: false };
  } else if (level === 2) {
    // Addition with carry OR subtraction with borrow, within 99
    const isAdd = Math.random() > 0.5;
    if (isAdd) {
      let a, b;
      do {
        a = Math.floor(Math.random() * 40) + 10;
        b = Math.floor(Math.random() * 40) + 10;
      } while ((a % 10) + (b % 10) < 10); // must carry
      return { op: '+', a, b, result: a + b, hasCarry: true, hasBorrow: false };
    } else {
      let a, b;
      do {
        a = Math.floor(Math.random() * 50) + 20;
        b = Math.floor(Math.random() * 20) + 5;
      } while (a <= b || (a % 10) >= (b % 10)); // must borrow
      return { op: '-', a, b, result: a - b, hasCarry: false, hasBorrow: true };
    }
  } else {
    // Three-digit addition/subtraction
    const isAdd = Math.random() > 0.5;
    if (isAdd) {
      const a = Math.floor(Math.random() * 400) + 100;
      const b = Math.floor(Math.random() * 400) + 100;
      return { op: '+', a, b, result: a + b, hasCarry: true, hasBorrow: false };
    } else {
      const b = Math.floor(Math.random() * 300) + 50;
      const a = b + Math.floor(Math.random() * 300) + 50;
      return { op: '-', a, b, result: a - b, hasCarry: false, hasBorrow: true };
    }
  }
}

function getDigits(n, pad = 3) {
  const s = String(n).padStart(pad, ' ');
  return s.split('').map(c => c === ' ' ? null : parseInt(c));
}

export default function ColumnMathGame({ lang = 'zh', onBack }) {
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [problem, setProblem] = useState(null);
  const [step, setStep] = useState(0); // 0=show problem, 1=show ones, 2=show tens, 3=show result, 4=answer
  const [userAns, setUserAns] = useState('');
  const [feedback, setFeedback] = useState(null);

  const zh = lang === 'zh';

  const newProblem = useCallback(() => {
    setProblem(generateProblem(level));
    setStep(0);
    setUserAns('');
    setFeedback(null);
  }, [level]);

  useEffect(() => { newProblem(); }, [newProblem]);

  const handlePad = (k) => {
    if (feedback) return;
    audioSynth.playClick();
    if (k === 'C') { setUserAns(''); return; }
    if (k === '✓') { submit(); return; }
    if (userAns.length < 4) setUserAns(p => p + k);
  };

  const submit = () => {
    if (!problem || !userAns) return;
    const correct = parseInt(userAns) === problem.result;
    if (correct) {
      audioSynth.playCorrect();
      setFeedback('correct');
      const ns = streak + 1;
      setStreak(ns);
      if (ns >= 3 && level < 3) { setLevel(l => l + 1); setStreak(0); }
    } else {
      audioSynth.playIncorrect();
      setFeedback('wrong');
      setStreak(0);
    }
  };

  if (!problem) return null;

  const { a, b, result, op, hasCarry, hasBorrow } = problem;
  const maxDigits = String(Math.max(a, b, result)).length;
  const aStr = String(a).padStart(maxDigits, ' ');
  const bStr = String(b).padStart(maxDigits, ' ');
  const rStr = String(result).padStart(maxDigits, ' ');

  const digitCell = (char, isResult = false, highlight = false) => (
    <div style={{
      width: '44px', height: '52px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '1.8rem', fontWeight: '900',
      color: isResult ? '#7c3aed' : '#1e40af',
      background: highlight ? 'rgba(253,230,138,0.6)' : 'transparent',
      borderRadius: '10px',
      transition: 'background 0.3s',
    }}>
      {char === ' ' ? '' : char}
    </div>
  );

  // Carry/borrow annotation
  const carryRow = hasCarry && step >= 1 ? (
    <div style={{ display: 'flex', gap: '2px', marginBottom: '-8px', paddingLeft: '4px' }}>
      {Array.from({ length: maxDigits }, (_, i) => {
        const onesPos = maxDigits - 1;
        const aOnes = a % 10, bOnes = b % 10;
        const hasOnesCarry = aOnes + bOnes >= 10;
        const showCarry = i === onesPos - 1 && hasOnesCarry && step >= 2;
        return (
          <div key={i} style={{ width: '44px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: '800', color: '#dc2626' }}>
            {showCarry ? '1' : ''}
          </div>
        );
      })}
    </div>
  ) : null;

  return (
    <div className="screen-wrapper fade-in" style={{ gap: '16px', paddingTop: '10px', paddingBottom: '20px' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '92%', maxWidth: '380px' }}>
        <button className="bouncy-button secondary" onClick={onBack} style={{ padding: '10px 16px' }}>🏠</button>
        <div style={{ flex: 1, textAlign: 'center', fontWeight: '700', fontSize: '1.1rem', color: '#1d4ed8' }}>
          {zh ? '📝 竖式计算' : '📝 Column Math'}
        </div>
        <div style={{ background: 'linear-gradient(135deg,#93c5fd,#3b82f6)', color: 'white', borderRadius: '50px', padding: '6px 14px', fontSize: '0.88rem', fontWeight: '700' }}>
          Lv {level}
        </div>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(16px)',
        borderRadius: '28px', padding: '24px 20px',
        border: '2px solid rgba(255,255,255,0.7)',
        boxShadow: '0 8px 32px rgba(59,130,246,0.15)',
        width: '92%', maxWidth: '380px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px',
      }}>
        <div style={{ fontSize: '0.95rem', color: '#1d4ed8', fontWeight: '700' }}>
          {zh ? '按竖式格式计算下面这道题：' : 'Calculate using the column format:'}
        </div>

        {/* Column format display */}
        <div style={{
          background: '#eff6ff', borderRadius: '20px', padding: '16px 20px',
          display: 'inline-flex', flexDirection: 'column', gap: '4px',
          border: '2px solid #bfdbfe',
        }}>
          {carryRow}
          {/* A row */}
          <div style={{ display: 'flex' }}>
            <div style={{ width: '32px' }} />
            {aStr.split('').map((c, i) => digitCell(c, false, false))}
          </div>
          {/* Op + B row */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '32px', fontSize: '1.6rem', fontWeight: '900', color: op === '+' ? '#16a34a' : '#dc2626', textAlign: 'center' }}>{op}</div>
            {bStr.split('').map((c, i) => digitCell(c, false, false))}
          </div>
          {/* Divider */}
          <div style={{ height: '3px', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', borderRadius: '2px', margin: '4px 0' }} />
          {/* Result row */}
          <div style={{ display: 'flex' }}>
            <div style={{ width: '32px' }} />
            {step >= 3
              ? rStr.split('').map((c, i) => digitCell(c, true, false))
              : Array.from({ length: maxDigits }, (_, i) => (
                  <div key={i} style={{ width: '44px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', color: '#9ca3af' }}>?</div>
                ))}
          </div>
        </div>

        {/* Step hints */}
        {hasCarry && step >= 1 && step < 3 && (
          <div style={{ background: '#fef3c7', borderRadius: '14px', padding: '10px 16px', width: '100%', fontSize: '0.9rem', fontWeight: '700', color: '#92400e' }}>
            {step === 1 && (zh ? `① 个位：${a % 10} + ${b % 10} = ${(a % 10) + (b % 10)}，写 ${(a + b) % 10}，进位 1` : `① Ones: ${a % 10}+${b % 10}=${(a % 10) + (b % 10)}, write ${(a + b) % 10}, carry 1`)}
            {step === 2 && (zh ? `② 十位：${Math.floor(a / 10) % 10} + ${Math.floor(b / 10) % 10} + 进位1 = ${Math.floor(a / 10) % 10 + Math.floor(b / 10) % 10 + 1}` : `② Tens: ${Math.floor(a / 10) % 10}+${Math.floor(b / 10) % 10}+1=${Math.floor(a / 10) % 10 + Math.floor(b / 10) % 10 + 1}`)}
          </div>
        )}
        {hasBorrow && step >= 1 && step < 3 && (
          <div style={{ background: '#fef3c7', borderRadius: '14px', padding: '10px 16px', width: '100%', fontSize: '0.9rem', fontWeight: '700', color: '#92400e' }}>
            {step === 1 && (zh ? `① 个位不够减，向十位借1：${(a % 10) + 10} - ${b % 10} = ${(a % 10) + 10 - (b % 10)}` : `① Ones need borrow: ${(a % 10) + 10}-${b % 10}=${(a % 10) + 10 - (b % 10)}`)}
            {step === 2 && (zh ? `② 十位减去借出的1再减：${Math.floor(a / 10) % 10 - 1} - ${Math.floor(b / 10) % 10} = ${Math.floor(a / 10) % 10 - 1 - Math.floor(b / 10) % 10}` : `② Tens after borrow: ${Math.floor(a / 10) % 10 - 1}-${Math.floor(b / 10) % 10}=${Math.floor(a / 10) % 10 - 1 - Math.floor(b / 10) % 10}`)}
          </div>
        )}

        {/* Step buttons */}
        {step < 3 && (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {step < 3 && (
              <button className="bouncy-button secondary" onClick={() => setStep(s => Math.min(s + 1, 3))} style={{ fontSize: '0.9rem', padding: '8px 18px' }}>
                {zh ? '💡 看提示' : '💡 Hint'}
              </button>
            )}
          </div>
        )}

        {/* Answer input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '1rem', fontWeight: '700', color: '#1d4ed8' }}>{zh ? '答案 =' : 'Answer ='}</div>
          <div style={{
            minWidth: '100px', height: '56px', borderRadius: '16px',
            background: feedback === 'correct' ? '#dcfce7' : feedback === 'wrong' ? '#fee2e2' : 'rgba(219,234,254,0.6)',
            border: `3px solid ${feedback === 'correct' ? '#22c55e' : feedback === 'wrong' ? '#ef4444' : '#bfdbfe'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', fontWeight: '900', color: '#1d4ed8',
          }}>
            {feedback ? (feedback === 'correct' ? result : userAns) : (userAns || <span style={{ opacity: 0.3 }}>?</span>)}
          </div>
        </div>

        {feedback && (
          <div style={{
            padding: '10px 18px', borderRadius: '14px', fontWeight: '700', fontSize: '0.95rem',
            width: '100%', textAlign: 'center',
            background: feedback === 'correct' ? '#dcfce7' : '#fee2e2',
            color: feedback === 'correct' ? '#16a34a' : '#dc2626',
          }}>
            {feedback === 'correct'
              ? (zh ? '🌟 竖式做对了！太棒！' : '🌟 Correct! Great column math!')
              : (zh ? `💡 正确答案是 ${result}` : `💡 Correct answer: ${result}`)}
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

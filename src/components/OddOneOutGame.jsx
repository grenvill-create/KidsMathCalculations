import React, { useState, useEffect, useCallback } from 'react';
import { audioSynth } from '../utils/audioSynth';

function makeExpr(min, max) {
  const op = Math.random() > 0.5 ? '+' : '-';
  if (op === '+') {
    const a = Math.floor(Math.random() * (max - min) / 2) + min;
    const b = Math.floor(Math.random() * (max - a - min)) + 1;
    return { str: `${a} + ${b}`, val: a + b };
  } else {
    const result = Math.floor(Math.random() * (max - min)) + min;
    const b = Math.floor(Math.random() * result) + 1;
    const a = result + b;
    if (a > max + 10) return makeExpr(min, max); // retry
    return { str: `${a} - ${b}`, val: result };
  }
}

function generateProblem(level) {
  const max = level === 1 ? 10 : level === 2 ? 20 : 50;
  const min = level === 1 ? 1 : 1;

  let tries = 0;
  while (tries < 50) {
    tries++;
    // Generate 4 expressions — 3 with the same result, 1 different
    const target = Math.floor(Math.random() * (max - min - 2)) + min + 1;
    const exprs = [];

    // 3 expressions that equal target
    let safeCount = 0;
    while (exprs.length < 3 && safeCount < 30) {
      safeCount++;
      const e = makeExpr(min, max);
      if (e.val === target && !exprs.find(x => x.str === e.str)) {
        exprs.push(e);
      }
    }
    if (exprs.length < 3) continue;

    // 1 expression with a different result
    let oddExpr = null;
    let oddCount = 0;
    while (!oddExpr && oddCount < 30) {
      oddCount++;
      const e = makeExpr(min, max);
      if (e.val !== target && !exprs.find(x => x.str === e.str)) {
        oddExpr = e;
      }
    }
    if (!oddExpr) continue;

    // Shuffle in the odd one
    const oddIndex = Math.floor(Math.random() * 4);
    const all = [...exprs];
    all.splice(oddIndex, 0, oddExpr);

    return { items: all, oddIndex, target };
  }

  // Fallback
  return {
    items: [
      { str: '3 + 4', val: 7 },
      { str: '8 - 1', val: 7 },
      { str: '2 + 5', val: 7 },
      { str: '3 + 5', val: 8 },
    ],
    oddIndex: 3,
    target: 7,
  };
}

export default function OddOneOutGame({ lang = 'zh', onBack }) {
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [problem, setProblem] = useState(null);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const zh = lang === 'zh';

  const newProblem = useCallback(() => {
    setProblem(generateProblem(level));
    setSelected(null);
    setFeedback(null);
  }, [level]);

  useEffect(() => { newProblem(); }, [newProblem]);

  const handleSelect = (idx) => {
    if (feedback) return;
    audioSynth.playClick();
    setSelected(idx);
    const correct = idx === problem.oddIndex;
    if (correct) {
      audioSynth.playCorrect();
      setFeedback('correct');
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak >= 4 && level < 3) {
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

  const getBgColor = (idx) => {
    if (!feedback) {
      return selected === idx
        ? 'linear-gradient(135deg, #fde68a, #f59e0b)'
        : 'linear-gradient(135deg, #ffffff, #f0f9ff)';
    }
    if (idx === problem.oddIndex) return 'linear-gradient(135deg, #4ade80, #22c55e)';
    return selected === idx
      ? 'linear-gradient(135deg, #fca5a5, #ef4444)'
      : 'linear-gradient(135deg, #e0f2fe, #bae6fd)';
  };

  return (
    <div className="screen-wrapper fade-in" style={{ gap: '16px', paddingTop: '10px', paddingBottom: '20px' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '92%', maxWidth: '380px' }}>
        <button className="bouncy-button secondary" onClick={onBack} style={{ padding: '10px 16px' }}>🏠</button>
        <div style={{ flex: 1, textAlign: 'center', fontWeight: '700', fontSize: '1.1rem', color: '#d97706' }}>
          {zh ? '🔍 数学找不同' : '🔍 Odd One Out'}
        </div>
        <div style={{ background: 'linear-gradient(135deg, #fcd34d, #f59e0b)', color: 'white', borderRadius: '50px', padding: '6px 14px', fontSize: '0.88rem', fontWeight: '700' }}>
          Lv {level}
        </div>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(16px)', borderRadius: '28px',
        padding: '24px 18px', border: '2px solid rgba(255,255,255,0.7)',
        boxShadow: '0 8px 32px rgba(255,93,158,0.12)', width: '92%', maxWidth: '380px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px',
      }}>
        <div style={{ fontWeight: '700', fontSize: '1.05rem', color: '#b45309', textAlign: 'center' }}>
          {zh ? '🔍 找出计算结果与其他三道不同的算式！' : '🔍 Find the expression with a different result!'}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%' }}>
          {problem.items.map((item, idx) => (
            <button key={idx} onClick={() => handleSelect(idx)} style={{
              padding: '18px 10px', borderRadius: '20px', border: '3px solid',
              borderColor: selected === idx && !feedback ? '#f59e0b' : 'rgba(255,255,255,0.5)',
              background: getBgColor(idx),
              fontFamily: 'Fredoka, sans-serif', fontWeight: '800', fontSize: '1.5rem',
              color: '#374151', cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              transition: 'all 0.2s',
              transform: selected === idx ? 'scale(0.96)' : 'scale(1)',
            }}>
              {item.str}
              {feedback && (
                <div style={{ fontSize: '0.9rem', fontWeight: '700', marginTop: '4px', color: idx === problem.oddIndex ? '#15803d' : '#6b7280' }}>
                  = {item.val}
                </div>
              )}
            </button>
          ))}
        </div>

        {feedback && (
          <div style={{
            padding: '12px 20px', borderRadius: '16px', fontWeight: '700', fontSize: '1rem', width: '100%', textAlign: 'center',
            background: feedback === 'correct' ? '#dcfce7' : '#fee2e2',
            color: feedback === 'correct' ? '#16a34a' : '#dc2626',
          }}>
            {feedback === 'correct'
              ? (zh ? `🌟 答对！三道题结果都是 ${problem.target}，只有那道不同！` : `🌟 Correct! Three results are ${problem.target}, the odd one is different!`)
              : (zh ? `💡 找错了！绿色那道的结果与其他三道不同！` : '💡 Wrong! The green one has a different result!')}
          </div>
        )}

        {feedback && (
          <button className="bouncy-button primary" onClick={newProblem} style={{ padding: '14px 32px', fontSize: '1.1rem' }}>
            {zh ? '下一题 ➔' : 'Next ➔'}
          </button>
        )}
      </div>
    </div>
  );
}

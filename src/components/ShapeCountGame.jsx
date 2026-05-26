import React, { useState, useCallback } from 'react';
import { audioSynth } from '../utils/audioSynth';

const SHAPE_TYPES = [
  { id: 'circle',   emoji: '🔵', name: '圆形' },
  { id: 'square',   emoji: '🟦', name: '正方形' },
  { id: 'triangle', emoji: '🔺', name: '三角形' },
  { id: 'diamond',  emoji: '🔶', name: '菱形' },
  { id: 'star',     emoji: '⭐', name: '星形' },
];

function generateProblem() {
  // Pick the target shape to count
  const target = SHAPE_TYPES[Math.floor(Math.random() * SHAPE_TYPES.length)];
  const answer = Math.floor(Math.random() * 5) + 2; // 2-6 of target

  // Fill the rest with other shapes (total 10-14 items)
  const others = SHAPE_TYPES.filter(s => s.id !== target.id);
  const distractors = [];
  const distTotal = Math.floor(Math.random() * 5) + 6; // 6-10 distractors
  for (let i = 0; i < distTotal; i++) {
    distractors.push(others[Math.floor(Math.random() * others.length)]);
  }

  // Create the full list and shuffle
  const items = [
    ...Array(answer).fill(target),
    ...distractors,
  ].sort(() => Math.random() - 0.5);

  const wrong = new Set();
  while (wrong.size < 3) {
    const w = Math.floor(Math.random() * 8) + 1;
    if (w !== answer) wrong.add(w);
  }
  const choices = [answer, ...wrong].sort(() => Math.random() - 0.5);
  return { items, target, answer, choices };
}

export default function ShapeCountGame({ autoAdvance }) {
  const [problem, setProblem] = useState(generateProblem);
  const [selected, setSelected] = useState(null);
  const [sessionCount, setSessionCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const next = useCallback(() => {
    setProblem(generateProblem());
    setSelected(null);
  }, []);

  const handleChoice = (val) => {
    if (selected !== null) return;
    setSelected(val);
    setSessionCount(p => p + 1);
    if (val === problem.answer) {
      audioSynth.playCorrect();
      setCorrectCount(p => p + 1);
      if (autoAdvance) {
        setTimeout(next, 1300);
      }
    } else {
      audioSynth.playIncorrect();
      if (autoAdvance) {
        setTimeout(next, 1800);
      }
    }
  };

  return (
    <div className="screen-wrapper fade-in" style={{ justifyContent: 'flex-start', gap: '18px', paddingBottom: '20px', overflowY: 'auto' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '1.3rem', fontWeight: '700', color: '#c0487a', marginBottom: '4px' }}>
          🔍 图中有几个 <span style={{ background: 'rgba(255,133,184,0.2)', borderRadius: '8px', padding: '2px 8px' }}>{problem.target.emoji} {problem.target.name}</span>？
        </div>
        <div style={{ fontSize: '0.9rem', color: '#d4879e', fontWeight: '600' }}>
          📝 本次 {sessionCount} 题 · ✅ 答对 {correctCount} 题
        </div>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.8)', borderRadius: '28px', padding: '16px',
        width: '100%', maxWidth: '380px',
        boxShadow: '0 8px 30px rgba(255,93,158,0.1)', border: '2.5px solid rgba(255,255,255,0.9)',
        minHeight: '130px',
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
          {problem.items.map((item, i) => (
            <span key={i} style={{
              fontSize: '2rem', lineHeight: 1,
              opacity: selected !== null && item.id === problem.target.id ? 1 : selected !== null ? 0.45 : 1,
              transition: 'opacity 0.3s',
              filter: selected !== null && item.id === problem.target.id
                ? 'drop-shadow(0 0 4px rgba(255,93,158,0.6))'
                : 'none',
            }}>{item.emoji}</span>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%', maxWidth: '360px' }}>
        {problem.choices.map(val => {
          let bg = 'white', border = '#f5c0d0', color = '#c06080';
          if (selected !== null) {
            if (val === problem.answer) { bg = '#f0fdf4'; border = '#4ade80'; color = '#16a34a'; }
            else if (val === selected) { bg = '#fef2f2'; border = '#f87171'; color = '#dc2626'; }
          }
          return (
            <button key={val} onClick={() => handleChoice(val)} style={{
              padding: '18px', borderRadius: '20px',
              border: `3px solid ${border}`, background: bg, color,
              fontWeight: '700', fontSize: '1.8rem',
              cursor: selected !== null ? 'default' : 'pointer',
              fontFamily: 'Fredoka, sans-serif',
              boxShadow: '0 4px 12px rgba(255,93,158,0.1)',
              transition: 'all 0.2s ease',
            }}>
              {val}
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <div className="bounce-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: '700', textAlign: 'center',
            color: selected === problem.answer ? '#16a34a' : '#dc2626' }}>
            {selected === problem.answer
              ? `🌟 数对了！有 ${problem.answer} 个${problem.target.name}！`
              : `💡 图中有 ${problem.answer} 个${problem.target.name}，再数数看！`}
          </div>
          {!autoAdvance && (
            <button
              onClick={next}
              style={{
                marginTop: '6px',
                padding: '10px 28px',
                fontSize: '1.1rem',
                fontWeight: '700',
                color: 'white',
                background: 'linear-gradient(135deg, #ff758c, #ff7eb3)',
                border: 'none',
                borderRadius: '20px',
                boxShadow: '0 6px 15px rgba(255,117,140,0.3)',
                cursor: 'pointer',
                fontFamily: 'Fredoka, sans-serif',
                transition: 'transform 0.1s ease',
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              下一题 ➔
            </button>
          )}
        </div>
      )}
    </div>
  );
}

import React, { useState, useCallback } from 'react';
import { audioSynth } from '../utils/audioSynth';

const PATTERN_POOLS = [
  { items: ['🔴', '🔵'], types: ['ABAB'] },
  { items: ['⭐', '🌙'], types: ['ABAB'] },
  { items: ['🍎', '🍊'], types: ['ABAB'] },
  { items: ['🐱', '🐶'], types: ['ABAB'] },
  { items: ['🔴', '🔵', '🟡'], types: ['ABCABC'] },
  { items: ['🍎', '🍊', '🍇'], types: ['ABCABC'] },
  { items: ['🔴', '🔵'], types: ['AABB'] },
  { items: ['⭐', '🌸'], types: ['AABB'] },
];

function buildSequence(items, type, len = 7) {
  const seq = [];
  for (let i = 0; i < len; i++) {
    if (type === 'ABAB') seq.push(items[i % 2]);
    else if (type === 'AABB') seq.push(items[Math.floor(i / 2) % 2]);
    else if (type === 'ABCABC') seq.push(items[i % 3]);
  }
  return seq;
}

function generateProblem() {
  const pool = PATTERN_POOLS[Math.floor(Math.random() * PATTERN_POOLS.length)];
  const type = pool.types[0];
  const fullSeq = buildSequence(pool.items, type, 7);
  const shown = fullSeq.slice(0, 6);
  const answer = fullSeq[6];

  // Wrong choices: other items from pool or different positions
  const allItems = pool.items;
  const wrong = allItems.filter(x => x !== answer).slice(0, 2);
  // Add one more wrong if needed from other pools
  while (wrong.length < 2) wrong.push(PATTERN_POOLS[1].items[0]);
  const choices = [answer, ...wrong].sort(() => Math.random() - 0.5);
  return { shown, answer, choices, type };
}

export default function PatternGame() {
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
      setTimeout(next, 1200);
    } else {
      audioSynth.playIncorrect();
      setTimeout(next, 1800);
    }
  };

  return (
    <div className="screen-wrapper fade-in" style={{ justifyContent: 'flex-start', gap: '20px', paddingBottom: '20px', overflowY: 'auto' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '1.3rem', fontWeight: '700', color: '#c0487a', marginBottom: '4px' }}>
          🔁 找出规律，下一个是什么？
        </div>
        <div style={{ fontSize: '0.9rem', color: '#d4879e', fontWeight: '600' }}>
          📝 本次 {sessionCount} 题 · ✅ 答对 {correctCount} 题
        </div>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.8)', borderRadius: '28px', padding: '22px 16px',
        width: '100%', maxWidth: '380px',
        boxShadow: '0 8px 30px rgba(255,93,158,0.1)', border: '2.5px solid rgba(255,255,255,0.9)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
      }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          {problem.shown.map((item, i) => (
            <span key={i} style={{
              fontSize: '2.2rem', lineHeight: 1,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
            }}>{item}</span>
          ))}
          <span style={{ fontSize: '1.5rem', color: '#ff85b8', fontWeight: '700' }}>→</span>
          <div style={{
            width: '52px', height: '52px', borderRadius: '16px',
            border: '3px dashed #ff85b8',
            background: selected ? 'rgba(255,133,184,0.1)' : 'rgba(255,255,255,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem',
            transition: 'all 0.3s',
          }}>
            {selected !== null ? selected : '？'}
          </div>
        </div>
        <div style={{ opacity: 0.6, fontSize: '0.85rem', color: '#c07090', fontWeight: '600' }}>
          仔细观察规律，选出下一个 👆
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', width: '100%', maxWidth: '360px' }}>
        {problem.choices.map((val, i) => {
          let bg = 'rgba(255,255,255,0.85)', border = '#f5c0d0', shadow = '0 4px 12px rgba(255,93,158,0.1)';
          if (selected !== null) {
            if (val === problem.answer) { bg = '#f0fdf4'; border = '#4ade80'; shadow = '0 4px 12px rgba(74,222,128,0.3)'; }
            else if (val === selected) { bg = '#fef2f2'; border = '#f87171'; shadow = '0 4px 12px rgba(248,113,113,0.3)'; }
          }
          return (
            <button key={i} onClick={() => handleChoice(val)} style={{
              flex: 1, padding: '20px 10px', borderRadius: '20px',
              border: `3px solid ${border}`, background: bg,
              fontWeight: '700', fontSize: '2.2rem',
              cursor: selected !== null ? 'default' : 'pointer',
              boxShadow: shadow, transition: 'all 0.2s ease',
            }}>
              {val}
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <div style={{ fontSize: '1.1rem', fontWeight: '700', textAlign: 'center',
          color: selected === problem.answer ? '#16a34a' : '#dc2626' }}>
          {selected === problem.answer ? '🌟 找到规律啦！真棒！' : `💡 下一个应该是 ${problem.answer} 哦！`}
        </div>
      )}
    </div>
  );
}

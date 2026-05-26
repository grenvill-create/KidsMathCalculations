import React, { useState, useCallback } from 'react';
import { audioSynth } from '../utils/audioSynth';

const EMOJIS = ['🍎', '⭐', '🎈', '🍭', '🐱', '🦋', '🍬', '🐧'];

function generateProblem() {
  const groups = Math.floor(Math.random() * 3) + 2; // 2-4 groups
  const perGroup = Math.floor(Math.random() * 4) + 2; // 2-5 per group
  const answer = groups * perGroup;
  const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];

  const wrong = new Set();
  while (wrong.size < 3) {
    const offset = Math.floor(Math.random() * 4) + 1;
    const w = Math.random() > 0.5 ? answer + offset : Math.max(1, answer - offset);
    if (w !== answer) wrong.add(w);
  }
  const choices = [answer, ...wrong].sort(() => Math.random() - 0.5);
  return { groups, perGroup, answer, emoji, choices };
}

export default function MultiplicationIntroGame() {
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
      setTimeout(next, 1400);
    } else {
      audioSynth.playIncorrect();
      setTimeout(next, 1800);
    }
  };

  return (
    <div className="screen-wrapper fade-in" style={{ justifyContent: 'flex-start', gap: '18px', paddingBottom: '20px', overflowY: 'auto' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '1.3rem', fontWeight: '700', color: '#c0487a', marginBottom: '4px' }}>
          ✖️ 一共有几个？数一数！
        </div>
        <div style={{ fontSize: '0.9rem', color: '#d4879e', fontWeight: '600' }}>
          📝 本次 {sessionCount} 题 · ✅ 答对 {correctCount} 题
        </div>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.8)', borderRadius: '28px', padding: '20px',
        width: '100%', maxWidth: '380px',
        boxShadow: '0 8px 30px rgba(255,93,158,0.1)', border: '2.5px solid rgba(255,255,255,0.9)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
      }}>
        <div style={{ fontSize: '1rem', color: '#c07090', fontWeight: '600', opacity: 0.8 }}>
          有 <strong>{problem.groups}</strong> 组 {problem.emoji}，每组 <strong>{problem.perGroup}</strong> 个
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {Array.from({ length: problem.groups }, (_, gi) => (
            <div key={gi} style={{
              background: 'linear-gradient(135deg, rgba(255,181,200,0.3), rgba(255,143,171,0.2))',
              border: '2px solid rgba(255,143,171,0.4)',
              borderRadius: '16px', padding: '10px 12px',
              display: 'flex', flexWrap: 'wrap', gap: '3px',
              justifyContent: 'center', maxWidth: '100px',
            }}>
              {Array.from({ length: problem.perGroup }, (_, i) => (
                <span key={i} style={{ fontSize: '1.5rem', lineHeight: 1 }}>{problem.emoji}</span>
              ))}
            </div>
          ))}
        </div>

        <div style={{
          fontSize: '1.4rem', fontWeight: '700', color: '#c0487a',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <span>{problem.groups}</span>
          <span style={{ color: '#ff85b8' }}>×</span>
          <span>{problem.perGroup}</span>
          <span style={{ color: '#ff85b8' }}>=</span>
          <span style={{
            border: '3px dashed #ff85b8', borderRadius: '12px', padding: '4px 16px',
            minWidth: '50px', textAlign: 'center', color: '#ff5d9e',
          }}>
            {selected !== null ? selected : '？'}
          </span>
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
        <div style={{ fontSize: '1.1rem', fontWeight: '700', textAlign: 'center',
          color: selected === problem.answer ? '#16a34a' : '#dc2626' }}>
          {selected === problem.answer
            ? `🌟 答对了！一共 ${problem.answer} 个！`
            : `💡 答案是 ${problem.answer}，${problem.groups} × ${problem.perGroup} = ${problem.answer}`}
        </div>
      )}
    </div>
  );
}

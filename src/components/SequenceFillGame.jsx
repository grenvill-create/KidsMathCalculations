import React, { useState, useCallback } from 'react';
import { audioSynth } from '../utils/audioSynth';

function generateProblem() {
  const start = Math.floor(Math.random() * 14) + 1;
  const step = Math.random() > 0.4 ? 1 : 2;
  const seq = Array.from({ length: 5 }, (_, i) => start + i * step);
  // blank at index 1, 2, or 3
  const blankIdx = 1 + Math.floor(Math.random() * 3);
  const answer = seq[blankIdx];

  const wrong = new Set();
  while (wrong.size < 3) {
    const offset = Math.floor(Math.random() * 4) + 1;
    const w = Math.random() > 0.5 ? answer + offset : answer - offset;
    if (w !== answer && w > 0) wrong.add(w);
  }
  const choices = [answer, ...wrong].sort(() => Math.random() - 0.5);
  return { seq, blankIdx, answer, choices };
}

export default function SequenceFillGame() {
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
          🔢 找出缺少的数字！
        </div>
        <div style={{ fontSize: '0.9rem', color: '#d4879e', fontWeight: '600' }}>
          📝 本次 {sessionCount} 题 · ✅ 答对 {correctCount} 题
        </div>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.8)', borderRadius: '28px', padding: '24px 16px',
        width: '100%', maxWidth: '380px',
        boxShadow: '0 8px 30px rgba(255,93,158,0.1)', border: '2.5px solid rgba(255,255,255,0.9)',
      }}>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
          {problem.seq.map((n, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span style={{ color: '#f5c0d0', fontSize: '1.4rem', fontWeight: '700' }}>→</span>}
              {i === problem.blankIdx ? (
                <div style={{
                  width: '60px', height: '60px', borderRadius: '16px',
                  border: '3px dashed #ff85b8', background: 'rgba(255,133,184,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: selected !== null ? '1.5rem' : '1.2rem',
                  fontWeight: '700', color: selected === problem.answer ? '#16a34a' : '#ff5d9e',
                  transition: 'all 0.3s',
                }}>
                  {selected !== null ? selected : '？'}
                </div>
              ) : (
                <div style={{
                  width: '60px', height: '60px', borderRadius: '16px',
                  background: 'linear-gradient(135deg, #ffb5c8, #ff8fab)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem', fontWeight: '700', color: 'white',
                  boxShadow: '0 4px 10px rgba(255,93,158,0.3)',
                }}>
                  {n}
                </div>
              )}
            </React.Fragment>
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
        <div style={{ fontSize: '1.1rem', fontWeight: '700', textAlign: 'center',
          color: selected === problem.answer ? '#16a34a' : '#dc2626' }}>
          {selected === problem.answer ? '🌟 答对了！' : `💡 答案是 ${problem.answer} 哦！`}
        </div>
      )}
    </div>
  );
}

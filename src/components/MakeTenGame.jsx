import React, { useState, useCallback } from 'react';
import { audioSynth } from '../utils/audioSynth';

function generateProblem() {
  const num1 = Math.floor(Math.random() * 9) + 1; // 1-9
  const answer = 10 - num1;
  const wrong = new Set();
  while (wrong.size < 3) {
    const w = Math.floor(Math.random() * 9) + 1;
    if (w !== answer) wrong.add(w);
  }
  const choices = [answer, ...wrong].sort(() => Math.random() - 0.5);
  return { num1, answer, choices };
}

function TenFrame({ filled, total = 10 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
      {[0, 1].map(row => (
        <div key={row} style={{ display: 'flex', gap: '6px' }}>
          {Array.from({ length: 5 }, (_, col) => {
            const idx = row * 5 + col;
            const isFilled = idx < filled;
            return (
              <div key={col} style={{
                width: '38px', height: '38px', borderRadius: '50%',
                border: '2.5px solid #f5c0d0',
                background: isFilled
                  ? 'linear-gradient(135deg, #ff85b8, #ff5d9e)'
                  : 'rgba(255,255,255,0.5)',
                boxShadow: isFilled ? '0 3px 8px rgba(255,93,158,0.35)' : 'none',
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: isFilled ? '1.1rem' : '0.7rem',
                color: isFilled ? 'white' : '#f5c0d0',
              }}>
                {isFilled ? '●' : '○'}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default function MakeTenGame() {
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
      setTimeout(next, 1300);
    } else {
      audioSynth.playIncorrect();
      setTimeout(next, 1800);
    }
  };

  const filledCount = selected !== null && selected === problem.answer ? 10 : problem.num1;

  return (
    <div className="screen-wrapper fade-in" style={{ justifyContent: 'flex-start', gap: '20px', paddingBottom: '20px', overflowY: 'auto' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '1.3rem', fontWeight: '700', color: '#c0487a', marginBottom: '4px' }}>
          🎯 凑十法：再加几个就能凑成 10？
        </div>
        <div style={{ fontSize: '0.9rem', color: '#d4879e', fontWeight: '600' }}>
          📝 本次 {sessionCount} 题 · ✅ 答对 {correctCount} 题
        </div>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.8)', borderRadius: '28px', padding: '24px 20px',
        width: '100%', maxWidth: '380px',
        boxShadow: '0 8px 30px rgba(255,93,158,0.1)', border: '2.5px solid rgba(255,255,255,0.9)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
      }}>
        <div style={{
          fontSize: '2rem', fontWeight: '700', color: '#c0487a',
          display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <span style={{
            background: 'linear-gradient(135deg, #ffb5c8, #ff8fab)',
            color: 'white', borderRadius: '16px', padding: '8px 20px',
            boxShadow: '0 4px 12px rgba(255,93,158,0.3)',
          }}>{problem.num1}</span>
          <span>+</span>
          <span style={{
            border: '3px dashed #ff85b8', borderRadius: '16px', padding: '8px 20px',
            color: '#ff5d9e', minWidth: '60px', textAlign: 'center',
          }}>
            {selected !== null ? selected : '？'}
          </span>
          <span>=</span>
          <span style={{
            background: 'linear-gradient(135deg, #4ade80, #22c55e)',
            color: 'white', borderRadius: '16px', padding: '8px 20px',
            boxShadow: '0 4px 12px rgba(34,197,94,0.3)',
          }}>10</span>
        </div>

        <TenFrame filled={filledCount} />
        <div style={{ fontSize: '0.85rem', color: '#c07090', opacity: 0.7, fontWeight: '600' }}>
          红色圆点 = {problem.num1}，还需要填满几个格子？
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
          {selected === problem.answer ? `🌟 对啦！${problem.num1} + ${problem.answer} = 10！` : `💡 答案是 ${problem.answer} 哦，${problem.num1} + ${problem.answer} = 10！`}
        </div>
      )}
    </div>
  );
}

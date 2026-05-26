import React, { useState, useCallback } from 'react';
import { audioSynth } from '../utils/audioSynth';

const COLORS = [
  { name: '红色', hex: '#ef4444' },
  { name: '橙色', hex: '#f97316' },
  { name: '黄色', hex: '#eab308' },
  { name: '绿色', hex: '#22c55e' },
  { name: '蓝色', hex: '#3b82f6' },
  { name: '紫色', hex: '#a855f7' },
  { name: '粉色', hex: '#ec4899' },
  { name: '棕色', hex: '#92400e' },
  { name: '黑色', hex: '#1f2937' },
  { name: '白色', hex: '#f9fafb', border: '#e5e7eb' },
];

function generateProblem() {
  const target = COLORS[Math.floor(Math.random() * COLORS.length)];
  const wrong = COLORS.filter(c => c.name !== target.name)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
  const choices = [target.name, ...wrong.map(c => c.name)].sort(() => Math.random() - 0.5);
  return { target, choices };
}

export default function ColorGame({ autoAdvance }) {
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
    if (val === problem.target.name) {
      audioSynth.playCorrect();
      setCorrectCount(p => p + 1);
      if (autoAdvance) {
        setTimeout(next, 1200);
      }
    } else {
      audioSynth.playIncorrect();
      if (autoAdvance) {
        setTimeout(next, 1800);
      }
    }
  };

  return (
    <div className="screen-wrapper fade-in" style={{ justifyContent: 'flex-start', gap: '20px', paddingBottom: '20px', overflowY: 'auto' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '1.3rem', fontWeight: '700', color: '#c0487a', marginBottom: '4px' }}>
          🎨 这是什么颜色？
        </div>
        <div style={{ fontSize: '0.9rem', color: '#d4879e', fontWeight: '600' }}>
          📝 本次 {sessionCount} 题 · ✅ 答对 {correctCount} 题
        </div>
      </div>

      <div style={{
        width: '160px', height: '160px', borderRadius: '32px',
        background: problem.target.hex,
        boxShadow: `0 12px 40px ${problem.target.hex}88`,
        border: problem.target.border ? `3px solid ${problem.target.border}` : '3px solid rgba(255,255,255,0.4)',
        transition: 'all 0.4s cubic-bezier(0.175,0.885,0.32,1.275)',
      }} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%', maxWidth: '360px' }}>
        {problem.choices.map(val => {
          let bg = 'white', border = '#f5c0d0', color = '#c06080';
          if (selected !== null) {
            if (val === problem.target.name) { bg = '#f0fdf4'; border = '#4ade80'; color = '#16a34a'; }
            else if (val === selected) { bg = '#fef2f2'; border = '#f87171'; color = '#dc2626'; }
          }
          return (
            <button key={val} onClick={() => handleChoice(val)} style={{
              padding: '16px', borderRadius: '20px',
              border: `3px solid ${border}`, background: bg, color,
              fontWeight: '700', fontSize: '1.3rem',
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
            color: selected === problem.target.name ? '#16a34a' : '#dc2626' }}>
            {selected === problem.target.name
              ? `🌟 答对啦！是${problem.target.name}！`
              : `💡 这是${problem.target.name}哦！`}
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

import React, { useState, useCallback } from 'react';
import { audioSynth } from '../utils/audioSynth';

const SEASONS = [
  {
    name: '春天',
    emojis: ['🌸', '🌱', '🌈', '🌷', '🐝'],
    desc: '花朵盛开，天气暖和',
    bg: 'linear-gradient(135deg, #fce7f3, #fdf2f8)',
    border: '#f9a8d4',
  },
  {
    name: '夏天',
    emojis: ['☀️', '🏖️', '🍦', '🌊', '🌻'],
    desc: '阳光炎热，可以游泳',
    bg: 'linear-gradient(135deg, #fef9c3, #fef3c7)',
    border: '#fbbf24',
  },
  {
    name: '秋天',
    emojis: ['🍂', '🍎', '🌾', '🍁', '🎃'],
    desc: '树叶变黄，收获果实',
    bg: 'linear-gradient(135deg, #ffedd5, #fed7aa)',
    border: '#f97316',
  },
  {
    name: '冬天',
    emojis: ['❄️', '⛄', '🧣', '🌨️', '🏔️'],
    desc: '天气寒冷，会下雪',
    bg: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
    border: '#93c5fd',
  },
];

function generateProblem() {
  const target = SEASONS[Math.floor(Math.random() * SEASONS.length)];
  const wrong = SEASONS.filter(s => s.name !== target.name)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
  const choices = [target.name, ...wrong.map(s => s.name)].sort(() => Math.random() - 0.5);
  return { target, choices };
}

export default function SeasonGame({ autoAdvance }) {
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
        setTimeout(next, 1400);
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
          🌍 这是什么季节？
        </div>
        <div style={{ fontSize: '0.9rem', color: '#d4879e', fontWeight: '600' }}>
          📝 本次 {sessionCount} 题 · ✅ 答对 {correctCount} 题
        </div>
      </div>

      <div style={{
        background: problem.target.bg,
        borderRadius: '28px', padding: '28px 20px',
        width: '100%', maxWidth: '380px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
        border: `2.5px solid ${problem.target.border}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
      }}>
        <div style={{ display: 'flex', gap: '10px', fontSize: '2.6rem', lineHeight: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
          {problem.target.emojis.map((e, i) => (
            <span key={i} style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.12))' }}>{e}</span>
          ))}
        </div>
        <div style={{ fontSize: '1rem', color: '#6b7280', fontWeight: '600', fontStyle: 'italic' }}>
          "{problem.target.desc}"
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%', maxWidth: '360px' }}>
        {problem.choices.map(val => {
          let bg = 'white', border = '#f5c0d0', color = '#c06080';
          if (selected !== null) {
            if (val === problem.target.name) { bg = '#f0fdf4'; border = '#4ade80'; color = '#16a34a'; }
            else if (val === selected) { bg = '#fef2f2'; border = '#f87171'; color = '#dc2626'; }
          }
          const season = SEASONS.find(s => s.name === val);
          return (
            <button key={val} onClick={() => handleChoice(val)} style={{
              padding: '16px', borderRadius: '20px',
              border: `3px solid ${border}`, background: bg, color,
              fontWeight: '700', fontSize: '1.2rem',
              cursor: selected !== null ? 'default' : 'pointer',
              fontFamily: 'Fredoka, sans-serif',
              boxShadow: '0 4px 12px rgba(255,93,158,0.1)',
              transition: 'all 0.2s ease',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
            }}>
              <span style={{ fontSize: '1.6rem' }}>{season?.emojis[0]}</span>
              {val}
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <div className="bounce-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: '700', textAlign: 'center',
            color: selected === problem.target.name ? '#16a34a' : '#dc2626' }}>
            {selected === problem.target.name ? `🌟 答对啦！是${problem.target.name}！` : `💡 这是${problem.target.name}哦！`}
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

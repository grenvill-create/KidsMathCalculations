import React, { useState, useEffect, useCallback } from 'react';
import { audioSynth } from '../utils/audioSynth';

const ClockFace = ({ hour, size = 210 }) => {
  const cx = size / 2;
  const cy = size / 2;
  const faceR = size / 2 - 6;

  // Hour hand: points toward the given hour (short)
  const hourAngle = ((hour % 12) / 12) * 2 * Math.PI - Math.PI / 2;
  const hourLen = faceR * 0.52;
  const hourX = cx + Math.cos(hourAngle) * hourLen;
  const hourY = cy + Math.sin(hourAngle) * hourLen;

  // Minute hand: always at 12 (pointing straight up)
  const minAngle = -Math.PI / 2;
  const minLen = faceR * 0.72;
  const minX = cx + Math.cos(minAngle) * minLen;
  const minY = cy + Math.sin(minAngle) * minLen;

  // Numbers
  const numberR = faceR - 22;
  const numbers = Array.from({ length: 12 }, (_, i) => {
    const n = i + 1;
    const angle = (n / 12) * 2 * Math.PI - Math.PI / 2;
    return { n, x: cx + Math.cos(angle) * numberR, y: cy + Math.sin(angle) * numberR };
  });

  // Tick marks
  const ticks = Array.from({ length: 60 }, (_, i) => {
    const angle = (i / 60) * 2 * Math.PI - Math.PI / 2;
    const isHour = i % 5 === 0;
    const outer = faceR - 2;
    const inner = faceR - (isHour ? 13 : 6);
    return {
      key: i, isHour,
      x1: cx + Math.cos(angle) * outer, y1: cy + Math.sin(angle) * outer,
      x2: cx + Math.cos(angle) * inner, y2: cy + Math.sin(angle) * inner,
    };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      style={{ filter: 'drop-shadow(0 8px 24px rgba(255,93,158,0.22))' }}>
      <defs>
        <radialGradient id="clockRing" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#ffb5c8" />
          <stop offset="100%" stopColor="#ff8fab" />
        </radialGradient>
      </defs>
      {/* Outer decorative ring */}
      <circle cx={cx} cy={cy} r={faceR + 5} fill="url(#clockRing)" />
      {/* White face */}
      <circle cx={cx} cy={cy} r={faceR} fill="white" />
      <circle cx={cx} cy={cy} r={faceR} fill="rgba(255,240,248,0.35)" />
      {/* Tick marks */}
      {ticks.map(t => (
        <line key={t.key} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
          stroke={t.isHour ? '#e07a9e' : '#f5c0d0'}
          strokeWidth={t.isHour ? 2.5 : 1.5}
          strokeLinecap="round" />
      ))}
      {/* Hour numbers */}
      {numbers.map(({ n, x, y }) => (
        <text key={n} x={x} y={y} textAnchor="middle" dominantBaseline="central"
          fontSize={size * 0.083} fontWeight="700" fill="#c06080"
          fontFamily="Fredoka, sans-serif">
          {n}
        </text>
      ))}
      {/* Hour hand (short, thick) */}
      <line x1={cx} y1={cy} x2={hourX} y2={hourY}
        stroke="#c0487a" strokeWidth={size * 0.038} strokeLinecap="round" />
      {/* Minute hand (long, thin) */}
      <line x1={cx} y1={cy} x2={minX} y2={minY}
        stroke="#ff5d9e" strokeWidth={size * 0.024} strokeLinecap="round" />
      {/* Center pin */}
      <circle cx={cx} cy={cy} r={size * 0.044} fill="#ff5d9e" />
      <circle cx={cx} cy={cy} r={size * 0.02} fill="white" />
    </svg>
  );
};

function generateProblem() {
  const hour = Math.floor(Math.random() * 12) + 1;
  const wrong = new Set();
  while (wrong.size < 3) {
    const w = Math.floor(Math.random() * 12) + 1;
    if (w !== hour) wrong.add(w);
  }
  const choices = [hour, ...wrong].sort(() => Math.random() - 0.5);
  return { hour, choices };
}

export default function ClockGame({ autoAdvance }) {
  const [problem, setProblem] = useState(null);
  const [selected, setSelected] = useState(null);
  const [sessionCount, setSessionCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const next = useCallback(() => {
    setProblem(generateProblem());
    setSelected(null);
  }, []);

  useEffect(() => { next(); }, []);

  const handleChoice = (val) => {
    if (selected !== null) return;
    setSelected(val);
    setSessionCount(p => p + 1);
    if (val === problem.hour) {
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

  if (!problem) return null;

  return (
    <div className="screen-wrapper fade-in" style={{ justifyContent: 'flex-start', gap: '16px', paddingBottom: '20px', overflowY: 'auto' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '1.3rem', fontWeight: '700', color: '#c0487a', marginBottom: '4px' }}>
          🕐 时钟现在显示几点？
        </div>
        <div style={{ fontSize: '0.9rem', color: '#d4879e', fontWeight: '600' }}>
          📝 本次 {sessionCount} 题 · ✅ 答对 {correctCount} 题
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <ClockFace hour={problem.hour} size={210} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%', maxWidth: '360px' }}>
        {problem.choices.map(val => {
          let bg = 'white', border = '#f5c0d0', color = '#c06080';
          if (selected !== null) {
            if (val === problem.hour)   { bg = '#f0fdf4'; border = '#4ade80'; color = '#16a34a'; }
            else if (val === selected)  { bg = '#fef2f2'; border = '#f87171'; color = '#dc2626'; }
          }
          return (
            <button key={val} onClick={() => handleChoice(val)}
              style={{
                padding: '18px 10px', borderRadius: '20px',
                border: `3px solid ${border}`, background: bg, color,
                fontWeight: '700', fontSize: '1.8rem',
                cursor: selected !== null ? 'default' : 'pointer',
                fontFamily: 'Fredoka, sans-serif',
                boxShadow: '0 4px 12px rgba(255,93,158,0.1)',
                transition: 'all 0.2s ease',
              }}>
              {val}:00
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <div className="bounce-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{
            fontSize: '1.1rem', fontWeight: '700', textAlign: 'center',
            color: selected === problem.hour ? '#16a34a' : '#dc2626',
          }}>
            {selected === problem.hour
              ? `🌟 答对了！是 ${problem.hour}:00！`
              : `💡 正确答案是 ${problem.hour}:00 哦！`}
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

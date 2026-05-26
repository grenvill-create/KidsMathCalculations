import React, { useState, useEffect, useCallback } from 'react';
import { audioSynth } from '../utils/audioSynth';

const ClockFace = ({ time, size = 210 }) => {
  const { h, m } = time;
  const cx = size / 2;
  const cy = size / 2;
  const faceR = size / 2 - 6;

  // Hour hand: points toward the given hour + minute offset
  const hourAngle = (((h % 12) + m / 60) / 12) * 2 * Math.PI - Math.PI / 2;
  const hourLen = faceR * 0.52;
  const hourX = cx + Math.cos(hourAngle) * hourLen;
  const hourY = cy + Math.sin(hourAngle) * hourLen;

  // Minute hand
  const minAngle = (m / 60) * 2 * Math.PI - Math.PI / 2;
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
          fontSize={size * 0.083} fontWeight="600" fill="#c06080"
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

function generateProblem(level) {
  const h = Math.floor(Math.random() * 12) + 1;
  let m = 0;
  if (level === 2) m = 30;
  if (level >= 3) m = Math.random() > 0.5 ? 15 : 45;

  const time = { h, m };
  const wrong = [];
  
  while (wrong.length < 3) {
    const wH = Math.floor(Math.random() * 12) + 1;
    let wM = m;
    if (level === 2) wM = Math.random() > 0.5 ? 0 : 30;
    if (level >= 3) wM = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
    
    // Check uniqueness
    if (wH === h && wM === m) continue;
    if (wrong.some(w => w.h === wH && w.m === wM)) continue;
    wrong.push({ h: wH, m: wM });
  }
  
  const choices = [time, ...wrong].sort(() => Math.random() - 0.5);
  return { time, choices };
}

const formatTime = (t, isEn) => {
  const padM = t.m.toString().padStart(2, '0');
  if (isEn) {
    if (t.m === 0) return `${t.h} o'clock`;
    if (t.m === 15) return `${t.h} fifteen`;
    if (t.m === 30) return `${t.h} thirty`;
    if (t.m === 45) return `${t.h} forty-five`;
    return `${t.h}:${padM}`;
  }
  return `${t.h}:${padM}`;
};

export default function ClockGame({ autoAdvance, lang = 'zh', difficultyMode = 'adaptive' }) {
  const [adaptiveLevel, setAdaptiveLevel] = useState(1);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);

  const level = difficultyMode === 'easy' ? 1 : 
                difficultyMode === 'medium' ? 2 : 
                difficultyMode === 'hard' ? 3 : adaptiveLevel;

  const [problem, setProblem] = useState(null);
  const [selected, setSelected] = useState(null);
  const [sessionCount, setSessionCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const next = useCallback(() => {
    setProblem(generateProblem(level));
    setSelected(null);
  }, [level]);

  useEffect(() => { next(); }, []);

  const handleChoice = (val) => {
    if (selected !== null) return;
    setSelected(val);
    setSessionCount(p => p + 1);
    if (val.h === problem.time.h && val.m === problem.time.m) {
      audioSynth.playCorrect();
      setCorrectCount(p => p + 1);
      if (difficultyMode === 'adaptive') {
        const newConsecutive = consecutiveCorrect + 1;
        setConsecutiveCorrect(newConsecutive);
        if (newConsecutive >= 2 && adaptiveLevel < 3) {
          setAdaptiveLevel(l => l + 1);
          setConsecutiveCorrect(0);
        }
      }
      if (autoAdvance) {
        setTimeout(next, 1200);
      }
    } else {
      audioSynth.playIncorrect();
      if (difficultyMode === 'adaptive') {
        setConsecutiveCorrect(0);
        if (adaptiveLevel > 1) {
          setAdaptiveLevel(l => l - 1);
        }
      }
      if (autoAdvance) {
        setTimeout(next, 1800);
      }
    }
  };

  if (!problem) return null;

  const isEn = lang === 'en';

  return (
    <div className="screen-wrapper fade-in" style={{ justifyContent: 'flex-start', gap: '16px', paddingBottom: '20px', overflowY: 'auto' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '1.3rem', fontWeight: '600', color: '#c0487a', marginBottom: '4px' }}>
          {isEn ? '🕐 What time is it?' : '🕐 时钟现在显示几点？'}
        </div>
        <div style={{ fontSize: '0.9rem', color: '#d4879e', fontWeight: '600' }}>
          {isEn
            ? `📝 Total: ${sessionCount} · ✅ Correct: ${correctCount}`
            : `📝 本次 ${sessionCount} 题 · ✅ 答对 ${correctCount} 题`}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <ClockFace time={problem.time} size={210} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%', maxWidth: '360px' }}>
        {problem.choices.map(val => {
          let bg = 'white', border = '#f5c0d0', color = '#c06080';
          if (selected !== null) {
            if (val.h === problem.time.h && val.m === problem.time.m)   { bg = '#f0fdf4'; border = '#4ade80'; color = '#16a34a'; }
            else if (selected.h === val.h && selected.m === val.m)  { bg = '#fef2f2'; border = '#f87171'; color = '#dc2626'; }
          }
          return (
            <button key={`${val.h}:${val.m}`} onClick={() => handleChoice(val)}
              style={{
                padding: '18px 8px', borderRadius: '20px',
                border: `3px solid ${border}`, background: bg, color,
                fontWeight: '600', fontSize: isEn ? '1.1rem' : '1.6rem',
                cursor: selected !== null ? 'default' : 'pointer',
                fontFamily: 'Fredoka, sans-serif',
                boxShadow: '0 4px 12px rgba(255,93,158,0.1)',
                transition: 'all 0.2s ease',
              }}>
              {formatTime(val, isEn)}
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <div className="bounce-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{
            fontSize: '1.1rem', fontWeight: '600', textAlign: 'center',
            color: (selected.h === problem.time.h && selected.m === problem.time.m) ? '#16a34a' : '#dc2626',
          }}>
            {(selected.h === problem.time.h && selected.m === problem.time.m)
              ? (isEn ? `🌟 Correct! It is ${formatTime(problem.time, true)}!` : `🌟 答对了！是 ${formatTime(problem.time, false)}！`)
              : (isEn ? `💡 Correct answer is ${formatTime(problem.time, true)}!` : `💡 正确答案是 ${formatTime(problem.time, false)} 哦！`)}
          </div>
          {!autoAdvance && (
            <button
              onClick={next}
              style={{
                marginTop: '6px',
                padding: '10px 28px',
                fontSize: '1.1rem',
                fontWeight: '600',
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
              {isEn ? 'Next ➔' : '下一题 ➔'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

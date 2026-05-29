import React, { useState, useEffect, useCallback } from 'react';
import { audioSynth } from '../utils/audioSynth';

// Generate two clock times and ask how many minutes apart
function generateProblem(level) {
  if (level === 1) {
    // Same hour, difference is :00/:15/:30/:45 only
    const hour = Math.floor(Math.random() * 12) + 1;
    const minsA = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
    let minsB;
    do { minsB = [0, 15, 30, 45][Math.floor(Math.random() * 4)]; } while (minsB === minsA);
    const tA = hour * 60 + minsA;
    const tB = hour * 60 + minsB;
    const diff = Math.abs(tA - tB);
    const earlier = tA < tB ? { h: hour, m: minsA } : { h: hour, m: minsB };
    const later = tA > tB ? { h: hour, m: minsA } : { h: hour, m: minsB };
    return { earlier, later, diff, mode: 'diff' };
  } else if (level === 2) {
    // Different hours, difference within 60 min
    const h1 = Math.floor(Math.random() * 11) + 1;
    const m1 = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
    const diffMins = [15, 30, 45, 60][Math.floor(Math.random() * 4)];
    const t2 = h1 * 60 + m1 + diffMins;
    const h2 = Math.floor(t2 / 60) % 12 || 12;
    const m2 = t2 % 60;
    return { earlier: { h: h1, m: m1 }, later: { h: h2, m: m2 }, diff: diffMins, mode: 'diff' };
  } else {
    // "What time will it be X minutes later?" — fill in
    const h = Math.floor(Math.random() * 11) + 1;
    const mStart = [0, 15, 30][Math.floor(Math.random() * 3)];
    const addMins = [15, 30, 45, 60][Math.floor(Math.random() * 4)];
    const total = h * 60 + mStart + addMins;
    const hEnd = Math.floor(total / 60) % 12 || 12;
    const mEnd = total % 60;
    return { start: { h, m: mStart }, end: { h: hEnd, m: mEnd }, addMins, mode: 'later', diff: addMins };
  }
}

function pad(n) { return String(n).padStart(2, '0'); }

// SVG Clock Face
function ClockFace({ hours, minutes, size = 100, color = '#3b82f6' }) {
  const cx = size / 2, cy = size / 2, r = size / 2 - 4;
  const hourAngle = ((hours % 12) + minutes / 60) * 30 - 90; // degrees
  const minAngle = minutes * 6 - 90;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const hourLen = r * 0.55;
  const minLen = r * 0.8;
  return (
    <svg width={size} height={size}>
      <circle cx={cx} cy={cy} r={r} fill="white" stroke={color} strokeWidth="3" />
      {/* Hour markers */}
      {Array.from({ length: 12 }, (_, i) => {
        const a = toRad(i * 30 - 90);
        const x1 = cx + (r - 8) * Math.cos(a);
        const y1 = cy + (r - 8) * Math.sin(a);
        const x2 = cx + (r - 3) * Math.cos(a);
        const y2 = cy + (r - 3) * Math.sin(a);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="2" strokeLinecap="round" />;
      })}
      {/* Hour hand */}
      <line x1={cx} y1={cy}
        x2={cx + hourLen * Math.cos(toRad(hourAngle))}
        y2={cy + hourLen * Math.sin(toRad(hourAngle))}
        stroke="#1e3a8a" strokeWidth="4" strokeLinecap="round" />
      {/* Minute hand */}
      <line x1={cx} y1={cy}
        x2={cx + minLen * Math.cos(toRad(minAngle))}
        y2={cy + minLen * Math.sin(toRad(minAngle))}
        stroke={color} strokeWidth="3" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="4" fill="#1e3a8a" />
    </svg>
  );
}

export default function TimeDiffGame({ lang = 'zh', onBack }) {
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [problem, setProblem] = useState(null);
  const [userAns, setUserAns] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [choices, setChoices] = useState([]);

  const zh = lang === 'zh';

  const buildChoices = useCallback((p) => {
    const correct = p.diff;
    const wrong = new Set();
    while (wrong.size < 3) {
      const w = [15, 30, 45, 60, 90, 120][Math.floor(Math.random() * 6)];
      if (w !== correct) wrong.add(w);
    }
    return [correct, ...wrong].sort((a, b) => a - b);
  }, []);

  const newProblem = useCallback(() => {
    const p = generateProblem(level);
    setProblem(p);
    setUserAns('');
    setFeedback(null);
    setChoices(buildChoices(p));
  }, [level, buildChoices]);

  useEffect(() => { newProblem(); }, [newProblem]);

  const handleChoice = (val) => {
    if (feedback) return;
    audioSynth.playClick();
    const correct = val === problem.diff;
    if (correct) {
      audioSynth.playCorrect();
      setFeedback('correct');
      const ns = streak + 1;
      setStreak(ns);
      if (ns >= 4 && level < 3) { setLevel(l => l + 1); setStreak(0); }
    } else {
      audioSynth.playIncorrect();
      setFeedback('wrong');
      setStreak(0);
    }
    setUserAns(val.toString());
  };

  const handlePad = (k) => {
    if (feedback) return;
    audioSynth.playClick();
    if (k === 'C') { setUserAns(''); return; }
    if (k === '✓') {
      if (!userAns) return;
      const val = parseInt(userAns);
      handleChoice(val);
      return;
    }
    if (userAns.length < 3) setUserAns(p => p + k);
  };

  if (!problem) return null;

  const timeStr = ({ h, m }) => `${pad(h)}:${pad(m)}`;
  const minLabel = (m) => zh ? `${m} 分钟` : `${m} min`;

  return (
    <div className="screen-wrapper fade-in" style={{ gap: '16px', paddingTop: '10px', paddingBottom: '20px' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '92%', maxWidth: '380px' }}>
        <button className="bouncy-button secondary" onClick={onBack} style={{ padding: '10px 16px' }}>🏠</button>
        <div style={{ flex: 1, textAlign: 'center', fontWeight: '700', fontSize: '1.1rem', color: '#075985' }}>
          {zh ? '⏱️ 时间差' : '⏱️ Time Difference'}
        </div>
        <div style={{ background: 'linear-gradient(135deg, #7dd3fc, #0284c7)', color: 'white', borderRadius: '50px', padding: '6px 14px', fontSize: '0.88rem', fontWeight: '700' }}>
          Lv {level}
        </div>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(16px)', borderRadius: '28px',
        padding: '24px 18px', border: '2px solid rgba(255,255,255,0.7)',
        boxShadow: '0 8px 32px rgba(2,132,199,0.15)', width: '92%', maxWidth: '380px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px',
      }}>

        {/* DIFF MODE */}
        {problem.mode === 'diff' && (
          <>
            <div style={{ fontWeight: '700', fontSize: '1rem', color: '#075985', textAlign: 'center' }}>
              {zh ? '这两个时刻相差多少分钟？' : 'How many minutes apart are these two times?'}
            </div>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center' }}>
                <ClockFace hours={problem.earlier.h} minutes={problem.earlier.m} size={96} color="#0284c7" />
                <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: '800', fontSize: '1.4rem', color: '#075985', marginTop: '4px' }}>
                  {timeStr(problem.earlier)}
                </div>
              </div>
              <div style={{ fontSize: '2rem', color: '#0284c7' }}>→</div>
              <div style={{ textAlign: 'center' }}>
                <ClockFace hours={problem.later.h} minutes={problem.later.m} size={96} color="#f59e0b" />
                <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: '800', fontSize: '1.4rem', color: '#92400e', marginTop: '4px' }}>
                  {timeStr(problem.later)}
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', width: '100%' }}>
              {choices.map(c => (
                <button key={c} onClick={() => handleChoice(c)} style={{
                  padding: '14px', borderRadius: '16px', border: 'none', cursor: 'pointer',
                  background: feedback
                    ? (c === problem.diff ? 'linear-gradient(135deg,#4ade80,#22c55e)' : (c === parseInt(userAns) ? 'linear-gradient(135deg,#fca5a5,#ef4444)' : '#f3f4f6'))
                    : 'linear-gradient(135deg, #e0f2fe, #bae6fd)',
                  fontFamily: 'Fredoka, sans-serif', fontWeight: '800', fontSize: '1.4rem', color: '#075985',
                  boxShadow: '0 3px 8px rgba(2,132,199,0.15)', transition: 'all 0.2s',
                }}>
                  {minLabel(c)}
                </button>
              ))}
            </div>
          </>
        )}

        {/* LATER MODE */}
        {problem.mode === 'later' && (
          <>
            <div style={{ fontWeight: '700', fontSize: '1rem', color: '#075985', textAlign: 'center' }}>
              {zh
                ? `现在是 ${timeStr(problem.start)}，再过 ${problem.addMins} 分钟是几时几分？`
                : `It's ${timeStr(problem.start)}. What time is it ${problem.addMins} minutes later?`}
            </div>
            <ClockFace hours={problem.start.h} minutes={problem.start.m} size={110} color="#0284c7" />
            <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: '900', fontSize: '1.8rem', color: '#075985' }}>
              {timeStr(problem.start)} + {problem.addMins}{zh ? '分钟' : 'min'} = ?
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', width: '100%' }}>
              {choices.map(c => {
                // Build answer time for display
                const tot = problem.start.h * 60 + problem.start.m + c;
                const rh = Math.floor(tot / 60) % 12 || 12;
                const rm = tot % 60;
                const isCorrect = c === problem.diff;
                const isSelected = c === parseInt(userAns);
                return (
                  <button key={c} onClick={() => handleChoice(c)} style={{
                    padding: '14px 8px', borderRadius: '16px', border: 'none', cursor: 'pointer',
                    background: feedback
                      ? (isCorrect ? 'linear-gradient(135deg,#4ade80,#22c55e)' : (isSelected ? 'linear-gradient(135deg,#fca5a5,#ef4444)' : '#f3f4f6'))
                      : 'linear-gradient(135deg, #e0f2fe, #bae6fd)',
                    fontFamily: 'Fredoka, sans-serif', fontWeight: '800', fontSize: '1.3rem', color: '#075985',
                    boxShadow: '0 3px 8px rgba(2,132,199,0.15)', transition: 'all 0.2s',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                  }}>
                    <ClockFace hours={rh} minutes={rm} size={60} color="#0284c7" />
                    <span>{pad(rh)}:{pad(rm)}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {feedback && (
          <div style={{
            padding: '12px 20px', borderRadius: '16px', fontWeight: '700', fontSize: '1rem', width: '100%', textAlign: 'center',
            background: feedback === 'correct' ? '#dcfce7' : '#fee2e2',
            color: feedback === 'correct' ? '#16a34a' : '#dc2626',
          }}>
            {feedback === 'correct'
              ? (zh ? '🌟 算对了！时间感真棒！' : '🌟 Correct! Great time sense!')
              : (zh
                  ? `💡 正确答案是 ${problem.mode === 'later' ? timeStr(problem.end) : minLabel(problem.diff)}`
                  : `💡 Answer: ${problem.mode === 'later' ? timeStr(problem.end) : minLabel(problem.diff)}`)}
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

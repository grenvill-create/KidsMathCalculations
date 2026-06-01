import React, { useState, useEffect, useCallback } from 'react';
import { audioSynth } from '../utils/audioSynth';

function generateProblem(level) {
  if (level === 1) {
    // Read temperature: integer, 0-40°C
    const temp = Math.floor(Math.random() * 41);
    const choices4 = new Set([temp]);
    while (choices4.size < 4) {
      const w = Math.floor(Math.random() * 50) - 5;
      if (w !== temp) choices4.add(w);
    }
    return { mode: 'read', temp, choices: [...choices4].sort((a, b) => a - b) };
  } else if (level === 2) {
    // Compare two temperatures
    let t1, t2;
    do {
      t1 = Math.floor(Math.random() * 50) - 10;
      t2 = Math.floor(Math.random() * 50) - 10;
    } while (t1 === t2);
    const answer = t1 > t2 ? 'left' : 'right';
    const questionType = Math.random() > 0.5 ? 'warmer' : 'colder';
    return { mode: 'compare', t1, t2, answer: questionType === 'warmer' ? answer : (answer === 'left' ? 'right' : 'left'), questionType };
  } else {
    // Arithmetic: temp changes by some degrees
    const start = Math.floor(Math.random() * 30) - 5;
    const change = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 15) + 1);
    const end = start + change;
    return { mode: 'calc', start, change, end };
  }
}

// SVG Thermometer
function Thermometer({ temp, minT = -20, maxT = 50, width = 60, height = 180 }) {
  const bulbR = 16;
  const tubeW = 14;
  const tubeTop = 20;
  const tubeBottom = height - bulbR - 8;
  const tubeH = tubeBottom - tubeTop;

  const clamp = (v) => Math.max(minT, Math.min(maxT, v));
  const fraction = (clamp(temp) - minT) / (maxT - minT);
  const fillHeight = fraction * tubeH;
  const fillY = tubeBottom - fillHeight;

  const cx = width / 2;
  const bulbCY = height - bulbR - 4;
  const isHot = temp >= 30;
  const isCold = temp <= 0;
  const tubeColor = isHot ? '#ef4444' : isCold ? '#60a5fa' : '#f59e0b';
  const bulbColor = isHot ? '#dc2626' : isCold ? '#3b82f6' : '#f59e0b';

  // Tick marks
  const ticks = [];
  for (let t = minT; t <= maxT; t += 10) {
    const y = tubeBottom - ((t - minT) / (maxT - minT)) * tubeH;
    ticks.push({ t, y });
  }

  return (
    <svg width={width + 40} height={height + 10} style={{ display: 'block' }}>
      {/* Tube background */}
      <rect x={cx - tubeW / 2} y={tubeTop} width={tubeW} height={tubeH}
        rx={tubeW / 2} ry={tubeW / 2} fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="2" />
      {/* Fill */}
      <rect x={cx - tubeW / 2 + 2} y={fillY} width={tubeW - 4} height={fillHeight}
        rx={(tubeW - 4) / 2} ry={(tubeW - 4) / 2} fill={tubeColor} />
      {/* Bulb */}
      <circle cx={cx} cy={bulbCY} r={bulbR} fill={bulbColor} stroke="white" strokeWidth="2" />
      <text x={cx} y={bulbCY + 5} textAnchor="middle" fontSize="10" fontWeight="800" fill="white">°C</text>
      {/* Tick marks & labels */}
      {ticks.map(({ t, y }) => (
        <g key={t}>
          <line x1={cx + tubeW / 2} y1={y} x2={cx + tubeW / 2 + 8} y2={y}
            stroke="#64748b" strokeWidth={t === 0 ? 2 : 1} />
          <text x={cx + tubeW / 2 + 12} y={y + 4} fontSize="11" fontWeight={t === 0 ? '800' : '500'} fill={t === 0 ? '#1e293b' : '#64748b'}>
            {t}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default function TemperatureGame({ lang = 'zh', onBack }) {
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [problem, setProblem] = useState(null);
  const [selected, setSelected] = useState(null);
  const [userAns, setUserAns] = useState('');
  const [feedback, setFeedback] = useState(null);

  const zh = lang === 'zh';

  const newProblem = useCallback(() => {
    setProblem(generateProblem(level));
    setSelected(null);
    setUserAns('');
    setFeedback(null);
  }, [level]);

  useEffect(() => { newProblem(); }, [newProblem]);

  const handleChoice = (val) => {
    if (feedback) return;
    audioSynth.playClick();
    setSelected(val);
    const correct = problem.mode === 'read' ? val === problem.temp : val === problem.answer;
    if (correct) {
      audioSynth.playCorrect(); setFeedback('correct');
      const ns = streak + 1; setStreak(ns);
      if (ns >= 3 && level < 3) { setLevel(l => l + 1); setStreak(0); }
    } else {
      audioSynth.playIncorrect(); setFeedback('wrong'); setStreak(0);
    }
  };

  const handlePad = (k) => {
    if (feedback) return;
    audioSynth.playClick();
    if (k === 'C') { setUserAns(''); return; }
    if (k === '✓') { submitCalc(); return; }
    // Allow minus sign for negative numbers
    if (k === '-' && userAns === '') { setUserAns('-'); return; }
    if (userAns.length < 4) setUserAns(p => p + k);
  };

  const submitCalc = () => {
    if (!problem || !userAns) return;
    const correct = parseInt(userAns) === problem.end;
    if (correct) {
      audioSynth.playCorrect(); setFeedback('correct');
      const ns = streak + 1; setStreak(ns);
      if (ns >= 3 && level < 3) { setLevel(l => l + 1); setStreak(0); }
    } else {
      audioSynth.playIncorrect(); setFeedback('wrong'); setStreak(0);
    }
  };

  if (!problem) return null;

  const tempLabel = (t) => `${t > 0 ? '+' : ''}${t}°C`;
  const weatherEmoji = (t) => t >= 35 ? '🔥' : t >= 25 ? '☀️' : t >= 15 ? '⛅' : t >= 5 ? '🌥️' : t >= 0 ? '❄️' : '🥶';

  return (
    <div className="screen-wrapper fade-in" style={{ gap: '16px', paddingTop: '10px', paddingBottom: '20px' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '92%', maxWidth: '380px' }}>
        <button className="bouncy-button secondary" onClick={onBack} style={{ padding: '10px 16px' }}>🏠</button>
        <div style={{ flex: 1, textAlign: 'center', fontWeight: '700', fontSize: '1.1rem', color: '#b45309' }}>
          {zh ? '🌡️ 温度计' : '🌡️ Temperature'}
        </div>
        <div style={{ background: 'linear-gradient(135deg,#fde68a,#f59e0b)', color: 'white', borderRadius: '50px', padding: '6px 14px', fontSize: '0.88rem', fontWeight: '700' }}>
          Lv {level}
        </div>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(16px)',
        borderRadius: '28px', padding: '24px 16px',
        border: '2px solid rgba(255,255,255,0.7)',
        boxShadow: '0 8px 32px rgba(245,158,11,0.15)',
        width: '92%', maxWidth: '380px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px',
      }}>

        {/* READ mode */}
        {problem.mode === 'read' && (
          <>
            <div style={{ fontWeight: '700', color: '#92400e', fontSize: '1rem' }}>
              {zh ? '🌡️ 温度计显示的是多少摄氏度？' : '🌡️ What temperature does the thermometer show?'}
            </div>
            <Thermometer temp={problem.temp} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', width: '100%' }}>
              {problem.choices.map(c => (
                <button key={c} onClick={() => handleChoice(c)} style={{
                  padding: '14px', borderRadius: '16px', border: 'none', cursor: 'pointer',
                  background: feedback
                    ? (c === problem.temp ? '#dcfce7' : c === selected ? '#fee2e2' : '#f3f4f6')
                    : (selected === c ? '#fef3c7' : 'linear-gradient(135deg,#fef9c3,#fef3c7)'),
                  fontFamily: 'Fredoka, sans-serif', fontWeight: '800', fontSize: '1.3rem',
                  color: feedback
                    ? (c === problem.temp ? '#16a34a' : c === selected ? '#dc2626' : '#6b7280')
                    : '#92400e',
                  boxShadow: '0 3px 8px rgba(245,158,11,0.15)',
                  transition: 'all 0.2s',
                }}>
                  {weatherEmoji(c)} {c}°C
                </button>
              ))}
            </div>
          </>
        )}

        {/* COMPARE mode */}
        {problem.mode === 'compare' && (
          <>
            <div style={{ fontWeight: '700', color: '#92400e', fontSize: '1rem', textAlign: 'center' }}>
              {problem.questionType === 'warmer'
                ? (zh ? '☀️ 哪边更热（温度更高）？' : '☀️ Which is warmer (higher temperature)?')
                : (zh ? '❄️ 哪边更冷（温度更低）？' : '❄️ Which is colder (lower temperature)?')}
            </div>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end' }}>
              {[{ temp: problem.t1, side: 'left' }, { temp: problem.t2, side: 'right' }].map(({ temp, side }) => (
                <div key={side} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{ fontSize: '2.2rem' }}>{weatherEmoji(temp)}</div>
                  <Thermometer temp={temp} width={50} height={140} />
                  <button onClick={() => handleChoice(side)} style={{
                    padding: '10px 18px', borderRadius: '14px', border: 'none', cursor: 'pointer',
                    background: feedback
                      ? (problem.answer === side ? '#dcfce7' : '#fee2e2')
                      : 'linear-gradient(135deg,#fef9c3,#fef3c7)',
                    fontFamily: 'Fredoka, sans-serif', fontWeight: '900', fontSize: '1.2rem',
                    color: feedback ? (problem.answer === side ? '#16a34a' : '#dc2626') : '#92400e',
                    boxShadow: '0 3px 8px rgba(245,158,11,0.15)',
                  }}>
                    {temp > 0 ? '+' : ''}{temp}°C
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* CALC mode */}
        {problem.mode === 'calc' && (
          <>
            <div style={{ fontWeight: '700', color: '#92400e', fontSize: '1rem', textAlign: 'center' }}>
              {zh
                ? `${weatherEmoji(problem.start)} 现在气温 ${problem.start}°C，${problem.change > 0 ? '升温' : '降温'} ${Math.abs(problem.change)}°C 后是多少度？`
                : `${weatherEmoji(problem.start)} It's ${problem.start}°C. After ${problem.change > 0 ? 'rising' : 'falling'} ${Math.abs(problem.change)}°C, what's the temperature?`}
            </div>
            <Thermometer temp={problem.start} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ fontWeight: '700', color: '#92400e' }}>{problem.start}°C {problem.change > 0 ? '+' : '-'} {Math.abs(problem.change)}° =</div>
              <div style={{
                minWidth: '80px', height: '52px', borderRadius: '14px',
                border: `3px solid ${feedback === 'correct' ? '#22c55e' : feedback === 'wrong' ? '#ef4444' : '#fcd34d'}`,
                background: feedback === 'correct' ? '#dcfce7' : feedback === 'wrong' ? '#fee2e2' : 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.8rem', fontWeight: '900', color: '#92400e',
              }}>
                {userAns || <span style={{ opacity: 0.3 }}>?</span>}
              </div>
              <div style={{ fontWeight: '700', color: '#92400e' }}>°C</div>
            </div>
          </>
        )}

        {feedback && (
          <div style={{
            padding: '12px 18px', borderRadius: '16px', fontWeight: '700', fontSize: '1rem',
            width: '100%', textAlign: 'center',
            background: feedback === 'correct' ? '#dcfce7' : '#fee2e2',
            color: feedback === 'correct' ? '#16a34a' : '#dc2626',
          }}>
            {feedback === 'correct'
              ? (zh ? '🌟 读数正确！' : '🌟 Correct reading!')
              : (zh
                  ? `💡 正确答案是 ${problem.mode === 'read' ? problem.temp : problem.mode === 'calc' ? problem.end : (problem.answer === 'left' ? problem.t1 : problem.t2)}°C`
                  : `💡 Correct: ${problem.mode === 'read' ? problem.temp : problem.mode === 'calc' ? problem.end : (problem.answer === 'left' ? problem.t1 : problem.t2)}°C`)}
          </div>
        )}
      </div>

      {problem.mode === 'calc' && !feedback && (
        <div className="keypad-grid" style={{ maxWidth: '340px' }}>
          {['1','2','3','4','5','6','7','8','9','C','0','✓'].map(k => (
            <button key={k}
              className={`keypad-btn ${k === 'C' ? 'action-clear' : k === '✓' ? 'action-submit' : ''}`}
              onClick={() => handlePad(k)}>
              {k}
            </button>
          ))}
        </div>
      )}

      {feedback && (
        <button className="bouncy-button primary" onClick={newProblem} style={{ padding: '14px 32px', fontSize: '1.1rem' }}>
          {zh ? '下一题 ➔' : 'Next ➔'}
        </button>
      )}
    </div>
  );
}

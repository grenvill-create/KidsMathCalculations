import React, { useState, useEffect, useCallback } from 'react';
import { audioSynth } from '../utils/audioSynth';

function generateProblem(level) {
  const max = level === 1 ? 20 : level === 2 ? 50 : 100;
  const min = level === 1 ? 0 : level === 2 ? 0 : -20;
  const step = level <= 2 ? 1 : (Math.random() > 0.5 ? 5 : 10);

  // Generate tick values
  const start = Math.floor(Math.random() * (max / 2 - 5)) * step + min;
  const end = start + (level === 1 ? 10 : level === 2 ? 20 : 50);
  const ticks = [];
  for (let v = start; v <= end; v += step) ticks.push(v);

  // Pick a target value at a tick
  const targetIdx = Math.floor(Math.random() * ticks.length);
  const target = ticks[targetIdx];

  // Mode: 'find' = tap on position, 'read' = which number is the arrow pointing at
  const mode = Math.random() > 0.4 ? 'find' : 'read';

  return { ticks, start, end, target, targetIdx, step, mode };
}

export default function NumberLineGame({ lang = 'zh', onBack }) {
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [problem, setProblem] = useState(null);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [choices, setChoices] = useState([]);

  const zh = lang === 'zh';

  const buildChoices = (p) => {
    const wrong = new Set();
    while (wrong.size < 3) {
      const w = p.ticks[Math.floor(Math.random() * p.ticks.length)];
      if (w !== p.target) wrong.add(w);
    }
    return [p.target, ...wrong].sort((a, b) => a - b);
  };

  const newProblem = useCallback(() => {
    const p = generateProblem(level);
    setProblem(p);
    setSelected(null);
    setFeedback(null);
    setChoices(buildChoices(p));
  }, [level]);

  useEffect(() => { newProblem(); }, [newProblem]);

  const handleSelect = (val) => {
    if (feedback) return;
    audioSynth.playClick();
    setSelected(val);
    const correct = val === problem.target;
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
  };

  if (!problem) return null;
  const { ticks, target, targetIdx, mode } = problem;

  const totalWidth = 320;
  const paddingX = 20;
  const lineWidth = totalWidth - paddingX * 2;
  const tickSpacing = lineWidth / (ticks.length - 1);

  const tickX = (i) => paddingX + i * tickSpacing;
  const arrowX = tickX(targetIdx);

  return (
    <div className="screen-wrapper fade-in" style={{ gap: '16px', paddingTop: '10px', paddingBottom: '20px' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '92%', maxWidth: '380px' }}>
        <button className="bouncy-button secondary" onClick={onBack} style={{ padding: '10px 16px' }}>🏠</button>
        <div style={{ flex: 1, textAlign: 'center', fontWeight: '700', fontSize: '1.1rem', color: '#0369a1' }}>
          {zh ? '📏 数轴游戏' : '📏 Number Line'}
        </div>
        <div style={{ background: 'linear-gradient(135deg,#38bdf8,#0284c7)', color: 'white', borderRadius: '50px', padding: '6px 14px', fontSize: '0.88rem', fontWeight: '700' }}>
          Lv {level}
        </div>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(16px)',
        borderRadius: '28px', padding: '24px 16px',
        border: '2px solid rgba(255,255,255,0.7)',
        boxShadow: '0 8px 32px rgba(2,132,199,0.15)',
        width: '92%', maxWidth: '380px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px',
      }}>

        {/* Question */}
        <div style={{ fontSize: '1rem', color: '#0369a1', fontWeight: '700', textAlign: 'center' }}>
          {mode === 'find'
            ? (zh ? `🎯 在数轴上找到 ${target} 的位置！` : `🎯 Find ${target} on the number line!`)
            : (zh ? `🔍 箭头指向的是哪个数？` : `🔍 What number does the arrow point to?`)}
        </div>

        {/* Number line SVG */}
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <svg width={totalWidth} height={100} style={{ display: 'block', margin: '0 auto' }}>
            {/* Main line */}
            <line x1={paddingX - 8} y1={50} x2={totalWidth - paddingX + 8} y2={50}
              stroke="#0284c7" strokeWidth="3" />
            {/* Arrow ends */}
            <polygon points={`${totalWidth - paddingX + 8},50 ${totalWidth - paddingX},45 ${totalWidth - paddingX},55`} fill="#0284c7" />

            {/* Ticks and labels */}
            {ticks.map((v, i) => {
              const x = tickX(i);
              const isTarget = v === target;
              const isSelected = v === selected;
              const showFeedback = feedback && isTarget;
              return (
                <g key={v}>
                  <line x1={x} y1={42} x2={x} y2={58} stroke={isTarget && feedback ? '#22c55e' : '#0284c7'} strokeWidth={isTarget ? 3 : 2} />
                  <text x={x} y={75} textAnchor="middle" fontSize="13" fontWeight={isTarget ? '800' : '600'}
                    fill={showFeedback ? '#16a34a' : '#1e40af'}>
                    {v}
                  </text>
                  {/* Find mode: tap targets */}
                  {mode === 'find' && (
                    <circle cx={x} cy={50} r={12}
                      fill={
                        feedback && isTarget ? '#22c55e' :
                        isSelected && feedback === 'wrong' ? '#ef4444' :
                        isSelected ? '#f59e0b' : 'rgba(255,255,255,0.01)'}
                      stroke={
                        feedback && isTarget ? '#16a34a' :
                        isSelected ? (feedback === 'wrong' ? '#ef4444' : '#f59e0b') : 'transparent'}
                      strokeWidth="2"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleSelect(v)} />
                  )}
                  {/* Read mode: show arrow */}
                  {mode === 'read' && isTarget && (
                    <>
                      <line x1={arrowX} y1={15} x2={arrowX} y2={36} stroke="#f59e0b" strokeWidth="3" />
                      <polygon points={`${arrowX},38 ${arrowX - 6},28 ${arrowX + 6},28`} fill="#f59e0b" />
                    </>
                  )}
                </g>
              );
            })}

            {/* Legend for find mode */}
            {mode === 'find' && !feedback && (
              <text x={totalWidth / 2} y={95} textAnchor="middle" fontSize="12" fill="#6b7280">
                {zh ? '↑ 点击数轴上对应的位置' : '↑ Tap the correct position'}
              </text>
            )}
          </svg>
        </div>

        {/* Read mode: answer choices */}
        {mode === 'read' && !feedback && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', width: '100%' }}>
            {choices.map(c => (
              <button key={c} onClick={() => handleSelect(c)} style={{
                padding: '14px', borderRadius: '16px', border: 'none', cursor: 'pointer',
                background: selected === c ? 'linear-gradient(135deg,#fde68a,#f59e0b)' : 'linear-gradient(135deg,#e0f2fe,#bae6fd)',
                fontFamily: 'Fredoka, sans-serif', fontWeight: '800', fontSize: '1.5rem', color: '#075985',
                boxShadow: '0 3px 8px rgba(2,132,199,0.15)', transition: 'all 0.2s',
              }}>
                {c}
              </button>
            ))}
          </div>
        )}
        {mode === 'read' && feedback && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', width: '100%' }}>
            {choices.map(c => (
              <div key={c} style={{
                padding: '14px', borderRadius: '16px', textAlign: 'center',
                background: c === target ? '#dcfce7' : c === selected ? '#fee2e2' : '#f3f4f6',
                fontFamily: 'Fredoka, sans-serif', fontWeight: '800', fontSize: '1.5rem',
                color: c === target ? '#16a34a' : c === selected ? '#dc2626' : '#9ca3af',
              }}>
                {c}
              </div>
            ))}
          </div>
        )}

        {feedback && (
          <div style={{
            padding: '12px 18px', borderRadius: '16px', fontWeight: '700', fontSize: '1rem',
            width: '100%', textAlign: 'center',
            background: feedback === 'correct' ? '#dcfce7' : '#fee2e2',
            color: feedback === 'correct' ? '#16a34a' : '#dc2626',
          }}>
            {feedback === 'correct'
              ? (zh ? `🌟 答对！${target} 就在那里！` : `🌟 Correct! ${target} is right there!`)
              : (zh ? `💡 正确位置是 ${target}！` : `💡 The correct position is ${target}!`)}
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

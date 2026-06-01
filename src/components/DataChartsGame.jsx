import React, { useState, useEffect, useCallback } from 'react';
import { audioSynth } from '../utils/audioSynth';

const CATEGORIES = [
  { key: 'fruit',   labelZh: '水果',   labelEn: 'Fruit',   items: ['🍎','🍌','🍊','🍇','🍓','🍑'] },
  { key: 'animal',  labelZh: '动物',   labelEn: 'Animals', items: ['🐱','🐶','🐰','🐻','🐸','🦊'] },
  { key: 'weather', labelZh: '天气',   labelEn: 'Weather', items: ['☀️','🌧️','❄️','⛅','🌈','⛈️'] },
  { key: 'sport',   labelZh: '运动',   labelEn: 'Sports',  items: ['⚽','🏀','🎾','🏊','🚴','🏓'] },
];

function generateChart(level) {
  const catDef = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
  const count = level === 1 ? 3 : level === 2 ? 4 : 5;
  const labels = catDef.items.slice(0, count);
  const max = level === 1 ? 10 : level === 2 ? 20 : 30;
  const values = labels.map(() => Math.floor(Math.random() * max) + 1);

  // Ensure unique max/min for clear answers
  while (new Set(values).size < values.length) {
    for (let i = 0; i < values.length; i++) values[i] = Math.floor(Math.random() * max) + 1;
  }

  const questions = [];
  const maxIdx = values.indexOf(Math.max(...values));
  const minIdx = values.indexOf(Math.min(...values));
  const total = values.reduce((a, b) => a + b, 0);
  const diff = Math.max(...values) - Math.min(...values);

  const qTypes = ['max', 'min', 'total', 'diff'];
  const picked = level === 1 ? ['max', 'min'] : qTypes.slice(0, level + 1);
  const qType = picked[Math.floor(Math.random() * picked.length)];

  let answer, questionZh, questionEn;
  if (qType === 'max') {
    answer = Math.max(...values);
    questionZh = `哪种最多？有多少？`;
    questionEn = `Which has the most? How many?`;
  } else if (qType === 'min') {
    answer = Math.min(...values);
    questionZh = `哪种最少？有多少？`;
    questionEn = `Which has the fewest? How many?`;
  } else if (qType === 'total') {
    answer = total;
    questionZh = `所有加起来共有多少？`;
    questionEn = `What is the total of all?`;
  } else {
    answer = diff;
    questionZh = `最多的比最少的多几个？`;
    questionEn = `How many more does the most have than the fewest?`;
  }

  return { catDef, labels, values, qType, answer, questionZh, questionEn, maxIdx, minIdx, total, diff };
}

function BarChart({ labels, values, highlight, maxVal }) {
  const H = 140;
  const barW = Math.min(44, Math.floor(300 / labels.length) - 8);
  const gap = barW + 8;
  const svgW = gap * labels.length + 16;

  return (
    <svg width={svgW} height={H + 40} style={{ display: 'block', margin: '0 auto', overflow: 'visible' }}>
      {/* Baseline */}
      <line x1={8} y1={H} x2={svgW - 8} y2={H} stroke="#cbd5e1" strokeWidth="2" />

      {labels.map((label, i) => {
        const val = values[i];
        const barH = Math.round((val / maxVal) * H);
        const x = 12 + i * gap;
        const isHighlight = highlight === i || highlight === 'all';
        const colors = ['#60a5fa','#f9a8d4','#86efac','#fcd34d','#a78bfa'];
        const fill = isHighlight ? '#f59e0b' : colors[i % colors.length];

        return (
          <g key={i}>
            {/* Bar */}
            <rect x={x} y={H - barH} width={barW} height={barH}
              rx="6" ry="6" fill={fill} opacity="0.9" />
            {/* Value label on top */}
            <text x={x + barW / 2} y={H - barH - 4} textAnchor="middle" fontSize="13" fontWeight="800" fill="#1e293b">
              {val}
            </text>
            {/* Emoji label */}
            <text x={x + barW / 2} y={H + 18} textAnchor="middle" fontSize="20">
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function DataChartsGame({ lang = 'zh', onBack }) {
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [chart, setChart] = useState(null);
  const [userAns, setUserAns] = useState('');
  const [feedback, setFeedback] = useState(null);

  const zh = lang === 'zh';

  const newChart = useCallback(() => {
    setChart(generateChart(level));
    setUserAns('');
    setFeedback(null);
  }, [level]);

  useEffect(() => { newChart(); }, [newChart]);

  const handlePad = (k) => {
    if (feedback) return;
    audioSynth.playClick();
    if (k === 'C') { setUserAns(''); return; }
    if (k === '✓') { submit(); return; }
    if (userAns.length < 4) setUserAns(p => p + k);
  };

  const submit = () => {
    if (!chart || !userAns) return;
    const correct = parseInt(userAns) === chart.answer;
    if (correct) {
      audioSynth.playCorrect();
      setFeedback('correct');
      const ns = streak + 1;
      setStreak(ns);
      if (ns >= 3 && level < 3) { setLevel(l => l + 1); setStreak(0); }
    } else {
      audioSynth.playIncorrect();
      setFeedback('wrong');
      setStreak(0);
    }
  };

  if (!chart) return null;
  const maxVal = Math.max(...chart.values);
  const highlightIdx = chart.qType === 'max' ? chart.maxIdx : chart.qType === 'min' ? chart.minIdx : feedback ? 'all' : null;

  return (
    <div className="screen-wrapper fade-in" style={{ gap: '16px', paddingTop: '10px', paddingBottom: '20px' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '92%', maxWidth: '400px' }}>
        <button className="bouncy-button secondary" onClick={onBack} style={{ padding: '10px 16px' }}>🏠</button>
        <div style={{ flex: 1, textAlign: 'center', fontWeight: '700', fontSize: '1.1rem', color: '#0f766e' }}>
          {zh ? '📊 统计图表' : '📊 Data Charts'}
        </div>
        <div style={{ background: 'linear-gradient(135deg,#5eead4,#0d9488)', color: 'white', borderRadius: '50px', padding: '6px 14px', fontSize: '0.88rem', fontWeight: '700' }}>
          Lv {level}
        </div>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(16px)',
        borderRadius: '28px', padding: '20px 16px',
        border: '2px solid rgba(255,255,255,0.7)',
        boxShadow: '0 8px 32px rgba(13,148,136,0.15)',
        width: '92%', maxWidth: '400px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
      }}>
        {/* Category title */}
        <div style={{ fontWeight: '800', fontSize: '1rem', color: '#0f766e', background: '#f0fdfa', borderRadius: '12px', padding: '6px 16px' }}>
          {zh ? chart.catDef.labelZh : chart.catDef.labelEn} {zh ? '调查表' : 'Survey'}
        </div>

        {/* Chart */}
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <BarChart labels={chart.labels} values={chart.values} highlight={feedback ? highlightIdx : null} maxVal={maxVal} />
        </div>

        {/* Question */}
        <div style={{ background: '#f0fdfa', borderRadius: '14px', padding: '12px 16px', width: '100%', textAlign: 'center', fontWeight: '700', color: '#0f766e', fontSize: '1rem' }}>
          {zh ? chart.questionZh : chart.questionEn}
        </div>

        {/* Answer input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '1rem', fontWeight: '700', color: '#0f766e' }}>{zh ? '答案 =' : 'Answer ='}</div>
          <div style={{
            minWidth: '90px', height: '54px', borderRadius: '14px',
            background: feedback === 'correct' ? '#dcfce7' : feedback === 'wrong' ? '#fee2e2' : 'rgba(240,253,250,0.8)',
            border: `3px solid ${feedback === 'correct' ? '#22c55e' : feedback === 'wrong' ? '#ef4444' : '#99f6e4'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', fontWeight: '900', color: '#0f766e',
          }}>
            {userAns || <span style={{ opacity: 0.3 }}>?</span>}
          </div>
        </div>

        {feedback && (
          <div style={{
            padding: '12px 18px', borderRadius: '16px', fontWeight: '700', fontSize: '1rem',
            width: '100%', textAlign: 'center',
            background: feedback === 'correct' ? '#dcfce7' : '#fee2e2',
            color: feedback === 'correct' ? '#16a34a' : '#dc2626',
          }}>
            {feedback === 'correct'
              ? (zh ? `🌟 读图正确！答案是 ${chart.answer}` : `🌟 Correct! The answer is ${chart.answer}`)
              : (zh ? `💡 正确答案是 ${chart.answer}，仔细看图！` : `💡 Answer: ${chart.answer}. Look at the chart carefully!`)}
          </div>
        )}
      </div>

      {!feedback && (
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
        <button className="bouncy-button primary" onClick={newChart} style={{ padding: '14px 32px', fontSize: '1.1rem' }}>
          {zh ? '下一题 ➔' : 'Next ➔'}
        </button>
      )}
    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { audioSynth } from '../utils/audioSynth';

// Simple fraction visuals
const SHAPES = ['circle', 'rect', 'pizza'];

function generateProblem(level) {
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];

  if (level === 1) {
    // Show a shaded fraction, ask what fraction it is
    const denom = Math.floor(Math.random() * 3) + 2; // 2,3,4
    const numer = Math.floor(Math.random() * (denom - 1)) + 1; // 1 to denom-1
    // Choices: correct + 3 wrong
    const wrong = new Set();
    while (wrong.size < 3) {
      const wn = Math.floor(Math.random() * (denom - 1)) + 1;
      const wd = denom + Math.floor(Math.random() * 3) - 1;
      if (wd >= 2 && `${wn}/${wd}` !== `${numer}/${denom}` && wn < wd) {
        wrong.add(`${wn}/${wd}`);
      }
    }
    const choices = [`${numer}/${denom}`, ...wrong].sort(() => Math.random() - 0.5);
    return { mode: 'read', shape, numer, denom, answer: `${numer}/${denom}`, choices };
  } else if (level === 2) {
    // Compare two fractions: same denominator
    const denom = Math.floor(Math.random() * 4) + 2; // 2-5
    let n1, n2;
    do {
      n1 = Math.floor(Math.random() * (denom - 1)) + 1;
      n2 = Math.floor(Math.random() * (denom - 1)) + 1;
    } while (n1 === n2);
    const answer = n1 > n2 ? 'left' : 'right';
    return { mode: 'compare', denom, n1, n2, answer };
  } else {
    // Fill in the missing numerator: ?/4 = shaded
    const denom = Math.floor(Math.random() * 4) + 2;
    const numer = Math.floor(Math.random() * (denom - 1)) + 1;
    return { mode: 'fill', shape, numer, denom, answer: numer };
  }
}

// Draw fraction as SVG circle slices
function FractionCircle({ numer, denom, size = 110, shadedColor = '#f59e0b', unshaded = '#e5e7eb' }) {
  const r = (size - 12) / 2;
  const cx = size / 2;
  const cy = size / 2;

  const slices = Array.from({ length: denom }, (_, i) => {
    const startAngle = (i / denom) * 2 * Math.PI - Math.PI / 2;
    const endAngle = ((i + 1) / denom) * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = 1 / denom > 0.5 ? 1 : 0;
    const d = denom === 1
      ? `M ${cx},${cy} m -${r},0 a ${r},${r} 0 1,0 ${r * 2},0 a ${r},${r} 0 1,0 -${r * 2},0`
      : `M ${cx},${cy} L ${x1},${y1} A ${r},${r} 0 ${largeArc},1 ${x2},${y2} Z`;
    return { d, shaded: i < numer };
  });

  return (
    <svg width={size} height={size}>
      {slices.map((s, i) => (
        <path key={i} d={s.d} fill={s.shaded ? shadedColor : unshaded} stroke="white" strokeWidth="2" />
      ))}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#d1d5db" strokeWidth="2" />
    </svg>
  );
}

// Draw fraction as rectangle strips
function FractionRect({ numer, denom, width = 200, height = 48, shadedColor = '#60a5fa', unshaded = '#e5e7eb' }) {
  const stripW = width / denom;
  return (
    <svg width={width} height={height}>
      {Array.from({ length: denom }, (_, i) => (
        <rect key={i} x={i * stripW + 1} y={1} width={stripW - 2} height={height - 2}
          fill={i < numer ? shadedColor : unshaded} rx="6" ry="6" stroke="white" strokeWidth="2" />
      ))}
    </svg>
  );
}

function FractionDisplay({ mode, numer, denom, shape, size = 110, colorA, colorB }) {
  if (shape === 'circle' || shape === 'pizza') return <FractionCircle numer={numer} denom={denom} size={size} shadedColor={colorA} />;
  return <FractionRect numer={numer} denom={denom} shadedColor={colorA} />;
}

export default function FractionsGame({ lang = 'zh', onBack }) {
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [problem, setProblem] = useState(null);
  const [selected, setSelected] = useState(null);
  const [fillVal, setFillVal] = useState('');
  const [feedback, setFeedback] = useState(null);

  const zh = lang === 'zh';

  const newProblem = useCallback(() => {
    setProblem(generateProblem(level));
    setSelected(null);
    setFillVal('');
    setFeedback(null);
  }, [level]);

  useEffect(() => { newProblem(); }, [newProblem]);

  const evalCorrect = (val) => {
    if (problem.mode === 'read') return val === problem.answer;
    if (problem.mode === 'compare') return val === problem.answer;
    if (problem.mode === 'fill') return parseInt(val) === problem.answer;
    return false;
  };

  const handleChoice = (val) => {
    if (feedback) return;
    audioSynth.playClick();
    setSelected(val);
    const correct = evalCorrect(val);
    if (correct) { audioSynth.playCorrect(); setFeedback('correct'); promote(); }
    else { audioSynth.playIncorrect(); setFeedback('wrong'); setStreak(0); }
  };

  const promote = () => {
    const newStreak = streak + 1;
    setStreak(newStreak);
    if (newStreak >= 4 && level < 3) { setLevel(l => l + 1); setStreak(0); }
  };

  const handlePad = (k) => {
    if (feedback) return;
    audioSynth.playClick();
    if (k === 'C') { setFillVal(''); return; }
    if (k === '✓') {
      if (!fillVal) return;
      const correct = evalCorrect(fillVal);
      if (correct) { audioSynth.playCorrect(); setFeedback('correct'); promote(); }
      else { audioSynth.playIncorrect(); setFeedback('wrong'); setStreak(0); }
      return;
    }
    if (fillVal.length < 2) setFillVal(p => p + k);
  };

  if (!problem) return null;

  const COLORS = ['#f59e0b', '#60a5fa', '#4ade80', '#f472b6'];

  const fracText = (n, d) => `${n}/${d}`;

  return (
    <div className="screen-wrapper fade-in" style={{ gap: '16px', paddingTop: '10px', paddingBottom: '20px' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '92%', maxWidth: '380px' }}>
        <button className="bouncy-button secondary" onClick={onBack} style={{ padding: '10px 16px' }}>🏠</button>
        <div style={{ flex: 1, textAlign: 'center', fontWeight: '700', fontSize: '1.1rem', color: '#be185d' }}>
          {zh ? '🍕 分数初步' : '🍕 Fractions'}
        </div>
        <div style={{ background: 'linear-gradient(135deg, #f9a8d4, #ec4899)', color: 'white', borderRadius: '50px', padding: '6px 14px', fontSize: '0.88rem', fontWeight: '700' }}>
          Lv {level}
        </div>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(16px)', borderRadius: '28px',
        padding: '24px 18px', border: '2px solid rgba(255,255,255,0.7)',
        boxShadow: '0 8px 32px rgba(236,72,153,0.15)', width: '92%', maxWidth: '380px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px',
      }}>

        {/* READ MODE */}
        {problem.mode === 'read' && (
          <>
            <div style={{ fontWeight: '700', fontSize: '1rem', color: '#9d174d' }}>
              {zh ? '阴影部分是多少分之多少？' : 'What fraction is shaded?'}
            </div>
            <FractionDisplay numer={problem.numer} denom={problem.denom} shape={problem.shape} colorA={COLORS[0]} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', width: '100%' }}>
              {problem.choices.map((c) => {
                const [cn, cd] = c.split('/').map(Number);
                const isCorrect = c === problem.answer;
                const isSelected = c === selected;
                return (
                  <button key={c} onClick={() => handleChoice(c)} style={{
                    padding: '14px', borderRadius: '16px', border: '3px solid',
                    borderColor: isSelected && !feedback ? '#ec4899' : 'transparent',
                    background: feedback
                      ? (isCorrect ? 'linear-gradient(135deg,#4ade80,#22c55e)' : isSelected ? 'linear-gradient(135deg,#fca5a5,#ef4444)' : '#f9fafb')
                      : 'linear-gradient(135deg, #fdf2f8, #fce7f3)',
                    cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                    transition: 'all 0.2s',
                  }}>
                    <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: '800', fontSize: '1.4rem', color: '#9d174d' }}>
                      {cn}/{cd}
                    </div>
                    <FractionCircle numer={cn} denom={cd} size={54} shadedColor={COLORS[1]} />
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* COMPARE MODE */}
        {problem.mode === 'compare' && (
          <>
            <div style={{ fontWeight: '700', fontSize: '1rem', color: '#9d174d' }}>
              {zh ? `哪个分数更大？（分母都是 ${problem.denom}）` : `Which fraction is larger? (Both have denominator ${problem.denom})`}
            </div>
            <div style={{ display: 'flex', gap: '20px', width: '100%' }}>
              {[{ n: problem.n1, side: 'left' }, { n: problem.n2, side: 'right' }].map(({ n, side }) => (
                <button key={side} onClick={() => handleChoice(side)} style={{
                  flex: 1, padding: '16px 8px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                  background: feedback
                    ? (problem.answer === side ? 'linear-gradient(135deg,#4ade80,#22c55e)' : 'linear-gradient(135deg,#fca5a5,#ef4444)')
                    : 'linear-gradient(135deg, #fdf2f8, #fce7f3)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                  boxShadow: '0 4px 12px rgba(236,72,153,0.15)', transition: 'all 0.2s',
                }}>
                  <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: '900', fontSize: '1.8rem', color: '#9d174d' }}>
                    {n}/{problem.denom}
                  </div>
                  <FractionCircle numer={n} denom={problem.denom} size={80} shadedColor={side === 'left' ? COLORS[0] : COLORS[1]} />
                </button>
              ))}
            </div>
          </>
        )}

        {/* FILL MODE */}
        {problem.mode === 'fill' && (
          <>
            <div style={{ fontWeight: '700', fontSize: '1rem', color: '#9d174d' }}>
              {zh ? `涂色部分是 ?/${problem.denom}，问号是多少？` : `Shaded is ?/${problem.denom}. What's the numerator?`}
            </div>
            <FractionDisplay numer={problem.numer} denom={problem.denom} shape={problem.shape} colorA={COLORS[2]} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '16px',
                background: 'rgba(253,242,248,0.8)', border: '3px solid #ec4899',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2.2rem', fontWeight: '800', color: '#9d174d',
              }}>
                {fillVal || <span style={{ opacity: 0.3 }}>?</span>}
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: '#9d174d' }}>/ {problem.denom}</div>
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
              ? (zh ? '🌟 太棒了！分数学得真好！' : '🌟 Excellent! You understand fractions!')
              : (zh
                  ? `💡 正确答案：${problem.mode === 'read' ? problem.answer : problem.mode === 'fill' ? `${problem.answer}/${problem.denom}` : (problem.answer === 'left' ? fracText(problem.n1, problem.denom) : fracText(problem.n2, problem.denom))}`
                  : `💡 Answer: ${problem.mode === 'read' ? problem.answer : problem.mode === 'fill' ? `${problem.answer}/${problem.denom}` : (problem.answer === 'left' ? fracText(problem.n1, problem.denom) : fracText(problem.n2, problem.denom))}`)}
          </div>
        )}

        {problem.mode === 'fill' && !feedback && (
          <div className="keypad-grid" style={{ maxWidth: '340px' }}>
            {['1','2','3','4','5','6','7','8','9','C','0','✓'].map(k => (
              <button key={k} className={`keypad-btn ${k === 'C' ? 'action-clear' : k === '✓' ? 'action-submit' : ''}`}
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
    </div>
  );
}

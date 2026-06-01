import React, { useState, useEffect, useCallback } from 'react';
import { audioSynth } from '../utils/audioSynth';

// Generate a shape on a grid
function makeRect(maxW, maxH) {
  const w = Math.floor(Math.random() * (maxW - 1)) + 2;
  const h = Math.floor(Math.random() * (maxH - 1)) + 2;
  return { type: 'rect', w, h, area: w * h, perimeter: 2 * (w + h) };
}

function makeL(maxW) {
  const a = Math.floor(Math.random() * (maxW - 2)) + 2;
  const b = Math.floor(Math.random() * (a - 1)) + 1;
  const c = Math.floor(Math.random() * 3) + 1;
  const d = Math.floor(Math.random() * 3) + 1;
  const area = a * c + b * d;
  const perimeter = 2 * (a + c + b + d);
  return { type: 'L', a, b, c, d, area, perimeter };
}

function generateProblem(level) {
  const mode = Math.random() > 0.5 ? 'area' : 'perimeter';
  if (level === 1) {
    const shape = makeRect(6, 6);
    return { ...shape, mode };
  } else if (level === 2) {
    const shape = makeRect(9, 9);
    return { ...shape, mode };
  } else {
    // L-shape or rectangle
    const useL = Math.random() > 0.5;
    const shape = useL ? makeL(5) : makeRect(9, 9);
    return { ...shape, mode };
  }
}

const CELL_SIZE = 32;
const GRID_COLOR = '#e0f2fe';
const FILL_COLOR = 'rgba(147,197,253,0.35)';
const STROKE_COLOR = '#3b82f6';

function RectShape({ w, h }) {
  const cw = w * CELL_SIZE;
  const ch = h * CELL_SIZE;
  return (
    <svg width={cw + 4} height={ch + 4} style={{ display: 'block' }}>
      {/* Grid */}
      {Array.from({ length: w }, (_, xi) =>
        Array.from({ length: h }, (_, yi) => (
          <rect key={`${xi}-${yi}`} x={xi * CELL_SIZE + 2} y={yi * CELL_SIZE + 2}
            width={CELL_SIZE} height={CELL_SIZE}
            fill={FILL_COLOR} stroke={GRID_COLOR} strokeWidth="1" />
        ))
      )}
      {/* Outline */}
      <rect x={2} y={2} width={cw} height={ch}
        fill="none" stroke={STROKE_COLOR} strokeWidth="2.5" />
      {/* Dimension labels */}
      <text x={cw / 2 + 2} y={ch + 3 + 14} textAnchor="middle" fontSize="14" fontWeight="700" fill="#1e40af">{w}</text>
      <text x={cw + 3 + 10} y={ch / 2 + 2} textAnchor="middle" fontSize="14" fontWeight="700" fill="#1e40af"
        transform={`rotate(90, ${cw + 3 + 10}, ${ch / 2 + 2})`}>{h}</text>
    </svg>
  );
}

export default function AreaPerimeterGame({ lang = 'zh', onBack }) {
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [problem, setProblem] = useState(null);
  const [userAns, setUserAns] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [showHint, setShowHint] = useState(false);

  const zh = lang === 'zh';

  const newProblem = useCallback(() => {
    setProblem(generateProblem(level));
    setUserAns('');
    setFeedback(null);
    setShowHint(false);
  }, [level]);

  useEffect(() => { newProblem(); }, [newProblem]);

  const handlePad = (k) => {
    if (feedback) return;
    audioSynth.playClick();
    if (k === 'C') { setUserAns(''); return; }
    if (k === '✓') { submit(); return; }
    if (userAns.length < 4) setUserAns(p => p + k);
  };

  const submit = () => {
    if (!problem || !userAns) return;
    const ans = problem.mode === 'area' ? problem.area : problem.perimeter;
    const correct = parseInt(userAns) === ans;
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

  if (!problem) return null;

  const ans = problem.mode === 'area' ? problem.area : problem.perimeter;
  const isArea = problem.mode === 'area';

  const hintArea = problem.type === 'rect'
    ? (zh ? `面积 = 长 × 宽 = ${problem.w} × ${problem.h} = ${problem.area} 格` : `Area = length × width = ${problem.w} × ${problem.h} = ${problem.area} squares`)
    : '';
  const hintPerim = problem.type === 'rect'
    ? (zh ? `周长 = (长 + 宽) × 2 = (${problem.w} + ${problem.h}) × 2 = ${problem.perimeter}` : `Perimeter = (${problem.w}+${problem.h})×2 = ${problem.perimeter}`)
    : '';

  return (
    <div className="screen-wrapper fade-in" style={{ gap: '16px', paddingTop: '10px', paddingBottom: '20px' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '92%', maxWidth: '380px' }}>
        <button className="bouncy-button secondary" onClick={onBack} style={{ padding: '10px 16px' }}>🏠</button>
        <div style={{ flex: 1, textAlign: 'center', fontWeight: '700', fontSize: '1.1rem', color: '#7c3aed' }}>
          {zh ? '📐 面积与周长' : '📐 Area & Perimeter'}
        </div>
        <div style={{ background: 'linear-gradient(135deg,#c4b5fd,#7c3aed)', color: 'white', borderRadius: '50px', padding: '6px 14px', fontSize: '0.88rem', fontWeight: '700' }}>
          Lv {level}
        </div>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(16px)',
        borderRadius: '28px', padding: '24px 16px',
        border: '2px solid rgba(255,255,255,0.7)',
        boxShadow: '0 8px 32px rgba(124,58,237,0.15)',
        width: '92%', maxWidth: '380px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px',
      }}>
        {/* Mode badge */}
        <div style={{
          background: isArea ? 'linear-gradient(135deg,#ddd6fe,#7c3aed)' : 'linear-gradient(135deg,#fde68a,#f59e0b)',
          color: 'white', borderRadius: '50px', padding: '8px 20px',
          fontSize: '1rem', fontWeight: '800',
        }}>
          {isArea ? (zh ? '🔲 计算面积（格子数）' : '🔲 Calculate Area') : (zh ? '📏 计算周长（边长之和）' : '📏 Calculate Perimeter')}
        </div>

        {/* Shape */}
        <div style={{ overflowX: 'auto', padding: '8px 0' }}>
          {problem.type === 'rect' && <RectShape w={problem.w} h={problem.h} />}
        </div>

        {/* Hint */}
        <button className="bouncy-button secondary" onClick={() => setShowHint(s => !s)} style={{ fontSize: '0.88rem', padding: '7px 16px' }}>
          {zh ? (showHint ? '🙈 收起公式' : '💡 公式提示') : (showHint ? '🙈 Hide Formula' : '💡 Formula Hint')}
        </button>

        {showHint && (
          <div style={{ background: '#f5f3ff', borderRadius: '14px', padding: '12px 16px', width: '100%', fontSize: '0.9rem', color: '#5b21b6', fontWeight: '700', lineHeight: 1.5 }}>
            {isArea ? (zh ? '面积 = 长 × 宽\n每个格子就是 1 平方单位' : 'Area = length × width\nEach grid square = 1 unit²') : hintPerim || (zh ? '周长 = 所有边长相加' : 'Perimeter = sum of all sides')}
          </div>
        )}

        {/* Answer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '1rem', fontWeight: '700', color: '#5b21b6' }}>
            {isArea ? (zh ? '面积 =' : 'Area =') : (zh ? '周长 =' : 'Perimeter =')}
          </div>
          <div style={{
            minWidth: '90px', height: '54px', borderRadius: '14px',
            background: feedback === 'correct' ? '#dcfce7' : feedback === 'wrong' ? '#fee2e2' : 'rgba(237,233,254,0.6)',
            border: `3px solid ${feedback === 'correct' ? '#22c55e' : feedback === 'wrong' ? '#ef4444' : '#c4b5fd'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', fontWeight: '900', color: '#5b21b6',
          }}>
            {userAns || <span style={{ opacity: 0.3 }}>?</span>}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>{isArea ? (zh ? '格' : 'sq') : ''}</div>
        </div>

        {feedback && (
          <div style={{
            padding: '12px 18px', borderRadius: '16px', fontWeight: '700', fontSize: '1rem',
            width: '100%', textAlign: 'center',
            background: feedback === 'correct' ? '#dcfce7' : '#fee2e2',
            color: feedback === 'correct' ? '#16a34a' : '#dc2626',
          }}>
            {feedback === 'correct'
              ? (zh ? `🌟 正确！${isArea ? `面积是 ${ans} 格` : `周长是 ${ans}`}` : `🌟 Correct! ${isArea ? `Area = ${ans}` : `Perimeter = ${ans}`}`)
              : (zh ? `💡 答案是 ${ans}，${isArea ? hintArea : hintPerim}` : `💡 Answer: ${ans}. ${isArea ? hintArea : hintPerim}`)}
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
        <button className="bouncy-button primary" onClick={newProblem} style={{ padding: '14px 32px', fontSize: '1.1rem' }}>
          {zh ? '下一题 ➔' : 'Next ➔'}
        </button>
      )}
    </div>
  );
}

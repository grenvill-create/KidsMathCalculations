import React, { useState, useEffect, useCallback } from 'react';
import { audioSynth } from '../utils/audioSynth';

// Generate a shape on a grid
function makeRect(maxW, maxH) {
  const w = Math.floor(Math.random() * (maxW - 1)) + 2;
  const h = Math.floor(Math.random() * (maxH - 1)) + 2;
  return { type: 'rect', w, h, area: w * h, perimeter: 2 * (w + h) };
}

function makeL(maxW) {
  const a = Math.floor(Math.random() * (maxW - 2)) + 3; // ensure enough width for nice shapes (3 to maxW)
  const b = Math.floor(Math.random() * (a - 2)) + 1; // ensure b < a - 1
  const c = Math.floor(Math.random() * 2) + 1; // 1 to 2
  const d = Math.floor(Math.random() * 2) + 1; // 1 to 2
  const area = a * c + b * d;
  // Mathematically correct perimeter of an L-shape:
  // Horizontals: bottom = a, top = b, ledge = a - b. Total horizontal = 2a.
  // Verticals: left = c + d, right-bottom = c, right-top = d. Total vertical = 2(c + d).
  // Total perimeter = 2 * (a + c + d)
  const perimeter = 2 * (a + c + d);
  return { type: 'L', a, b, c, d, area, perimeter };
}

function generateProblem(level) {
  const mode = Math.random() > 0.5 ? 'area' : 'perimeter';
  if (level === 1) {
    const shape = makeRect(5, 5);
    return { ...shape, mode };
  } else if (level === 2) {
    const shape = makeRect(8, 8);
    return { ...shape, mode };
  } else {
    // L-shape or rectangle
    const useL = Math.random() > 0.5;
    const shape = useL ? makeL(6) : makeRect(8, 8);
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
    <svg width={cw + 40} height={ch + 40} style={{ display: 'block', margin: '0 auto' }}>
      {/* Grid */}
      {Array.from({ length: w }, (_, xi) =>
        Array.from({ length: h }, (_, yi) => (
          <rect key={`${xi}-${yi}`} x={xi * CELL_SIZE + 20} y={yi * CELL_SIZE + 20}
            width={CELL_SIZE} height={CELL_SIZE}
            fill={FILL_COLOR} stroke={GRID_COLOR} strokeWidth="1" />
        ))
      )}
      {/* Outline */}
      <rect x={20} y={20} width={cw} height={ch}
        fill="none" stroke={STROKE_COLOR} strokeWidth="2.5" />
      {/* Dimension labels */}
      {/* Bottom side (width w) */}
      <text x={cw / 2 + 20} y={ch + 20 + 16} textAnchor="middle" fontSize="13" fontWeight="700" fill="#1e40af">{w}</text>
      {/* Right side (height h) */}
      <text x={cw + 20 + 12} y={ch / 2 + 20 + 4} textAnchor="middle" fontSize="13" fontWeight="700" fill="#1e40af">{h}</text>
    </svg>
  );
}

function LShape({ a, b, c, d }) {
  const cw = a * CELL_SIZE;
  const ch = (c + d) * CELL_SIZE;
  
  const pathData = `M 20,20 
                    L ${b * CELL_SIZE + 20},20 
                    L ${b * CELL_SIZE + 20},${d * CELL_SIZE + 20} 
                    L ${a * CELL_SIZE + 20},${d * CELL_SIZE + 20} 
                    L ${a * CELL_SIZE + 20},${ch + 20} 
                    L 20,${ch + 20} 
                    Z`;

  return (
    <svg width={cw + 40} height={ch + 40} style={{ display: 'block', margin: '0 auto' }}>
      {/* Grid squares */}
      {Array.from({ length: a }, (_, xi) =>
        Array.from({ length: c + d }, (_, yi) => {
          const isInside = (xi < b && yi < d) || (yi >= d);
          if (!isInside) return null;
          return (
            <rect key={`${xi}-${yi}`} x={xi * CELL_SIZE + 20} y={yi * CELL_SIZE + 20}
              width={CELL_SIZE} height={CELL_SIZE}
              fill={FILL_COLOR} stroke={GRID_COLOR} strokeWidth="1" />
          );
        })
      )}
      
      {/* Outline */}
      <path d={pathData} fill="none" stroke={STROKE_COLOR} strokeWidth="2.5" strokeLinejoin="round" />
      
      {/* Labels */}
      {/* Top side (length b) */}
      <text x={(b * CELL_SIZE) / 2 + 20} y={14} textAnchor="middle" fontSize="13" fontWeight="700" fill="#1e40af">{b}</text>
      
      {/* Left side (length c + d) */}
      <text x={10} y={(ch) / 2 + 20 + 4} textAnchor="middle" fontSize="13" fontWeight="700" fill="#1e40af">{c + d}</text>
      
      {/* Bottom side (length a) */}
      <text x={(cw) / 2 + 20} y={ch + 20 + 16} textAnchor="middle" fontSize="13" fontWeight="700" fill="#1e40af">{a}</text>
      
      {/* Right side bottom (length c) */}
      <text x={cw + 20 + 10} y={ch - (c * CELL_SIZE) / 2 + 20 + 4} textAnchor="middle" fontSize="13" fontWeight="700" fill="#1e40af">{c}</text>

      {/* Right side top vertical (length d) */}
      <text x={b * CELL_SIZE + 20 + 10} y={(d * CELL_SIZE) / 2 + 20 + 4} textAnchor="middle" fontSize="13" fontWeight="700" fill="#1e40af">{d}</text>

      {/* Inner horizontal ledge (length a - b) */}
      <text x={((a + b) * CELL_SIZE) / 2 + 20} y={d * CELL_SIZE + 20 - 4} textAnchor="middle" fontSize="13" fontWeight="700" fill="#1e40af">{a - b}</text>
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
    : (zh ? `面积 = 上半部分面积 + 下半部分面积 = (${problem.b} × ${problem.d}) + (${problem.a} × ${problem.c}) = ${problem.b * problem.d} + ${problem.a * problem.c} = ${problem.area} 格` : `Area = top part + bottom part = (${problem.b} × ${problem.d}) + (${problem.a} × ${problem.c}) = ${problem.b * problem.d} + ${problem.a * problem.c} = ${problem.area} squares`);

  const hintPerim = problem.type === 'rect'
    ? (zh ? `周长 = (长 + 宽) × 2 = (${problem.w} + ${problem.h}) × 2 = ${problem.perimeter}` : `Perimeter = (${problem.w} + ${problem.h}) × 2 = ${problem.perimeter}`)
    : (zh ? `周长 = 各条外圈边界线长度之和 = ${problem.b} (上) + ${problem.d} (右上) + ${problem.a - problem.b} (台阶) + ${problem.c} (右下) + ${problem.a} (下) + ${problem.c + problem.d} (左) = ${problem.perimeter}` : `Perimeter = sum of all outer sides = ${problem.b} (top) + ${problem.d} (right-top) + ${problem.a - problem.b} (ledge) + ${problem.c} (right-bottom) + ${problem.a} (bottom) + ${problem.c + problem.d} (left) = ${problem.perimeter}`);

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
        borderRadius: '28px', padding: '20px 16px',
        border: '2px solid rgba(255,255,255,0.7)',
        boxShadow: '0 8px 32px rgba(124,58,237,0.15)',
        width: '92%', maxWidth: '380px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
      }}>
        {/* Mode badge */}
        <div style={{
          background: isArea ? 'linear-gradient(135deg,#ddd6fe,#7c3aed)' : 'linear-gradient(135deg,#fde68a,#f59e0b)',
          color: 'white', borderRadius: '50px', padding: '8px 20px',
          fontSize: '1rem', fontWeight: '800',
          textAlign: 'center', width: '100%'
        }}>
          {isArea ? (zh ? '🔲 计算面积（格子数）' : '🔲 Calculate Area') : (zh ? '📏 计算周长（边长之和）' : '📏 Calculate Perimeter')}
        </div>

        {/* Detailed Grid Unit Explanation */}
        <div style={{
          fontSize: '0.82rem',
          color: '#4b5563',
          background: '#f3f4f6',
          borderRadius: '12px',
          padding: '8px 12px',
          textAlign: 'left',
          width: '100%',
          lineHeight: 1.4,
          fontWeight: '600'
        }}>
          {zh ? (
            <div>
              💡 <strong>格子长度说明：</strong>
              <br />
              图形边缘标记的数字代表其包含的<strong>小格子段数</strong>（每个小格子的<strong>边长为 1 单位长度</strong>，<strong>面积为 1 平方单位</strong>）。
            </div>
          ) : (
            <div>
              💡 <strong>Grid Unit Guide:</strong>
              <br />
              The numbers represent the <strong>number of grid segment units</strong> (each grid square has a <strong>side length of 1</strong> and <strong>area of 1</strong>).
            </div>
          )}
        </div>

        {/* Shape */}
        <div style={{ overflowX: 'auto', padding: '8px 0', width: '100%', display: 'flex', justifyContent: 'center' }}>
          {problem.type === 'rect' && <RectShape w={problem.w} h={problem.h} />}
          {problem.type === 'L' && <LShape a={problem.a} b={problem.b} c={problem.c} d={problem.d} />}
        </div>

        {/* Hint Button */}
        <button className="bouncy-button secondary" onClick={() => setShowHint(s => !s)} style={{ fontSize: '0.88rem', padding: '7px 16px' }}>
          {zh ? (showHint ? '🙈 收起提示' : '💡 解题提示') : (showHint ? '🙈 Hide Hint' : '💡 View Hint')}
        </button>

        {showHint && (
          <div style={{ background: '#f5f3ff', borderRadius: '14px', padding: '12px 16px', width: '100%', fontSize: '0.88rem', color: '#5b21b6', fontWeight: '700', lineHeight: 1.5 }}>
            {isArea ? (
              zh ? (
                <div>
                  <p style={{ margin: '0 0 4px 0' }}>🔹 <strong>面积（Area）：</strong> 内部蓝色格子的总数。</p>
                  <p style={{ margin: '0 0 8px 0', fontSize: '0.8rem', color: '#7c3aed' }}>每个格子 = 1 平方单位</p>
                  <p style={{ margin: '0 0 4px 0' }}><strong>计算方法：</strong></p>
                  <p style={{ margin: '0', background: 'rgba(255,255,255,0.6)', padding: '6px', borderRadius: '8px', fontFamily: 'monospace' }}>
                    {hintArea}
                  </p>
                </div>
              ) : (
                <div>
                  <p style={{ margin: '0 0 4px 0' }}>🔹 <strong>Area:</strong> Total number of blue grid squares inside.</p>
                  <p style={{ margin: '0 0 8px 0', fontSize: '0.8rem', color: '#7c3aed' }}>Each grid square = 1 unit²</p>
                  <p style={{ margin: '0 0 4px 0' }}><strong>Formula & Calculation:</strong></p>
                  <p style={{ margin: '0', background: 'rgba(255,255,255,0.6)', padding: '6px', borderRadius: '8px', fontFamily: 'monospace' }}>
                    {hintArea}
                  </p>
                </div>
              )
            ) : (
              zh ? (
                <div>
                  <p style={{ margin: '0 0 4px 0' }}>🔹 <strong>周长（Perimeter）：</strong> 外围所有蓝色边缘线段的总长度。</p>
                  <p style={{ margin: '0 0 8px 0', fontSize: '0.8rem', color: '#7c3aed' }}>每一小段格边 = 1 长度单位</p>
                  <p style={{ margin: '0 0 4px 0' }}><strong>计算方法：</strong></p>
                  <p style={{ margin: '0', background: 'rgba(255,255,255,0.6)', padding: '6px', borderRadius: '8px', fontFamily: 'monospace' }}>
                    {hintPerim}
                  </p>
                </div>
              ) : (
                <div>
                  <p style={{ margin: '0 0 4px 0' }}>🔹 <strong>Perimeter:</strong> Sum of all outer border segment lengths.</p>
                  <p style={{ margin: '0 0 8px 0', fontSize: '0.8rem', color: '#7c3aed' }}>Each grid segment = 1 unit</p>
                  <p style={{ margin: '0 0 4px 0' }}><strong>Formula & Calculation:</strong></p>
                  <p style={{ margin: '0', background: 'rgba(255,255,255,0.6)', padding: '6px', borderRadius: '8px', fontFamily: 'monospace' }}>
                    {hintPerim}
                  </p>
                </div>
              )
            )}
          </div>
        )}

        {/* Answer Box */}
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
          <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
            {isArea ? (zh ? '平方单位' : 'sq units') : (zh ? '单位' : 'units')}
          </div>
        </div>

        {feedback && (
          <div style={{
            padding: '12px 18px', borderRadius: '16px', fontWeight: '700', fontSize: '0.95rem',
            width: '100%', textAlign: 'left',
            background: feedback === 'correct' ? '#dcfce7' : '#fee2e2',
            color: feedback === 'correct' ? '#16a34a' : '#dc2626',
            lineHeight: 1.4
          }}>
            {feedback === 'correct'
              ? (zh ? `🌟 太棒了！答对啦！${isArea ? `面积是 ${ans} 平方单位` : `周长是 ${ans} 单位`}` : `🌟 Correct! ${isArea ? `Area = ${ans}` : `Perimeter = ${ans}`}`)
              : (zh ? `💡 回答错误，别气馁！正确答案是 ${ans}。\n解题方法：\n${isArea ? hintArea : hintPerim}` : `💡 Keep trying! Correct answer is ${ans}.\nCalculation:\n${isArea ? hintArea : hintPerim}`)}
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


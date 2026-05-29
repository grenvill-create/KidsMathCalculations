import React, { useState, useEffect, useCallback } from 'react';
import { audioSynth } from '../utils/audioSynth';

// Multiplication table 1-9
function generateProblem(level) {
  const maxA = level === 1 ? 5 : level === 2 ? 7 : 9;
  const a = Math.floor(Math.random() * maxA) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  const answer = a * b;

  // Generate 3 wrong choices
  const wrong = new Set();
  while (wrong.size < 3) {
    const w = Math.floor(Math.random() * (maxA * 9)) + 1;
    if (w !== answer) wrong.add(w);
  }
  const choices = [answer, ...wrong].sort((x, y) => x - y);
  return { a, b, answer, choices };
}

const TABLE_COLORS = [
  'linear-gradient(135deg, #fde68a, #f59e0b)',
  'linear-gradient(135deg, #bbf7d0, #22c55e)',
  'linear-gradient(135deg, #bfdbfe, #3b82f6)',
  'linear-gradient(135deg, #fecdd3, #ef4444)',
];

export default function MultiplicationTableGame({ lang = 'zh', onBack }) {
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [problem, setProblem] = useState(null);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const [focusedRow, setFocusedRow] = useState(null);

  const zh = lang === 'zh';

  const newProblem = useCallback(() => {
    const p = generateProblem(level);
    setProblem(p);
    setSelected(null);
    setFeedback(null);
    setFocusedRow(p.a);
  }, [level]);

  useEffect(() => { newProblem(); }, [newProblem]);

  const handleSelect = (val) => {
    if (feedback) return;
    audioSynth.playClick();
    setSelected(val);
    const correct = val === problem.answer;
    if (correct) {
      audioSynth.playCorrect();
      setFeedback('correct');
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak >= 5 && level < 3) { setLevel(l => l + 1); setStreak(0); }
    } else {
      audioSynth.playIncorrect();
      setFeedback('wrong');
      setStreak(0);
    }
  };

  if (!problem) return null;

  const gridBtnStyle = (val) => {
    const isCorrect = val === problem.answer;
    const isSelected = val === selected;
    let bg = TABLE_COLORS[val % 4];
    if (feedback) {
      if (isCorrect) bg = 'linear-gradient(135deg,#4ade80,#22c55e)';
      else if (isSelected && !isCorrect) bg = 'linear-gradient(135deg,#fca5a5,#ef4444)';
    }
    return {
      padding: '14px 8px', borderRadius: '16px', border: 'none', cursor: 'pointer',
      fontFamily: 'Fredoka, sans-serif', fontWeight: '800', fontSize: '1.6rem', color: '#1e293b',
      background: bg, boxShadow: '0 3px 10px rgba(0,0,0,0.12)',
      transform: isSelected ? 'scale(0.93)' : 'scale(1)', transition: 'all 0.2s',
      flex: 1,
    };
  };

  return (
    <div className="screen-wrapper fade-in" style={{ gap: '16px', paddingTop: '10px', paddingBottom: '20px' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '92%', maxWidth: '380px' }}>
        <button className="bouncy-button secondary" onClick={onBack} style={{ padding: '10px 16px' }}>🏠</button>
        <div style={{ flex: 1, textAlign: 'center', fontWeight: '700', fontSize: '1.1rem', color: '#92400e' }}>
          {zh ? '✖️ 乘法口诀' : '✖️ Times Tables'}
        </div>
        <div style={{ background: 'linear-gradient(135deg, #fcd34d, #d97706)', color: 'white', borderRadius: '50px', padding: '6px 14px', fontSize: '0.88rem', fontWeight: '700' }}>
          Lv {level}
        </div>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(16px)', borderRadius: '28px',
        padding: '24px 18px', border: '2px solid rgba(255,255,255,0.7)',
        boxShadow: '0 8px 32px rgba(245,158,11,0.18)', width: '92%', maxWidth: '380px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px',
      }}>
        {/* Problem */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.9rem', color: '#92400e', fontWeight: '700', marginBottom: '8px' }}>
            {zh ? '请选出正确答案：' : 'Choose the correct answer:'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
            {[problem.a, '×', problem.b, '=', '?'].map((part, i) => (
              <div key={i} style={{
                padding: part === '×' || part === '=' ? '0 2px' : '10px 18px',
                borderRadius: '14px',
                background: part === '×' ? 'none' : part === '=' ? 'none'
                  : part === '?' ? 'rgba(253,230,138,0.5)' : 'linear-gradient(135deg, #fde68a, #f59e0b)',
                fontSize: typeof part === 'number' ? '2.6rem' : '2rem',
                fontWeight: '900',
                color: typeof part === 'number' ? '#78350f' : '#b45309',
                boxShadow: typeof part === 'number' ? '0 4px 12px rgba(245,158,11,0.3)' : 'none',
                border: part === '?' ? '3px dashed #f59e0b' : 'none',
              }}>
                {part}
              </div>
            ))}
          </div>
        </div>

        {/* Choices */}
        <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
          {problem.choices.map(val => (
            <button key={val} onClick={() => handleSelect(val)} style={gridBtnStyle(val)}>
              {val}
            </button>
          ))}
        </div>

        {/* Mini multiplication table toggle */}
        <button className="bouncy-button secondary" onClick={() => setShowTable(s => !s)} style={{ fontSize: '0.88rem', padding: '7px 16px' }}>
          {zh ? (showTable ? '🙈 收起口诀表' : '📊 查看口诀表') : (showTable ? '🙈 Hide Table' : '📊 Times Table')}
        </button>

        {showTable && (
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', fontSize: '0.75rem', width: '100%', textAlign: 'center' }}>
              <tbody>
                {Array.from({ length: 9 }, (_, ri) => ri + 1).map(row => (
                  <tr key={row} style={{ background: row === focusedRow ? '#fef3c7' : row % 2 === 0 ? '#f9fafb' : 'white' }}>
                    <td style={{ fontWeight: '800', color: '#92400e', padding: '4px 6px', background: row === focusedRow ? '#fde68a' : '#f3f4f6' }}>{row}</td>
                    {Array.from({ length: 9 }, (_, ci) => ci + 1).map(col => (
                      <td key={col} style={{
                        padding: '4px 4px', fontWeight: row === focusedRow ? '800' : '500',
                        color: row === focusedRow ? '#78350f' : '#374151',
                        background: row === focusedRow && col === problem.b ? '#f59e0b' : 'inherit',
                        borderRadius: row === focusedRow && col === problem.b ? '6px' : '0',
                      }}>
                        {row * col}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {feedback && (
          <div style={{
            padding: '12px 20px', borderRadius: '16px', fontWeight: '700', fontSize: '1rem', width: '100%', textAlign: 'center',
            background: feedback === 'correct' ? '#dcfce7' : '#fee2e2',
            color: feedback === 'correct' ? '#16a34a' : '#dc2626',
          }}>
            {feedback === 'correct'
              ? (zh ? `🌟 答对！${problem.a} × ${problem.b} = ${problem.answer}` : `🌟 Correct! ${problem.a} × ${problem.b} = ${problem.answer}`)
              : (zh ? `💡 ${problem.a} × ${problem.b} = ${problem.answer}，记住这个口诀！` : `💡 ${problem.a} × ${problem.b} = ${problem.answer}. Remember this!`)}
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

import React, { useState, useCallback } from 'react';
import { audioSynth } from '../utils/audioSynth';

function generateProblem() {
  const used = new Set();
  const nums = [];
  while (nums.length < 4) {
    const n = Math.floor(Math.random() * 15) + 1;
    if (!used.has(n)) { used.add(n); nums.push(n); }
  }
  return nums; // shuffled by natural randomness
}

export default function NumberSortGame() {
  const [nums, setNums] = useState(() => generateProblem());
  const [selected, setSelected] = useState([]); // indices in order selected
  const [wrongIdx, setWrongIdx] = useState(null);
  const [sessionCount, setSessionCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const sorted = [...nums].sort((a, b) => a - b);

  const next = useCallback(() => {
    setNums(generateProblem());
    setSelected([]);
    setWrongIdx(null);
  }, []);

  const handleTap = (idx) => {
    if (selected.includes(idx) || wrongIdx !== null) return;
    const nextVal = sorted[selected.length];
    if (nums[idx] === nextVal) {
      const newSel = [...selected, idx];
      setSelected(newSel);
      if (newSel.length === nums.length) {
        audioSynth.playCorrect();
        setSessionCount(p => p + 1);
        setCorrectCount(p => p + 1);
        setTimeout(next, 1400);
      }
    } else {
      setWrongIdx(idx);
      audioSynth.playIncorrect();
      setSessionCount(p => p + 1);
      setTimeout(() => { setSelected([]); setWrongIdx(null); }, 900);
    }
  };

  const getStyle = (idx) => {
    const rank = selected.indexOf(idx);
    const isSelected = rank !== -1;
    const isWrong = idx === wrongIdx;
    let bg = 'linear-gradient(135deg, #fff0f6, white)';
    let border = '#f5c0d0';
    let color = '#c06080';
    let scale = 'scale(1)';
    if (isSelected) { bg = 'linear-gradient(135deg, #4ade80, #22c55e)'; border = '#16a34a'; color = 'white'; scale = 'scale(0.95)'; }
    if (isWrong) { bg = 'linear-gradient(135deg, #f87171, #ef4444)'; border = '#dc2626'; color = 'white'; }
    return {
      width: '72px', height: '72px', borderRadius: '50%',
      border: `3px solid ${border}`, background: bg, color,
      fontWeight: '700', fontSize: '1.8rem',
      cursor: isSelected ? 'default' : 'pointer',
      fontFamily: 'Fredoka, sans-serif',
      boxShadow: isSelected ? '0 4px 12px rgba(34,197,94,0.35)' : '0 4px 12px rgba(255,93,158,0.15)',
      transition: 'all 0.2s ease',
      transform: scale,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      position: 'relative',
    };
  };

  return (
    <div className="screen-wrapper fade-in" style={{ justifyContent: 'flex-start', gap: '20px', paddingBottom: '20px', overflowY: 'auto' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '1.3rem', fontWeight: '700', color: '#c0487a', marginBottom: '4px' }}>
          🔢 从小到大，按顺序点一点！
        </div>
        <div style={{ fontSize: '0.9rem', color: '#d4879e', fontWeight: '600' }}>
          📝 本次 {sessionCount} 题 · ✅ 答对 {correctCount} 题
        </div>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.7)', borderRadius: '28px',
        padding: '20px 16px', width: '100%', maxWidth: '380px',
        boxShadow: '0 8px 30px rgba(255,93,158,0.1)', border: '2.5px solid rgba(255,255,255,0.9)',
        textAlign: 'center',
      }}>
        <div style={{ opacity: 0.6, fontSize: '0.9rem', marginBottom: '16px', color: '#c07090', fontWeight: '600' }}>
          提示：从最小的数字开始点 👇
        </div>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {nums.map((n, idx) => (
            <button key={idx} onClick={() => handleTap(idx)} style={getStyle(idx)}>
              {n}
              {selected.indexOf(idx) !== -1 && (
                <span style={{ position: 'absolute', top: -8, right: -8, fontSize: '0.75rem',
                  background: '#16a34a', color: 'white', borderRadius: '50%',
                  width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '700',
                }}>{selected.indexOf(idx) + 1}</span>
              )}
            </button>
          ))}
        </div>
        {selected.length === nums.length && (
          <div style={{ marginTop: '16px', fontSize: '1rem', color: '#22c55e', fontWeight: '700', opacity: 0.9 }} className="bounce-in">
            🎉 太棒了！正确顺序：{sorted.join(' → ')}
          </div>
        )}
      </div>
    </div>
  );
}

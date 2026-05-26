import React, { useState, useEffect, useCallback } from 'react';
import { audioSynth } from '../utils/audioSynth';

function generateProblem(level) {
  const items = [];
  const usedVals = new Set();

  if (level === 1) {
    // Easy: Sort 3 simple numbers within 10
    while (items.length < 3) {
      const n = Math.floor(Math.random() * 9) + 1;
      if (!usedVals.has(n)) {
        usedVals.add(n);
        items.push({ display: n.toString(), val: n });
      }
    }
  } else if (level === 2) {
    // Medium: Sort 4 numbers within 30
    while (items.length < 4) {
      const n = Math.floor(Math.random() * 29) + 1;
      if (!usedVals.has(n)) {
        usedVals.add(n);
        items.push({ display: n.toString(), val: n });
      }
    }
  } else {
    // Hard: Sort 4 items, 2 simple numbers and 2 equations
    // Simple numbers
    while (items.length < 2) {
      const n = Math.floor(Math.random() * 19) + 1;
      if (!usedVals.has(n)) {
        usedVals.add(n);
        items.push({ display: n.toString(), val: n });
      }
    }
    // Equations
    while (items.length < 4) {
      const isAdd = Math.random() > 0.5;
      let a, b, val, display;
      if (isAdd) {
        a = Math.floor(Math.random() * 9) + 1;
        b = Math.floor(Math.random() * 9) + 1;
        val = a + b;
        display = `${a}+${b}`;
      } else {
        val = Math.floor(Math.random() * 9) + 1;
        b = Math.floor(Math.random() * 8) + 1;
        a = val + b;
        display = `${a}-${b}`;
      }
      if (!usedVals.has(val)) {
        usedVals.add(val);
        items.push({ display, val });
      }
    }
  }

  // Shuffle items
  return items.sort(() => Math.random() - 0.5);
}

export default function NumberSortGame({ autoAdvance, lang = 'zh', difficultyMode = 'adaptive' }) {
  const [adaptiveLevel, setAdaptiveLevel] = useState(1);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);

  const level = difficultyMode === 'easy' ? 1 : 
                difficultyMode === 'medium' ? 2 : 
                difficultyMode === 'hard' ? 3 : adaptiveLevel;

  const [items, setItems] = useState(() => generateProblem(level));
  const [selected, setSelected] = useState([]); // indices in order selected
  const [wrongIdx, setWrongIdx] = useState(null);
  const [sessionCount, setSessionCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  // Sorted items based on numeric value
  const sorted = [...items].sort((a, b) => a.val - b.val);

  const next = useCallback(() => {
    setItems(generateProblem(level));
    setSelected([]);
    setWrongIdx(null);
  }, [level]);

  useEffect(() => {
    next();
  }, [level, next]);

  const handleTap = (idx) => {
    if (selected.includes(idx) || wrongIdx !== null) return;
    const nextVal = sorted[selected.length].val;
    if (items[idx].val === nextVal) {
      const newSel = [...selected, idx];
      setSelected(newSel);
      if (newSel.length === items.length) {
        audioSynth.playCorrect();
        setSessionCount(p => p + 1);
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
          setTimeout(next, 1400);
        }
      }
    } else {
      setWrongIdx(idx);
      audioSynth.playIncorrect();
      setSessionCount(p => p + 1);
      if (difficultyMode === 'adaptive') {
        setConsecutiveCorrect(0);
        if (adaptiveLevel > 1) {
          setAdaptiveLevel(l => l - 1);
        }
      }
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
      width: level === 3 ? '84px' : '72px', height: level === 3 ? '84px' : '72px', borderRadius: '50%',
      border: `3px solid ${border}`, background: bg, color,
      fontWeight: '700', fontSize: level === 3 ? '1.3rem' : '1.8rem',
      cursor: isSelected ? 'default' : 'pointer',
      fontFamily: 'Fredoka, sans-serif',
      boxShadow: isSelected ? '0 4px 12px rgba(34,197,94,0.35)' : '0 4px 12px rgba(255,93,158,0.15)',
      transition: 'all 0.2s ease',
      transform: scale,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      position: 'relative',
    };
  };

  const isEn = lang === 'en';

  return (
    <div className="screen-wrapper fade-in" style={{ justifyContent: 'flex-start', gap: '20px', paddingBottom: '20px', overflowY: 'auto' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '1.3rem', fontWeight: '600', color: '#c0487a', marginBottom: '4px' }}>
          {isEn ? '🔢 Sort from smallest to largest!' : '🔢 从小到大，按顺序点一点！'}
        </div>
        <div style={{ fontSize: '0.9rem', color: '#d4879e', fontWeight: '600' }}>
          {isEn
            ? `📝 Total: ${sessionCount} · ✅ Correct: ${correctCount}`
            : `📝 本次 ${sessionCount} 题 · ✅ 答对 ${correctCount} 题`}
        </div>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.7)', borderRadius: '28px',
        padding: '20px 16px', width: '100%', maxWidth: '380px',
        boxShadow: '0 8px 30px rgba(255,93,158,0.1)', border: '2.5px solid rgba(255,255,255,0.9)',
        textAlign: 'center',
      }}>
        <div style={{ opacity: 0.6, fontSize: '0.9rem', marginBottom: '16px', color: '#c07090', fontWeight: '600' }}>
          {isEn ? 'Tip: Start tapping from the smallest number 👇' : '提示：从最小的数字开始点 👇'}
        </div>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {items.map((item, idx) => (
            <button key={idx} onClick={() => handleTap(idx)} style={getStyle(idx)}>
              <span>{item.display}</span>
              {selected.indexOf(idx) !== -1 && (
                <span style={{ position: 'absolute', top: -8, right: -8, fontSize: '0.75rem',
                  background: '#16a34a', color: 'white', borderRadius: '50%',
                  width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '600',
                }}>{selected.indexOf(idx) + 1}</span>
              )}
            </button>
          ))}
        </div>
        {selected.length === items.length && (
          <div className="bounce-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '16px' }}>
            <div style={{ fontSize: '1.1rem', color: '#22c55e', fontWeight: '600', opacity: 0.9 }}>
              {isEn 
                ? `🎉 Excellent! Correct order: ${sorted.map(s => `${s.display}(${s.val})`).join(' → ')}` 
                : `🎉 太棒了！正确顺序：${sorted.map(s => `${s.display}(${s.val})`).join(' → ')}`}
            </div>
            {!autoAdvance && (
              <button
                onClick={next}
                style={{
                  marginTop: '12px',
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
    </div>
  );
}

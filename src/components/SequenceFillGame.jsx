import React, { useState, useEffect, useCallback } from 'react';
import { audioSynth } from '../utils/audioSynth';

function generateProblem(level) {
  let seq = [];
  let answer;
  let blankIdx;
  
  if (level === 1) {
    // Easy: Forward count step 1, within 10
    const start = Math.floor(Math.random() * 5) + 1;
    seq = Array.from({ length: 5 }, (_, i) => start + i);
    blankIdx = 1 + Math.floor(Math.random() * 3);
    answer = seq[blankIdx];
  } else if (level === 2) {
    // Medium: Forward step 2/5 or backward step 1, within 30
    const mode = Math.random() > 0.5 ? 'forward' : 'backward';
    if (mode === 'forward') {
      const step = Math.random() > 0.5 ? 2 : 5;
      const start = Math.floor(Math.random() * 10) + 1;
      seq = Array.from({ length: 5 }, (_, i) => start + i * step);
    } else {
      const start = Math.floor(Math.random() * 10) + 7;
      seq = Array.from({ length: 5 }, (_, i) => start - i);
    }
    blankIdx = 1 + Math.floor(Math.random() * 3);
    answer = seq[blankIdx];
  } else {
    // Hard: Backward step 2/3, geometric doubling, or increasing step progression
    const mode = Math.floor(Math.random() * 3);
    if (mode === 0) {
      // Backward step 2/3
      const step = Math.random() > 0.5 ? 2 : 3;
      const start = Math.floor(Math.random() * 10) + 15;
      seq = Array.from({ length: 5 }, (_, i) => start - i * step);
    } else if (mode === 1) {
      // Geometric doubling
      const starts = [1, 2, 3];
      const start = starts[Math.floor(Math.random() * starts.length)];
      seq = Array.from({ length: 5 }, (_, i) => start * Math.pow(2, i));
    } else {
      // Increasing step progression (+1, +2, +3, +4)
      const start = Math.floor(Math.random() * 5) + 1;
      let curr = start;
      seq = [];
      for (let i = 0; i < 5; i++) {
        seq.push(curr);
        curr += (i + 1);
      }
    }
    blankIdx = 1 + Math.floor(Math.random() * 3);
    answer = seq[blankIdx];
  }

  const wrong = new Set();
  while (wrong.size < 3) {
    const offset = Math.floor(Math.random() * 4) + 1;
    const w = Math.random() > 0.5 ? answer + offset : answer - offset;
    if (w !== answer && w > 0) wrong.add(w);
  }
  const choices = [answer, ...wrong].sort(() => Math.random() - 0.5);
  return { seq, blankIdx, answer, choices };
}

export default function SequenceFillGame({ autoAdvance, lang = 'zh', difficultyMode = 'adaptive' }) {
  const [adaptiveLevel, setAdaptiveLevel] = useState(1);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);

  const level = difficultyMode === 'easy' ? 1 : 
                difficultyMode === 'medium' ? 2 : 
                difficultyMode === 'hard' ? 3 : adaptiveLevel;

  const [problem, setProblem] = useState(() => generateProblem(level));
  const [selected, setSelected] = useState(null);
  const [sessionCount, setSessionCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const next = useCallback(() => {
    setProblem(generateProblem(level));
    setSelected(null);
  }, [level]);

  useEffect(() => {
    next();
  }, [level, next]);

  const handleChoice = (val) => {
    if (selected !== null) return;
    setSelected(val);
    setSessionCount(p => p + 1);
    if (val === problem.answer) {
      audioSynth.playCorrect();
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
        setTimeout(next, 1200);
      }
    } else {
      audioSynth.playIncorrect();
      if (difficultyMode === 'adaptive') {
        setConsecutiveCorrect(0);
        if (adaptiveLevel > 1) {
          setAdaptiveLevel(l => l - 1);
        }
      }
      if (autoAdvance) {
        setTimeout(next, 1800);
      }
    }
  };

  const isEn = lang === 'en';

  return (
    <div className="screen-wrapper fade-in" style={{ justifyContent: 'flex-start', gap: '20px', paddingBottom: '20px', overflowY: 'auto' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '1.3rem', fontWeight: '600', color: '#c0487a', marginBottom: '4px' }}>
          {isEn ? '🔢 Find the missing number!' : '🔢 找出缺少的数字！'}
        </div>
        <div style={{ fontSize: '0.9rem', color: '#d4879e', fontWeight: '600' }}>
          {isEn
            ? `📝 Total: ${sessionCount} · ✅ Correct: ${correctCount}`
            : `📝 本次 ${sessionCount} 题 · ✅ 答对 ${correctCount} 题`}
        </div>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.8)', borderRadius: '28px', padding: '24px 16px',
        width: '100%', maxWidth: '380px',
        boxShadow: '0 8px 30px rgba(255,93,158,0.1)', border: '2.5px solid rgba(255,255,255,0.9)',
      }}>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
          {problem.seq.map((n, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span style={{ color: '#f5c0d0', fontSize: '1.4rem', fontWeight: '600' }}>→</span>}
              {i === problem.blankIdx ? (
                <div style={{
                  width: '60px', height: '60px', borderRadius: '16px',
                  border: '3px dashed #ff85b8', background: 'rgba(255,133,184,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: selected !== null ? '1.5rem' : '1.2rem',
                  fontWeight: '600', color: selected === problem.answer ? '#16a34a' : '#ff5d9e',
                  transition: 'all 0.3s',
                }}>
                  {selected !== null ? selected : '？'}
                </div>
              ) : (
                <div style={{
                  width: '60px', height: '60px', borderRadius: '16px',
                  background: 'linear-gradient(135deg, #ffb5c8, #ff8fab)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem', fontWeight: '600', color: 'white',
                  boxShadow: '0 4px 10px rgba(255,93,158,0.3)',
                }}>
                  {n}
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%', maxWidth: '360px' }}>
        {problem.choices.map(val => {
          let bg = 'white', border = '#f5c0d0', color = '#c06080';
          if (selected !== null) {
            if (val === problem.answer) { bg = '#f0fdf4'; border = '#4ade80'; color = '#16a34a'; }
            else if (val === selected) { bg = '#fef2f2'; border = '#f87171'; color = '#dc2626'; }
          }
          return (
            <button key={val} onClick={() => handleChoice(val)} style={{
              padding: '18px', borderRadius: '20px',
              border: `3px solid ${border}`, background: bg, color,
              fontWeight: '600', fontSize: '1.8rem',
              cursor: selected !== null ? 'default' : 'pointer',
              fontFamily: 'Fredoka, sans-serif',
              boxShadow: '0 4px 12px rgba(255,93,158,0.1)',
              transition: 'all 0.2s ease',
            }}>
              {val}
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <div className="bounce-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: '600', textAlign: 'center',
            color: selected === problem.answer ? '#16a34a' : '#dc2626' }}>
            {selected === problem.answer
              ? (isEn ? '🌟 Correct!' : '🌟 答对啦！')
              : (isEn ? `💡 The answer is ${problem.answer}!` : `💡 答案是 ${problem.answer} 哦！`)}
          </div>
          {!autoAdvance && (
            <button
              onClick={next}
              style={{
                marginTop: '6px',
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
  );
}

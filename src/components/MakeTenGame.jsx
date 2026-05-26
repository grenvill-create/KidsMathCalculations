import React, { useState, useEffect, useCallback } from 'react';
import { audioSynth } from '../utils/audioSynth';

function generateProblem(level) {
  let num1, target, answer;
  
  if (level === 1) {
    // Easy: Make 10
    target = 10;
    num1 = Math.floor(Math.random() * 9) + 1; // 1-9
    answer = 10 - num1;
  } else if (level === 2) {
    // Medium: Make 20
    target = 20;
    num1 = Math.floor(Math.random() * 11) + 8; // 8-18
    answer = 20 - num1;
  } else {
    // Hard: Make 100 (in multiples of 5 or 10)
    target = 100;
    const presets = [10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 85, 95];
    num1 = presets[Math.floor(Math.random() * presets.length)];
    answer = 100 - num1;
  }

  const wrong = new Set();
  while (wrong.size < 3) {
    let w;
    if (target === 10) {
      w = Math.floor(Math.random() * 9) + 1;
    } else if (target === 20) {
      w = Math.floor(Math.random() * 19) + 1;
    } else {
      w = (Math.floor(Math.random() * 18) + 1) * 5;
    }
    if (w !== answer && w > 0 && w < target) wrong.add(w);
  }
  const choices = [answer, ...wrong].sort((a, b) => a - b);
  return { num1, target, answer, choices };
}

function MontessoriBeadBar({ filled, target }) {
  if (target === 10 || target === 20) {
    // Double Ten-Frames for 10/20
    const rowsCount = target === 10 ? 2 : 4;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
        {Array.from({ length: rowsCount }).map((_, row) => (
          <div key={row} style={{ display: 'flex', gap: '6px' }}>
            {Array.from({ length: 5 }, (_, col) => {
              const idx = row * 5 + col;
              const isFilled = idx < filled;
              return (
                <div key={col} style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  border: '2.5px solid #f5c0d0',
                  background: isFilled
                    ? 'linear-gradient(135deg, #ff85b8, #ff5d9e)'
                    : 'rgba(255,255,255,0.5)',
                  boxShadow: isFilled ? '0 3px 8px rgba(255,93,158,0.35)' : 'none',
                  transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: isFilled ? '0.9rem' : '0.6rem',
                  color: isFilled ? 'white' : '#f5c0d0',
                }}>
                  {isFilled ? '●' : '○'}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  // Target === 100: Montessori-inspired Golden Bead Bars (10 bars of 10 beads)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', maxWidth: '300px', alignItems: 'stretch' }}>
      {Array.from({ length: 10 }).map((_, barIdx) => {
        const threshold = (barIdx + 1) * 10;
        const isFilled = filled >= threshold;
        const isPartiallyFilled = !isFilled && filled > barIdx * 10;
        const filledDots = isPartiallyFilled ? (filled % 10) : (isFilled ? 10 : 0);

        return (
          <div key={barIdx} style={{
            height: '24px', borderRadius: '12px',
            border: '2px solid #fbbf24',
            background: 'rgba(255, 255, 255, 0.6)',
            display: 'flex', alignItems: 'center', padding: '0 8px', gap: '4px',
            position: 'relative', overflow: 'hidden'
          }}>
            {Array.from({ length: 10 }).map((_, dotIdx) => {
              const active = dotIdx < filledDots || isFilled;
              return (
                <div key={dotIdx} style={{
                  width: '12px', height: '12px', borderRadius: '50%',
                  background: active ? 'linear-gradient(135deg, #fbbf24, #d97706)' : '#fef3c7',
                  border: '1px solid #b45309',
                  boxShadow: active ? '0 1px 3px rgba(217,119,6,0.3)' : 'none',
                }} />
              );
            })}
            <span style={{
              position: 'absolute', right: '8px', fontSize: '0.75rem', fontWeight: 'bold',
              color: '#b45309'
            }}>{threshold}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function MakeTenGame({ autoAdvance, lang = 'zh', difficultyMode = 'adaptive' }) {
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
        setTimeout(next, 1300);
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
  const filledCount = (selected !== null && selected === problem.answer) ? problem.target : problem.num1;

  const getTitle = () => {
    if (problem.target === 10) return isEn ? '🎯 Make Ten: How many more to make 10?' : '🎯 凑十法：再加几个就能凑成 10？';
    if (problem.target === 20) return isEn ? '🎯 Make Twenty: How many more to make 20?' : '🎯 凑二十：再加几个就能凑成 20？';
    return isEn ? '🎯 Make 100: How many more to make 100?' : '🎯 凑百：再加几个就能凑成 100？';
  };

  return (
    <div className="screen-wrapper fade-in" style={{ justifyContent: 'flex-start', gap: '20px', paddingBottom: '20px', overflowY: 'auto' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '1.3rem', fontWeight: '600', color: '#c0487a', marginBottom: '4px' }}>
          {getTitle()}
        </div>
        <div style={{ fontSize: '0.9rem', color: '#d4879e', fontWeight: '600' }}>
          {isEn
            ? `📝 Total: ${sessionCount} · ✅ Correct: ${correctCount}`
            : `📝 本次 ${sessionCount} 题 · ✅ 答对 ${correctCount} 题`}
        </div>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.8)', borderRadius: '28px', padding: '24px 20px',
        width: '100%', maxWidth: '380px',
        boxShadow: '0 8px 30px rgba(255,93,158,0.1)', border: '2.5px solid rgba(255,255,255,0.9)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
      }}>
        <div style={{
          fontSize: '1.8rem', fontWeight: '700', color: '#c0487a',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <span style={{
            background: 'linear-gradient(135deg, #ffb5c8, #ff8fab)',
            color: 'white', borderRadius: '16px', padding: '6px 16px',
            boxShadow: '0 4px 12px rgba(255,93,158,0.3)',
          }}>{problem.num1}</span>
          <span>+</span>
          <span style={{
            border: '3px dashed #ff85b8', borderRadius: '16px', padding: '6px 16px',
            color: '#ff5d9e', minWidth: '60px', textAlign: 'center',
          }}>
            {selected !== null ? selected : '？'}
          </span>
          <span>=</span>
          <span style={{
            background: 'linear-gradient(135deg, #4ade80, #22c55e)',
            color: 'white', borderRadius: '16px', padding: '6px 16px',
            boxShadow: '0 4px 12px rgba(34,197,94,0.3)',
          }}>{problem.target}</span>
        </div>

        <MontessoriBeadBar filled={filledCount} target={problem.target} />
        
        <div style={{ fontSize: '0.85rem', color: '#c07090', opacity: 0.7, fontWeight: '600', textAlign: 'center' }}>
          {problem.target === 100 
            ? (isEn ? `Beads = ${problem.num1}. How many more to make 100?` : `金黄色珠子 = ${problem.num1}，还需要多少个凑成 100？`)
            : (isEn ? `Red dots = ${problem.num1}. How many more spaces to fill?` : `红色圆点 = ${problem.num1}，还需要填满几个格子？`)}
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
              fontWeight: '700', fontSize: '1.6rem',
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
              ? (isEn ? `🌟 Correct! ${problem.num1} + ${problem.answer} = ${problem.target}!` : `🌟 对啦！${problem.num1} + ${problem.answer} = ${problem.target}！`)
              : (isEn ? `💡 The answer is ${problem.answer}! ${problem.num1} + ${problem.answer} = ${problem.target}!` : `💡 答案是 ${problem.answer} 哦，${problem.num1} + ${problem.answer} = ${problem.target}！`)}
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

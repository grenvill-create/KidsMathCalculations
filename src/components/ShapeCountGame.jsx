import React, { useState, useEffect, useCallback } from 'react';
import { audioSynth } from '../utils/audioSynth';

const SHAPE_TYPES = [
  { id: 'circle',   emoji: '🔵', nameZh: '圆形', nameEn: 'Circle' },
  { id: 'square',   emoji: '🟦', nameZh: '正方形', nameEn: 'Square' },
  { id: 'triangle', emoji: '🔺', nameZh: '三角形', nameEn: 'Triangle' },
  { id: 'diamond',  emoji: '🔶', nameZh: '菱形', nameEn: 'Diamond' },
  { id: 'star',     emoji: '⭐', nameZh: '星形', nameEn: 'Star' },
];

const getPluralName = (shape, qty) => {
  if (qty <= 1) return shape.nameEn;
  if (shape.id === 'circle') return 'Circles';
  if (shape.id === 'triangle') return 'Triangles';
  if (shape.id === 'square') return 'Squares';
  if (shape.id === 'diamond') return 'Diamonds';
  if (shape.id === 'star') return 'Stars';
  return shape.nameEn;
};

function generateProblem(level) {
  if (level === 1) {
    // Easy: Few shapes, small numbers
    const target = SHAPE_TYPES[Math.floor(Math.random() * SHAPE_TYPES.length)];
    const answer = Math.floor(Math.random() * 3) + 2; // 2-4
    const others = SHAPE_TYPES.filter(s => s.id !== target.id);
    const distractors = Array.from({ length: 3 }, () => others[Math.floor(Math.random() * others.length)]);
    const items = [...Array(answer).fill(target), ...distractors].sort(() => Math.random() - 0.5);

    const wrong = new Set();
    while (wrong.size < 3) {
      const w = Math.floor(Math.random() * 6) + 1;
      if (w !== answer) wrong.add(w);
    }
    const choices = [answer, ...wrong].sort((a, b) => a - b);
    return { items, target, answer, choices, isDouble: false };
  } else if (level === 2) {
    // Medium: Current standard
    const target = SHAPE_TYPES[Math.floor(Math.random() * SHAPE_TYPES.length)];
    const answer = Math.floor(Math.random() * 4) + 2; // 2-5
    const others = SHAPE_TYPES.filter(s => s.id !== target.id);
    const distractors = Array.from({ length: 6 }, () => others[Math.floor(Math.random() * others.length)]);
    const items = [...Array(answer).fill(target), ...distractors].sort(() => Math.random() - 0.5);

    const wrong = new Set();
    while (wrong.size < 3) {
      const w = Math.floor(Math.random() * 9) + 1;
      if (w !== answer) wrong.add(w);
    }
    const choices = [answer, ...wrong].sort((a, b) => a - b);
    return { items, target, answer, choices, isDouble: false };
  } else {
    // Hard: Additive double shape count! "How many circles AND stars?"
    const target1 = SHAPE_TYPES[Math.floor(Math.random() * SHAPE_TYPES.length)];
    let target2;
    do {
      target2 = SHAPE_TYPES[Math.floor(Math.random() * SHAPE_TYPES.length)];
    } while (target2.id === target1.id);

    const count1 = Math.floor(Math.random() * 3) + 2; // 2-4
    const count2 = Math.floor(Math.random() * 3) + 2; // 2-4
    const answer = count1 + count2;

    const others = SHAPE_TYPES.filter(s => s.id !== target1.id && s.id !== target2.id);
    const distractors = Array.from({ length: 4 }, () => others[Math.floor(Math.random() * others.length)]);
    const items = [
      ...Array(count1).fill(target1),
      ...Array(count2).fill(target2),
      ...distractors
    ].sort(() => Math.random() - 0.5);

    const wrong = new Set();
    while (wrong.size < 3) {
      const w = Math.floor(Math.random() * 10) + 2;
      if (w !== answer) wrong.add(w);
    }
    const choices = [answer, ...wrong].sort((a, b) => a - b);

    return { items, target: target1, target2, answer, choices, isDouble: true };
  }
}

export default function ShapeCountGame({ autoAdvance, lang = 'zh', difficultyMode = 'adaptive' }) {
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
  
  const getQuestionText = () => {
    if (problem.isDouble) {
      const name1 = isEn ? getPluralName(problem.target, 2) : problem.target.nameZh;
      const name2 = isEn ? getPluralName(problem.target2, 2) : problem.target2.nameZh;
      return isEn ? (
        <>How many <span style={{ background: 'rgba(255,133,184,0.2)', borderRadius: '8px', padding: '2px 6px' }}>{problem.target.emoji} {name1}</span> AND <span style={{ background: 'rgba(255,133,184,0.2)', borderRadius: '8px', padding: '2px 6px' }}>{problem.target2.emoji} {name2}</span> are there in total?</>
      ) : (
        <>图中的 <span style={{ background: 'rgba(255,133,184,0.2)', borderRadius: '8px', padding: '2px 6px' }}>{problem.target.emoji} {name1}</span> 和 <span style={{ background: 'rgba(255,133,184,0.2)', borderRadius: '8px', padding: '2px 6px' }}>{problem.target2.emoji} {name2}</span> 一共有几个？</>
      );
    } else {
      const targetName = isEn ? getPluralName(problem.target, 2) : problem.target.nameZh;
      return isEn ? (
        <>How many <span style={{ background: 'rgba(255,133,184,0.2)', borderRadius: '8px', padding: '2px 8px' }}>{problem.target.emoji} {targetName}</span> are there?</>
      ) : (
        <>图中有几个 <span style={{ background: 'rgba(255,133,184,0.2)', borderRadius: '8px', padding: '2px 8px' }}>{problem.target.emoji} {targetName}</span>？</>
      );
    }
  };

  const isTargetItem = (item) => {
    if (problem.isDouble) {
      return item.id === problem.target.id || item.id === problem.target2.id;
    }
    return item.id === problem.target.id;
  };

  const getCelebrationText = () => {
    if (problem.isDouble) {
      return isEn 
        ? `🌟 Correct! There are ${problem.answer} in total!` 
        : `🌟 数对了！一共有 ${problem.answer} 个！`;
    } else {
      return isEn 
        ? `🌟 Correct! There are ${problem.answer} ${getPluralName(problem.target, problem.answer)}!` 
        : `🌟 数对了！有 ${problem.answer} 个${problem.target.nameZh}！`;
    }
  };

  const getExplanationText = () => {
    if (problem.isDouble) {
      return isEn 
        ? `💡 Correct answer is ${problem.answer} in total!` 
        : `💡 一共有 ${problem.answer} 个哦，再数数看！`;
    } else {
      return isEn 
        ? `💡 There are ${problem.answer} ${getPluralName(problem.target, problem.answer)} in the picture!` 
        : `💡 图中有 ${problem.answer} 个${problem.target.nameZh}，再数数看！`;
    }
  };

  return (
    <div className="screen-wrapper fade-in" style={{ justifyContent: 'flex-start', gap: '18px', paddingBottom: '20px', overflowY: 'auto' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#c0487a', marginBottom: '4px', lineHeight: 1.4 }}>
          {getQuestionText()}
        </div>
        <div style={{ fontSize: '0.9rem', color: '#d4879e', fontWeight: '600' }}>
          {isEn
            ? `📝 Total: ${sessionCount} · ✅ Correct: ${correctCount}`
            : `📝 本次 ${sessionCount} 题 · ✅ 答对 ${correctCount} 题`}
        </div>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.8)', borderRadius: '28px', padding: '16px',
        width: '100%', maxWidth: '380px',
        boxShadow: '0 8px 30px rgba(255,93,158,0.1)', border: '2.5px solid rgba(255,255,255,0.9)',
        minHeight: '130px',
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
          {problem.items.map((item, i) => {
            const isTarget = isTargetItem(item);
            return (
              <span key={i} style={{
                fontSize: '2rem', lineHeight: 1,
                opacity: selected !== null && isTarget ? 1 : selected !== null ? 0.45 : 1,
                transition: 'opacity 0.3s',
                filter: selected !== null && isTarget
                  ? 'drop-shadow(0 0 4px rgba(255,93,158,0.6))'
                  : 'none',
              }}>{item.emoji}</span>
            );
          })}
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
            {selected === problem.answer ? getCelebrationText() : getExplanationText()}
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

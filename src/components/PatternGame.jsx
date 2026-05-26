import React, { useState, useEffect, useCallback } from 'react';
import { audioSynth } from '../utils/audioSynth';

const EASY_POOLS = [
  { items: ['🔴', '🔵'], types: ['ABAB'] },
  { items: ['⭐', '🌙'], types: ['ABAB'] },
  { items: ['🍎', '🍊'], types: ['ABAB'] },
  { items: ['🐱', '🐶'], types: ['ABAB'] },
];

const MEDIUM_POOLS = [
  { items: ['🔴', '🔵', '🟡'], types: ['ABCABC'] },
  { items: ['🍎', '🍊', '🍇'], types: ['ABCABC'] },
  { items: ['🔴', '🔵'], types: ['AABB'] },
  { items: ['⭐', '🌸'], types: ['AABB'] },
];

function buildSequence(items, type, len = 7) {
  const seq = [];
  for (let i = 0; i < len; i++) {
    if (type === 'ABAB') seq.push(items[i % 2]);
    else if (type === 'AABB') seq.push(items[Math.floor(i / 2) % 2]);
    else if (type === 'ABCABC') seq.push(items[i % 3]);
  }
  return seq;
}

function generateProblem(level) {
  if (level === 1) {
    const pool = EASY_POOLS[Math.floor(Math.random() * EASY_POOLS.length)];
    const type = pool.types[0];
    const fullSeq = buildSequence(pool.items, type, 7);
    const shown = fullSeq.slice(0, 6);
    const answer = fullSeq[6];
    const wrong = pool.items.filter(x => x !== answer).slice(0, 2);
    while (wrong.length < 2) wrong.push(EASY_POOLS[(EASY_POOLS.indexOf(pool) + 1) % EASY_POOLS.length].items[0]);
    const choices = [answer, ...wrong].sort(() => Math.random() - 0.5);
    return { shown, answer, choices, type, isNumeric: false };
  } else if (level === 2) {
    const pool = MEDIUM_POOLS[Math.floor(Math.random() * MEDIUM_POOLS.length)];
    const type = pool.types[0];
    const fullSeq = buildSequence(pool.items, type, 7);
    const shown = fullSeq.slice(0, 6);
    const answer = fullSeq[6];
    const wrong = pool.items.filter(x => x !== answer).slice(0, 2);
    while (wrong.length < 2) wrong.push(MEDIUM_POOLS[(MEDIUM_POOLS.indexOf(pool) + 1) % MEDIUM_POOLS.length].items[0]);
    const choices = [answer, ...wrong].sort(() => Math.random() - 0.5);
    return { shown, answer, choices, type, isNumeric: false };
  } else {
    // Hard: Numeric sequences
    const seqTypes = ['add2', 'add5', 'sub1', 'addStep'];
    const chosenType = seqTypes[Math.floor(Math.random() * seqTypes.length)];
    const shown = [];
    let start = Math.floor(Math.random() * 10) + 1;
    let answer;

    if (chosenType === 'add2') {
      for (let i = 0; i < 6; i++) shown.push(start + i * 2);
      answer = start + 6 * 2;
    } else if (chosenType === 'add5') {
      for (let i = 0; i < 6; i++) shown.push(start + i * 5);
      answer = start + 6 * 5;
    } else if (chosenType === 'sub1') {
      start = Math.floor(Math.random() * 10) + 7;
      for (let i = 0; i < 6; i++) shown.push(start - i);
      answer = start - 6;
    } else { // addStep: +1, +2, +3...
      let curr = start;
      for (let i = 0; i < 6; i++) {
        shown.push(curr);
        curr += (i + 1);
      }
      answer = curr;
    }

    const wrong = [answer + (Math.random() > 0.5 ? 2 : -2), answer + (Math.random() > 0.5 ? 4 : -4)];
    const choices = [answer, ...wrong].sort(() => Math.random() - 0.5);
    return { shown, answer, choices, type: chosenType, isNumeric: true };
  }
}

export default function PatternGame({ autoAdvance, lang = 'zh', difficultyMode = 'adaptive' }) {
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
          {isEn ? '🔁 Find the pattern, what comes next?' : '🔁 找出规律，下一个是什么？'}
        </div>
        <div style={{ fontSize: '0.9rem', color: '#d4879e', fontWeight: '600' }}>
          {isEn
            ? `📝 Total: ${sessionCount} · ✅ Correct: ${correctCount}`
            : `📝 本次 ${sessionCount} 题 · ✅ 答对 ${correctCount} 题`}
        </div>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.8)', borderRadius: '28px', padding: '22px 16px',
        width: '100%', maxWidth: '380px',
        boxShadow: '0 8px 30px rgba(255,93,158,0.1)', border: '2.5px solid rgba(255,255,255,0.9)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
      }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          {problem.shown.map((item, i) => (
            <span key={i} style={{
              fontSize: problem.isNumeric ? '1.8rem' : '2.2rem', 
              lineHeight: 1,
              fontWeight: problem.isNumeric ? '700' : 'normal',
              color: problem.isNumeric ? '#c0487a' : 'inherit',
              background: problem.isNumeric ? '#ffe4e6' : 'transparent',
              padding: problem.isNumeric ? '4px 10px' : '0',
              borderRadius: problem.isNumeric ? '12px' : '0',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
            }}>{item}</span>
          ))}
          <span style={{ fontSize: '1.5rem', color: '#ff85b8', fontWeight: '600' }}>→</span>
          <div style={{
            width: '52px', height: '52px', borderRadius: '16px',
            border: '3px dashed #ff85b8',
            background: selected ? 'rgba(255,133,184,0.1)' : 'rgba(255,255,255,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: problem.isNumeric ? '1.5rem' : '2rem',
            fontWeight: '700',
            color: '#c0487a',
            transition: 'all 0.3s',
          }}>
            {selected !== null ? selected : '？'}
          </div>
        </div>
        <div style={{ opacity: 0.6, fontSize: '0.85rem', color: '#c07090', fontWeight: '600' }}>
          {isEn ? 'Observe the pattern and pick the next one 👆' : '仔细观察规律，选出下一个 👆'}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', width: '100%', maxWidth: '360px' }}>
        {problem.choices.map((val, i) => {
          let bg = 'rgba(255,255,255,0.85)', border = '#f5c0d0', shadow = '0 4px 12px rgba(255,93,158,0.1)';
          if (selected !== null) {
            if (val === problem.answer) { bg = '#f0fdf4'; border = '#4ade80'; shadow = '0 4px 12px rgba(74,222,128,0.3)'; }
            else if (val === selected) { bg = '#fef2f2'; border = '#f87171'; shadow = '0 4px 12px rgba(248,113,113,0.3)'; }
          }
          return (
            <button key={i} onClick={() => handleChoice(val)} style={{
              flex: 1, padding: '20px 10px', borderRadius: '20px',
              border: `3px solid ${border}`, background: bg,
              fontWeight: '700', fontSize: problem.isNumeric ? '1.8rem' : '2.2rem',
              color: '#c0487a',
              cursor: selected !== null ? 'default' : 'pointer',
              boxShadow: shadow, transition: 'all 0.2s ease',
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
              ? (isEn ? '🌟 You found the pattern! Great job!' : '🌟 找到规律啦！真棒！')
              : (isEn ? `💡 The next one should be ${problem.answer}!` : `💡 下一个应该是 ${problem.answer} 哦！`)}
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

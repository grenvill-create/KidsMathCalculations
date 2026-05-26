import React, { useState, useEffect, useCallback } from 'react';
import { audioSynth } from '../utils/audioSynth';

const EMOJIS = ['🍎', '⭐', '🎈', '🍭', '🐱', '🦋', '🍬', '🐧'];

function generateProblem(level) {
  let groups, perGroup;
  
  if (level === 1) {
    // Easy: Small numbers, max total 10
    groups = 2;
    perGroup = Math.floor(Math.random() * 4) + 2; // 2-5
  } else if (level === 2) {
    // Medium: Up to 5 groups, max total 25
    groups = Math.floor(Math.random() * 3) + 3; // 3-5
    perGroup = Math.floor(Math.random() * 4) + 2; // 2-5
  } else {
    // Hard: Larger multiplication, up to 6 groups, max total 36
    groups = Math.floor(Math.random() * 3) + 4; // 4-6
    perGroup = Math.floor(Math.random() * 3) + 4; // 4-6
  }

  const answer = groups * perGroup;
  const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];

  const wrong = new Set();
  while (wrong.size < 3) {
    const offset = Math.floor(Math.random() * 6) + 1;
    const w = Math.random() > 0.5 ? answer + offset : Math.max(1, answer - offset);
    if (w !== answer) wrong.add(w);
  }
  const choices = [answer, ...wrong].sort((a, b) => a - b);
  return { groups, perGroup, answer, emoji, choices };
}

export default function MultiplicationIntroGame({ autoAdvance, lang = 'zh', difficultyMode = 'adaptive' }) {
  const [adaptiveLevel, setAdaptiveLevel] = useState(1);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);

  const level = difficultyMode === 'easy' ? 1 : 
                difficultyMode === 'medium' ? 2 : 
                difficultyMode === 'hard' ? 3 : adaptiveLevel;

  const [problem, setProblem] = useState(() => generateProblem(level));
  const [selected, setSelected] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const next = useCallback(() => {
    setProblem(generateProblem(level));
    setSelected(null);
    setShowHint(false);
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
        setTimeout(next, 1400);
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
    <div className="screen-wrapper fade-in" style={{ justifyContent: 'flex-start', gap: '18px', paddingBottom: '20px', overflowY: 'auto' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '1.3rem', fontWeight: '600', color: '#c0487a', marginBottom: '4px' }}>
          {level === 3 
            ? (isEn ? '✖️ Solve the multiplication word problem!' : '✖️ 解决乘法应用题吧！')
            : (isEn ? '✖️ How many in total? Count them!' : '✖️ 一共有几个？数一数！')}
        </div>
        <div style={{ fontSize: '0.9rem', color: '#d4879e', fontWeight: '600' }}>
          {isEn
            ? `📝 Total: ${sessionCount} · ✅ Correct: ${correctCount}`
            : `📝 本次 ${sessionCount} 题 · ✅ 答对 ${correctCount} 题`}
        </div>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.8)', borderRadius: '28px', padding: '20px',
        width: '100%', maxWidth: '380px',
        boxShadow: '0 8px 30px rgba(255,93,158,0.1)', border: '2.5px solid rgba(255,255,255,0.9)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
      }}>
        <div style={{ fontSize: '1.05rem', color: '#c07090', fontWeight: '700', opacity: 0.9, textAlign: 'center', lineHeight: 1.4 }}>
          {level === 3 ? (
            isEn ? (
              <span>
                "We have <strong>{problem.groups}</strong> baskets. Each basket has <strong>{problem.perGroup}</strong> {problem.emoji}. How many in total?"
              </span>
            ) : (
              <span>
                “这里有 <strong>{problem.groups}</strong> 个篮子。每个篮子里装了 <strong>{problem.perGroup}</strong> 个 {problem.emoji}。一共有多少个？”
              </span>
            )
          ) : (
            isEn ? (
              <span>
                There are <strong>{problem.groups}</strong> groups of {problem.emoji}, <strong>{problem.perGroup}</strong> per group
              </span>
            ) : (
              <span>
                有 <strong>{problem.groups}</strong> 组 {problem.emoji}，每组 <strong>{problem.perGroup}</strong> 个
              </span>
            )
          )}
        </div>

        {/* Visual representation */}
        {(level !== 3 || showHint || selected !== null) ? (
          <div className="fade-in" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', margin: '8px 0' }}>
            {Array.from({ length: problem.groups }, (_, gi) => (
              <div key={gi} style={{
                background: 'linear-gradient(135deg, rgba(255,181,200,0.3), rgba(255,143,171,0.2))',
                border: '2px solid rgba(255,143,171,0.4)',
                borderRadius: '16px', padding: '10px 12px',
                display: 'flex', flexWrap: 'wrap', gap: '3px',
                justifyContent: 'center', maxWidth: '100px',
              }}>
                {Array.from({ length: problem.perGroup }, (_, i) => (
                  <span key={i} style={{ fontSize: '1.4rem', lineHeight: 1 }}>{problem.emoji}</span>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <button 
            className="bouncy-button secondary" 
            onClick={() => setShowHint(true)}
            style={{ padding: '8px 16px', fontSize: '0.9rem', margin: '12px 0' }}
          >
            {isEn ? '💡 Show Helper Boxes' : '💡 显示教具辅助'}
          </button>
        )}

        <div style={{
          fontSize: '1.4rem', fontWeight: '700', color: '#c0487a',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <span>{problem.groups}</span>
          <span style={{ color: '#ff85b8' }}>×</span>
          <span>{problem.perGroup}</span>
          <span style={{ color: '#ff85b8' }}>=</span>
          <span style={{
            border: '3px dashed #ff85b8', borderRadius: '12px', padding: '4px 16px',
            minWidth: '50px', textAlign: 'center', color: '#ff5d9e',
          }}>
            {selected !== null ? selected : '？'}
          </span>
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
              ? (isEn ? `🌟 Correct! ${problem.answer} in total!` : `🌟 答对啦！一共 ${problem.answer} 个！`)
              : (isEn ? `💡 The answer is ${problem.answer}! ${problem.groups} × ${problem.perGroup} = ${problem.answer}` : `💡 答案是 ${problem.answer}，${problem.groups} × ${problem.perGroup} = ${problem.answer}`)}
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

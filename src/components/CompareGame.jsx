import React, { useState, useEffect, useCallback } from 'react';
import { audioSynth } from '../utils/audioSynth';

const EMOJI_SETS = ['🍎', '⭐', '🎈', '🌸', '🍭', '🐱', '🦋', '🍬', '🐧', '🌈'];

function generateProblem(level) {
  const emoji = EMOJI_SETS[Math.floor(Math.random() * EMOJI_SETS.length)];
  
  if (level === 1) {
    // Easy: simple comparison of 1-9 with emojis
    const num1 = Math.floor(Math.random() * 9) + 1;
    let num2;
    do { num2 = Math.floor(Math.random() * 9) + 1; } while (num2 === num1);
    
    return {
      leftVal: num1,
      rightVal: num2,
      leftExpr: num1.toString(),
      rightExpr: num2.toString(),
      emoji,
      showEmoji: true,
      answer: num1 > num2 ? 'left' : 'right'
    };
  } else if (level === 2) {
    // Medium: Single number vs Addition/Subtraction within 20
    const op = Math.random() > 0.5 ? '+' : '-';
    let a, b, leftVal, rightVal;
    
    if (op === '+') {
      a = Math.floor(Math.random() * 9) + 1;
      b = Math.floor(Math.random() * 9) + 1;
      leftVal = a + b;
    } else {
      leftVal = Math.floor(Math.random() * 9) + 1; // result
      b = Math.floor(Math.random() * 8) + 1;
      a = leftVal + b; // start number
    }
    
    do {
      rightVal = Math.floor(Math.random() * 15) + 1;
    } while (rightVal === leftVal);
    
    // Randomize which side gets the equation
    const leftIsExpr = Math.random() > 0.5;
    
    return {
      leftVal,
      rightVal,
      leftExpr: leftIsExpr ? `${a} ${op} ${b}` : leftVal.toString(),
      rightExpr: leftIsExpr ? rightVal.toString() : `${a} ${op} ${b}`,
      emoji,
      showEmoji: false,
      answer: leftVal > rightVal ? 'left' : 'right'
    };
  } else {
    // Hard: Expression vs Expression
    const ops = ['+', '-'];
    
    // Left expr
    const leftOp = ops[Math.floor(Math.random() * 2)];
    let leftVal, leftA, leftB;
    if (leftOp === '+') {
      leftA = Math.floor(Math.random() * 9) + 1;
      leftB = Math.floor(Math.random() * 9) + 1;
      leftVal = leftA + leftB;
    } else {
      leftVal = Math.floor(Math.random() * 9) + 1;
      leftB = Math.floor(Math.random() * 8) + 1;
      leftA = leftVal + leftB;
    }
    
    // Right expr
    const rightOp = ops[Math.floor(Math.random() * 2)];
    let rightVal, rightA, rightB;
    do {
      if (rightOp === '+') {
        rightA = Math.floor(Math.random() * 9) + 1;
        rightB = Math.floor(Math.random() * 9) + 1;
        rightVal = rightA + rightB;
      } else {
        rightVal = Math.floor(Math.random() * 9) + 1;
        rightB = Math.floor(Math.random() * 8) + 1;
        rightA = rightVal + rightB;
      }
    } while (rightVal === leftVal);
    
    return {
      leftVal,
      rightVal,
      leftExpr: `${leftA} ${leftOp} ${leftB}`,
      rightExpr: `${rightA} ${rightOp} ${rightB}`,
      emoji,
      showEmoji: false,
      answer: leftVal > rightVal ? 'left' : 'right'
    };
  }
}

function EmojiGrid({ count, emoji }) {
  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
      alignContent: 'center', gap: '4px', minHeight: '90px', width: '100%',
    }}>
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} style={{ fontSize: '1.6rem', lineHeight: 1 }}>{emoji}</span>
      ))}
    </div>
  );
}

export default function CompareGame({ autoAdvance, lang = 'zh', difficultyMode = 'adaptive' }) {
  const [adaptiveLevel, setAdaptiveLevel] = useState(1);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  
  const level = difficultyMode === 'easy' ? 1 : 
                difficultyMode === 'medium' ? 2 : 
                difficultyMode === 'hard' ? 3 : adaptiveLevel;
                
  const [problem, setProblem] = useState(null);
  const [selected, setSelected] = useState(null);
  const [sessionCount, setSessionCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const next = useCallback(() => {
    setProblem(generateProblem(level));
    setSelected(null);
  }, [level]);

  useEffect(() => { next(); }, [next]);

  const handleChoice = (side) => {
    if (selected !== null) return;
    setSelected(side);
    setSessionCount(p => p + 1);
    if (side === problem.answer) {
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

  if (!problem) return null;

  const getBoxStyle = (side) => {
    let bg = 'rgba(255,255,255,0.82)', border = '#f5c0d0', shadow = '0 4px 15px rgba(255,93,158,0.1)';
    if (selected !== null) {
      if (side === problem.answer)  { bg = '#f0fdf4'; border = '#4ade80'; shadow = '0 4px 15px rgba(74,222,128,0.3)'; }
      else if (side === selected)   { bg = '#fef2f2'; border = '#f87171'; shadow = '0 4px 15px rgba(248,113,113,0.3)'; }
    }
    return {
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: '8px', padding: '16px', borderRadius: '24px',
      border: `3px solid ${border}`, background: bg,
      cursor: selected !== null ? 'default' : 'pointer',
      boxShadow: shadow, transition: 'all 0.2s ease', minHeight: '150px',
    };
  };

  const bigger = Math.max(problem.leftVal, problem.rightVal);
  const smaller = Math.min(problem.leftVal, problem.rightVal);
  const isEn = lang === 'en';

  return (
    <div className="screen-wrapper fade-in" style={{ justifyContent: 'flex-start', gap: '18px', paddingBottom: '20px', overflowY: 'auto' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '1.3rem', fontWeight: '600', color: '#c0487a', marginBottom: '4px' }}>
          {isEn ? '⚖️ Which side has more? Tap it!' : '⚖️ 哪边更多？点一点！'}
        </div>
        <div style={{ fontSize: '0.9rem', color: '#d4879e', fontWeight: '600' }}>
          {isEn
            ? `📝 Total: ${sessionCount} · ✅ Correct: ${correctCount}`
            : `📝 本次 ${sessionCount} 题 · ✅ 答对 ${correctCount} 题`}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '14px', width: '100%', maxWidth: '400px', alignItems: 'stretch' }}>
        <button onClick={() => handleChoice('left')} style={getBoxStyle('left')}>
          {problem.showEmoji && <EmojiGrid count={problem.leftVal} emoji={problem.emoji} />}
          <span style={{ fontSize: '1.8rem', fontWeight: '700', color: '#c06080' }}>{problem.leftExpr}</span>
          {selected !== null && !problem.showEmoji && (
            <span style={{ fontSize: '1.2rem', color: '#888' }}>({problem.leftVal})</span>
          )}
        </button>

        <div style={{
          display: 'flex', alignItems: 'center', fontSize: '1.6rem',
          color: '#f5c0d0', fontWeight: '600', flexShrink: 0,
        }}>VS</div>

        <button onClick={() => handleChoice('right')} style={getBoxStyle('right')}>
          {problem.showEmoji && <EmojiGrid count={problem.rightVal} emoji={problem.emoji} />}
          <span style={{ fontSize: '1.8rem', fontWeight: '700', color: '#c06080' }}>{problem.rightExpr}</span>
          {selected !== null && !problem.showEmoji && (
            <span style={{ fontSize: '1.2rem', color: '#888' }}>({problem.rightVal})</span>
          )}
        </button>
      </div>

      {selected !== null && (
        <div className="bounce-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{
            fontSize: '1.1rem', fontWeight: '600', textAlign: 'center',
            color: selected === problem.answer ? '#16a34a' : '#dc2626',
          }}>
            {selected === problem.answer
              ? (isEn ? `🌟 Correct! ${bigger} is more than ${smaller}!` : `🌟 对啦！${bigger} 比 ${smaller} 多！`)
              : (isEn ? `💡 ${bigger} is actually more. Keep trying!` : `💡 ${bigger} 才是更多哦，再加油！`)}
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


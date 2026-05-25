import React, { useState, useEffect, useCallback } from 'react';
import { audioSynth } from '../utils/audioSynth';

const EMOJI_SETS = ['🍎', '⭐', '🎈', '🌸', '🍭', '🐱', '🦋', '🍬', '🐧', '🌈'];

function generateProblem() {
  const num1 = Math.floor(Math.random() * 9) + 1;
  let num2;
  do { num2 = Math.floor(Math.random() * 9) + 1; } while (num2 === num1);
  const emoji = EMOJI_SETS[Math.floor(Math.random() * EMOJI_SETS.length)];
  const answer = num1 > num2 ? 'left' : 'right';
  return { num1, num2, emoji, answer };
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

export default function CompareGame() {
  const [problem, setProblem] = useState(null);
  const [selected, setSelected] = useState(null);
  const [sessionCount, setSessionCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const next = useCallback(() => {
    setProblem(generateProblem());
    setSelected(null);
  }, []);

  useEffect(() => { next(); }, []);

  const handleChoice = (side) => {
    if (selected !== null) return;
    setSelected(side);
    setSessionCount(p => p + 1);
    if (side === problem.answer) {
      audioSynth.playCorrect();
      setCorrectCount(p => p + 1);
      setTimeout(next, 1200);
    } else {
      audioSynth.playIncorrect();
      setTimeout(next, 1800);
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

  const bigger = Math.max(problem.num1, problem.num2);
  const smaller = Math.min(problem.num1, problem.num2);

  return (
    <div className="screen-wrapper fade-in" style={{ justifyContent: 'flex-start', gap: '18px', paddingBottom: '20px', overflowY: 'auto' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '1.3rem', fontWeight: '700', color: '#c0487a', marginBottom: '4px' }}>
          ⚖️ 哪边更多？点一点！
        </div>
        <div style={{ fontSize: '0.9rem', color: '#d4879e', fontWeight: '600' }}>
          📝 本次 {sessionCount} 题 · ✅ 答对 {correctCount} 题
        </div>
      </div>

      <div style={{ display: 'flex', gap: '14px', width: '100%', maxWidth: '400px', alignItems: 'stretch' }}>
        <button onClick={() => handleChoice('left')} style={getBoxStyle('left')}>
          <EmojiGrid count={problem.num1} emoji={problem.emoji} />
          <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#c06080' }}>{problem.num1}</span>
        </button>

        <div style={{
          display: 'flex', alignItems: 'center', fontSize: '1.6rem',
          color: '#f5c0d0', fontWeight: '700', flexShrink: 0,
        }}>VS</div>

        <button onClick={() => handleChoice('right')} style={getBoxStyle('right')}>
          <EmojiGrid count={problem.num2} emoji={problem.emoji} />
          <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#c06080' }}>{problem.num2}</span>
        </button>
      </div>

      {selected !== null && (
        <div style={{
          fontSize: '1.1rem', fontWeight: '700', textAlign: 'center',
          color: selected === problem.answer ? '#16a34a' : '#dc2626',
          animation: 'fadeIn 0.3s ease',
        }}>
          {selected === problem.answer
            ? `🌟 对啦！${bigger} 比 ${smaller} 多！`
            : `💡 ${bigger} 才是更多哦，再加油！`}
        </div>
      )}
    </div>
  );
}

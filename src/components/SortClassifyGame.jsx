import React, { useState, useEffect, useCallback } from 'react';
import { audioSynth } from '../utils/audioSynth';

// Sort & classify: tap items to place them in correct order
// Level 1: 3 numbers, sort ascending/descending
// Level 2: 3 numbers with larger range, sort
// Level 3: 4 numbers sort

function generateProblem(level) {
  const count = level === 3 ? 4 : 3;
  const max = level === 1 ? 20 : level === 2 ? 50 : 99;
  const direction = Math.random() > 0.5 ? 'asc' : 'desc';

  let nums = [];
  while (nums.length < count) {
    const n = Math.floor(Math.random() * max) + 1;
    if (!nums.includes(n)) nums.push(n);
  }

  const sorted = [...nums].sort((a, b) => direction === 'asc' ? a - b : b - a);
  const shuffled = [...nums].sort(() => Math.random() - 0.5);
  // Make sure shuffled != sorted
  if (JSON.stringify(shuffled) === JSON.stringify(sorted)) shuffled.reverse();

  return { nums: shuffled, sorted, direction, count };
}

export default function SortClassifyGame({ lang = 'zh', onBack }) {
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [problem, setProblem] = useState(null);
  const [slots, setSlots] = useState([]); // filled answers
  const [remaining, setRemaining] = useState([]); // cards still available
  const [feedback, setFeedback] = useState(null);

  const zh = lang === 'zh';

  const newProblem = useCallback(() => {
    const p = generateProblem(level);
    setProblem(p);
    setSlots(Array(p.count).fill(null));
    setRemaining([...p.nums]);
    setFeedback(null);
  }, [level]);

  useEffect(() => { newProblem(); }, [newProblem]);

  const handleCardClick = (num) => {
    if (feedback) return;
    audioSynth.playClick();
    // Place into first empty slot
    const emptyIdx = slots.findIndex(s => s === null);
    if (emptyIdx === -1) return;
    const newSlots = [...slots];
    newSlots[emptyIdx] = num;
    setSlots(newSlots);
    setRemaining(r => r.filter((n, i) => {
      if (n === num) { num = null; return false; } // remove first occurrence
      return true;
    }));
  };

  const handleSlotClick = (idx) => {
    if (feedback) return;
    const num = slots[idx];
    if (num === null) return;
    audioSynth.playClick();
    const newSlots = [...slots];
    newSlots[idx] = null;
    setSlots(newSlots);
    setRemaining(r => [...r, num]);
  };

  const handleCheck = () => {
    if (!problem || feedback) return;
    if (slots.some(s => s === null)) return; // not all filled
    const correct = JSON.stringify(slots) === JSON.stringify(problem.sorted);
    if (correct) {
      audioSynth.playCorrect();
      setFeedback('correct');
      const ns = streak + 1;
      setStreak(ns);
      if (ns >= 4 && level < 3) { setLevel(l => l + 1); setStreak(0); }
    } else {
      audioSynth.playIncorrect();
      setFeedback('wrong');
      setStreak(0);
    }
  };

  if (!problem) return null;

  const dirLabel = problem.direction === 'asc'
    ? (zh ? '从小到大 ↑' : 'Smallest → Largest')
    : (zh ? '从大到小 ↓' : 'Largest → Smallest');

  const CARD_COLORS = [
    'linear-gradient(135deg, #60a5fa, #3b82f6)',
    'linear-gradient(135deg, #f9a8d4, #ec4899)',
    'linear-gradient(135deg, #86efac, #22c55e)',
    'linear-gradient(135deg, #fcd34d, #f59e0b)',
  ];

  const cardNumColor = (num) => {
    const idx = problem.nums.indexOf(num) % 4;
    return CARD_COLORS[idx >= 0 ? idx : 0];
  };

  return (
    <div className="screen-wrapper fade-in" style={{ gap: '16px', paddingTop: '10px', paddingBottom: '20px' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '92%', maxWidth: '380px' }}>
        <button className="bouncy-button secondary" onClick={onBack} style={{ padding: '10px 16px' }}>🏠</button>
        <div style={{ flex: 1, textAlign: 'center', fontWeight: '700', fontSize: '1.1rem', color: '#7c3aed' }}>
          {zh ? '🎯 分类与排列' : '🎯 Sort & Classify'}
        </div>
        <div style={{ background: 'linear-gradient(135deg, #c4b5fd, #7c3aed)', color: 'white', borderRadius: '50px', padding: '6px 14px', fontSize: '0.88rem', fontWeight: '700' }}>
          Lv {level}
        </div>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(16px)', borderRadius: '28px',
        padding: '24px 18px', border: '2px solid rgba(255,255,255,0.7)',
        boxShadow: '0 8px 32px rgba(124,58,237,0.15)', width: '92%', maxWidth: '380px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px',
      }}>
        {/* Direction label */}
        <div style={{
          background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)', borderRadius: '50px',
          padding: '8px 20px', fontWeight: '800', fontSize: '1.1rem', color: '#5b21b6',
          boxShadow: '0 2px 8px rgba(124,58,237,0.15)',
        }}>
          {dirLabel}
        </div>

        {/* Instruction */}
        <div style={{ fontSize: '0.92rem', color: '#6d28d9', fontWeight: '600', textAlign: 'center' }}>
          {zh ? '👆 按顺序点击数字，填入格子中' : '👆 Tap numbers in order to fill the boxes'}
        </div>

        {/* Slots (answer area) */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {slots.map((val, idx) => (
            <div key={idx} onClick={() => handleSlotClick(idx)} style={{
              width: '72px', height: '72px', borderRadius: '18px', cursor: val !== null ? 'pointer' : 'default',
              background: val !== null
                ? (feedback === 'correct' ? 'linear-gradient(135deg,#4ade80,#22c55e)' : feedback === 'wrong' && problem.sorted[idx] !== val ? 'linear-gradient(135deg,#fca5a5,#ef4444)' : cardNumColor(val))
                : 'rgba(237,233,254,0.5)',
              border: `3px dashed ${val !== null ? 'transparent' : '#c4b5fd'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.8rem', fontWeight: '900',
              color: val !== null ? 'white' : '#c4b5fd',
              boxShadow: val !== null ? '0 4px 12px rgba(124,58,237,0.25)' : 'none',
              transition: 'all 0.2s',
            }}>
              {val ?? <span style={{ fontSize: '1.4rem' }}>?</span>}
              {feedback === 'wrong' && val !== null && problem.sorted[idx] !== val && (
                <div style={{ position: 'absolute', bottom: '-20px', fontSize: '0.7rem', color: '#dc2626', fontWeight: '700' }}>
                  应为{problem.sorted[idx]}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Arrow indicators */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', width: '100%' }}>
          {Array.from({ length: problem.count - 1 }, (_, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: '1.4rem', color: '#7c3aed', fontWeight: '700' }}>
              {problem.direction === 'asc' ? '→' : '→'}
            </div>
          ))}
        </div>

        {/* Available cards */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', minHeight: '72px' }}>
          {remaining.map((num, i) => (
            <div key={`${num}-${i}`} onClick={() => handleCardClick(num)} style={{
              width: '72px', height: '72px', borderRadius: '18px', cursor: 'pointer',
              background: cardNumColor(num),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.8rem', fontWeight: '900', color: 'white',
              boxShadow: '0 4px 14px rgba(124,58,237,0.25)',
              transform: 'scale(1)', transition: 'all 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              {num}
            </div>
          ))}
        </div>

        {/* Check button */}
        {!feedback && slots.every(s => s !== null) && (
          <button className="bouncy-button primary" onClick={handleCheck} style={{ padding: '13px 28px', fontSize: '1rem' }}>
            {zh ? '✓ 检查答案' : '✓ Check Answer'}
          </button>
        )}

        {feedback && (
          <div style={{
            padding: '12px 20px', borderRadius: '16px', fontWeight: '700', fontSize: '1rem', width: '100%', textAlign: 'center',
            background: feedback === 'correct' ? '#dcfce7' : '#fee2e2',
            color: feedback === 'correct' ? '#16a34a' : '#dc2626',
          }}>
            {feedback === 'correct'
              ? (zh ? '🌟 排列正确！数序感真棒！' : '🌟 Perfect order! Great number sense!')
              : (zh ? `💡 正确顺序是：${problem.sorted.join(' → ')}` : `💡 Correct order: ${problem.sorted.join(' → ')}`)}
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

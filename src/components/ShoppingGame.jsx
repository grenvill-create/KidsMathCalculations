import React, { useState, useCallback } from 'react';
import { audioSynth } from '../utils/audioSynth';

const ITEMS = [
  { name: '苹果', emoji: '🍎' },
  { name: '香蕉', emoji: '🍌' },
  { name: '橙子', emoji: '🍊' },
  { name: '草莓', emoji: '🍓' },
  { name: '饼干', emoji: '🍪' },
  { name: '糖果', emoji: '🍬' },
  { name: '铅笔', emoji: '✏️' },
  { name: '气球', emoji: '🎈' },
];

function generateProblem() {
  // Randomly pick question type: single item × qty, or sum of two items
  const type = Math.random() > 0.5 ? 'multiply' : 'add';

  if (type === 'multiply') {
    const item = ITEMS[Math.floor(Math.random() * ITEMS.length)];
    const price = Math.floor(Math.random() * 4) + 1; // 1-4 yuan each
    const qty = Math.floor(Math.random() * 4) + 2; // 2-5 items
    const answer = price * qty;
    const wrong = new Set();
    while (wrong.size < 3) {
      const w = Math.floor(Math.random() * 5) + 1;
      if (w !== answer) wrong.add(w);
    }
    const choices = [answer, ...wrong].sort(() => Math.random() - 0.5);
    return { type, item, price, qty, answer, choices };
  } else {
    // Two different items, sum their prices
    const shuffled = [...ITEMS].sort(() => Math.random() - 0.5);
    const item1 = shuffled[0];
    const item2 = shuffled[1];
    const price1 = Math.floor(Math.random() * 4) + 1;
    const price2 = Math.floor(Math.random() * 4) + 1;
    const answer = price1 + price2;
    const wrong = new Set();
    while (wrong.size < 3) {
      const w = Math.floor(Math.random() * 8) + 1;
      if (w !== answer) wrong.add(w);
    }
    const choices = [answer, ...wrong].sort(() => Math.random() - 0.5);
    return { type, item1, item2, price1, price2, answer, choices };
  }
}

export default function ShoppingGame() {
  const [problem, setProblem] = useState(generateProblem);
  const [selected, setSelected] = useState(null);
  const [sessionCount, setSessionCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const next = useCallback(() => {
    setProblem(generateProblem());
    setSelected(null);
  }, []);

  const handleChoice = (val) => {
    if (selected !== null) return;
    setSelected(val);
    setSessionCount(p => p + 1);
    if (val === problem.answer) {
      audioSynth.playCorrect();
      setCorrectCount(p => p + 1);
      setTimeout(next, 1400);
    } else {
      audioSynth.playIncorrect();
      setTimeout(next, 1800);
    }
  };

  const renderScene = () => {
    if (problem.type === 'multiply') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {Array.from({ length: problem.qty }, (_, i) => (
              <div key={i} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                background: 'rgba(255,181,200,0.2)', borderRadius: '14px', padding: '8px 12px',
                border: '1.5px solid rgba(255,143,171,0.3)',
              }}>
                <span style={{ fontSize: '2rem' }}>{problem.item.emoji}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#c06080' }}>{problem.price}元</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#c0487a' }}>
            买 {problem.qty} 个{problem.item.name}，一共要多少元？
          </div>
        </div>
      );
    } else {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {[{ item: problem.item1, price: problem.price1 }, { item: problem.item2, price: problem.price2 }].map(({ item, price }, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span style={{ fontSize: '1.5rem', color: '#ff85b8', fontWeight: '700' }}>+</span>}
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  background: 'rgba(255,181,200,0.2)', borderRadius: '14px', padding: '12px 16px',
                  border: '1.5px solid rgba(255,143,171,0.3)',
                }}>
                  <span style={{ fontSize: '2.2rem' }}>{item.emoji}</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#c06080' }}>{price}元</span>
                </div>
              </React.Fragment>
            ))}
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#c0487a' }}>
            买这两样东西，一共要多少元？
          </div>
        </div>
      );
    }
  };

  return (
    <div className="screen-wrapper fade-in" style={{ justifyContent: 'flex-start', gap: '18px', paddingBottom: '20px', overflowY: 'auto' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '1.3rem', fontWeight: '700', color: '#c0487a', marginBottom: '4px' }}>
          🛒 小小购物达人
        </div>
        <div style={{ fontSize: '0.9rem', color: '#d4879e', fontWeight: '600' }}>
          📝 本次 {sessionCount} 题 · ✅ 答对 {correctCount} 题
        </div>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.85)', borderRadius: '28px', padding: '20px',
        width: '100%', maxWidth: '380px',
        boxShadow: '0 8px 30px rgba(255,93,158,0.1)', border: '2.5px solid rgba(255,255,255,0.9)',
      }}>
        {renderScene()}
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
              {val}元
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <div style={{ fontSize: '1.1rem', fontWeight: '700', textAlign: 'center',
          color: selected === problem.answer ? '#16a34a' : '#dc2626' }}>
          {selected === problem.answer ? `🌟 算对了！一共 ${problem.answer} 元！` : `💡 答案是 ${problem.answer} 元哦！`}
        </div>
      )}
    </div>
  );
}

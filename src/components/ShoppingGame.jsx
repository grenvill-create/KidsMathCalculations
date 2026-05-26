import React, { useState, useEffect, useCallback } from 'react';
import { audioSynth } from '../utils/audioSynth';

const ITEMS = [
  { key: 'apple', nameZh: '苹果', nameEn: 'Apple', emoji: '🍎' },
  { key: 'banana', nameZh: '香蕉', nameEn: 'Banana', emoji: '🍌' },
  { key: 'orange', nameZh: '橙子', nameEn: 'Orange', emoji: '🍊' },
  { key: 'strawberry', nameZh: '草莓', nameEn: 'Strawberry', emoji: '🍓' },
  { key: 'cookie', nameZh: '饼干', nameEn: 'Cookie', emoji: '🍪' },
  { key: 'candy', nameZh: '糖果', nameEn: 'Candy', emoji: '🍬' },
  { key: 'pencil', nameZh: '铅笔', nameEn: 'Pencil', emoji: '✏️' },
  { key: 'balloon', nameZh: '气球', nameEn: 'Balloon', emoji: '🎈' },
];

const getPluralName = (item, qty) => {
  if (qty <= 1) return item.nameEn;
  if (item.key === 'strawberry') return 'Strawberries';
  if (item.key === 'cookie') return 'Cookies';
  return item.nameEn + 's';
};

function generateProblem(level) {
  if (level === 1) {
    // Easy: Addition of two items, prices 1-5
    const shuffled = [...ITEMS].sort(() => Math.random() - 0.5);
    const item1 = shuffled[0];
    const item2 = shuffled[1];
    const price1 = Math.floor(Math.random() * 5) + 1;
    const price2 = Math.floor(Math.random() * 5) + 1;
    const answer = price1 + price2;
    const wrong = new Set();
    while (wrong.size < 3) {
      const w = Math.floor(Math.random() * 10) + 1;
      if (w !== answer) wrong.add(w);
    }
    const choices = [answer, ...wrong].sort((a, b) => a - b);
    return { type: 'add', item1, item2, price1, price2, answer, choices };
  } else if (level === 2) {
    // Medium: Simple multiply (qty 2-3, price 1-4) or addition (prices 1-8)
    const isMultiply = Math.random() > 0.5;
    if (isMultiply) {
      const item = ITEMS[Math.floor(Math.random() * ITEMS.length)];
      const price = Math.floor(Math.random() * 4) + 1;
      const qty = Math.floor(Math.random() * 2) + 2; // 2 or 3
      const answer = price * qty;
      const wrong = new Set();
      while (wrong.size < 3) {
        const w = Math.floor(Math.random() * 12) + 1;
        if (w !== answer) wrong.add(w);
      }
      const choices = [answer, ...wrong].sort((a, b) => a - b);
      return { type: 'multiply', item, price, qty, answer, choices };
    } else {
      const shuffled = [...ITEMS].sort(() => Math.random() - 0.5);
      const item1 = shuffled[0];
      const item2 = shuffled[1];
      const price1 = Math.floor(Math.random() * 8) + 1;
      const price2 = Math.floor(Math.random() * 8) + 1;
      const answer = price1 + price2;
      const wrong = new Set();
      while (wrong.size < 3) {
        const w = Math.floor(Math.random() * 16) + 1;
        if (w !== answer) wrong.add(w);
      }
      const choices = [answer, ...wrong].sort((a, b) => a - b);
      return { type: 'add', item1, item2, price1, price2, answer, choices };
    }
  } else {
    // Hard: Making change riddle! Wallet of 10 or 20, buying two items.
    const wallet = Math.random() > 0.5 ? 10 : 20;
    const shuffled = [...ITEMS].sort(() => Math.random() - 0.5);
    const item1 = shuffled[0];
    const item2 = shuffled[1];
    
    // Choose prices so their sum is strictly less than wallet
    let price1, price2;
    if (wallet === 10) {
      price1 = Math.floor(Math.random() * 4) + 1; // 1-4
      price2 = Math.floor(Math.random() * 4) + 1; // 1-4
    } else {
      price1 = Math.floor(Math.random() * 7) + 2; // 2-8
      price2 = Math.floor(Math.random() * 7) + 2; // 2-8
    }
    const answer = wallet - (price1 + price2);
    const wrong = new Set();
    while (wrong.size < 3) {
      const w = Math.floor(Math.random() * (wallet - 2)) + 1;
      if (w !== answer) wrong.add(w);
    }
    const choices = [answer, ...wrong].sort((a, b) => a - b);
    return { type: 'change', wallet, item1, item2, price1, price2, answer, choices };
  }
}

export default function ShoppingGame({ autoAdvance, lang = 'zh', difficultyMode = 'adaptive' }) {
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
  const currencySymbol = isEn ? 'Yuan' : '元';

  const renderScene = () => {
    if (problem.type === 'multiply') {
      const itemName = isEn ? getPluralName(problem.item, problem.qty) : problem.item.nameZh;
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
                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#c06080' }}>
                  {problem.price} {currencySymbol}
                </span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#c0487a', textAlign: 'center', lineHeight: 1.4 }}>
            {isEn
              ? `Buy ${problem.qty} ${itemName}, how many Yuan in total?`
              : `买 ${problem.qty} 个${problem.item.nameZh}，一共要多少元？`}
          </div>
        </div>
      );
    } else if (problem.type === 'add') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {[{ item: problem.item1, price: problem.price1 }, { item: problem.item2, price: problem.price2 }].map(({ item, price }, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span style={{ fontSize: '1.5rem', color: '#ff85b8', fontWeight: '600' }}>+</span>}
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  background: 'rgba(255,181,200,0.2)', borderRadius: '14px', padding: '12px 16px',
                  border: '1.5px solid rgba(255,143,171,0.3)',
                }}>
                  <span style={{ fontSize: '2.2rem' }}>{item.emoji}</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#c06080' }}>
                    {price} {currencySymbol}
                  </span>
                </div>
              </React.Fragment>
            ))}
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#c0487a', textAlign: 'center', lineHeight: 1.4 }}>
            {isEn
              ? 'Buy these two items, how many Yuan in total?'
              : '买这两样东西，一共要多少元？'}
          </div>
        </div>
      );
    } else {
      // change-making logic puzzle
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          {/* Wallet */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
            padding: '10px 20px', borderRadius: '20px', border: '2px solid #f59e0b',
            boxShadow: '0 4px 10px rgba(245,158,11,0.15)'
          }}>
            <span style={{ fontSize: '2.2rem' }}>👛</span>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#b45309' }}>
                {isEn ? 'MY WALLET' : '我的钱包'}
              </span>
              <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#b45309' }}>
                {problem.wallet} {currencySymbol}
              </span>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '6px' }}>
            {[{ item: problem.item1, price: problem.price1 }, { item: problem.item2, price: problem.price2 }].map(({ item, price }, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span style={{ fontSize: '1.2rem', color: '#ff85b8', fontWeight: '600' }}>+</span>}
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  background: 'rgba(255,181,200,0.15)', borderRadius: '12px', padding: '8px 12px',
                  border: '1.5px solid rgba(255,143,171,0.2)',
                }}>
                  <span style={{ fontSize: '1.8rem' }}>{item.emoji}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#c06080' }}>
                    {price} {currencySymbol}
                  </span>
                </div>
              </React.Fragment>
            ))}
          </div>
          
          <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#c0487a', textAlign: 'center', lineHeight: 1.45 }}>
            {isEn
              ? `You buy these two items. How much change do you get?`
              : `你买了这两样东西。应该找回多少元？`}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="screen-wrapper fade-in" style={{ justifyContent: 'flex-start', gap: '18px', paddingBottom: '20px', overflowY: 'auto' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '1.3rem', fontWeight: '600', color: '#c0487a', marginBottom: '4px' }}>
          {isEn ? '🛒 Little Shopper' : '🛒 小小购物达人'}
        </div>
        <div style={{ fontSize: '0.9rem', color: '#d4879e', fontWeight: '600' }}>
          {isEn
            ? `📝 Total: ${sessionCount} · ✅ Correct: ${correctCount}`
            : `📝 本次 ${sessionCount} 题 · ✅ 答对 ${correctCount} 题`}
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
              padding: '18px 8px', borderRadius: '20px',
              border: `3px solid ${border}`, background: bg, color,
              fontWeight: '600', fontSize: isEn ? '1.3rem' : '1.6rem',
              cursor: selected !== null ? 'default' : 'pointer',
              fontFamily: 'Fredoka, sans-serif',
              boxShadow: '0 4px 12px rgba(255,93,158,0.1)',
              transition: 'all 0.2s ease',
            }}>
              {val} {currencySymbol}
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <div className="bounce-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: '600', textAlign: 'center',
            color: selected === problem.answer ? '#16a34a' : '#dc2626' }}>
            {selected === problem.answer
              ? (isEn ? `🌟 Correct! It is ${problem.answer} Yuan in total!` : `🌟 算对了！一共 ${problem.answer} 元！`)
              : (isEn ? `💡 The answer is ${problem.answer} Yuan!` : `💡 答案是 ${problem.answer} 元哦！`)}
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

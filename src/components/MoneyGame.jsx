import React, { useState, useEffect, useCallback } from 'react';
import { audioSynth } from '../utils/audioSynth';

// RMB denominations
const COINS = [
  { val: 0.1, label: '1角', labelEn: '1 jiao', emoji: '🪙', color: '#fbbf24' },
  { val: 0.5, label: '5角', labelEn: '5 jiao', emoji: '🪙', color: '#f59e0b' },
  { val: 1,   label: '1元', labelEn: '1 yuan', emoji: '🟡', color: '#d97706' },
];
const BILLS = [
  { val: 1,   label: '1元',  labelEn: '1¥',  color: '#86efac', textColor: '#065f46' },
  { val: 2,   label: '2元',  labelEn: '2¥',  color: '#6ee7b7', textColor: '#065f46' },
  { val: 5,   label: '5元',  labelEn: '5¥',  color: '#fde68a', textColor: '#92400e' },
  { val: 10,  label: '10元', labelEn: '10¥', color: '#93c5fd', textColor: '#1e40af' },
  { val: 20,  label: '20元', labelEn: '20¥', color: '#c4b5fd', textColor: '#5b21b6' },
  { val: 50,  label: '50元', labelEn: '50¥', color: '#fca5a5', textColor: '#991b1b' },
  { val: 100, label: '100元',labelEn: '100¥',color: '#fed7aa', textColor: '#92400e' },
];

function roundTo(n, digits = 1) {
  return Math.round(n * 10 ** digits) / 10 ** digits;
}

function generateProblem(level) {
  if (level === 1) {
    // Show 2-4 bills, ask total
    const count = Math.floor(Math.random() * 3) + 2;
    const pool = BILLS.filter(b => b.val <= 10);
    const notes = Array.from({ length: count }, () => pool[Math.floor(Math.random() * pool.length)]);
    const total = notes.reduce((s, n) => s + n.val, 0);
    return { mode: 'count', notes, total, coins: [] };
  } else if (level === 2) {
    // Mix of bills and coins
    const billCount = Math.floor(Math.random() * 3) + 1;
    const coinCount = Math.floor(Math.random() * 3) + 1;
    const billPool = BILLS.filter(b => b.val <= 20);
    const notes = Array.from({ length: billCount }, () => billPool[Math.floor(Math.random() * billPool.length)]);
    const coins = Array.from({ length: coinCount }, () => COINS[Math.floor(Math.random() * COINS.length)]);
    const total = roundTo(notes.reduce((s, n) => s + n.val, 0) + coins.reduce((s, c) => s + c.val, 0));
    return { mode: 'count', notes, coins, total };
  } else {
    // "How much change do you get back?" scenario
    const billPool = BILLS.filter(b => b.val <= 20);
    const price = Math.floor(Math.random() * 19) + 1;
    const paid = BILLS.filter(b => b.val > price)[0] || { val: 100, label: '100元', color: '#fed7aa', textColor: '#92400e' };
    const change = paid.val - price;
    return { mode: 'change', price, paid, change };
  }
}

function Bill({ bill, count = 1 }) {
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
        <div key={i} style={{
          position: i === 0 ? 'relative' : 'absolute',
          top: i === 0 ? 0 : -i * 3,
          left: i === 0 ? 0 : i * 3,
          width: '72px', height: '36px',
          background: `linear-gradient(135deg, ${bill.color}, ${bill.color}cc)`,
          borderRadius: '8px',
          border: '2px solid rgba(255,255,255,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          fontFamily: 'Fredoka, sans-serif', fontWeight: '900', fontSize: '1rem',
          color: bill.textColor,
        }}>
          {bill.label}
        </div>
      ))}
    </div>
  );
}

export default function MoneyGame({ lang = 'zh', onBack }) {
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [problem, setProblem] = useState(null);
  const [userAns, setUserAns] = useState('');
  const [feedback, setFeedback] = useState(null);

  const zh = lang === 'zh';

  const newProblem = useCallback(() => {
    setProblem(generateProblem(level));
    setUserAns('');
    setFeedback(null);
  }, [level]);

  useEffect(() => { newProblem(); }, [newProblem]);

  const handlePad = (k) => {
    if (feedback) return;
    audioSynth.playClick();
    if (k === 'C') { setUserAns(''); return; }
    if (k === '✓') { submit(); return; }
    if (userAns.length < 5) setUserAns(p => p + k);
  };

  const submit = () => {
    if (!problem || !userAns) return;
    const ans = problem.mode === 'count' ? problem.total : problem.change;
    const correct = parseFloat(userAns) === ans;
    if (correct) {
      audioSynth.playCorrect();
      setFeedback('correct');
      const ns = streak + 1;
      setStreak(ns);
      if (ns >= 3 && level < 3) { setLevel(l => l + 1); setStreak(0); }
    } else {
      audioSynth.playIncorrect();
      setFeedback('wrong');
      setStreak(0);
    }
  };

  if (!problem) return null;

  const ans = problem.mode === 'count' ? problem.total : problem.change;

  return (
    <div className="screen-wrapper fade-in" style={{ gap: '16px', paddingTop: '10px', paddingBottom: '20px' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '92%', maxWidth: '380px' }}>
        <button className="bouncy-button secondary" onClick={onBack} style={{ padding: '10px 16px' }}>🏠</button>
        <div style={{ flex: 1, textAlign: 'center', fontWeight: '700', fontSize: '1.1rem', color: '#166534' }}>
          {zh ? '💰 钱币认知' : '💰 Money Math'}
        </div>
        <div style={{ background: 'linear-gradient(135deg,#86efac,#16a34a)', color: 'white', borderRadius: '50px', padding: '6px 14px', fontSize: '0.88rem', fontWeight: '700' }}>
          Lv {level}
        </div>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(16px)',
        borderRadius: '28px', padding: '24px 16px',
        border: '2px solid rgba(255,255,255,0.7)',
        boxShadow: '0 8px 32px rgba(22,163,74,0.15)',
        width: '92%', maxWidth: '380px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px',
      }}>

        {/* COUNT mode */}
        {problem.mode === 'count' && (
          <>
            <div style={{ fontWeight: '700', color: '#166534', fontSize: '1rem' }}>
              {zh ? '💸 数一数，这些钱合计多少元？' : '💸 Count the money. What is the total?'}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
              {problem.notes.map((n, i) => <Bill key={i} bill={n} />)}
              {problem.coins && problem.coins.map((c, i) => (
                <div key={i} style={{
                  width: '44px', height: '44px', borderRadius: '50%',
                  background: `radial-gradient(circle, ${c.color}, #d97706)`,
                  border: '3px solid rgba(255,255,255,0.6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', fontWeight: '800', color: 'white',
                  boxShadow: '0 3px 8px rgba(0,0,0,0.2)',
                }}>
                  {c.label}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ fontWeight: '700', color: '#166534' }}>{zh ? '合计 =' : 'Total ='}</div>
              <div style={{
                minWidth: '90px', height: '52px', borderRadius: '14px',
                border: `3px solid ${feedback === 'correct' ? '#22c55e' : feedback === 'wrong' ? '#ef4444' : '#bbf7d0'}`,
                background: feedback === 'correct' ? '#dcfce7' : feedback === 'wrong' ? '#fee2e2' : 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.8rem', fontWeight: '900', color: '#166534',
              }}>
                {userAns || <span style={{ opacity: 0.3 }}>?</span>}
              </div>
              <div style={{ fontWeight: '700', color: '#166534' }}>{zh ? '元' : '¥'}</div>
            </div>
          </>
        )}

        {/* CHANGE mode */}
        {problem.mode === 'change' && (
          <>
            <div style={{ fontWeight: '700', color: '#166534', fontSize: '1rem', textAlign: 'center' }}>
              {zh ? `🛒 商品价格 ${problem.price} 元，付了一张 ${problem.paid.label}，应找回多少钱？` : `🛒 Item costs ¥${problem.price}. Paid with ¥${problem.paid.val}. How much change?`}
            </div>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: '600', marginBottom: '4px' }}>{zh ? '商品价格' : 'Price'}</div>
                <div style={{
                  padding: '12px 18px', background: '#fee2e2', borderRadius: '14px',
                  fontWeight: '900', fontSize: '1.6rem', color: '#dc2626',
                  border: '2px solid #fca5a5',
                }}>
                  ¥{problem.price}
                </div>
              </div>
              <div style={{ fontSize: '1.6rem', color: '#166534' }}>←</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: '600', marginBottom: '4px' }}>{zh ? '付款' : 'Paid'}</div>
                <Bill bill={problem.paid} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ fontWeight: '700', color: '#166534' }}>{zh ? '找零 =' : 'Change ='}</div>
              <div style={{
                minWidth: '90px', height: '52px', borderRadius: '14px',
                border: `3px solid ${feedback === 'correct' ? '#22c55e' : feedback === 'wrong' ? '#ef4444' : '#bbf7d0'}`,
                background: feedback === 'correct' ? '#dcfce7' : feedback === 'wrong' ? '#fee2e2' : 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.8rem', fontWeight: '900', color: '#166534',
              }}>
                {userAns || <span style={{ opacity: 0.3 }}>?</span>}
              </div>
              <div style={{ fontWeight: '700', color: '#166534' }}>{zh ? '元' : '¥'}</div>
            </div>
          </>
        )}

        {feedback && (
          <div style={{
            padding: '12px 18px', borderRadius: '16px', fontWeight: '700', fontSize: '1rem',
            width: '100%', textAlign: 'center',
            background: feedback === 'correct' ? '#dcfce7' : '#fee2e2',
            color: feedback === 'correct' ? '#16a34a' : '#dc2626',
          }}>
            {feedback === 'correct'
              ? (zh ? `🌟 算对啦！是 ${ans} 元！` : `🌟 Correct! ¥${ans}!`)
              : (zh ? `💡 正确答案是 ${ans} 元` : `💡 Correct answer: ¥${ans}`)}
          </div>
        )}
      </div>

      {!feedback && (
        <div className="keypad-grid" style={{ maxWidth: '340px' }}>
          {['1','2','3','4','5','6','7','8','9','C','0','✓'].map(k => (
            <button key={k}
              className={`keypad-btn ${k === 'C' ? 'action-clear' : k === '✓' ? 'action-submit' : ''}`}
              onClick={() => handlePad(k)}>
              {k}
            </button>
          ))}
        </div>
      )}

      {feedback && (
        <button className="bouncy-button primary" onClick={newProblem} style={{ padding: '14px 32px', fontSize: '1.1rem' }}>
          {zh ? '下一题 ➔' : 'Next ➔'}
        </button>
      )}
    </div>
  );
}

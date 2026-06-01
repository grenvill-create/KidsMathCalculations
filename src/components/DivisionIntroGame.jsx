import React, { useState, useEffect, useCallback } from 'react';
import { audioSynth } from '../utils/audioSynth';

const ITEMS = [
  { emoji: '🍎', nameZh: '苹果' , nameEn: 'Apple' },
  { emoji: '🍭', nameZh: '糖果' , nameEn: 'Candy' },
  { emoji: '⭐', nameZh: '星星' , nameEn: 'Star'  },
  { emoji: '🍪', nameZh: '饼干' , nameEn: 'Cookie'},
  { emoji: '🎈', nameZh: '气球' , nameEn: 'Balloon'},
  { emoji: '🌸', nameZh: '花朵' , nameEn: 'Flower'},
  { emoji: '🍓', nameZh: '草莓' , nameEn: 'Berry' },
  { emoji: '🔵', nameZh: '球'   , nameEn: 'Ball'  },
];
const FRIENDS = ['🐱','🐶','🐰','🐻','🦊','🐸'];

function generateProblem(level) {
  const item = ITEMS[Math.floor(Math.random() * ITEMS.length)];
  const divisor = level === 1
    ? Math.floor(Math.random() * 3) + 2   // 2,3,4
    : level === 2
    ? Math.floor(Math.random() * 4) + 2   // 2-5
    : Math.floor(Math.random() * 5) + 2;  // 2-6

  const hasRemainder = level >= 2 && Math.random() > 0.5;
  const quotient = Math.floor(Math.random() * (level === 1 ? 4 : 6)) + 1;
  const remainder = hasRemainder ? Math.floor(Math.random() * (divisor - 1)) + 1 : 0;
  const total = divisor * quotient + remainder;

  const friends = FRIENDS.slice(0, divisor);
  return { item, divisor, quotient, remainder, total, friends };
}

// Animated distribution display
function DistributionDisplay({ item, divisor, quotient, remainder, friends, revealed, lang }) {
  const zh = lang === 'zh';
  return (
    <div style={{ width: '100%' }}>
      {/* Friends row */}
      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '10px' }}>
        {friends.map((f, fi) => (
          <div key={fi} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div style={{ fontSize: '2rem' }}>{f}</div>
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: '2px', maxWidth: '72px',
              justifyContent: 'center',
            }}>
              {Array.from({ length: revealed ? quotient : 0 }).map((_, ii) => (
                <span key={ii} style={{ fontSize: '1.2rem', animation: `pop-in 0.2s ${ii * 0.1}s both` }}>{item.emoji}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* Remainder */}
      {revealed && remainder > 0 && (
        <div style={{ textAlign: 'center', fontSize: '0.9rem', color: '#b45309', fontWeight: '700', marginTop: '4px' }}>
          {zh ? `还剩 ${remainder} 个 ${item.emoji} 没有分完` : `${remainder} ${item.nameEn}${remainder > 1 ? 's' : ''} left over`}
        </div>
      )}
    </div>
  );
}

export default function DivisionIntroGame({ lang = 'zh', onBack }) {
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [problem, setProblem] = useState(null);
  const [phase, setPhase] = useState('question'); // question | distributing | answer
  const [userAns, setUserAns] = useState('');
  const [userRem, setUserRem] = useState('');
  const [activeInput, setActiveInput] = useState('quotient');
  const [feedback, setFeedback] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const zh = lang === 'zh';

  const newProblem = useCallback(() => {
    const p = generateProblem(level);
    setProblem(p);
    setPhase('question');
    setUserAns('');
    setUserRem('');
    setActiveInput('quotient');
    setFeedback(null);
    setRevealed(false);
  }, [level]);

  useEffect(() => { newProblem(); }, [newProblem]);

  const handlePad = (k) => {
    if (feedback) return;
    audioSynth.playClick();
    if (k === 'C') {
      if (activeInput === 'quotient') setUserAns('');
      else setUserRem('');
      return;
    }
    if (k === '✓') { submit(); return; }
    if (activeInput === 'quotient' && userAns.length < 2) setUserAns(p => p + k);
    else if (activeInput === 'remainder' && userRem.length < 2) setUserRem(p => p + k);
  };

  const submit = () => {
    if (!problem) return;
    const qCorrect = parseInt(userAns) === problem.quotient;
    const rCorrect = problem.remainder === 0 || parseInt(userRem || '0') === problem.remainder;
    const noRemNeeded = problem.remainder === 0 && (!userRem || parseInt(userRem) === 0);
    const correct = qCorrect && (rCorrect || noRemNeeded);

    if (correct) {
      audioSynth.playCorrect();
      setFeedback('correct');
      setRevealed(true);
      const ns = streak + 1;
      setStreak(ns);
      if (ns >= 3 && level < 3) { setLevel(l => l + 1); setStreak(0); }
    } else {
      audioSynth.playIncorrect();
      setFeedback('wrong');
      setRevealed(true);
      setStreak(0);
    }
  };

  if (!problem) return null;
  const { item, divisor, quotient, remainder, total, friends } = problem;

  return (
    <div className="screen-wrapper fade-in" style={{ gap: '16px', paddingTop: '10px', paddingBottom: '20px' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '92%', maxWidth: '380px' }}>
        <button className="bouncy-button secondary" onClick={onBack} style={{ padding: '10px 16px' }}>🏠</button>
        <div style={{ flex: 1, textAlign: 'center', fontWeight: '700', fontSize: '1.1rem', color: '#065f46' }}>
          {zh ? '➗ 除法初步' : '➗ Division Intro'}
        </div>
        <div style={{ background: 'linear-gradient(135deg,#6ee7b7,#10b981)', color: 'white', borderRadius: '50px', padding: '6px 14px', fontSize: '0.88rem', fontWeight: '700' }}>
          Lv {level}
        </div>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(16px)',
        borderRadius: '28px', padding: '20px 16px',
        border: '2px solid rgba(255,255,255,0.7)',
        boxShadow: '0 8px 32px rgba(16,185,129,0.15)',
        width: '92%', maxWidth: '380px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
      }}>
        {/* Problem statement */}
        <div style={{ background: '#f0fdf4', borderRadius: '16px', padding: '12px 16px', width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '1.05rem', color: '#065f46', fontWeight: '700', marginBottom: '8px' }}>
            {zh
              ? `把 ${total} 个 ${item.emoji}${item.nameZh} 平均分给 ${divisor} 个小伙伴`
              : `Share ${total} ${item.emoji}${item.nameEn}s equally among ${divisor} friends`}
          </div>
          {/* Items pool */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', justifyContent: 'center' }}>
            {Array.from({ length: total }).map((_, i) => (
              <span key={i} style={{ fontSize: '1.4rem' }}>{item.emoji}</span>
            ))}
          </div>
        </div>

        {/* Division equation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.6rem', fontWeight: '900', color: '#065f46' }}>
          <span>{total}</span>
          <span>÷</span>
          <span>{divisor}</span>
          <span>=</span>
          <span style={{ color: '#7c3aed' }}>{feedback ? quotient : '?'}</span>
          {remainder > 0 && <><span style={{ fontSize: '1rem', color: '#92400e' }}>{zh ? '余' : 'R'}</span><span style={{ color: '#f59e0b' }}>{feedback ? remainder : '?'}</span></>}
        </div>

        {/* Friends distribution */}
        <DistributionDisplay {...{ item, divisor, quotient, remainder, friends, revealed, lang }} />

        {/* Input fields */}
        {!feedback && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div onClick={() => setActiveInput('quotient')} style={{ textAlign: 'center', cursor: 'pointer' }}>
              <div style={{ fontSize: '0.8rem', color: '#065f46', fontWeight: '700', marginBottom: '3px' }}>{zh ? '每人得几个？' : 'Each gets?'}</div>
              <div style={{
                width: '70px', height: '52px', borderRadius: '14px',
                border: `3px solid ${activeInput === 'quotient' ? '#10b981' : '#d1fae5'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.8rem', fontWeight: '900', color: '#065f46',
                background: 'white',
              }}>
                {userAns || <span style={{ opacity: 0.3 }}>?</span>}
              </div>
            </div>
            {level >= 2 && (
              <>
                <div style={{ fontSize: '1rem', color: '#b45309', fontWeight: '700' }}>{zh ? '余' : 'R'}</div>
                <div onClick={() => setActiveInput('remainder')} style={{ textAlign: 'center', cursor: 'pointer' }}>
                  <div style={{ fontSize: '0.8rem', color: '#b45309', fontWeight: '700', marginBottom: '3px' }}>{zh ? '余几个？' : 'Remainder?'}</div>
                  <div style={{
                    width: '60px', height: '52px', borderRadius: '14px',
                    border: `3px solid ${activeInput === 'remainder' ? '#f59e0b' : '#fef3c7'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.8rem', fontWeight: '900', color: '#b45309',
                    background: 'white',
                  }}>
                    {userRem || <span style={{ opacity: 0.3 }}>0</span>}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {feedback && (
          <div style={{
            padding: '12px 18px', borderRadius: '16px', fontWeight: '700', fontSize: '1rem',
            width: '100%', textAlign: 'center',
            background: feedback === 'correct' ? '#dcfce7' : '#fee2e2',
            color: feedback === 'correct' ? '#16a34a' : '#dc2626',
          }}>
            {feedback === 'correct'
              ? (zh ? `🌟 太棒！每人得 ${quotient} 个${remainder > 0 ? `，余 ${remainder} 个` : ''}！` : `🌟 Great! Each gets ${quotient}${remainder > 0 ? `, remainder ${remainder}` : ''}!`)
              : (zh ? `💡 答案：每人 ${quotient} 个${remainder > 0 ? `，余 ${remainder} 个` : ''}` : `💡 Answer: ${quotient} each${remainder > 0 ? `, remainder ${remainder}` : ''}`)}
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

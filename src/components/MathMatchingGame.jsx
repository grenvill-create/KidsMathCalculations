import React, { useState, useEffect, useCallback, useRef } from 'react';
import { audioSynth } from '../utils/audioSynth';

function buildRound(level) {
  const count = level === 1 ? 4 : level === 2 ? 5 : 6;
  const max = level === 1 ? 10 : level === 2 ? 20 : 50;
  const ops = level >= 3 ? ['+', '-', '×'] : ['+', '-'];

  const pairs = [];
  const usedAns = new Set();

  while (pairs.length < count) {
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a, b, ans;
    if (op === '+') {
      a = Math.floor(Math.random() * (max / 2)) + 1;
      b = Math.floor(Math.random() * (max / 2)) + 1;
      ans = a + b;
    } else if (op === '-') {
      ans = Math.floor(Math.random() * (max / 2)) + 1;
      b = Math.floor(Math.random() * ans) + 1;
      a = ans + b;
    } else {
      a = Math.floor(Math.random() * 5) + 2;
      b = Math.floor(Math.random() * 5) + 2;
      ans = a * b;
    }
    if (usedAns.has(ans)) continue;
    usedAns.add(ans);
    pairs.push({ expr: `${a} ${op} ${b}`, ans, id: pairs.length });
  }
  return pairs;
}

const PAIR_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899',
];

export default function MathMatchingGame({ lang = 'zh', onBack }) {
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [pairs, setPairs] = useState([]);
  const [rightNums, setRightNums] = useState([]);
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [matched, setMatched] = useState({}); // id -> true
  const [wrongFlash, setWrongFlash] = useState(null);
  const [roundDone, setRoundDone] = useState(false);
  const [errors, setErrors] = useState(0);

  const zh = lang === 'zh';

  const newRound = useCallback(() => {
    const p = buildRound(level);
    setPairs(p);
    setRightNums([...p].sort(() => Math.random() - 0.5));
    setSelectedLeft(null);
    setSelectedRight(null);
    setMatched({});
    setWrongFlash(null);
    setRoundDone(false);
    setErrors(0);
  }, [level]);

  useEffect(() => { newRound(); }, [newRound]);

  const tryMatch = (leftId, rightId) => {
    if (matched[leftId] || matched[rightId]) return;
    const leftPair = pairs.find(p => p.id === leftId);
    const rightPair = rightNums.find(p => p.id === rightId);
    if (!leftPair || !rightPair) return;

    if (leftPair.id === rightPair.id) {
      // Correct
      audioSynth.playCorrect();
      const newMatched = { ...matched, [leftId]: true };
      setMatched(newMatched);
      setSelectedLeft(null);
      setSelectedRight(null);
      if (Object.keys(newMatched).length === pairs.length) {
        setTimeout(() => setRoundDone(true), 300);
        const ns = streak + 1;
        setStreak(ns);
        if (ns >= 3 && level < 3) { setLevel(l => l + 1); setStreak(0); }
      }
    } else {
      // Wrong
      audioSynth.playIncorrect();
      setErrors(e => e + 1);
      setWrongFlash({ left: leftId, right: rightId });
      setTimeout(() => {
        setWrongFlash(null);
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 700);
    }
  };

  const handleLeftClick = (id) => {
    if (matched[id]) return;
    audioSynth.playClick();
    setSelectedLeft(id);
    if (selectedRight !== null) {
      tryMatch(id, selectedRight);
    }
  };

  const handleRightClick = (id) => {
    if (matched[id]) return;
    audioSynth.playClick();
    setSelectedRight(id);
    if (selectedLeft !== null) {
      tryMatch(selectedLeft, id);
    }
  };

  const colorOf = (id) => PAIR_COLORS[id % PAIR_COLORS.length];

  const leftBtnStyle = (id) => {
    const isMatched = matched[id];
    const isSelected = selectedLeft === id;
    const isWrong = wrongFlash?.left === id;
    return {
      padding: '12px 14px', borderRadius: '16px', border: '3px solid',
      borderColor: isMatched ? colorOf(id) : isWrong ? '#ef4444' : isSelected ? colorOf(id) : 'rgba(200,200,200,0.5)',
      background: isMatched
        ? `${colorOf(id)}22`
        : isWrong ? '#fee2e2'
        : isSelected ? `${colorOf(id)}18`
        : 'white',
      fontFamily: 'Fredoka, sans-serif', fontWeight: '800', fontSize: '1.2rem',
      color: isMatched ? colorOf(id) : isWrong ? '#dc2626' : '#374151',
      cursor: isMatched ? 'default' : 'pointer',
      textDecoration: isMatched ? 'line-through' : 'none',
      opacity: isMatched ? 0.6 : 1,
      transition: 'all 0.2s',
      textAlign: 'center',
    };
  };

  const rightBtnStyle = (id) => {
    const pair = rightNums.find(p => p.id === id);
    const isMatched = matched[id];
    const isSelected = selectedRight === id;
    const isWrong = wrongFlash?.right === id;
    return {
      padding: '14px 10px', borderRadius: '16px', border: '3px solid',
      borderColor: isMatched ? colorOf(id) : isWrong ? '#ef4444' : isSelected ? colorOf(id) : 'rgba(200,200,200,0.5)',
      background: isMatched
        ? `${colorOf(id)}22`
        : isWrong ? '#fee2e2'
        : isSelected ? `${colorOf(id)}18`
        : 'white',
      fontFamily: 'Fredoka, sans-serif', fontWeight: '900', fontSize: '1.6rem',
      color: isMatched ? colorOf(id) : isWrong ? '#dc2626' : '#374151',
      cursor: isMatched ? 'default' : 'pointer',
      opacity: isMatched ? 0.5 : 1,
      transition: 'all 0.2s',
      textAlign: 'center',
    };
  };

  return (
    <div className="screen-wrapper fade-in" style={{ gap: '16px', paddingTop: '10px', paddingBottom: '20px' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '92%', maxWidth: '400px' }}>
        <button className="bouncy-button secondary" onClick={onBack} style={{ padding: '10px 16px' }}>🏠</button>
        <div style={{ flex: 1, textAlign: 'center', fontWeight: '700', fontSize: '1.1rem', color: '#0369a1' }}>
          {zh ? '🔗 数字连线' : '🔗 Math Matching'}
        </div>
        <div style={{ background: 'linear-gradient(135deg,#7dd3fc,#3b82f6)', color: 'white', borderRadius: '50px', padding: '6px 14px', fontSize: '0.88rem', fontWeight: '700' }}>
          Lv {level}
        </div>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(16px)',
        borderRadius: '28px', padding: '20px 16px',
        border: '2px solid rgba(255,255,255,0.7)',
        boxShadow: '0 8px 32px rgba(59,130,246,0.15)',
        width: '92%', maxWidth: '400px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
      }}>
        <div style={{ fontSize: '0.95rem', color: '#0369a1', fontWeight: '700', textAlign: 'center' }}>
          {zh ? '👆 点选左边算式，再点右边答案，连成一对！' : '👆 Tap an expression, then tap its answer!'}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px 1fr', gap: '8px', width: '100%' }}>
          {/* Left: expressions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {pairs.map(p => (
              <button key={p.id} onClick={() => handleLeftClick(p.id)} style={leftBtnStyle(p.id)}>
                {p.expr}
              </button>
            ))}
          </div>

          {/* Middle: connection lines area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {pairs.map(p => (
              <div key={p.id} style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                minHeight: '50px',
              }}>
                {matched[p.id] && (
                  <div style={{ width: '100%', height: '3px', background: colorOf(p.id), borderRadius: '2px' }} />
                )}
              </div>
            ))}
          </div>

          {/* Right: answers */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {rightNums.map(p => (
              <button key={p.id} onClick={() => handleRightClick(p.id)} style={rightBtnStyle(p.id)}>
                {p.ans}
              </button>
            ))}
          </div>
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {pairs.map(p => (
            <div key={p.id} style={{
              width: '28px', height: '8px', borderRadius: '4px',
              background: matched[p.id] ? colorOf(p.id) : '#e5e7eb',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>

        {roundDone && (
          <div style={{
            padding: '14px 20px', borderRadius: '18px', fontWeight: '700', fontSize: '1rem',
            background: '#dcfce7', color: '#16a34a', width: '100%', textAlign: 'center',
          }}>
            {zh
              ? `🎊 全部配对成功！出错 ${errors} 次。`
              : `🎊 All matched! ${errors} mistake${errors !== 1 ? 's' : ''}.`}
          </div>
        )}

        {roundDone && (
          <button className="bouncy-button primary" onClick={newRound} style={{ padding: '14px 32px', fontSize: '1.1rem' }}>
            {zh ? '再来一轮 ➔' : 'Next Round ➔'}
          </button>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { audioSynth } from '../utils/audioSynth';

const RULERS = [
  { nameZh: '铅笔', nameEn: 'Pencil', emoji: '✏️' },
  { nameZh: '蜡笔', nameEn: 'Crayon', emoji: '🖍️' },
  { nameZh: '毛毛虫', nameEn: 'Caterpillar', emoji: '🐛' },
  { nameZh: '蛇', nameEn: 'Snake', emoji: '🐍' },
  { nameZh: '绳子', nameEn: 'Rope', emoji: '〰️' },
  { nameZh: '尺子', nameEn: 'Ruler', emoji: '📏' },
];

const WEIGHTS = [
  { nameZh: '苹果', nameEn: 'Apple', emoji: '🍎', weight: 2 },
  { nameZh: '西瓜', nameEn: 'Watermelon', emoji: '🍉', weight: 10 },
  { nameZh: '葡萄', nameEn: 'Grapes', emoji: '🍇', weight: 3 },
  { nameZh: '石头', nameEn: 'Rock', emoji: '🪨', weight: 8 },
  { nameZh: '羽毛', nameEn: 'Feather', emoji: '🪶', weight: 1 },
  { nameZh: '书包', nameEn: 'Backpack', emoji: '🎒', weight: 6 },
  { nameZh: '积木', nameEn: 'Block', emoji: '🧊', weight: 4 },
  { nameZh: '气球', nameEn: 'Balloon', emoji: '🎈', weight: 1 },
  { nameZh: '铁球', nameEn: 'Iron ball', emoji: '⚽', weight: 7 },
  { nameZh: '兔子', nameEn: 'Bunny', emoji: '🐰', weight: 2 },
];

function generateLengthProblem() {
  const shuffled = [...RULERS].sort(() => Math.random() - 0.5);
  const item1 = shuffled[0];
  const item2 = shuffled[1];
  const len1 = Math.floor(Math.random() * 200) + 40; // px width for visual bar
  let len2;
  do { len2 = Math.floor(Math.random() * 200) + 40; } while (Math.abs(len1 - len2) < 30);
  const answer = len1 > len2 ? 'left' : 'right';
  return { type: 'length', item1, item2, len1, len2, answer };
}

function generateWeightProblem() {
  const shuffled = [...WEIGHTS].sort(() => Math.random() - 0.5);
  const item1 = shuffled[0];
  const item2 = shuffled[1];
  if (item1.weight === item2.weight) return generateWeightProblem();
  const answer = item1.weight > item2.weight ? 'left' : 'right';
  return { type: 'weight', item1, item2, answer };
}

function generateProblem(level) {
  if (level === 1) return generateLengthProblem();
  if (level === 2) return Math.random() > 0.5 ? generateLengthProblem() : generateWeightProblem();
  return generateWeightProblem();
}

const VisualBar = ({ length, color, emoji }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
    <div style={{ fontSize: '1.6rem' }}>{emoji}</div>
    <div style={{
      height: '22px', width: `${length}px`, borderRadius: '11px',
      background: color, boxShadow: '0 3px 8px rgba(0,0,0,0.15)',
      border: '2px solid rgba(255,255,255,0.6)',
      transition: 'width 0.4s ease',
    }} />
  </div>
);

const Scale = ({ leftHeavier }) => {
  const tilt = leftHeavier ? 'rotate(-12deg)' : 'rotate(12deg)';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '10px 0' }}>
      <div style={{ width: '3px', height: '60px', background: '#9ca3af', borderRadius: '2px' }} />
      <div style={{ transform: tilt, transition: 'transform 0.5s ease', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '160px', height: '6px', background: 'linear-gradient(135deg, #9ca3af, #6b7280)', borderRadius: '3px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '160px' }}>
          <div style={{ width: '2px', height: '40px', background: '#9ca3af', marginLeft: '16px', borderRadius: '1px' }} />
          <div style={{ width: '2px', height: '40px', background: '#9ca3af', marginRight: '16px', borderRadius: '1px' }} />
        </div>
      </div>
    </div>
  );
};

export default function MeasurementGame({ lang = 'zh', onBack }) {
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [problem, setProblem] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const zh = lang === 'zh';

  const newProblem = useCallback(() => {
    setProblem(generateProblem(level));
    setFeedback(null);
  }, [level]);

  useEffect(() => { newProblem(); }, [newProblem]);

  const handleSelect = (side) => {
    if (feedback) return;
    audioSynth.playClick();
    const correct = problem.answer === side;
    if (correct) {
      audioSynth.playCorrect();
      setFeedback('correct');
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak >= 4 && level < 3) { setLevel(l => l + 1); setStreak(0); }
    } else {
      audioSynth.playIncorrect();
      setFeedback('wrong');
      setStreak(0);
    }
  };

  if (!problem) return null;

  const cardStyle = {
    background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(16px)', borderRadius: '28px',
    padding: '24px 18px', border: '2px solid rgba(255,255,255,0.7)',
    boxShadow: '0 8px 32px rgba(16,185,129,0.15)', width: '92%', maxWidth: '380px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px',
  };

  const btnStyle = (side) => ({
    flex: 1, padding: '16px 10px', borderRadius: '20px', border: 'none', cursor: 'pointer',
    fontFamily: 'Fredoka, sans-serif', fontWeight: '800', fontSize: '2rem',
    background: feedback
      ? (problem.answer === side ? 'linear-gradient(135deg,#4ade80,#22c55e)' : 'linear-gradient(135deg,#fca5a5,#ef4444)')
      : 'linear-gradient(135deg, #d1fae5, #10b981)',
    color: 'white', boxShadow: '0 4px 12px rgba(16,185,129,0.25)',
    transition: 'all 0.25s',
  });

  const leftItem = problem.item1;
  const rightItem = problem.item2;
  const questionZh = problem.type === 'length'
    ? `哪个更长？` : `哪个更重？`;
  const questionEn = problem.type === 'length' ? 'Which is longer?' : 'Which is heavier?';

  return (
    <div className="screen-wrapper fade-in" style={{ gap: '16px', paddingTop: '10px', paddingBottom: '20px' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '92%', maxWidth: '380px' }}>
        <button className="bouncy-button secondary" onClick={onBack} style={{ padding: '10px 16px' }}>🏠</button>
        <div style={{ flex: 1, textAlign: 'center', fontWeight: '700', fontSize: '1.1rem', color: '#059669' }}>
          {zh ? '📏 长度与重量' : '📏 Measurement'}
        </div>
        <div style={{ background: 'linear-gradient(135deg, #6ee7b7, #10b981)', color: 'white', borderRadius: '50px', padding: '6px 14px', fontSize: '0.88rem', fontWeight: '700' }}>
          Lv {level}
        </div>
      </div>

      <div style={cardStyle}>
        <div style={{ fontWeight: '700', fontSize: '1.05rem', color: '#065f46', textAlign: 'center' }}>
          {zh ? questionZh : questionEn}
        </div>

        {/* Length visual */}
        {problem.type === 'length' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', padding: '0 8px' }}>
            {[{ item: leftItem, len: problem.len1, color: 'linear-gradient(135deg, #60a5fa, #3b82f6)', side: 'left' },
              { item: rightItem, len: problem.len2, color: 'linear-gradient(135deg, #f9a8d4, #ec4899)', side: 'right' }].map(({ item, len, color }) => (
              <div key={item.nameEn} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.6rem', width: '32px' }}>{item.emoji}</span>
                <div style={{
                  height: '28px', width: `${len}px`, maxWidth: '270px', borderRadius: '14px',
                  background: color, boxShadow: '0 3px 8px rgba(0,0,0,0.15)',
                  border: '2px solid rgba(255,255,255,0.6)',
                }} />
              </div>
            ))}
          </div>
        )}

        {/* Weight scale visual */}
        {problem.type === 'weight' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '8px' }}>
            <Scale leftHeavier={leftItem.weight > rightItem.weight} />
            <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%', fontSize: '1rem', color: '#374151', fontWeight: '700' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.4rem' }}>{leftItem.emoji}</div>
                <div>{zh ? leftItem.nameZh : leftItem.nameEn}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.4rem' }}>{rightItem.emoji}</div>
                <div>{zh ? rightItem.nameZh : rightItem.nameEn}</div>
              </div>
            </div>
          </div>
        )}

        {/* Answer buttons */}
        <div style={{ display: 'flex', gap: '14px', width: '100%' }}>
          {[{ side: 'left', item: leftItem }, { side: 'right', item: rightItem }].map(({ side, item }) => (
            <button key={side} onClick={() => handleSelect(side)} style={btnStyle(side)}>
              <div>{item.emoji}</div>
              <div style={{ fontSize: '1rem', marginTop: '4px' }}>{zh ? item.nameZh : item.nameEn}</div>
            </button>
          ))}
        </div>

        {feedback && (
          <div style={{
            padding: '12px 20px', borderRadius: '16px', fontWeight: '700', fontSize: '1rem', width: '100%', textAlign: 'center',
            background: feedback === 'correct' ? '#dcfce7' : '#fee2e2',
            color: feedback === 'correct' ? '#16a34a' : '#dc2626',
          }}>
            {feedback === 'correct'
              ? (zh ? '🌟 回答正确！观察力真棒！' : '🌟 Correct! Great observation!')
              : (zh
                  ? `💡 ${problem.answer === 'left' ? (zh ? leftItem.nameZh : leftItem.nameEn) : (zh ? rightItem.nameZh : rightItem.nameEn)}更${problem.type === 'length' ? '长' : '重'}！`
                  : `💡 ${problem.answer === 'left' ? leftItem.nameEn : rightItem.nameEn} is ${problem.type === 'length' ? 'longer' : 'heavier'}!`)}
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

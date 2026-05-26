import React, { useState, useEffect, useCallback } from 'react';
import { audioSynth } from '../utils/audioSynth';

const COLORS = [
  { key: 'red', nameZh: '红色', nameEn: 'Red', hex: '#ef4444' },
  { key: 'orange', nameZh: '橙色', nameEn: 'Orange', hex: '#f97316' },
  { key: 'yellow', nameZh: '黄色', nameEn: 'Yellow', hex: '#eab308' },
  { key: 'green', nameZh: '绿色', nameEn: 'Green', hex: '#22c55e' },
  { key: 'blue', nameZh: '蓝色', nameEn: 'Blue', hex: '#3b82f6' },
  { key: 'purple', nameZh: '紫色', nameEn: 'Purple', hex: '#a855f7' },
  { key: 'pink', nameZh: '粉色', nameEn: 'Pink', hex: '#ec4899' },
  { key: 'brown', nameZh: '棕色', nameEn: 'Brown', hex: '#92400e' },
  { key: 'black', nameZh: '黑色', nameEn: 'Black', hex: '#1f2937' },
  { key: 'white', nameZh: '白色', nameEn: 'White', hex: '#f9fafb', border: '#e5e7eb' },
];

const MIXES = [
  { c1: COLORS[0], c2: COLORS[2], result: COLORS[1] }, // Red + Yellow = Orange
  { c1: COLORS[0], c2: COLORS[4], result: COLORS[5] }, // Red + Blue = Purple
  { c1: COLORS[4], c2: COLORS[2], result: COLORS[3] }, // Blue + Yellow = Green
  { c1: COLORS[0], c2: COLORS[9], result: COLORS[6] }, // Red + White = Pink
];

function generateProblem(level) {
  if (level === 1) {
    // Easy: 6 primary colors, 3 choices
    const easyColors = COLORS.slice(0, 6);
    const target = easyColors[Math.floor(Math.random() * easyColors.length)];
    const wrong = easyColors.filter(c => c.key !== target.key)
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);
    const choices = [target, ...wrong].sort(() => Math.random() - 0.5);
    return { target, choices, isMix: false };
  } else if (level === 2) {
    // Medium: All colors, 4 choices
    const target = COLORS[Math.floor(Math.random() * COLORS.length)];
    const wrong = COLORS.filter(c => c.key !== target.key)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    const choices = [target, ...wrong].sort(() => Math.random() - 0.5);
    return { target, choices, isMix: false };
  } else {
    // Hard: Color Mix
    const mix = MIXES[Math.floor(Math.random() * MIXES.length)];
    const target = mix.result;
    const wrong = COLORS.filter(c => c.key !== target.key && c.key !== mix.c1.key && c.key !== mix.c2.key)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    const choices = [target, ...wrong].sort(() => Math.random() - 0.5);
    return { target, c1: mix.c1, c2: mix.c2, choices, isMix: true };
  }
}

export default function ColorGame({ autoAdvance, lang = 'zh', difficultyMode = 'adaptive' }) {
  const [adaptiveLevel, setAdaptiveLevel] = useState(1);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);

  const level = difficultyMode === 'easy' ? 1 : 
                difficultyMode === 'medium' ? 2 : 
                difficultyMode === 'hard' ? 3 : adaptiveLevel;

  const [problem, setProblem] = useState(() => generateProblem(level));
  const [selectedKey, setSelectedKey] = useState(null);
  const [sessionCount, setSessionCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const next = useCallback(() => {
    setProblem(generateProblem(level));
    setSelectedKey(null);
  }, [level]);

  useEffect(() => {
    next();
  }, [level, next]);

  const handleChoice = (colorObj) => {
    if (selectedKey !== null) return;
    setSelectedKey(colorObj.key);
    setSessionCount(p => p + 1);
    if (colorObj.key === problem.target.key) {
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

  const isEn = lang === 'en';
  const getLocalizedName = (c) => isEn ? c.nameEn : c.nameZh;

  const getTitle = () => {
    if (problem.isMix) {
      return isEn ? '🎨 What color do you get by mixing these?' : '🎨 混合这两个颜色会得到什么颜色？';
    }
    return isEn ? '🎨 What color is this?' : '🎨 这是什么颜色？';
  };

  return (
    <div className="screen-wrapper fade-in" style={{ justifyContent: 'flex-start', gap: '20px', paddingBottom: '20px', overflowY: 'auto' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '1.3rem', fontWeight: '600', color: '#c0487a', marginBottom: '4px' }}>
          {getTitle()}
        </div>
        <div style={{ fontSize: '0.9rem', color: '#d4879e', fontWeight: '600' }}>
          {isEn
            ? `📝 Total: ${sessionCount} · ✅ Correct: ${correctCount}`
            : `📝 本次 ${sessionCount} 题 · ✅ 答对 ${correctCount} 题`}
        </div>
      </div>

      {problem.isMix ? (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '16px',
          background: 'rgba(255,255,255,0.8)', padding: '20px 30px',
          borderRadius: '32px', border: '3.5px solid #f5c0d0',
          boxShadow: '0 8px 30px rgba(255,93,158,0.1)'
        }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '16px',
            background: problem.c1.hex,
            border: problem.c1.border ? `2px solid ${problem.c1.border}` : '2px solid rgba(0,0,0,0.05)',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
          }} />
          <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#ff5d9e' }}>+</span>
          <div style={{
            width: '64px', height: '64px', borderRadius: '16px',
            background: problem.c2.hex,
            border: problem.c2.border ? `2px solid ${problem.c2.border}` : '2px solid rgba(0,0,0,0.05)',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
          }} />
          <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#ff5d9e' }}>=</span>
          <div style={{
            width: '64px', height: '64px', borderRadius: '16px',
            border: '3px dashed #ff85b8',
            background: selectedKey !== null ? problem.target.hex : 'rgba(255,255,255,0.5)',
            boxShadow: selectedKey !== null ? `0 4px 10px ${problem.target.hex}44` : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem'
          }}>
            {selectedKey !== null ? '' : '？'}
          </div>
        </div>
      ) : (
        <div style={{
          width: '160px', height: '160px', borderRadius: '32px',
          background: problem.target.hex,
          boxShadow: `0 12px 40px ${problem.target.hex}88`,
          border: problem.target.border ? `3px solid ${problem.target.border}` : '3px solid rgba(255,255,255,0.4)',
          transition: 'all 0.4s cubic-bezier(0.175,0.885,0.32,1.275)',
        }} />
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%', maxWidth: '360px' }}>
        {problem.choices.map(colorObj => {
          let bg = 'white', border = '#f5c0d0', buttonColor = '#c06080';
          if (selectedKey !== null) {
            if (colorObj.key === problem.target.key) { bg = '#f0fdf4'; border = '#4ade80'; buttonColor = '#16a34a'; }
            else if (colorObj.key === selectedKey) { bg = '#fef2f2'; border = '#f87171'; buttonColor = '#dc2626'; }
          }
          return (
            <button key={colorObj.key} onClick={() => handleChoice(colorObj)} style={{
              padding: '16px', borderRadius: '20px',
              border: `3px solid ${border}`, background: bg, color: buttonColor,
              fontWeight: '600', fontSize: '1.3rem',
              cursor: selectedKey !== null ? 'default' : 'pointer',
              fontFamily: 'Fredoka, sans-serif',
              boxShadow: '0 4px 12px rgba(255,93,158,0.1)',
              transition: 'all 0.2s ease',
            }}>
              {getLocalizedName(colorObj)}
            </button>
          );
        })}
      </div>

      {selectedKey !== null && (
        <div className="bounce-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: '600', textAlign: 'center',
            color: selectedKey === problem.target.key ? '#16a34a' : '#dc2626' }}>
            {selectedKey === problem.target.key
              ? (isEn ? `🌟 Correct! It is ${problem.target.nameEn}!` : `🌟 答对啦！是${problem.target.nameZh}！`)
              : (isEn ? `💡 It's actually ${problem.target.nameEn}!` : `💡 这是${problem.target.nameZh}哦！`)}
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

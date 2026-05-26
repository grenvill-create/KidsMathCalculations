import React, { useState, useEffect, useCallback } from 'react';
import { audioSynth } from '../utils/audioSynth';

const SEASONS = [
  {
    key: 'spring',
    nameZh: '春天',
    nameEn: 'Spring',
    emojis: ['🌸', '🌱', '🌈', '🌷', '🐝'],
    descZh: '花朵盛开，天气暖和',
    descEn: 'Flowers bloom, and the weather is warm',
    monthsZh: '3月、4月、5月',
    monthsEn: 'March, April, and May',
    bg: 'linear-gradient(135deg, #fce7f3, #fdf2f8)',
    border: '#f9a8d4',
  },
  {
    key: 'summer',
    nameZh: '夏天',
    nameEn: 'Summer',
    emojis: ['☀️', '🏖️', '🍦', '🌊', '🌻'],
    descZh: '阳光炎热，可以游泳',
    descEn: 'The sun is hot, and we can go swimming',
    monthsZh: '6月、7月、8月',
    monthsEn: 'June, July, and August',
    bg: 'linear-gradient(135deg, #fef9c3, #fef3c7)',
    border: '#fbbf24',
  },
  {
    key: 'autumn',
    nameZh: '秋天',
    nameEn: 'Autumn',
    emojis: ['🍂', '🍎', '🌾', '🍁', '🎃'],
    descZh: '树叶变黄，收获果实',
    descEn: 'Leaves turn yellow, and we harvest sweet fruits',
    monthsZh: '9月、10月、11月',
    monthsEn: 'September, October, and November',
    bg: 'linear-gradient(135deg, #ffedd5, #fed7aa)',
    border: '#f97316',
  },
  {
    key: 'winter',
    nameZh: '冬天',
    nameEn: 'Winter',
    emojis: ['❄️', '⛄', '🧣', '🌨️', '🏔️'],
    descZh: '天气寒冷，会下雪',
    descEn: 'The weather is cold, and it snows white',
    monthsZh: '12月、1月、2月',
    monthsEn: 'December, January, and February',
    bg: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
    border: '#93c5fd',
  },
];

function generateProblem(level) {
  const target = SEASONS[Math.floor(Math.random() * SEASONS.length)];
  const maxChoices = level === 1 ? 3 : 4;
  const wrong = SEASONS.filter(s => s.key !== target.key)
    .sort(() => Math.random() - 0.5)
    .slice(0, maxChoices - 1);
  const choices = [target, ...wrong].sort(() => Math.random() - 0.5);
  return { target, choices };
}

export default function SeasonGame({ autoAdvance, lang = 'zh', difficultyMode = 'adaptive' }) {
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

  const handleChoice = (seasonObj) => {
    if (selectedKey !== null) return;
    setSelectedKey(seasonObj.key);
    setSessionCount(p => p + 1);
    if (seasonObj.key === problem.target.key) {
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
  const getLocalizedName = (s) => isEn ? s.nameEn : s.nameZh;
  const getLocalizedDesc = (s) => isEn ? s.descEn : s.descZh;

  const getQuestionText = () => {
    if (level === 3) {
      return isEn 
        ? `🌍 Which season is this? ("${problem.target.monthsEn}")` 
        : `🌍 这是什么季节？（包含：${problem.target.monthsZh}）`;
    }
    return isEn ? '🌍 Which season is this?' : '🌍 这是什么季节？';
  };

  return (
    <div className="screen-wrapper fade-in" style={{ justifyContent: 'flex-start', gap: '20px', paddingBottom: '20px', overflowY: 'auto' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '1.3rem', fontWeight: '600', color: '#c0487a', marginBottom: '4px' }}>
          {getQuestionText()}
        </div>
        <div style={{ fontSize: '0.9rem', color: '#d4879e', fontWeight: '600' }}>
          {isEn
            ? `📝 Total: ${sessionCount} · ✅ Correct: ${correctCount}`
            : `📝 本次 ${sessionCount} 题 · ✅ 答对 ${correctCount} 题`}
        </div>
      </div>

      <div style={{
        background: problem.target.bg,
        borderRadius: '28px', padding: '28px 20px',
        width: '100%', maxWidth: '380px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
        border: `2.5px solid ${problem.target.border}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
      }}>
        <div style={{ display: 'flex', gap: '10px', fontSize: '2.6rem', lineHeight: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
          {problem.target.emojis.map((e, i) => (
            <span key={i} style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.12))' }}>{e}</span>
          ))}
        </div>
        <div style={{ fontSize: '1rem', color: '#6b7280', fontWeight: '600', fontStyle: 'italic', textAlign: 'center' }}>
          "{getLocalizedDesc(problem.target)}"
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%', maxWidth: '360px' }}>
        {problem.choices.map(seasonObj => {
          let bg = 'white', border = '#f5c0d0', color = '#c06080';
          if (selectedKey !== null) {
            if (seasonObj.key === problem.target.key) { bg = '#f0fdf4'; border = '#4ade80'; color = '#16a34a'; }
            else if (seasonObj.key === selectedKey) { bg = '#fef2f2'; border = '#f87171'; color = '#dc2626'; }
          }
          return (
            <button key={seasonObj.key} onClick={() => handleChoice(seasonObj)} style={{
              padding: '16px', borderRadius: '20px',
              border: `3px solid ${border}`, background: bg, color,
              fontWeight: '600', fontSize: '1.2rem',
              cursor: selectedKey !== null ? 'default' : 'pointer',
              fontFamily: 'Fredoka, sans-serif',
              boxShadow: '0 4px 12px rgba(255,93,158,0.1)',
              transition: 'all 0.2s ease',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
            }}>
              <span style={{ fontSize: '1.6rem' }}>{seasonObj.emojis[0]}</span>
              {getLocalizedName(seasonObj)}
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
              : (isEn ? `💡 It is actually ${problem.target.nameEn}!` : `💡 这是${problem.target.nameZh}哦！`)}
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

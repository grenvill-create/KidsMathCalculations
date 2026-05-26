import React, { useState, useEffect, useCallback } from 'react';
import { audioSynth } from '../utils/audioSynth';

const DAYS_ZH = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const DAYS_EN = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_EMOJIS = ['💼', '📚', '🎨', '🎵', '🎉', '🎮', '😴'];

function generateProblem(level) {
  // Level 1: qType 0 (tomorrow) or 2 (days in week). Choices: 3
  // Level 2: qType 0 (tomorrow), 1 (yesterday) or 2 (days in week). Choices: 4
  // Level 3: qType 3 (day after tomorrow) or 4 (day before yesterday). Choices: 4
  let qType;
  if (level === 1) {
    qType = Math.random() > 0.5 ? 0 : 2;
  } else if (level === 2) {
    qType = Math.floor(Math.random() * 3); // 0, 1, 2
  } else {
    qType = Math.random() > 0.5 ? 3 : 4; // 3 (after tomorrow), 4 (before yesterday)
  }

  if (qType === 2) {
    const choiceIndices = [0, 1, 2, 3].sort(() => Math.random() - 0.5);
    return { qType, answerIdx: 0, choiceIndices };
  }

  const today = Math.floor(Math.random() * 7);
  let answerIdx;
  if (qType === 0) answerIdx = (today + 1) % 7; // tomorrow
  else if (qType === 1) answerIdx = (today + 6) % 7; // yesterday
  else if (qType === 3) answerIdx = (today + 2) % 7; // day after tomorrow
  else answerIdx = (today + 5) % 7; // day before yesterday (-2)

  const maxChoices = level === 1 ? 3 : 4;
  const wrong = [0, 1, 2, 3, 4, 5, 6].filter(i => i !== answerIdx)
    .sort(() => Math.random() - 0.5)
    .slice(0, maxChoices - 1);
  const choiceIndices = [answerIdx, ...wrong].sort(() => Math.random() - 0.5);

  return { qType, today, answerIdx, choiceIndices };
}

export default function WeekdayGame({ autoAdvance, lang = 'zh', difficultyMode = 'adaptive' }) {
  const [adaptiveLevel, setAdaptiveLevel] = useState(1);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);

  const level = difficultyMode === 'easy' ? 1 : 
                difficultyMode === 'medium' ? 2 : 
                difficultyMode === 'hard' ? 3 : adaptiveLevel;

  const [problem, setProblem] = useState(() => generateProblem(level));
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [sessionCount, setSessionCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const next = useCallback(() => {
    setProblem(generateProblem(level));
    setSelectedIdx(null);
  }, [level]);

  useEffect(() => {
    next();
  }, [level, next]);

  const isEn = lang === 'en';
  const daysList = isEn ? DAYS_EN : DAYS_ZH;

  // Resolve question, choices and answer text based on language
  let questionText = '';
  let answerText = '';
  let choiceTexts = [];

  if (problem.qType === 2) {
    questionText = isEn ? 'How many days are in a week?' : '一周一共有几天？';
    const staticChoices = isEn
      ? ['7 Days', '5 Days', '6 Days', '8 Days']
      : ['7天', '5天', '6天', '8天'];
    answerText = staticChoices[problem.answerIdx];
    choiceTexts = problem.choiceIndices.map(idx => staticChoices[idx]);
  } else {
    if (problem.qType === 0) {
      questionText = isEn
        ? `Today is ${DAYS_EN[problem.today]}. What day is tomorrow?`
        : `今天是 ${DAYS_ZH[problem.today]}，明天是周几？`;
    } else if (problem.qType === 1) {
      questionText = isEn
        ? `Today is ${DAYS_EN[problem.today]}. What day was yesterday?`
        : `今天是 ${DAYS_ZH[problem.today]}，昨天是周几？`;
    } else if (problem.qType === 3) {
      questionText = isEn
        ? `Today is ${DAYS_EN[problem.today]}. What day is the day after tomorrow?`
        : `今天是 ${DAYS_ZH[problem.today]}，后天是周几？`;
    } else {
      questionText = isEn
        ? `Today is ${DAYS_EN[problem.today]}. What day was the day before yesterday?`
        : `今天是 ${DAYS_ZH[problem.today]}，前天是周几？`;
    }
    answerText = daysList[problem.answerIdx];
    choiceTexts = problem.choiceIndices.map(idx => daysList[idx]);
  }

  const handleChoice = (choiceIdx, val) => {
    if (selectedIdx !== null) return;
    setSelectedIdx(choiceIdx);
    setSessionCount(p => p + 1);
    if (val === answerText) {
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

  return (
    <div className="screen-wrapper fade-in" style={{ justifyContent: 'flex-start', gap: '20px', paddingBottom: '20px', overflowY: 'auto' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '1.3rem', fontWeight: '600', color: '#c0487a', marginBottom: '4px' }}>
          {isEn ? '📅 Weekdays' : '📅 认识星期'}
        </div>
        <div style={{ fontSize: '0.9rem', color: '#d4879e', fontWeight: '600' }}>
          {isEn
            ? `📝 Total: ${sessionCount} · ✅ Correct: ${correctCount}`
            : `📝 本次 ${sessionCount} 题 · ✅ 答对 ${correctCount} 题`}
        </div>
      </div>

      {/* Weekly calendar display */}
      <div style={{
        background: 'rgba(255,255,255,0.8)', borderRadius: '28px', padding: '16px',
        width: '100%', maxWidth: '380px',
        boxShadow: '0 8px 30px rgba(255,93,158,0.1)', border: '2.5px solid rgba(255,255,255,0.9)',
      }}>
        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {daysList.map((d, i) => (
            <div key={d} style={{
              flex: '1', minWidth: '40px', textAlign: 'center',
              padding: '8px 2px', borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(255,181,200,0.3), rgba(255,143,171,0.2))',
              border: '1.5px solid rgba(255,143,171,0.3)',
              fontSize: '0.75rem', fontWeight: '600', color: '#c06080',
            }}>
              <div style={{ fontSize: '1.2rem' }}>{DAY_EMOJIS[i]}</div>
              <div style={{ fontSize: isEn ? '0.62rem' : '0.75rem' }}>{d}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.8)', borderRadius: '24px', padding: '20px',
        width: '100%', maxWidth: '380px', textAlign: 'center',
        fontSize: '1.2rem', fontWeight: '700', color: '#c0487a',
        boxShadow: '0 4px 16px rgba(255,93,158,0.1)', border: '2px solid rgba(255,255,255,0.9)',
        lineHeight: 1.35
      }}>
        {questionText}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%', maxWidth: '360px' }}>
        {choiceTexts.map((val, choiceIdx) => {
          let bg = 'white', border = '#f5c0d0', color = '#c06080';
          if (selectedIdx !== null) {
            if (val === answerText) { bg = '#f0fdf4'; border = '#4ade80'; color = '#16a34a'; }
            else if (choiceIdx === selectedIdx) { bg = '#fef2f2'; border = '#f87171'; color = '#dc2626'; }
          }
          return (
            <button key={choiceIdx} onClick={() => handleChoice(choiceIdx, val)} style={{
              padding: '16px 8px', borderRadius: '20px',
              border: `3px solid ${border}`, background: bg, color,
              fontWeight: '600', fontSize: isEn ? '1.1rem' : '1.3rem',
              cursor: selectedIdx !== null ? 'default' : 'pointer',
              fontFamily: 'Fredoka, sans-serif',
              boxShadow: '0 4px 12px rgba(255,93,158,0.1)',
              transition: 'all 0.2s ease',
            }}>
              {val}
            </button>
          );
        })}
      </div>

      {selectedIdx !== null && (
        <div className="bounce-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: '600', textAlign: 'center',
            color: choiceTexts[selectedIdx] === answerText ? '#16a34a' : '#dc2626' }}>
            {choiceTexts[selectedIdx] === answerText
              ? (isEn ? '🌟 Correct! You are amazing!' : '🌟 答对啦！真棒！')
              : (isEn ? `💡 Correct answer is ${answerText}!` : `💡 正确答案是 ${answerText} 哦！`)}
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

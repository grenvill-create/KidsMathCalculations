import React, { useState, useCallback } from 'react';
import { audioSynth } from '../utils/audioSynth';

const DAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const DAY_EMOJIS = ['💼', '📚', '🎨', '🎵', '🎉', '🎮', '😴'];

function generateProblem() {
  const qType = Math.floor(Math.random() * 3);
  let question, answer, choices;

  if (qType === 0) {
    // "今天是周X，明天是周几？"
    const today = Math.floor(Math.random() * 7);
    const tomorrow = (today + 1) % 7;
    question = `今天是 ${DAYS[today]}，明天是周几？`;
    answer = DAYS[tomorrow];
  } else if (qType === 1) {
    // "今天是周X，昨天是周几？"
    const today = Math.floor(Math.random() * 7);
    const yesterday = (today + 6) % 7;
    question = `今天是 ${DAYS[today]}，昨天是周几？`;
    answer = DAYS[yesterday];
  } else {
    // "一周有几天？"
    question = '一周一共有几天？';
    answer = '7天';
    const wrongChoices = ['5天', '6天', '8天'].sort(() => Math.random() - 0.5).slice(0, 3);
    const allChoices = [answer, ...wrongChoices].sort(() => Math.random() - 0.5);
    return { question, answer, choices: allChoices };
  }

  const wrong = DAYS.filter(d => d !== answer).sort(() => Math.random() - 0.5).slice(0, 3);
  choices = [answer, ...wrong].sort(() => Math.random() - 0.5);
  return { question, answer, choices };
}

export default function WeekdayGame() {
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
      setTimeout(next, 1200);
    } else {
      audioSynth.playIncorrect();
      setTimeout(next, 1800);
    }
  };

  return (
    <div className="screen-wrapper fade-in" style={{ justifyContent: 'flex-start', gap: '20px', paddingBottom: '20px', overflowY: 'auto' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '1.3rem', fontWeight: '700', color: '#c0487a', marginBottom: '4px' }}>
          📅 认识星期
        </div>
        <div style={{ fontSize: '0.9rem', color: '#d4879e', fontWeight: '600' }}>
          📝 本次 {sessionCount} 题 · ✅ 答对 {correctCount} 题
        </div>
      </div>

      {/* Weekly calendar display */}
      <div style={{
        background: 'rgba(255,255,255,0.8)', borderRadius: '28px', padding: '16px',
        width: '100%', maxWidth: '380px',
        boxShadow: '0 8px 30px rgba(255,93,158,0.1)', border: '2.5px solid rgba(255,255,255,0.9)',
      }}>
        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {DAYS.map((d, i) => (
            <div key={d} style={{
              flex: '1', minWidth: '40px', textAlign: 'center',
              padding: '8px 2px', borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(255,181,200,0.3), rgba(255,143,171,0.2))',
              border: '1.5px solid rgba(255,143,171,0.3)',
              fontSize: '0.75rem', fontWeight: '700', color: '#c06080',
            }}>
              <div style={{ fontSize: '1.2rem' }}>{DAY_EMOJIS[i]}</div>
              <div>{d}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.8)', borderRadius: '24px', padding: '20px',
        width: '100%', maxWidth: '380px', textAlign: 'center',
        fontSize: '1.2rem', fontWeight: '700', color: '#c0487a',
        boxShadow: '0 4px 16px rgba(255,93,158,0.1)', border: '2px solid rgba(255,255,255,0.9)',
      }}>
        {problem.question}
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
              padding: '16px', borderRadius: '20px',
              border: `3px solid ${border}`, background: bg, color,
              fontWeight: '700', fontSize: '1.3rem',
              cursor: selected !== null ? 'default' : 'pointer',
              fontFamily: 'Fredoka, sans-serif',
              boxShadow: '0 4px 12px rgba(255,93,158,0.1)',
              transition: 'all 0.2s ease',
            }}>
              {val}
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <div style={{ fontSize: '1.1rem', fontWeight: '700', textAlign: 'center',
          color: selected === problem.answer ? '#16a34a' : '#dc2626' }}>
          {selected === problem.answer ? '🌟 答对啦！' : `💡 正确答案是 ${problem.answer} 哦！`}
        </div>
      )}
    </div>
  );
}

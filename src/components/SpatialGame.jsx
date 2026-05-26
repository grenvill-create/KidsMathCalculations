import React, { useState, useCallback } from 'react';
import { audioSynth } from '../utils/audioSynth';

const SCENARIOS = [
  {
    question: (obj, container) => `${obj} 在 ${container} 的___？`,
    scenes: [
      { obj: '🐱', container: '📦', answer: '上面', display: '📦\n上面:🐱', render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '3rem' }}>🐱</span>
          <span style={{ fontSize: '3rem' }}>📦</span>
        </div>
      )},
      { obj: '🐱', container: '📦', answer: '下面', display: '', render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '3rem' }}>📦</span>
          <span style={{ fontSize: '3rem' }}>🐱</span>
        </div>
      )},
      { obj: '🐱', container: '📦', answer: '左边', display: '', render: () => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '3rem' }}>🐱</span>
          <span style={{ fontSize: '3rem' }}>📦</span>
        </div>
      )},
      { obj: '🐱', container: '📦', answer: '右边', display: '', render: () => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '3rem' }}>📦</span>
          <span style={{ fontSize: '3rem' }}>🐱</span>
        </div>
      )},
      { obj: '⚽', container: '🧺', answer: '里面', display: '', render: () => (
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '4rem' }}>🧺</span>
          <span style={{ position: 'absolute', fontSize: '1.8rem', marginTop: '4px' }}>⚽</span>
        </div>
      )},
      { obj: '🍎', container: '🧺', answer: '上面', display: '', render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '3rem' }}>🍎</span>
          <span style={{ fontSize: '3rem' }}>🧺</span>
        </div>
      )},
      { obj: '🐟', container: '🌊', answer: '里面', display: '', render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0' }}>
          <span style={{ fontSize: '3rem' }}>🌊</span>
          <span style={{ fontSize: '3rem', marginTop: '-10px' }}>🐟</span>
        </div>
      )},
      { obj: '☁️', container: '🏠', answer: '上面', display: '', render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '3rem' }}>☁️</span>
          <span style={{ fontSize: '3rem' }}>🏠</span>
        </div>
      )},
    ],
  },
];

const ALL_SCENES = SCENARIOS[0].scenes;
const ALL_DIRECTIONS = ['上面', '下面', '左边', '右边', '里面'];

function generateProblem() {
  const scene = ALL_SCENES[Math.floor(Math.random() * ALL_SCENES.length)];
  const answer = scene.answer;
  const wrong = ALL_DIRECTIONS.filter(d => d !== answer);
  const wrongChoices = wrong.sort(() => Math.random() - 0.5).slice(0, 3);
  const choices = [answer, ...wrongChoices].sort(() => Math.random() - 0.5);
  return { scene, answer, choices };
}

export default function SpatialGame() {
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
          🧭 {problem.scene.obj} 在 {problem.scene.container} 的___？
        </div>
        <div style={{ fontSize: '0.9rem', color: '#d4879e', fontWeight: '600' }}>
          📝 本次 {sessionCount} 题 · ✅ 答对 {correctCount} 题
        </div>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.8)', borderRadius: '28px', padding: '30px 20px',
        width: '100%', maxWidth: '380px',
        boxShadow: '0 8px 30px rgba(255,93,158,0.1)', border: '2.5px solid rgba(255,255,255,0.9)',
        display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '140px',
      }}>
        {problem.scene.render()}
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
              fontWeight: '700', fontSize: '1.4rem',
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
          {selected === problem.answer
            ? `🌟 答对了！在${problem.answer}！`
            : `💡 是在${problem.answer}哦，再看看！`}
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { audioSynth } from '../utils/audioSynth';

const SCENARIOS = [
  {
    scenes: [
      { obj: '🐱', container: '📦', answer: '上面', render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '3rem' }}>🐱</span>
          <span style={{ fontSize: '3rem' }}>📦</span>
        </div>
      )},
      { obj: '🐱', container: '📦', answer: '下面', render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '3rem' }}>📦</span>
          <span style={{ fontSize: '3rem' }}>🐱</span>
        </div>
      )},
      { obj: '🐱', container: '📦', answer: '左边', render: () => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '3rem' }}>🐱</span>
          <span style={{ fontSize: '3rem' }}>📦</span>
        </div>
      )},
      { obj: '🐱', container: '📦', answer: '右边', render: () => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '3rem' }}>📦</span>
          <span style={{ fontSize: '3rem' }}>🐱</span>
        </div>
      )},
      { obj: '⚽', container: '🧺', answer: '里面', render: () => (
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '4rem' }}>🧺</span>
          <span style={{ position: 'absolute', fontSize: '1.8rem', marginTop: '4px' }}>⚽</span>
        </div>
      )},
      { obj: '🍎', container: '🧺', answer: '上面', render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '3rem' }}>🍎</span>
          <span style={{ fontSize: '3rem' }}>🧺</span>
        </div>
      )},
      { obj: '🐟', container: '🌊', answer: '里面', render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0' }}>
          <span style={{ fontSize: '3rem' }}>🌊</span>
          <span style={{ fontSize: '3rem', marginTop: '-10px' }}>🐟</span>
        </div>
      )},
      { obj: '☁️', container: '🏠', answer: '上面', render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '3rem' }}>☁️</span>
          <span style={{ fontSize: '3rem' }}>🏠</span>
        </div>
      )},
    ],
  },
];

const ALL_SCENES = SCENARIOS[0].scenes;
const DIRECTION_MAP = {
  '上面': { zh: '上面', en: 'Top' },
  '下面': { zh: '下面', en: 'Bottom' },
  '左边': { zh: '左边', en: 'Left' },
  '右边': { zh: '右边', en: 'Right' },
  '里面': { zh: '里面', en: 'Inside' },
};

const HARD_RIDDLES = [
  {
    qZh: "苹果在香蕉的上面，香蕉在草莓的上面。谁在最下面？",
    qEn: "Apple is on top of Banana. Banana is on top of Strawberry. Which one is at the bottom?",
    ansZh: "草莓",
    ansEn: "Strawberry",
    choicesZh: ["苹果", "香蕉", "草莓"],
    choicesEn: ["Apple", "Banana", "Strawberry"]
  },
  {
    qZh: "小猫在箱子里，箱子在桌子上。谁在最下面？",
    qEn: "The cat is in the box. The box is on the table. Which one is at the bottom?",
    ansZh: "桌子",
    ansEn: "Table",
    choicesZh: ["小猫", "箱子", "桌子"],
    choicesEn: ["Cat", "Box", "Table"]
  },
  {
    qZh: "红球在绿球的左边，蓝球在绿球的右边。谁在中间？",
    qEn: "Red ball is to the left of Green ball. Blue ball is to the right of Green ball. Which one is in the middle?",
    ansZh: "绿球",
    ansEn: "Green ball",
    choicesZh: ["红球", "绿球", "蓝球"],
    choicesEn: ["Red ball", "Green ball", "Blue ball"]
  },
  {
    qZh: "小狗在小猫的右边，小猴在小狗的右边。谁在最左边？",
    qEn: "Dog is to the right of Cat. Monkey is to the right of Dog. Which one is on the far left?",
    ansZh: "小猫",
    ansEn: "Cat",
    choicesZh: ["小猫", "小狗", "小猴"],
    choicesEn: ["Cat", "Dog", "Monkey"]
  }
];

function generateProblem(level) {
  if (level === 1) {
    // Easy: filter out Left/Right scenes. 3 choices max.
    const easyScenes = ALL_SCENES.filter(s => s.answer !== '左边' && s.answer !== '右边');
    const scene = easyScenes[Math.floor(Math.random() * easyScenes.length)];
    const answer = scene.answer;
    const wrong = ['上面', '下面', '里面'].filter(d => d !== answer);
    const choices = [answer, ...wrong].sort(() => Math.random() - 0.5);
    return { scene, answer, choices, isRiddle: false };
  } else if (level === 2) {
    // Medium: all scenes, 4 choices.
    const scene = ALL_SCENES[Math.floor(Math.random() * ALL_SCENES.length)];
    const answer = scene.answer;
    const wrong = Object.keys(DIRECTION_MAP).filter(d => d !== answer);
    const wrongChoices = wrong.sort(() => Math.random() - 0.5).slice(0, 3);
    const choices = [answer, ...wrongChoices].sort(() => Math.random() - 0.5);
    return { scene, answer, choices, isRiddle: false };
  } else {
    // Hard: Riddle spatial logical reasoning
    const riddle = HARD_RIDDLES[Math.floor(Math.random() * HARD_RIDDLES.length)];
    return { riddle, isRiddle: true };
  }
}

export default function SpatialGame({ autoAdvance, lang = 'zh', difficultyMode = 'adaptive' }) {
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
    
    const isCorrect = problem.isRiddle 
      ? (val === (lang === 'en' ? problem.riddle.ansEn : problem.riddle.ansZh))
      : (val === problem.answer);

    if (isCorrect) {
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

  const renderRiddleContent = () => {
    return (
      <div style={{
        background: 'rgba(255,255,255,0.85)', borderRadius: '24px', padding: '24px 20px',
        width: '100%', maxWidth: '380px', textAlign: 'center',
        boxShadow: '0 8px 30px rgba(255,93,158,0.12)', border: '2.5px solid #f5c0d0',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px'
      }}>
        <span style={{ fontSize: '2.5rem' }}>🧭</span>
        <p style={{ fontSize: '1.25rem', color: '#c0487a', fontWeight: '700', margin: 0, lineHeight: 1.45 }}>
          {isEn ? problem.riddle.qEn : problem.riddle.qZh}
        </p>
      </div>
    );
  };

  const renderRiddleChoices = () => {
    const choices = isEn ? problem.riddle.choicesEn : problem.riddle.choicesZh;
    const answerVal = isEn ? problem.riddle.ansEn : problem.riddle.ansZh;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '360px' }}>
        {choices.map(val => {
          let bg = 'white', border = '#f5c0d0', color = '#c06080';
          if (selected !== null) {
            if (val === answerVal) { bg = '#f0fdf4'; border = '#4ade80'; color = '#16a34a'; }
            else if (val === selected) { bg = '#fef2f2'; border = '#f87171'; color = '#dc2626'; }
          }
          return (
            <button key={val} onClick={() => handleChoice(val)} style={{
              padding: '16px', borderRadius: '20px',
              border: `3px solid ${border}`, background: bg, color,
              fontWeight: '700', fontSize: '1.25rem',
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
    );
  };

  const renderRiddleResult = () => {
    const answerVal = isEn ? problem.riddle.ansEn : problem.riddle.ansZh;
    const correct = selected === answerVal;
    return (
      <div style={{ fontSize: '1.1rem', fontWeight: '600', textAlign: 'center', color: correct ? '#16a34a' : '#dc2626' }}>
        {correct 
          ? (isEn ? '🌟 Correct! You are a spatial genius!' : '🌟 答对啦！你太棒了！')
          : (isEn ? `💡 Correct answer is: ${answerVal}!` : `💡 正确答案是：${answerVal} 哦！`)}
      </div>
    );
  };

  return (
    <div className="screen-wrapper fade-in" style={{ justifyContent: 'flex-start', gap: '20px', paddingBottom: '20px', overflowY: 'auto' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '1.3rem', fontWeight: '600', color: '#c0487a', marginBottom: '4px' }}>
          {problem.isRiddle 
            ? (isEn ? '🧭 Solve the spatial puzzle!' : '🧭 解决空间方位谜题！')
            : (isEn 
                ? `🧭 Where is the ${problem.scene.obj} relative to the ${problem.scene.container}?` 
                : `🧭 ${problem.scene.obj} 在 ${problem.scene.container} 的___？`)}
        </div>
        <div style={{ fontSize: '0.9rem', color: '#d4879e', fontWeight: '600' }}>
          {isEn
            ? `📝 Total: ${sessionCount} · ✅ Correct: ${correctCount}`
            : `📝 本次 ${sessionCount} 题 · ✅ 答对 ${correctCount} 题`}
        </div>
      </div>

      {problem.isRiddle ? renderRiddleContent() : (
        <div style={{
          background: 'rgba(255,255,255,0.8)', borderRadius: '28px', padding: '30px 20px',
          width: '100%', maxWidth: '380px',
          boxShadow: '0 8px 30px rgba(255,93,158,0.1)', border: '2.5px solid rgba(255,255,255,0.9)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '140px',
        }}>
          {problem.scene.render()}
        </div>
      )}

      {problem.isRiddle ? renderRiddleChoices() : (
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
                fontWeight: '600', fontSize: '1.4rem',
                cursor: selected !== null ? 'default' : 'pointer',
                fontFamily: 'Fredoka, sans-serif',
                boxShadow: '0 4px 12px rgba(255,93,158,0.1)',
                transition: 'all 0.2s ease',
              }}>
                {isEn ? DIRECTION_MAP[val].en : DIRECTION_MAP[val].zh}
              </button>
            );
          })}
        </div>
      )}

      {selected !== null && (
        <div className="bounce-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          {problem.isRiddle ? renderRiddleResult() : (
            <div style={{ fontSize: '1.1rem', fontWeight: '600', textAlign: 'center',
              color: selected === problem.answer ? '#16a34a' : '#dc2626' }}>
              {selected === problem.answer
                ? (isEn ? `🌟 Correct! It's ${DIRECTION_MAP[problem.answer].en.toLowerCase()}!` : `🌟 答对啦！在${DIRECTION_MAP[problem.answer].zh}！`)
                : (isEn ? `💡 It's actually ${DIRECTION_MAP[problem.answer].en.toLowerCase()}!` : `💡 是在${DIRECTION_MAP[problem.answer].zh}哦，再看看！`)}
            </div>
          )}
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

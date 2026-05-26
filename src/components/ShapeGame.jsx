import React, { useState, useEffect, useCallback } from 'react';
import { audioSynth } from '../utils/audioSynth';

const SHAPES = [
  { id: 'circle',    nameZh: '圆形',   nameEn: 'Circle',    color: '#ff85b8',
    riddleEn: "I am perfectly round with no straight sides or corners. What am I?",
    riddleZh: "我圆圆的，没有直直的边，也没有角。我是什么形状？" },
  { id: 'triangle',  nameZh: '三角形', nameEn: 'Triangle',  color: '#ffb347',
    riddleEn: "I have 3 corners and 3 straight sides. What am I?",
    riddleZh: "我有3个角和3条直直的边。我是什么形状？" },
  { id: 'square',    nameZh: '正方形', nameEn: 'Square',    color: '#5bb8d4',
    riddleEn: "I have 4 straight sides that are all the same length, and 4 corners. What am I?",
    riddleZh: "我有4条一样长的直直边，还有4个角。我是什么形状？" },
  { id: 'rectangle', nameZh: '长方形', nameEn: 'Rectangle', color: '#5dc882',
    riddleEn: "I have 4 sides and 4 corners. My opposite sides are equal in length. What am I?",
    riddleZh: "我有4条边和4个角，对边一样长，但四条边不全相等。我是什么形状？" },
  { id: 'diamond',   nameZh: '菱形',   nameEn: 'Diamond',   color: '#a57bc4',
    riddleEn: "I have 4 equal sides but I look like a tilted square or a kite. What am I?",
    riddleZh: "我有4条等长的边，但我看起来斜斜的像个风筝。我是什么形状？" },
  { id: 'star',      nameZh: '星形',   nameEn: 'Star',      color: '#ffd700',
    riddleEn: "I have 5 pointy tips and shine bright in the night sky. What am I?",
    riddleZh: "我有5个尖尖的角，像夜空里亮晶晶的眼睛。我是什么形状？" },
];

const ShapeSVG = ({ id, color, size = 150 }) => {
  const c = size / 2;
  const s = size;
  const props = { fill: color, stroke: 'rgba(255,255,255,0.55)', strokeWidth: 4 };

  const renderShape = () => {
    switch (id) {
      case 'circle':
        return <circle cx={c} cy={c} r={c - 14} {...props} />;
      case 'triangle':
        return <polygon points={`${c},12 ${s - 10},${s - 10} 10,${s - 10}`} {...props} />;
      case 'square':
        return <rect x={14} y={14} width={s - 28} height={s - 28} rx={8} {...props} />;
      case 'rectangle':
        return <rect x={8} y={c - 38} width={s - 16} height={76} rx={8} {...props} />;
      case 'diamond':
        return <polygon points={`${c},10 ${s - 10},${c} ${c},${s - 10} 10,${c}`} {...props} />;
      case 'star': {
        const outerR = c - 10;
        const innerR = outerR * 0.42;
        const pts = Array.from({ length: 10 }, (_, i) => {
          const angle = (i * 36 - 90) * (Math.PI / 180);
          const r = i % 2 === 0 ? outerR : innerR;
          return `${c + r * Math.cos(angle)},${c + r * Math.sin(angle)}`;
        });
        return <polygon points={pts.join(' ')} {...props} />;
      }
      default: return null;
    }
  };

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      <defs>
        <filter id={`shadow-${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="rgba(0,0,0,0.14)" />
        </filter>
      </defs>
      <g filter={`url(#shadow-${id})`}>
        {renderShape()}
      </g>
    </svg>
  );
};

function generateQuestion(level) {
  // Level 1: Circle, Square, Triangle only
  // Level 2: All 6 shapes
  // Level 3: All 6 shapes, but presented as a text riddle first (visual hidden or revealed on correct)
  const pool = level === 1 ? SHAPES.slice(0, 3) : SHAPES;
  const shape = pool[Math.floor(Math.random() * pool.length)];
  const wrong = pool.filter(s => s.id !== shape.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
  const choices = [shape, ...wrong].sort(() => Math.random() - 0.5);
  return { shape, choices };
}

export default function ShapeGame({ autoAdvance, lang = 'zh', difficultyMode = 'adaptive' }) {
  const [adaptiveLevel, setAdaptiveLevel] = useState(1);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);

  const level = difficultyMode === 'easy' ? 1 : 
                difficultyMode === 'medium' ? 2 : 
                difficultyMode === 'hard' ? 3 : adaptiveLevel;

  const [question, setQuestion] = useState(() => generateQuestion(level));
  const [selectedId, setSelectedId] = useState(null);
  const [sessionCount, setSessionCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const next = useCallback(() => {
    setQuestion(generateQuestion(level));
    setSelectedId(null);
  }, [level]);

  useEffect(() => {
    next();
  }, [level, next]);

  const handleChoice = (choice) => {
    if (selectedId !== null) return;
    setSelectedId(choice.id);
    setSessionCount(p => p + 1);
    if (choice.id === question.shape.id) {
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

  if (!question) return null;

  const isEn = lang === 'en';
  const getLocalizedName = (s) => isEn ? s.nameEn : s.nameZh;

  return (
    <div className="screen-wrapper fade-in" style={{ justifyContent: 'flex-start', gap: '16px', paddingBottom: '20px', overflowY: 'auto' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '1.3rem', fontWeight: '600', color: '#c0487a', marginBottom: '4px' }}>
          {level === 3 
            ? (isEn ? '🧠 Solve the shape riddle!' : '🧠 猜猜这是什么形状？')
            : (isEn ? '🔷 Which shape is this?' : '🔷 这是什么形状？')}
        </div>
        <div style={{ fontSize: '0.9rem', color: '#d4879e', fontWeight: '600' }}>
          {isEn
            ? `📝 Total: ${sessionCount} · ✅ Correct: ${correctCount}`
            : `📝 本次 ${sessionCount} 题 · ✅ 答对 ${correctCount} 题`}
        </div>
      </div>

      {level === 3 ? (
        <div style={{
          background: 'rgba(255,255,255,0.85)', borderRadius: '24px', padding: '20px',
          width: '100%', maxWidth: '380px', textAlign: 'center',
          boxShadow: '0 8px 30px rgba(255,93,158,0.12)', border: '2.5px solid #f5c0d0',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px'
        }}>
          <span style={{ fontSize: '2.5rem' }}>❓</span>
          <p style={{ fontSize: '1.15rem', color: '#c0487a', fontWeight: '600', margin: 0, lineHeight: 1.4 }}>
            {isEn ? question.shape.riddleEn : question.shape.riddleZh}
          </p>
          {selectedId !== null && (
            <div className="fade-in" style={{ marginTop: '10px' }}>
              <ShapeSVG id={question.shape.id} color={question.shape.color} size={100} />
            </div>
          )}
        </div>
      ) : (
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          background: 'rgba(255,255,255,0.75)', borderRadius: '28px',
          padding: '20px', boxShadow: '0 8px 30px rgba(255,93,158,0.12)',
          border: '2.5px solid rgba(255,255,255,0.9)',
        }}>
          <ShapeSVG id={question.shape.id} color={question.shape.color} size={160} />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%', maxWidth: '360px' }}>
        {question.choices.map(choice => {
          let bg = 'white', border = '#f5c0d0', color = '#c06080';
          if (selectedId !== null) {
            if (choice.id === question.shape.id)  { bg = '#f0fdf4'; border = '#4ade80'; color = '#16a34a'; }
            else if (choice.id === selectedId)       { bg = '#fef2f2'; border = '#f87171'; color = '#dc2626'; }
          }
          return (
            <button key={choice.id} onClick={() => handleChoice(choice)}
              style={{
                padding: '16px 10px', borderRadius: '20px',
                border: `3px solid ${border}`, background: bg, color,
                fontWeight: '600', fontSize: '1.3rem',
                cursor: selectedId !== null ? 'default' : 'pointer',
                fontFamily: 'Fredoka, sans-serif',
                boxShadow: '0 4px 12px rgba(255,93,158,0.1)',
                transition: 'all 0.2s ease',
              }}>
              {getLocalizedName(choice)}
            </button>
          );
        })}
      </div>

      {selectedId !== null && (
        <div className="bounce-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{
            fontSize: '1.1rem', fontWeight: '600', textAlign: 'center',
            color: selectedId === question.shape.id ? '#16a34a' : '#dc2626',
          }}>
            {selectedId === question.shape.id
              ? (isEn ? '🌟 Correct! Great job!' : '🌟 答对啦！真棒！')
              : (isEn ? `💡 It's a ${question.shape.nameEn}!` : `💡 这是${question.shape.nameZh}哦！`)}
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

import React, { useState, useEffect, useCallback } from 'react';
import { audioSynth } from '../utils/audioSynth';

const SHAPES = [
  { id: 'circle',    name: '圆形',   color: '#ff85b8' },
  { id: 'triangle',  name: '三角形', color: '#ffb347' },
  { id: 'square',    name: '正方形', color: '#5bb8d4' },
  { id: 'rectangle', name: '长方形', color: '#5dc882' },
  { id: 'diamond',   name: '菱形',   color: '#a57bc4' },
  { id: 'star',      name: '星形',   color: '#ffd700' },
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

function generateQuestion() {
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  const wrong = SHAPES.filter(s => s.id !== shape.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
  const choices = [shape, ...wrong].sort(() => Math.random() - 0.5);
  return { shape, choices };
}

export default function ShapeGame({ autoAdvance }) {
  const [question, setQuestion] = useState(null);
  const [selected, setSelected] = useState(null);
  const [sessionCount, setSessionCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const next = useCallback(() => {
    setQuestion(generateQuestion());
    setSelected(null);
  }, []);

  useEffect(() => { next(); }, []);

  const handleChoice = (choice) => {
    if (selected !== null) return;
    setSelected(choice.id);
    setSessionCount(p => p + 1);
    if (choice.id === question.shape.id) {
      audioSynth.playCorrect();
      setCorrectCount(p => p + 1);
      if (autoAdvance) {
        setTimeout(next, 1200);
      }
    } else {
      audioSynth.playIncorrect();
      if (autoAdvance) {
        setTimeout(next, 1800);
      }
    }
  };

  if (!question) return null;

  return (
    <div className="screen-wrapper fade-in" style={{ justifyContent: 'flex-start', gap: '16px', paddingBottom: '20px', overflowY: 'auto' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '1.3rem', fontWeight: '700', color: '#c0487a', marginBottom: '4px' }}>
          🔷 这是什么形状？
        </div>
        <div style={{ fontSize: '0.9rem', color: '#d4879e', fontWeight: '600' }}>
          📝 本次 {sessionCount} 题 · ✅ 答对 {correctCount} 题
        </div>
      </div>

      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        background: 'rgba(255,255,255,0.75)', borderRadius: '28px',
        padding: '20px', boxShadow: '0 8px 30px rgba(255,93,158,0.12)',
        border: '2.5px solid rgba(255,255,255,0.9)',
      }}>
        <ShapeSVG id={question.shape.id} color={question.shape.color} size={160} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%', maxWidth: '360px' }}>
        {question.choices.map(choice => {
          let bg = 'white', border = '#f5c0d0', color = '#c06080';
          if (selected !== null) {
            if (choice.id === question.shape.id)  { bg = '#f0fdf4'; border = '#4ade80'; color = '#16a34a'; }
            else if (choice.id === selected)       { bg = '#fef2f2'; border = '#f87171'; color = '#dc2626'; }
          }
          return (
            <button key={choice.id} onClick={() => handleChoice(choice)}
              style={{
                padding: '16px 10px', borderRadius: '20px',
                border: `3px solid ${border}`, background: bg, color,
                fontWeight: '700', fontSize: '1.3rem',
                cursor: selected !== null ? 'default' : 'pointer',
                fontFamily: 'Fredoka, sans-serif',
                boxShadow: '0 4px 12px rgba(255,93,158,0.1)',
                transition: 'all 0.2s ease',
              }}>
              {choice.name}
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <div className="bounce-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{
            fontSize: '1.1rem', fontWeight: '700', textAlign: 'center',
            color: selected === question.shape.id ? '#16a34a' : '#dc2626',
          }}>
            {selected === question.shape.id
              ? '🌟 答对啦！真棒！'
              : `💡 这是${question.shape.name}哦！`}
          </div>
          {!autoAdvance && (
            <button
              onClick={next}
              style={{
                marginTop: '6px',
                padding: '10px 28px',
                fontSize: '1.1rem',
                fontWeight: '700',
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
              下一题 ➔
            </button>
          )}
        </div>
      )}
    </div>
  );
}

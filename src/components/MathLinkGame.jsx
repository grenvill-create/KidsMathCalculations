import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Star, Play } from 'lucide-react';
import { audioSynth } from '../utils/audioSynth';

const PAIR_COUNT = 6;
const COLORS = [
  { bg: '#fee2e2', border: '#ef4444', text: '#b91c1c' }, // red
  { bg: '#fef9c3', border: '#eab308', text: '#a16207' }, // yellow
  { bg: '#dcfce7', border: '#22c55e', text: '#15803d' }, // green
  { bg: '#dbeafe', border: '#3b82f6', text: '#1d4ed8' }, // blue
  { bg: '#f3e8ff', border: '#a855f7', text: '#7e22ce' }, // purple
  { bg: '#fce7f3', border: '#ec4899', text: '#be185d' }, // pink
  { bg: '#ffedd5', border: '#f97316', text: '#c2410c' }, // orange
  { bg: '#ccfbf1', border: '#14b8a6', text: '#0f766e' }, // teal
];

function generateEquations() {
  const pairs = [];
  const usedAns = new Set();
  
  const shuffledColors = [...COLORS].sort(() => Math.random() - 0.5);

  for (let i = 0; i < PAIR_COUNT; i++) {
    let eqLabel = "";
    let ansValue = 0;
    
    for(let attempt=0; attempt<50; attempt++) {
        const isAdd = Math.random() > 0.5;
        let a, b;
        if (isAdd) {
            a = Math.floor(Math.random() * 10) + 1;
            b = Math.floor(Math.random() * 10) + 1;
            ansValue = a + b;
            eqLabel = `${a} + ${b}`;
        } else {
            ansValue = Math.floor(Math.random() * 10) + 1;
            b = Math.floor(Math.random() * 10) + 1;
            a = ansValue + b;
            eqLabel = `${a} - ${b}`;
        }
        if (!usedAns.has(ansValue) && ansValue <= 20) {
            break;
        }
    }
    usedAns.add(ansValue);
    
    pairs.push({
        id: `pair-${Date.now()}-${i}`,
        eqLabel,
        ansValue,
        color: shuffledColors[i % shuffledColors.length]
    });
  }
  
  const leftItems = [...pairs].sort(() => Math.random() - 0.5);
  const rightItems = [...pairs].sort(() => Math.random() - 0.5);
  
  return { leftItems, rightItems };
}

export default function MathLinkGame({ lang, onBack }) {
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  
  const [leftItems, setLeftItems] = useState([]);
  const [rightItems, setRightItems] = useState([]);
  
  const [matchedIds, setMatchedIds] = useState([]);
  const [selLeftId, setSelLeftId] = useState(null);
  const [selRightId, setSelRightId] = useState(null);
  const [wrongFlash, setWrongFlash] = useState(false);

  const startRound = (newRound) => {
    const { leftItems, rightItems } = generateEquations();
    setLeftItems(leftItems);
    setRightItems(rightItems);
    setMatchedIds([]);
    setSelLeftId(null);
    setSelRightId(null);
    setWrongFlash(false);
    setRound(newRound);
  };

  useEffect(() => {
    startRound(1);
  }, []);

  const handleLeftClick = (id) => {
    if (matchedIds.includes(id)) return;
    audioSynth.playClick();
    if (selRightId) {
        checkMatch(id, selRightId);
    } else {
        setSelLeftId(id === selLeftId ? null : id);
    }
  };

  const handleRightClick = (id) => {
    if (matchedIds.includes(id)) return;
    audioSynth.playClick();
    if (selLeftId) {
        checkMatch(selLeftId, id);
    } else {
        setSelRightId(id === selRightId ? null : id);
    }
  };

  const checkMatch = (leftId, rightId) => {
    if (leftId === rightId) {
        // Correct match!
        audioSynth.playCorrect();
        const newMatched = [...matchedIds, leftId];
        setMatchedIds(newMatched);
        setScore(s => s + 10);
        setSelLeftId(null);
        setSelRightId(null);
        
        if (newMatched.length === PAIR_COUNT) {
            audioSynth.playWin();
        }
    } else {
        // Wrong match!
        audioSynth.playIncorrect();
        setSelLeftId(null);
        setSelRightId(null);
        setWrongFlash(true);
        setTimeout(() => setWrongFlash(false), 400);
    }
  };

  const handleRestart = () => {
    setScore(0);
    startRound(1);
  };
  
  const isWon = matchedIds.length === PAIR_COUNT && PAIR_COUNT > 0;

  return (
    <div className="screen-wrapper fade-in" style={{ padding: '20px', overflowY: 'auto' }}>
      <style>{`
        .mathlink-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-top: 20px;
        }
        .mathlink-column {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .mathlink-card {
          border-radius: 16px;
          padding: 15px 10px;
          font-size: 1.2rem;
          font-weight: 800;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
          user-select: none;
          min-height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .mathlink-card:active {
          transform: scale(0.95);
        }
        .mathlink-card.matched {
          transform: scale(0.9);
          opacity: 0.6;
          cursor: default;
          box-shadow: none;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .shake-err {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>

      <div className="card-shadow" style={{
        width: '100%', maxWidth: '500px', margin: '0 auto',
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)',
        padding: '24px', borderRadius: '24px'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <button className="bouncy-button secondary" onClick={onBack} style={{ padding: '8px 12px' }}>
            <ArrowLeft size={20}/>
          </button>
          <div style={{ fontWeight: 800, fontSize: '1.3rem', color: '#4f46e5' }}>
            {lang === 'en' ? 'Equation Link' : '算式连连看'}
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#fef9c3', padding: '6px 12px', borderRadius: '20px', fontWeight: 800, color: '#a16207', fontSize: '1rem' }}>
              <Star size={16} fill="#eab308" color="#eab308"/> {score}
            </div>
          </div>
        </div>

        {/* Win Screen */}
        {isWon ? (
          <div className="bounce-in" style={{ textAlign: 'center', padding: '40px 20px', background: '#f0fdf4', borderRadius: '20px', border: '3px solid #86efac' }}>
            <div style={{ fontSize: '4rem', marginBottom: '10px' }}>🎉</div>
            <h2 style={{ color: '#166534', margin: '0 0 10px 0' }}>
              {lang === 'en' ? `Round ${round} Cleared!` : `第 ${round} 关通过！`}
            </h2>
            <button className="bouncy-button primary" onClick={() => startRound(round + 1)} style={{ marginTop: '20px', padding: '14px 30px', fontSize: '1.1rem' }}>
              <Play size={20} style={{ marginRight: '8px' }}/>
              {lang === 'en' ? 'Next Round' : '下一关'}
            </button>
          </div>
        ) : (
          /* Game Board */
          <div className={`mathlink-grid ${wrongFlash ? 'shake-err' : ''}`}>
            
            {/* Left Column (Equations) */}
            <div className="mathlink-column">
              <div style={{ textAlign: 'center', color: '#64748b', fontWeight: 700, fontSize: '0.9rem' }}>
                {lang === 'en' ? 'Equations' : '算式'}
              </div>
              {leftItems.map(item => {
                const isMatched = matchedIds.includes(item.id);
                const isSelected = selLeftId === item.id;
                
                let bg = '#ffffff';
                let border = '3px solid #e2e8f0';
                let color = '#334155';
                
                if (isMatched) {
                    bg = item.color.bg;
                    border = `3px solid ${item.color.bg}`;
                    color = item.color.text;
                } else if (isSelected) {
                    bg = item.color.bg;
                    border = `3px solid ${item.color.border}`;
                    color = item.color.text;
                }

                return (
                  <div key={item.id} 
                       className={`mathlink-card ${isMatched ? 'matched' : ''}`}
                       style={{ background: bg, border: border, color: color, transform: isSelected ? 'scale(1.05)' : '' }}
                       onClick={() => handleLeftClick(item.id)}>
                    {isMatched ? '✔️' : item.eqLabel}
                  </div>
                );
              })}
            </div>

            {/* Right Column (Answers) */}
            <div className="mathlink-column">
              <div style={{ textAlign: 'center', color: '#64748b', fontWeight: 700, fontSize: '0.9rem' }}>
                {lang === 'en' ? 'Answers' : '答案'}
              </div>
              {rightItems.map(item => {
                const isMatched = matchedIds.includes(item.id);
                const isSelected = selRightId === item.id;
                
                let bg = '#ffffff';
                let border = '3px solid #e2e8f0';
                let color = '#334155';
                
                if (isMatched) {
                    bg = item.color.bg;
                    border = `3px solid ${item.color.bg}`;
                    color = item.color.text;
                } else if (isSelected) {
                    bg = item.color.bg;
                    border = `3px solid ${item.color.border}`;
                    color = item.color.text;
                }

                return (
                  <div key={item.id} 
                       className={`mathlink-card ${isMatched ? 'matched' : ''}`}
                       style={{ background: bg, border: border, color: color, transform: isSelected ? 'scale(1.05)' : '' }}
                       onClick={() => handleRightClick(item.id)}>
                    {isMatched ? '✔️' : item.ansValue}
                  </div>
                );
              })}
            </div>

          </div>
        )}

        <button className="bouncy-button secondary" onClick={handleRestart} style={{ width: '100%', marginTop: '20px', padding: '12px' }}>
          <RefreshCw size={18} style={{ marginRight: '8px' }}/>
          {lang === 'en' ? 'Restart Game' : '重新开始'}
        </button>

      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RefreshCw, Star, Clock } from 'lucide-react';
import { audioSynth } from '../utils/audioSynth';

// Generate a random equation with result within 1-20
const genEquation = (usedAnswers = new Set()) => {
  let attempts = 0;
  while (attempts < 50) {
    const isAdd = Math.random() > 0.45;
    let a, b, result;
    if (isAdd) {
      a = Math.floor(Math.random() * 15) + 1; // 1-15
      b = Math.floor(Math.random() * (20 - a)) + 1; // b such that a+b <= 20
      result = a + b;
    } else {
      result = Math.floor(Math.random() * 19) + 1; // result 1-19
      b = Math.floor(Math.random() * 10) + 1;
      a = result + b;
      if (a > 20) { attempts++; continue; }
    }
    if (!usedAnswers.has(result) && result >= 1 && result <= 20) {
      return { a, b, op: isAdd ? '+' : '-', result, display: `${a} ${isAdd ? '+' : '−'} ${b}` };
    }
    attempts++;
  }
  // Fallback
  return { a: 3, b: 7, op: '+', result: 10, display: '3 + 7' };
};

const genId = () => Math.random().toString(36).substr(2, 9);

const MATCH_COLORS = [
  { bg: 'linear-gradient(135deg, #fecaca, #fca5a5)', border: '#ef4444', text: '#b91c1c' }, // Red
  { bg: 'linear-gradient(135deg, #fef08a, #fde047)', border: '#eab308', text: '#a16207' }, // Yellow
  { bg: 'linear-gradient(135deg, #bbf7d0, #86efac)', border: '#22c55e', text: '#15803d' }, // Green
  { bg: 'linear-gradient(135deg, #bfdbfe, #93c5fd)', border: '#3b82f6', text: '#1d4ed8' }, // Blue
  { bg: 'linear-gradient(135deg, #e9d5ff, #d8b4fe)', border: '#a855f7', text: '#7e22ce' }, // Purple
  { bg: 'linear-gradient(135deg, #fbcfe8, #f9a8d4)', border: '#ec4899', text: '#be185d' }, // Pink
  { bg: 'linear-gradient(135deg, #fed7aa, #fdba74)', border: '#f97316', text: '#c2410c' }, // Orange
  { bg: 'linear-gradient(135deg, #99f6e4, #5eead4)', border: '#14b8a6', text: '#0f766e' }, // Teal
];

const PAIR_COUNT = 6; // 6 equation-answer pairs per round

export default function MathLinkGame({ lang, onBack }) {
  const [equations, setEquations] = useState([]); // left side: equation cards
  const [answers, setAnswers] = useState([]);     // right side: answer cards
  const [selectedEq, setSelectedEq] = useState(null);
  const [selectedAns, setSelectedAns] = useState(null);
  const [matched, setMatched] = useState(new Set()); // IDs of matched cards
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [wrongFlash, setWrongFlash] = useState(new Set());
  const [successFlash, setSuccessFlash] = useState(new Set());
  const [combo, setCombo] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const [comboPos, setComboPos] = useState({ x: 0, y: 0 });
  const [allDone, setAllDone] = useState(false);
  const [roundKey, setRoundKey] = useState(0);

  const generateRound = () => {
    const usedAnswers = new Set();
    const eqs = [];
    
    // Pick unique colors for this round
    const shuffledColors = [...Array(MATCH_COLORS.length).keys()].sort(() => Math.random() - 0.5);

    for (let i = 0; i < PAIR_COUNT; i++) {
      const eq = genEquation(usedAnswers);
      usedAnswers.add(eq.result);
      eqs.push({ id: genId(), colorIdx: shuffledColors[i % shuffledColors.length], ...eq });
    }

    // Shuffle answer positions
    const ans = eqs
      .map(eq => ({ id: genId(), eqId: eq.id, value: eq.result, colorIdx: eq.colorIdx }))
      .sort(() => Math.random() - 0.5);

    setEquations(eqs);
    setAnswers(ans);
    setMatched(new Set());
    setSelectedEq(null);
    setSelectedAns(null);
    setWrongFlash(new Set());
    setSuccessFlash(new Set());
    setAllDone(false);
  };

  const startNew = () => {
    setScore(0);
    setRound(1);
    setCombo(0);
    generateRound();
  };

  useEffect(() => {
    startNew();
  }, []);

  useEffect(() => {
    generateRound();
  }, [roundKey]);

  // When matched set is full, advance round
  useEffect(() => {
    if (equations.length > 0 && matched.size === equations.length * 2) {
      audioSynth.playWin();
      const timer = setTimeout(() => {
        setRound(r => r + 1);
        setRoundKey(k => k + 1);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [matched, equations]);

  const handleEquationClick = (eq) => {
    if (matched.has(eq.id)) return;
    audioSynth.playClick();
    if (selectedEq?.id === eq.id) {
      setSelectedEq(null);
      return;
    }
    setSelectedEq(eq);
    // If answer already selected, try to match
    if (selectedAns) {
      tryMatch(eq, selectedAns);
    }
  };

  const handleAnswerClick = (ans) => {
    if (matched.has(ans.id)) return;
    audioSynth.playClick();
    if (selectedAns?.id === ans.id) {
      setSelectedAns(null);
      return;
    }
    setSelectedAns(ans);
    // If equation already selected, try to match
    if (selectedEq) {
      tryMatch(selectedEq, ans);
    }
  };

  const tryMatch = (eq, ans) => {
    if (eq.result === ans.value) {
      // CORRECT
      audioSynth.playCorrect();
      const newCombo = combo + 1;
      setCombo(newCombo);
      setScore(s => s + 10 + (newCombo > 1 ? (newCombo - 1) * 5 : 0));

      setSuccessFlash(prev => new Set([...prev, eq.id, ans.id]));
      setTimeout(() => {
        setMatched(prev => new Set([...prev, eq.id, ans.id]));
        setSuccessFlash(prev => { const s = new Set(prev); s.delete(eq.id); s.delete(ans.id); return s; });
        setSelectedEq(null);
        setSelectedAns(null);
      }, 500);
    } else {
      // WRONG
      audioSynth.playIncorrect();
      setCombo(0);
      setWrongFlash(new Set([eq.id, ans.id]));
      setTimeout(() => {
        setWrongFlash(new Set());
        setSelectedEq(null);
        setSelectedAns(null);
      }, 600);
    }
  };

  const getCardStyle = (id, type) => {
    const isMatched = matched.has(id);
    const isSelected = type === 'eq' ? selectedEq?.id === id : selectedAns?.id === id;
    const isWrong = wrongFlash.has(id);
    const isSuccess = successFlash.has(id);

    const cardData = type === 'eq' ? equations.find(e => e.id === id) : answers.find(a => a.id === id);
    const theme = cardData ? MATCH_COLORS[cardData.colorIdx] : MATCH_COLORS[0];

    let bg = 'white';
    let border = '3px solid #e2e8f0';
    let transform = 'scale(1)';
    let opacity = 1;
    let color = '#1e293b';

    if (isMatched) {
      bg = theme.bg;
      border = `3px solid ${theme.border}`;
      opacity = 0.65;
      color = theme.text;
    } else if (isSuccess) {
      bg = theme.bg;
      border = `3px solid ${theme.border}`;
      transform = 'scale(1.05)';
      color = theme.text;
    } else if (isWrong) {
      bg = 'linear-gradient(135deg, #fee2e2, #fca5a5)';
      border = '3px solid #f87171';
      transform = 'scale(0.95)';
    } else if (isSelected) {
      bg = theme.bg; // Show theme color when selected
      border = `3px solid ${theme.border}`;
      transform = 'scale(1.05)';
      color = theme.text;
    }

    return {
      background: bg,
      border,
      transform,
      opacity,
      borderRadius: '16px',
      padding: '12px 10px',
      cursor: isMatched ? 'default' : 'pointer',
      textAlign: 'center',
      fontWeight: '700',
      fontSize: type === 'eq' ? '1.1rem' : '1.4rem',
      color: color,
      transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
      boxShadow: isSelected
        ? '0 0 0 4px rgba(56,189,248,0.3), 0 4px 12px rgba(0,0,0,0.08)'
        : '0 2px 8px rgba(0,0,0,0.07)',
      userSelect: 'none',
      minHeight: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    };
  };

  return (
    <div className="screen-wrapper fade-in" style={{ padding: '20px', overflowY: 'auto' }}>
      <style>{`
        @keyframes float-combo {
          0% { opacity: 1; transform: translateY(0) scale(1.2); }
          100% { opacity: 0; transform: translateY(-50px) scale(1.5); }
        }
        .matched-tick { font-size: 1.5rem; }
        .link-game-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          width: 100%;
        }
        .link-column {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .link-column-header {
          text-align: center;
          font-weight: 700;
          font-size: 0.9rem;
          color: #94a3b8;
          letter-spacing: 0.5px;
          padding: 4px 0;
        }
      `}</style>

      <div className="card-shadow" style={{
        width: '100%', maxWidth: '480px', margin: '0 auto',
        background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)',
        padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button className="bouncy-button secondary" onClick={onBack} style={{ padding: '8px 12px' }}>
            <ArrowLeft size={20} />
          </button>
          <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#6366f1' }}>
            {lang === 'en' ? 'Equation Link' : '算式连连看'}
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#fef9c3', padding: '5px 10px', borderRadius: '20px', fontWeight: 700, color: '#854d0e', fontSize: '0.95rem' }}>
              <Star size={15} fill="#ca8a04" color="#ca8a04" />
              {score}
            </div>
            <div style={{ background: '#ede9fe', padding: '5px 10px', borderRadius: '20px', fontWeight: 700, color: '#6d28d9', fontSize: '0.9rem' }}>
              {lang === 'en' ? `Round ${round}` : `第 ${round} 关`}
            </div>
          </div>
        </div>

        {/* Instruction */}
        <div style={{ textAlign: 'center', fontSize: '0.9rem', color: '#64748b', background: '#f8fafc', borderRadius: '12px', padding: '8px 12px' }}>
          {lang === 'en'
            ? '🔗 Click an equation on the left, then click its answer on the right!'
            : '🔗 点击左边的算式，再点击右边对应的答案！'}
        </div>

        {/* Game Grid */}
        {equations.length > 0 && (
          <div className="link-game-grid">
            {/* Left: Equations */}
            <div className="link-column">
              <div className="link-column-header">
                {lang === 'en' ? '📝 Equations' : '📝 算式'}
              </div>
              {equations.map(eq => (
                <div
                  key={eq.id}
                  style={getCardStyle(eq.id, 'eq')}
                  onClick={() => !matched.has(eq.id) && handleEquationClick(eq)}
                >
                  {matched.has(eq.id)
                    ? <span className="matched-tick">✅</span>
                    : eq.display
                  }
                </div>
              ))}
            </div>

            {/* Right: Answers */}
            <div className="link-column">
              <div className="link-column-header">
                {lang === 'en' ? '🔢 Answers' : '🔢 答案'}
              </div>
              {answers.map(ans => (
                <div
                  key={ans.id}
                  style={getCardStyle(ans.id, 'ans')}
                  onClick={() => !matched.has(ans.id) && handleAnswerClick(ans)}
                >
                  {matched.has(ans.id)
                    ? <span className="matched-tick">✅</span>
                    : ans.value
                  }
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>
            <span>{lang === 'en' ? 'Progress' : '进度'}</span>
            <span>{matched.size / 2} / {PAIR_COUNT}</span>
          </div>
          <div style={{ background: '#f1f5f9', borderRadius: '99px', height: '10px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: '99px',
              background: 'linear-gradient(90deg, #818cf8, #6366f1)',
              width: `${(matched.size / 2 / PAIR_COUNT) * 100}%`,
              transition: 'width 0.4s ease'
            }} />
          </div>
        </div>

        {/* Combo badge */}
        {combo >= 2 && (
          <div className="bounce-in" style={{
            textAlign: 'center', background: 'linear-gradient(135deg, #fde68a, #f59e0b)',
            borderRadius: '20px', padding: '6px 0', fontWeight: 800, color: '#78350f', fontSize: '0.95rem'
          }}>
            🔥 {combo} {lang === 'en' ? 'Combo! +' : '连击！+'}{(combo - 1) * 5}
          </div>
        )}

        {/* Restart */}
        <button className="bouncy-button secondary" onClick={startNew} style={{ width: '100%', padding: '10px' }}>
          <RefreshCw size={16} style={{ marginRight: '6px' }} />
          {lang === 'en' ? 'New Game' : '重新开始'}
        </button>
      </div>
    </div>
  );
}

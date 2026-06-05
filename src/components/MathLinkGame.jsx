import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, RefreshCw, Star } from 'lucide-react';
import { audioSynth } from '../utils/audioSynth';

// ── helpers ────────────────────────────────────────────────────────────────
const genId = () => Math.random().toString(36).substr(2, 9);

const PAIR_COUNT = 6;

const MATCH_COLORS = [
  { bg: 'linear-gradient(135deg,#fecaca,#fca5a5)', border: '#ef4444', text: '#b91c1c' },
  { bg: 'linear-gradient(135deg,#fef08a,#fde047)', border: '#eab308', text: '#a16207' },
  { bg: 'linear-gradient(135deg,#bbf7d0,#86efac)', border: '#22c55e', text: '#15803d' },
  { bg: 'linear-gradient(135deg,#bfdbfe,#93c5fd)', border: '#3b82f6', text: '#1d4ed8' },
  { bg: 'linear-gradient(135deg,#e9d5ff,#d8b4fe)', border: '#a855f7', text: '#7e22ce' },
  { bg: 'linear-gradient(135deg,#fbcfe8,#f9a8d4)', border: '#ec4899', text: '#be185d' },
  { bg: 'linear-gradient(135deg,#fed7aa,#fdba74)', border: '#f97316', text: '#c2410c' },
  { bg: 'linear-gradient(135deg,#99f6e4,#5eead4)', border: '#14b8a6', text: '#0f766e' },
];

function genEquation(usedAnswers) {
  for (let i = 0; i < 60; i++) {
    const isAdd = Math.random() > 0.45;
    let a, b, result;
    if (isAdd) {
      a = Math.floor(Math.random() * 15) + 1;
      b = Math.floor(Math.random() * (20 - a)) + 1;
      result = a + b;
    } else {
      result = Math.floor(Math.random() * 19) + 1;
      b = Math.floor(Math.random() * 10) + 1;
      a = result + b;
      if (a > 20) continue;
    }
    if (!usedAnswers.has(result)) {
      return { a, b, op: isAdd ? '+' : '-', result, display: `${a} ${isAdd ? '+' : '−'} ${b}` };
    }
  }
  return { a: 3, b: 7, op: '+', result: 10, display: '3 + 7' };
}

function buildRound() {
  const usedAnswers = new Set();
  const colorOrder = [...Array(MATCH_COLORS.length).keys()].sort(() => Math.random() - 0.5);
  const eqs = [];
  for (let i = 0; i < PAIR_COUNT; i++) {
    const eq = genEquation(usedAnswers);
    usedAnswers.add(eq.result);
    eqs.push({ id: genId(), colorIdx: colorOrder[i % colorOrder.length], ...eq });
  }
  const ans = eqs
    .map(eq => ({ id: genId(), eqId: eq.id, value: eq.result, colorIdx: eq.colorIdx }))
    .sort(() => Math.random() - 0.5);
  return { eqs, ans };
}

// ── component ──────────────────────────────────────────────────────────────
export default function MathLinkGame({ lang, onBack }) {
  // game mode: 'playing' | 'roundWin'
  const [mode, setMode]         = useState('playing');
  const [equations, setEquations] = useState([]);
  const [answers, setAnswers]     = useState([]);
  const [matched, setMatched]     = useState(new Set());
  const [selectedEq, setSelectedEq] = useState(null);
  const [selectedAns, setSelectedAns] = useState(null);
  const [wrongFlash, setWrongFlash] = useState(new Set());
  const [successFlash, setSuccessFlash] = useState(new Set());
  const [score, setScore]   = useState(0);
  const [round, setRound]   = useState(1);
  const [combo, setCombo]   = useState(0);

  // Start a fresh round (pure function, no stale closures)
  const startRound = useCallback(() => {
    const { eqs, ans } = buildRound();
    setEquations(eqs);
    setAnswers(ans);
    setMatched(new Set());
    setSelectedEq(null);
    setSelectedAns(null);
    setWrongFlash(new Set());
    setSuccessFlash(new Set());
    setMode('playing');
  }, []);

  // Full restart
  const startNew = useCallback(() => {
    setScore(0);
    setRound(1);
    setCombo(0);
    const { eqs, ans } = buildRound();
    setEquations(eqs);
    setAnswers(ans);
    setMatched(new Set());
    setSelectedEq(null);
    setSelectedAns(null);
    setWrongFlash(new Set());
    setSuccessFlash(new Set());
    setMode('playing');
  }, []);

  // Next round button
  const goNextRound = useCallback(() => {
    setRound(r => r + 1);
    setCombo(0);
    startRound();
  }, [startRound]);

  // Initial load
  useEffect(() => { startNew(); }, []);

  // Detect round completion — use functional setState to avoid stale matched
  useEffect(() => {
    if (mode !== 'playing') return;
    if (equations.length === 0) return;
    if (matched.size === equations.length * 2) {
      // All pairs matched!
      audioSynth.playWin();
      const t = setTimeout(() => setMode('roundWin'), 800);
      return () => clearTimeout(t);
    }
  }, [matched, equations, mode]);

  const tryMatch = useCallback((eq, ans) => {
    if (eq.result === ans.value) {
      audioSynth.playCorrect();
      setCombo(c => c + 1);
      setScore(s => s + 10 + combo * 5);
      setSuccessFlash(prev => new Set([...prev, eq.id, ans.id]));
      setTimeout(() => {
        setMatched(prev => new Set([...prev, eq.id, ans.id]));
        setSuccessFlash(prev => { const s = new Set(prev); s.delete(eq.id); s.delete(ans.id); return s; });
        setSelectedEq(null);
        setSelectedAns(null);
      }, 450);
    } else {
      audioSynth.playIncorrect();
      setCombo(0);
      setWrongFlash(new Set([eq.id, ans.id]));
      setTimeout(() => {
        setWrongFlash(new Set());
        setSelectedEq(null);
        setSelectedAns(null);
      }, 550);
    }
  }, [combo]);

  const handleEqClick = useCallback((eq) => {
    if (matched.has(eq.id)) return;
    audioSynth.playClick();
    if (selectedEq?.id === eq.id) { setSelectedEq(null); return; }
    if (selectedAns) { tryMatch(eq, selectedAns); return; }
    setSelectedEq(eq);
  }, [matched, selectedEq, selectedAns, tryMatch]);

  const handleAnsClick = useCallback((ans) => {
    if (matched.has(ans.id)) return;
    audioSynth.playClick();
    if (selectedAns?.id === ans.id) { setSelectedAns(null); return; }
    if (selectedEq) { tryMatch(selectedEq, ans); return; }
    setSelectedAns(ans);
  }, [matched, selectedEq, selectedAns, tryMatch]);

  const getCardStyle = (id, type) => {
    const isMatched  = matched.has(id);
    const isSelected = type === 'eq' ? selectedEq?.id === id : selectedAns?.id === id;
    const isWrong    = wrongFlash.has(id);
    const isSuccess  = successFlash.has(id);

    const cardData = type === 'eq' ? equations.find(e => e.id === id) : answers.find(a => a.id === id);
    const theme = cardData ? MATCH_COLORS[cardData.colorIdx] : MATCH_COLORS[0];

    let bg        = 'rgba(255,255,255,0.9)';
    let border    = '3px solid #e2e8f0';
    let transform = 'scale(1)';
    let opacity   = 1;
    let color     = '#1e293b';
    let boxShadow = '0 2px 8px rgba(0,0,0,0.07)';

    if (isMatched) {
      bg = theme.bg; border = `3px solid ${theme.border}`;
      opacity = 0.7; color = theme.text;
    } else if (isSuccess) {
      bg = theme.bg; border = `3px solid ${theme.border}`;
      transform = 'scale(1.07)'; color = theme.text;
      boxShadow = `0 0 16px ${theme.border}66`;
    } else if (isWrong) {
      bg = 'linear-gradient(135deg,#fee2e2,#fca5a5)';
      border = '3px solid #f87171'; transform = 'scale(0.95)';
    } else if (isSelected) {
      bg = theme.bg; border = `3px solid ${theme.border}`;
      transform = 'scale(1.05)'; color = theme.text;
      boxShadow = `0 0 0 4px ${theme.border}44, 0 4px 12px rgba(0,0,0,0.10)`;
    }

    return {
      background: bg, border, transform, opacity, color,
      borderRadius: '16px', padding: '12px 10px',
      cursor: isMatched ? 'default' : 'pointer',
      textAlign: 'center', fontWeight: '700',
      fontSize: type === 'eq' ? '1.1rem' : '1.4rem',
      transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
      boxShadow, userSelect: 'none',
      minHeight: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    };
  };

  return (
    <div className="screen-wrapper fade-in" style={{ padding: '20px', overflowY: 'auto' }}>
      <style>{`
        .link-game-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; width: 100%; }
        .link-column { display: flex; flex-direction: column; gap: 10px; }
        .link-column-header { text-align: center; font-weight: 700; font-size: 0.9rem; color: #94a3b8; padding: 4px 0; }
        @keyframes popIn { 0%{transform:scale(0.6);opacity:0} 80%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
        .round-win-card { animation: popIn 0.4s ease forwards; }
      `}</style>

      <div className="card-shadow" style={{
        width: '100%', maxWidth: '480px', margin: '0 auto',
        background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)',
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
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#fef9c3', padding: '5px 10px', borderRadius: '20px', fontWeight: 700, color: '#854d0e', fontSize: '0.9rem' }}>
              <Star size={14} fill="#ca8a04" color="#ca8a04" /> {score}
            </div>
            <div style={{ background: '#ede9fe', padding: '5px 10px', borderRadius: '20px', fontWeight: 700, color: '#6d28d9', fontSize: '0.85rem' }}>
              {lang === 'en' ? `Round ${round}` : `第 ${round} 关`}
            </div>
          </div>
        </div>

        {/* ── ROUND WIN overlay ── */}
        {mode === 'roundWin' && (
          <div className="round-win-card" style={{
            textAlign: 'center', padding: '30px 20px',
            background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)',
            borderRadius: '20px', border: '3px solid #4ade80',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🎉</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#15803d', marginBottom: '6px' }}>
              {lang === 'en' ? `Round ${round} Complete!` : `第 ${round} 关通过！`}
            </div>
            <div style={{ fontSize: '1rem', color: '#166534', marginBottom: '20px' }}>
              {lang === 'en' ? `Score: ${score} pts 🌟` : `得分：${score} 分 🌟`}
            </div>
            <button className="bouncy-button primary" onClick={goNextRound}
              style={{ padding: '12px 32px', fontSize: '1.1rem', background: 'linear-gradient(135deg,#4ade80,#22c55e)', borderColor: '#16a34a' }}>
              {lang === 'en' ? '▶ Next Round' : '▶ 下一关'}
            </button>
          </div>
        )}

        {/* ── PLAYING ── */}
        {mode === 'playing' && (
          <>
            <div style={{ textAlign: 'center', fontSize: '0.88rem', color: '#64748b', background: '#f8fafc', borderRadius: '12px', padding: '7px 12px' }}>
              {lang === 'en'
                ? '🔗 Click an equation then its answer!'
                : '🔗 点击左边的算式，再点击右边对应的答案！'}
            </div>

            {equations.length > 0 && (
              <div className="link-game-grid">
                <div className="link-column">
                  <div className="link-column-header">{lang === 'en' ? '📝 Equations' : '📝 算式'}</div>
                  {equations.map(eq => (
                    <div key={eq.id} style={getCardStyle(eq.id, 'eq')}
                      onClick={() => !matched.has(eq.id) && mode === 'playing' && handleEqClick(eq)}>
                      {matched.has(eq.id) ? <span style={{ fontSize: '1.5rem' }}>✅</span> : eq.display}
                    </div>
                  ))}
                </div>
                <div className="link-column">
                  <div className="link-column-header">{lang === 'en' ? '🔢 Answers' : '🔢 答案'}</div>
                  {answers.map(ans => (
                    <div key={ans.id} style={getCardStyle(ans.id, 'ans')}
                      onClick={() => !matched.has(ans.id) && mode === 'playing' && handleAnsClick(ans)}>
                      {matched.has(ans.id) ? <span style={{ fontSize: '1.5rem' }}>✅</span> : ans.value}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Progress bar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600 }}>
                <span>{lang === 'en' ? 'Progress' : '进度'}</span>
                <span>{matched.size / 2} / {PAIR_COUNT}</span>
              </div>
              <div style={{ background: '#f1f5f9', borderRadius: '99px', height: '10px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: '99px',
                  background: 'linear-gradient(90deg,#818cf8,#6366f1)',
                  width: `${(matched.size / 2 / PAIR_COUNT) * 100}%`,
                  transition: 'width 0.4s ease'
                }} />
              </div>
            </div>

            {/* Combo badge */}
            {combo >= 2 && (
              <div className="bounce-in" style={{
                textAlign: 'center', background: 'linear-gradient(135deg,#fde68a,#f59e0b)',
                borderRadius: '20px', padding: '6px 0', fontWeight: 800, color: '#78350f', fontSize: '0.95rem'
              }}>
                🔥 {combo} {lang === 'en' ? 'Combo! +' : '连击！+'}{combo * 5}
              </div>
            )}
          </>
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

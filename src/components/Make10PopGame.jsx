import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, RefreshCw, Clock } from 'lucide-react';
import { audioSynth } from '../utils/audioSynth';

const ROWS = 6;
const COLS = 5;
const CELL_SIZE = 60;
const BUBBLE_SIZE = 50;

const randNum = () => Math.floor(Math.random() * 9) + 1;
const genId   = () => Math.random().toString(36).substr(2, 9);

// ── pure helpers (defined at module level to avoid hoisting issues) ─────────
function hasMatch(bList) {
  const map = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  bList.forEach(b => { if (!b.isPopping) map[b.r][b.c] = b; });
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const b = map[r][c];
      if (!b) continue;
      if (c < COLS - 1 && map[r][c + 1] && b.num + map[r][c + 1].num === 10) return true;
      if (r < ROWS - 1 && map[r + 1][c] && b.num + map[r + 1][c].num === 10) return true;
    }
  }
  return false;
}

function buildBoard() {
  let bubbles = [];
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      bubbles.push({ id: genId(), r, c, num: randNum(), isPopping: false });

  if (!hasMatch(bubbles)) {
    bubbles[0] = { ...bubbles[0], num: 3 };
    bubbles[1] = { ...bubbles[1], num: 7 };
  }
  return bubbles;
}

function getBubbleColor(num) {
  const colors = ['#f87171','#fb923c','#fbbf24','#a3e635','#34d399','#22d3ee','#60a5fa','#a78bfa','#f472b6'];
  return colors[num - 1] || '#60a5fa';
}

// ── component ──────────────────────────────────────────────────────────────
export default function Make10PopGame({ lang, onBack }) {
  // mode: 'playing' | 'roundWin' | 'gameover'
  const [mode,        setMode]        = useState('playing');
  const [bubbles,     setBubbles]     = useState(() => buildBoard());
  const [selectedIds, setSelectedIds] = useState([]);
  const [score,       setScore]       = useState(0);
  const [timeLeft,    setTimeLeft]    = useState(60);
  const [isShaking,   setIsShaking]   = useState(false);
  const [combo,       setCombo]       = useState(0);
  const [round,       setRound]       = useState(1);

  const targetScore = round * 100;

  // Keep a ref of current score so the timer can read it without stale closures
  const scoreRef    = useRef(score);
  const targetRef   = useRef(targetScore);
  scoreRef.current  = score;
  targetRef.current = targetScore;

  // ── timer ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (mode !== 'playing') return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(interval);
          setMode('gameover');
          audioSynth.playWin();
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [mode]); // only re-run when mode changes

  // ── detect round-win by score change ──────────────────────────────────
  useEffect(() => {
    if (mode !== 'playing') return;
    if (score >= targetScore) {
      setMode('roundWin');
      audioSynth.playWin();
    }
  }, [score]); // intentionally only score, not targetScore (targetScore is derived and stable per round)

  // ── gravity + refill (pure function of bubbles snapshot) ──────────────
  const applyGravityAndRefill = useCallback((poppedIds) => {
    setBubbles(prev => {
      const remaining = prev.filter(b => !poppedIds.includes(b.id));
      const columns   = Array.from({ length: COLS }, () => []);
      remaining.forEach(b => columns[b.c].push(b));
      columns.forEach(col => col.sort((a, b) => b.r - a.r));

      const next = [];
      for (let c = 0; c < COLS; c++) {
        let row = ROWS - 1;
        for (const b of columns[c]) { b.r = row--; next.push(b); }
        while (row >= 0) next.push({ id: genId(), r: row--, c, num: randNum(), isPopping: false });
      }

      // Guarantee at least one match
      if (!hasMatch(next)) {
        next[0].num = 3;
        next[1].num = 7;
      }
      return next;
    });
  }, []);

  // ── bubble click ──────────────────────────────────────────────────────
  const handleBubbleClick = useCallback((clicked) => {
    if (clicked.isPopping) return;
    audioSynth.playClick();

    setSelectedIds(prev => {
      if (prev.includes(clicked.id)) return prev.filter(id => id !== clicked.id);

      const next = [...prev, clicked.id];
      if (next.length < 2) return next;

      // We have 2 selected — evaluate immediately
      setBubbles(snap => {
        const b1 = snap.find(b => b.id === next[0]);
        const b2 = snap.find(b => b.id === next[1]);
        if (!b1 || !b2) return snap;

        const dr = Math.abs(b1.r - b2.r);
        const dc = Math.abs(b1.c - b2.c);
        const adjacent = (dr === 1 && dc === 0) || (dr === 0 && dc === 1);

        if (!adjacent) return snap; // handled below (reset selection)

        if (b1.num + b2.num === 10) {
          audioSynth.playCorrect();
          setCombo(c => c + 1);
          setScore(s => s + 10 + combo * 2);
          const marked = snap.map(b => next.includes(b.id) ? { ...b, isPopping: true } : b);
          setTimeout(() => applyGravityAndRefill(next), 300);
          return marked;
        } else {
          audioSynth.playIncorrect();
          setCombo(0);
          setIsShaking(true);
          setTimeout(() => { setIsShaking(false); setSelectedIds([]); }, 450);
        }
        return snap;
      });

      return []; // clear selection after evaluation
    });
  }, [combo, applyGravityAndRefill]);

  // ── next round ────────────────────────────────────────────────────────
  const nextRound = useCallback(() => {
    setRound(r => r + 1);
    setTimeLeft(t => t + 45);
    setBubbles(buildBoard());
    setSelectedIds([]);
    setCombo(0);
    setMode('playing');
  }, []);

  // ── full restart ──────────────────────────────────────────────────────
  const restart = useCallback(() => {
    setRound(1);
    setScore(0);
    setTimeLeft(60);
    setCombo(0);
    setBubbles(buildBoard());
    setSelectedIds([]);
    setMode('playing');
  }, []);

  // ── render ────────────────────────────────────────────────────────────
  return (
    <div className="screen-wrapper fade-in" style={{ padding: '20px', overflowY: 'auto' }}>
      <style>{`
        .bubble-grid {
          position: relative;
          width: ${COLS * CELL_SIZE}px; height: ${ROWS * CELL_SIZE}px;
          background: rgba(255,255,255,0.5);
          border-radius: 16px; border: 4px solid #e2e8f0;
          overflow: hidden; margin: 0 auto;
        }
        .bubble {
          position: absolute;
          width: ${BUBBLE_SIZE}px; height: ${BUBBLE_SIZE}px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 24px; font-weight: 800; color: white; cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
          box-shadow: inset -4px -4px 10px rgba(0,0,0,0.2), 0 4px 6px rgba(0,0,0,0.1);
          user-select: none;
        }
        .bubble::after {
          content: ''; position: absolute;
          top: 15%; left: 20%; width: 30%; height: 30%;
          background: rgba(255,255,255,0.4); border-radius: 50%;
        }
        .bubble.selected { transform: scale(1.15); box-shadow: 0 0 0 4px white, 0 0 15px rgba(255,255,255,0.8); z-index: 10; }
        .bubble.popping  { transform: scale(0); opacity: 0; }
        @keyframes popShake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-5px)} 75%{transform:translateX(5px)} }
        .shake-board { animation: popShake 0.4s ease-in-out; }
        @keyframes popIn { 0%{transform:scale(0.6);opacity:0} 80%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
        .pop-in-card { animation: popIn 0.4s ease forwards; }
      `}</style>

      <div className="card-shadow" style={{
        width: '100%', maxWidth: '500px', margin: '0 auto',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(10px)',
        padding: '20px', gap: '16px',
      }}>
        {/* ── Header ── */}
        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          <button className="bouncy-button secondary" onClick={onBack} style={{ padding: '8px 12px', flexShrink: 0 }}>
            <ArrowLeft size={20} />
          </button>

          {/* Progress to target */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, color: '#6b7280' }}>
              <span>{lang === 'en' ? `Round ${round}` : `第 ${round} 关`}</span>
              <span>{score} / {targetScore}</span>
            </div>
            <div style={{ background: '#f1f5f9', borderRadius: '99px', height: '8px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                background: 'linear-gradient(90deg,#f87171,#ef4444)',
                width: `${Math.min(100, (score / targetScore) * 100)}%`,
                transition: 'width 0.3s'
              }} />
            </div>
          </div>

          {/* Timer */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0,
            background: timeLeft <= 10 ? '#fecaca' : '#e0e7ff', padding: '6px 12px',
            borderRadius: '20px', fontWeight: 'bold',
            color: timeLeft <= 10 ? '#991b1b' : '#3730a3', fontSize: '0.9rem',
          }}>
            <Clock size={16} />
            {String(Math.floor(timeLeft / 60)).padStart(2,'0')}:{String(timeLeft % 60).padStart(2,'0')}
          </div>
        </div>

        {/* ── Mode: playing ── */}
        {mode === 'playing' && (
          <>
            <p style={{ color: '#4b5563', margin: 0, fontWeight: 700, fontSize: '0.9rem', textAlign: 'center' }}>
              {lang === 'en' ? '💧 Connect adjacent bubbles that sum to 10!' : '💧 点击相邻的两个气泡，让它们相加等于10！'}
            </p>
            <div className={`bubble-grid ${isShaking ? 'shake-board' : ''}`}>
              {bubbles.map(b => (
                <div
                  key={b.id}
                  className={`bubble ${selectedIds.includes(b.id) ? 'selected' : ''} ${b.isPopping ? 'popping' : ''}`}
                  style={{
                    backgroundColor: getBubbleColor(b.num),
                    left: b.c * CELL_SIZE + (CELL_SIZE - BUBBLE_SIZE) / 2,
                    top:  b.r * CELL_SIZE + (CELL_SIZE - BUBBLE_SIZE) / 2,
                  }}
                  onClick={() => mode === 'playing' && !b.isPopping && handleBubbleClick(b)}
                >
                  {b.num}
                </div>
              ))}
            </div>
            {combo >= 2 && (
              <div className="bounce-in" style={{
                background: 'linear-gradient(135deg,#fde68a,#f59e0b)',
                borderRadius: '20px', padding: '6px 20px',
                fontWeight: 800, color: '#78350f', fontSize: '0.95rem'
              }}>
                🔥 {combo} Combo!
              </div>
            )}
          </>
        )}

        {/* ── Mode: roundWin ── */}
        {mode === 'roundWin' && (
          <div className="pop-in-card" style={{
            textAlign: 'center', padding: '30px 20px', width: '100%',
            background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)',
            borderRadius: '20px', border: '3px solid #4ade80',
          }}>
            <div style={{ fontSize: '3rem' }}>🎉</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#15803d', margin: '8px 0 4px' }}>
              {lang === 'en' ? `Round ${round} Cleared!` : `第 ${round} 关通过！`}
            </div>
            <div style={{ fontSize: '1rem', color: '#166534', marginBottom: '20px' }}>
              {lang === 'en' ? `Score: ${score} pts 🌟` : `得分：${score} 分 🌟`}<br />
              <span style={{ color: '#b45309', fontWeight: 700 }}>
                {lang === 'en' ? '+45 seconds bonus!' : '+45秒奖励时间！'}
              </span>
            </div>
            <button className="bouncy-button primary" onClick={nextRound}
              style={{ padding: '12px 32px', fontSize: '1.1rem', background: 'linear-gradient(135deg,#4ade80,#22c55e)', borderColor: '#16a34a' }}>
              {lang === 'en' ? '▶ Next Round' : '▶ 下一关'}
            </button>
          </div>
        )}

        {/* ── Mode: gameover ── */}
        {mode === 'gameover' && (
          <div className="pop-in-card" style={{
            textAlign: 'center', padding: '30px 20px', width: '100%',
            background: 'linear-gradient(135deg,#fff1f2,#ffe4e6)',
            borderRadius: '20px', border: '3px solid #fca5a5',
          }}>
            <div style={{ fontSize: '3rem' }}>⏰</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#be123c', margin: '8px 0 4px' }}>
              {lang === 'en' ? "Time's Up!" : '时间到！'}
            </div>
            <div style={{ fontSize: '1.1rem', color: '#9f1239', marginBottom: '20px' }}>
              {lang === 'en' ? `Final Score: ${score}` : `最终得分：${score} 分`}
            </div>
            <button className="bouncy-button primary" onClick={restart}
              style={{ padding: '12px 32px', fontSize: '1.1rem' }}>
              <RefreshCw size={18} style={{ marginRight: '6px' }} />
              {lang === 'en' ? 'Play Again' : '再玩一次'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

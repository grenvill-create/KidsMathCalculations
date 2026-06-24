import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, RefreshCw, Settings, X } from 'lucide-react';
import { audioSynth } from '../utils/audioSynth';
import { mathGenerator } from '../utils/mathGenerator';
import confetti from 'canvas-confetti';

const MODES = [
  { id: 'identical', label: '相同配对', emoji: '🔢', desc: '找两张一样的数字' },
  { id: 'math',      label: '算式配对', emoji: '🧮', desc: '算式和答案配对' },
  { id: 'make10',    label: '凑十好朋友', emoji: '🤝', desc: '找两张加起来等于10' },
];

// 3 difficulty levels: cols always 4 to keep cards square-ish
const LEVELS = [
  { rows: 3, cols: 4, label: '第1关' },
  { rows: 4, cols: 4, label: '第2关' },
  { rows: 5, cols: 4, label: '第3关' },
];

// Card back patterns
const CARD_BACK_EMOJIS = ['⭐', '🌈', '🎈', '💫', '🎀', '🦋'];

function generateDeck(mode, levelIdx, range, ops) {
  const level = LEVELS[Math.min(levelIdx, LEVELS.length - 1)];
  const numPairs = (level.rows * level.cols) / 2;
  const pairs = [];

  if (mode === 'identical') {
    const nums = new Set();
    while (nums.size < numPairs) nums.add(Math.floor(Math.random() * 20) + 1);
    [...nums].forEach((n, i) => {
      pairs.push({ pairId: i, a: String(n), b: String(n) });
    });
  } else if (mode === 'make10') {
    // pairs: (1,9),(2,8),...(9,1) – pick numPairs unique ones
    const pool = [[1,9],[2,8],[3,7],[4,6],[5,5],[6,4],[7,3],[8,2],[9,1]];
    const chosen = pool.sort(() => Math.random() - 0.5).slice(0, numPairs);
    chosen.forEach(([a, b], i) => pairs.push({ pairId: i, a: String(a), b: String(b) }));
  } else {
    // math mode
    for (let i = 0; i < numPairs; i++) {
      const q = mathGenerator.generateQuestion(4, {
        minNumber: range?.min ?? 1,
        maxNumber: range?.max ?? 20,
        operations: ops ?? ['add', 'sub'],
        lang: 'zh',
      });
      pairs.push({ pairId: i, a: q.problemStr, b: String(q.answer) });
    }
  }

  // Build card array
  const cards = [];
  pairs.forEach(({ pairId, a, b }) => {
    cards.push({ id: `${pairId}_a`, pairId, content: a, flipped: true, matched: false });
    cards.push({ id: `${pairId}_b`, pairId, content: b, flipped: true, matched: false });
  });

  // Fisher-Yates shuffle
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

export default function MemoryMatchGame({ lang, range, ops, onBack }) {
  const [mode, setMode]           = useState('identical');
  const [levelIdx, setLevelIdx]   = useState(0);
  const [cards, setCards]         = useState([]);
  const [selected, setSelected]   = useState([]); // indices of face-up but unmatched cards
  const [locked, setLocked]       = useState(false);
  const [phase, setPhase]         = useState('preview'); // preview | playing | won
  const [countdown, setCountdown] = useState(3);
  const [moves, setMoves]         = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const timerRef  = useRef(null);
  const lockRef   = useRef(false);

  const level = LEVELS[Math.min(levelIdx, LEVELS.length - 1)];

  // ---- deal a new round ----
  const deal = useCallback(() => {
    const deck = generateDeck(mode, levelIdx, range, ops);
    setCards(deck);
    setSelected([]);
    setMoves(0);
    setLocked(false);
    lockRef.current = false;
    setPhase('preview');
    setCountdown(3);
  }, [mode, levelIdx, range, ops]);

  useEffect(() => { deal(); }, [deal]);

  // ---- preview countdown ----
  useEffect(() => {
    if (phase !== 'preview') return;
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          // flip all face down
          setCards(c => c.map(card => ({ ...card, flipped: false })));
          setPhase('playing');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  // ---- card click ----
  const handleClick = (idx) => {
    if (phase !== 'playing' || lockRef.current) return;
    if (cards[idx].flipped || cards[idx].matched) return;

    audioSynth.playClick();

    const newCards = cards.map((c, i) => i === idx ? { ...c, flipped: true } : c);
    const newSelected = [...selected, idx];
    setCards(newCards);
    setSelected(newSelected);

    if (newSelected.length === 2) {
      lockRef.current = true;
      setLocked(true);
      setMoves(m => m + 1);

      const [i1, i2] = newSelected;
      if (newCards[i1].pairId === newCards[i2].pairId) {
        // ✅ match
        setTimeout(() => {
          audioSynth.playCorrect();
          const matched = newCards.map((c, i) =>
            i === i1 || i === i2 ? { ...c, matched: true } : c
          );
          setCards(matched);
          setSelected([]);
          lockRef.current = false;
          setLocked(false);

          if (matched.every(c => c.matched)) {
            setPhase('won');
            fireConfetti();
          }
        }, 400);
      } else {
        // ❌ no match
        setTimeout(() => {
          audioSynth.playError();
        }, 200);
        setTimeout(() => {
          setCards(newCards.map((c, i) =>
            i === i1 || i === i2 ? { ...c, flipped: false } : c
          ));
          setSelected([]);
          lockRef.current = false;
          setLocked(false);
        }, 1100);
      }
    }
  };

  const fireConfetti = () => {
    audioSynth.playSuccess();
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
  };

  const nextLevel = () => {
    audioSynth.playClick();
    setLevelIdx(p => p + 1);
  };

  const cols = level.cols;

  return (
    <div style={{
      width: '100%', minHeight: '100vh',
      background: 'linear-gradient(160deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%)',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'Fredoka, sans-serif',
      color: 'white',
      userSelect: 'none',
    }}>

      {/* ─── HEADER ─── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px',
        background: 'rgba(255,255,255,0.07)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.12)',
      }}>
        <button onClick={onBack} style={{
          background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white',
          width: 40, height: 40, borderRadius: 12, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.2s',
        }}>
          <ArrowLeft size={22} />
        </button>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: 1 }}>🎴 记忆翻牌</div>
          <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: 2 }}>
            {MODES.find(m => m.id === mode)?.emoji} {MODES.find(m => m.id === mode)?.label} · {level.label}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => { audioSynth.playClick(); deal(); }} style={{
            background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white',
            width: 40, height: 40, borderRadius: 12, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <RefreshCw size={18} />
          </button>
          <button onClick={() => { audioSynth.playClick(); setShowSettings(true); }} style={{
            background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white',
            width: 40, height: 40, borderRadius: 12, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* ─── STATS BAR ─── */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 32,
        padding: '12px 20px',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, lineHeight: 1 }}>{moves}</div>
          <div style={{ fontSize: '0.75rem', opacity: 0.65 }}>翻牌次数</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, lineHeight: 1 }}>
            {cards.filter(c => c.matched).length / 2}/{(level.rows * level.cols) / 2}
          </div>
          <div style={{ fontSize: '0.75rem', opacity: 0.65 }}>已配对</div>
        </div>
      </div>

      {/* ─── PREVIEW BANNER ─── */}
      {phase === 'preview' && (
        <div style={{
          margin: '0 20px 12px',
          background: 'linear-gradient(90deg, #f59e0b, #ef4444)',
          borderRadius: 16, padding: '10px 20px',
          textAlign: 'center', fontWeight: 700, fontSize: '1.1rem',
          boxShadow: '0 4px 20px rgba(239,68,68,0.4)',
          animation: 'pulse 0.8s infinite alternate',
        }}>
          👀 记住卡片位置！{countdown} 秒后翻面…
        </div>
      )}

      {/* ─── CARD GRID ─── */}
      <div style={{
        flex: 1,
        padding: '0 16px 20px',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: 10,
          width: '100%',
          maxWidth: 480,
        }}>
          {cards.map((card, idx) => {
            const isUp = card.flipped || card.matched;
            return (
              <div
                key={card.id}
                onClick={() => handleClick(idx)}
                style={{
                  position: 'relative',
                  paddingBottom: '100%', // square
                  cursor: (phase === 'playing' && !card.flipped && !card.matched && !locked) ? 'pointer' : 'default',
                }}
              >
                {/* flip wrapper */}
                <div style={{
                  position: 'absolute', inset: 0,
                  transformStyle: 'preserve-3d',
                  transition: 'transform 0.55s ease',
                  transform: isUp ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}>
                  {/* BACK FACE */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    backfaceVisibility: 'hidden',
                    borderRadius: 14,
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                    border: '2px solid rgba(255,255,255,0.25)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.6rem',
                  }}>
                    ⭐
                  </div>

                  {/* FRONT FACE */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    borderRadius: 14,
                    background: card.matched
                      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                      : 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                    border: card.matched
                      ? '2px solid #6ee7b7'
                      : '2px solid rgba(251,191,36,0.6)',
                    boxShadow: card.matched
                      ? '0 4px 16px rgba(16,185,129,0.5)'
                      : '0 4px 12px rgba(0,0,0,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: 4,
                    textAlign: 'center',
                    color: card.matched ? 'white' : '#1e293b',
                    fontSize: card.content.length > 4 ? '0.85rem' : '1.5rem',
                    fontWeight: 800,
                    lineHeight: 1.1,
                    wordBreak: 'break-word',
                    transition: 'background 0.3s',
                  }}>
                    {card.matched ? '✓' : card.content}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── WIN OVERLAY ─── */}
      {phase === 'won' && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div className="bounce-in" style={{
            background: 'white', borderRadius: 28, padding: '32px 40px',
            textAlign: 'center', maxWidth: 320, width: '90%',
            boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
          }}>
            <div style={{ fontSize: '3.5rem', marginBottom: 8 }}>🎉</div>
            <h2 style={{ margin: '0 0 8px', color: '#10b981', fontSize: '1.8rem' }}>完美配对！</h2>
            <p style={{ color: '#64748b', margin: '0 0 24px', fontSize: '1rem' }}>
              你用了 <strong style={{ color: '#4f46e5' }}>{moves}</strong> 次翻牌完成了全部配对
            </p>
            {levelIdx < LEVELS.length - 1 ? (
              <button onClick={nextLevel} style={{
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                color: 'white', border: 'none', borderRadius: 16,
                padding: '14px 32px', fontSize: '1.1rem', fontWeight: 700,
                cursor: 'pointer', width: '100%',
              }}>
                下一关 →
              </button>
            ) : (
              <button onClick={deal} style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white', border: 'none', borderRadius: 16,
                padding: '14px 32px', fontSize: '1.1rem', fontWeight: 700,
                cursor: 'pointer', width: '100%',
              }}>
                🔄 再来一局
              </button>
            )}
            <button onClick={onBack} style={{
              background: 'none', border: 'none', color: '#94a3b8',
              marginTop: 12, cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline',
            }}>
              返回首页
            </button>
          </div>
        </div>
      )}

      {/* ─── SETTINGS MODAL ─── */}
      {showSettings && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 300,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
        }}>
          <div className="bounce-in" style={{
            background: 'white', borderRadius: 24, padding: 24,
            width: '100%', maxWidth: 340,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.2rem' }}>选择配对模式</h3>
              <button onClick={() => { audioSynth.playClick(); setShowSettings(false); }} style={{
                background: '#f1f5f9', border: 'none', borderRadius: 10,
                width: 32, height: 32, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <X size={16} color="#64748b" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {MODES.map(m => (
                <button key={m.id} onClick={() => {
                  audioSynth.playClick();
                  setMode(m.id);
                  setShowSettings(false);
                }} style={{
                  padding: '14px 16px', borderRadius: 16, cursor: 'pointer',
                  border: `2px solid ${mode === m.id ? '#4f46e5' : '#e2e8f0'}`,
                  background: mode === m.id ? '#eff6ff' : 'white',
                  color: mode === m.id ? '#4f46e5' : '#475569',
                  fontFamily: 'Fredoka, sans-serif',
                  fontWeight: 700, fontSize: '1rem',
                  display: 'flex', alignItems: 'center', gap: 12,
                  textAlign: 'left', transition: 'all 0.2s',
                }}>
                  <span style={{ fontSize: '1.4rem' }}>{m.emoji}</span>
                  <div>
                    <div>{m.label}</div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 400, opacity: 0.7, marginTop: 2 }}>{m.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          from { opacity: 1; }
          to   { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}

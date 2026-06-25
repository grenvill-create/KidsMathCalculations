import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, RefreshCw, Settings, X, Coins, Wand2, Eye } from 'lucide-react';
import { audioSynth } from '../utils/audioSynth';
import { mathGenerator } from '../utils/mathGenerator';
import confetti from 'canvas-confetti';

const MODES = [
  { id: 'identical', label: '相同配对', emoji: '🔢', desc: '找两张一样的数字' },
  { id: 'shape',     label: '形状配对', emoji: '🔺', desc: '形状与文字配对' },
  { id: 'pinyin',    label: '拼音配对', emoji: '🔤', desc: '汉字与拼音配对' },
  { id: 'english',   label: '英语配对', emoji: '🍎', desc: '图片与英语配对' },
  { id: 'math',      label: '算式配对', emoji: '🧮', desc: '算式和答案配对' },
  { id: 'make10',    label: '凑十好朋友', emoji: '🤝', desc: '找两张加起来等于10' },
];

const THEMES = [
  { id: 'default', label: '默认星空', emoji: '⭐' },
  { id: 'forest', label: '奇幻森林', emoji: '🌲' },
  { id: 'space', label: '萌萌太空', emoji: '🪐' },
  { id: 'candy', label: '糖果乐园', emoji: '🍬' },
];

// 3 difficulty levels: cols always 4 to keep cards square-ish
const LEVELS = [
  { rows: 3, cols: 4, label: '第1关' },
  { rows: 4, cols: 4, label: '第2关' },
  { rows: 5, cols: 4, label: '第3关' },
];

function generateDeck(mode, levelIdx, range, ops) {
  const level = LEVELS[Math.min(levelIdx, LEVELS.length - 1)];
  const numPairs = (level.rows * level.cols) / 2;
  const pairs = [];

  if (mode === 'shape') {
    const pool = [
      { a: '🔴', b: '圆形' }, { a: '🟥', b: '正方形' }, { a: '🔺', b: '三角形' },
      { a: '⭐', b: '五角星' }, { a: '❤️', b: '心形' }, { a: '🌙', b: '月牙' },
      { a: '💎', b: '菱形' }, { a: '🟩', b: '长方形' }, { a: '➕', b: '十字' }
    ];
    const chosen = pool.sort(() => Math.random() - 0.5).slice(0, numPairs);
    chosen.forEach((c, i) => pairs.push({ pairId: i, a: c.a, b: c.b }));
  } else if (mode === 'pinyin') {
    const pool = [
      { a: '猫', b: 'māo' }, { a: '狗', b: 'gǒu' }, { a: '鸟', b: 'niǎo' },
      { a: '鱼', b: 'yú' }, { a: '兔', b: 'tù' }, { a: '马', b: 'mǎ' },
      { a: '牛', b: 'niú' }, { a: '羊', b: 'yáng' }, { a: '猪', b: 'zhū' },
      { a: '猴', b: 'hóu' }, { a: '鸡', b: 'jī' }, { a: '鸭', b: 'yā' }
    ];
    const chosen = pool.sort(() => Math.random() - 0.5).slice(0, numPairs);
    chosen.forEach((c, i) => pairs.push({ pairId: i, a: c.a, b: c.b }));
  } else if (mode === 'english') {
    const pool = [
      { a: '🍎', b: 'Apple' }, { a: '🐶', b: 'Dog' }, { a: '🐱', b: 'Cat' },
      { a: '🚗', b: 'Car' }, { a: '☀️', b: 'Sun' }, { a: '🌙', b: 'Moon' },
      { a: '⭐️', b: 'Star' }, { a: '🌳', b: 'Tree' }, { a: '🌺', b: 'Flower' },
      { a: '🏠', b: 'House' }, { a: '📚', b: 'Book' }, { a: '✏️', b: 'Pencil' }
    ];
    const chosen = pool.sort(() => Math.random() - 0.5).slice(0, numPairs);
    chosen.forEach((c, i) => pairs.push({ pairId: i, a: c.a, b: c.b }));
  } else if (mode === 'identical') {
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
  const [countdown, setCountdown] = useState(15);
  const [moves, setMoves]         = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showShop, setShowShop]           = useState(false);
  
  // Persistent State
  const [coins, setCoins] = useState(() => {
    return parseInt(localStorage.getItem('memoryMatchCoins') || '0', 10);
  });
  const [inventory, setInventory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('memoryMatchInventory')) || { peek: 0, wand: 0 };
    } catch(e) { return { peek: 0, wand: 0 }; }
  });
  const [cardTheme, setCardTheme] = useState(() => {
    return localStorage.getItem('memoryMatchTheme') || 'default';
  });
  const [isPeeking, setIsPeeking] = useState(false);
  const [enableMathForItems, setEnableMathForItems] = useState(() => {
    return localStorage.getItem('memoryMatchEnableMath') === 'true';
  });
  const [showMathQuiz, setShowMathQuiz] = useState(false);
  const [mathProblem, setMathProblem] = useState(null);
  const [mathInput, setMathInput] = useState('');
  const [isMathShaking, setIsMathShaking] = useState(false);
  const [earningItem, setEarningItem] = useState(null);

  const timerRef  = useRef(null);
  const lockRef   = useRef(false);
  const gridAreaRef = useRef(null);
  const [cardSize, setCardSize] = useState(80);

  const level = LEVELS[Math.min(levelIdx, LEVELS.length - 1)];
  const cols = level.cols;
  // ---- deal a new round ----
  const deal = useCallback(() => {
    const deck = generateDeck(mode, levelIdx, range, ops);
    setCards(deck);
    setSelected([]);
    setMoves(0);
    setLocked(false);
    lockRef.current = false;
    setPhase('preview');
    setCountdown(15);
    setIsPeeking(false);
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

  // ---- auto-size cards to fit available space ----
  useEffect(() => {
    const updateCardSize = () => {
      if (!gridAreaRef.current) return;
      const h = gridAreaRef.current.clientHeight;
      const w = gridAreaRef.current.clientWidth;
      const gap = 10;
      const padX = 32; // horizontal padding
      const padY = 16; // vertical padding
      const availW = Math.min(w - padX, 480);
      const availH = h - padY;
      const sizeByW = (availW - (cols - 1) * gap) / cols;
      const sizeByH = (availH - (level.rows - 1) * gap) / level.rows;
      setCardSize(Math.max(40, Math.floor(Math.min(sizeByW, sizeByH))));
    };
    updateCardSize();
    const ro = new ResizeObserver(updateCardSize);
    if (gridAreaRef.current) ro.observe(gridAreaRef.current);
    return () => ro.disconnect();
  }, [cols, level.rows, phase]);

  // ---- card click ----
  const handleClick = (idx) => {
    if (phase !== 'playing' || lockRef.current || isPeeking) return;
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
            const reward = (levelIdx + 1) * 5; // e.g. 5, 10, 15 coins
            setCoins(prev => {
              const nc = prev + reward;
              localStorage.setItem('memoryMatchCoins', nc.toString());
              return nc;
            });
            setPhase('won');
            fireConfetti();
          }
        }, 400);
      } else {
        // ❌ no match
        setTimeout(() => {
          audioSynth.playIncorrect();
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
  
  const handleBuy = (item, cost) => {
     if (coins >= cost) {
       audioSynth.playClick();
       setCoins(prev => {
         const nc = prev - cost;
         localStorage.setItem('memoryMatchCoins', nc.toString());
         return nc;
       });
       setInventory(prev => {
         const ni = { ...prev, [item]: prev[item] + 1 };
         localStorage.setItem('memoryMatchInventory', JSON.stringify(ni));
         return ni;
       });
     } else {
       audioSynth.playIncorrect();
     }
  };

  const handleEarnClick = (item) => {
    audioSynth.playClick();
    setEarningItem(item);
    setMathInput('');
    setMathProblem(mathGenerator.generateQuestion(4, {
      minNumber: range?.min ?? 1,
      maxNumber: range?.max ?? 20,
      operations: ops ?? ['add', 'sub'],
      lang: 'zh'
    }));
    setShowMathQuiz(true);
  };

  const handleMathSubmit = (e) => {
    if (e) e.preventDefault();
    if (!mathProblem) return;
    if (parseInt(mathInput, 10) === mathProblem.answer) {
      audioSynth.playCorrect();
      setShowMathQuiz(false);
      setInventory(prev => {
        const ni = { ...prev, [earningItem]: prev[earningItem] + 1 };
        localStorage.setItem('memoryMatchInventory', JSON.stringify(ni));
        return ni;
      });
    } else {
      audioSynth.playIncorrect();
      setIsMathShaking(true);
      setTimeout(() => setIsMathShaking(false), 500);
      setMathInput('');
    }
  };

  const usePeek = () => {
    if (inventory.peek <= 0 || phase !== 'playing' || locked || isPeeking) return;
    audioSynth.playClick();
    const newInv = { ...inventory, peek: inventory.peek - 1 };
    setInventory(newInv);
    localStorage.setItem('memoryMatchInventory', JSON.stringify(newInv));
    setIsPeeking(true);
    setLocked(true);
    lockRef.current = true;
    setTimeout(() => {
      setIsPeeking(false);
      if (selected.length < 2) {
         setLocked(false);
         lockRef.current = false;
      }
    }, 1500);
  };

  const useWand = () => {
    if (inventory.wand <= 0 || phase !== 'playing' || locked || isPeeking) return;
    
    // find first unmatched pair
    let targetPairId = null;
    let targetIdx1 = -1, targetIdx2 = -1;
    for (let i=0; i<cards.length; i++) {
       if (!cards[i].matched) {
          if (targetPairId === null) {
             targetPairId = cards[i].pairId;
             targetIdx1 = i;
          } else if (cards[i].pairId === targetPairId) {
             targetIdx2 = i;
             break;
          }
       }
    }
    if (targetIdx1 === -1 || targetIdx2 === -1) return;

    audioSynth.playCorrect();
    const newInv = { ...inventory, wand: inventory.wand - 1 };
    setInventory(newInv);
    localStorage.setItem('memoryMatchInventory', JSON.stringify(newInv));

    setLocked(true);
    lockRef.current = true;
    
    // Animate flipping them
    setCards(prev => prev.map((c, i) => (i === targetIdx1 || i === targetIdx2) ? { ...c, flipped: true } : c));
    
    setTimeout(() => {
      setCards(prev => prev.map((c, i) => {
         if (i === targetIdx1 || i === targetIdx2) return { ...c, matched: true, flipped: true };
         if (!c.matched && i !== targetIdx1 && i !== targetIdx2) return { ...c, flipped: false }; // reset everything else
         return c;
      }));
      setSelected([]);
      setLocked(false);
      lockRef.current = false;
      
      // check if won
      setCards(currentCards => {
         if (currentCards.every(c => c.matched)) {
             const reward = (levelIdx + 1) * 5;
             setCoins(prevCoins => {
               const nc = prevCoins + reward;
               localStorage.setItem('memoryMatchCoins', nc.toString());
               return nc;
             });
             setPhase('won');
             fireConfetti();
         }
         return currentCards;
      });
    }, 800);
  };

  const fireConfetti = () => {
    audioSynth.playCorrect();
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
  };

  const nextLevel = () => {
    audioSynth.playClick();
    setLevelIdx(p => p + 1);
  };


  return (
    <div style={{
      width: '100%', height: '100vh',
      background: 'linear-gradient(160deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%)',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'Fredoka, sans-serif',
      color: 'white',
      userSelect: 'none',
      position: 'relative',
      overflow: 'hidden',
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

      {/* ─── STATS & SHOP BAR ─── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 20px',
        maxWidth: 600, margin: '0 auto', width: '100%', boxSizing: 'border-box'
      }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.3)', padding: '6px 12px', borderRadius: 20 }}>
            <Coins size={18} color="#fcd34d" />
            <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#fcd34d' }}>{coins}</span>
            <button onClick={() => setShowShop(true)} style={{ marginLeft: 4, background: '#4f46e5', border: 'none', color: 'white', borderRadius: 10, padding: '4px 8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>商店</button>
         </div>

        <div style={{ display: 'flex', gap: 24 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, lineHeight: 1 }}>{moves}</div>
            <div style={{ fontSize: '0.7rem', opacity: 0.65 }}>翻牌次数</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, lineHeight: 1 }}>
              {cards.filter(c => c.matched).length / 2}/{(level.rows * level.cols) / 2}
            </div>
            <div style={{ fontSize: '0.7rem', opacity: 0.65 }}>已配对</div>
          </div>
        </div>
      </div>

      {/* ─── PREVIEW BANNER ─── */}
      {phase === 'preview' && (
        <div style={{
          margin: '0 auto 12px',
          maxWidth: 480, width: '90%',
          background: 'linear-gradient(90deg, #f59e0b, #ef4444)',
          borderRadius: 16, padding: '10px 20px',
          textAlign: 'center', fontWeight: 700, fontSize: '1.1rem',
          boxShadow: '0 4px 20px rgba(239,68,68,0.4)',
          animation: 'pulse 0.8s infinite alternate',
          boxSizing: 'border-box'
        }}>
          👀 记住卡片位置！{countdown} 秒后翻面…
        </div>
      )}

      {/* ─── CARD GRID (auto-scaled) ─── */}
      <div ref={gridAreaRef} style={{
        flex: 1,
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        minHeight: 0,
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, ${cardSize}px)`,
          gridTemplateRows: `repeat(${level.rows}, ${cardSize}px)`,
          gap: 10,
        }}>
          {cards.map((card, idx) => {
            const isUp = card.flipped || card.matched || isPeeking;
            return (
              <div
                key={card.id}
                onClick={() => handleClick(idx)}
                style={{
                  position: 'relative',
                  width: cardSize,
                  height: cardSize,
                  cursor: (phase === 'playing' && !card.flipped && !card.matched && !locked && !isPeeking) ? 'pointer' : 'default',
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
                    background: cardTheme === 'forest' ? `url(${import.meta.env.BASE_URL}card_backs/forest.png)` :
                                cardTheme === 'space' ? `url(${import.meta.env.BASE_URL}card_backs/space.png)` :
                                cardTheme === 'candy' ? `url(${import.meta.env.BASE_URL}card_backs/candy.png)` :
                                'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    border: '2px solid rgba(255,255,255,0.25)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.6rem',
                  }}>
                    {cardTheme === 'default' ? '⭐' : ''}
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
      
      {/* ─── POWER UPS BAR ─── */}
      <div style={{
        flexShrink: 0,
        display: 'flex', justifyContent: 'center', gap: 16,
        padding: '10px 16px 16px',
        background: 'rgba(0,0,0,0.25)',
        borderTop: '1px solid rgba(255,255,255,0.1)',
      }}>
          <button 
             onClick={usePeek} 
             disabled={inventory.peek <= 0 || phase !== 'playing' || locked || isPeeking}
             style={{
               background: inventory.peek > 0 ? 'linear-gradient(135deg, #f59e0b, #d97706)' : '#64748b',
               border: '2px solid rgba(255,255,255,0.4)', borderRadius: 20,
               padding: '10px 20px', color: 'white', fontWeight: 'bold', fontSize: '1rem',
               boxShadow: '0 4px 15px rgba(0,0,0,0.3)', cursor: inventory.peek > 0 ? 'pointer' : 'not-allowed',
               display: 'flex', alignItems: 'center', gap: 8, opacity: inventory.peek > 0 ? 1 : 0.6
             }}>
             <Eye size={20} />
             透视镜 x{inventory.peek}
          </button>
          <button 
             onClick={useWand} 
             disabled={inventory.wand <= 0 || phase !== 'playing' || locked || isPeeking}
             style={{
               background: inventory.wand > 0 ? 'linear-gradient(135deg, #ec4899, #be185d)' : '#64748b',
               border: '2px solid rgba(255,255,255,0.4)', borderRadius: 20,
               padding: '10px 20px', color: 'white', fontWeight: 'bold', fontSize: '1rem',
               boxShadow: '0 4px 15px rgba(0,0,0,0.3)', cursor: inventory.wand > 0 ? 'pointer' : 'not-allowed',
               display: 'flex', alignItems: 'center', gap: 8, opacity: inventory.wand > 0 ? 1 : 0.6
             }}>
             <Wand2 size={20} />
             魔法棒 x{inventory.wand}
          </button>
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
            <p style={{ color: '#64748b', margin: '0 0 12px', fontSize: '1rem' }}>
              你用了 <strong style={{ color: '#4f46e5' }}>{moves}</strong> 次翻牌完成了全部配对
            </p>
            <div style={{ background: '#fef3c7', padding: '10px', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
               <Coins size={20} color="#d97706" />
               <span style={{ color: '#d97706', fontWeight: 'bold', fontSize: '1.1rem' }}>获得 {(levelIdx + 1) * 5} 金币</span>
            </div>
            
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

      {/* ─── SHOP MODAL ─── */}
      {showShop && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 300,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
        }}>
          <div className="bounce-in" style={{
            background: 'white', borderRadius: 24, padding: 24,
            width: '100%', maxWidth: 340, color: '#1e293b'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                 <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.2rem' }}>道具商店</h3>
                 <span style={{ display: 'flex', alignItems: 'center', gap: 2, background: '#fef3c7', color: '#d97706', padding: '2px 8px', borderRadius: 12, fontSize: '0.9rem', fontWeight: 'bold' }}><Coins size={14}/> {coins}</span>
              </div>
              <button onClick={() => { audioSynth.playClick(); setShowShop(false); }} style={{
                background: '#f1f5f9', border: 'none', borderRadius: 10,
                width: 32, height: 32, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <X size={16} color="#64748b" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
               <div style={{ padding: '12px', borderRadius: 16, border: '2px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                     <div style={{ width: 40, height: 40, borderRadius: 12, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Eye size={24} color="#d97706" />
                     </div>
                     <div>
                        <div style={{ fontWeight: 'bold' }}>透视镜 (x{inventory.peek})</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>短暂偷看所有卡片</div>
                     </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                     {enableMathForItems && (
                        <button onClick={() => handleEarnClick('peek')} style={{
                           background: '#10b981', color: 'white', border: 'none', borderRadius: 12, padding: '6px 12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center'
                        }}>答题获取</button>
                     )}
                     <button onClick={() => handleBuy('peek', 10)} disabled={coins < 10} style={{
                        background: coins >= 10 ? '#4f46e5' : '#cbd5e1', color: 'white', border: 'none', borderRadius: 12, padding: '6px 12px', fontWeight: 'bold', cursor: coins >= 10 ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: 4
                     }}><Coins size={14} /> 10</button>
                  </div>
               </div>
               
               <div style={{ padding: '12px', borderRadius: 16, border: '2px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                     <div style={{ width: 40, height: 40, borderRadius: 12, background: '#fce7f3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Wand2 size={24} color="#be185d" />
                     </div>
                     <div>
                        <div style={{ fontWeight: 'bold' }}>魔法棒 (x{inventory.wand})</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>自动配对一组卡片</div>
                     </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                     {enableMathForItems && (
                        <button onClick={() => handleEarnClick('wand')} style={{
                           background: '#10b981', color: 'white', border: 'none', borderRadius: 12, padding: '6px 12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center'
                        }}>答题获取</button>
                     )}
                     <button onClick={() => handleBuy('wand', 15)} disabled={coins < 15} style={{
                        background: coins >= 15 ? '#4f46e5' : '#cbd5e1', color: 'white', border: 'none', borderRadius: 12, padding: '6px 12px', fontWeight: 'bold', cursor: coins >= 15 ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: 4
                     }}><Coins size={14} /> 15</button>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── MATH QUIZ MODAL ─── */}
      {showMathQuiz && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 400,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
        }}>
          <div className={isMathShaking ? 'shake' : 'bounce-in'} style={{
            background: 'white', borderRadius: 24, padding: 32,
            width: '100%', maxWidth: 360, color: '#1e293b',
            boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#4f46e5', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Settings size={24} /> 解答题目获取道具
              </h3>
              <button onClick={() => { audioSynth.playClick(); setShowMathQuiz(false); }} style={{
                background: '#f1f5f9', border: 'none', borderRadius: 12,
                width: 36, height: 36, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <X size={20} color="#64748b" />
              </button>
            </div>
            
            <div style={{ fontSize: '3rem', fontWeight: 800, margin: '20px 0', color: '#1e293b', letterSpacing: 2 }}>
              {mathProblem?.problemStr} = ?
            </div>

            <form onSubmit={handleMathSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 24 }}>
              <input
                type="number"
                value={mathInput}
                onChange={e => setMathInput(e.target.value)}
                placeholder="输入答案"
                autoFocus
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '16px 20px', borderRadius: 16,
                  border: '2px solid #e2e8f0', fontSize: '1.4rem', fontWeight: 700,
                  outline: 'none', textAlign: 'center',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                }}
              />
              <button type="submit" onClick={handleMathSubmit} style={{
                width: '100%', boxSizing: 'border-box',
                background: '#10b981', color: 'white', border: 'none', borderRadius: 16,
                padding: '14px', fontSize: '1.2rem', fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(16,185,129,0.3)'
              }}>
                确定
              </button>
            </form>
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
            width: '100%', maxWidth: 340, maxHeight: '80vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.2rem' }}>游戏设置</h3>
              <button onClick={() => { audioSynth.playClick(); setShowSettings(false); }} style={{
                background: '#f1f5f9', border: 'none', borderRadius: 10,
                width: 32, height: 32, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <X size={16} color="#64748b" />
              </button>
            </div>

            <div style={{ marginBottom: 24, padding: '12px', background: '#f8fafc', borderRadius: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div>
                  <div style={{ fontWeight: 'bold', color: '#1e293b' }}>答题获取道具</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>允许在商店通过计算题目免费获取道具</div>
               </div>
               <div 
                  onClick={() => {
                     audioSynth.playClick();
                     const nextState = !enableMathForItems;
                     setEnableMathForItems(nextState);
                     localStorage.setItem('memoryMatchEnableMath', nextState.toString());
                  }}
                  style={{
                     width: 44, height: 24, borderRadius: 12,
                     background: enableMathForItems ? '#10b981' : '#cbd5e1',
                     position: 'relative', cursor: 'pointer', transition: 'background 0.3s'
                  }}
               >
                  <div style={{
                     width: 20, height: 20, borderRadius: '50%', background: 'white',
                     position: 'absolute', top: 2, left: enableMathForItems ? 22 : 2,
                     transition: 'left 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }} />
               </div>
            </div>

            <div style={{ marginBottom: 24 }}>
               <h4 style={{ margin: '0 0 12px', color: '#475569', fontSize: '0.9rem' }}>选择配对模式</h4>
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
            
            <div>
               <h4 style={{ margin: '0 0 12px', color: '#475569', fontSize: '0.9rem' }}>卡背主题</h4>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {THEMES.map(t => (
                     <button key={t.id} onClick={() => {
                        audioSynth.playClick();
                        setCardTheme(t.id);
                        localStorage.setItem('memoryMatchTheme', t.id);
                     }} style={{
                        padding: '12px', borderRadius: 16, cursor: 'pointer',
                        border: `2px solid ${cardTheme === t.id ? '#4f46e5' : '#e2e8f0'}`,
                        background: cardTheme === t.id ? '#eff6ff' : 'white',
                        color: cardTheme === t.id ? '#4f46e5' : '#475569',
                        fontWeight: 700, fontSize: '0.9rem',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6
                     }}>
                        <span style={{ fontSize: '1.8rem' }}>{t.emoji}</span>
                        {t.label}
                     </button>
                  ))}
               </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          from { opacity: 1; }
          to   { opacity: 0.7; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        .shake { animation: shake 0.4s ease-in-out; }
      `}</style>
    </div>
  );
}

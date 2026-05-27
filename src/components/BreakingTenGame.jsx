import React, { useState, useEffect, useCallback } from 'react';
import { audioSynth } from '../utils/audioSynth';

// Generate a random problem based on the difficulty level
function generateProblem(level) {
  let num1, num2, answer;
  
  if (level === 1) {
    // Easy: Teens minus 9 or 8
    num2 = Math.random() < 0.5 ? 9 : 8;
    num1 = Math.floor(Math.random() * 8) + 11; // 11-18
    while (num1 - num2 < 1 || num1 === 10 + num2) {
      num1 = Math.floor(Math.random() * 8) + 11;
    }
  } else if (level === 2) {
    // Medium: Teens minus 7 or 6
    num2 = Math.random() < 0.5 ? 7 : 6;
    num1 = Math.floor(Math.random() * 6) + 11; // 11-16
    while (num1 - num2 < 1 || num1 === 10 + num2) {
      num1 = Math.floor(Math.random() * 6) + 11;
    }
  } else {
    // Hard: Teens minus 5, 4, 3, 2
    const subOptions = [5, 4, 3, 2];
    num2 = subOptions[Math.floor(Math.random() * subOptions.length)];
    num1 = Math.floor(Math.random() * 5) + 11; // 11-15
    while (num1 - num2 < 1 || num1 === 10 + num2 || num1 - num2 >= 10) {
      num1 = Math.floor(Math.random() * 5) + 11;
    }
  }
  
  answer = num1 - num2;
  
  // Make multiple choice answers
  const wrong = new Set();
  while (wrong.size < 3) {
    let w = answer + Math.floor(Math.random() * 7) - 3;
    if (w !== answer && w > 0 && w < 10) {
      wrong.add(w);
    }
  }
  const choices = [answer, ...wrong].sort((a, b) => a - b);
  return { num1, num2, answer, choices };
}

// Preset formulas for classroom exploration
const CLASSROOM_FORMULAS = [
  { num1: 12, num2: 8, ans: 4 },
  { num1: 15, num2: 7, ans: 8 },
  { num1: 13, num2: 6, ans: 7 },
  { num1: 11, num2: 9, ans: 2 },
  { num1: 14, num2: 8, ans: 6 },
  { num1: 12, num2: 6, ans: 6 }
];

// Complete set of Breaking Ten Chants (破十法全套口诀)
const CHANTS = [
  { minus: 9, add: 1, color: '#fca5a5', border: '#f87171', textZh: '十几减9，几加1', textEn: 'Subtract 9 ➔ Unit + 1', bg: 'linear-gradient(135deg, #fee2e2, #fca5a5)' },
  { minus: 8, add: 2, color: '#fed7aa', border: '#fb923c', textZh: '十几减8，几加2', textEn: 'Subtract 8 ➔ Unit + 2', bg: 'linear-gradient(135deg, #ffedd5, #fed7aa)' },
  { minus: 7, add: 3, color: '#fef08a', border: '#facc15', textZh: '十几减7，几加3', textEn: 'Subtract 7 ➔ Unit + 3', bg: 'linear-gradient(135deg, #fef9c3, #fef08a)' },
  { minus: 6, add: 4, color: '#bbf7d0', border: '#4ade80', textZh: '十几减6，几加4', textEn: 'Subtract 6 ➔ Unit + 4', bg: 'linear-gradient(135deg, #dcfce7, #bbf7d0)' },
  { minus: 5, add: 5, color: '#99f6e4', border: '#2dd4bf', textZh: '十几减5，几加5', textEn: 'Subtract 5 ➔ Unit + 5', bg: 'linear-gradient(135deg, #ccfbf1, #99f6e4)' },
  { minus: 4, add: 6, color: '#bae6fd', border: '#38bdf8', textZh: '十几减4，几加6', textEn: 'Subtract 4 ➔ Unit + 6', bg: 'linear-gradient(135deg, #e0f2fe, #bae6fd)' },
  { minus: 3, add: 7, color: '#c7d2fe', border: '#818cf8', textZh: '十几减3，几加7', textEn: 'Subtract 3 ➔ Unit + 7', bg: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)' },
  { minus: 2, add: 8, color: '#fbcfe8', border: '#f472b6', textZh: '十几减2，几加8', textEn: 'Subtract 2 ➔ Unit + 8', bg: 'linear-gradient(135deg, #fce7f3, #fbcfe8)' }
];

export default function BreakingTenGame({ autoAdvance, lang = 'zh', difficultyMode = 'adaptive' }) {
  const [activeTab, setActiveTab] = useState('classroom'); // classroom | practice
  const [classroomMode, setClassroomMode] = useState('explore'); // explore | chants
  
  // Classroom: Formula Exploration State
  const [exploreIdx, setExploreIdx] = useState(0);
  const [exploreMethod, setExploreMethod] = useState('breakingTen'); // sticks | breakingTen | thinkAddition
  const [sticksAnimateStep, setSticksAnimateStep] = useState(0); // 0: init, 1: separate 10 & N, 2: take away from 10, 3: combine remainder
  
  // Classroom: Chant Card State
  const [selectedChant, setSelectedChant] = useState(null);
  
  // Practice State
  const [adaptiveLevel, setAdaptiveLevel] = useState(1);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  
  const level = difficultyMode === 'easy' ? 1 : 
                difficultyMode === 'medium' ? 2 : 
                difficultyMode === 'hard' ? 3 : adaptiveLevel;
                
  const [problem, setProblem] = useState(() => generateProblem(level));
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  
  const isEn = lang === 'en';
  
  const activeFormula = CLASSROOM_FORMULAS[exploreIdx];
  
  // Trigger Next Problem in Practice Mode
  const nextProblem = useCallback(() => {
    setProblem(generateProblem(level));
    setSelectedAnswer(null);
    setShowHint(false);
  }, [level]);
  
  useEffect(() => {
    if (activeTab === 'practice') {
      nextProblem();
    }
  }, [level, activeTab, nextProblem]);
  
  // Reset sticks animation when formula or method changes
  useEffect(() => {
    setSticksAnimateStep(0);
  }, [exploreIdx, exploreMethod]);
  
  const handleChoice = (val) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(val);
    setSessionCount(p => p + 1);
    
    if (val === problem.answer) {
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
        setTimeout(nextProblem, 1600);
      }
    } else {
      audioSynth.playIncorrect();
      if (difficultyMode === 'adaptive') {
        setConsecutiveCorrect(0);
        if (adaptiveLevel > 1) {
          setAdaptiveLevel(l => l - 1);
        }
      }
      // Keep showing details, let them see explanation or advance
      if (autoAdvance) {
        setTimeout(nextProblem, 2200);
      }
    }
  };

  return (
    <div className="screen-wrapper fade-in" style={{ justifyContent: 'flex-start', gap: '15px', paddingBottom: '20px', overflowY: 'auto' }}>
      
      {/* --- TOP HEADER & TITLE --- */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#c0487a', marginBottom: '2px' }}>
          🎋 {isEn ? 'Breaking Ten & Chants' : '破十减法与口诀'}
        </div>
        <div style={{ fontSize: '0.85rem', color: '#d4879e', fontWeight: '600' }}>
          {isEn 
            ? 'Master Teens Subtraction with Visual Magic!' 
            : '通过好玩的口诀与图解，轻松掌握退位减法！'}
        </div>
      </div>
      
      {/* --- TAB SELECTOR --- */}
      <div style={{ display: 'flex', background: 'rgba(255,255,255,0.6)', borderRadius: '25px', padding: '4px', width: '100%', maxWidth: '380px', border: '1.5px solid rgba(255,255,255,0.9)' }}>
        <button 
          onClick={() => { audioSynth.playClick(); setActiveTab('classroom'); }}
          style={{
            flex: 1, padding: '10px 0', border: 'none', borderRadius: '20px',
            fontFamily: 'Fredoka, sans-serif', fontWeight: '600', fontSize: '0.95rem',
            background: activeTab === 'classroom' ? 'linear-gradient(135deg, #ff85b8, #ff5d9e)' : 'transparent',
            color: activeTab === 'classroom' ? 'white' : '#c06080',
            cursor: 'pointer', transition: 'all 0.2s ease',
            boxShadow: activeTab === 'classroom' ? '0 4px 10px rgba(255,93,158,0.25)' : 'none',
          }}>
          📚 {isEn ? 'Classroom' : '趣味课堂'}
        </button>
        <button 
          onClick={() => { audioSynth.playClick(); setActiveTab('practice'); }}
          style={{
            flex: 1, padding: '10px 0', border: 'none', borderRadius: '20px',
            fontFamily: 'Fredoka, sans-serif', fontWeight: '600', fontSize: '0.95rem',
            background: activeTab === 'practice' ? 'linear-gradient(135deg, #ff85b8, #ff5d9e)' : 'transparent',
            color: activeTab === 'practice' ? 'white' : '#c06080',
            cursor: 'pointer', transition: 'all 0.2s ease',
            boxShadow: activeTab === 'practice' ? '0 4px 10px rgba(255,93,158,0.25)' : 'none',
          }}>
          ✍️ {isEn ? 'Practice' : '强化练习'}
        </button>
      </div>

      {/* ============================================================
          TAB 1: INTERACTIVE CLASSROOM (趣味课堂)
          ============================================================ */}
      {activeTab === 'classroom' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '380px', gap: '12px' }}>
          
          {/* Sub-mode selector */}
          <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
            <button 
              onClick={() => { audioSynth.playClick(); setClassroomMode('explore'); }}
              style={{
                flex: 1, padding: '8px', border: '2px solid #f5c0d0', borderRadius: '15px',
                fontFamily: 'Fredoka, sans-serif', fontWeight: '600', fontSize: '0.85rem',
                background: classroomMode === 'explore' ? '#fff0f6' : 'white',
                color: '#c0507a', cursor: 'pointer', transition: 'all 0.2s ease',
                transform: classroomMode === 'explore' ? 'scale(1.03)' : 'scale(1)',
              }}>
              💡 {isEn ? 'Explore Formulas' : '算式探索'}
            </button>
            <button 
              onClick={() => { audioSynth.playClick(); setClassroomMode('chants'); }}
              style={{
                flex: 1, padding: '8px', border: '2px solid #f5c0d0', borderRadius: '15px',
                fontFamily: 'Fredoka, sans-serif', fontWeight: '600', fontSize: '0.85rem',
                background: classroomMode === 'chants' ? '#fff0f6' : 'white',
                color: '#c0507a', cursor: 'pointer', transition: 'all 0.2s ease',
                transform: classroomMode === 'chants' ? 'scale(1.03)' : 'scale(1)',
              }}>
              💬 {isEn ? 'Breaking Ten Chants' : '破十口诀'}
            </button>
          </div>

          {/* SUBTAB A: FORMULA EXPLORATION */}
          {classroomMode === 'explore' && (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '12px' }}>
              
              {/* Formula Select Carousel */}
              <div style={{ display: 'flex', gap: '6px', width: '100%', overflowX: 'auto', padding: '4px 0', scrollbarWidth: 'none' }}>
                {CLASSROOM_FORMULAS.map((item, idx) => {
                  const isActive = idx === exploreIdx;
                  return (
                    <button 
                      key={idx}
                      onClick={() => { audioSynth.playClick(); setExploreIdx(idx); }}
                      style={{
                        padding: '6px 12px', borderRadius: '12px', border: isActive ? '2px solid #ff5d9e' : '1.5px solid #f5c0d0',
                        background: isActive ? 'linear-gradient(135deg, #ffb5c8, #ff8fab)' : 'white',
                        color: isActive ? 'white' : '#c06080', fontWeight: '600', fontSize: '0.8rem',
                        cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s ease',
                        boxShadow: isActive ? '0 3px 8px rgba(255,93,158,0.2)' : 'none',
                        fontFamily: 'Fredoka, sans-serif'
                      }}>
                      {item.num1} - {item.num2}
                    </button>
                  );
                })}
              </div>

              {/* Explaining Method Picker */}
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.7)', borderRadius: '18px', padding: '3px', width: '100%', border: '1.5px solid #fbcfe8' }}>
                {['sticks', 'breakingTen', 'thinkAddition'].map(method => {
                  const isActive = exploreMethod === method;
                  let label = '';
                  if (method === 'sticks') label = isEn ? '🎋 Sticks' : '🎋 圈小棒';
                  if (method === 'breakingTen') label = isEn ? '✂️ Break Ten' : '✂️ 破十法';
                  if (method === 'thinkAddition') label = isEn ? '🧠 Think Add' : '🧠 想加算减';
                  return (
                    <button
                      key={method}
                      onClick={() => { audioSynth.playClick(); setExploreMethod(method); }}
                      style={{
                        flex: 1, padding: '7px 0', border: 'none', borderRadius: '14px',
                        fontFamily: 'Fredoka, sans-serif', fontWeight: '600', fontSize: '0.75rem',
                        background: isActive ? 'linear-gradient(135deg, #fbcfe8, #f472b6)' : 'transparent',
                        color: isActive ? '#831843' : '#be185d', cursor: 'pointer', transition: 'all 0.2s ease',
                      }}>
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Core Board display */}
              <div style={{
                background: 'rgba(255,255,255,0.95)', borderRadius: '24px', padding: '16px',
                width: '100%', border: '2.5px solid #fbcfe8', minHeight: '230px',
                boxShadow: '0 8px 30px rgba(255,93,158,0.06)', display: 'flex', flexDirection: 'column',
                justifyContent: 'space-between', gap: '12px'
              }}>
                
                {/* Method 1: BAMBOO STICKS VISUALIZATION */}
                {exploreMethod === 'sticks' && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '8px', flex: 1, justifyContent: 'center' }}>
                    
                    {/* Render the sticks container */}
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center', background: '#fdf2f8', padding: '12px 20px', borderRadius: '16px', border: '1.5px dashed #f472b6' }}>
                      
                      {/* Bundle of 10 Sticks */}
                      <div style={{
                        position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center',
                        opacity: sticksAnimateStep >= 2 ? 0.45 : 1, transition: 'all 0.4s ease'
                      }}>
                        <div style={{
                          display: 'grid', gridTemplateColumns: 'repeat(5, 5px)', gap: '4px',
                          background: '#fffbeb', border: '2px solid #b45309', borderRadius: '8px',
                          padding: '6px 8px', position: 'relative'
                        }}>
                          {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} style={{ width: '4px', height: '36px', background: 'linear-gradient(to bottom, #fbbf24, #d97706)', borderRadius: '2px' }} />
                          ))}
                          {/* Ribbon tying them */}
                          <div style={{
                            position: 'absolute', top: '16px', left: 0, right: 0, height: '6px',
                            background: '#ec4899', borderRadius: '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
                          }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#b45309', marginTop: '4px' }}>10</span>
                        
                        {/* Red ellipse indicating take away */}
                        {sticksAnimateStep === 2 && (
                          <div style={{
                            position: 'absolute', inset: '-4px', border: '3px dashed #ef4444',
                            borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(239,68,68,0.1)'
                          }}>
                            <span style={{ fontSize: '0.8rem', color: '#dc2626', fontWeight: '800' }}>-{activeFormula.num2}</span>
                          </div>
                        )}
                        {sticksAnimateStep === 3 && (
                          <div style={{
                            position: 'absolute', inset: '-4px', border: '2.5px solid #22c55e',
                            borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(34,197,94,0.1)'
                          }}>
                            <span style={{ fontSize: '0.8rem', color: '#15803d', fontWeight: '800' }}>+{10 - activeFormula.num2}</span>
                          </div>
                        )}
                      </div>

                      {/* Plus sign */}
                      <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#db2777' }}>+</span>

                      {/* Loose individual sticks */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{
                          display: 'flex', gap: '6px', minWidth: '40px', justifyContent: 'center',
                          background: '#fffbeb', border: '1.5px solid #d97706', borderRadius: '8px', padding: '6px'
                        }}>
                          {Array.from({ length: activeFormula.num1 - 10 }).map((_, i) => (
                            <div key={i} style={{ width: '4px', height: '36px', background: 'linear-gradient(to bottom, #fbbf24, #d97706)', borderRadius: '2px' }} />
                          ))}
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#b45309', marginTop: '4px' }}>
                          {activeFormula.num1 - 10}
                        </span>
                      </div>
                    </div>

                    {/* Step descriptions */}
                    <div style={{ fontSize: '0.85rem', color: '#4d1a30', fontWeight: '600', textAlign: 'center', padding: '0 8px', lineHeight: 1.4 }}>
                      {sticksAnimateStep === 0 && (
                        isEn 
                          ? `Total ${activeFormula.num1} sticks: 1 bundle of 10 and ${activeFormula.num1 - 10} single ones.` 
                          : `一共有 ${activeFormula.num1} 根小棒：1捆（10根）和 ${activeFormula.num1 - 10} 根单只。`
                      )}
                      {sticksAnimateStep === 1 && (
                        isEn 
                          ? `We cannot subtract ${activeFormula.num2} directly from the ${activeFormula.num1 - 10} single ones.` 
                          : `单只的小棒有 ${activeFormula.num1 - 10} 根，不够减去被减数 ${activeFormula.num2}。`
                      )}
                      {sticksAnimateStep === 2 && (
                        isEn 
                          ? `So, let's open the bundle of 10 and circle/take away ${activeFormula.num2}! ${10 - activeFormula.num2} sticks are left.` 
                          : `所以，我们拆开整捆的10根，圈去 ${activeFormula.num2} 根！此时还剩下 ${10 - activeFormula.num2} 根。`
                      )}
                      {sticksAnimateStep === 3 && (
                        isEn 
                          ? `Combine the remaining ${10 - activeFormula.num2} sticks with the original ${activeFormula.num1 - 10} single ones to get ${activeFormula.ans}!` 
                          : `最后，把整捆剩下的 ${10 - activeFormula.num2} 根与原来的 ${activeFormula.num1 - 10} 根合并，得到 ${activeFormula.ans}！`
                      )}
                    </div>

                    {/* Controller button for animation */}
                    <button 
                      onClick={() => {
                        audioSynth.playClick();
                        setSticksAnimateStep(p => (p + 1) % 4);
                      }}
                      style={{
                        padding: '6px 20px', borderRadius: '15px', border: 'none',
                        background: 'linear-gradient(135deg, #fbcfe8, #ff85b8)',
                        color: 'white', fontWeight: '600', fontSize: '0.8rem',
                        cursor: 'pointer', fontFamily: 'Fredoka, sans-serif',
                        boxShadow: '0 3px 8px rgba(244,114,182,0.3)',
                      }}>
                      {sticksAnimateStep === 3 
                        ? (isEn ? 'Reset ↺' : '重置 ↺') 
                        : (isEn ? 'Next Step ➔' : '下一步 ➔')}
                    </button>

                  </div>
                )}

                {/* Method 2: BREAKING TEN DIAGRAM (破十法) */}
                {exploreMethod === 'breakingTen' && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '8px', flex: 1, justifyContent: 'center' }}>
                    
                    {/* Tree diagram */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', width: '180px', margin: '8px 0' }}>
                      
                      {/* Top number: teens */}
                      <div style={{
                        background: 'linear-gradient(135deg, #ff85b8, #ff5d9e)', color: 'white',
                        borderRadius: '16px', padding: '6px 18px', fontWeight: '700', fontSize: '1.25rem',
                        boxShadow: '0 3px 8px rgba(255,93,158,0.3)'
                      }}>
                        {activeFormula.num1}
                      </div>

                      {/* Split branch lines */}
                      <svg width="120" height="30" style={{ margin: '2px 0' }}>
                        <line x1="60" y1="0" x2="25" y2="28" stroke="#ff5d9e" strokeWidth="2.5" strokeDasharray="3,3" />
                        <line x1="60" y1="0" x2="95" y2="28" stroke="#ff5d9e" strokeWidth="2.5" strokeDasharray="3,3" />
                      </svg>

                      {/* Bottom numbers */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '0 10px' }}>
                        <div style={{
                          background: '#ecfdf5', border: '2px solid #34d399', color: '#065f46',
                          width: '42px', height: '42px', borderRadius: '50%', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontWeight: '700', fontSize: '1.05rem',
                          boxShadow: '0 2px 6px rgba(52,211,153,0.15)'
                        }}>10</div>
                        <div style={{
                          background: '#fff7ed', border: '2px solid #fb923c', color: '#9a3412',
                          width: '42px', height: '42px', borderRadius: '50%', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontWeight: '700', fontSize: '1.05rem',
                          boxShadow: '0 2px 6px rgba(251,146,60,0.15)'
                        }}>{activeFormula.num1 - 10}</div>
                      </div>
                    </div>

                    {/* Explaining Box */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', background: '#fff0f6', padding: '8px 12px', borderRadius: '14px', border: '1px solid #fbcfe8' }}>
                      <div style={{ fontSize: '0.8rem', color: '#db2777', fontWeight: '700' }}>
                        {isEn ? '✂️ Two Simple Steps:' : '✂️ 简单两步法：'}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#4b152d', fontWeight: '600', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <div>
                          <strong>① 10 - {activeFormula.num2} = <span style={{ color: '#059669', fontSize: '1.05rem' }}>{10 - activeFormula.num2}</span></strong> 
                          <span style={{ fontSize: '0.75rem', opacity: 0.85, marginLeft: '6px' }}>
                            {isEn ? '(First subtract from 10)' : '(先用10去减)'}
                          </span>
                        </div>
                        <div>
                          <strong>② <span style={{ color: '#059669' }}>{10 - activeFormula.num2}</span> + {activeFormula.num1 - 10} = <span style={{ color: '#e11d48', fontSize: '1.05rem' }}>{activeFormula.ans}</span></strong> 
                          <span style={{ fontSize: '0.75rem', opacity: 0.85, marginLeft: '6px' }}>
                            {isEn ? '(Add unit number back)' : '(加上原来的个位)'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Method 3: THINK ADDITION (想加算减) */}
                {exploreMethod === 'thinkAddition' && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '10px', flex: 1, justifyContent: 'center' }}>
                    
                    {/* Big Equation bubble */}
                    <div style={{
                      background: 'rgba(254,243,199,0.5)', border: '2px dashed #f59e0b', borderRadius: '18px',
                      padding: '10px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
                    }}>
                      <span style={{ fontSize: '0.8rem', color: '#b45309', fontWeight: '700' }}>
                        💭 {isEn ? 'To solve:' : '要算这道题：'}
                      </span>
                      <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#d97706' }}>
                        {activeFormula.num1} - {activeFormula.num2} = ？
                      </span>
                    </div>

                    {/* Thought processes */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', width: '100%' }}>
                      
                      {/* Thought 1 */}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px', background: '#eff6ff',
                        padding: '6px 14px', borderRadius: '14px', border: '1.5px solid #bfdbfe', width: '90%'
                      }}>
                        <span style={{ fontSize: '1.2rem' }}>🧠</span>
                        <span style={{ fontSize: '0.8rem', color: '#1e3a8a', fontWeight: '600' }}>
                          {isEn ? 'Think Addition:' : '先想加法：'} <strong>{activeFormula.num2} + <span style={{ color: '#ec4899', fontSize: '0.95rem' }}>？</span> = {activeFormula.num1}</strong>
                        </span>
                      </div>

                      {/* Thought 2 */}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px', background: '#ecfdf5',
                        padding: '6px 14px', borderRadius: '14px', border: '1.5px solid #a7f3d0', width: '90%'
                      }}>
                        <span style={{ fontSize: '1.2rem' }}>💡</span>
                        <span style={{ fontSize: '0.8rem', color: '#064e3b', fontWeight: '600' }}>
                          {isEn ? 'Because:' : '因为：'} <strong>{activeFormula.num2} + <span style={{ color: '#059669', fontSize: '0.95rem' }}>{activeFormula.ans}</span> = {activeFormula.num1}</strong>
                        </span>
                      </div>

                      {/* Conclusion */}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px', background: '#fdf2f8',
                        padding: '6px 14px', borderRadius: '14px', border: '1.5px solid #fbcfe8', width: '90%'
                      }}>
                        <span style={{ fontSize: '1.2rem' }}>🎉</span>
                        <span style={{ fontSize: '0.8rem', color: '#701a75', fontWeight: '600' }}>
                          {isEn ? 'Therefore:' : '所以：'} <strong>{activeFormula.num1} - {activeFormula.num2} = <span style={{ color: '#db2777', fontSize: '0.95rem' }}>{activeFormula.ans}</span></strong>
                        </span>
                      </div>

                    </div>
                  </div>
                )}
                
              </div>
            </div>
          )}

          {/* SUBTAB B: CHANTS AND RULES (破十口诀表) */}
          {classroomMode === 'chants' && (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '12px' }}>
              
              {/* Chant Tip */}
              <div style={{ fontSize: '0.82rem', color: '#db2777', fontWeight: '700', textAlign: 'center', marginBottom: '2px' }}>
                🎵 {isEn ? 'Click cards below to unlock visual examples!' : '点击下方口诀卡片，查看好玩的算奥秘吧！'}
              </div>

              {/* Grid of Chant Cards */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', width: '100%'
              }}>
                {CHANTS.map((chant, i) => {
                  const isSelected = selectedChant && selectedChant.minus === chant.minus;
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        audioSynth.playClick();
                        setSelectedChant(chant);
                      }}
                      style={{
                        background: chant.bg,
                        border: `2px solid ${isSelected ? '#e11d48' : chant.border}`,
                        borderRadius: '20px', padding: '10px 6px',
                        display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center',
                        cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        boxShadow: isSelected ? '0 6px 15px rgba(225,29,72,0.25)' : '0 3px 8px rgba(0,0,0,0.04)',
                        transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                        fontFamily: 'Fredoka, sans-serif'
                      }}>
                      <span style={{ fontSize: '0.75rem', color: '#4b5563', opacity: 0.8, fontWeight: '600' }}>
                        {isEn ? chant.textEn.split(' ➔ ')[0] : chant.textZh.split('，')[0]}
                      </span>
                      <span style={{ fontSize: '1rem', color: '#111827', fontWeight: '800' }}>
                        {isEn ? chant.textEn.split(' ➔ ')[1] : chant.textZh.split('，')[1]}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Display card for the selected Chant Example */}
              <div style={{
                background: 'white', borderRadius: '24px', padding: '14px', width: '100%',
                border: '2.5px solid #fbcfe8', minHeight: '120px', display: 'flex', flexDirection: 'column',
                justifyContent: 'center', boxShadow: '0 6px 20px rgba(255,93,158,0.06)'
              }}>
                {selectedChant ? (
                  <div className="bounce-in" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '700', color: '#db2777' }}>
                      <span>✨</span>
                      <span>{isEn ? 'Magic Explanation' : '魔法演示（以十几减 ' + selectedChant.minus + ' 为例）：'}</span>
                    </div>
                    
                    <div style={{
                      background: '#fff0f6', padding: '8px 12px', borderRadius: '14px',
                      fontSize: '0.85rem', color: '#4d122c', fontWeight: '600', lineHeight: 1.4
                    }}>
                      {isEn ? (
                        <div>
                          When calculating <strong>1{selectedChant.minus - 1} - {selectedChant.minus}</strong>:<br />
                          The units digit is <strong>{selectedChant.minus - 1}</strong>. According to our chant, just add <strong>{selectedChant.add}</strong> to it:<br />
                          <span style={{ color: '#db2777', fontSize: '1rem', fontWeight: '800' }}>
                            {selectedChant.minus - 1} + {selectedChant.add} = {selectedChant.minus - 1 + selectedChant.add}
                          </span>! So <strong>1{selectedChant.minus - 1} - {selectedChant.minus} = {selectedChant.minus - 1 + selectedChant.add}</strong>.
                        </div>
                      ) : (
                        <div>
                          比如计算 <strong>1{selectedChant.minus - 1} - {selectedChant.minus}</strong>：<br />
                          个位是 <strong>{selectedChant.minus - 1}</strong>，直接加 <strong>{selectedChant.add}</strong>！<br />
                          算一算：<span style={{ color: '#db2777', fontSize: '1rem', fontWeight: '800' }}>{selectedChant.minus - 1} + {selectedChant.add} = {selectedChant.minus - 1 + selectedChant.add}</span>，所以得数是 <strong>{selectedChant.minus - 1 + selectedChant.add}</strong> 哦！
                          <div style={{ fontSize: '0.72rem', opacity: 0.75, marginTop: '4px', fontStyle: 'italic' }}>
                            原理：1{selectedChant.minus - 1}分成10和{selectedChant.minus - 1}。10 - {selectedChant.minus} = {selectedChant.add}，再加上个位{selectedChant.minus - 1}就是{selectedChant.minus - 1 + selectedChant.add}。
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{ color: '#c07090', fontSize: '0.85rem', fontStyle: 'italic', textAlign: 'center', padding: '16px' }}>
                    {isEn ? '💡 Tap any chant card to see how it works!' : '💡 点击上方的口诀卡片，看看它是怎么神奇工作的吧！'}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      )}

      {/* ============================================================
          TAB 2: SMART PRACTICE (强化练习)
          ============================================================ */}
      {activeTab === 'practice' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '380px', gap: '12px' }}>
          
          {/* Header Progress stats */}
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '92%', fontSize: '0.85rem', color: '#c0507a', fontWeight: '600' }}>
            <span>⭐ {isEn ? `Level: ${level}` : `当前难度：第 ${level} 关`}</span>
            <span>📝 {isEn ? `Total: ${sessionCount} · Correct: ${correctCount}` : `已答 ${sessionCount} 题 · 答对 ${correctCount} 题`}</span>
          </div>

          {/* Equation Display Box */}
          <div style={{
            background: 'rgba(255,255,255,0.9)', borderRadius: '28px', padding: '24px 20px',
            width: '100%', boxShadow: '0 8px 30px rgba(255,93,158,0.08)',
            border: '2.5px solid rgba(255,255,255,0.95)', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '16px'
          }}>
            
            {/* BIG EQUATION */}
            <div style={{
              fontSize: '2rem', fontWeight: '800', color: '#c0487a',
              display: 'flex', alignItems: 'center', gap: '12px'
            }}>
              <span style={{
                background: 'linear-gradient(135deg, #ffb5c8, #ff8fab)',
                color: 'white', borderRadius: '16px', padding: '4px 14px',
                boxShadow: '0 4px 12px rgba(255,93,158,0.25)',
              }}>{problem.num1}</span>
              <span>-</span>
              <span style={{
                background: 'linear-gradient(135deg, #a7f3d0, #34d399)',
                color: 'white', borderRadius: '16px', padding: '4px 14px',
                boxShadow: '0 4px 12px rgba(52,211,153,0.25)',
              }}>{problem.num2}</span>
              <span>=</span>
              <span style={{
                border: '3px dashed #ff85b8', borderRadius: '16px', padding: '4px 16px',
                color: '#ff5d9e', minWidth: '60px', textAlign: 'center',
              }}>
                {selectedAnswer !== null ? selectedAnswer : '？'}
              </span>
            </div>

            {/* Hint Trigger button */}
            {selectedAnswer === null && (
              <button
                onClick={() => { audioSynth.playClick(); setShowHint(p => !p); }}
                style={{
                  padding: '6px 14px', borderRadius: '14px', border: '1.5px solid #fbcfe8',
                  background: 'white', color: '#be185d', fontWeight: '600', fontSize: '0.78rem',
                  cursor: 'pointer', fontFamily: 'Fredoka, sans-serif',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)', transition: 'all 0.15s ease'
                }}>
                💡 {showHint ? (isEn ? 'Hide Hint' : '隐藏提示') : (isEn ? 'View Hint' : '看提示')}
              </button>
            )}

            {/* EXPLANATORY HINT DRAWER */}
            {showHint && selectedAnswer === null && (
              <div className="bounce-in" style={{
                width: '100%', background: '#fff0f6', padding: '10px 12px', borderRadius: '16px',
                border: '1.5px solid #fbcfe8', display: 'flex', flexDirection: 'column', gap: '6px'
              }}>
                
                {/* 1. Mnemonic Chant Hint */}
                <div style={{ fontSize: '0.8rem', color: '#db2777', fontWeight: '700', borderBottom: '1px solid #fbcfe8', paddingBottom: '4px' }}>
                  🎵 {isEn ? 'Chant Magic Suggestion:' : '口诀魔法提示：'}
                </div>
                
                {/* Find the chant */}
                {(() => {
                  const matchChant = CHANTS.find(c => c.minus === problem.num2);
                  if (!matchChant) return null;
                  const unitDigit = problem.num1 - 10;
                  return (
                    <div style={{ fontSize: '0.82rem', color: '#4d122c', fontWeight: '600', lineHeight: 1.35 }}>
                      {isEn ? (
                        <div>
                          <strong>{matchChant.textEn}</strong><br />
                          The unit digit of {problem.num1} is <strong>{unitDigit}</strong>. Add <strong>{matchChant.add}</strong> to it:<br />
                          <span style={{ color: '#db2777', fontWeight: '700' }}>{unitDigit} + {matchChant.add} = {unitDigit + matchChant.add}</span>!
                        </div>
                      ) : (
                        <div>
                          <strong>“{matchChant.textZh}”</strong><br />
                          {problem.num1}的个位是 <strong>{unitDigit}</strong>，加上 <strong>{matchChant.add}</strong>：<br />
                          算一算：<span style={{ color: '#db2777', fontWeight: '700' }}>{unitDigit} + {matchChant.add} = {unitDigit + matchChant.add}</span>，得数就是它哦！
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* 2. Mini Breaking Ten Tree Diagram */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '4px' }}>
                  <svg width="80" height="20">
                    <line x1="40" y1="0" x2="20" y2="18" stroke="#ff5d9e" strokeWidth="2" strokeDasharray="2,2" />
                    <line x1="40" y1="0" x2="60" y2="18" stroke="#ff5d9e" strokeWidth="2" strokeDasharray="2,2" />
                  </svg>
                  <div style={{ display: 'flex', gap: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    <span style={{ color: '#059669', background: '#ecfdf5', padding: '1px 6px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>10</span>
                    <span style={{ color: '#d97706', background: '#fff7ed', padding: '1px 6px', borderRadius: '8px', border: '1px solid #fed7aa' }}>{problem.num1 - 10}</span>
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* CHOICE BUTTONS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%', maxWidth: '360px' }}>
            {problem.choices.map(val => {
              let bg = 'white', border = '#f5c0d0', color = '#c06080';
              if (selectedAnswer !== null) {
                if (val === problem.answer) { bg = '#f0fdf4'; border = '#4ade80'; color = '#16a34a'; }
                else if (val === selectedAnswer) { bg = '#fef2f2'; border = '#f87171'; color = '#dc2626'; }
              }
              return (
                <button
                  key={val}
                  onClick={() => handleChoice(val)}
                  style={{
                    padding: '16px', borderRadius: '20px',
                    border: `3px solid ${border}`, background: bg, color,
                    fontWeight: '600', fontSize: '1.4rem',
                    cursor: selectedAnswer !== null ? 'default' : 'pointer',
                    fontFamily: 'Fredoka, sans-serif',
                    boxShadow: '0 4px 12px rgba(255,93,158,0.06)',
                    transition: 'all 0.15s ease',
                  }}>
                  {val}
                </button>
              );
            })}
          </div>

          {/* POST-ANSWER FEEDBACK PANEL */}
          {selectedAnswer !== null && (
            <div className="bounce-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', width: '100%' }}>
              
              {/* Correction Status Banner */}
              <div style={{
                fontSize: '1rem', fontWeight: '700', textAlign: 'center',
                color: selectedAnswer === problem.answer ? '#16a34a' : '#dc2626'
              }}>
                {selectedAnswer === problem.answer
                  ? (isEn ? `🌟 Splendid! ${problem.num1} - ${problem.num2} = ${problem.answer}!` : `🌟 太棒啦！${problem.num1} - ${problem.num2} = ${problem.answer}！`)
                  : (isEn ? `💡 Let's check it! ${problem.num1} - ${problem.num2} = ${problem.answer}!` : `💡 没关系，我们来学习它！${problem.num1} - ${problem.num2} = ${problem.answer}！`)}
              </div>

              {/* Explaining breakdown showing when wrong or auto-advance is off */}
              <div style={{
                background: 'white', border: '1.5px solid #fbcfe8', borderRadius: '18px',
                padding: '10px 14px', width: '100%', fontSize: '0.8rem', color: '#4d122c',
                fontWeight: '600', lineHeight: 1.4, boxShadow: '0 4px 10px rgba(0,0,0,0.02)'
              }}>
                {(() => {
                  const matchChant = CHANTS.find(c => c.minus === problem.num2);
                  const unitDigit = problem.num1 - 10;
                  return (
                    <div>
                      {isEn ? (
                        <div>
                          <strong>Method (Break Ten):</strong><br />
                          1. Subtract from 10: 10 - {problem.num2} = {10 - problem.num2}.<br />
                          2. Add back unit {unitDigit}: {10 - problem.num2} + {unitDigit} = {problem.answer}.<br />
                          {matchChant && (
                            <span style={{ display: 'block', marginTop: '4px', color: '#be185d' }}>
                              💡 Chant rule: {matchChant.textEn} ({unitDigit} + {matchChant.add} = {problem.answer})
                            </span>
                          )}
                        </div>
                      ) : (
                        <div>
                          <strong>计算解析（破十法）：</strong><br />
                          1. 先用 10 去减：10 - {problem.num2} = {10 - problem.num2}。<br />
                          2. 加上个位数 {unitDigit}：{10 - problem.num2} + {unitDigit} = {problem.answer}。<br />
                          {matchChant && (
                            <span style={{ display: 'block', marginTop: '4px', color: '#be185d' }}>
                              💡 口诀捷径：“{matchChant.textZh}” (即个位 {unitDigit} 加 {matchChant.add} 等于 {problem.answer}！)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Next Problem Button (if autoAdvance is off) */}
              {!autoAdvance && (
                <button
                  onClick={nextProblem}
                  style={{
                    padding: '8px 24px', fontSize: '1rem', fontWeight: '600', color: 'white',
                    background: 'linear-gradient(135deg, #ff758c, #ff7eb3)', border: 'none',
                    borderRadius: '16px', boxShadow: '0 4px 12px rgba(255,117,140,0.3)',
                    cursor: 'pointer', fontFamily: 'Fredoka, sans-serif',
                    transition: 'all 0.15s ease'
                  }}>
                  {isEn ? 'Next Question ➔' : '下一题 ➔'}
                </button>
              )}

            </div>
          )}

        </div>
      )}

    </div>
  );
}

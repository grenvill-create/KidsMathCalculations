import React, { useState, useEffect, useCallback } from 'react';
import { audioSynth } from '../utils/audioSynth';

function generateProblem(level) {
  if (level === 1) {
    // Given a 2-digit number, ask how many tens and ones
    const num = Math.floor(Math.random() * 89) + 11; // 11-99
    const tens = Math.floor(num / 10);
    const ones = num % 10;
    return { mode: 'decompose', num, tens, ones };
  } else if (level === 2) {
    // Given tens and ones, what is the number?
    const tens = Math.floor(Math.random() * 9) + 1; // 1-9
    const ones = Math.floor(Math.random() * 10);    // 0-9
    const num = tens * 10 + ones;
    return { mode: 'compose', num, tens, ones };
  } else {
    // Mixed + comparison: which number has more tens?
    const a = Math.floor(Math.random() * 89) + 11;
    const b = Math.floor(Math.random() * 89) + 11;
    const tensA = Math.floor(a / 10);
    const tensB = Math.floor(b / 10);
    const mode = tensA === tensB ? 'compose' : 'compare'; // avoid ties in compare
    if (mode === 'compare') {
      const answer = tensA > tensB ? 'left' : 'right';
      return { mode: 'compare', a, b, tensA, tensB, answer };
    }
    const tens = Math.floor(Math.random() * 9) + 1;
    const ones = Math.floor(Math.random() * 10);
    return { mode: 'compose', num: tens * 10 + ones, tens, ones };
  }
}

const BLOCK_COLORS = {
  tens: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
  ones: 'linear-gradient(135deg, #f9a8d4, #ec4899)',
};

export default function PlaceValueGame({ lang = 'zh', onBack }) {
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [problem, setProblem] = useState(null);
  const [tensInput, setTensInput] = useState('');
  const [onesInput, setOnesInput] = useState('');
  const [numInput, setNumInput] = useState('');
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong'
  const [showHint, setShowHint] = useState(false);
  const [activeKey, setActiveKey] = useState('tens'); // which field is being filled

  const zh = lang === 'zh';

  const newProblem = useCallback(() => {
    setProblem(generateProblem(level));
    setTensInput('');
    setOnesInput('');
    setNumInput('');
    setFeedback(null);
    setShowHint(false);
    setActiveKey('tens');
  }, [level]);

  useEffect(() => { newProblem(); }, [newProblem]);

  const handlePad = (val) => {
    audioSynth.playClick();
    if (feedback) return;
    if (problem.mode === 'compose') {
      setNumInput(prev => prev.length < 3 ? prev + val : prev);
    } else if (problem.mode === 'decompose') {
      if (activeKey === 'tens') {
        setTensInput(prev => prev.length < 2 ? prev + val : prev);
      } else {
        setOnesInput(prev => prev.length < 2 ? prev + val : prev);
      }
    }
  };

  const handleClear = () => {
    audioSynth.playClick();
    if (problem.mode === 'compose') setNumInput('');
    else if (activeKey === 'tens') setTensInput('');
    else setOnesInput('');
  };

  const handleCompareSelect = (side) => {
    if (feedback) return;
    const correct = problem.answer === side;
    if (correct) {
      audioSynth.playCorrect();
      setFeedback('correct');
      setStreak(s => s + 1);
      if (streak + 1 >= 4 && level < 3) setLevel(l => l + 1);
    } else {
      audioSynth.playIncorrect();
      setFeedback('wrong');
      setStreak(0);
    }
  };

  const handleSubmit = () => {
    if (!problem || feedback) return;
    let correct = false;
    if (problem.mode === 'decompose') {
      correct = parseInt(tensInput) === problem.tens && parseInt(onesInput) === problem.ones;
    } else if (problem.mode === 'compose') {
      correct = parseInt(numInput) === problem.num;
    }
    if (correct) {
      audioSynth.playCorrect();
      setFeedback('correct');
      setStreak(s => s + 1);
      if (streak + 1 >= 4 && level < 3) setLevel(l => l + 1);
    } else {
      audioSynth.playIncorrect();
      setFeedback('wrong');
      setStreak(0);
    }
  };

  if (!problem) return null;

  const cardStyle = {
    background: 'rgba(255,255,255,0.88)',
    backdropFilter: 'blur(16px)',
    borderRadius: '28px',
    padding: '24px 20px',
    border: '2px solid rgba(255,255,255,0.7)',
    boxShadow: '0 8px 32px rgba(255,93,158,0.12)',
    width: '92%',
    maxWidth: '380px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  };

  const blockContainerStyle = { display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '4px' };
  const blockStyle = (color) => ({
    width: '36px', height: '36px', borderRadius: '10px',
    background: color, boxShadow: '0 3px 6px rgba(0,0,0,0.15)',
    border: '2px solid rgba(255,255,255,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.1rem', color: 'white', fontWeight: '700',
  });

  const inputBox = (val, active, label, onClick) => (
    <div
      onClick={onClick}
      style={{
        width: '80px', textAlign: 'center', cursor: 'pointer',
      }}
    >
      <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#a78bfa', marginBottom: '4px' }}>{label}</div>
      <div style={{
        height: '56px', borderRadius: '16px', border: `3px solid ${active ? '#7c3aed' : '#e0d7f8'}`,
        background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '2rem', fontWeight: '800', color: '#5b21b6',
        boxShadow: active ? '0 0 0 4px rgba(124,58,237,0.2)' : 'none',
        transition: 'all 0.2s',
      }}>
        {val || <span style={{ opacity: 0.25 }}>?</span>}
      </div>
    </div>
  );

  const renderVisualBlocks = (count, color, emoji) => (
    <div style={blockContainerStyle}>
      {Array.from({ length: Math.min(count, 10) }).map((_, i) => (
        <div key={i} style={blockStyle(color)}>{emoji}</div>
      ))}
    </div>
  );

  return (
    <div className="screen-wrapper fade-in" style={{ gap: '16px', paddingTop: '10px', paddingBottom: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '92%', maxWidth: '380px' }}>
        <button className="bouncy-button secondary" onClick={onBack} style={{ padding: '10px 16px' }}>
          🏠
        </button>
        <div style={{ flex: 1, textAlign: 'center', fontWeight: '700', fontSize: '1.1rem', color: '#5b21b6' }}>
          {zh ? '🔢 数位认知' : '🔢 Place Values'}
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #a78bfa, #7c3aed)', color: 'white',
          borderRadius: '50px', padding: '6px 14px', fontSize: '0.88rem', fontWeight: '700',
        }}>
          Lv {level}
        </div>
      </div>

      {/* Problem Card */}
      <div style={cardStyle}>

        {/* DECOMPOSE: given number → find tens + ones */}
        {problem.mode === 'decompose' && (
          <>
            <div style={{ fontSize: '1rem', color: '#7c3aed', fontWeight: '700' }}>
              {zh ? `请把 ${problem.num} 分拆成「个十」和「个一」` : `Break ${problem.num} into tens and ones`}
            </div>
            <div style={{ fontSize: '5rem', fontWeight: '900', color: '#5b21b6', lineHeight: 1 }}>
              {problem.num}
            </div>
            {showHint && (
              <div style={{ background: '#ede9fe', borderRadius: '16px', padding: '12px 18px', width: '100%', textAlign: 'center' }}>
                {renderVisualBlocks(problem.tens, BLOCK_COLORS.tens, '▓')}
                <div style={{ fontSize: '0.8rem', color: '#7c3aed', marginTop: '6px' }}>{problem.tens} {zh ? '个十' : 'tens'}</div>
                {problem.ones > 0 && <>
                  {renderVisualBlocks(problem.ones, BLOCK_COLORS.ones, '■')}
                  <div style={{ fontSize: '0.8rem', color: '#ec4899', marginTop: '4px' }}>{problem.ones} {zh ? '个一' : 'ones'}</div>
                </>}
              </div>
            )}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
              {inputBox(tensInput, activeKey === 'tens', zh ? '个十' : 'Tens', () => setActiveKey('tens'))}
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#7c3aed', paddingBottom: '8px' }}>+</div>
              {inputBox(onesInput, activeKey === 'ones', zh ? '个一' : 'Ones', () => setActiveKey('ones'))}
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#7c3aed', paddingBottom: '8px' }}>=</div>
              <div style={{ fontSize: '2rem', fontWeight: '900', color: '#5b21b6', paddingBottom: '8px' }}>{problem.num}</div>
            </div>
          </>
        )}

        {/* COMPOSE: given tens + ones → find number */}
        {problem.mode === 'compose' && (
          <>
            <div style={{ fontSize: '1rem', color: '#7c3aed', fontWeight: '700' }}>
              {zh
                ? `${problem.tens} 个十 + ${problem.ones} 个一 = ？`
                : `${problem.tens} tens + ${problem.ones} ones = ?`}
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                {renderVisualBlocks(problem.tens, BLOCK_COLORS.tens, '▓')}
                <div style={{ fontSize: '0.8rem', color: '#3b82f6', fontWeight: '700', marginTop: '4px' }}>{problem.tens} {zh ? '个十' : 'tens'}</div>
              </div>
              <div style={{ fontSize: '2rem', color: '#7c3aed', fontWeight: '700' }}>+</div>
              <div style={{ textAlign: 'center' }}>
                {problem.ones > 0
                  ? <>{renderVisualBlocks(problem.ones, BLOCK_COLORS.ones, '■')}<div style={{ fontSize: '0.8rem', color: '#ec4899', fontWeight: '700', marginTop: '4px' }}>{problem.ones} {zh ? '个一' : 'ones'}</div></>
                  : <div style={{ fontSize: '2rem', color: '#ec4899', fontWeight: '700' }}>0</div>}
              </div>
            </div>
            {inputBox(numInput, true, zh ? '这个数是？' : 'The number is?', () => {})}
          </>
        )}

        {/* COMPARE */}
        {problem.mode === 'compare' && (
          <>
            <div style={{ fontSize: '1rem', color: '#7c3aed', fontWeight: '700' }}>
              {zh ? '哪个数的"十位"更大？' : 'Which number has more tens?'}
            </div>
            <div style={{ display: 'flex', gap: '20px' }}>
              {[{ val: problem.a, side: 'left' }, { val: problem.b, side: 'right' }].map(({ val, side }) => (
                <button key={side} onClick={() => handleCompareSelect(side)} style={{
                  width: '110px', padding: '16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                  background: feedback
                    ? (problem.answer === side ? 'linear-gradient(135deg,#4ade80,#22c55e)' : 'linear-gradient(135deg,#fca5a5,#ef4444)')
                    : 'linear-gradient(135deg, #ddd6fe, #a78bfa)',
                  color: 'white', fontFamily: 'Fredoka, sans-serif', fontWeight: '800',
                  fontSize: '2.4rem', boxShadow: '0 4px 12px rgba(124,58,237,0.3)',
                  transform: feedback ? 'none' : 'scale(1)', transition: 'all 0.2s',
                }}>
                  {val}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Feedback */}
        {feedback && (
          <div style={{
            padding: '12px 20px', borderRadius: '16px', fontWeight: '700', fontSize: '1.1rem',
            background: feedback === 'correct' ? '#dcfce7' : '#fee2e2',
            color: feedback === 'correct' ? '#16a34a' : '#dc2626',
          }}>
            {feedback === 'correct'
              ? (zh ? '🌟 答对啦！太棒了！' : '🌟 Correct! Amazing!')
              : (zh ? `💡 答案是: ${problem.mode === 'decompose' ? `${problem.tens}个十 + ${problem.ones}个一` : problem.num}` : `💡 Answer: ${problem.mode === 'decompose' ? `${problem.tens} tens + ${problem.ones} ones` : problem.num}`)}
          </div>
        )}
      </div>

      {/* Hint Button */}
      {!feedback && problem.mode !== 'compare' && (
        <button className="bouncy-button secondary" onClick={() => setShowHint(h => !h)} style={{ fontSize: '0.9rem', padding: '8px 18px' }}>
          {zh ? (showHint ? '🙈 隐藏提示' : '💡 看提示') : (showHint ? '🙈 Hide Hint' : '💡 Show Hint')}
        </button>
      )}

      {/* Numpad */}
      {problem.mode !== 'compare' && !feedback && (
        <div className="keypad-grid" style={{ maxWidth: '340px' }}>
          {['1','2','3','4','5','6','7','8','9','C','0','✓'].map(k => (
            <button key={k} className={`keypad-btn ${k === 'C' ? 'action-clear' : k === '✓' ? 'action-submit' : ''}`}
              onClick={() => k === 'C' ? handleClear() : k === '✓' ? handleSubmit() : handlePad(k)}>
              {k}
            </button>
          ))}
        </div>
      )}

      {/* Next / Decompose: toggle active field */}
      {problem.mode === 'decompose' && !feedback && (
        <button className="bouncy-button secondary" onClick={() => setActiveKey(k => k === 'tens' ? 'ones' : 'tens')} style={{ fontSize: '0.9rem', padding: '8px 20px' }}>
          {zh ? `✏️ 正在填：${activeKey === 'tens' ? '个十' : '个一'}` : `✏️ Filling: ${activeKey === 'tens' ? 'Tens' : 'Ones'}`}
        </button>
      )}

      {feedback && (
        <button className="bouncy-button primary" onClick={newProblem} style={{ padding: '14px 32px', fontSize: '1.1rem' }}>
          {zh ? '下一题 ➔' : 'Next ➔'}
        </button>
      )}
    </div>
  );
}

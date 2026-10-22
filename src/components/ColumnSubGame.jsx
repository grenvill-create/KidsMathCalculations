import React, { useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { audioSynth } from '../utils/audioSynth';

// ── 生成退位减法题目 ──
function generateProblem(type = 'mixed') {
  let aTens, aOnes, bTens, bOnes;

  if (type === 'two_minus_one') {
    // 两位数减一位数退位 (如 32 - 7, 45 - 8)
    aTens = Math.floor(Math.random() * 5) + 2; // 2..6
    aOnes = Math.floor(Math.random() * 5); // 0..4
    bTens = 0;
    bOnes = Math.floor(Math.random() * (9 - aOnes)) + (aOnes + 1); // aOnes+1..9
  } else if (type === 'tens_sub') {
    // 整十数减法 (如 50 - 24, 60 - 8)
    aTens = Math.floor(Math.random() * 5) + 3; // 3..7
    aOnes = 0;
    bTens = Math.random() > 0.4 ? Math.floor(Math.random() * (aTens - 2)) + 1 : 0;
    bOnes = Math.floor(Math.random() * 9) + 1;
  } else {
    // 两位数减两位数退位 (如 52 - 28, 64 - 37, 73 - 48)
    aTens = Math.floor(Math.random() * 5) + 3; // 3..7
    aOnes = Math.floor(Math.random() * 5); // 0..4
    bTens = Math.floor(Math.random() * (aTens - 1)) + 1; // 1..aTens-1
    bOnes = Math.floor(Math.random() * (9 - aOnes)) + (aOnes + 1);
  }

  const a = aTens * 10 + aOnes;
  const b = bTens * 10 + bOnes;
  const complement = 10 - bOnes; // 减数尾巴的补位数（和减数个位凑成10的数）

  return {
    id: Date.now() + Math.random(),
    a,
    b,
    aTens,
    aOnes,
    bTens,
    bOnes,
    complement,
    ansTens: aTens - bTens - 1, // 口诀：头减头减1
    ansOnes: aOnes + complement, // 口诀：尾加尾（尾的补位数）
    answer: a - b,
  };
}

// 生成一组循序渐进的5道每日题目（前2道两位数减一位数，第3道整十数，后2道两位数减两位数）
function generateDaily5() {
  return [
    generateProblem('two_minus_one'),
    generateProblem('two_minus_one'),
    generateProblem('tens_sub'),
    generateProblem('two_minus_two'),
    generateProblem('two_minus_two'),
  ];
}

// 选项生成器（包含正确答案和邻近干扰项）
function makeOptions(correct) {
  const opts = new Set([correct]);
  while (opts.size < 3) {
    const v = correct + Math.floor(Math.random() * 5) - 2;
    if (v >= 0 && v <= 9) opts.add(v);
  }
  return Array.from(opts).sort((x, y) => x - y);
}

// 获取今天本地日期字符串 YYYY-MM-DD
function getTodayDateStr() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ── 醒目的口诀展示卡（每次做题都显示）──
const MnemonicBanner = ({ activeHighlight = null }) => {
  const isHeadActive = activeHighlight === 'head';
  const isTailActive = activeHighlight === 'tail';

  return (
    <div style={{
      width: '100%',
      background: 'linear-gradient(135deg, #fdf4ff 0%, #fae8ff 50%, #f3e8ff 100%)',
      border: '2.5px solid #d8b4fe',
      borderRadius: '20px',
      padding: '12px 14px',
      boxShadow: '0 4px 14px rgba(168, 85, 247, 0.12)',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      alignItems: 'center',
      position: 'relative',
    }}>
      {/* 徽章标题 */}
      <div style={{
        background: 'linear-gradient(135deg, #a855f7, #9333ea)',
        color: 'white',
        borderRadius: '50px',
        padding: '2px 12px',
        fontSize: '0.78rem',
        fontWeight: '800',
        letterSpacing: '0.5px',
        boxShadow: '0 2px 6px rgba(147, 51, 234, 0.3)'
      }}>
        ✨ 退位减法速算秘籍 ✨
      </div>

      {/* 口诀公式 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '4px 8px',
        fontSize: '1.05rem',
        fontWeight: '900',
        textAlign: 'center',
        lineHeight: 1.4,
      }}>
        <span style={{
          padding: '3px 8px',
          borderRadius: '10px',
          background: isHeadActive ? '#4f46e5' : 'rgba(79, 70, 229, 0.1)',
          color: isHeadActive ? 'white' : '#4338ca',
          border: isHeadActive ? '2px solid #818cf8' : '1.5px solid rgba(79, 70, 229, 0.25)',
          boxShadow: isHeadActive ? '0 0 12px rgba(79, 70, 229, 0.4)' : 'none',
          transform: isHeadActive ? 'scale(1.06)' : 'scale(1)',
          transition: 'all 0.3s ease',
        }}>
          头减头减1 = 头
        </span>

        <span style={{ color: '#9333ea', fontSize: '1.2rem', fontWeight: '900' }}>；</span>

        <span style={{
          padding: '3px 8px',
          borderRadius: '10px',
          background: isTailActive ? '#ea580c' : 'rgba(234, 88, 12, 0.1)',
          color: isTailActive ? 'white' : '#c2410c',
          border: isTailActive ? '2px solid #fb923c' : '1.5px solid rgba(234, 88, 12, 0.25)',
          boxShadow: isTailActive ? '0 0 12px rgba(234, 88, 12, 0.4)' : 'none',
          transform: isTailActive ? 'scale(1.06)' : 'scale(1)',
          transition: 'all 0.3s ease',
        }}>
          尾 + 尾（尾的补位数）= 尾
        </span>
      </div>

      {/* 注释 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '4px 10px',
        fontSize: '0.74rem',
        color: '#6b21a8',
        fontWeight: '700',
        marginTop: '2px',
        opacity: 0.9,
      }}>
        <span>🟣 <b>“头”</b> = 十位</span>
        <span>•</span>
        <span>🟠 <b>“尾”</b> = 个位</span>
        <span>•</span>
        <span>🟢 <b>“补位数”</b> = 和它凑成10的数（如7的补数是3）</span>
      </div>
    </div>
  );
};

// ── 分步竖式指导组件 (Step-by-Step Column Guide) ──
function ColumnGuide({ problem, zh, lang, onSolved, onNext }) {
  const { a, b, aTens, aOnes, bTens, bOnes, complement, ansTens, ansOnes, answer } = problem;
  
  const [step, setStep] = useState('check');
  const [hint, setHint] = useState('');

  const onesOptions = useMemo(() => makeOptions(ansOnes), [ansOnes]);
  const tensOptions = useMemo(() => makeOptions(ansTens), [ansTens]);
  const compOptions = useMemo(() => makeOptions(complement), [complement]);

  const borrowed = step !== 'check' && step !== 'borrow';
  const onesDone = step === 'calc_head' || step === 'done';
  const tensDone = step === 'done';

  const activeMnemonic = useMemo(() => {
    if (step === 'find_comp' || step === 'calc_tail') return 'tail';
    if (step === 'borrow' || step === 'calc_head') return 'head';
    return null;
  }, [step]);

  useEffect(() => {
    audioSynth.speak(
      zh 
        ? `用竖式算 ${a} 减 ${b}。先看个位：${aOnes} 减 ${bOnes}，够不够减？`
        : `Column method: ${a} minus ${b}. Look at the ones: can ${aOnes} minus ${bOnes}?`,
      lang
    );
  }, [problem.id, a, b, aOnes, bOnes, zh, lang]);

  const handleCheck = (enough) => {
    audioSynth.playClick();
    if (!enough) {
      audioSynth.playCorrect();
      setHint('');
      setStep('borrow');
      audioSynth.speak(
        zh 
          ? `对！不够减。个位不够减，向十位借 1 当 10！点击十位上的 ${aTens} 点上退位点！` 
          : `Right! Not enough. Borrow 1 from tens! Tap the ${aTens}!`,
        lang
      );
    } else {
      audioSynth.playIncorrect();
      setHint(zh ? `个位只有 ${aOnes}，拿不出 ${bOnes} 个，不够减哦！选“不够减”试试！` : `${aOnes} is less than ${bOnes}, choose Not Enough!`);
    }
  };

  const handleBorrow = () => {
    if (step !== 'borrow') return;
    audioSynth.playClick();
    audioSynth.playLevelUp();
    setStep('find_comp');
    audioSynth.speak(
      zh 
        ? `借走 1，十位点上红色的退位点！减数的尾巴是 ${bOnes}，它的补位数（凑十好朋友）是几？` 
        : `Borrowed 1! The subtrahend's tail is ${bOnes}. What is its complement to 10?`,
      lang
    );
  };

  const handleCompPick = (val) => {
    audioSynth.playClick();
    if (val === complement) {
      audioSynth.playCorrect();
      setHint('');
      setStep('calc_tail');
      audioSynth.speak(
        zh 
          ? `太棒啦！${bOnes} 加 ${val} 等于 10，补位数就是 ${val}！现在用口诀：“尾加尾的补位数等于尾”！` 
          : `Great! ${bOnes} plus ${val} is 10. Tail plus complement!`,
        lang
      );
    } else {
      audioSynth.playIncorrect();
      setHint(zh ? `想想看：${bOnes} 加上几等于 10 呢？` : `Hint: ${bOnes} + ? = 10`);
    }
  };

  const handleOnesPick = (val) => {
    audioSynth.playClick();
    if (val === ansOnes) {
      audioSynth.playCorrect();
      setHint('');
      setStep('calc_head');
      audioSynth.speak(
        zh 
          ? `算对啦！个位写 ${val}！现在看十位，因为借走了一个十，用口诀：“头减头减1等于头”！` 
          : `Correct! Ones is ${val}. Now rule: Head minus Head minus 1!`,
        lang
      );
    } else {
      audioSynth.playIncorrect();
      setHint(zh ? `念口诀：“尾加补数”：原本的尾巴 ${aOnes} 加上补位数 ${complement} = ？` : `Tail ${aOnes} + complement ${complement} = ?`);
    }
  };

  const handleTensPick = (val) => {
    audioSynth.playClick();
    if (val === ansTens) {
      audioSynth.playCorrect();
      setHint('');
      setStep('done');
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      onSolved();
      audioSynth.speak(
        zh 
          ? `真厉害！${a} 减 ${b} 等于 ${answer}！头减头减1，尾加补数，口诀太好用啦！` 
          : `Amazing! ${a} minus ${b} is ${answer}!`,
        lang
      );
    } else {
      audioSynth.playIncorrect();
      setHint(zh ? `注意十位头上有点：${aTens} 先减去被借走的 1，再减 ${bTens} 哦！` : `Don't forget the borrow dot!`);
    }
  };

  const CELL = 74;
  const onesHL = step === 'check' || step === 'find_comp' || step === 'calc_tail';
  const tensHL = step === 'borrow' || step === 'calc_head';
  const colBg = (hl, color) => (hl ? color : 'transparent');
  const digitStyle = { fontSize: '2.8rem', fontWeight: '900', fontFamily: 'Fredoka, sans-serif', lineHeight: 1 };
  
  const cell = (hl, color, extra = {}) => ({
    display: 'flex', justifyContent: 'center', alignItems: 'center', height: '62px',
    background: colBg(hl, color), color: '#1e1b4b', ...extra,
  });

  const optBtn = (borderColor, textColor = '#1e1b4b') => ({
    width: '62px', height: '52px', borderRadius: '16px', background: 'white',
    border: `2.5px solid ${borderColor}`, color: textColor, fontSize: '1.4rem', fontWeight: '900', cursor: 'pointer',
    boxShadow: '0 3px 8px rgba(0,0,0,0.06)'
  });

  return (
    <div style={{
      width: '94%', maxWidth: '540px', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(16px)',
      borderRadius: '24px', border: '2.5px solid #c7d2fe', padding: '16px',
      display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center',
      boxShadow: '0 10px 30px rgba(79, 70, 229, 0.12)'
    }}>
      <MnemonicBanner activeHighlight={activeMnemonic} />

      {/* ── 横式题目显示 (让小朋友一眼看懂横式算式与竖式的对应) ── */}
      <div style={{
        width: '100%',
        background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)',
        border: '2px solid #a5b4fc',
        borderRadius: '18px',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 3px 10px rgba(99, 102, 241, 0.1)',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            fontSize: '0.82rem', fontWeight: '800', color: '#4f46e5',
            background: 'white', padding: '3px 10px', borderRadius: '8px',
            border: '1.5px solid #c7d2fe', boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
          }}>
            📖 横式
          </span>
        </div>

        <div style={{
          display: 'flex', alignItems: 'baseline', gap: '8px',
          fontSize: '2rem', fontWeight: '900', color: '#3730a3',
          fontFamily: 'Fredoka, sans-serif'
        }}>
          <span>{a}</span>
          <span style={{ color: '#ef4444' }}>−</span>
          <span>{b}</span>
          <span style={{ color: '#6366f1' }}>＝</span>
          <div style={{
            minWidth: '64px', height: '44px', padding: '0 10px',
            background: 'white', borderRadius: '12px',
            border: '2.5px dashed #6366f1', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            color: '#16a34a', fontSize: '1.8rem', fontWeight: '900',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)'
          }}>
            {tensDone && onesDone ? answer : onesDone ? `?${ansOnes}` : '?'}
          </div>
        </div>

        <div style={{
          fontSize: '0.78rem', color: '#6366f1', fontWeight: '800',
          background: '#e0e7ff', padding: '3px 8px', borderRadius: '8px'
        }}>
          ⬇️ 竖式计算
        </div>
      </div>

      {/* 竖式作业本 */}
      <div style={{
        background: '#fffef7', borderRadius: '20px', padding: '14px 24px 10px',
        border: '2px solid #e2e8f0', boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.05)',
        position: 'relative'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: `44px ${CELL}px ${CELL}px`, rowGap: '2px' }}>
          <div />
          <div style={{ textAlign: 'center', fontSize: '0.8rem', fontWeight: '800', color: '#4f46e5' }}>🟣 头(十位)</div>
          <div style={{ textAlign: 'center', fontSize: '0.8rem', fontWeight: '800', color: '#ea580c' }}>🟠 尾(个位)</div>

          {/* 退位点行 */}
          <div style={{ height: '18px' }} />
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '18px', background: colBg(tensHL, '#e0e7ff'), borderRadius: '10px 10px 0 0' }}>
            {borrowed && (
              <div className="bounce-in" style={{
                width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444',
                boxShadow: '0 0 8px #ef4444', border: '1.5px solid white'
              }} title="退位点" />
            )}
          </div>
          <div style={{ height: '18px', background: colBg(onesHL, '#ffedd5'), borderRadius: '10px 10px 0 0' }} />

          {/* 被减数 */}
          <div />
          <div onClick={handleBorrow} style={cell(tensHL, '#e0e7ff', { position: 'relative', cursor: step === 'borrow' ? 'pointer' : 'default' })}>
            <span style={{
              ...digitStyle, padding: '0 8px', borderRadius: '14px',
              outline: step === 'borrow' ? '3px dashed #f59e0b' : 'none',
              animation: step === 'borrow' ? 'bounceSlow 1s infinite' : 'none'
            }}>{aTens}</span>
            {borrowed && (
              <>
                <div style={{ position: 'absolute', width: '42px', height: '3.5px', background: '#ef4444', transform: 'rotate(-55deg)', borderRadius: '2px' }} />
                <span className="bounce-in" style={{ position: 'absolute', top: '-4px', right: '4px', fontSize: '1.15rem', fontWeight: '900', color: '#ef4444' }}>{aTens - 1}</span>
              </>
            )}
          </div>
          <div style={cell(onesHL, '#ffedd5')}>
            {borrowed && (
              <span className="bounce-in" style={{ fontSize: '1.25rem', fontWeight: '900', color: '#ef4444', alignSelf: 'flex-start', marginTop: '6px', marginRight: '2px' }}>1</span>
            )}
            <span style={digitStyle}>{aOnes}</span>
          </div>

          {/* 减数 */}
          <div style={{ ...digitStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', height: '62px' }}>−</div>
          <div style={cell(tensHL, '#e0e7ff')}>
            <span style={digitStyle}>{bTens > 0 ? bTens : ''}</span>
          </div>
          <div style={cell(onesHL, '#ffedd5', { position: 'relative' })}>
            <span style={digitStyle}>{bOnes}</span>
            {(step === 'find_comp' || step === 'calc_tail') && (
              <span className="bounce-in" style={{
                position: 'absolute', right: '-12px', top: '4px', background: '#16a34a', color: 'white',
                borderRadius: '50px', padding: '1px 6px', fontSize: '0.68rem', fontWeight: '800'
              }}>
                补数{complement}
              </span>
            )}
          </div>

          {/* 分割线 */}
          <div style={{ gridColumn: '1 / span 3', height: '4px', background: '#1e1b4b', borderRadius: '2px', margin: '2px 0' }} />

          {/* 结果 */}
          <div />
          <div style={cell(tensHL, '#e0e7ff', { borderRadius: '0 0 10px 10px' })}>
            {tensDone && <span className="bounce-in" style={{ ...digitStyle, color: ansTens === 0 ? '#94a3b8' : '#16a34a' }}>{ansTens}</span>}
          </div>
          <div style={cell(onesHL, '#ffedd5', { borderRadius: '0 0 10px 10px' })}>
            {onesDone && <span className="bounce-in" style={{ ...digitStyle, color: '#16a34a' }}>{ansOnes}</span>}
          </div>
        </div>
      </div>

      {/* 步骤交互面板 */}
      {step === 'check' && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', width: '100%' }}>
          <div style={{ background: '#fff7ed', border: '2px solid #fdba74', borderRadius: '16px', padding: '10px 16px', textAlign: 'center', color: '#9a3412', fontWeight: '800', fontSize: '0.96rem' }}>
            第①步：看个位尾巴，<b>{aOnes} 减 {bOnes}</b> 够不够减？
          </div>
          <div style={{ display: 'flex', gap: '14px' }}>
            <button className="bouncy-button secondary" onClick={() => handleCheck(true)} style={{ padding: '10px 22px', borderRadius: '16px' }}>✅ 够减</button>
            <button className="bouncy-button primary" onClick={() => handleCheck(false)} style={{ padding: '10px 22px', borderRadius: '16px', background: 'linear-gradient(135deg, #f97316, #ea580c)', borderColor: '#fdba74' }}>
              ❌ 不够减（借位）
            </button>
          </div>
        </div>
      )}

      {step === 'borrow' && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', width: '100%' }}>
          <div style={{ background: '#eef2ff', border: '2px solid #a5b4fc', borderRadius: '16px', padding: '10px 16px', textAlign: 'center', color: '#3730a3', fontWeight: '800', fontSize: '0.96rem' }}>
            第②步：不够减，向十位“头”借 1 当 10！<br />👆 请点击十位上的数字 <b style={{ color: '#f59e0b', fontSize: '1.2rem' }}>{aTens}</b>
          </div>
          <button className="bouncy-button primary" onClick={handleBorrow} style={{ padding: '11px 24px', borderRadius: '20px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', borderColor: '#fca5a5', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🔴</span><span>借 1 个十，点上退位点！</span>
          </button>
        </div>
      )}

      {step === 'find_comp' && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', background: '#f0fdf4', border: '2px solid #86efac', borderRadius: '18px', padding: '12px 16px', width: '100%' }}>
          <div style={{ fontWeight: '800', color: '#166534', fontSize: '0.96rem', textAlign: 'center', lineHeight: 1.4 }}>
            第③步：认识<b>“补位数”</b><br />减数的尾巴是 <b style={{ color: '#ea580c' }}>{bOnes}</b>，它和几凑成 10（补位数是几）？
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            {compOptions.map(opt => (
              <button key={opt} className="bouncy-button" onClick={() => handleCompPick(opt)} style={optBtn('#16a34a', '#166534')}>{opt}</button>
            ))}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: '700' }}>
            💡 凑十好朋友：{bOnes} ＋ <b>{complement}</b> ＝ 10
          </div>
        </div>
      )}

      {step === 'calc_tail' && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', background: '#fff7ed', border: '2px solid #fb923c', borderRadius: '18px', padding: '12px 16px', width: '100%' }}>
          <div style={{ background: '#ea580c', color: 'white', padding: '2px 12px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: '800' }}>
            口诀：尾 ＋ 尾（尾的补位数）＝ 尾
          </div>
          <div style={{ fontWeight: '800', color: '#9a3412', fontSize: '1rem', textAlign: 'center', lineHeight: 1.4 }}>
            原有的尾巴 <b style={{ color: '#ea580c' }}>{aOnes}</b> ＋ 补位数 <b style={{ color: '#16a34a' }}>{complement}</b> ＝ ？<br />
            <span style={{ fontSize: '1.2rem', color: '#c2410c' }}>{aOnes} ＋ {complement} ＝ [ ? ]</span>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            {onesOptions.map(opt => (
              <button key={opt} className="bouncy-button" onClick={() => handleOnesPick(opt)} style={optBtn('#ea580c', '#c2410c')}>{opt}</button>
            ))}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#b45309', textAlign: 'center' }}>
            💡 原理：借来的 10 减去 {bOnes} 剩下 {complement}，再加上原本的 {aOnes}！
          </div>
        </div>
      )}

      {step === 'calc_head' && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', background: '#eef2ff', border: '2px solid #818cf8', borderRadius: '18px', padding: '12px 16px', width: '100%' }}>
          <div style={{ background: '#4f46e5', color: 'white', padding: '2px 12px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: '800' }}>
            口诀：头 减 头 减 1 ＝ 头
          </div>
          <div style={{ fontWeight: '800', color: '#3730a3', fontSize: '1rem', textAlign: 'center', lineHeight: 1.4 }}>
            原有头 <b>{aTens}</b> − 减数头 <b>{bTens}</b> − 借走的 <b>1</b> ＝ ？<br />
            <span style={{ fontSize: '1.2rem', color: '#4338ca' }}>{aTens} − {bTens} − 1 ＝ [ ? ]</span>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            {tensOptions.map(opt => (
              <button key={opt} className="bouncy-button" onClick={() => handleTensPick(opt)} style={optBtn('#4f46e5', '#3730a3')}>{opt}</button>
            ))}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#4338ca', textAlign: 'center' }}>
            💡 原理：因为头上点了退位点🔴，借走了一个十，所以十位要多减 1！
          </div>
        </div>
      )}

      {step === 'done' && (
        <div className="bounce-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', background: '#f0fdf4', border: '2.5px solid #22c55e', borderRadius: '18px', padding: '14px', width: '100%' }}>
          <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#15803d', textAlign: 'center' }}>
            🌟 {a} − {b} ＝ {answer}
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', fontSize: '0.85rem', fontWeight: '800' }}>
            <span style={{ background: '#e0e7ff', color: '#4338ca', padding: '3px 10px', borderRadius: '8px' }}>
              头：{aTens} − {bTens} − 1 ＝ {ansTens}
            </span>
            <span style={{ background: '#ffedd5', color: '#c2410c', padding: '3px 10px', borderRadius: '8px' }}>
              尾：{aOnes} ＋ {complement} ＝ {ansOnes}
            </span>
          </div>
          <button className="bouncy-button primary" onClick={onNext} style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', padding: '12px 32px', borderRadius: '24px', fontSize: '1.1rem', marginTop: '4px' }}>
            下一题 ➔
          </button>
        </div>
      )}

      {hint && (
        <div className="fade-in" style={{ color: '#dc2626', fontWeight: '800', fontSize: '0.88rem', textAlign: 'center', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '6px 12px' }}>
          {hint}
        </div>
      )}
    </div>
  );
}

// ── 每日5题专属组件 (Daily 5 Questions with Streak & Stamp) ──
function Daily5Section({ zh, lang, onBack }) {
  const todayStr = useMemo(() => getTodayDateStr(), []);
  
  // 从 LocalStorage 读取今天的打卡状态与题目
  const [dailyState, setDailyState] = useState(() => {
    try {
      const saved = localStorage.getItem(`column_sub_daily_${todayStr}`);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}

    // 未做过，生成今日专属的5道题
    return {
      date: todayStr,
      questions: generateDaily5(),
      currentIndex: 0,
      completedCount: 0,
      isFinished: false,
    };
  });

  // 读取连续打卡天数
  const [streakDays, setStreakDays] = useState(() => {
    return parseInt(localStorage.getItem('column_sub_daily_streak_days') || '1', 10);
  });

  // 当前正在做的题目
  const currentQ = dailyState.questions[dailyState.currentIndex];

  // 保存进度
  const saveDailyProgress = useCallback((newState) => {
    setDailyState(newState);
    try {
      localStorage.setItem(`column_sub_daily_${todayStr}`, JSON.stringify(newState));
    } catch (e) {}
  }, [todayStr]);

  // 当做完一题
  const handleDailySolved = () => {
    const nextIdx = dailyState.currentIndex + 1;
    const isNowFinished = nextIdx >= 5;
    
    if (isNowFinished) {
      // 达成5题，累计打卡天数
      const newStreak = streakDays + (dailyState.isFinished ? 0 : 1);
      setStreakDays(newStreak);
      try {
        localStorage.setItem('column_sub_daily_streak_days', String(newStreak));
      } catch (e) {}

      confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 } });
      audioSynth.playLevelUp();
      audioSynth.speak(zh ? '太棒啦！今日 5 道退位减法全部打卡成功！' : 'Congratulations! Daily 5 completed!', lang);
    }

    saveDailyProgress({
      ...dailyState,
      completedCount: Math.min(5, dailyState.completedCount + 1),
      currentIndex: Math.min(4, nextIdx),
      isFinished: isNowFinished,
    });
  };

  // 再练一组（重新生成5道新题）
  const handleResetDaily = () => {
    audioSynth.playClick();
    const newQuestions = generateDaily5();
    saveDailyProgress({
      date: todayStr,
      questions: newQuestions,
      currentIndex: 0,
      completedCount: 0,
      isFinished: false,
    });
  };

  return (
    <div style={{
      width: '94%', maxWidth: '540px', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(16px)',
      borderRadius: '24px', border: '2.5px solid #c7d2fe', padding: '16px',
      display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center',
      boxShadow: '0 10px 30px rgba(79, 70, 229, 0.12)'
    }}>

      {/* ── 今日打卡进度条与状态 ── */}
      <div style={{
        width: '100%', background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
        border: '1.5px solid #c7d2fe', borderRadius: '18px', padding: '10px 14px',
        display: 'flex', flexDirection: 'column', gap: '8px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#3730a3' }}>
            📅 {todayStr} · 每日 5 题
          </div>
          <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#ea580c', display: 'flex', alignItems: 'center', gap: '2px' }}>
            <span>🔥 连续打卡</span>
            <span style={{ fontSize: '0.95rem' }}>{streakDays}</span>
            <span>天</span>
          </div>
        </div>

        {/* 5个徽章格子 */}
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'space-between' }}>
          {[0, 1, 2, 3, 4].map(idx => {
            const isDone = idx < dailyState.completedCount;
            const isCurrent = idx === dailyState.currentIndex && !dailyState.isFinished;

            return (
              <div
                key={idx}
                style={{
                  flex: 1, height: '36px', borderRadius: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '900', fontSize: '0.9rem',
                  background: isDone 
                    ? 'linear-gradient(135deg, #22c55e, #16a34a)' 
                    : isCurrent 
                      ? '#4f46e5' 
                      : '#cbd5e1',
                  color: 'white',
                  boxShadow: isCurrent ? '0 0 10px rgba(79, 70, 229, 0.4)' : 'none',
                  transform: isCurrent ? 'scale(1.06)' : 'scale(1)',
                  transition: 'all 0.25s ease'
                }}
              >
                {isDone ? '⭐' : `第${idx + 1}题`}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 如果今天5道题全部完成 ── */}
      {dailyState.isFinished ? (
        <div className="bounce-in" style={{
          width: '100%', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          border: '2.5px solid #22c55e', borderRadius: '20px', padding: '20px 16px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px'
        }}>
          <div style={{ fontSize: '3rem' }}>🏅</div>
          <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#15803d', textAlign: 'center' }}>
            🎉 今日打卡大成功！
          </div>
          <div style={{ fontSize: '0.9rem', color: '#166534', fontWeight: '700', textAlign: 'center', lineHeight: 1.4 }}>
            小朋友太棒了！已顺利完成今日 5 道退位减法练习。<br />
            记牢口诀：<b>“头减头减1，尾加补数”</b>！
          </div>

          {/* 今日做过的5道题清单回顾 */}
          <div style={{
            width: '100%', background: 'white', borderRadius: '14px', padding: '10px 14px',
            border: '1.5px solid #bbf7d0', display: 'flex', flexDirection: 'column', gap: '6px'
          }}>
            <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#15803d' }}>
              📋 今日练习回顾：
            </div>
            {dailyState.questions.map((q, i) => (
              <div key={q.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: '700', color: '#334155' }}>
                <span>第 {i + 1} 题：{q.a} − {q.b}</span>
                <span style={{ color: '#16a34a' }}>＝ {q.answer} ✅</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '6px' }}>
            <button
              className="bouncy-button secondary"
              onClick={handleResetDaily}
              style={{ flex: 1, padding: '12px', borderRadius: '18px', fontSize: '0.95rem' }}
            >
              🔄 再练一组 5 题
            </button>
            <button
              className="bouncy-button primary"
              onClick={onBack}
              style={{ flex: 1, padding: '12px', borderRadius: '18px', fontSize: '0.95rem', background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
            >
              🏠 返回主页
            </button>
          </div>
        </div>
      ) : (
        /* ── 正在做当前的题目（嵌入完整的竖式借位引导） ── */
        <ColumnGuide
          key={currentQ.id}
          problem={currentQ}
          zh={zh}
          lang={lang}
          onSolved={handleDailySolved}
          onNext={() => {}}
        />
      )}

    </div>
  );
}

// ── 主页面组件 ──
export default function ColumnSubGame({ lang = 'zh', onBack }) {
  const [level, setLevel] = useState(1);
  const [gameMode, setGameMode] = useState('daily'); // 默认'daily' (每日5题) | 'guide' (自由竖式) | 'speed' (口诀速算)
  const [problem, setProblem] = useState(null);
  const [streak, setStreak] = useState(0);
  const [guideSolved, setGuideSolved] = useState(false);

  const [speedTensInput, setSpeedTensInput] = useState('');
  const [speedOnesInput, setSpeedOnesInput] = useState('');
  const [speedFeedback, setSpeedFeedback] = useState(null);

  const zh = lang === 'zh';

  const nextProblem = useCallback(() => {
    setProblem(generateProblem('mixed'));
    setGuideSolved(false);
    setSpeedTensInput('');
    setSpeedOnesInput('');
    setSpeedFeedback(null);
  }, []);

  useEffect(() => { nextProblem(); }, [nextProblem]);

  const handleSpeedSubmit = () => {
    if (!speedTensInput || !speedOnesInput) return;
    const val = parseInt(speedTensInput) * 10 + parseInt(speedOnesInput);
    if (val === problem.answer) {
      audioSynth.playCorrect();
      setSpeedFeedback('correct');
      setStreak(s => s + 1);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } else {
      audioSynth.playIncorrect();
      setSpeedFeedback('wrong');
      setStreak(0);
    }
  };

  if (!problem) return null;

  const tabBtn = (active) => ({
    padding: '7px 12px', borderRadius: '12px', border: 'none', cursor: 'pointer',
    background: active ? '#4f46e5' : 'transparent',
    color: active ? 'white' : '#3730a3', fontWeight: '800', fontSize: '0.82rem',
    boxShadow: active ? '0 2px 8px rgba(79, 70, 229, 0.3)' : 'none',
    transition: 'all 0.2s ease',
  });

  return (
    <div className="screen-wrapper fade-in" style={{ gap: '12px', paddingTop: '10px', paddingBottom: '24px' }}>

      {/* ── Top Bar ── */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', width: '94%', maxWidth: '540px' }}>
        <button
          className="bouncy-button secondary"
          onClick={onBack}
          style={{ padding: '8px 14px', fontSize: '1.1rem', borderRadius: '16px' }}
        >
          🏠
        </button>

        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontWeight: '900', fontSize: '1.25rem', color: '#3730a3' }}>
            📝 {zh ? '竖式退位减法' : 'Column Subtraction'}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#6366f1', fontWeight: '700' }}>
            {zh ? '每日 5 题 · 口诀专练' : 'Daily 5 Practice'}
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: 'white', borderRadius: '50px',
          padding: '5px 12px', fontSize: '0.82rem', fontWeight: '700', boxShadow: '0 2px 6px rgba(79, 70, 229, 0.3)'
        }}>
          Lv {level}
        </div>
      </div>

      {/* ── Mode Switcher (每日5题 / 分步竖式 / 口诀速算) ── */}
      <div style={{ display: 'flex', gap: '8px', width: '94%', maxWidth: '540px', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.75)', borderRadius: '14px', padding: '3px', border: '1.5px solid #c7d2fe' }}>
          <button onClick={() => { audioSynth.playClick(); setGameMode('daily'); }} style={tabBtn(gameMode === 'daily')}>
            {zh ? '📅 每日5题' : 'Daily 5'}
          </button>
          <button onClick={() => { audioSynth.playClick(); setGameMode('guide'); }} style={tabBtn(gameMode === 'guide')}>
            {zh ? '📝 自由竖式' : 'Free Mode'}
          </button>
          <button onClick={() => { audioSynth.playClick(); setGameMode('speed'); }} style={tabBtn(gameMode === 'speed')}>
            {zh ? '⚡ 口诀速算' : 'Speed Quiz'}
          </button>
        </div>

        {/* 自由模式下的难度与连击 */}
        {gameMode !== 'daily' && (
          <div style={{ display: 'flex', gap: '4px' }}>
            {[1, 2, 3].map(lvl => (
              <button
                key={lvl}
                onClick={() => { audioSynth.playClick(); setLevel(lvl); }}
                style={{
                  width: '32px', height: '32px', borderRadius: '10px',
                  border: level === lvl ? '2px solid #4f46e5' : '1px solid #c7d2fe',
                  background: level === lvl ? '#eef2ff' : 'white',
                  color: level === lvl ? '#4f46e5' : '#3730a3',
                  fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer'
                }}
              >
                {lvl}
              </button>
            ))}
          </div>
        )}

        {/* Streak counter */}
        <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#ea580c', display: 'flex', alignItems: 'center', gap: '2px' }}>
          <span>🔥</span><span>{streak}</span>
        </div>
      </div>

      {/* ── 模式 1：📅 每日5题（今日打卡） ── */}
      {gameMode === 'daily' && (
        <Daily5Section
          zh={zh}
          lang={lang}
          onBack={onBack}
        />
      )}

      {/* ── 模式 2：📝 自由分步竖式 ── */}
      {gameMode === 'guide' && (
        <ColumnGuide
          key={problem.id}
          problem={problem}
          zh={zh}
          lang={lang}
          onSolved={() => { setGuideSolved(true); setStreak(s => s + 1); }}
          onNext={nextProblem}
        />
      )}

      {/* ── 模式 3：⚡ 口诀速算 ── */}
      {gameMode === 'speed' && (
        <div style={{
          width: '94%', maxWidth: '540px', background: 'rgba(255, 255, 255, 0.94)', backdropFilter: 'blur(16px)',
          borderRadius: '24px', border: '2.5px solid #c7d2fe', padding: '16px',
          display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center',
          boxShadow: '0 10px 30px rgba(79, 70, 229, 0.12)'
        }}>

          {/* 每次做题都显示口诀秘籍 */}
          <MnemonicBanner />

          {/* Equation Banner */}
          <div style={{
            width: '100%', background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
            border: '2.5px solid #818cf8', borderRadius: '20px', padding: '10px 14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', fontSize: '1.9rem', fontWeight: '900', color: '#3730a3', fontFamily: 'Fredoka, sans-serif' }}>
              <span>{problem.a}</span>
              <span style={{ color: '#ef4444' }}>−</span>
              <span>{problem.b}</span>
              <span>=</span>
              <div style={{
                minWidth: '60px', height: '44px', padding: '0 10px', background: 'white', borderRadius: '14px',
                border: '2px dashed #6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#16a34a', fontSize: '1.8rem', fontWeight: '900'
              }}>
                {speedFeedback === 'correct' ? problem.answer : '?'}
              </div>
            </div>
          </div>

          {/* Helper Card for current problem */}
          <div style={{
            width: '100%', background: '#f8fafc', borderRadius: '16px', padding: '10px 14px',
            border: '1.5px solid #e2e8f0', display: 'flex', justifyContent: 'space-around', fontSize: '0.85rem'
          }}>
            <div style={{ color: '#4338ca', fontWeight: '800' }}>
              🟣 <b>头</b>：{problem.aTens} − {problem.bTens} − 1 ＝ <b>{problem.ansTens}</b>
            </div>
            <div style={{ color: '#c2410c', fontWeight: '800' }}>
              🟠 <b>尾</b>：{problem.aOnes} ＋ {problem.complement} ＝ <b>{problem.ansOnes}</b>
            </div>
          </div>

          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700' }}>
            （减数尾 {problem.bOnes} 的补位数是 {problem.complement}，因为 {problem.bOnes} ＋ {problem.complement} ＝ 10）
          </div>

          {/* Dual Inputs */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {[
              { label: '🟣 头 (十位)', value: speedTensInput, color: '#4f46e5', bg: '#eef2ff' },
              { label: '🟠 尾 (个位)', value: speedOnesInput, color: '#ea580c', bg: '#fff7ed' },
            ].map(f => (
              <div key={f.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: '800', color: f.color }}>{f.label}</span>
                <input
                  type="text" readOnly value={f.value} placeholder="?"
                  style={{
                    width: '66px', height: '64px', borderRadius: '18px', border: `3px solid ${f.color}`,
                    textAlign: 'center', fontSize: '2rem', fontWeight: '900', color: f.color,
                    background: f.bg, outline: 'none'
                  }}
                />
              </div>
            ))}
          </div>

          {/* Keypad */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', width: '100%', maxWidth: '320px' }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(digit => (
              <button
                key={digit}
                className="bouncy-button"
                onClick={() => {
                  audioSynth.playClick();
                  if (!speedTensInput) setSpeedTensInput(String(digit));
                  else if (!speedOnesInput) setSpeedOnesInput(String(digit));
                }}
                style={{
                  height: '46px', borderRadius: '12px', background: 'white', border: '2px solid #c7d2fe',
                  fontSize: '1.2rem', fontWeight: '800', color: '#3730a3', cursor: 'pointer'
                }}
              >
                {digit}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', width: '100%', maxWidth: '320px' }}>
            <button
              className="bouncy-button secondary"
              onClick={() => { audioSynth.playClick(); setSpeedTensInput(''); setSpeedOnesInput(''); setSpeedFeedback(null); }}
              style={{ flex: 1, padding: '10px', borderRadius: '14px', fontSize: '0.9rem' }}
            >
              清空
            </button>
            <button
              className="bouncy-button primary"
              onClick={speedFeedback === 'correct' ? nextProblem : handleSpeedSubmit}
              style={{
                flex: 2, padding: '10px', borderRadius: '14px', fontSize: '1.05rem',
                background: speedFeedback === 'correct' ? 'linear-gradient(135deg, #22c55e, #16a34a)' : undefined
              }}
            >
              {speedFeedback === 'correct' ? '下一题 ➔' : '确认提交'}
            </button>
          </div>

          {speedFeedback === 'wrong' && (
            <div style={{ color: '#dc2626', fontWeight: '800', fontSize: '0.9rem' }}>
              再想想哦！念口诀：“头减头减1=头 ；尾+尾（尾的补位数）=尾”！
            </div>
          )}
        </div>
      )}
    </div>
  );
}

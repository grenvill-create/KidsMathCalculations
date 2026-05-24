import React, { useEffect, useState } from 'react';
import { audioSynth } from '../utils/audioSynth';

const THEME_ICONS = {
  space: '🚀',
  candy: '🍬',
  forest: '🍎'
};

export default function VisualCounters({ num1, num2, symbol, theme, errorPulse }) {
  const activeIcon = THEME_ICONS[theme] || '🍎';

  // For toddlers, they might want to click the icons to count them one by one.
  const handleItemClick = () => {
    audioSynth.playClick();
  };

  const list1 = Array.from({ length: num1 }, (_, i) => i);
  const list2 = Array.from({ length: num2 }, (_, i) => i);

  return (
    <div className={`visual-counters-card fade-in ${errorPulse ? 'pulse-error-highlight' : ''}`}>
      <div className="counters-flex-container">
        
        {/* Left Side: Number 1 Group */}
        <div className="counter-group">
          <div className="counter-items">
            {list1.map((idx) => {
              // For subtraction, cross out items
              const isCrossedOut = symbol === '-' && idx >= (num1 - num2);
              return (
                <div 
                  key={`left-${idx}`} 
                  className={`counter-item-wrapper bounce-in ${isCrossedOut ? 'crossed-out' : ''}`}
                  style={{ animationDelay: `${idx * 0.04}s` }}
                  onClick={handleItemClick}
                >
                  <span className="counter-emoji">{activeIcon}</span>
                  {isCrossedOut && <div className="cross-mark">❌</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Center: Math Operator */}
        <div className="counter-operator">
          <span className="operator-text">{symbol}</span>
        </div>

        {/* Right Side: Number 2 Group (only visible for addition) */}
        {symbol === '+' && (
          <div className="counter-group">
            <div className="counter-items">
              {list2.map((idx) => (
                <div 
                  key={`right-${idx}`} 
                  className="counter-item-wrapper bounce-in"
                  style={{ animationDelay: `${(num1 + idx) * 0.04}s` }}
                  onClick={handleItemClick}
                >
                  <span className="counter-emoji">{activeIcon}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Equals Symbol */}
        <div className="counter-operator">
          <span className="operator-text">=</span>
        </div>

        {/* Question Mark Visual Slot */}
        <div className="counter-group result-slot">
          <div className="question-mark-box bounce-glow">
            <span>?</span>
          </div>
        </div>

      </div>
    </div>
  );
}

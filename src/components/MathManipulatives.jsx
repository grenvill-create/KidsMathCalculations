import React, { useState, useEffect } from 'react';
import { audioSynth } from '../utils/audioSynth';

const OBJECTS = ['🍎', '🍪', '✏️', '🧸', '🚗', '🟩'];

export default function MathManipulatives({ currentQ, onBasketFull }) {
  const [manipulatives, setManipulatives] = useState([]);
  const [basket, setBasket] = useState([]);
  const [objIcon, setObjIcon] = useState('🍎');

  useEffect(() => {
    // Reset when new question comes
    setObjIcon(OBJECTS[Math.floor(Math.random() * OBJECTS.length)]);
    setBasket([]);
    
    if (!currentQ) return;
    
    // For addition: show num1 and num2 separately outside
    // For subtraction: show num1 total outside
    let initialMani = [];
    if (currentQ.symbol === '+') {
      for (let i=0; i<currentQ.num1; i++) initialMani.push({ id: `a${i}`, group: 'A' });
      for (let i=0; i<currentQ.num2; i++) initialMani.push({ id: `b${i}`, group: 'B' });
    } else {
      for (let i=0; i<currentQ.num1; i++) initialMani.push({ id: `s${i}`, group: 'S' });
    }
    setManipulatives(initialMani);
    
  }, [currentQ]);

  // If the basket is completely full for addition, or the correct amount is taken away for subtraction
  useEffect(() => {
    if (!currentQ) return;
    if (currentQ.symbol === '+') {
      if (basket.length === currentQ.num1 + currentQ.num2 && basket.length > 0) {
        onBasketFull(true);
      } else {
        onBasketFull(false);
      }
    } else {
      if (basket.length === currentQ.num2 && basket.length > 0) {
        onBasketFull(true);
      } else {
        onBasketFull(false);
      }
    }
  }, [basket, currentQ, onBasketFull]);

  const handleDragStart = (e, item) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(item));
    audioSynth.playClick();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      // Prevent duplicates
      if (!basket.find(i => i.id === data.id)) {
        setBasket([...basket, data]);
        setManipulatives(manipulatives.filter(i => i.id !== data.id));
        audioSynth.playClick(); // count sound
      }
    } catch(err) {}
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Simple Click alternative for touch devices where drag API is finicky
  const handleItemClick = (item) => {
    if (!basket.find(i => i.id === item.id)) {
      setBasket([...basket, item]);
      setManipulatives(manipulatives.filter(i => i.id !== item.id));
      audioSynth.playClick();
    }
  };

  if (!currentQ) return null;

  return (
    <div className="manipulatives-area fade-in">
      {/* Pool of objects */}
      <div className="items-row">
        {manipulatives.map(item => (
          <div 
            key={item.id} 
            className="draggable-item"
            draggable
            onDragStart={(e) => handleDragStart(e, item)}
            onClick={() => handleItemClick(item)}
          >
            {objIcon}
          </div>
        ))}
      </div>

      {/* Basket Drop Zone */}
      <div 
        className="drop-zone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {basket.length === 0 && <span style={{ opacity: 0.5 }}>请把图形拖进来数一数</span>}
        {basket.map(item => (
          <div key={item.id} className="draggable-item" style={{ cursor: 'default' }}>
            {objIcon}
          </div>
        ))}
      </div>
    </div>
  );
}

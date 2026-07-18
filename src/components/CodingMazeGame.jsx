import React, { useState, useEffect, useRef } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, X, ZoomIn, ZoomOut, RefreshCw, Play, RotateCcw, Settings } from 'lucide-react';
import confetti from 'canvas-confetti';
import { mathGenerator } from '../utils/mathGenerator';
import bg1 from '../assets/bg_random_1.jpg';
import bg2 from '../assets/bg_random_2.jpg';
import bg3 from '../assets/bg_random_3.jpg';
import bg4 from '../assets/bg_random_4.jpg';
import bg5 from '../assets/bg_random_5.jpg';
import bg6 from '../assets/bg_random_6.jpg';
import bg7 from '../assets/bg_random_7.jpg';
import bg8 from '../assets/bg_random_8.jpg';
import bg9 from '../assets/bg_random_9.jpg';
import bg10 from '../assets/bg_random_10.jpg';
import { audioSynth } from '../utils/audioSynth';

const BACKGROUNDS = [bg1, bg2, bg3, bg4, bg5, bg6, bg7, bg8, bg9, bg10];

const THEMES = {
  fox: { hero: '🦊', target: '⭐', obstacle: '🌲', bgFloor: '#f8fafc', bgAlt: '#e2e8f0', bgObstacle: '#fecdd3' },
  rabbit: { hero: '🐰', target: '🥕', obstacle: '🪨', bgFloor: '#fffbeb', bgAlt: '#fef3c7', bgObstacle: '#d6d3d1' },
  dog: { hero: '🐶', target: '🦴', obstacle: '🌵', bgFloor: '#f0fdf4', bgAlt: '#dcfce7', bgObstacle: '#fef08a' },
  cat: { hero: '🐱', target: '🐟', obstacle: '📦', bgFloor: '#e0e7ff', bgAlt: '#c7d2fe', bgObstacle: '#fed7aa' },
  monkey: { hero: '🐵', target: '🍌', obstacle: '🌴', bgFloor: '#fdf4ff', bgAlt: '#fae8ff', bgObstacle: '#bbf7d0' },
  bear: { hero: '🐻', target: '🍯', obstacle: '🐝', bgFloor: '#ffedd5', bgAlt: '#ffedd5', bgObstacle: '#fde047' },
  mouse: { hero: '🐭', target: '🧀', obstacle: '🪤', bgFloor: '#f1f5f9', bgAlt: '#e2e8f0', bgObstacle: '#cbd5e1' },
  penguin: { hero: '🐧', target: '🐟', obstacle: '🧊', bgFloor: '#f0f9ff', bgAlt: '#e0f2fe', bgObstacle: '#bae6fd' },
  frog: { hero: '🐸', target: '🪰', obstacle: '🍄', bgFloor: '#ecfdf5', bgAlt: '#d1fae5', bgObstacle: '#fbcfe8' },
  alien: { hero: '👽', target: '🛸', obstacle: '☄️', bgFloor: '#1e293b', bgAlt: '#334155', bgObstacle: '#ef4444' }
};

const RAW_LEVELS = [
  // 1
  { theme: 'fox', size: 4, start: { r: 3, c: 0 }, target: { r: 0, c: 3 }, obstacles: [{ r: 1, c: 1 }, { r: 2, c: 1 }, { r: 1, c: 2 }] },
  // 2
  { theme: 'rabbit', size: 5, start: { r: 4, c: 0 }, target: { r: 0, c: 4 }, obstacles: [{ r: 3, c: 1 }, { r: 2, c: 1 }, { r: 2, c: 2 }, { r: 2, c: 3 }, { r: 1, c: 3 }] },
  // 3
  { theme: 'dog', size: 5, start: { r: 4, c: 2 }, target: { r: 0, c: 2 }, obstacles: [{ r: 3, c: 0 }, { r: 3, c: 1 }, { r: 3, c: 3 }, { r: 3, c: 4 }, { r: 1, c: 2 }] },
  // 4
  { theme: 'cat', size: 6, start: { r: 5, c: 0 }, target: { r: 0, c: 5 }, obstacles: [{ r: 4, c: 2 }, { r: 3, c: 2 }, { r: 2, c: 2 }, { r: 2, c: 3 }, { r: 2, c: 4 }, { r: 4, c: 4 }] },
  // 5
  { theme: 'monkey', size: 6, start: { r: 0, c: 0 }, target: { r: 5, c: 5 }, obstacles: [{ r: 0, c: 1 }, { r: 1, c: 1 }, { r: 2, c: 1 }, { r: 2, c: 3 }, { r: 3, c: 3 }, { r: 4, c: 3 }, { r: 4, c: 5 }] },
  // 6
  { theme: 'bear', size: 6, start: { r: 5, c: 3 }, target: { r: 0, c: 2 }, obstacles: [{ r: 4, c: 2 }, { r: 4, c: 3 }, { r: 4, c: 4 }, { r: 2, c: 1 }, { r: 2, c: 2 }, { r: 2, c: 3 }] },
  // 7
  { theme: 'mouse', size: 7, start: { r: 6, c: 0 }, target: { r: 0, c: 6 }, obstacles: [{ r: 5, c: 1 }, { r: 4, c: 1 }, { r: 3, c: 1 }, { r: 2, c: 1 }, { r: 2, c: 2 }, { r: 2, c: 3 }, { r: 2, c: 4 }, { r: 2, c: 5 }] },
  // 8 (Fixed: Removed {r:3, c:4})
  { theme: 'penguin', size: 7, start: { r: 3, c: 3 }, target: { r: 0, c: 0 }, obstacles: [{ r: 2, c: 3 }, { r: 4, c: 3 }, { r: 3, c: 2 }, { r: 1, c: 1 }] },
  // 9
  { theme: 'frog', size: 7, start: { r: 6, c: 6 }, target: { r: 0, c: 0 }, obstacles: [{ r: 5, c: 5 }, { r: 4, c: 4 }, { r: 3, c: 3 }, { r: 2, c: 2 }, { r: 1, c: 1 }] },
  // 10
  { theme: 'alien', size: 7, start: { r: 6, c: 3 }, target: { r: 0, c: 3 }, obstacles: [{ r: 5, c: 2 }, { r: 5, c: 3 }, { r: 5, c: 4 }, { r: 3, c: 1 }, { r: 3, c: 2 }, { r: 3, c: 4 }, { r: 3, c: 5 }, { r: 1, c: 2 }, { r: 1, c: 3 }, { r: 1, c: 4 }] },
  // 11
  { theme: 'penguin', size: 6, start: { r: 5, c: 0 }, target: { r: 0, c: 5 }, obstacles: [{ r: 4, c: 0 }, { r: 4, c: 1 }, { r: 4, c: 2 }, { r: 4, c: 3 }, { r: 2, c: 2 }, { r: 2, c: 3 }, { r: 2, c: 4 }, { r: 2, c: 5 }] },
  // 12
  { theme: 'frog', size: 6, start: { r: 5, c: 5 }, target: { r: 0, c: 0 }, obstacles: [{ r: 1, c: 0 }, { r: 1, c: 1 }, { r: 1, c: 2 }, { r: 3, c: 3 }, { r: 3, c: 4 }, { r: 3, c: 5 }] },
  // 13
  { theme: 'monkey', size: 7, start: { r: 6, c: 0 }, target: { r: 0, c: 6 }, obstacles: [{ r: 5, c: 2 }, { r: 4, c: 2 }, { r: 3, c: 2 }, { r: 2, c: 2 }, { r: 2, c: 3 }, { r: 2, c: 4 }, { r: 2, c: 5 }, { r: 4, c: 4 }, { r: 5, c: 4 }, { r: 6, c: 4 }] },
  // 14
  { theme: 'bear', size: 7, start: { r: 6, c: 3 }, target: { r: 0, c: 3 }, obstacles: [{ r: 5, c: 3 }, { r: 3, c: 3 }, { r: 1, c: 3 }, { r: 4, c: 1 }, { r: 4, c: 5 }, { r: 2, c: 1 }, { r: 2, c: 5 }] },
  // 15
  { theme: 'alien', size: 7, start: { r: 3, c: 0 }, target: { r: 3, c: 6 }, obstacles: [{ r: 3, c: 3 }, { r: 2, c: 3 }, { r: 4, c: 3 }, { r: 1, c: 2 }, { r: 5, c: 2 }, { r: 1, c: 4 }, { r: 5, c: 4 }], enemies: [{ type: 'snake', start: {r: 1, c: 3}, commands: ['DOWN', 'UP'] }, { type: 'snake', start: {r: 5, c: 3}, commands: ['UP', 'DOWN'] }] },
  // 16 (Fixed: Removed {r:2, c:3})
  { theme: 'rabbit', size: 6, start: { r: 0, c: 3 }, target: { r: 5, c: 3 }, obstacles: [{ r: 2, c: 0 }, { r: 2, c: 1 }, { r: 2, c: 2 }, { r: 3, c: 4 }, { r: 3, c: 5 }] },
  // 17
  { theme: 'cat', size: 7, start: { r: 6, c: 6 }, target: { r: 0, c: 0 }, obstacles: [{ r: 5, c: 6 }, { r: 4, c: 5 }, { r: 3, c: 4 }, { r: 2, c: 3 }, { r: 1, c: 2 }, { r: 0, c: 1 }, { r: 5, c: 1 }, { r: 1, c: 5 }] },
  // 18 (Fixed: Removed {r:3, c:3})
  { theme: 'dog', size: 7, start: { r: 0, c: 0 }, target: { r: 6, c: 6 }, obstacles: [{ r: 1, c: 1 }, { r: 2, c: 2 }, { r: 4, c: 4 }, { r: 5, c: 5 }, { r: 0, c: 2 }, { r: 2, c: 0 }, { r: 4, c: 6 }, { r: 6, c: 4 }] },
  // 19
  { theme: 'fox', size: 7, start: { r: 6, c: 3 }, target: { r: 0, c: 3 }, obstacles: [{ r: 5, c: 2 }, { r: 5, c: 3 }, { r: 5, c: 4 }, { r: 3, c: 0 }, { r: 3, c: 1 }, { r: 3, c: 2 }, { r: 3, c: 4 }, { r: 3, c: 5 }, { r: 3, c: 6 }, { r: 1, c: 2 }, { r: 1, c: 3 }, { r: 1, c: 4 }] },
  // 20 (Fixed: Removed {r:3, c:4})
  { theme: 'mouse', size: 7, start: { r: 3, c: 3 }, target: { r: 0, c: 6 }, obstacles: [{ r: 2, c: 2 }, { r: 2, c: 3 }, { r: 2, c: 4 }, { r: 3, c: 2 }, { r: 4, c: 2 }, { r: 4, c: 3 }, { r: 4, c: 4 }, { r: 0, c: 0 }, { r: 6, c: 6 }], enemies: [{ type: 'tiger', start: {r: 1, c: 1}, commands: ['RIGHT', 'RIGHT', 'LEFT', 'LEFT'] }] },
  // 21
  {theme:"fox",size:8,start:{r:5,c:0},target:{r:3,c:7},obstacles:[{r:7,c:4},{r:5,c:4},{r:6,c:5},{r:7,c:1},{r:7,c:6},{r:0,c:3},{r:6,c:7},{r:0,c:0},{r:2,c:0},{r:7,c:7},{r:4,c:6},{r:0,c:4},{r:4,c:6},{r:7,c:6},{r:1,c:1},{r:0,c:4},{r:2,c:1},{r:4,c:6},{r:2,c:6},{r:1,c:6},{r:5,c:3}]},
  // 22
  {theme:"rabbit",size:8,start:{r:2,c:0},target:{r:7,c:7},obstacles:[{r:3,c:7},{r:7,c:0},{r:0,c:4},{r:4,c:0},{r:1,c:0},{r:3,c:0},{r:5,c:0},{r:2,c:6},{r:1,c:3},{r:1,c:6},{r:1,c:1},{r:7,c:4},{r:0,c:5},{r:1,c:7},{r:1,c:6},{r:3,c:7},{r:3,c:1},{r:5,c:0}]},
  // 23
  {theme:"dog",size:8,start:{r:3,c:0},target:{r:6,c:7},obstacles:[{r:0,c:7},{r:4,c:7},{r:4,c:6},{r:3,c:5},{r:2,c:4},{r:5,c:2},{r:2,c:6},{r:6,c:0},{r:1,c:7},{r:0,c:4},{r:2,c:3},{r:2,c:5},{r:4,c:7},{r:2,c:0},{r:5,c:3},{r:5,c:3},{r:7,c:4},{r:2,c:2},{r:5,c:5}]},
  // 24
  {theme:"cat",size:8,start:{r:2,c:0},target:{r:5,c:7},obstacles:[{r:7,c:6},{r:5,c:1},{r:3,c:4},{r:7,c:1},{r:1,c:0},{r:0,c:6},{r:2,c:6},{r:2,c:2},{r:1,c:0},{r:1,c:3},{r:1,c:7},{r:5,c:1},{r:5,c:0},{r:2,c:6},{r:6,c:2},{r:1,c:4},{r:1,c:3}]},
  // 25
  {theme:"monkey",size:8,start:{r:7,c:0},target:{r:4,c:7},obstacles:[{r:6,c:1},{r:2,c:5},{r:0,c:2},{r:3,c:0},{r:2,c:1},{r:1,c:5},{r:0,c:1},{r:6,c:2},{r:6,c:5},{r:1,c:7},{r:5,c:4},{r:3,c:0},{r:1,c:0},{r:1,c:0},{r:2,c:7},{r:7,c:5},{r:6,c:1},{r:2,c:5}], enemies: [{ type: 'tiger', start: {r: 3, c: 4}, commands: ['UP', 'UP', 'DOWN', 'DOWN'] }, { type: 'skeleton', start: {r: 1, c: 2}, commands: ['RIGHT', 'LEFT'] }]},
  // 26
  {theme:"bear",size:9,start:{r:4,c:0},target:{r:5,c:8},obstacles:[{r:6,c:0},{r:2,c:1},{r:3,c:1},{r:4,c:6},{r:2,c:1},{r:4,c:8},{r:6,c:6},{r:6,c:1},{r:4,c:5},{r:1,c:8},{r:8,c:7},{r:4,c:5},{r:4,c:7},{r:0,c:7},{r:7,c:4},{r:2,c:8},{r:2,c:0},{r:3,c:2},{r:1,c:2},{r:2,c:8},{r:0,c:6},{r:7,c:7}]},
  // 27
  {theme:"mouse",size:9,start:{r:4,c:0},target:{r:3,c:8},obstacles:[{r:0,c:6},{r:4,c:8},{r:8,c:0},{r:0,c:4},{r:5,c:2},{r:8,c:7},{r:2,c:2},{r:4,c:7},{r:6,c:1},{r:5,c:0},{r:6,c:6},{r:5,c:6},{r:7,c:2},{r:5,c:8},{r:6,c:4},{r:6,c:6},{r:0,c:5},{r:1,c:7},{r:5,c:0},{r:0,c:4},{r:0,c:5},{r:7,c:1},{r:4,c:2}]},
  // 28
  {theme:"penguin",size:9,start:{r:2,c:0},target:{r:6,c:8},obstacles:[{r:8,c:0},{r:1,c:5},{r:0,c:6},{r:1,c:0},{r:2,c:3},{r:0,c:0},{r:1,c:2},{r:8,c:1},{r:1,c:4},{r:1,c:7},{r:8,c:2},{r:8,c:5},{r:3,c:8},{r:1,c:8},{r:1,c:0},{r:8,c:2},{r:5,c:7},{r:2,c:5},{r:7,c:7},{r:0,c:6},{r:4,c:6}]},
  // 29
  {theme:"frog",size:9,start:{r:3,c:0},target:{r:3,c:8},obstacles:[{r:1,c:5},{r:8,c:7},{r:4,c:4},{r:0,c:3},{r:5,c:4},{r:6,c:0},{r:7,c:8},{r:8,c:3},{r:0,c:5},{r:6,c:8},{r:2,c:6},{r:0,c:8},{r:6,c:2},{r:5,c:7},{r:2,c:0},{r:7,c:4},{r:7,c:8},{r:4,c:0},{r:5,c:2},{r:8,c:7},{r:7,c:1},{r:0,c:4},{r:6,c:5},{r:5,c:8},{r:4,c:3},{r:4,c:6}]},
  // 30
  { theme: 'fox', size: 10, start: {r:9, c:0}, target: {r:0, c:9}, obstacles: [{r:8,c:0},{r:8,c:1},{r:8,c:2},{r:7,c:4},{r:6,c:4},{r:5,c:4},{r:5,c:5},{r:5,c:6},{r:4,c:8},{r:3,c:8},{r:2,c:8},{r:1,c:8},{r:9,c:3},{r:9,c:4},{r:9,c:5},{r:7,c:7},{r:6,c:7},{r:5,c:7},{r:2,c:2},{r:2,c:3},{r:2,c:4},{r:3,c:2},{r:4,c:2},{r:0,c:5},{r:1,c:5}], enemies: [{ type: 'dinosaur', start: {r:6, c:1}, commands: ['NONE'] }, { type: 'tiger', start: {r:2, c:6}, commands: ['LEFT', 'RIGHT'] }, { type: 'skeleton', start: {r: 4, c: 4}, commands: ['LEFT', 'RIGHT'] }] },
  // 31
  { theme: 'frog', size: 10, start: {r:0, c:0}, target: {r:9, c:9}, obstacles: [{r:0,c:2},{r:1,c:2},{r:2,c:2},{r:3,c:2},{r:4,c:2},{r:5,c:2},{r:9,c:7},{r:8,c:7},{r:7,c:7},{r:6,c:7},{r:5,c:7},{r:4,c:5},{r:5,c:5},{r:6,c:5}], enemies: [{ type: 'tiger', start: {r:3, c:4}, commands: ['LEFT', 'RIGHT'] }, { type: 'snake', start: {r:7, c:3}, commands: ['UP', 'DOWN'] }] },
  // 32
  { theme: 'rabbit', size: 10, start: {r:0, c:0}, target: {r:9, c:9}, obstacles: [{r:0,c:2},{r:1,c:2},{r:2,c:2},{r:3,c:2},{r:4,c:2},{r:5,c:2},{r:7,c:0},{r:7,c:1},{r:7,c:2},{r:7,c:3},{r:7,c:4},{r:7,c:5},{r:7,c:6},{r:7,c:7},{r:2,c:5},{r:3,c:5},{r:4,c:5},{r:5,c:5},{r:6,c:5},{r:2,c:7},{r:3,c:7},{r:4,c:7},{r:5,c:7},{r:6,c:7},{r:9,c:5},{r:9,c:6}], enemies: [{ type: 'tiger', start: {r:8, c:3}, commands: ['RIGHT', 'LEFT'] }, { type: 'snake', start: {r:1, c:6}, commands: ['DOWN', 'DOWN', 'UP', 'UP'] }] },
  // 33
  { theme: 'dog', size: 10, start: {r:9, c:9}, target: {r:0, c:0}, obstacles: [{r:8,c:9},{r:8,c:8},{r:8,c:7},{r:8,c:6},{r:6,c:9},{r:6,c:8},{r:6,c:7},{r:6,c:6},{r:4,c:9},{r:4,c:8},{r:4,c:7},{r:4,c:6},{r:2,c:9},{r:2,c:8},{r:2,c:7},{r:2,c:6},{r:9,c:4},{r:8,c:4},{r:7,c:4},{r:6,c:4},{r:5,c:4},{r:4,c:4},{r:3,c:4},{r:2,c:4},{r:1,c:4},{r:9,c:2},{r:8,c:2},{r:7,c:2},{r:6,c:2},{r:5,c:2},{r:4,c:2},{r:3,c:2},{r:2,c:2},{r:1,c:2}], enemies: [{ type: 'tiger', start: {r:7, c:5}, commands: ['UP', 'DOWN'] }, { type: 'tiger', start: {r:3, c:3}, commands: ['DOWN', 'UP'] }] },
  // 34
  { theme: 'cat', size: 10, start: {r:0, c:5}, target: {r:9, c:5}, obstacles: [{r:2,c:0},{r:2,c:1},{r:2,c:2},{r:2,c:3},{r:2,c:4},{r:2,c:6},{r:2,c:7},{r:2,c:8},{r:2,c:9},{r:5,c:0},{r:5,c:1},{r:5,c:2},{r:5,c:3},{r:5,c:4},{r:5,c:6},{r:5,c:7},{r:5,c:8},{r:5,c:9},{r:8,c:0},{r:8,c:1},{r:8,c:2},{r:8,c:3},{r:8,c:4},{r:8,c:6},{r:8,c:7},{r:8,c:8},{r:8,c:9}], enemies: [{ type: 'tiger', start: {r:3, c:5}, commands: ['LEFT', 'RIGHT'] }, { type: 'tiger', start: {r:6, c:5}, commands: ['RIGHT', 'LEFT'] }] },
  // 35
  { theme: 'monkey', size: 10, start: {r: 5, c: 0}, target: {r: 5, c: 9}, obstacles: [{r:0,c:2},{r:1,c:2},{r:2,c:2},{r:3,c:2},{r:4,c:2},{r:6,c:2},{r:7,c:2},{r:8,c:2},{r:9,c:2},{r:0,c:5},{r:1,c:5},{r:2,c:5},{r:3,c:5},{r:4,c:5},{r:6,c:5},{r:7,c:5},{r:8,c:5},{r:9,c:5},{r:0,c:8},{r:1,c:8},{r:2,c:8},{r:3,c:8},{r:4,c:8},{r:6,c:8},{r:7,c:8},{r:8,c:8},{r:9,c:8}], enemies: [{ type: 'ghost', start: { r: 1, c: 7 }, commands: ['LEFT', 'RIGHT'] }] },
  // 36
  { theme: 'bear', size: 10, start: {r:0, c:0}, target: {r:9, c:0}, obstacles: [{r:1,c:0},{r:1,c:1},{r:1,c:2},{r:1,c:3},{r:1,c:4},{r:1,c:5},{r:1,c:6},{r:1,c:7},{r:1,c:8},{r:3,c:1},{r:3,c:2},{r:3,c:3},{r:3,c:4},{r:3,c:5},{r:3,c:6},{r:3,c:7},{r:3,c:8},{r:3,c:9},{r:5,c:0},{r:5,c:1},{r:5,c:2},{r:5,c:3},{r:5,c:4},{r:5,c:5},{r:5,c:6},{r:5,c:7},{r:5,c:8},{r:7,c:1},{r:7,c:2},{r:7,c:3},{r:7,c:4},{r:7,c:5},{r:7,c:6},{r:7,c:7},{r:7,c:8},{r:7,c:9}], enemies: [{ type: 'zombie', start: {r:2, c:0}, commands: ['RIGHT', 'RIGHT', 'LEFT', 'LEFT'] }, { type: 'tiger', start: {r:4, c:9}, commands: ['LEFT', 'LEFT', 'RIGHT', 'RIGHT'] }, { type: 'zombie', start: {r:6, c:0}, commands: ['RIGHT', 'RIGHT', 'LEFT', 'LEFT'] }] },
  // 37
  { theme: 'mouse', size: 10, start: {r:4, c:4}, target: {r:0, c:9}, obstacles: [{r:3,c:3},{r:3,c:4},{r:3,c:5},{r:5,c:3},{r:5,c:4},{r:5,c:5},{r:4,c:3},{r:4,c:5},{r:1,c:1},{r:1,c:2},{r:1,c:3},{r:1,c:4},{r:1,c:5},{r:1,c:6},{r:1,c:7},{r:1,c:8},{r:8,c:1},{r:8,c:2},{r:8,c:3},{r:8,c:4},{r:8,c:5},{r:8,c:6},{r:8,c:7},{r:8,c:8},{r:2,c:1},{r:3,c:1},{r:4,c:1},{r:5,c:1},{r:6,c:1},{r:7,c:1},{r:2,c:8},{r:3,c:8},{r:4,c:8},{r:5,c:8},{r:6,c:8},{r:7,c:8}], enemies: [{ type: 'witch', start: {r:2, c:4}, commands: ['RIGHT', 'LEFT'] }, { type: 'tiger', start: {r:6, c:4}, commands: ['LEFT', 'RIGHT'] }, { type: 'witch', start: {r:4, c:2}, commands: ['UP', 'DOWN'] }] },
  // 38
  { theme: 'penguin', size: 10, start: {r:9, c:0}, target: {r:0, c:9}, obstacles: [{r:8,c:0},{r:7,c:1},{r:6,c:2},{r:5,c:3},{r:4,c:4},{r:3,c:5},{r:2,c:6},{r:1,c:7},{r:0,c:8},{r:9,c:1},{r:8,c:2},{r:7,c:3},{r:6,c:4},{r:5,c:5},{r:4,c:6},{r:3,c:7},{r:2,c:8},{r:1,c:9}], enemies: [{ type: 'magma', start: {r:9, c:9}, commands: ['NONE'] }, { type: 'tiger', start: {r:0, c:0}, commands: ['DOWN', 'DOWN', 'UP', 'UP'] }, { type: 'snake', start: {r:4, c:1}, commands: ['RIGHT', 'LEFT'] }] },
  // 39
  { theme: 'frog', size: 10, start: {r:4, c:0}, target: {r:4, c:9}, obstacles: [{r:0,c:4},{r:1,c:4},{r:2,c:4},{r:3,c:4},{r:5,c:4},{r:6,c:4},{r:7,c:4},{r:8,c:4},{r:9,c:4},{r:0,c:6},{r:1,c:6},{r:2,c:6},{r:3,c:6},{r:5,c:6},{r:6,c:6},{r:7,c:6},{r:8,c:6},{r:9,c:6},{r:4,c:2},{r:3,c:2},{r:5,c:2},{r:4,c:8},{r:3,c:8},{r:5,c:8}], enemies: [{ type: 'witch', start: {r:1, c:5}, commands: ['DOWN', 'DOWN', 'UP', 'UP'] }, { type: 'ghost', start: {r:8, c:5}, commands: ['UP', 'UP', 'DOWN', 'DOWN'] }, { type: 'tiger', start: {r:4, c:5}, commands: ['LEFT', 'RIGHT'] }] },
  // 40
  { theme: 'alien', size: 10, start: {r:9, c:4}, target: {r:0, c:5}, obstacles: [{r:8,c:1},{r:8,c:2},{r:8,c:3},{r:8,c:4},{r:8,c:5},{r:8,c:6},{r:8,c:7},{r:8,c:8},{r:6,c:0},{r:6,c:1},{r:6,c:2},{r:6,c:3},{r:6,c:4},{r:6,c:5},{r:6,c:6},{r:6,c:7},{r:4,c:2},{r:4,c:3},{r:4,c:4},{r:4,c:5},{r:4,c:6},{r:4,c:7},{r:4,c:8},{r:4,c:9},{r:2,c:0},{r:2,c:1},{r:2,c:2},{r:2,c:3},{r:2,c:4},{r:2,c:5},{r:2,c:6},{r:2,c:7}], enemies: [{ type: 'magma', start: {r:7, c:0}, commands: ['NONE'] }, { type: 'zombie', start: {r:5, c:9}, commands: ['LEFT', 'LEFT', 'LEFT', 'RIGHT', 'RIGHT', 'RIGHT'] }, { type: 'ghost', start: {r:3, c:0}, commands: ['RIGHT', 'RIGHT', 'RIGHT', 'LEFT', 'LEFT', 'LEFT'] }, { type: 'witch', start: {r:1, c:9}, commands: ['LEFT', 'LEFT', 'LEFT', 'RIGHT', 'RIGHT', 'RIGHT'] }] },
  // 41
  { theme: 'alien', size: 10, start: {r: 9, c: 9}, target: {r: 0, c: 0}, obstacles: [{r:1,c:1},{r:2,c:1},{r:3,c:1},{r:4,c:1},{r:6,c:3},{r:7,c:3},{r:8,c:3},{r:1,c:5},{r:2,c:5},{r:3,c:5},{r:4,c:5},{r:5,c:5},{r:6,c:5},{r:7,c:5},{r:8,c:5}], enemies: [{ type: 'dinosaur', start: {r: 4, c: 2}, commands: ['NONE'] }, { type: 'ghost', start: {r: 1, c: 8}, commands: ['LEFT', 'RIGHT'] }] },
  // 42
  { theme: 'bear', size: 10, start: {r: 9, c: 0}, target: {r: 0, c: 9}, obstacles: [{r:0,c:2},{r:1,c:2},{r:2,c:2},{r:3,c:2},{r:4,c:2},{r:5,c:2},{r:5,c:4},{r:6,c:4},{r:7,c:4},{r:8,c:4},{r:9,c:4},{r:1,c:7},{r:2,c:7},{r:3,c:7},{r:4,c:7}], enemies: [{ type: 'rhino', start: {r: 5, c: 5}, commands: ['UP', 'DOWN'] }, { type: 'zombie', start: {r: 2, c: 8}, commands: ['LEFT', 'RIGHT'] }] },
  // 43
  { theme: 'penguin', size: 10, start: {r: 0, c: 9}, target: {r: 9, c: 0}, obstacles: [{r:3,c:0},{r:3,c:1},{r:3,c:2},{r:3,c:3},{r:3,c:4},{r:3,c:5},{r:3,c:6},{r:3,c:7},{r:6,c:2},{r:6,c:3},{r:6,c:4},{r:6,c:5},{r:6,c:6},{r:6,c:7},{r:6,c:8},{r:6,c:9}], enemies: [{ type: 'turtle', start: {r: 2, c: 2}, commands: ['RIGHT', 'LEFT'] }, { type: 'turtle', start: {r: 5, c: 5}, commands: ['LEFT', 'RIGHT'] }, { type: 'tiger', start: {r: 8, c: 8}, commands: ['UP', 'DOWN'] }] },
  // 44
  { theme: 'frog', size: 10, start: {r: 5, c: 5}, target: {r: 0, c: 0}, obstacles: [{r:1,c:0},{r:1,c:1},{r:1,c:2},{r:1,c:3},{r:1,c:4},{r:3,c:2},{r:4,c:2},{r:5,c:2},{r:6,c:2},{r:2,c:6},{r:3,c:6},{r:4,c:6},{r:5,c:6},{r:6,c:6}], enemies: [{ type: 'dinosaur', start: {r: 2, c: 0}, commands: ['NONE'] }, { type: 'snake', start: {r: 4, c: 8}, commands: ['UP', 'DOWN'] }] },
  // 45
  { theme: 'monkey', size: 10, start: {r: 9, c: 5}, target: {r: 0, c: 5}, obstacles: [{r:2,c:2},{r:2,c:3},{r:2,c:4},{r:2,c:5},{r:2,c:6},{r:2,c:7},{r:5,c:0},{r:5,c:1},{r:5,c:2},{r:5,c:3},{r:5,c:6},{r:5,c:7},{r:5,c:8},{r:5,c:9},{r:7,c:3},{r:7,c:4},{r:7,c:5},{r:7,c:6}], enemies: [{ type: 'elephant', start: {r: 4, c: 4}, commands: ['LEFT', 'RIGHT'] }, { type: 'elephant', start: {r: 6, c: 4}, commands: ['RIGHT', 'LEFT'] }] },
  // 46
  { theme: 'cat', size: 11, start: {r: 10, c: 0}, target: {r: 0, c: 10}, obstacles: [{r:1,c:2},{r:2,c:2},{r:3,c:2},{r:4,c:2},{r:5,c:2},{r:6,c:2},{r:7,c:2},{r:8,c:2},{r:5,c:4},{r:6,c:4},{r:7,c:4},{r:8,c:4},{r:9,c:4},{r:1,c:7},{r:2,c:7},{r:3,c:7},{r:4,c:7},{r:5,c:7},{r:6,c:7},{r:7,c:7},{r:8,c:7}], enemies: [{ type: 'rhino', start: {r: 3, c: 3}, commands: ['UP', 'DOWN'] }, { type: 'rhino', start: {r: 7, c: 5}, commands: ['DOWN', 'UP'] }, { type: 'witch', start: {r: 5, c: 9}, commands: ['LEFT', 'RIGHT'] }] },
  // 47
  { theme: 'mouse', size: 11, start: {r: 0, c: 0}, target: {r: 10, c: 10}, obstacles: [{r:2,c:0},{r:2,c:1},{r:2,c:2},{r:2,c:3},{r:2,c:4},{r:2,c:5},{r:2,c:6},{r:2,c:7},{r:2,c:8},{r:2,c:9},{r:7,c:1},{r:7,c:2},{r:7,c:3},{r:7,c:4},{r:7,c:5},{r:7,c:6},{r:7,c:7},{r:7,c:8},{r:7,c:9},{r:7,c:10}], enemies: [{ type: 'dinosaur', start: {r: 4, c: 4}, commands: ['NONE'] }, { type: 'dinosaur', start: {r: 8, c: 2}, commands: ['NONE'] }] },
  // 48
  { theme: 'fox', size: 11, start: {r: 10, c: 5}, target: {r: 0, c: 5}, obstacles: [{r:2,c:1},{r:2,c:2},{r:2,c:3},{r:2,c:4},{r:2,c:5},{r:2,c:6},{r:2,c:7},{r:2,c:8},{r:2,c:9},{r:4,c:3},{r:5,c:3},{r:6,c:3},{r:7,c:3},{r:8,c:3},{r:4,c:7},{r:5,c:7},{r:6,c:7},{r:7,c:7},{r:8,c:7}], enemies: [{ type: 'turtle', start: {r: 1, c: 2}, commands: ['RIGHT', 'LEFT'] }, { type: 'rhino', start: {r: 9, c: 8}, commands: ['LEFT', 'RIGHT'] }, { type: 'tiger', start: {r: 5, c: 5}, commands: ['UP', 'DOWN'] }] },
  // 49
  { theme: 'dog', size: 11, start: {r: 5, c: 0}, target: {r: 5, c: 10}, obstacles: [{r:0,c:3},{r:1,c:3},{r:2,c:3},{r:3,c:3},{r:4,c:3},{r:6,c:3},{r:7,c:3},{r:8,c:3},{r:9,c:3},{r:10,c:3},{r:0,c:7},{r:1,c:7},{r:2,c:7},{r:3,c:7},{r:4,c:7},{r:6,c:7},{r:7,c:7},{r:8,c:7},{r:9,c:7},{r:10,c:7}], enemies: [{ type: 'elephant', start: {r: 5, c: 2}, commands: ['UP', 'DOWN'] }, { type: 'dinosaur', start: {r: 5, c: 5}, commands: ['NONE'] }] },
  // 50
  { theme: 'alien', size: 11, start: {r: 10, c: 10}, target: {r: 0, c: 0}, obstacles: [{r:1,c:1},{r:2,c:1},{r:3,c:1},{r:4,c:1},{r:5,c:1},{r:7,c:3},{r:8,c:3},{r:9,c:3},{r:10,c:3},{r:2,c:5},{r:3,c:5},{r:4,c:5},{r:5,c:5},{r:6,c:5},{r:7,c:5},{r:3,c:7},{r:4,c:7},{r:5,c:7},{r:6,c:7},{r:7,c:7},{r:8,c:7}], enemies: [{ type: 'magma', start: {r: 2, c: 2}, commands: ['NONE'] }, { type: 'dinosaur', start: {r: 8, c: 4}, commands: ['NONE'] }, { type: 'rhino', start: {r: 4, c: 9}, commands: ['UP', 'DOWN'] }] },
  // 51
  { theme: 'cat', size: 10, start: {r: 9, c: 0}, target: {r: 0, c: 9}, obstacles: [{r:1,c:8},{r:2,c:8},{r:3,c:8},{r:4,c:8},{r:5,c:8},{r:6,c:8},{r:7,c:8},{r:8,c:8},{r:8,c:1},{r:8,c:2},{r:8,c:3},{r:8,c:4},{r:8,c:5},{r:8,c:6},{r:8,c:7}], enemies: [{ type: 'witch', start: {r: 4, c: 4}, commands: ['UP', 'DOWN'] }, { type: 'ghost', start: {r: 2, c: 6}, commands: ['LEFT', 'RIGHT'] }] },
  // 52
  { theme: 'alien', size: 10, start: {r: 0, c: 0}, target: {r: 9, c: 9}, obstacles: [{r:1,c:1},{r:1,c:2},{r:2,c:1},{r:7,c:7},{r:7,c:8},{r:8,c:7}], enemies: [{ type: 'magma', start: {r: 5, c: 5}, commands: ['NONE'] }, { type: 'zombie', start: {r: 4, c: 8}, commands: ['LEFT', 'RIGHT'] }] }
];

const LEVELS = RAW_LEVELS.map((lvl, idx) => {
  let newLvl = { ...lvl, obstacles: [...lvl.obstacles] };

  // 从第3关开始(index >= 2)，如果没有敌人，自动添加一个
  if (idx >= 2) {
    if (!newLvl.enemies || newLvl.enemies.length === 0) {
      let firstEnemyPos = null;
      for (let r = 0; r < newLvl.size; r++) {
        for (let c = 0; c < newLvl.size; c++) {
          if ((r === newLvl.start.r && c === newLvl.start.c) || (r === newLvl.target.r && c === newLvl.target.c)) continue;
          if (newLvl.obstacles.some(o => o.r === r && o.c === c)) continue;
          firstEnemyPos = { r, c };
          break;
        }
        if (firstEnemyPos) break;
      }
      if (firstEnemyPos) {
        let eType = idx >= 4 ? 'tiger' : 'snake'; // 从第5关起出现老虎
        if (idx >= 29) {
          // 第30关起陆续出现新怪物
          const pool = ['tiger', 'ghost', 'skeleton'];
          if (idx >= 32) pool.push('witch');
          if (idx >= 35) pool.push('zombie');
          if (idx >= 38) pool.push('magma');
          eType = pool[Math.floor(Math.random() * pool.length)];
        }
        const commandsList = eType === 'magma' ? ['NONE'] : ['DOWN', 'UP', 'RIGHT', 'LEFT'];
        newLvl.enemies = [{ type: eType, start: firstEnemyPos, commands: commandsList }];
      }
    }
  }

  // 第6关之后的关卡 (index >= 5 表示第6关及以后)，开始增加起点的障碍包围
  if (idx >= 5) {
    const sr = newLvl.start.r, sc = newLvl.start.c;
    const neighbors = [
      {r: sr - 1, c: sc}, {r: sr + 1, c: sc}, {r: sr, c: sc - 1}, {r: sr, c: sc + 1}
    ].filter(n => n.r >= 0 && n.r < newLvl.size && n.c >= 0 && n.c < newLvl.size);
    
    neighbors.forEach(n => {
      const isTarget = (n.r === newLvl.target.r && n.c === newLvl.target.c);
      const hasObs = newLvl.obstacles.some(o => o.r === n.r && o.c === n.c);
      if (!isTarget && !hasObs) {
        newLvl.obstacles.push({r: n.r, c: n.c});
      }
    });
  }

  // 第10关之后的关卡 (index >= 9)，大幅增加难度：包围终点
  if (idx >= 9) {
    const tr = newLvl.target.r, tc = newLvl.target.c;
    const targetNeighbors = [
      {r: tr - 1, c: tc}, {r: tr + 1, c: tc}, {r: tr, c: tc - 1}, {r: tr, c: tc + 1}
    ].filter(n => n.r >= 0 && n.r < newLvl.size && n.c >= 0 && n.c < newLvl.size);
    
    targetNeighbors.forEach(n => {
      const isStart = (n.r === newLvl.start.r && n.c === newLvl.start.c);
      const hasObs = newLvl.obstacles.some(o => o.r === n.r && o.c === n.c);
      if (!isStart && !hasObs) {
        newLvl.obstacles.push({r: n.r, c: n.c});
      }
    });
  }

  // 第4关及以后 (index >= 3)，开始随机生成各种动物，每隔几关增加一只
  if (idx >= 3) {
    if (!newLvl.enemies) newLvl.enemies = [];
    const extraEnemyCount = Math.min(3, Math.floor((idx - 1) / 4)); // 第5关有1只，第9关有2只，第13关有3只...
    
    for (let i = 0; i < extraEnemyCount; i++) {
      let extraEnemyPos = null;
      // 随机寻找空地
      for (let attempt = 0; attempt < 50; attempt++) {
        let r = Math.floor(Math.random() * newLvl.size);
        let c = Math.floor(Math.random() * newLvl.size);
        if ((r === newLvl.start.r && c === newLvl.start.c) || (r === newLvl.target.r && c === newLvl.target.c)) continue;
        if (newLvl.obstacles.some(o => o.r === r && o.c === c)) continue;
        if (newLvl.enemies.some(e => e.start.r === r && e.start.c === c)) continue;
        extraEnemyPos = { r, c };
        break;
      }
      
      if (extraEnemyPos) {
        let eType = 'tiger';
        if (idx >= 29) {
          // 第30关起陆续出现新怪物
          const pool = ['tiger', 'spider', 'elephant', 'rhino', 'ghost', 'skeleton'];
          if (idx >= 32) pool.push('witch');
          if (idx >= 35) pool.push('zombie');
          if (idx >= 38) pool.push('magma');
          eType = pool[Math.floor(Math.random() * pool.length)];
        } else if (idx >= 14) {
          // level 15+: 混合大象、蜘蛛、老虎
          const r = Math.random();
          if (r < 0.25) eType = 'elephant';
          else if (r < 0.6) eType = 'spider';
        } else if (idx >= 4) {
          // level 5-14: 混合蜘蛛、老虎
          if (Math.random() < 0.4) eType = 'spider';
        }
        const commandsList = eType === 'magma' ? ['NONE'] : ['UP', 'DOWN', 'LEFT', 'RIGHT'];
        newLvl.enemies.push({ type: eType, start: extraEnemyPos, commands: commandsList });
      }
    }
  }

  // 确保每一关都包含至少一个骷髅士兵
  if (!newLvl.enemies) newLvl.enemies = [];
  const hasSkeleton = newLvl.enemies.some(e => e.type === 'skeleton');
  if (!hasSkeleton) {
    let skeletonPos = null;
    for (let r = 0; r < newLvl.size; r++) {
      for (let c = 0; c < newLvl.size; c++) {
        if ((r === newLvl.start.r && c === newLvl.start.c) || (r === newLvl.target.r && c === newLvl.target.c)) continue;
        if (newLvl.obstacles.some(o => o.r === r && o.c === c)) continue;
        if (newLvl.enemies.some(e => e.start && e.start.r === r && e.start.c === c)) continue;
        skeletonPos = { r, c };
        break;
      }
      if (skeletonPos) break;
    }
    if (skeletonPos) {
      const commandsList = idx < 5 ? ['NONE'] : ['LEFT', 'RIGHT'];
      newLvl.enemies.push({
        type: 'skeleton',
        start: skeletonPos,
        commands: commandsList
      });
    }
  }

  return newLvl;
});

const getThemeWeather = (theme) => {
  if (['frog', 'mouse'].includes(theme)) return 'rain';
  if (['penguin', 'bear'].includes(theme)) return 'snow';
  if (['alien', 'cat'].includes(theme)) return 'fog';
  return 'sun';
};

const getThemeBackground = (theme) => {
  const base = import.meta.env.BASE_URL;
  if (['fox', 'dog'].includes(theme)) return `${base}backgrounds/bg_forest.png`;
  if (['rabbit', 'monkey'].includes(theme)) return `${base}backgrounds/bg_meadow.png`;
  if (['frog'].includes(theme)) return `${base}backgrounds/bg_pond.png`;
  if (['penguin', 'bear'].includes(theme)) return `${base}backgrounds/bg_ice.png`;
  if (['alien'].includes(theme)) return `${base}backgrounds/bg_space.png`;
  return `${base}backgrounds/bg_indoor.png`; // cat, mouse
};

const WeatherOverlay = ({ weather }) => {
  if (weather === 'sun') {
    const sunParticles = [];
    for (let i = 0; i < 15; i++) {
      const left = Math.random() * 100 + '%';
      const top = 30 + Math.random() * 60 + '%';
      const size = (4 + Math.random() * 6) + 'px';
      const animDuration = (4 + Math.random() * 4) + 's';
      const delay = (Math.random() * -8) + 's';
      sunParticles.push(
        <div key={i} style={{
          position: 'absolute',
          left,
          top,
          width: size,
          height: size,
          background: 'rgba(255, 243, 176, 0.6)',
          borderRadius: '50%',
          boxShadow: '0 0 8px rgba(255, 243, 176, 0.8)',
          animation: `sunShimmer ${animDuration} linear ${delay} infinite`,
          pointerEvents: 'none'
        }} />
      );
    }
    return (
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'radial-gradient(circle at top left, rgba(255, 255, 200, 0.4) 0%, transparent 50%)',
          mixBlendMode: 'screen',
          pointerEvents: 'none'
        }} />
        {sunParticles}
      </div>
    );
  }
  if (weather === 'fog') {
    return (
      <div style={{
        position: 'absolute', top: '-10%', left: '-10%', right: '-10%', bottom: '-10%',
        pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.4) 100%)',
        animation: 'fogPan 20s infinite ease-in-out',
        mixBlendMode: 'screen',
        filter: 'blur(10px)'
      }} />
    );
  }
  if (weather === 'snow' || weather === 'rain') {
    const isSnow = weather === 'snow';
    const count = isSnow ? 30 : 40;
    const particles = [];
    for (let i=0; i<count; i++) {
      const left = Math.random() * 100 + '%';
      const animDuration = isSnow ? (3 + Math.random() * 3 + 's') : (0.5 + Math.random() * 0.5 + 's');
      const delay = Math.random() * -5 + 's';
      particles.push(
        <div key={i} style={{
          position: 'absolute',
          left,
          top: isSnow ? '-10px' : '-20px',
          width: isSnow ? '6px' : '2px',
          height: isSnow ? '6px' : '15px',
          background: isSnow ? 'white' : 'rgba(255,255,255,0.5)',
          borderRadius: isSnow ? '50%' : '0',
          animation: `${isSnow ? 'snowFall' : 'rainFall'} ${animDuration} linear ${delay} infinite`,
          pointerEvents: 'none'
        }} />
      );
    }
    return (
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        {particles}
      </div>
    );
  }
  return null;
};

export default function CodingMazeGame({ lang, onBack }) {
  const [levelIdx, setLevelIdx] = useState(() => {
    const saved = localStorage.getItem('codingMazeLevel');
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (isNaN(parsed)) return 0;
      return Math.min(Math.max(0, parsed), LEVELS.length - 1);
    }
    return 0;
  });
  
  const levelIdxRef = useRef(levelIdx);
  useEffect(() => {
    levelIdxRef.current = levelIdx;
  }, [levelIdx]);

  const currentLevel = LEVELS[levelIdx] || LEVELS[0];
  const tTheme = THEMES[currentLevel.theme] || THEMES.fox;
  const [commands, setCommands] = useState([]);
  const [pos, setPos] = useState({ ...currentLevel.start });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [executingIdx, setExecutingIdx] = useState(-1);
  const [caughtBy, setCaughtBy] = useState(null);
  const [isShaking, setIsShaking] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [isWalking, setIsWalking] = useState(false);
  const [trail, setTrail] = useState([]);
  const [pendingBombs, setPendingBombs] = useState([]);
  const [currentWeather, setCurrentWeather] = useState(getThemeWeather(currentLevel.theme));
  const [zoomScale, setZoomScale] = useState(1.0);
  const [inventory, setInventory] = useState(() => {
    try {
      const saved = localStorage.getItem('codingMazeInventory');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          normal: parsed.normal || 0,
          freeze: parsed.freeze || 0,
          super: parsed.super || 0,
          atomic: parsed.atomic || 0,
          torch: parsed.torch || 0,
          shield: parsed.shield || 0
        };
      }
    } catch(e) {}
    return { normal: 0, freeze: 0, super: 0, atomic: 0, torch: 0, shield: 0 };
  });
  const [activeBombType, setActiveBombType] = useState(null);
  const [activeExplosion, setActiveExplosion] = useState(null);
  const [activeAtomicExplosion, setActiveAtomicExplosion] = useState(null);
  const [showShop, setShowShop] = useState(false);
  const [shopTarget, setShopTarget] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const [hasShield, setHasShield] = useState(false);
  const [burningFires, setBurningFires] = useState([]);

  const [spiderWebs, setSpiderWebs] = useState([]);
  const [webStuckPrompt, setWebStuckPrompt] = useState(null);
  const [webStruggle, setWebStruggle] = useState(false);
  const [destroyedObstacles, setDestroyedObstacles] = useState([]);
  const [enemyHealths, setEnemyHealths] = useState([]);
  const [enemyPositions, setEnemyPositions] = useState([]);
  const [isSkeletonBattle, setIsSkeletonBattle] = useState(false);
  const [skeletonMistakes, setSkeletonMistakes] = useState(0);
  const [skeletonQuestionIdx, setSkeletonQuestionIdx] = useState(0);
  
  const [showMathQuiz, setShowMathQuiz] = useState(false);
  const [mathProblem, setMathProblem] = useState(null);
  const [mathInput, setMathInput] = useState('');
  const [isMathShaking, setIsMathShaking] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showParentGate, setShowParentGate] = useState(false);
  const [showMonsterMenu, setShowMonsterMenu] = useState(false);
  const [showLevelMap, setShowLevelMap] = useState(false);
  const [maxUnlockedLevel, setMaxUnlockedLevel] = useState(() => {
    const saved = localStorage.getItem('codingMazeMaxUnlockedLevel');
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed)) {
        return Math.min(Math.max(0, parsed), LEVELS.length - 1);
      }
    }
    const savedLvl = localStorage.getItem('codingMazeLevel');
    if (savedLvl) {
      const parsed = parseInt(savedLvl, 10);
      if (!isNaN(parsed)) return Math.min(Math.max(0, parsed), LEVELS.length - 1);
    }
    return 0;
  });
  const [parentGateProblem, setParentGateProblem] = useState(null);
  const [parentGateInput, setParentGateInput] = useState('');
  const [isParentGateShaking, setIsParentGateShaking] = useState(false);
  const [mathMin, setMathMin] = useState(() => {
    const saved = localStorage.getItem('codingMazeMathMin');
    return saved ? parseInt(saved, 10) : 10;
  });
  const [mathMax, setMathMax] = useState(() => {
    const saved = localStorage.getItem('codingMazeMathMax');
    return saved ? parseInt(saved, 10) : 20;
  });
  const [atomicMin, setAtomicMin] = useState(() => {
    const saved = localStorage.getItem('codingMazeAtomicMin');
    return saved ? parseInt(saved, 10) : 15;
  });
  const [atomicMax, setAtomicMax] = useState(() => {
    const saved = localStorage.getItem('codingMazeAtomicMax');
    return saved ? parseInt(saved, 10) : 30;
  });
  const [customMinInput, setCustomMinInput] = useState(mathMin);
  const [customMaxInput, setCustomMaxInput] = useState(mathMax);
  const [customAtomicMinInput, setCustomAtomicMinInput] = useState(atomicMin);
  const [customAtomicMaxInput, setCustomAtomicMaxInput] = useState(atomicMax);  const [normalNeeded, setNormalNeeded] = useState(() => {
    const saved = localStorage.getItem('codingMazeNormalNeeded');
    return saved ? parseInt(saved, 10) : 1;
  });
  const [freezeNeeded, setFreezeNeeded] = useState(() => {
    const saved = localStorage.getItem('codingMazeFreezeNeeded');
    return saved ? parseInt(saved, 10) : 2;
  });
  const [superNeeded, setSuperNeeded] = useState(() => {
    const saved = localStorage.getItem('codingMazeSuperNeeded');
    return saved ? parseInt(saved, 10) : 3;
  });
  const [atomicNeeded, setAtomicNeeded] = useState(() => {
    const saved = localStorage.getItem('codingMazeAtomicNeeded');
    return saved ? parseInt(saved, 10) : 10;
  });
  const [torchNeeded, setTorchNeeded] = useState(() => {
    const saved = localStorage.getItem('codingMazeTorchNeeded');
    return saved ? parseInt(saved, 10) : 2;
  });
  const [shieldNeeded, setShieldNeeded] = useState(() => {
    const saved = localStorage.getItem('codingMazeShieldNeeded');
    return saved ? parseInt(saved, 10) : 4;
  });

  const [normalAward, setNormalAward] = useState(() => {
    const saved = localStorage.getItem('codingMazeNormalAward');
    return saved ? parseInt(saved, 10) : 2;
  });
  const [freezeAward, setFreezeAward] = useState(() => {
    const saved = localStorage.getItem('codingMazeFreezeAward');
    return saved ? parseInt(saved, 10) : 1;
  });
  const [superAward, setSuperAward] = useState(() => {
    const saved = localStorage.getItem('codingMazeSuperAward');
    return saved ? parseInt(saved, 10) : 1;
  });
  const [atomicAward, setAtomicAward] = useState(() => {
    const saved = localStorage.getItem('codingMazeAtomicAward');
    return saved ? parseInt(saved, 10) : 1;
  });
  const [torchAward, setTorchAward] = useState(() => {
    const saved = localStorage.getItem('codingMazeTorchAward');
    return saved ? parseInt(saved, 10) : 1;
  });
  const [shieldAward, setShieldAward] = useState(() => {
    const saved = localStorage.getItem('codingMazeShieldAward');
    return saved ? parseInt(saved, 10) : 1;
  });

  const [inputNormalNeeded, setInputNormalNeeded] = useState(normalNeeded);
  const [inputFreezeNeeded, setInputFreezeNeeded] = useState(freezeNeeded);
  const [inputSuperNeeded, setInputSuperNeeded] = useState(superNeeded);
  const [inputAtomicNeeded, setInputAtomicNeeded] = useState(atomicNeeded);
  const [inputTorchNeeded, setInputTorchNeeded] = useState(torchNeeded);
  const [inputShieldNeeded, setInputShieldNeeded] = useState(shieldNeeded);

  const [inputNormalAward, setInputNormalAward] = useState(normalAward);
  const [inputFreezeAward, setInputFreezeAward] = useState(freezeAward);
  const [inputSuperAward, setInputSuperAward] = useState(superAward);
  const [inputAtomicAward, setInputAtomicAward] = useState(atomicAward);
  const [inputTorchAward, setInputTorchAward] = useState(torchAward);
  const [inputShieldAward, setInputShieldAward] = useState(shieldAward);

  const [inputNormalInv, setInputNormalInv] = useState(0);
  const [inputFreezeInv, setInputFreezeInv] = useState(0);
  const [inputSuperInv, setInputSuperInv] = useState(0);
  const [inputAtomicInv, setInputAtomicInv] = useState(0);
  const [inputTorchInv, setInputTorchInv] = useState(0);
  const [inputShieldInv, setInputShieldInv] = useState(0);
  const [inputLevelIdx, setInputLevelIdx] = useState(levelIdx);

  const [isMobile, setIsMobile] = useState(false);
  const resetTimeoutRef = useRef(null);
  const containerRef = useRef(null);
  const [mazeSize, setMazeSize] = useState(200);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const handleMouseMove = (e) => {
    if (isMobile || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const nx = (x / rect.width) * 2 - 1;
    const ny = (y / rect.height) * 2 - 1;
    setTilt({ rx: -ny * 8, ry: nx * 8 });
  };

  const handleMouseLeave = () => {
    if (!isMobile) setTilt({ rx: 0, ry: 0 });
  };

  useEffect(() => {
    setCurrentWeather(getThemeWeather(currentLevel.theme));
  }, [currentLevel.theme]);

  // Pure CSS layout handles the actual dimensions.
  // We use ResizeObserver ONLY to read the final size and compute font sizes.
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 600);
    handleResize();
    window.addEventListener('resize', handleResize);

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setMazeSize(Math.min(width, height));
        }
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    resetLevel();
  }, [levelIdx]);

  const triggerSettings = () => {
    audioSynth.playClick();
    const num1 = Math.floor(Math.random() * 5) + 5; // 5-9
    const num2 = Math.floor(Math.random() * 5) + 5; // 5-9
    setParentGateProblem({ num1, num2, ans: num1 * num2 });
    setParentGateInput('');
    setCustomMinInput(mathMin);
    setCustomMaxInput(mathMax);
    setCustomAtomicMinInput(atomicMin);
    setCustomAtomicMaxInput(atomicMax);
    
    setInputNormalNeeded(normalNeeded);
    setInputFreezeNeeded(freezeNeeded);
    setInputSuperNeeded(superNeeded);
    setInputAtomicNeeded(atomicNeeded);
    setInputTorchNeeded(torchNeeded);
    setInputShieldNeeded(shieldNeeded);

    setInputNormalAward(normalAward);
    setInputFreezeAward(freezeAward);
    setInputSuperAward(superAward);
    setInputAtomicAward(atomicAward);
    setInputTorchAward(torchAward);
    setInputShieldAward(shieldAward);

    setInputNormalInv(inventory.normal);
    setInputFreezeInv(inventory.freeze);
    setInputSuperInv(inventory.super);
    setInputAtomicInv(inventory.atomic);
    setInputTorchInv(inventory.torch || 0);
    setInputShieldInv(inventory.shield || 0);
    setInputLevelIdx(levelIdx);

    setShowParentGate(true);
  };

  const getEnemyAt = (r, c) => {
    if (!currentLevel.enemies) return -1;
    for (let idx = 0; idx < currentLevel.enemies.length; idx++) {
      const enemy = currentLevel.enemies[idx];
      if (enemyHealths[idx] <= 0) continue;
      const ep = enemyPositions[idx];
      if (!ep) continue;
      
      if (enemy.type === 'dinosaur') {
        if ((r === ep.r || r === ep.r + 1) && (c === ep.c || c === ep.c + 1)) {
          return idx;
        }
      } else {
        if (ep.r === r && ep.c === c) {
          return idx;
        }
      }
    }
    return -1;
  };

  const isCellOnFire = (r, c) => {
    if (!currentLevel.enemies) return false;
    for (let idx = 0; idx < currentLevel.enemies.length; idx++) {
      const enemy = currentLevel.enemies[idx];
      if (enemyHealths[idx] > 0) {
        const ep = enemyPositions[idx];
        if (!ep) continue;
        if (enemy.type === 'dinosaur') {
          // Top:
          if (r === ep.r - 1 && (c === ep.c || c === ep.c + 1)) return true;
          // Bottom:
          if (r === ep.r + 2 && (c === ep.c || c === ep.c + 1)) return true;
          // Left:
          if (c === ep.c - 1 && (r === ep.r || r === ep.r + 1)) return true;
          // Right:
          if (c === ep.c + 2 && (r === ep.r || r === ep.r + 1)) return true;
        } else if (enemy.type === 'magma') {
          // 1x1 Magma Golem fires: adjacent cells (Up, Down, Left, Right)
          if (Math.abs(r - ep.r) + Math.abs(c - ep.c) === 1) return true;
        }
      }
    }
    return false;
  };

  const resetLevel = () => {
    if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    setPos({ ...currentLevel.start });
    setCommands([]);
    setIsPlaying(false);
    setIsSolved(false);
    setStatusMsg('');
    setExecutingIdx(-1);
    setIsShaking(false);
    setIsJumping(false);
    setIsWalking(false);
    setActiveBombType(null);
    setActiveAtomicExplosion(null);
    setTrail([]);
    setPendingBombs([]);
    setDestroyedObstacles([]);
    setBurningFires([]);
    setHasShield(false);
    setEnemyHealths(currentLevel.enemies ? currentLevel.enemies.map(e => {
      if (e.type === 'dinosaur') return 4;
      if (e.type === 'elephant' || e.type === 'magma') return 3;
      if (e.type === 'tiger' || e.type === 'rhino' || e.type === 'witch' || e.type === 'zombie') return 2;
      if (e.type === 'skeleton') return 1;
      return 1;
    }) : []);
    setEnemyPositions(currentLevel.enemies ? currentLevel.enemies.map(e => ({...e.start})) : []);
  };

  const resetToStart = () => {
    if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    setIsShaking(false);
    setIsJumping(false);
    setIsWalking(false);
    setTrail([]);
    setSpiderWebs([]);
    setPos({ ...currentLevel.start });
    setStatusMsg('');
    setEnemyPositions(currentLevel.enemies ? currentLevel.enemies.map((e, i) => enemyHealths[i] <= 0 ? null : ({...e.start})) : []);
  };

  const triggerMathQuiz = (type, needed) => {
    audioSynth.playClick();
    const newTarget = { type, needed, answered: 0 };
    setShopTarget(newTarget);
    setShowShop(false);
    generateAndShowQuestion(newTarget);
  };

  const generateAndShowQuestion = (overrideTarget) => {
    const activeTarget = overrideTarget || shopTarget;
    const isAtomic = activeTarget && activeTarget.type === 'atomic';
    const currentMin = isAtomic ? atomicMin : mathMin;
    const currentMax = isAtomic ? atomicMax : mathMax;
    const q = mathGenerator.generateQuestion(4, { minNumber: currentMin, maxNumber: currentMax, operations: ['add', 'sub'], lang: lang });
    setMathProblem({ a: q.num1, b: q.num2, op: q.symbol, ans: q.answer });
    setMathInput('');
    setShowMathQuiz(true);
  };

  const handleMathSubmit = (e) => {
    e.preventDefault();
    if (parseInt(mathInput, 10) === mathProblem.ans) {
      audioSynth.playCorrect();
      
      if (webStuckPrompt) {
        webStuckPrompt.resolve(true);
        setWebStuckPrompt(null);
        if (!isSkeletonBattle) {
          setShowMathQuiz(false);
        }
        return;
      }

      const newAnswered = shopTarget.answered + 1;
      if (newAnswered >= shopTarget.needed) {
        const newInv = { ...inventory };
        if (shopTarget.type === 'normal') newInv.normal += normalAward;
        if (shopTarget.type === 'freeze') newInv.freeze += freezeAward;
        if (shopTarget.type === 'super') newInv.super += superAward;
        if (shopTarget.type === 'atomic') newInv.atomic += atomicAward;
        if (shopTarget.type === 'torch') newInv.torch = (newInv.torch || 0) + torchAward;
        if (shopTarget.type === 'shield') newInv.shield = (newInv.shield || 0) + shieldAward;
        setInventory(newInv);
        localStorage.setItem('codingMazeInventory', JSON.stringify(newInv));
        setShowMathQuiz(false);
        setShopTarget(null);
      } else {
        setShopTarget(prev => ({ ...prev, answered: newAnswered }));
        generateAndShowQuestion();
      }
    } else {
      audioSynth.playIncorrect();
      setIsMathShaking(true);
      setMathInput('');
      setTimeout(() => setIsMathShaking(false), 500);
      
      if (webStuckPrompt) {
        if (isSkeletonBattle) {
          setSkeletonMistakes(prev => {
            const next = prev + 1;
            if (next >= 2) {
              webStuckPrompt.resolve(false);
              setWebStuckPrompt(null);
              setShowMathQuiz(false);
            } else {
              setStatusMsg(lang === 'en' ? '❌ Wrong! One chance left.' : '❌ 答错了！还有最后一次机会。');
            }
            return next;
          });
        } else {
          webStuckPrompt.resolve(false);
          setWebStuckPrompt(null);
          setShowMathQuiz(false);
        }
      }
    }
  };

  const addCommand = (cmd) => {
    if (isPlaying || isSolved) return;
    audioSynth.playClick();
    if (commands.length < 50) {
      setCommands([...commands, cmd]);
      resetToStart();
    }
  };

  const removeCommand = (idx) => {
    if (isPlaying || isSolved) return;
    audioSynth.playClick();
    setCommands(commands.filter((_, i) => i !== idx));
    resetToStart();
  };

  const executeCommands = async () => {
    if (commands.length === 0 || isPlaying || isSolved) return;
    audioSynth.playClick();
    setIsPlaying(true);
    setStatusMsg(lang === 'en' ? 'Running...' : '运行中...');

    if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);

    let currentPos = { ...currentLevel.start };
    setPos(currentPos);
    setTrail([]);
    let currentWebs = [...spiderWebs];
    let currentEnemyPositions = currentLevel.enemies ? currentLevel.enemies.map((e, i) => enemyHealths[i] <= 0 ? null : ({...e.start})) : [];
    setEnemyPositions(currentEnemyPositions);

    const startLevelIdx = levelIdx;
    for (let i = 0; i < commands.length; i++) {
      if (levelIdxRef.current !== startLevelIdx) return;
      setExecutingIdx(i);
      const cmd = commands[i];
      setIsWalking(true);
      
      await new Promise(res => setTimeout(res, 450));
      setIsWalking(false);

      let nextR = currentPos.r;
      let nextC = currentPos.c;

      if (cmd === 'UP') nextR--;
      if (cmd === 'DOWN') nextR++;
      if (cmd === 'LEFT') nextC--;
      if (cmd === 'RIGHT') nextC++;

      if (nextR < 0 || nextR >= currentLevel.size || nextC < 0 || nextC >= currentLevel.size) {
        audioSynth.playIncorrect();
        setStatusMsg(lang === 'en' ? 'Oops! Hit a wall.' : '哎呀，撞墙了。');
        setIsPlaying(false);
        setExecutingIdx(-1);
        setIsShaking(true);
        resetTimeoutRef.current = setTimeout(() => {
          setIsShaking(false);
          setPos({ ...currentLevel.start });
          setEnemyPositions(currentLevel.enemies ? currentLevel.enemies.map((e, i) => enemyHealths[i] <= 0 ? null : ({...e.start})) : []);
        }, 500);
        return;
      }

      const hitObstacle = currentLevel.obstacles.some(o => o.r === nextR && o.c === nextC);
      const isDestroyed = destroyedObstacles.some(o => o.r === nextR && o.c === nextC);
      if (hitObstacle && !isDestroyed) {
        audioSynth.playIncorrect();
        setStatusMsg(lang === 'en' ? 'Oops! Hit an obstacle.' : '哎呀，撞到障碍物了。');
        setIsPlaying(false);
        setExecutingIdx(-1);
        setIsShaking(true);
        resetTimeoutRef.current = setTimeout(() => {
          setIsShaking(false);
          setPos({ ...currentLevel.start });
          setEnemyPositions(currentLevel.enemies ? currentLevel.enemies.map((e, i) => enemyHealths[i] <= 0 ? null : ({...e.start})) : []);
        }, 500);
        return;
      }

      if (currentLevel.enemies) {
        let anyElephantMoved = false;
        currentEnemyPositions = currentEnemyPositions.map((ep, eIdx) => {
          if (!ep) return null;
          const enemyDef = currentLevel.enemies?.[eIdx];
          if (!enemyDef) return null;
          
          if (enemyDef.type === 'spider') {
            if (!currentWebs.some(w => w.r === ep.r && w.c === ep.c)) {
              currentWebs.push({r: ep.r, c: ep.c});
              setSpiderWebs([...currentWebs]);
            }
          }
          if (enemyDef.type === 'elephant') {
            anyElephantMoved = true;
          }

          if (enemyDef.type === 'skeleton') {
            let er = ep.r, ec = ep.c;
            const chaseSteps = levelIdx < 5 ? 1 : 2;
            for (let s = 0; s < chaseSteps; s++) {
              let dr = nextR - er;
              let dc = nextC - ec;
              if (dr === 0 && dc === 0) break;
              if (Math.abs(dr) >= Math.abs(dc)) {
                er += dr > 0 ? 1 : -1;
              } else {
                ec += dc > 0 ? 1 : -1;
              }
            }
            return { r: er, c: ec };
          }

          const eCmd = enemyDef.commands[i % enemyDef.commands.length];
          let er = ep.r, ec = ep.c;
          let steps = enemyDef.type === 'rhino' ? 2 : 1;
          for (let s = 0; s < steps; s++) {
            let next_r = er;
            let next_c = ec;
            if (eCmd === 'UP') next_r--;
            if (eCmd === 'DOWN') next_r++;
            if (eCmd === 'LEFT') next_c--;
            if (eCmd === 'RIGHT') next_c++;
            if (next_r >= 0 && next_r < currentLevel.size && next_c >= 0 && next_c < currentLevel.size) {
                er = next_r;
                ec = next_c;
            }
          }
          return {r: er, c: ec};
        });
        setEnemyPositions(currentEnemyPositions);
        
        // Check if any enemy stepped onto a torch fire!
        currentEnemyPositions.forEach((ep, eIdx) => {
          if (!ep || enemyHealths[eIdx] <= 0) return;
          const isAtFire = burningFires.some(f => f.r === ep.r && f.c === ep.c);
          if (isAtFire) {
            // Deduct health
            setEnemyHealths(prev => {
              const next = [...prev];
              next[eIdx] = Math.max(0, next[eIdx] - 1);
              if (next[eIdx] <= 0) {
                // Enemy dies!
                currentEnemyPositions[eIdx] = null;
                setEnemyPositions([...currentEnemyPositions]);
                setStatusMsg(lang === 'en' ? '🔥 Enemy burned and vanished!' : '🔥 怪物踩中火把火焰消失了！');
              } else {
                setStatusMsg(lang === 'en' ? '🔥 Enemy burned by fire! (-1 HP)' : '🔥 怪物踩中火把火焰受到 1 点伤害！');
              }
              return next;
            });
            audioSynth.playBomb();
          }
        });
        
        if (anyElephantMoved) {
           setIsShaking(true);
           setTimeout(() => setIsShaking(false), 200); // short stomp shake
        }
      }

      const hitEnemyIdx = currentEnemyPositions.findIndex((ep, idx) => {
        if (!ep || enemyHealths[idx] <= 0) return false;
        const enemyDef = currentLevel.enemies?.[idx];
        if (!enemyDef) return false;
        if (enemyDef.type === 'dinosaur') {
          return (nextR === ep.r || nextR === ep.r + 1) && (nextC === ep.c || nextC === ep.c + 1);
        }
        if (enemyDef.type === 'skeleton') {
          const oldEp = enemyPositions[idx];
          const landed = ep.r === nextR && ep.c === nextC;
          const swapped = oldEp && (ep.r === currentPos.r && ep.c === currentPos.c) && (oldEp.r === nextR && oldEp.c === nextC);
          return landed || swapped;
        }
        return ep.r === nextR && ep.c === nextC;
      });
      const hitEnemy = hitEnemyIdx !== -1;
      
      const hitFire = currentLevel.enemies?.some((enemy, idx) => {
        if (enemy.type === 'dinosaur' && enemyHealths[idx] > 0) {
          const ep = currentEnemyPositions[idx];
          if (!ep) return false;
          if (nextR === ep.r - 1 && (nextC === ep.c || nextC === ep.c + 1)) return true;
          if (nextR === ep.r + 2 && (nextC === ep.c || nextC === ep.c + 1)) return true;
          if (nextC === ep.c - 1 && (nextR === ep.r || nextR === ep.r + 1)) return true;
          if (nextC === ep.c + 2 && (nextR === ep.r || nextR === ep.r + 1)) return true;
        }
        return false;
      }) || isCellOnFire(nextR, nextC);

      if (hitEnemy || hitFire) {
        const hitEnemyDef = hitEnemy ? currentLevel.enemies?.[hitEnemyIdx] : null;
        if (hitEnemyDef && hitEnemyDef.type === 'skeleton') {
          if (hasShield) {
            setHasShield(false);
            setStatusMsg(lang === 'en' ? '🛡️ Shield blocked skeleton battle!' : '🛡️ 护盾挡住了骷髅士兵！');
            audioSynth.playCorrect();
            setEnemyHealths(prev => {
              const next = [...prev];
              next[hitEnemyIdx] = 0;
              currentEnemyPositions[hitEnemyIdx] = null;
              setEnemyPositions([...currentEnemyPositions]);
              return next;
            });
          } else {
            audioSynth.playIncorrect();
            setStatusMsg(lang === 'en' ? '⚠️ Skeleton battle begins!' : '⚠️ 遭遇骷髅士兵，决斗开始！');
            
            setIsSkeletonBattle(true);
            setSkeletonMistakes(0);
            setSkeletonQuestionIdx(0);
            
            let wonBattle = true;
            for (let qIdx = 0; qIdx < 2; qIdx++) {
              setSkeletonQuestionIdx(qIdx);
              setStatusMsg(lang === 'en' 
                ? `Skeleton Battle! Solve question ${qIdx + 1}/2` 
                : `💀 骷髅决战！请解答第 ${qIdx + 1}/2 题`);
              
              const q = mathGenerator.generateQuestion(4, { minNumber: mathMin, maxNumber: mathMax, operations: ['add', 'sub'], lang: lang });
              setMathProblem({ a: q.num1, b: q.num2, op: q.symbol, ans: q.answer });
              setMathInput('');
              setShowMathQuiz(true);
              
              const solved = await new Promise(resolve => {
                setWebStuckPrompt({ resolve });
              });
              
              if (!solved) {
                wonBattle = false;
                break;
              }
              
              if (qIdx < 1) {
                await new Promise(res => setTimeout(res, 100));
              }
            }
            
            setShowMathQuiz(false);
            setIsSkeletonBattle(false);
            
            if (!wonBattle) {
              audioSynth.playIncorrect();
              setStatusMsg(lang === 'en' ? 'Defeated by the skeleton!' : '决斗失败，被骷髅兵击败！');
              setIsPlaying(false);
              setExecutingIdx(-1);
              setIsShaking(true);
              setCaughtBy('skeleton');
              
              resetTimeoutRef.current = setTimeout(() => {
                setIsShaking(false);
                setPos({ ...currentLevel.start });
                setEnemyPositions(currentLevel.enemies ? currentLevel.enemies.map((e, i) => enemyHealths[i] <= 0 ? null : ({...e.start})) : []);
                setSpiderWebs([]);
              }, 500);
              return;
            } else {
              audioSynth.playCorrect();
              setStatusMsg(lang === 'en' ? '🎉 Defeated the skeleton!' : '🎉 成功战胜骷髅兵，它化为尘土！');
              
              setEnemyHealths(prev => {
                const next = [...prev];
                next[hitEnemyIdx] = 0;
                currentEnemyPositions[hitEnemyIdx] = null;
                setEnemyPositions([...currentEnemyPositions]);
                return next;
              });
            }
          }
        } else {
          if (hasShield) {
            setHasShield(false);
            setStatusMsg(hitFire 
              ? (lang === 'en' ? '🛡️ Shield blocked fire damage!' : '🛡️ 护盾抵挡了一次火焰伤害！')
              : (lang === 'en' ? '🛡️ Shield blocked enemy hit!' : '🛡️ 护盾抵挡了一次怪兽袭击！'));
            audioSynth.playCorrect();
          } else {
            audioSynth.playIncorrect();
            setStatusMsg(hitFire 
              ? (lang === 'en' ? 'Oops! Burned by fire.' : '哎呀，被恐龙的火烧到了。')
              : (lang === 'en' ? 'Oops! Caught by an enemy.' : '哎呀，被敌人抓住了。'));
            setIsPlaying(false);
            setExecutingIdx(-1);
            setIsShaking(true);
            
            let caughtType = 'snake';
            if (hitEnemy) {
              caughtType = currentLevel.enemies?.[hitEnemyIdx]?.type || 'snake';
            } else if (hitFire) {
              caughtType = 'dinosaur';
            }
            setCaughtBy(caughtType);
            
            resetTimeoutRef.current = setTimeout(() => {
              setIsShaking(false);
              setPos({ ...currentLevel.start });
              setEnemyPositions(currentLevel.enemies ? currentLevel.enemies.map((e, i) => enemyHealths[i] <= 0 ? null : ({...e.start})) : []);
              setSpiderWebs([]);
            }, 500);
            return;
          }
        }
      }
      
      const hitWeb = currentWebs.some(w => w.r === nextR && w.c === nextC);
      if (hitWeb) {
         audioSynth.playIncorrect();
         setStatusMsg(lang === 'en' ? 'Stuck in a spider web!' : '被蜘蛛网粘住了！');
         setWebStruggle(true);
         
         const q = mathGenerator.generateQuestion(4, { minNumber: mathMin, maxNumber: mathMax, operations: ['add', 'sub'], lang: lang });
         setMathProblem({ a: q.num1, b: q.num2, op: q.symbol, ans: q.answer });
         setMathInput('');
         setShowMathQuiz(true);
         
         const solved = await new Promise(resolve => {
           setWebStuckPrompt({ resolve });
         });
         
         setWebStruggle(false);
         if (!solved) {
           audioSynth.playIncorrect();
           setStatusMsg(lang === 'en' ? 'Failed to escape!' : '没能挣脱蛛网...');
           setIsPlaying(false);
           setExecutingIdx(-1);
           setIsShaking(true);
           resetTimeoutRef.current = setTimeout(() => {
             setIsShaking(false);
             setPos({ ...currentLevel.start });
             setEnemyPositions(currentLevel.enemies ? currentLevel.enemies.map((e, i) => enemyHealths[i] <= 0 ? null : ({...e.start})) : []);
             setSpiderWebs([]);
           }, 500);
           return;
         } else {
           currentWebs = currentWebs.filter(w => w.r !== nextR || w.c !== nextC);
           setSpiderWebs([...currentWebs]);
           setStatusMsg(lang === 'en' ? 'Escaped the web!' : '成功挣脱！');
         }
      }

      setTrail(prev => [...prev, { ...currentPos }]);
      currentPos = { r: nextR, c: nextC };
      setPos(currentPos);
      audioSynth.playClick();
    }

    setExecutingIdx(-1);
    await new Promise(res => setTimeout(res, 300));

    if (currentPos.r === currentLevel.target.r && currentPos.c === currentLevel.target.c) {
      audioSynth.playCorrect();
      setStatusMsg(lang === 'en' ? 'Target reached!' : '到达终点啦！');
      setIsSolved(true);
      setIsJumping(true);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff5d9e', '#ffd6e8', '#ffadd2', '#bbf7d0', '#fef08a']
      });
    } else {
      audioSynth.playIncorrect();
      setStatusMsg(lang === 'en' ? 'Did not reach the target.' : '还没到达终点呢。');
      setIsShaking(true);
      resetTimeoutRef.current = setTimeout(() => {
        setIsShaking(false);
        setPos({ ...currentLevel.start });
        setEnemyPositions(currentLevel.enemies ? currentLevel.enemies.map((e, i) => enemyHealths[i] <= 0 ? null : ({...e.start})) : []);
      }, 500);
    }
    setIsPlaying(false);
  };

  const nextLevel = () => {
    audioSynth.playClick();
    const nextIdx = (levelIdx + 1) % LEVELS.length;
    setLevelIdx(nextIdx);
    localStorage.setItem('codingMazeLevel', nextIdx.toString());
    
    // Update max unlocked level progress
    const newMax = Math.max(maxUnlockedLevel, nextIdx);
    setMaxUnlockedLevel(newMax);
    localStorage.setItem('codingMazeMaxUnlockedLevel', newMax.toString());

    const newInv = { ...inventory, normal: inventory.normal + 1 };
    setInventory(newInv);
    localStorage.setItem('codingMazeInventory', JSON.stringify(newInv));
    setActiveBombType(null);
    setDestroyedObstacles([]);
  };

  const resetAllProgress = () => {
    if (window.confirm(lang === 'en' ? 'Reset all progress?' : '确定要重置所有闯关进度并回到第一关吗？')) {
      audioSynth.playClick();
      localStorage.removeItem('codingMazeLevel');
      localStorage.removeItem('codingMazeMaxUnlockedLevel');
      localStorage.removeItem('codingMazeInventory');
      setLevelIdx(0);
      setMaxUnlockedLevel(0);
      setInventory({ normal: 0, freeze: 0, super: 0, atomic: 0, torch: 0, shield: 0 });
      setActiveBombType(null);
      setActiveAtomicExplosion(null);
      setDestroyedObstacles([]);
      setEnemyHealths([]);
    }
  };

  const handleZoomIn = () => setZoomScale(prev => Math.min(prev + 0.1, 1.5));
  const handleZoomOut = () => setZoomScale(prev => Math.max(prev - 0.1, 0.4));

  const size = currentLevel.size;
  const gridPadding = isMobile ? 4 : 10;
  const gridGap = isMobile ? 3 : 6;
  const cellSize = Math.max(10, (mazeSize - 2 * gridPadding - (size - 1) * gridGap) / size);
  
  // Compact sizes for mobile controls
  const cmdBtnSize = isMobile ? 28 : 45;
  const dirBtnSize = isMobile ? 40 : 56;

  const renderGrid = () => {
    const tTheme = THEMES[currentLevel.theme] || THEMES.fox;
    const grid = [];
    
    const getPathPoints = () => {
      const allPoints = [...trail, pos];
      return allPoints.map(p => {
        const cx = gridPadding + p.c * (cellSize + gridGap) + cellSize / 2;
        const cy = gridPadding + p.r * (cellSize + gridGap) + cellSize / 2;
        return `${cx},${cy}`;
      }).join(' ');
    };

    const plannedPath = [];
    if (!isPlaying && commands.length > 0 && pos.r === currentLevel.start.r && pos.c === currentLevel.start.c) {
      let pr = pos.r;
      let pc = pos.c;
      for (let cmd of commands) {
        let nr = pr, nc = pc;
        if (cmd === 'UP') nr--;
        if (cmd === 'DOWN') nr++;
        if (cmd === 'LEFT') nc--;
        if (cmd === 'RIGHT') nc++;
        
        if (nr < 0 || nr >= currentLevel.size || nc < 0 || nc >= currentLevel.size) break;
        
        const hitObstacle = currentLevel.obstacles.some(o => o.r === nr && o.c === nc);
        const isDestroyed = destroyedObstacles.some(o => o.r === nr && o.c === nc);
        if (hitObstacle && !isDestroyed) break;
        
        pr = nr; pc = nc;
        plannedPath.push({r: pr, c: pc, cmd});
      }
    }

    for (let r = 0; r < currentLevel.size; r++) {
      const row = [];
      for (let c = 0; c < currentLevel.size; c++) {
        let content = null;
        let bg = (r + c) % 2 === 0 ? tTheme.bgFloor : tTheme.bgAlt;
        let shadowColor = (r + c) % 2 === 0 ? tTheme.bgAlt : '#cbd5e1';
        let borderColor = (r + c) % 2 === 0 ? tTheme.bgAlt : '#cbd5e1';

        const isObstacle = currentLevel.obstacles.some(o => o.r === r && o.c === c);
        const isDestroyed = destroyedObstacles.some(o => o.r === r && o.c === c);

        const enemyIdx = getEnemyAt(r, c);
        const isEnemy = enemyIdx !== -1;
        const isEnemyDestroyed = currentLevel.enemies?.some((e, i) => enemyHealths[i] <= 0 && e.start.r === r && e.start.c === c);

        const isPendingBomb = pendingBombs.some(p => p.r === r && p.c === c);
        const isFootprint = trail.some(t => t.r === r && t.c === c);

        const isWeb = spiderWebs.some(w => w.r === r && w.c === c);
        const isOnFire = isCellOnFire(r, c) || burningFires.some(f => f.r === r && f.c === c);

        if (isPendingBomb) {
          content = <span style={{ animation: 'fuseBurn 0.2s infinite alternate', display: 'inline-block' }}>🧨</span>;
        } else if (r === currentLevel.target.r && c === currentLevel.target.c) {
          content = <span style={{ animation: 'targetPulse 1.5s infinite', display: 'inline-block' }}>{tTheme.target}</span>;
          bg = '#bbf7d0';
          shadowColor = '#86efac';
          borderColor = '#4ade80';
        } else if (isObstacle && !isDestroyed) {
          content = <span style={{ animation: 'obstacleSway 3s infinite ease-in-out', display: 'inline-block', transformOrigin: 'bottom center' }}>{tTheme.obstacle}</span>;
          bg = tTheme.bgObstacle;
          shadowColor = '#fca5a5';
          borderColor = '#f87171';
        } else if ((isObstacle && isDestroyed) || isEnemyDestroyed) {
          content = null;
        } else if (isOnFire) {
          content = <span style={{ animation: 'fireWobble 0.6s infinite alternate', display: 'inline-block', fontSize: `${cellSize * 0.85}px` }}>🔥</span>;
          bg = '#ffedd5';
          borderColor = '#f97316';
          shadowColor = '#fdba74';
        } else if (isWeb) {
          content = <img src={`${import.meta.env.BASE_URL}spider_web.png`} style={{ width: '80%', height: '80%', opacity: 0.8 }} alt="web" />;
        } else if (isFootprint) {
          content = <div style={{ width: '40%', height: '40%', background: 'rgba(0,0,0,0.1)', borderRadius: '50%', animation: 'dustCloud 1s forwards' }}></div>;
        }

        let plannedArrowNode = null;
        // 暂时隐藏步伐显示功能，为了让小朋友多数数
        if (false && !isEnemy && !(r === currentLevel.start.r && c === currentLevel.start.c)) {
          const plannedSteps = plannedPath.filter(p => p.r === r && p.c === c);
          if (plannedSteps.length > 0) {
            const lastStep = plannedSteps[plannedSteps.length - 1];
            let arrow = '';
            if (lastStep.cmd === 'UP') arrow = '⬆️';
            if (lastStep.cmd === 'DOWN') arrow = '⬇️';
            if (lastStep.cmd === 'LEFT') arrow = '⬅️';
            if (lastStep.cmd === 'RIGHT') arrow = '➡️';
            plannedArrowNode = <div style={{ 
              position: 'absolute', inset: 0, 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: 0.35, fontSize: isMobile ? '1.5rem' : '2rem', 
              filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.2))',
              pointerEvents: 'none', zIndex: 5 
            }}>{arrow}</div>;
          }
        }

        const canBomb = activeBombType !== null && (activeBombType === 'atomic' || activeBombType === 'torch' ? true : ((isObstacle && !isDestroyed) || isEnemy));

        row.push(
          <div key={`${r}-${c}`} style={{
            flex: 1,
            height: '100%',
            backgroundColor: bg,
            borderRadius: isMobile ? '6px' : '12px',
            border: `${isMobile ? 1 : 2}px solid ${borderColor}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: `${cellSize * 0.95}px`,
            boxShadow: `0 ${isMobile ? 2 : 4}px 0 ${shadowColor}`,
            position: 'relative',
            cursor: canBomb ? 'crosshair' : (isEnemy && activeBombType === null ? 'pointer' : 'default'),
            outline: canBomb ? '2px solid red' : 'none',
            outlineOffset: '-2px'
          }} onClick={() => {
            if (canBomb && !isPendingBomb) {
              const usedBomb = activeBombType;
              setActiveBombType(null);
              const newInv = { ...inventory, [usedBomb]: (inventory[usedBomb] || 0) - 1 };
              setInventory(newInv);
              localStorage.setItem('codingMazeInventory', JSON.stringify(newInv));

              setPendingBombs([...pendingBombs, {r, c}]);
              audioSynth.playClick();
              setTimeout(() => {
                if (usedBomb === 'freeze') audioSynth.playFreezeBomb();
                else if (usedBomb === 'super') audioSynth.playSuperBomb();
                else if (usedBomb === 'atomic') {
                  audioSynth.playSuperBomb();
                  // extra impact sound simulated by playSuperBomb
                }
                else audioSynth.playBomb();
                
                if (usedBomb === 'atomic') {
                  setIsShaking(true);
                  setTimeout(() => setIsShaking(false), 1500);
                  
                  const explId = Date.now();
                  setActiveAtomicExplosion({ id: explId });
                  setTimeout(() => {
                    setActiveAtomicExplosion(prev => prev && prev.id === explId ? null : prev);
                  }, 2000);
                  
                  setEnemyHealths(prev => prev.map(() => 0));
                  setDestroyedObstacles(currentLevel.obstacles.map(o => ({ r: o.r, c: o.c })));
                } else {
                  setIsShaking(true);
                  setTimeout(() => setIsShaking(false), 300);
                  
                  const explId = Date.now();
                  setActiveExplosion({ r, c, type: usedBomb === 'torch' ? 'normal' : usedBomb, id: explId });
                  setTimeout(() => {
                    setActiveExplosion(prev => prev && prev.id === explId ? null : prev);
                  }, 500);
                }
                
                if (containerRef.current) {
                  const rect = containerRef.current.getBoundingClientRect();
                  const cellW = rect.width / currentLevel.size;
                  const cellH = rect.height / currentLevel.size;
                  const absX = rect.left + c * cellW + cellW / 2;
                  const absY = rect.top + r * cellH + cellH / 2;
                  
                  if (usedBomb === 'atomic') {
                    for (let i = 0; i < 5; i++) {
                      setTimeout(() => {
                        confetti({
                          particleCount: 100,
                          spread: 180,
                          startVelocity: 45,
                          origin: {
                            x: Math.random(),
                            y: Math.random()
                          },
                          colors: ['#a855f7', '#d8b4fe', '#f3e8ff', '#f43f5e', '#fb7185', '#10b981'],
                          ticks: 150,
                          gravity: 0.8
                        });
                      }, i * 200);
                    }
                  } else {
                    confetti({
                      particleCount: usedBomb === 'torch' ? 50 : 80,
                      spread: usedBomb === 'torch' ? 80 : 100,
                      startVelocity: 30,
                      origin: {
                        x: absX / window.innerWidth,
                        y: absY / window.innerHeight
                      },
                      colors: usedBomb === 'torch' ? ['#f97316', '#fdba74', '#ef4444', '#f59e0b'] : (usedBomb === 'freeze' ? ['#60a5fa', '#93c5fd', '#bfdbfe', '#ffffff'] : ['#ef4444', '#f97316', '#eab308', '#27272a', '#64748b']),
                      ticks: 100,
                      gravity: 1.2
                    });
                  }
                }
                
                setPendingBombs(prev => prev.filter(p => p.r !== r || p.c !== c));
                
                if (usedBomb !== 'atomic') {
                  if (usedBomb === 'torch') {
                    setBurningFires(prev => [...prev, { r, c }]);
                    if (isObstacle) {
                      setDestroyedObstacles(prev => [...prev, { r, c }]);
                    }
                    if (isEnemy) {
                      setEnemyHealths(prev => {
                        const next = [...prev];
                        next[enemyIdx] = Math.max(0, next[enemyIdx] - 1);
                        if (next[enemyIdx] <= 0) {
                          // Clean up position instantly
                          const epCopy = [...enemyPositions];
                          epCopy[enemyIdx] = null;
                          setEnemyPositions(epCopy);
                        }
                        return next;
                      });
                    }
                  } else {
                    if (isEnemy) {
                      setEnemyHealths(prev => {
                        const next = [...prev];
                        let dmg = 1;
                        if (usedBomb === 'freeze') dmg = 2;
                        if (usedBomb === 'super') dmg = 3;
                        
                        const eType = currentLevel.enemies?.[enemyIdx]?.type || 'snake';
                        if (eType === 'turtle' && usedBomb !== 'super') {
                          dmg = 0; // Immune to normal/freeze bombs
                        }
                        
                        next[enemyIdx] -= dmg;
                        if (next[enemyIdx] <= 0) {
                          // Clean up position instantly
                          const epCopy = [...enemyPositions];
                          epCopy[enemyIdx] = null;
                          setEnemyPositions(epCopy);
                        }
                        return next;
                      });
                    } else {
                      setDestroyedObstacles(prev => [...prev, { r, c }]);
                    }
                  }
                }
              }, 500);
            } else if (isEnemy && activeBombType === null) {
              const eType = currentLevel.enemies?.[enemyIdx]?.type || 'snake';
              if (['tiger', 'elephant', 'spider', 'rhino', 'turtle', 'snake', 'dinosaur', 'ghost', 'witch', 'zombie', 'magma', 'skeleton'].includes(eType)) {
                audioSynth.playClick();
                setPreviewImage(`${import.meta.env.BASE_URL}${eType}_3d.png`);
              }
            }
          }}>
            {content}
            {plannedArrowNode}
            {activeExplosion && activeExplosion.r === r && activeExplosion.c === c && (
              <img 
                src={`${import.meta.env.BASE_URL}expl_${activeExplosion.type}.png`} 
                alt="explosion"
                style={{
                  position: 'absolute', top: '50%', left: '50%',
                  width: '280%', height: '280%', zIndex: 999,
                  objectFit: 'contain',
                  pointerEvents: 'none',
                  animation: 'magicExplosion 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
                  color: activeExplosion.type === 'freeze' ? '#93c5fd' : activeExplosion.type === 'super' ? '#fde047' : '#fca5a5'
                }} 
              />
            )}
          </div>
        );
      }
      grid.push(
        <div key={r} style={{ display: 'flex', gap: `${gridGap}px`, flex: 1 }}>
          {row}
        </div>
      );
    }
    return (
      <div className="maze-grid-container" key={levelIdx} style={{
        animation: activeAtomicExplosion 
          ? 'gridAtomicShake 1.8s ease-in-out' 
          : 'bounceInDrop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: `${gridGap}px`,
        padding: `${gridPadding}px`,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderRadius: isMobile ? '12px' : '24px',
        border: `${isMobile ? 2 : 4}px solid rgba(255, 255, 255, 0.9)`,
        boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
        boxSizing: 'border-box'
      }}>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes targetPulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.12); filter: brightness(1.15); }
            }
            @keyframes heroShake {
              0%, 100% { transform: translateX(0); }
              25% { transform: translateX(-6px) rotate(-8deg); }
              50% { transform: translateX(6px) rotate(8deg); }
              75% { transform: translateX(-6px) rotate(-8deg); }
            }
            @keyframes heroJump {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-14px) scale(1.08); }
            }
            @keyframes cmdActive {
              0% { transform: scale(1); box-shadow: 0 3px 0 #1e40af; }
              50% { transform: scale(1.12); box-shadow: 0 6px 10px rgba(59, 130, 246, 0.6), 0 3px 0 #1e40af; z-index: 10; }
              100% { transform: scale(1); box-shadow: 0 3px 0 #1e40af; }
            }
            @keyframes obstacleSway {
              0%, 100% { transform: rotate(0deg); }
              50% { transform: rotate(4deg); }
            }
            @keyframes webStruggle {
              0%, 100% { transform: translateX(0) rotate(0deg); }
              20% { transform: translateX(-5px) rotate(-12deg); }
              40% { transform: translateX(5px) rotate(12deg); }
              60% { transform: translateX(-5px) rotate(-12deg); }
              80% { transform: translateX(5px) rotate(12deg); }
            }
            @keyframes victorySpin {
              0% { transform: rotate(0deg) scale(1); }
              50% { transform: rotate(180deg) scale(1.3); }
              100% { transform: rotate(360deg) scale(1); }
            }
            @keyframes idleBreathing {
              0% { transform: scale(1, 1); }
              100% { transform: scale(1.05, 0.95); }
            }
            @keyframes hoverWobble {
              0% { transform: translateY(0) rotate(-2deg); }
              50% { transform: translateY(-5px) rotate(2deg); }
              100% { transform: translateY(0) rotate(-2deg); }
            }
            @keyframes shakeAngry {
              0%, 100% { transform: translateX(0); }
              25% { transform: translateX(-2px) rotate(-2deg); }
              75% { transform: translateX(2px) rotate(2deg); }
            }
            @keyframes dustCloud {
              0% { transform: scale(0.5); opacity: 0.6; }
              100% { transform: scale(1.8); opacity: 0; }
            }
            @keyframes floatFloat {
              0%, 100% { transform: translateY(0) rotate(0deg); }
              50% { transform: translateY(-8px) rotate(3deg); }
            }
            @keyframes twinkleScale {
              0%, 100% { transform: scale(1); opacity: 0.7; }
              50% { transform: scale(1.3); opacity: 1; }
            }
            @keyframes magicExplosion {
              0% { transform: translate(-50%, -50%) scale(0.1) rotate(-20deg); opacity: 0.5; filter: brightness(2) drop-shadow(0 0 10px white); }
              40% { transform: translate(-50%, -50%) scale(1.2) rotate(15deg); opacity: 1; filter: brightness(1.2) drop-shadow(0 0 25px currentColor); }
              70% { transform: translate(-50%, -50%) scale(0.9) rotate(-5deg); opacity: 0.9; filter: drop-shadow(0 0 15px currentColor); }
              100% { transform: translate(-50%, -50%) scale(1.4) rotate(5deg); opacity: 0; filter: blur(4px); }
            }
            @keyframes bombExplosion {
              0% { transform: scale(0.2); opacity: 1; filter: brightness(2) drop-shadow(0 0 10px #ef4444); }
              40% { transform: scale(1.6); opacity: 1; filter: brightness(1.5) drop-shadow(0 0 20px #ef4444); }
              70% { transform: scale(1.1); opacity: 0.8; filter: drop-shadow(0 0 5px #ef4444); }
              100% { transform: scale(1); opacity: 0.3; filter: grayscale(100%); }
            }
            @keyframes bombPulse {
              0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); transform: scale(1); }
              70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); transform: scale(1.05); }
              100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); transform: scale(1); }
            }
            @keyframes fireWobble {
              0% { transform: scale(1) rotate(-3deg); filter: drop-shadow(0 2px 4px #f97316); }
              100% { transform: scale(1.1) rotate(3deg); filter: drop-shadow(0 4px 8px #ef4444); }
            }
            @keyframes dinoBreathing {
              0% { transform: scale(1) translateY(0); }
              50% { transform: scale(1.05, 0.95) translateY(-2px); filter: drop-shadow(0 5px 8px rgba(239, 68, 68, 0.4)); }
              100% { transform: scale(1) translateY(0); }
            }
            @keyframes ghostFloat {
              0%, 100% { transform: translateY(0) scale(1) rotate(-1deg); opacity: 0.65; filter: drop-shadow(0 4px 6px rgba(168, 85, 247, 0.25)); }
              50% { transform: translateY(-6px) scale(0.96) rotate(2deg); opacity: 0.85; filter: drop-shadow(0 8px 12px rgba(168, 85, 247, 0.45)); }
            }
            @keyframes witchHover {
              0%, 100% { transform: translateY(0) rotate(-2deg); }
              50% { transform: translateY(-4px) rotate(2deg) scale(1.02); }
            }
            @keyframes zombieLimp {
              0%, 100% { transform: translate(0, 0) rotate(0deg); }
              25% { transform: translate(-1px, -2px) rotate(-6deg); }
              50% { transform: translate(0, 0) rotate(0deg); }
              75% { transform: translate(1px, -1px) rotate(4deg); }
            }
            @keyframes skeletonRattle {
              0%, 100% { transform: translate(0, 0) rotate(0deg); }
              20% { transform: translate(-1.5px, 0.5px) rotate(-2deg); }
              40% { transform: translate(1.5px, -0.5px) rotate(2deg); }
              60% { transform: translate(-1.5px, -0.5px) rotate(-1deg); }
              80% { transform: translate(1.5px, 0.5px) rotate(1deg); }
            }
            @keyframes magmaBubble {
              0%, 100% { transform: scale(1) skewX(0deg); filter: drop-shadow(0 2px 4px #dc2626) brightness(1); }
              50% { transform: scale(1.05, 0.95) skewX(1deg); filter: drop-shadow(0 4px 8px #f97316) brightness(1.25); }
            }
            @keyframes fireSpit {
              0%, 100% { transform: scale(0) translate(0, 0); opacity: 0; }
              30% { transform: scale(1.2) translate(8px, -8px); opacity: 1; }
              60% { transform: scale(1.5) translate(24px, -24px); opacity: 0.8; }
              80% { transform: scale(1.0) translate(32px, -32px); opacity: 0; }
            }
            @keyframes atomicFlash {
              0% { background: rgba(255, 255, 255, 0.95); }
              15% { background: rgba(168, 85, 247, 0.8); }
              40% { background: rgba(244, 63, 94, 0.4); }
              100% { background: rgba(0, 0, 0, 0); }
            }
            @keyframes atomicMushroom {
              0% { transform: scale(0.15) translateY(120px); opacity: 0; filter: brightness(3) saturate(2); }
              15% { transform: scale(1) translateY(0); opacity: 1; filter: brightness(1.5) saturate(1.5); }
              50% { transform: scale(1.1) translateY(-10px); opacity: 1; filter: brightness(1.1); }
              100% { transform: scale(1.3) translateY(-30px); opacity: 0; filter: blur(10px) brightness(0.8); }
            }
            @keyframes atomicRing {
              0% { transform: scale(0.1); opacity: 0; filter: brightness(2) drop-shadow(0 0 5px #a855f7); }
              10% { transform: scale(0.4); opacity: 1; filter: brightness(2) drop-shadow(0 0 15px #a855f7); }
              50% { transform: scale(1.3); opacity: 0.8; filter: brightness(1.2) drop-shadow(0 0 10px #10b981); }
              100% { transform: scale(2.2); opacity: 0; filter: blur(8px); }
            }
            @keyframes atomicCore {
              0% { transform: scale(0.2) rotate(0deg); opacity: 0; filter: brightness(3); }
              15% { transform: scale(1.1) rotate(15deg); opacity: 1; filter: brightness(1.8) drop-shadow(0 0 20px #ef4444); }
              35% { transform: scale(1.05) rotate(-10deg); opacity: 0.9; }
              70% { transform: scale(0.9) rotate(5deg); opacity: 0.6; }
              100% { transform: scale(0); opacity: 0; filter: blur(5px); }
            }
            @keyframes gridAtomicShake {
              0%, 100% { transform: scale(1) translate(0, 0) rotate(0deg); }
              5% { transform: scale(1.05) translate(-10px, -10px) rotate(-2deg); }
              10% { transform: scale(1.1) translate(12px, 12px) rotate(3deg); }
              15% { transform: scale(1.08) translate(-15px, 8px) rotate(-4deg); }
              20% { transform: scale(1.12) translate(14px, -12px) rotate(3deg); }
              25% { transform: scale(1.1) translate(-12px, 10px) rotate(-3deg); }
              35% { transform: scale(1.05) translate(8px, -8px) rotate(2deg); }
              45% { transform: scale(1.02) translate(-6px, 6px) rotate(-1deg); }
              55% { transform: scale(1.01) translate(4px, -4px) rotate(1deg); }
              65% { transform: scale(1) translate(-2px, 2px) rotate(0deg); }
              75% { transform: scale(1) translate(1px, -1px) rotate(0deg); }
            }
          `}
        </style>
        

        {grid}
        {trail.length > 0 && (
          <svg style={{
            position: 'absolute',
            top: 0, left: 0,
            width: '100%', height: '100%',
            pointerEvents: 'none',
            zIndex: 5
          }}>
            <polyline 
              points={getPathPoints()}
              fill="none"
              stroke="#fef08a"
              strokeWidth={isMobile ? "4" : "6"}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                filter: 'drop-shadow(0 0 8px #fde047)',
                strokeDasharray: '10, 15',
                animation: 'dashFlow 1s linear infinite'
              }}
            />
          </svg>
        )}
        {/* Hero overlay */}
        <div style={{
          position: 'absolute',
          top: `calc(${gridPadding}px + ${pos.r} * (100% - ${2 * gridPadding}px + ${gridGap}px) / ${size})`,
          left: `calc(${gridPadding}px + ${pos.c} * (100% - ${2 * gridPadding}px + ${gridGap}px) / ${size})`,
          width: `calc((100% - ${2 * gridPadding}px - ${(size - 1) * gridGap}px) / ${size})`,
          height: `calc((100% - ${2 * gridPadding}px - ${(size - 1) * gridGap}px) / ${size})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: `${cellSize * 0.95}px`,
          transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
          animation: webStruggle ? 'webStruggle 0.3s infinite' : (isShaking ? 'heroShake 0.4s' : (isSolved ? 'victorySpin 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards' : (isJumping ? 'heroJump 0.5s infinite' : (isWalking ? 'wobbleWalk 0.4s infinite' : 'none')))),
          zIndex: 10,
          filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.25))'
        }}>
          {hasShield && (
            <div style={{
              position: 'absolute',
              inset: '-6px',
              borderRadius: '50%',
              border: '3px dashed #60a5fa',
              boxShadow: '0 0 10px #3b82f6, inset 0 0 10px #3b82f6',
              animation: 'spin 4s linear infinite',
              pointerEvents: 'none'
            }} />
          )}
          {tTheme.hero}
        </div>
        {/* Enemy overlays */}
        {enemyPositions.map((ep, i) => {
          if (!ep) return null;
          if (enemyHealths[i] <= 0) return null;
          const eType = currentLevel.enemies?.[i]?.type || 'snake';
          const maxHealth = eType === 'dinosaur' ? 4 : 
                            (eType === 'elephant' || eType === 'magma') ? 3 : 
                            (eType === 'tiger' || eType === 'rhino' || eType === 'witch' || eType === 'zombie') ? 2 : 1;
          const curHealth = enemyHealths[i];
          
          const isDinosaur = eType === 'dinosaur';
          const span = isDinosaur ? 2 : 1;
          const widthStr = `calc(${span} * (100% - ${2 * gridPadding}px - ${(size - 1) * gridGap}px) / ${size} + ${span - 1} * ${gridGap}px)`;
          const heightStr = `calc(${span} * (100% - ${2 * gridPadding}px - ${(size - 1) * gridGap}px) / ${size} + ${span - 1} * ${gridGap}px)`;
          
          return (
            <div key={`enemy-${i}`} style={{
              position: 'absolute',
              top: `calc(${gridPadding}px + ${ep.r} * (100% - ${2 * gridPadding}px + ${gridGap}px) / ${size})`,
              left: `calc(${gridPadding}px + ${ep.c} * (100% - ${2 * gridPadding}px + ${gridGap}px) / ${size})`,
              width: widthStr,
              height: heightStr,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: `${cellSize * 0.7}px`,
              transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
              zIndex: 9,
              pointerEvents: 'none'
            }}>
              {['tiger', 'elephant', 'spider', 'rhino', 'turtle', 'snake', 'dinosaur', 'ghost', 'witch', 'zombie', 'magma', 'skeleton'].includes(eType) ? (
                <div style={{ 
                  position: 'relative', 
                  width: '100%', 
                  height: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  opacity: eType === 'ghost' ? 0.75 : 1
                }}>
                  <img src={`${import.meta.env.BASE_URL}${eType}_3d.png`} style={{
                    width: eType === 'elephant' ? '120%' : eType === 'rhino' ? '110%' : eType === 'turtle' ? '85%' : '95%', 
                    height: eType === 'elephant' ? '120%' : eType === 'rhino' ? '110%' : eType === 'turtle' ? '85%' : '95%', 
                    objectFit: 'contain',
                    animation: isPlaying ? 'wobbleWalk 0.4s infinite' : 
                               (eType === 'rhino' ? 'shakeAngry 0.8s infinite' : 
                                eType === 'turtle' ? 'hoverWobble 2s infinite ease-in-out' :
                                eType === 'spider' ? 'hoverWobble 1.2s infinite ease-in-out' :
                                eType === 'snake' ? 'hoverWobble 1s infinite' :
                                eType === 'dinosaur' ? 'dinoBreathing 1.8s infinite alternate' :
                                eType === 'ghost' ? 'ghostFloat 2s infinite ease-in-out' :
                                eType === 'witch' ? 'witchHover 1.5s infinite ease-in-out' :
                                eType === 'zombie' ? 'zombieLimp 1.2s infinite' :
                                eType === 'magma' ? 'magmaBubble 1.4s infinite alternate' :
                                eType === 'skeleton' ? 'skeletonRattle 0.5s infinite' :
                                'idleBreathing 1.5s infinite alternate'),
                    filter: `drop-shadow(0 ${isMobile ? 3 : 5}px ${isMobile ? 3 : 5}px rgba(0,0,0,0.3))`
                  }} />
                  {isDinosaur && (
                    <div style={{
                      position: 'absolute',
                      top: '10%',
                      right: '10%',
                      fontSize: `${cellSize * 0.75}px`,
                      animation: 'fireSpit 1.8s infinite ease-in-out',
                      pointerEvents: 'none'
                    }}>
                      🔥
                    </div>
                  )}
                </div>
              ) : '🐯'}
              {maxHealth > 1 && (
                <div style={{
                  position: 'absolute', bottom: '4%', left: 0, right: 0,
                  display: 'flex', justifyContent: 'center', gap: '3px'
                }}>
                  {Array.from({ length: maxHealth }).map((_, i) => (
                    <div key={i} style={{
                      width: isMobile ? '6px' : '8px', 
                      height: isMobile ? '6px' : '8px', 
                      borderRadius: '50%',
                      background: i < curHealth ? '#ef4444' : 'rgba(0,0,0,0.3)',
                      boxShadow: i < curHealth ? '0 1px 2px rgba(0,0,0,0.5)' : 'none',
                      transition: 'background 0.3s'
                    }} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {activeAtomicExplosion && (
          <div style={{
            position: 'absolute',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            borderRadius: isMobile ? '12px' : '24px',
            overflow: 'hidden'
          }}>
            {/* Layer 1: Fullscreen flashing background */}
            <div style={{
              position: 'absolute',
              inset: 0,
              animation: 'atomicFlash 2.2s ease-out forwards',
              zIndex: 1
            }} />
            
            {/* Layer 2: Expanding energy shockwave ring */}
            <img 
              src={`${import.meta.env.BASE_URL}atomic_blast_wave.png`} 
              alt="shockwave" 
              style={{
                position: 'absolute',
                width: '150%',
                height: '150%',
                objectFit: 'contain',
                animation: 'atomicRing 1.8s cubic-bezier(0.1, 0.8, 0.2, 1) forwards',
                zIndex: 2
              }}
            />

            {/* Layer 3: Glowing nuclear fireball core */}
            <img 
              src={`${import.meta.env.BASE_URL}atomic_fireball.png`} 
              alt="fireball" 
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                animation: 'atomicCore 1.6s ease-out forwards',
                zIndex: 3
              }}
            />

            {/* Layer 4: Giant rising mushroom cloud */}
            <img 
              src={`${import.meta.env.BASE_URL}expl_atomic.png`} 
              alt="nuclear blast" 
              style={{
                position: 'absolute',
                width: '120%',
                height: '120%',
                objectFit: 'contain',
                animation: 'atomicMushroom 2.2s cubic-bezier(0.1, 0.8, 0.3, 1) forwards',
                zIndex: 4
              }}
            />
          </div>
        )}
      </div>
    );
  };

  const getCmdIcon = (cmd) => {
    const s = isMobile ? 16 : 20;
    if (cmd === 'UP') return <ArrowUp size={s} />;
    if (cmd === 'DOWN') return <ArrowDown size={s} />;
    if (cmd === 'LEFT') return <ArrowLeft size={s} />;
    if (cmd === 'RIGHT') return <ArrowRight size={s} />;
    return null;
  };


  const headerNode = (
    <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMobile ? '3px' : '12px', flexShrink: 0 }}>
      <div style={{ display: 'flex', gap: isMobile ? '4px' : '8px', alignItems: 'center' }}>
        <button className="bouncy-button secondary" onClick={onBack} style={{ width: isMobile ? '32px' : '44px', height: isMobile ? '32px' : '44px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
          <ArrowLeft size={isMobile ? 18 : 22} />
        </button>
        <button className="bouncy-button secondary" onClick={resetAllProgress} style={{ width: isMobile ? '32px' : '44px', height: isMobile ? '32px' : '44px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }} title={lang === 'en' ? 'Reset Progress' : '重置所有进度'}>
          <RotateCcw size={isMobile ? 18 : 22} />
        </button>
        <button className="bouncy-button secondary" onClick={() => { audioSynth.playClick(); setShowMonsterMenu(true); }} style={{ width: isMobile ? '32px' : '44px', height: isMobile ? '32px' : '44px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: isMobile ? '16px' : '20px' }} title={lang === 'en' ? 'Monster Guide' : '怪物图鉴'}>
          👾
        </button>
        <button className="bouncy-button secondary" onClick={() => { audioSynth.playClick(); setShowLevelMap(true); }} style={{ width: isMobile ? '32px' : '44px', height: isMobile ? '32px' : '44px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: isMobile ? '16px' : '20px' }} title={lang === 'en' ? 'Select Level' : '选择关卡'}>
          🗺️
        </button>
      </div>
      <h2 style={{ color: '#c0487a', margin: '0 5px', fontSize: isMobile ? '1.1rem' : 'clamp(1rem, 3vw, 1.4rem)', textAlign: 'center', flex: 1, lineHeight: '1.2' }}>
        {lang === 'en' ? (isMobile ? `${levelIdx + 1}/${LEVELS.length}` : `Maze (${levelIdx + 1}/${LEVELS.length})`) : (isMobile ? `第${levelIdx + 1}关` : `编程迷宫 (${levelIdx + 1}/${LEVELS.length})`)}
      </h2>
      <div style={{ display: 'flex', gap: isMobile ? '4px' : '8px', alignItems: 'center' }}>
        <button className="bouncy-button secondary" onClick={triggerSettings} style={{ width: isMobile ? '32px' : '44px', height: isMobile ? '32px' : '44px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }} title={lang === 'en' ? 'Settings' : '设置'}>
          <Settings size={isMobile ? 18 : 22} />
        </button>
        <button className="bouncy-button secondary" onClick={handleZoomOut} style={{ width: isMobile ? '32px' : '44px', height: isMobile ? '32px' : '44px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }} title="缩小">
          <ZoomOut size={isMobile ? 18 : 22} />
        </button>
        <button className="bouncy-button secondary" onClick={handleZoomIn} style={{ width: isMobile ? '32px' : '44px', height: isMobile ? '32px' : '44px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }} title="放大">
          <ZoomIn size={isMobile ? 18 : 22} />
        </button>
        <button className="bouncy-button secondary" onClick={() => { audioSynth.playClick(); resetLevel(); }} style={{ width: isMobile ? '32px' : '44px', height: isMobile ? '32px' : '44px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
          <RefreshCw size={isMobile ? 18 : 22} />
        </button>
      </div>
    </div>
  );

  const mazeNode = (
    <div 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        flex: '1 1 auto',
        minHeight: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: isMobile ? '3px' : '0px',
        perspective: '1000px'
      }}
    >
      <div ref={containerRef} style={{
         height: '100%',
         maxWidth: '100%',
         aspectRatio: '1 / 1',
         position: 'relative',
         transform: `scale(${zoomScale}) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
         transformOrigin: 'center center',
         transition: tilt.rx === 0 && tilt.ry === 0 ? 'transform 0.5s ease-out' : 'transform 0.1s ease-out',
         transformStyle: 'preserve-3d',
         boxSizing: 'border-box'
      }}>
        {renderGrid()}
      </div>
    </div>
  );

  const queueNode = (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', flex: 1, minHeight: 0 }}>
      {/* Status */}
      <div style={{ height: isMobile ? '16px' : '22px', fontSize: isMobile ? '0.8rem' : '0.95rem', fontWeight: 'bold', color: isSolved ? '#16a34a' : '#c0487a', marginBottom: isMobile ? '2px' : '6px', textAlign: 'center' }}>
        {statusMsg}
      </div>

      {/* Commands strip */}
      <div style={{ 
        width: '100%', 
        flex: 1,
        minHeight: `${cmdBtnSize + 8}px`, 
        overflowY: 'auto',
        border: '2px solid #cbd5e1', 
        borderRadius: '10px', 
        display: 'flex', 
        flexWrap: 'wrap', 
        alignContent: 'flex-start',
        gap: isMobile ? '3px' : '6px', 
        padding: isMobile ? '3px' : '6px', 
        marginBottom: isMobile ? '4px' : '12px',
        backgroundColor: '#f8fafc', 
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.04)',
        boxSizing: 'border-box'
      }}>
        {commands.length === 0 && <div style={{ color: '#94a3b8', width: '100%', textAlign: 'center', fontWeight: 'bold', fontSize: isMobile ? '0.75rem' : '0.9rem', lineHeight: `${cmdBtnSize}px` }}>{lang === 'en' ? 'Add commands below' : '在下方添加指令'}</div>}
        {commands.map((cmd, idx) => (
          <div key={idx} onClick={() => removeCommand(idx)} style={{
            width: `${cmdBtnSize}px`, 
            height: `${cmdBtnSize}px`, 
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white',
            borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: isPlaying || isSolved ? 'default' : 'pointer', 
            boxShadow: `0 ${isMobile ? 2 : 3}px 0 #1e40af`,
            position: 'relative',
            animation: idx === executingIdx ? 'glowPulse 0.5s infinite' : 'none',
            zIndex: idx === executingIdx ? 10 : 1,
            flexShrink: 0
          }}>
            {getCmdIcon(cmd)}
            
            {/* Step badge */}
            <div style={{ 
              position: 'absolute', 
              top: -3, left: -3, 
              background: '#10b981', color: 'white', 
              fontSize: '0.55rem', fontWeight: 'bold', 
              width: '14px', height: '14px', 
              borderRadius: '50%', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 1px 2px rgba(0,0,0,0.2)' 
            }}>
              {idx + 1}
            </div>

            {!isPlaying && !isSolved && (
              <div style={{ 
                position: 'absolute', top: -3, right: -3, 
                background: '#ef4444', borderRadius: '50%', 
                padding: '1px', color: 'white', 
                boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                lineHeight: 0
              }}>
                <X size={8} strokeWidth={3} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const directionsNode = (
    <div style={{ display: 'flex', flexShrink: 0, gap: isMobile ? '6px' : '12px', marginBottom: isMobile ? '4px' : '12px', width: '100%', justifyContent: 'center' }}>
      {['UP', 'DOWN', 'LEFT', 'RIGHT'].map(cmd => (
        <button key={cmd} onClick={() => addCommand(cmd)} disabled={isPlaying || isSolved}
          style={{
            width: `${dirBtnSize}px`, 
            height: `${dirBtnSize}px`,
            borderRadius: '12px',
            background: isPlaying || isSolved ? '#cbd5e1' : 'linear-gradient(135deg, #fcd34d, #f59e0b)',
            border: 'none', color: isPlaying || isSolved ? '#94a3b8' : 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: isPlaying || isSolved ? 'none' : `0 ${isMobile ? 2 : 4}px 0 #d97706`,
            cursor: isPlaying || isSolved ? 'default' : 'pointer',
            transition: 'all 0.1s'
          }}
          onMouseDown={e => { if(!isPlaying && !isSolved) { e.currentTarget.style.transform = 'translateY(2px)'; e.currentTarget.style.boxShadow = '0 0 0 #d97706'; } }}
          onMouseUp={e => { if(!isPlaying && !isSolved) { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 ${isMobile ? 2 : 4}px 0 #d97706`; } }}
          onMouseLeave={e => { if(!isPlaying && !isSolved) { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 ${isMobile ? 2 : 4}px 0 #d97706`; } }}
        >
          {getCmdIcon(cmd)}
        </button>
      ))}
    </div>
  );

  const runNode = (
    <div style={{ display: 'flex', flexShrink: 0, gap: isMobile ? '6px' : '12px', width: '100%', justifyContent: 'center', alignItems: 'stretch' }}>
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', flex: 1, justifyContent: 'flex-start' }}>
        <button 
           className="bouncy-button secondary" 
           onClick={() => { if (!isPlaying && !isSolved) setShowShop(true); }}
           style={{ 
              padding: isMobile ? '6px 10px' : '8px 12px', 
              fontSize: isMobile ? '0.8rem' : '0.95rem',
              background: '#bfdbfe', border: '2px solid #3b82f6', color: '#1e40af',
              borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px',
              boxShadow: `0 ${isMobile ? 2 : 4}px 0 #60a5fa`
           }}
        >
          🛒 <span style={{fontWeight:'bold'}}>{lang === 'en' ? 'Shop' : '道具补给'}</span>
        </button>
        
        {(inventory.normal > 0 || inventory.freeze > 0 || inventory.super > 0 || inventory.atomic > 0 || inventory.torch > 0 || inventory.shield > 0) && (
          <div style={{ display: 'flex', gap: '4px', background: '#f8fafc', padding: '4px', borderRadius: '12px', border: '2px solid #e2e8f0', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
            {inventory.normal > 0 && (
              <button className="bouncy-button secondary" onClick={() => !isPlaying && !isSolved && setActiveBombType(activeBombType === 'normal' ? null : 'normal')} style={{ padding: '4px 8px', borderRadius: '8px', border: `2px solid ${activeBombType === 'normal' ? '#ef4444' : '#cbd5e1'}`, background: activeBombType === 'normal' ? '#fca5a5' : 'white', animation: activeBombType === 'normal' ? 'bombPulse 1.5s infinite' : 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                💣 x{inventory.normal}
                <span style={{ fontSize: '0.75rem', color: activeBombType === 'normal' ? '#b91c1c' : '#ef4444', fontWeight: 'bold' }}>-1❤️</span>
              </button>
            )}
            {inventory.freeze > 0 && (
              <button className="bouncy-button secondary" onClick={() => !isPlaying && !isSolved && setActiveBombType(activeBombType === 'freeze' ? null : 'freeze')} style={{ padding: '4px 8px', borderRadius: '8px', border: `2px solid ${activeBombType === 'freeze' ? '#3b82f6' : '#cbd5e1'}`, background: activeBombType === 'freeze' ? '#93c5fd' : 'white', animation: activeBombType === 'freeze' ? 'bombPulse 1.5s infinite' : 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                ❄️ x{inventory.freeze}
                <span style={{ fontSize: '0.75rem', color: activeBombType === 'freeze' ? '#1d4ed8' : '#3b82f6', fontWeight: 'bold' }}>-2❤️</span>
              </button>
            )}
            {inventory.super > 0 && (
              <button className="bouncy-button secondary" onClick={() => !isPlaying && !isSolved && setActiveBombType(activeBombType === 'super' ? null : 'super')} style={{ padding: '4px 8px', borderRadius: '8px', border: `2px solid ${activeBombType === 'super' ? '#eab308' : '#cbd5e1'}`, background: activeBombType === 'super' ? '#fde047' : 'white', animation: activeBombType === 'super' ? 'bombPulse 1.5s infinite' : 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                🌟 x{inventory.super}
                <span style={{ fontSize: '0.75rem', color: activeBombType === 'super' ? '#a16207' : '#eab308', fontWeight: 'bold' }}>-3❤️</span>
              </button>
            )}
            {inventory.atomic > 0 && (
              <button className="bouncy-button secondary" onClick={() => !isPlaying && !isSolved && setActiveBombType(activeBombType === 'atomic' ? null : 'atomic')} style={{ padding: '4px 8px', borderRadius: '8px', border: `2px solid ${activeBombType === 'atomic' ? '#a855f7' : '#cbd5e1'}`, background: activeBombType === 'atomic' ? '#f3e8ff' : 'white', animation: activeBombType === 'atomic' ? 'bombPulse 1.5s infinite' : 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <img src={`${import.meta.env.BASE_URL}atomic_3d.png`} style={{ width: '18px', height: '18px', objectFit: 'contain' }} alt="atomic" /> x{inventory.atomic}
                <span style={{ fontSize: '0.75rem', color: activeBombType === 'atomic' ? '#7e22ce' : '#a855f7', fontWeight: 'bold' }}>-ALL❤️</span>
              </button>
            )}
            {inventory.torch > 0 && (
              <button className="bouncy-button secondary" onClick={() => !isPlaying && !isSolved && setActiveBombType(activeBombType === 'torch' ? null : 'torch')} style={{ padding: '4px 8px', borderRadius: '8px', border: `2px solid ${activeBombType === 'torch' ? '#f97316' : '#cbd5e1'}`, background: activeBombType === 'torch' ? '#fed7aa' : 'white', animation: activeBombType === 'torch' ? 'bombPulse 1.5s infinite' : 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                🔥 x{inventory.torch}
                <span style={{ fontSize: '0.75rem', color: activeBombType === 'torch' ? '#c2410c' : '#f97316', fontWeight: 'bold' }}>烧毁</span>
              </button>
            )}
            {inventory.shield > 0 && (
              <button className="bouncy-button secondary" onClick={() => {
                if (isPlaying || isSolved) return;
                if (hasShield) {
                  setStatusMsg(lang === 'en' ? 'Shield is already active!' : '护盾已处于激活状态！');
                  return;
                }
                audioSynth.playCorrect();
                setHasShield(true);
                const newInv = { ...inventory, shield: (inventory.shield || 0) - 1 };
                setInventory(newInv);
                localStorage.setItem('codingMazeInventory', JSON.stringify(newInv));
                setStatusMsg(lang === 'en' ? '🛡️ Shield activated!' : '🛡️ 守护护盾已开启！');
              }} style={{ padding: '4px 8px', borderRadius: '8px', border: '2px solid #cbd5e1', background: 'white', display: 'flex', alignItems: 'center', gap: '4px' }}>
                🛡️ x{inventory.shield}
                <span style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 'bold' }}>防护</span>
              </button>
            )}
          </div>
        )}
      </div>

      {isSolved ? (
        <button className="bouncy-button primary" onClick={nextLevel} style={{ flexShrink: 0, padding: isMobile ? '6px 14px' : '10px 22px', fontSize: isMobile ? '0.9rem' : '1.15rem' }}>
          {lang === 'en' ? 'Next Maze ➔' : '下一关 ➔'}
        </button>
      ) : (
        <button className="bouncy-button primary" onClick={executeCommands} disabled={isPlaying || commands.length === 0} style={{ flexShrink: 0, padding: isMobile ? '6px 14px' : '10px 22px', fontSize: isMobile ? '0.9rem' : '1.15rem', display: 'flex', alignItems: 'center', gap: '6px', background: isPlaying ? '#94a3b8' : '' }}>
          <Play size={isMobile ? 14 : 18} fill="white" /> {lang === 'en' ? 'Run Code' : '运行程序'}
        </button>
      )}
    </div>
  );

  return (
    <div className="screen-wrapper fade-in" style={{
      padding: isMobile ? '4px' : '16px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
      backgroundImage: `url(${getThemeBackground(currentLevel.theme)})`,
      backgroundSize: '115% 115%',
      backgroundPosition: 'center',
      animation: 'backgroundDrift 25s infinite ease-in-out',
      transition: 'background-image 0.5s ease-in-out'
    }}>
      <WeatherOverlay weather={currentWeather} />
      
      {isMobile ? (
        /* Mobile layout: EXACT original vertical stack */
        <div style={{
          width: '100%',
          height: '100%',
          maxWidth: '600px',
          display: 'flex',
          flexDirection: 'column',
          padding: '8px',
          boxSizing: 'border-box'
        }}>
          <div style={{ 
            flex: '1 1 0',
            minHeight: 0,
            width: '100%', 
            maxWidth: '600px', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            padding: '6px 8px',
            boxSizing: 'border-box'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px', flexShrink: 0 }}>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <button className="bouncy-button secondary" onClick={onBack} style={{ width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                  <ArrowLeft size={18} />
                </button>
                <button className="bouncy-button secondary" onClick={resetAllProgress} style={{ width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }} title={lang === 'en' ? 'Reset Progress' : '重置所有进度'}>
                  <RotateCcw size={18} />
                </button>
                <button className="bouncy-button secondary" onClick={() => { audioSynth.playClick(); setShowMonsterMenu(true); }} style={{ width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '16px' }} title={lang === 'en' ? 'Monster Guide' : '怪物图鉴'}>
                  👾
                </button>
                <button className="bouncy-button secondary" onClick={() => { audioSynth.playClick(); setShowLevelMap(true); }} style={{ width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '16px' }} title={lang === 'en' ? 'Select Level' : '选择关卡'}>
                  🗺️
                </button>
              </div>
              <h2 style={{ color: '#c0487a', margin: '0 5px', fontSize: '1.1rem', textAlign: 'center', flex: 1, lineHeight: '1.2' }}>
                {lang === 'en' ? `${levelIdx + 1}/${LEVELS.length}` : `第${levelIdx + 1}关`}
              </h2>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <button className="bouncy-button secondary" onClick={triggerSettings} style={{ width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }} title={lang === 'en' ? 'Settings' : '设置'}>
                  <Settings size={18} />
                </button>
                <button className="bouncy-button secondary" onClick={handleZoomOut} style={{ width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }} title="缩小">
                  <ZoomOut size={18} />
                </button>
                <button className="bouncy-button secondary" onClick={handleZoomIn} style={{ width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }} title="放大">
                  <ZoomIn size={18} />
                </button>
                <button className="bouncy-button secondary" onClick={() => { audioSynth.playClick(); resetLevel(); }} style={{ width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                  <RefreshCw size={18} />
                </button>
              </div>
            </div>

            {/* Maze Container */}
            <div 
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{
              flex: '1 1 auto',
              minHeight: 0,
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: '3px',
              perspective: '1000px'
            }}>
              <div ref={containerRef} style={{
                 height: '100%',
                 maxWidth: '100%',
                 aspectRatio: '1 / 1',
                 position: 'relative',
                 transform: `scale(${zoomScale}) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
                 transformOrigin: 'center center',
                 transition: tilt.rx === 0 && tilt.ry === 0 ? 'transform 0.5s ease-out' : 'transform 0.1s ease-out',
                 transformStyle: 'preserve-3d'
              }}>
                {renderGrid()}
              </div>
            </div>

            {/* Status */}
            <div style={{ flexShrink: 0, height: '16px', fontSize: '0.8rem', fontWeight: 'bold', color: isSolved ? '#16a34a' : '#c0487a', marginBottom: '2px' }}>
              {statusMsg}
            </div>

            {/* Commands strip */}
            <div style={{ 
              width: '100%', 
              flexShrink: 0,
              minHeight: `${cmdBtnSize + 8}px`, 
              maxHeight: `${cmdBtnSize * 2 + 16}px`,
              overflowY: 'auto',
              border: '2px solid #cbd5e1', 
              borderRadius: '10px', 
              display: 'flex', 
              flexWrap: 'wrap', 
              alignContent: 'flex-start',
              gap: '3px', 
              padding: '3px', 
              marginBottom: '4px',
              backgroundColor: '#f8fafc', 
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.04)',
              boxSizing: 'border-box'
            }}>
              {commands.length === 0 && <div style={{ color: '#94a3b8', width: '100%', textAlign: 'center', fontWeight: 'bold', fontSize: '0.75rem', lineHeight: `${cmdBtnSize}px` }}>{lang === 'en' ? 'Add commands below' : '在下方添加指令'}</div>}
              {commands.map((cmd, idx) => (
                <div key={idx} onClick={() => removeCommand(idx)} style={{
                  width: `${cmdBtnSize}px`, 
                  height: `${cmdBtnSize}px`, 
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white',
                  borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: isPlaying || isSolved ? 'default' : 'pointer', 
                  boxShadow: `0 2px 0 #1e40af`,
                  position: 'relative',
                  animation: idx === executingIdx ? 'glowPulse 0.5s infinite' : 'none',
                  zIndex: idx === executingIdx ? 10 : 1,
                  flexShrink: 0
                }}>
                  {getCmdIcon(cmd)}
                  
                  {/* Step badge */}
                  <div style={{ 
                    position: 'absolute', 
                    top: -3, left: -3, 
                    background: '#10b981', color: 'white', 
                    fontSize: '0.55rem', fontWeight: 'bold', 
                    width: '14px', height: '14px', 
                    borderRadius: '50%', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.2)' 
                  }}>
                    {idx + 1}
                  </div>

                  {!isPlaying && !isSolved && (
                    <div style={{ 
                      position: 'absolute', top: -3, right: -3, 
                      background: '#ef4444', borderRadius: '50%', 
                      padding: '1px', color: 'white', 
                      boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                      lineHeight: 0
                    }}>
                      <X size={8} strokeWidth={3} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Direction buttons */}
            <div style={{ display: 'flex', flexShrink: 0, gap: '6px', marginBottom: '4px' }}>
              {['UP', 'DOWN', 'LEFT', 'RIGHT'].map(cmd => (
                <button key={cmd} onClick={() => addCommand(cmd)} disabled={isPlaying || isSolved}
                  style={{
                    width: `${dirBtnSize}px`, 
                    height: `${dirBtnSize}px`,
                    borderRadius: '12px',
                    background: isPlaying || isSolved ? '#cbd5e1' : 'linear-gradient(135deg, #fcd34d, #f59e0b)',
                    border: 'none', color: isPlaying || isSolved ? '#94a3b8' : 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: isPlaying || isSolved ? 'none' : `0 2px 0 #d97706`,
                    cursor: isPlaying || isSolved ? 'default' : 'pointer',
                    transition: 'all 0.1s'
                  }}
                  onMouseDown={e => { if(!isPlaying && !isSolved) { e.currentTarget.style.transform = 'translateY(2px)'; e.currentTarget.style.boxShadow = '0 0 0 #d97706'; } }}
                  onMouseUp={e => { if(!isPlaying && !isSolved) { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 2px 0 #d97706`; } }}
                  onMouseLeave={e => { if(!isPlaying && !isSolved) { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 2px 0 #d97706`; } }}
                >
                  {getCmdIcon(cmd)}
                </button>
              ))}
            </div>

            {/* Controls and Run area */}
            <div style={{ display: 'flex', flexShrink: 0, gap: '6px', width: '100%', justifyContent: 'center', alignItems: 'stretch' }}>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', flex: 1, justifyContent: 'flex-start' }}>
                <button 
                   className="bouncy-button secondary" 
                   onClick={() => { if (!isPlaying && !isSolved) setShowShop(true); }}
                   style={{ 
                      padding: '6px 10px', 
                      fontSize: '0.8rem',
                      background: '#bfdbfe', border: '2px solid #3b82f6', color: '#1e40af',
                      borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px',
                      boxShadow: `0 2px 0 #60a5fa`
                   }}
                >
                  🛒 <span style={{fontWeight:'bold'}}>{lang === 'en' ? 'Shop' : '道具补给'}</span>
                </button>
                
                {(inventory.normal > 0 || inventory.freeze > 0 || inventory.super > 0 || inventory.atomic > 0 || inventory.torch > 0 || inventory.shield > 0) && (
                  <div style={{ display: 'flex', gap: '4px', background: '#f8fafc', padding: '4px', borderRadius: '12px', border: '2px solid #e2e8f0', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
                    {inventory.normal > 0 && (
                      <button className="bouncy-button secondary" onClick={() => !isPlaying && !isSolved && setActiveBombType(activeBombType === 'normal' ? null : 'normal')} style={{ padding: '4px 8px', borderRadius: '8px', border: `2px solid ${activeBombType === 'normal' ? '#ef4444' : '#cbd5e1'}`, background: activeBombType === 'normal' ? '#fca5a5' : 'white', animation: activeBombType === 'normal' ? 'bombPulse 1.5s infinite' : 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        💣 x{inventory.normal}
                        <span style={{ fontSize: '0.75rem', color: activeBombType === 'normal' ? '#b91c1c' : '#ef4444', fontWeight: 'bold' }}>-1❤️</span>
                      </button>
                    )}
                    {inventory.freeze > 0 && (
                      <button className="bouncy-button secondary" onClick={() => !isPlaying && !isSolved && setActiveBombType(activeBombType === 'freeze' ? null : 'freeze')} style={{ padding: '4px 8px', borderRadius: '8px', border: `2px solid ${activeBombType === 'freeze' ? '#3b82f6' : '#cbd5e1'}`, background: activeBombType === 'freeze' ? '#93c5fd' : 'white', animation: activeBombType === 'freeze' ? 'bombPulse 1.5s infinite' : 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        ❄️ x{inventory.freeze}
                        <span style={{ fontSize: '0.75rem', color: activeBombType === 'freeze' ? '#1d4ed8' : '#3b82f6', fontWeight: 'bold' }}>-2❤️</span>
                      </button>
                    )}
                    {inventory.super > 0 && (
                      <button className="bouncy-button secondary" onClick={() => !isPlaying && !isSolved && setActiveBombType(activeBombType === 'super' ? null : 'super')} style={{ padding: '4px 8px', borderRadius: '8px', border: `2px solid ${activeBombType === 'super' ? '#eab308' : '#cbd5e1'}`, background: activeBombType === 'super' ? '#fde047' : 'white', animation: activeBombType === 'super' ? 'bombPulse 1.5s infinite' : 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        🌟 x{inventory.super}
                        <span style={{ fontSize: '0.75rem', color: activeBombType === 'super' ? '#a16207' : '#eab308', fontWeight: 'bold' }}>-3❤️</span>
                      </button>
                    )}
                    {inventory.atomic > 0 && (
                      <button className="bouncy-button secondary" onClick={() => !isPlaying && !isSolved && setActiveBombType(activeBombType === 'atomic' ? null : 'atomic')} style={{ padding: '4px 8px', borderRadius: '8px', border: `2px solid ${activeBombType === 'atomic' ? '#a855f7' : '#cbd5e1'}`, background: activeBombType === 'atomic' ? '#f3e8ff' : 'white', animation: activeBombType === 'atomic' ? 'bombPulse 1.5s infinite' : 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <img src={`${import.meta.env.BASE_URL}atomic_3d.png`} style={{ width: '18px', height: '18px', objectFit: 'contain' }} alt="atomic" /> x{inventory.atomic}
                        <span style={{ fontSize: '0.75rem', color: activeBombType === 'atomic' ? '#7e22ce' : '#a855f7', fontWeight: 'bold' }}>-ALL❤️</span>
                      </button>
                    )}
                    {inventory.torch > 0 && (
                      <button className="bouncy-button secondary" onClick={() => !isPlaying && !isSolved && setActiveBombType(activeBombType === 'torch' ? null : 'torch')} style={{ padding: '4px 8px', borderRadius: '8px', border: `2px solid ${activeBombType === 'torch' ? '#f97316' : '#cbd5e1'}`, background: activeBombType === 'torch' ? '#fed7aa' : 'white', animation: activeBombType === 'torch' ? 'bombPulse 1.5s infinite' : 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        🔥 x{inventory.torch}
                        <span style={{ fontSize: '0.75rem', color: activeBombType === 'torch' ? '#c2410c' : '#f97316', fontWeight: 'bold' }}>烧毁</span>
                      </button>
                    )}
                    {inventory.shield > 0 && (
                      <button className="bouncy-button secondary" onClick={() => {
                        if (isPlaying || isSolved) return;
                        if (hasShield) {
                          setStatusMsg(lang === 'en' ? 'Shield is already active!' : '护盾已处于激活状态！');
                          return;
                        }
                        audioSynth.playCorrect();
                        setHasShield(true);
                        const newInv = { ...inventory, shield: (inventory.shield || 0) - 1 };
                        setInventory(newInv);
                        localStorage.setItem('codingMazeInventory', JSON.stringify(newInv));
                        setStatusMsg(lang === 'en' ? '🛡️ Shield activated!' : '🛡️ 守护护盾已开启！');
                      }} style={{ padding: '4px 8px', borderRadius: '8px', border: '2px solid #cbd5e1', background: 'white', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        🛡️ x{inventory.shield}
                        <span style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 'bold' }}>防护</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {isSolved ? (
                <button className="bouncy-button primary" onClick={nextLevel} style={{ flexShrink: 0, padding: '6px 14px', fontSize: '0.9rem' }}>
                  {lang === 'en' ? 'Next Maze ➔' : '下一关 ➔'}
                </button>
              ) : (
                <button className="bouncy-button primary" onClick={executeCommands} disabled={isPlaying || commands.length === 0} style={{ flexShrink: 0, padding: '6px 14px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', background: isPlaying ? '#94a3b8' : '' }}>
                  <Play size={14} fill="white" /> {lang === 'en' ? 'Run Code' : '运行程序'}
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Desktop layout: gorgeous side-by-side split screen! */
        <div style={{
          width: '100%',
          height: '100%',
          maxWidth: '1200px',
          display: 'flex',
          flexDirection: 'row',
          padding: '20px',
          boxSizing: 'border-box',
          gap: '24px',
          alignItems: 'stretch',
          justifyContent: 'center'
        }}>
          {/* Left Side: Game Board (Flex panel taking up 58% of container) */}
          <div style={{ 
            flex: '1 1 58%', 
            height: '100%', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            position: 'relative',
            minWidth: 0,
            minHeight: 0
          }}>
            {mazeNode}
          </div>
          
          {/* Right Side: Command Deck (Takes up 42% of container) */}
          <div style={{ 
            flex: '1 1 42%', 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(12px)',
            padding: '24px',
            borderRadius: '24px',
            border: '4px solid white',
            boxShadow: '0 12px 36px rgba(0,0,0,0.1)',
            boxSizing: 'border-box',
            minWidth: 0,
            minHeight: 0,
            gap: '16px'
          }}>
            {headerNode}
            {queueNode}
            {directionsNode}
            {runNode}
          </div>
        </div>
      )}
      

      {/* Shop Modal */}
      {showShop && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, margin: 0, padding: 0, backdropFilter: 'blur(3px)'
        }}>
          <div className="bounce-in" style={{
            background: 'white', padding: isMobile ? '20px' : '30px', borderRadius: '24px',
            textAlign: 'center', width: '90%', maxWidth: '400px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)', border: '4px solid #60a5fa'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#1e40af', fontSize: '1.4rem' }}>
              {lang === 'en' ? 'Props Shop' : '道具补给站'}
            </h3>
            <p style={{ margin: '0 0 20px 0', color: '#475569', fontSize: '0.95rem' }}>
              {lang === 'en' ? 'Solve math problems to get special bombs!' : '计算算术题，获取强大的炸弹！'}
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <button onClick={() => triggerMathQuiz('normal', normalNeeded)} className="bouncy-button secondary" style={{ padding: '12px', borderRadius: '12px', border: '2px solid #94a3b8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>💣 <span>{lang === 'en' ? `Normal Bomb x${normalAward}` : `普通炸弹 x${normalAward}`}</span></div>
                  <div style={{ fontSize: '0.8rem', color: '#dc2626', background: '#fee2e2', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold' }}>{lang === 'en' ? 'Damage: -1❤️' : '威力: -1❤️'}</div>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{lang === 'en' ? `${normalNeeded} Question${normalNeeded > 1 ? 's' : ''}` : `需答对 ${normalNeeded} 题`}</div>
              </button>
              <button onClick={() => triggerMathQuiz('freeze', freezeNeeded)} className="bouncy-button secondary" style={{ padding: '12px', borderRadius: '12px', border: '2px solid #93c5fd', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#eff6ff' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>❄️ <span style={{color: '#2563eb'}}>{lang === 'en' ? `Freeze Bomb x${freezeAward}` : `冰冻弹 x${freezeAward}`}</span></div>
                  <div style={{ fontSize: '0.8rem', color: '#1d4ed8', background: '#dbeafe', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold' }}>{lang === 'en' ? 'Damage: -2❤️❤️' : '威力: -2❤️❤️'}</div>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#2563eb' }}>{lang === 'en' ? `${freezeNeeded} Questions` : `需连答 ${freezeNeeded} 题`}</div>
              </button>
              <button onClick={() => triggerMathQuiz('super', superNeeded)} className="bouncy-button secondary" style={{ padding: '12px', borderRadius: '12px', border: '2px solid #fde047', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fefce8' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>🌟 <span style={{color: '#ca8a04'}}>{lang === 'en' ? `Super Bomb x${superAward}` : `穿甲弹 x${superAward}`}</span></div>
                  <div style={{ fontSize: '0.8rem', color: '#b45309', background: '#fef3c7', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold' }}>{lang === 'en' ? 'Damage: -3❤️❤️❤️' : '威力: -3❤️❤️❤️'}</div>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#ca8a04' }}>{lang === 'en' ? `${superNeeded} Questions` : `需连答 ${superNeeded} 题`}</div>
              </button>
              <button onClick={() => triggerMathQuiz('atomic', atomicNeeded)} className="bouncy-button secondary" style={{ padding: '12px', borderRadius: '12px', border: '2px solid #a855f7', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#faf5ff' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                    <img src={`${import.meta.env.BASE_URL}atomic_3d.png`} style={{ width: '20px', height: '20px', objectFit: 'contain' }} alt="atomic" />
                    <span style={{color: '#9333ea'}}>{lang === 'en' ? `Atomic Bomb x${atomicAward}` : `原子弹 x${atomicAward}`}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#7e22ce', background: '#f3e8ff', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold' }}>{lang === 'en' ? 'Clear ALL Animals' : '威力: 清空全图动物'}</div>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#9333ea' }}>{lang === 'en' ? `${atomicNeeded} Questions` : `需连答 ${atomicNeeded} 题`}</div>
              </button>
              <button onClick={() => triggerMathQuiz('torch', torchNeeded)} className="bouncy-button secondary" style={{ padding: '12px', borderRadius: '12px', border: '2px solid #f97316', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff7ed' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>🔥 <span style={{color: '#ea580c'}}>{lang === 'en' ? `Torch x${torchAward}` : `火把 x${torchAward}`}</span></div>
                  <div style={{ fontSize: '0.8rem', color: '#c2410c', background: '#ffedd5', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold' }}>{lang === 'en' ? 'Burn Obstacle & Set Fire' : '功能: 烧毁障碍并留火'}</div>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#ea580c' }}>{lang === 'en' ? `${torchNeeded} Questions` : `需连答 ${torchNeeded} 题`}</div>
              </button>
              <button onClick={() => triggerMathQuiz('shield', shieldNeeded)} className="bouncy-button secondary" style={{ padding: '12px', borderRadius: '12px', border: '2px solid #3b82f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#eff6ff' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>🛡️ <span style={{color: '#2563eb'}}>{lang === 'en' ? `Guardian Shield x${shieldAward}` : `守护神盾 x${shieldAward}`}</span></div>
                  <div style={{ fontSize: '0.8rem', color: '#1d4ed8', background: '#dbeafe', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold' }}>{lang === 'en' ? 'Block One Attack' : '功能: 抵挡一次攻击'}</div>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#2563eb' }}>{lang === 'en' ? `${shieldNeeded} Questions` : `需连答 ${shieldNeeded} 题`}</div>
              </button>
            </div>
            
            <button 
              onClick={() => { audioSynth.playClick(); setShowShop(false); }}
              style={{ background: 'none', border: 'none', color: '#94a3b8', textDecoration: 'underline', cursor: 'pointer', fontSize: '1rem', padding: '10px' }}
            >
              {lang === 'en' ? 'Close' : '关闭'}
            </button>
          </div>
        </div>
      )}

      {/* Math Quiz Modal */}
      {showMathQuiz && mathProblem && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, margin: 0, padding: 0
        }}>
          <div className={isMathShaking ? 'shake-animation' : ''} style={{
            background: 'white', padding: isMobile ? '20px' : '30px', borderRadius: '24px',
            textAlign: 'center', width: '85%', maxWidth: '350px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            border: '4px solid #60a5fa'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#1e40af', fontSize: '1.4rem' }}>
              {isSkeletonBattle 
                ? (lang === 'en' ? '💀 Skeleton Battle 💀' : '💀 决战骷髅兵 💀')
                : (lang === 'en' ? 'Math Challenge' : '算术挑战')}
            </h3>
            {isSkeletonBattle && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'linear-gradient(135deg, #1e1b4b 0%, #311042 100%)',
                padding: '12px',
                borderRadius: '16px',
                border: '3px solid #7c3aed',
                boxShadow: '0 8px 16px rgba(124, 58, 237, 0.3)',
                marginBottom: '15px',
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Hero Column */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                  <div style={{ 
                    fontSize: '2.5rem', 
                    animation: isMathShaking ? 'heroShake 0.4s' : 'idleBreathing 1.5s infinite alternate' 
                  }}>{tTheme.hero}</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#4ade80', marginTop: '4px' }}>
                    {lang === 'en' ? 'Hero' : '小勇士'}
                  </div>
                  {/* Hero HP */}
                  <div style={{ display: 'flex', gap: '3px', marginTop: '4px' }}>
                    {Array.from({ length: 2 }).map((_, i) => (
                      <span key={i} style={{ 
                        fontSize: '14px',
                        opacity: i < (2 - skeletonMistakes) ? 1 : 0.25,
                        transition: 'opacity 0.3s'
                      }}>❤️</span>
                    ))}
                  </div>
                </div>

                {/* VS Badge */}
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  padding: '0 10px'
                }}>
                  <span style={{ 
                    fontSize: '1.2rem', 
                    fontWeight: '900', 
                    color: '#f43f5e', 
                    textShadow: '0 0 10px #f43f5e',
                    animation: 'targetPulse 1s infinite'
                  }}>VS</span>
                </div>

                {/* Skeleton Column */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                  <div style={{ width: '50px', height: '50px', position: 'relative' }}>
                    <img 
                      src={`${import.meta.env.BASE_URL}skeleton_3d.png`} 
                      alt="skeleton" 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'contain',
                        animation: 'skeletonRattle 0.5s infinite' 
                      }} 
                    />
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#f43f5e', marginTop: '4px' }}>
                    {lang === 'en' ? 'Skeleton' : '骷髅兵'}
                  </div>
                  {/* Skeleton HP */}
                  <div style={{ display: 'flex', gap: '3px', marginTop: '4px' }}>
                    {Array.from({ length: 2 }).map((_, i) => (
                      <span key={i} style={{ 
                        fontSize: '14px', 
                        opacity: i < (2 - skeletonQuestionIdx) ? 1 : 0.25,
                        transition: 'opacity 0.3s'
                      }}>💀</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {shopTarget ? (
              <p style={{ margin: '0 0 20px 0', color: '#1e40af', fontSize: '1rem', fontWeight: 'bold', background: '#e0f2fe', padding: '6px 12px', borderRadius: '20px', display: 'inline-block' }}>
                {lang === 'en' 
                  ? `Question ${shopTarget.answered + 1} of ${shopTarget.needed}` 
                  : `第 ${shopTarget.answered + 1} 题，共 ${shopTarget.needed} 题`}
              </p>
            ) : (
              <p style={{ margin: '0 0 20px 0', color: '#475569', fontSize: '1rem', fontWeight: 'bold' }}>
                {isSkeletonBattle 
                  ? (lang === 'en' ? 'Defeat the skeleton with correct math!' : '用正确的心算击败骷髅！')
                  : (lang === 'en' ? 'Solve the problem to escape!' : '答对题目即可脱身！')}
              </p>
            )}
            
            <div style={{ fontSize: '2.8rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '25px', letterSpacing: '3px' }}>
              {mathProblem.a} {mathProblem.op} {mathProblem.b} = ?
            </div>
            
            <form onSubmit={handleMathSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input 
                type="number" 
                value={mathInput}
                onChange={(e) => setMathInput(e.target.value)}
                autoFocus
                style={{
                  fontSize: '2rem', padding: '10px', textAlign: 'center',
                  borderRadius: '12px', border: '3px solid #cbd5e1', outline: 'none',
                  color: '#0f172a', fontWeight: 'bold'
                }}
                placeholder="?"
              />
              <button type="submit" className="bouncy-button primary" style={{ padding: '14px', fontSize: '1.2rem', borderRadius: '12px' }}>
                {lang === 'en' ? 'Submit' : '提交答案'}
              </button>
            </form>
            
             {!isSkeletonBattle && (
               <button 
                 onClick={() => { audioSynth.playClick(); setShowMathQuiz(false); }}
                 style={{
                   marginTop: '15px', background: 'none', border: 'none', color: '#94a3b8',
                   textDecoration: 'underline', cursor: 'pointer', fontSize: '1rem',
                   padding: '10px'
                 }}
               >
                 {lang === 'en' ? 'Cancel' : '放弃挑战'}
               </button>
             )}
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="bounce-in card-shadow" style={{
            background: 'white', borderRadius: '24px', padding: '24px',
            width: '90%', maxWidth: '440px', maxHeight: '85vh', overflowY: 'auto',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#334155', textAlign: 'center', fontWeight: '800' }}>
              {lang === 'en' ? 'Parental Settings' : '家长控制中心'}
            </h3>
            
            {/* Regular bomb difficulty section */}
            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '8px', fontWeight: 'bold' }}>
              {lang === 'en' ? 'Normal/Freeze/Super Bomb Range:' : '普通/冰冻/穿甲弹加减法范围：'}
            </p>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '15px' }}>
              <input 
                type="number" 
                value={customMinInput}
                onChange={e => setCustomMinInput(e.target.value)}
                style={{
                  flex: 1, padding: '10px', fontSize: '1.1rem', borderRadius: '12px',
                  border: '2px solid #cbd5e1', textAlign: 'center', minWidth: 0
                }}
                placeholder="10"
              />
              <span style={{ fontSize: '1.2rem', color: '#64748b', fontWeight: 'bold' }}>-</span>
              <input 
                type="number" 
                value={customMaxInput}
                onChange={e => setCustomMaxInput(e.target.value)}
                style={{
                  flex: 1, padding: '10px', fontSize: '1.1rem', borderRadius: '12px',
                  border: '2px solid #cbd5e1', textAlign: 'center', minWidth: 0
                }}
                placeholder="20"
              />
            </div>

            {/* Atomic bomb difficulty section */}
            <p style={{ fontSize: '0.9rem', color: '#a855f7', marginBottom: '8px', fontWeight: 'bold' }}>
              {lang === 'en' ? 'Atomic Bomb Range:' : '原子弹加减法范围：'}
            </p>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px' }}>
              <input 
                type="number" 
                value={customAtomicMinInput}
                onChange={e => setCustomAtomicMinInput(e.target.value)}
                style={{
                  flex: 1, padding: '10px', fontSize: '1.1rem', borderRadius: '12px',
                  border: '2px solid #a855f7', textAlign: 'center', minWidth: 0
                }}
                placeholder="15"
              />
              <span style={{ fontSize: '1.2rem', color: '#a855f7', fontWeight: 'bold' }}>-</span>
              <input 
                type="number" 
                value={customAtomicMaxInput}
                onChange={e => setCustomAtomicMaxInput(e.target.value)}
                style={{
                  flex: 1, padding: '10px', fontSize: '1.1rem', borderRadius: '12px',
                  border: '2px solid #a855f7', textAlign: 'center', minWidth: 0
                }}
                placeholder="30"
              />
            </div>

            {/* Custom Bomb Settings Section */}
            <p style={{ fontSize: '0.95rem', color: '#1e3a8a', marginTop: '15px', marginBottom: '10px', fontWeight: 'bold', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
              {lang === 'en' ? 'Props Config (Award / Questions):' : '获取道具与连答题目数设置：'}
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {/* Normal Bomb */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', width: '80px', fontWeight: 'bold' }}>💣 普通弹:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>获得</span>
                  <input type="number" value={inputNormalAward} onChange={e => setInputNormalAward(Math.max(1, parseInt(e.target.value) || 1))} style={{ width: '50px', padding: '6px', textAlign: 'center', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>个，答</span>
                  <input type="number" value={inputNormalNeeded} onChange={e => setInputNormalNeeded(Math.max(1, parseInt(e.target.value) || 1))} style={{ width: '50px', padding: '6px', textAlign: 'center', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>题</span>
                </div>
              </div>
              
              {/* Freeze Bomb */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', width: '80px', fontWeight: 'bold', color: '#2563eb' }}>❄️ 冰冻弹:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>获得</span>
                  <input type="number" value={inputFreezeAward} onChange={e => setInputFreezeAward(Math.max(1, parseInt(e.target.value) || 1))} style={{ width: '50px', padding: '6px', textAlign: 'center', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>个，答</span>
                  <input type="number" value={inputFreezeNeeded} onChange={e => setInputFreezeNeeded(Math.max(1, parseInt(e.target.value) || 1))} style={{ width: '50px', padding: '6px', textAlign: 'center', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>题</span>
                </div>
              </div>

              {/* Super Bomb */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', width: '80px', fontWeight: 'bold', color: '#ca8a04' }}>🌟 穿甲弹:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>获得</span>
                  <input type="number" value={inputSuperAward} onChange={e => setInputSuperAward(Math.max(1, parseInt(e.target.value) || 1))} style={{ width: '50px', padding: '6px', textAlign: 'center', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>个，答</span>
                  <input type="number" value={inputSuperNeeded} onChange={e => setInputSuperNeeded(Math.max(1, parseInt(e.target.value) || 1))} style={{ width: '50px', padding: '6px', textAlign: 'center', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>题</span>
                </div>
              </div>

              {/* Atomic Bomb */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', width: '80px', fontWeight: 'bold', color: '#9333ea' }}>☢️ 原子弹:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>获得</span>
                  <input type="number" value={inputAtomicAward} onChange={e => setInputAtomicAward(Math.max(1, parseInt(e.target.value) || 1))} style={{ width: '50px', padding: '6px', textAlign: 'center', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>个，答</span>
                  <input type="number" value={inputAtomicNeeded} onChange={e => setInputAtomicNeeded(Math.max(1, parseInt(e.target.value) || 1))} style={{ width: '50px', padding: '6px', textAlign: 'center', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>题</span>
                </div>
              </div>

              {/* Torch */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', width: '80px', fontWeight: 'bold', color: '#f97316' }}>🔥 火把:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>获得</span>
                  <input type="number" value={inputTorchAward} onChange={e => setInputTorchAward(Math.max(1, parseInt(e.target.value) || 1))} style={{ width: '50px', padding: '6px', textAlign: 'center', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>个，答</span>
                  <input type="number" value={inputTorchNeeded} onChange={e => setInputTorchNeeded(Math.max(1, parseInt(e.target.value) || 1))} style={{ width: '50px', padding: '6px', textAlign: 'center', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>题</span>
                </div>
              </div>

              {/* Shield */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', width: '80px', fontWeight: 'bold', color: '#2563eb' }}>🛡️ 守护盾:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>获得</span>
                  <input type="number" value={inputShieldAward} onChange={e => setInputShieldAward(Math.max(1, parseInt(e.target.value) || 1))} style={{ width: '50px', padding: '6px', textAlign: 'center', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>个，答</span>
                  <input type="number" value={inputShieldNeeded} onChange={e => setInputShieldNeeded(Math.max(1, parseInt(e.target.value) || 1))} style={{ width: '50px', padding: '6px', textAlign: 'center', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>题</span>
                </div>
              </div>
            </div>

            {/* Custom Backpack Inventory Quantity Section */}
            <p style={{ fontSize: '0.95rem', color: '#047857', marginTop: '15px', marginBottom: '10px', fontWeight: 'bold', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
              {lang === 'en' ? 'Modify Backpack Inventory Quantity:' : '直接修改背包中炸弹数量：'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
              {/* Normal Bomb Inv */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>💣 普通弹:</span>
                <input type="number" value={inputNormalInv} onChange={e => setInputNormalInv(Math.max(0, parseInt(e.target.value) || 0))} style={{ width: '100%', padding: '6px', textAlign: 'center', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
              
              {/* Freeze Bomb Inv */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#2563eb' }}>❄️ 冰冻弹:</span>
                <input type="number" value={inputFreezeInv} onChange={e => setInputFreezeInv(Math.max(0, parseInt(e.target.value) || 0))} style={{ width: '100%', padding: '6px', textAlign: 'center', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>

              {/* Super Bomb Inv */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#ca8a04' }}>🌟 穿甲弹:</span>
                <input type="number" value={inputSuperInv} onChange={e => setInputSuperInv(Math.max(0, parseInt(e.target.value) || 0))} style={{ width: '100%', padding: '6px', textAlign: 'center', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>

              {/* Atomic Bomb Inv */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#9333ea' }}>☢️ 原子弹:</span>
                <input type="number" value={inputAtomicInv} onChange={e => setInputAtomicInv(Math.max(0, parseInt(e.target.value) || 0))} style={{ width: '100%', padding: '6px', textAlign: 'center', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>

              {/* Torch Inv */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#f97316' }}>🔥 火把:</span>
                <input type="number" value={inputTorchInv} onChange={e => setInputTorchInv(Math.max(0, parseInt(e.target.value) || 0))} style={{ width: '100%', padding: '6px', textAlign: 'center', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>

              {/* Shield Inv */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#2563eb' }}>🛡️ 守护盾:</span>
                <input type="number" value={inputShieldInv} onChange={e => setInputShieldInv(Math.max(0, parseInt(e.target.value) || 0))} style={{ width: '100%', padding: '6px', textAlign: 'center', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
            </div>

            {/* Direct Level Selection for Parents */}
            <p style={{ fontSize: '0.95rem', color: '#dc2626', marginTop: '15px', marginBottom: '10px', fontWeight: 'bold', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
              {lang === 'en' ? 'Set Current Level (Parent Override):' : '设置当前关卡（强行跳关）：'}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px', marginBottom: '20px', maxHeight: '180px', overflowY: 'auto', padding: '6px', background: '#fef2f2', borderRadius: '12px', border: '1px solid #fee2e2' }}>
              {LEVELS.map((lvl, index) => {
                const isActive = index === inputLevelIdx;
                return (
                  <button
                    key={`parent-lvl-${index}`}
                    type="button"
                    onClick={() => {
                      audioSynth.playClick();
                      setInputLevelIdx(index);
                    }}
                    style={{
                      width: '100%',
                      padding: '6px 0',
                      borderRadius: '8px',
                      border: isActive ? '2px solid #dc2626' : '1px solid #fca5a5',
                      background: isActive ? '#dc2626' : '#fff',
                      color: isActive ? '#fff' : '#dc2626',
                      fontWeight: 'bold',
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => { audioSynth.playClick(); setShowSettings(false); }}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#e2e8f0', color: '#475569', fontWeight: 'bold', cursor: 'pointer' }}
              >
                {lang === 'en' ? 'Cancel' : '取消'}
              </button>
              <button 
                onClick={() => {
                  audioSynth.playClick();
                  let vMin = parseInt(customMinInput);
                  let vMax = parseInt(customMaxInput);
                  if (isNaN(vMin) || vMin < 1) vMin = 1;
                  if (isNaN(vMax) || vMax < vMin) vMax = vMin + 5;
                  if (vMax > 1000) vMax = 1000;
                  setMathMin(vMin);
                  setMathMax(vMax);
                  setCustomMinInput(vMin);
                  setCustomMaxInput(vMax);

                  let aMin = parseInt(customAtomicMinInput);
                  let aMax = parseInt(customAtomicMaxInput);
                  if (isNaN(aMin) || aMin < 1) aMin = 1;
                  if (isNaN(aMax) || aMax < aMin) aMax = aMin + 5;
                  if (aMax > 1000) aMax = 1000;
                  setAtomicMin(aMin);
                  setAtomicMax(aMax);
                  setCustomAtomicMinInput(aMin);
                  setCustomAtomicMaxInput(aMax);

                  // Save props configuration
                  setNormalNeeded(inputNormalNeeded);
                  setFreezeNeeded(inputFreezeNeeded);
                  setSuperNeeded(inputSuperNeeded);
                  setAtomicNeeded(inputAtomicNeeded);
                  setTorchNeeded(inputTorchNeeded);
                  setShieldNeeded(inputShieldNeeded);

                  setNormalAward(inputNormalAward);
                  setFreezeAward(inputFreezeAward);
                  setSuperAward(inputSuperAward);
                  setAtomicAward(inputAtomicAward);
                  setTorchAward(inputTorchAward);
                  setShieldAward(inputShieldAward);

                  // Directly modify inventory quantities
                  const newInv = {
                    normal: inputNormalInv,
                    freeze: inputFreezeInv,
                    super: inputSuperInv,
                    atomic: inputAtomicInv,
                    torch: inputTorchInv,
                    shield: inputShieldInv
                  };
                  setInventory(newInv);

                  // Update current level and unlock progress
                  setLevelIdx(inputLevelIdx);
                  localStorage.setItem('codingMazeLevel', inputLevelIdx.toString());
                  const newMax = Math.max(maxUnlockedLevel, inputLevelIdx);
                  setMaxUnlockedLevel(newMax);
                  localStorage.setItem('codingMazeMaxUnlockedLevel', newMax.toString());

                  localStorage.setItem('codingMazeMathMin', vMin);
                  localStorage.setItem('codingMazeMathMax', vMax);
                  localStorage.setItem('codingMazeAtomicMin', aMin);
                  localStorage.setItem('codingMazeAtomicMax', aMax);
                  localStorage.setItem('codingMazeNormalNeeded', inputNormalNeeded);
                  localStorage.setItem('codingMazeFreezeNeeded', inputFreezeNeeded);
                  localStorage.setItem('codingMazeSuperNeeded', inputSuperNeeded);
                  localStorage.setItem('codingMazeAtomicNeeded', inputAtomicNeeded);
                  localStorage.setItem('codingMazeTorchNeeded', inputTorchNeeded);
                  localStorage.setItem('codingMazeShieldNeeded', inputShieldNeeded);
                  
                  localStorage.setItem('codingMazeNormalAward', inputNormalAward);
                  localStorage.setItem('codingMazeFreezeAward', inputFreezeAward);
                  localStorage.setItem('codingMazeSuperAward', inputSuperAward);
                  localStorage.setItem('codingMazeAtomicAward', inputAtomicAward);
                  localStorage.setItem('codingMazeTorchAward', inputTorchAward);
                  localStorage.setItem('codingMazeShieldAward', inputShieldAward);
                  localStorage.setItem('codingMazeInventory', JSON.stringify(newInv));

                  setShowSettings(false);
                }}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#3b82f6', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
              >
                {lang === 'en' ? 'Save' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Parent Gate Modal */}
      {showParentGate && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100
        }}>
          <div className={`bounce-in card-shadow ${isParentGateShaking ? 'shake' : ''}`} style={{
            background: 'white', borderRadius: '24px', padding: '24px',
            width: '90%', maxWidth: '340px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#dc2626', textAlign: 'center' }}>
              {lang === 'en' ? 'Parental Gate' : '家长锁'}
            </h3>
            <p style={{ fontSize: '0.95rem', color: '#64748b', marginBottom: '20px', textAlign: 'center' }}>
              {lang === 'en' ? 'Please solve this to continue:' : '请完成乘法计算以继续：'}
            </p>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1e293b', textAlign: 'center', marginBottom: '20px' }}>
              {parentGateProblem?.num1} × {parentGateProblem?.num2} = ?
            </div>
            <input 
              type="number" 
              autoFocus
              value={parentGateInput}
              onChange={e => setParentGateInput(e.target.value)}
              style={{
                width: '100%', padding: '12px', fontSize: '1.2rem', borderRadius: '12px',
                border: '2px solid #cbd5e1', marginBottom: '20px', textAlign: 'center'
              }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => { audioSynth.playClick(); setShowParentGate(false); }}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#e2e8f0', color: '#475569', fontWeight: 'bold' }}
              >
                {lang === 'en' ? 'Cancel' : '取消'}
              </button>
              <button 
                onClick={() => {
                  if (parseInt(parentGateInput, 10) === parentGateProblem?.ans) {
                    audioSynth.playCorrect();
                    setShowParentGate(false);
                    setShowSettings(true);
                  } else {
                    audioSynth.playIncorrect();
                    setIsParentGateShaking(true);
                    setParentGateInput('');
                    setTimeout(() => setIsParentGateShaking(false), 500);
                  }
                }}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#dc2626', color: 'white', fontWeight: 'bold' }}
              >
                {lang === 'en' ? 'Verify' : '验证'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000,
          cursor: 'zoom-out'
        }} onClick={() => {
           audioSynth.playClick();
           setPreviewImage(null);
        }}>
          <img src={previewImage} alt="Preview" style={{
            maxWidth: '90%', maxHeight: '90%',
            objectFit: 'contain',
            animation: 'bounceInDrop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }} />
        </div>
      )}

      {/* Caught By Modal */}
      {caughtBy && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(239,68,68,0.3)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000,
          cursor: 'pointer'
        }} onClick={() => {
           audioSynth.playClick();
           setCaughtBy(null);
           setPos({ ...currentLevel.start });
           setEnemyPositions(currentLevel.enemies ? currentLevel.enemies.map((e, i) => enemyHealths[i] <= 0 ? null : ({...e.start})) : []);
        }}>
          <div className="bounce-in" style={{
            background: 'white', padding: isMobile ? '30px' : '40px', borderRadius: '30px',
            textAlign: 'center', boxShadow: '0 20px 50px rgba(220,38,38,0.4)',
            border: '6px solid #ef4444', display: 'flex', flexDirection: 'column', alignItems: 'center'
          }}>
            <h2 style={{ color: '#dc2626', margin: '0 0 20px 0', fontSize: '2rem' }}>
              {lang === 'en' ? 'Oops! Caught!' : '哎呀！被抓住了！'}
            </h2>
            <img src={`${import.meta.env.BASE_URL}${caughtBy}_3d.png`} style={{
              width: '160px', height: '160px', objectFit: 'contain', animation: 'shakeAngry 0.6s infinite',
              filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.3))', marginBottom: '25px'
            }} />
            <p style={{ margin: 0, fontSize: '1.2rem', color: '#475569', fontWeight: 'bold' }}>
              {lang === 'en' ? 'Tap to try again' : '点击屏幕重新开始'}
            </p>
          </div>
        </div>
      )}

      {/* Monster Menu Modal */}
      {showMonsterMenu && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'linear-gradient(135deg, rgba(15,12,41,0.97) 0%, rgba(48,43,99,0.97) 50%, rgba(36,36,62,0.97) 100%)',
          backdropFilter: 'blur(8px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          zIndex: 3500, overflowY: 'auto', padding: '16px'
        }}>
          <style>{`
            @keyframes monsterCardPop {
              0% { transform: scale(0.6) translateY(30px); opacity: 0; }
              70% { transform: scale(1.05) translateY(-4px); opacity: 1; }
              100% { transform: scale(1) translateY(0); opacity: 1; }
            }
            @keyframes hpPulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.15); }
            }
            @keyframes titleGlow {
              0%, 100% { text-shadow: 0 0 10px rgba(168,85,247,0.5), 0 0 30px rgba(59,130,246,0.3); }
              50% { text-shadow: 0 0 20px rgba(168,85,247,0.9), 0 0 50px rgba(59,130,246,0.6); }
            }
          `}</style>

          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: '20px', marginTop: '8px' }}>
            <h2 style={{
              color: 'white', fontSize: isMobile ? '1.6rem' : '2.2rem',
              margin: '0 0 6px 0', fontWeight: '800',
              animation: 'titleGlow 2s infinite'
            }}>👾 {lang === 'en' ? 'Monster Guide' : '怪物图鉴'}</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0, fontSize: '0.9rem' }}>
              {lang === 'en' ? 'All enemies in Coding Maze' : '编程迷宫中的所有怪物'}
            </p>
          </div>

          {/* Monster Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: isMobile ? '10px' : '16px',
            width: '100%', maxWidth: '900px', marginBottom: '20px'
          }}>
            {[
              { type: 'snake',    emoji: '🐍', name: lang==='en'?'Snake':'蛇',       hp: 1, color: '#16a34a', glow: '#4ade80', anim: 'hoverWobble 1s infinite',          desc: lang==='en'?'Slithers back and forth':'左右来回滑行' },
              { type: 'spider',   emoji: '🕷️', name: lang==='en'?'Spider':'蜘蛛',    hp: 1, color: '#7c3aed', glow: '#a78bfa', anim: 'hoverWobble 1.2s infinite ease-in-out', desc: lang==='en'?'Sets sticky webs':'设置黏网陷阱' },
              { type: 'turtle',   emoji: '🐢', name: lang==='en'?'Turtle':'乌龟',    hp: 1, color: '#0891b2', glow: '#67e8f9', anim: 'hoverWobble 2s infinite ease-in-out', desc: lang==='en'?'Slow but sturdy':'缓慢但顽固' },
              { type: 'tiger',    emoji: '🐯', name: lang==='en'?'Tiger':'老虎',     hp: 2, color: '#ea580c', glow: '#fb923c', anim: 'idleBreathing 1.5s infinite alternate', desc: lang==='en'?'Fast predator':'凶猛的猎手' },
              { type: 'rhino',    emoji: '🦏', name: lang==='en'?'Rhino':'犀牛',     hp: 2, color: '#78716c', glow: '#d6d3d1', anim: 'shakeAngry 0.8s infinite',          desc: lang==='en'?'Always angry':'永远愤怒' },
              { type: 'ghost',    emoji: '👻', name: lang==='en'?'Ghost':'幽灵',     hp: 1, color: '#8b5cf6', glow: '#c4b5fd', anim: 'ghostFloat 2s infinite ease-in-out', desc: lang==='en'?'Fades in and out':'忽明忽暗漂浮' },
              { type: 'zombie',   emoji: '🧟', name: lang==='en'?'Zombie':'僵尸',    hp: 2, color: '#65a30d', glow: '#bef264', anim: 'zombieLimp 1.2s infinite',          desc: lang==='en'?'Stumbles forward':'蹒跚跛行' },
              { type: 'witch',    emoji: '🧙', name: lang==='en'?'Witch':'女巫',     hp: 2, color: '#9333ea', glow: '#e879f9', anim: 'witchHover 1.5s infinite ease-in-out', desc: lang==='en'?'Flies on broomstick':'骑扫帚飞行' },
              { type: 'elephant', emoji: '🐘', name: lang==='en'?'Elephant':'大象',  hp: 3, color: '#475569', glow: '#94a3b8', anim: 'idleBreathing 1.5s infinite alternate', desc: lang==='en'?'Huge and heavy':'巨大沉重' },
              { type: 'magma',    emoji: '🌋', name: lang==='en'?'Magma':'岩浆怪',  hp: 3, color: '#dc2626', glow: '#f97316', anim: 'magmaBubble 1.4s infinite alternate', desc: lang==='en'?'Burns nearby tiles':'周围格子着火🔥' },
              { type: 'dinosaur', emoji: '🦕', name: lang==='en'?'Dinosaur':'恐龙',  hp: 4, color: '#b91c1c', glow: '#ef4444', anim: 'dinoBreathing 1.8s infinite alternate', desc: lang==='en'?'2x2 BOSS! Spits fire':'2x2大boss! 喷火🔥' },
              { type: 'skeleton', emoji: '💀', name: lang==='en'?'Skeleton':'骷髅士兵',hp: 1, color: '#6b7280', glow: '#9ca3af', anim: 'skeletonRattle 0.5s infinite', desc: lang==='en'?'A frightening skeleton warrior':'手持邪恶铁刃的恐怖骷髅兵' },
            ].map((m, idx) => (
              <div key={m.type} style={{
                background: `linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)`,
                border: `2px solid ${m.glow}44`,
                borderRadius: '20px',
                padding: isMobile ? '12px 8px' : '18px 12px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                backdropFilter: 'blur(10px)',
                boxShadow: `0 4px 20px ${m.glow}22, inset 0 1px 0 rgba(255,255,255,0.1)`,
                animation: `monsterCardPop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${idx * 0.06}s both`,
                cursor: 'default'
              }}>
                {/* Monster image */}
                <div style={{
                  width: isMobile ? '70px' : '90px',
                  height: isMobile ? '70px' : '90px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: m.type === 'ghost' ? 0.8 : 1
                }}>
                  <img src={`${import.meta.env.BASE_URL}${m.type}_3d.png`} style={{
                    width: '100%', height: '100%', objectFit: 'contain',
                    animation: m.anim,
                    filter: `drop-shadow(0 4px 8px ${m.glow}88)`
                  }} />
                </div>

                {/* Name */}
                <div style={{
                  color: 'white', fontWeight: '800',
                  fontSize: isMobile ? '0.85rem' : '1rem',
                  textShadow: `0 0 8px ${m.glow}`
                }}>{m.emoji} {m.name}</div>

                {/* HP hearts */}
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', marginRight: '2px' }}>HP</span>
                  {Array.from({ length: m.hp }).map((_, hi) => (
                    <span key={hi} style={{
                      fontSize: isMobile ? '14px' : '16px',
                      animation: `hpPulse 1s infinite ${hi * 0.15}s`,
                      display: 'inline-block'
                    }}>❤️</span>
                  ))}
                </div>

                {/* Description */}
                <div style={{
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: isMobile ? '0.65rem' : '0.72rem',
                  textAlign: 'center', lineHeight: '1.3'
                }}>{m.desc}</div>
              </div>
            ))}
          </div>

          {/* Close button */}
          <button
            onClick={() => { audioSynth.playClick(); setShowMonsterMenu(false); }}
            style={{
              padding: '14px 48px', borderRadius: '50px', border: 'none',
              background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              color: 'white', fontWeight: '800', fontSize: '1.1rem',
              cursor: 'pointer', marginBottom: '16px',
              boxShadow: '0 6px 24px rgba(139,92,246,0.5)',
              fontFamily: 'Fredoka, sans-serif'
            }}
          >
            {lang === 'en' ? '✕ Close' : '✕ 关闭'}
          </button>
        </div>
      )}

      {/* Level Selector Modal (Map) */}
      {showLevelMap && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 3400, padding: '16px'
        }}>
          <style>{`
            @keyframes mapLevelPop {
              0% { transform: scale(0.7); opacity: 0; }
              100% { transform: scale(1); opacity: 1; }
            }
            @keyframes borderPulse {
              0%, 100% { box-shadow: 0 0 0 2px #eab308, 0 0 10px #eab308; }
              50% { box-shadow: 0 0 0 5px #eab308, 0 0 20px #fbbf24; }
            }
          `}</style>
          <div className="bounce-in" style={{
            background: 'white',
            borderRadius: '28px',
            width: '100%',
            maxWidth: '560px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
            border: '6px solid #3b82f6',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: 'white', padding: '18px 24px', textAlign: 'center'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800' }}>
                🗺️ {lang === 'en' ? 'Select Level' : '选择关卡'}
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>
                {lang === 'en' ? `Replay beaten levels or jump ahead` : `重玩打过的关卡或跳关`} (HP: {maxUnlockedLevel + 1}/{LEVELS.length})
              </p>
            </div>

            {/* Grid Container */}
            <div style={{
              padding: '20px',
              overflowY: 'auto',
              flex: 1,
              background: '#f8fafc'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '10px',
                justifyItems: 'center'
              }}>
                {LEVELS.map((lvl, index) => {
                  const isLocked = index > maxUnlockedLevel;
                  const isActive = index === levelIdx;
                  
                  // Style colors based on level block
                  let bg = '#e2e8f0';
                  let color = '#475569';
                  let border = '2px solid #cbd5e1';
                  
                  if (!isLocked) {
                    if (index >= 34) {
                      // Ultimate levels: purple
                      bg = '#f3e8ff';
                      color = '#7e22ce';
                      border = '2px solid #c084fc';
                    } else if (index >= 20) {
                      // Mid/Advanced: orange
                      bg = '#ffedd5';
                      color = '#c2410c';
                      border = '2px solid #fdbb2d';
                    } else {
                      // Easy/basic: green
                      bg = '#dcfce7';
                      color = '#15803d';
                      border = '2px solid #86efac';
                    }
                  }

                  return (
                    <button
                      key={`lvl-btn-${index}`}
                      disabled={isLocked}
                      onClick={() => {
                        audioSynth.playClick();
                        setLevelIdx(index);
                        localStorage.setItem('codingMazeLevel', index.toString());
                        setShowLevelMap(false);
                      }}
                      style={{
                        width: '54px',
                        height: '54px',
                        borderRadius: '50%',
                        border: isActive ? '3px solid #eab308' : border,
                        background: isLocked ? '#cbd5e1' : bg,
                        color: isLocked ? '#94a3b8' : color,
                        fontSize: '1.1rem',
                        fontWeight: '800',
                        cursor: isLocked ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        transition: 'all 0.2s',
                        animation: isActive ? 'borderPulse 1.5s infinite' : 'none',
                        opacity: isLocked ? 0.6 : 1,
                        boxShadow: isActive ? '0 0 10px rgba(234,179,8,0.5)' : 'none'
                      }}
                    >
                      {isLocked ? '🔒' : index + 1}
                      {isActive && (
                        <span style={{
                          position: 'absolute', top: '-4px', right: '-4px',
                          fontSize: '10px', background: '#eab308', borderRadius: '50%',
                          width: '16px', height: '16px', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', color: 'white', border: '1px solid white'
                        }}>⭐</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div style={{
              padding: '16px', display: 'flex', justifyContent: 'center',
              background: '#f1f5f9', borderTop: '1px solid #e2e8f0'
            }}>
              <button
                onClick={() => { audioSynth.playClick(); setShowLevelMap(false); }}
                style={{
                  padding: '10px 36px', borderRadius: '50px', border: 'none',
                  background: '#64748b', color: 'white', fontWeight: 'bold',
                  fontSize: '1rem', cursor: 'pointer', fontFamily: 'Fredoka, sans-serif'
                }}
              >
                {lang === 'en' ? '✕ Close' : '✕ 关闭'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

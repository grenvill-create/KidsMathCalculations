import React, { useState, useEffect, useRef } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, X, ZoomIn, ZoomOut, RefreshCw, Play, RotateCcw, Settings } from 'lucide-react';
import confetti from 'canvas-confetti';
import { mathGenerator } from '../utils/mathGenerator';
import bg1 from '../assets/bg_random_1.jpg';
import bg2 from '../assets/bg_random_2.jpg';
import bg3 from '../assets/bg_random_3.jpg';
import bg4 from '../assets/bg_random_4.jpg';
import bg5 from '../assets/bg_random_5.jpg';
import { audioSynth } from '../utils/audioSynth';

const BACKGROUNDS = [bg1, bg2, bg3, bg4, bg5];

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
  {theme:"monkey",size:8,start:{r:7,c:0},target:{r:4,c:7},obstacles:[{r:6,c:1},{r:2,c:5},{r:0,c:2},{r:3,c:0},{r:2,c:1},{r:1,c:5},{r:0,c:1},{r:6,c:2},{r:6,c:5},{r:1,c:7},{r:5,c:4},{r:3,c:0},{r:1,c:0},{r:1,c:0},{r:2,c:7},{r:7,c:5},{r:6,c:1},{r:2,c:5}], enemies: [{ type: 'tiger', start: {r: 3, c: 4}, commands: ['UP', 'UP', 'DOWN', 'DOWN'] }]},
  // 26
  {theme:"bear",size:9,start:{r:4,c:0},target:{r:5,c:8},obstacles:[{r:6,c:0},{r:2,c:1},{r:3,c:1},{r:4,c:6},{r:2,c:1},{r:4,c:8},{r:6,c:6},{r:6,c:1},{r:4,c:5},{r:1,c:8},{r:8,c:7},{r:4,c:5},{r:4,c:7},{r:0,c:7},{r:7,c:4},{r:2,c:8},{r:2,c:0},{r:3,c:2},{r:1,c:2},{r:2,c:8},{r:0,c:6},{r:7,c:7}]},
  // 27
  {theme:"mouse",size:9,start:{r:4,c:0},target:{r:3,c:8},obstacles:[{r:0,c:6},{r:4,c:8},{r:8,c:0},{r:0,c:4},{r:5,c:2},{r:8,c:7},{r:2,c:2},{r:4,c:7},{r:6,c:1},{r:5,c:0},{r:6,c:6},{r:5,c:6},{r:7,c:2},{r:5,c:8},{r:6,c:4},{r:6,c:6},{r:0,c:5},{r:1,c:7},{r:5,c:0},{r:0,c:4},{r:0,c:5},{r:7,c:1},{r:4,c:2}]},
  // 28
  {theme:"penguin",size:9,start:{r:2,c:0},target:{r:6,c:8},obstacles:[{r:8,c:0},{r:1,c:5},{r:0,c:6},{r:1,c:0},{r:2,c:3},{r:0,c:0},{r:1,c:2},{r:8,c:1},{r:1,c:4},{r:1,c:7},{r:8,c:2},{r:8,c:5},{r:3,c:8},{r:1,c:8},{r:1,c:0},{r:8,c:2},{r:5,c:7},{r:2,c:5},{r:7,c:7},{r:0,c:6},{r:4,c:6}]},
  // 29
  {theme:"frog",size:9,start:{r:3,c:0},target:{r:3,c:8},obstacles:[{r:1,c:5},{r:8,c:7},{r:4,c:4},{r:0,c:3},{r:5,c:4},{r:6,c:0},{r:7,c:8},{r:8,c:3},{r:0,c:5},{r:6,c:8},{r:2,c:6},{r:0,c:8},{r:6,c:2},{r:5,c:7},{r:2,c:0},{r:7,c:4},{r:7,c:8},{r:4,c:0},{r:5,c:2},{r:8,c:7},{r:7,c:1},{r:0,c:4},{r:6,c:5},{r:5,c:8},{r:4,c:3},{r:4,c:6}]},
  // 30
  // 31
  { theme: 'fox', size: 10, start: {r:9, c:0}, target: {r:0, c:9}, obstacles: [{r:8,c:0},{r:8,c:1},{r:8,c:2},{r:7,c:4},{r:6,c:4},{r:5,c:4},{r:5,c:5},{r:5,c:6},{r:4,c:8},{r:3,c:8},{r:2,c:8},{r:1,c:8},{r:9,c:3},{r:9,c:4},{r:9,c:5},{r:7,c:7},{r:6,c:7},{r:5,c:7},{r:2,c:2},{r:2,c:3},{r:2,c:4},{r:3,c:2},{r:4,c:2},{r:0,c:5},{r:1,c:5}], enemies: [{ type: 'tiger', start: {r:7, c:2}, commands: ['UP', 'DOWN'] }, { type: 'tiger', start: {r:2, c:6}, commands: ['LEFT', 'RIGHT'] }] },
  // 32
  { theme: 'rabbit', size: 10, start: {r:0, c:0}, target: {r:9, c:9}, obstacles: [{r:0,c:2},{r:1,c:2},{r:2,c:2},{r:3,c:2},{r:4,c:2},{r:5,c:2},{r:7,c:0},{r:7,c:1},{r:7,c:2},{r:7,c:3},{r:7,c:4},{r:7,c:5},{r:7,c:6},{r:7,c:7},{r:2,c:5},{r:3,c:5},{r:4,c:5},{r:5,c:5},{r:6,c:5},{r:2,c:7},{r:3,c:7},{r:4,c:7},{r:5,c:7},{r:6,c:7},{r:9,c:5},{r:9,c:6}], enemies: [{ type: 'tiger', start: {r:8, c:3}, commands: ['RIGHT', 'LEFT'] }, { type: 'snake', start: {r:1, c:6}, commands: ['DOWN', 'DOWN', 'UP', 'UP'] }] },
  // 33
  { theme: 'dog', size: 10, start: {r:9, c:9}, target: {r:0, c:0}, obstacles: [{r:8,c:9},{r:8,c:8},{r:8,c:7},{r:8,c:6},{r:6,c:9},{r:6,c:8},{r:6,c:7},{r:6,c:6},{r:4,c:9},{r:4,c:8},{r:4,c:7},{r:4,c:6},{r:2,c:9},{r:2,c:8},{r:2,c:7},{r:2,c:6},{r:9,c:4},{r:8,c:4},{r:7,c:4},{r:6,c:4},{r:5,c:4},{r:4,c:4},{r:3,c:4},{r:2,c:4},{r:1,c:4},{r:9,c:2},{r:8,c:2},{r:7,c:2},{r:6,c:2},{r:5,c:2},{r:4,c:2},{r:3,c:2},{r:2,c:2},{r:1,c:2}], enemies: [{ type: 'tiger', start: {r:7, c:5}, commands: ['UP', 'DOWN'] }, { type: 'tiger', start: {r:3, c:3}, commands: ['DOWN', 'UP'] }] },
  // 34
  { theme: 'cat', size: 10, start: {r:0, c:5}, target: {r:9, c:5}, obstacles: [{r:2,c:0},{r:2,c:1},{r:2,c:2},{r:2,c:3},{r:2,c:4},{r:2,c:6},{r:2,c:7},{r:2,c:8},{r:2,c:9},{r:5,c:0},{r:5,c:1},{r:5,c:2},{r:5,c:3},{r:5,c:4},{r:5,c:6},{r:5,c:7},{r:5,c:8},{r:5,c:9},{r:8,c:0},{r:8,c:1},{r:8,c:2},{r:8,c:3},{r:8,c:4},{r:8,c:6},{r:8,c:7},{r:8,c:8},{r:8,c:9}], enemies: [{ type: 'tiger', start: {r:3, c:5}, commands: ['LEFT', 'RIGHT'] }, { type: 'tiger', start: {r:6, c:5}, commands: ['RIGHT', 'LEFT'] }] },
  // 35
  { theme: 'monkey', size: 10, start: {r:5, c:0}, target: {r:5, c:9}, obstacles: [{r:0,c:2},{r:1,c:2},{r:2,c:2},{r:3,c:2},{r:4,c:2},{r:6,c:2},{r:7,c:2},{r:8,c:2},{r:9,c:2},{r:0,c:5},{r:1,c:5},{r:2,c:5},{r:3,c:5},{r:4,c:5},{r:6,c:5},{r:7,c:5},{r:8,c:5},{r:9,c:5},{r:0,c:8},{r:1,c:8},{r:2,c:8},{r:3,c:8},{r:4,c:8},{r:6,c:8},{r:7,c:8},{r:8,c:8},{r:9,c:8}], enemies: [{ type: 'tiger', start: {r:5, c:3}, commands: ['UP', 'DOWN'] }, { type: 'tiger', start: {r:5, c:6}, commands: ['DOWN', 'UP'] }, { type: 'tiger', start: {r:1, c:7}, commands: ['LEFT', 'RIGHT'] }] },
  // 36
  { theme: 'bear', size: 10, start: {r:0, c:0}, target: {r:9, c:0}, obstacles: [{r:1,c:0},{r:1,c:1},{r:1,c:2},{r:1,c:3},{r:1,c:4},{r:1,c:5},{r:1,c:6},{r:1,c:7},{r:1,c:8},{r:3,c:1},{r:3,c:2},{r:3,c:3},{r:3,c:4},{r:3,c:5},{r:3,c:6},{r:3,c:7},{r:3,c:8},{r:3,c:9},{r:5,c:0},{r:5,c:1},{r:5,c:2},{r:5,c:3},{r:5,c:4},{r:5,c:5},{r:5,c:6},{r:5,c:7},{r:5,c:8},{r:7,c:1},{r:7,c:2},{r:7,c:3},{r:7,c:4},{r:7,c:5},{r:7,c:6},{r:7,c:7},{r:7,c:8},{r:7,c:9}], enemies: [{ type: 'tiger', start: {r:2, c:0}, commands: ['RIGHT', 'RIGHT', 'LEFT', 'LEFT'] }, { type: 'tiger', start: {r:4, c:9}, commands: ['LEFT', 'LEFT', 'RIGHT', 'RIGHT'] }, { type: 'tiger', start: {r:6, c:0}, commands: ['RIGHT', 'RIGHT', 'LEFT', 'LEFT'] }] },
  // 37
  { theme: 'mouse', size: 10, start: {r:4, c:4}, target: {r:0, c:9}, obstacles: [{r:3,c:3},{r:3,c:4},{r:3,c:5},{r:5,c:3},{r:5,c:4},{r:5,c:5},{r:4,c:3},{r:4,c:5},{r:1,c:1},{r:1,c:2},{r:1,c:3},{r:1,c:4},{r:1,c:5},{r:1,c:6},{r:1,c:7},{r:1,c:8},{r:8,c:1},{r:8,c:2},{r:8,c:3},{r:8,c:4},{r:8,c:5},{r:8,c:6},{r:8,c:7},{r:8,c:8},{r:2,c:1},{r:3,c:1},{r:4,c:1},{r:5,c:1},{r:6,c:1},{r:7,c:1},{r:2,c:8},{r:3,c:8},{r:4,c:8},{r:5,c:8},{r:6,c:8},{r:7,c:8}], enemies: [{ type: 'tiger', start: {r:2, c:4}, commands: ['RIGHT', 'LEFT'] }, { type: 'tiger', start: {r:6, c:4}, commands: ['LEFT', 'RIGHT'] }, { type: 'tiger', start: {r:4, c:2}, commands: ['UP', 'DOWN'] }] },
  // 38
  { theme: 'penguin', size: 10, start: {r:9, c:0}, target: {r:0, c:9}, obstacles: [{r:8,c:0},{r:7,c:1},{r:6,c:2},{r:5,c:3},{r:4,c:4},{r:3,c:5},{r:2,c:6},{r:1,c:7},{r:0,c:8},{r:9,c:1},{r:8,c:2},{r:7,c:3},{r:6,c:4},{r:5,c:5},{r:4,c:6},{r:3,c:7},{r:2,c:8},{r:1,c:9}], enemies: [{ type: 'tiger', start: {r:9, c:9}, commands: ['UP', 'UP', 'DOWN', 'DOWN'] }, { type: 'tiger', start: {r:0, c:0}, commands: ['DOWN', 'DOWN', 'UP', 'UP'] }, { type: 'snake', start: {r:4, c:1}, commands: ['RIGHT', 'LEFT'] }] },
  // 39
  { theme: 'frog', size: 10, start: {r:4, c:0}, target: {r:4, c:9}, obstacles: [{r:0,c:4},{r:1,c:4},{r:2,c:4},{r:3,c:4},{r:5,c:4},{r:6,c:4},{r:7,c:4},{r:8,c:4},{r:9,c:4},{r:0,c:6},{r:1,c:6},{r:2,c:6},{r:3,c:6},{r:5,c:6},{r:6,c:6},{r:7,c:6},{r:8,c:6},{r:9,c:6},{r:4,c:2},{r:3,c:2},{r:5,c:2},{r:4,c:8},{r:3,c:8},{r:5,c:8}], enemies: [{ type: 'tiger', start: {r:1, c:5}, commands: ['DOWN', 'DOWN', 'UP', 'UP'] }, { type: 'tiger', start: {r:8, c:5}, commands: ['UP', 'UP', 'DOWN', 'DOWN'] }, { type: 'tiger', start: {r:4, c:5}, commands: ['LEFT', 'RIGHT'] }] },
  // 40
  { theme: 'alien', size: 10, start: {r:9, c:4}, target: {r:0, c:5}, obstacles: [{r:8,c:1},{r:8,c:2},{r:8,c:3},{r:8,c:4},{r:8,c:5},{r:8,c:6},{r:8,c:7},{r:8,c:8},{r:6,c:0},{r:6,c:1},{r:6,c:2},{r:6,c:3},{r:6,c:4},{r:6,c:5},{r:6,c:6},{r:6,c:7},{r:4,c:2},{r:4,c:3},{r:4,c:4},{r:4,c:5},{r:4,c:6},{r:4,c:7},{r:4,c:8},{r:4,c:9},{r:2,c:0},{r:2,c:1},{r:2,c:2},{r:2,c:3},{r:2,c:4},{r:2,c:5},{r:2,c:6},{r:2,c:7}], enemies: [{ type: 'tiger', start: {r:7, c:0}, commands: ['RIGHT', 'RIGHT', 'RIGHT', 'LEFT', 'LEFT', 'LEFT'] }, { type: 'tiger', start: {r:5, c:9}, commands: ['LEFT', 'LEFT', 'LEFT', 'RIGHT', 'RIGHT', 'RIGHT'] }, { type: 'tiger', start: {r:3, c:0}, commands: ['RIGHT', 'RIGHT', 'RIGHT', 'LEFT', 'LEFT', 'LEFT'] }, { type: 'tiger', start: {r:1, c:9}, commands: ['LEFT', 'LEFT', 'LEFT', 'RIGHT', 'RIGHT', 'RIGHT'] }] }
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
        const eType = idx >= 4 ? 'tiger' : 'snake'; // 从第5关起出现老虎
        newLvl.enemies = [{ type: eType, start: firstEnemyPos, commands: ['DOWN', 'UP', 'RIGHT', 'LEFT'] }];
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
        if (idx >= 14) {
          // level 15+: 混合大象、蜘蛛、老虎
          const r = Math.random();
          if (r < 0.25) eType = 'elephant';
          else if (r < 0.6) eType = 'spider';
        } else if (idx >= 4) {
          // level 5-14: 混合蜘蛛、老虎
          if (Math.random() < 0.4) eType = 'spider';
        }
        newLvl.enemies.push({ type: eType, start: extraEnemyPos, commands: ['UP', 'DOWN', 'LEFT', 'RIGHT'] });
      }
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
    return (
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(circle at top left, rgba(255, 255, 200, 0.4) 0%, transparent 50%)',
        mixBlendMode: 'screen'
      }} />
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

  const currentLevel = LEVELS[levelIdx] || LEVELS[0];
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
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return { normal: 0, freeze: 0, super: 0 };
  });
  const [activeBombType, setActiveBombType] = useState(null);
  const [activeExplosion, setActiveExplosion] = useState(null);
  const [showShop, setShowShop] = useState(false);
  const [shopTarget, setShopTarget] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [spiderWebs, setSpiderWebs] = useState([]);
  const [webStuckPrompt, setWebStuckPrompt] = useState(null);
  const [webStruggle, setWebStruggle] = useState(false);
  const [destroyedObstacles, setDestroyedObstacles] = useState([]);
  const [enemyHealths, setEnemyHealths] = useState([]);
  const [enemyPositions, setEnemyPositions] = useState([]);
  
  const [showMathQuiz, setShowMathQuiz] = useState(false);
  const [mathProblem, setMathProblem] = useState(null);
  const [mathInput, setMathInput] = useState('');
  const [isMathShaking, setIsMathShaking] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showParentGate, setShowParentGate] = useState(false);
  const [parentGateProblem, setParentGateProblem] = useState(null);
  const [parentGateInput, setParentGateInput] = useState('');
  const [isParentGateShaking, setIsParentGateShaking] = useState(false);
  const [customMinInput, setCustomMinInput] = useState(1);
  const [customMaxInput, setCustomMaxInput] = useState(20);
  const [mathMin, setMathMin] = useState(1);
  const [mathMax, setMathMax] = useState(20);
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
    setShowParentGate(true);
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
    setTrail([]);
    setPendingBombs([]);
    setDestroyedObstacles([]);
    setEnemyHealths(currentLevel.enemies ? currentLevel.enemies.map(e => {
      if (e.type === 'elephant') return 3;
      if (e.type === 'tiger') return 2;
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
    setShopTarget({ type, needed, answered: 0 });
    setShowShop(false);
    generateAndShowQuestion();
  };

  const generateAndShowQuestion = () => {
    const q = mathGenerator.generateQuestion(4, { minNumber: mathMin, maxNumber: mathMax, operations: ['add', 'sub'], lang: lang });
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
        setShowMathQuiz(false);
        return;
      }

      const newAnswered = shopTarget.answered + 1;
      if (newAnswered >= shopTarget.needed) {
        const newInv = { ...inventory };
        if (shopTarget.type === 'normal') newInv.normal += 2;
        if (shopTarget.type === 'freeze') newInv.freeze += 1;
        if (shopTarget.type === 'super') newInv.super += 1;
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
        webStuckPrompt.resolve(false);
        setWebStuckPrompt(null);
        setShowMathQuiz(false);
      }
    }
  };

  const addCommand = (cmd) => {
    if (isPlaying || isSolved) return;
    audioSynth.playClick();
    if (commands.length < 30) {
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

    for (let i = 0; i < commands.length; i++) {
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
          const enemyDef = currentLevel.enemies[eIdx];
          
          if (enemyDef.type === 'spider') {
            if (!currentWebs.some(w => w.r === ep.r && w.c === ep.c)) {
              currentWebs.push({r: ep.r, c: ep.c});
              setSpiderWebs([...currentWebs]);
            }
          }
          if (enemyDef.type === 'elephant') {
            anyElephantMoved = true;
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
        
        if (anyElephantMoved) {
           setIsShaking(true);
           setTimeout(() => setIsShaking(false), 200); // short stomp shake
        }
      }

      const hitEnemy = currentEnemyPositions.some(ep => ep && ep.r === nextR && ep.c === nextC);
      if (hitEnemy) {
        audioSynth.playIncorrect();
        setStatusMsg(lang === 'en' ? 'Oops! Caught by an enemy.' : '哎呀，被敌人抓住了。');
        setIsPlaying(false);
        setExecutingIdx(-1);
        setIsShaking(true);
        
        let caughtType = 'snake';
        currentEnemyPositions.forEach((ep, eIdx) => {
            if (ep && ep.r === nextR && ep.c === nextC) {
                caughtType = currentLevel.enemies[eIdx].type;
            }
        });
        setCaughtBy(caughtType);
        
        resetTimeoutRef.current = setTimeout(() => {
          setIsShaking(false);
          setPos({ ...currentLevel.start });
          setEnemyPositions(currentLevel.enemies ? currentLevel.enemies.map((e, i) => enemyHealths[i] <= 0 ? null : ({...e.start})) : []);
          setSpiderWebs([]);
        }, 500);
        return;
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
      localStorage.removeItem('codingMazeInventory');
      setLevelIdx(0);
      setInventory({ normal: 0, freeze: 0, super: 0 });
      setActiveBombType(null);
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
    for (let r = 0; r < currentLevel.size; r++) {
      const row = [];
      for (let c = 0; c < currentLevel.size; c++) {
        let content = null;
        let bg = (r + c) % 2 === 0 ? tTheme.bgFloor : tTheme.bgAlt;
        let shadowColor = (r + c) % 2 === 0 ? tTheme.bgAlt : '#cbd5e1';
        let borderColor = (r + c) % 2 === 0 ? tTheme.bgAlt : '#cbd5e1';

        const isObstacle = currentLevel.obstacles.some(o => o.r === r && o.c === c);
        const isDestroyed = destroyedObstacles.some(o => o.r === r && o.c === c);

        const enemyIdx = enemyPositions.findIndex((ep, idx) => ep && ep.r === r && ep.c === c && enemyHealths[idx] > 0);
        const isEnemy = enemyIdx !== -1;
        const isEnemyDestroyed = currentLevel.enemies?.some((e, i) => enemyHealths[i] <= 0 && e.start.r === r && e.start.c === c);

        const isPendingBomb = pendingBombs.some(p => p.r === r && p.c === c);
        const isFootprint = trail.some(t => t.r === r && t.c === c);

        const isWeb = spiderWebs.some(w => w.r === r && w.c === c);

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
        } else if (isWeb) {
          content = <img src={`${import.meta.env.BASE_URL}spider_web.png`} style={{ width: '80%', height: '80%', opacity: 0.8 }} alt="web" />;
        } else if (isFootprint) {
          content = <div style={{ width: '40%', height: '40%', background: 'rgba(0,0,0,0.1)', borderRadius: '50%', animation: 'dustCloud 1s forwards' }}></div>;
        }

        const canBomb = activeBombType !== null && ((isObstacle && !isDestroyed) || isEnemy);

        row.push(
          <div key={`${r}-${c}`} style={{
            flex: 1,
            height: '100%',
            backgroundColor: bg,
            borderRadius: isMobile ? '6px' : '12px',
            border: `${isMobile ? 1 : 2}px solid ${borderColor}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: `${cellSize * 0.6}px`,
            boxShadow: `0 ${isMobile ? 2 : 4}px 0 ${shadowColor}`,
            position: 'relative',
            cursor: canBomb ? 'crosshair' : (isEnemy && activeBombType === null ? 'pointer' : 'default'),
            outline: canBomb ? '2px solid red' : 'none',
            outlineOffset: '-2px'
          }} onClick={() => {
            if (canBomb && !isPendingBomb) {
              const usedBomb = activeBombType;
              setActiveBombType(null);
              const newInv = { ...inventory, [usedBomb]: inventory[usedBomb] - 1 };
              setInventory(newInv);
              localStorage.setItem('codingMazeInventory', JSON.stringify(newInv));

              setPendingBombs([...pendingBombs, {r, c}]);
              audioSynth.playClick();
              setTimeout(() => {
                if (usedBomb === 'freeze') audioSynth.playFreezeBomb();
                else if (usedBomb === 'super') audioSynth.playSuperBomb();
                else audioSynth.playBomb();
                
                setIsShaking(true);
                setTimeout(() => setIsShaking(false), 300);
                
                const explId = Date.now();
                setActiveExplosion({ r, c, type: usedBomb, id: explId });
                setTimeout(() => {
                  setActiveExplosion(prev => prev && prev.id === explId ? null : prev);
                }, 500);
                
                if (containerRef.current) {
                  const rect = containerRef.current.getBoundingClientRect();
                  const cellW = rect.width / currentLevel.size;
                  const cellH = rect.height / currentLevel.size;
                  const absX = rect.left + c * cellW + cellW / 2;
                  const absY = rect.top + r * cellH + cellH / 2;
                  
                  confetti({
                    particleCount: 80,
                    spread: 100,
                    startVelocity: 30,
                    origin: {
                      x: absX / window.innerWidth,
                      y: absY / window.innerHeight
                    },
                    colors: usedBomb === 'freeze' ? ['#60a5fa', '#93c5fd', '#bfdbfe', '#ffffff'] : ['#ef4444', '#f97316', '#eab308', '#27272a', '#64748b'],
                    ticks: 100,
                    gravity: 1.2
                  });
                }
                
                setPendingBombs(prev => prev.filter(p => p.r !== r || p.c !== c));
                
                if (isEnemy) {
                  setEnemyHealths(prev => {
                    const next = [...prev];
                    let dmg = 1;
                    if (usedBomb === 'freeze') dmg = 2;
                    if (usedBomb === 'super') dmg = 3;
                    
                    const eType = currentLevel.enemies[enemyIdx].type;
                    if (eType === 'turtle' && usedBomb !== 'super') {
                      dmg = 0; // Immune to normal/freeze bombs
                    }
                    
                    next[enemyIdx] -= dmg;
                    return next;
                  });
                } else {
                  setDestroyedObstacles(prev => [...prev, { r, c }]);
                }
              }, 500);
            } else if (isEnemy && activeBombType === null) {
              const eType = currentLevel.enemies[enemyIdx].type;
              if (['tiger', 'elephant', 'spider', 'rhino', 'turtle', 'snake'].includes(eType)) {
                audioSynth.playClick();
                setPreviewImage(`${import.meta.env.BASE_URL}${eType}_3d.png`);
              }
            }
          }}>
            {content}
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
        animation: 'bounceInDrop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
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
          fontSize: `${cellSize * 0.7}px`,
          transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
          animation: webStruggle ? 'webStruggle 0.3s infinite' : (isShaking ? 'heroShake 0.4s' : (isSolved ? 'victorySpin 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards' : (isJumping ? 'heroJump 0.5s infinite' : (isWalking ? 'wobbleWalk 0.4s infinite' : 'none')))),
          zIndex: 10,
          filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.25))'
        }}>
          {tTheme.hero}
        </div>
        {/* Enemy overlays */}
        {enemyPositions.map((ep, i) => {
          if (!ep) return null;
          if (enemyHealths[i] <= 0) return null;
          const eType = currentLevel.enemies[i]?.type || 'snake';
          const emoji = eType === 'tiger' ? '🐯' : '🐍';
          const maxHealth = eType === 'elephant' ? 3 : (eType === 'tiger' || eType === 'rhino' ? 2 : 1);
          const curHealth = enemyHealths[i];
          
          return (
            <div key={`enemy-${i}`} style={{
              position: 'absolute',
              top: `calc(${gridPadding}px + ${ep.r} * (100% - ${2 * gridPadding}px + ${gridGap}px) / ${size})`,
              left: `calc(${gridPadding}px + ${ep.c} * (100% - ${2 * gridPadding}px + ${gridGap}px) / ${size})`,
              width: `calc((100% - ${2 * gridPadding}px - ${(size - 1) * gridGap}px) / ${size})`,
              height: `calc((100% - ${2 * gridPadding}px - ${(size - 1) * gridGap}px) / ${size})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: `${cellSize * 0.7}px`,
              transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
              zIndex: 9,
              pointerEvents: 'none'
            }}>
              {['tiger', 'elephant', 'spider', 'rhino', 'turtle', 'snake'].includes(eType) ? (
                <img src={`${import.meta.env.BASE_URL}${eType}_3d.png`} style={{
                  width: eType === 'elephant' ? '120%' : eType === 'rhino' ? '110%' : eType === 'turtle' ? '85%' : '90%', 
                  height: eType === 'elephant' ? '120%' : eType === 'rhino' ? '110%' : eType === 'turtle' ? '85%' : '90%', 
                  objectFit: 'contain',
                  animation: isPlaying ? 'wobbleWalk 0.4s infinite' : 
                             (eType === 'rhino' ? 'shakeAngry 0.8s infinite' : 
                              eType === 'turtle' ? 'hoverWobble 2s infinite ease-in-out' :
                              eType === 'spider' ? 'hoverWobble 1.2s infinite ease-in-out' :
                              eType === 'snake' ? 'hoverWobble 1s infinite' :
                              'idleBreathing 1.5s infinite alternate'),
                  filter: `drop-shadow(0 ${isMobile ? 3 : 5}px ${isMobile ? 3 : 5}px rgba(0,0,0,0.3))`
                }} />
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
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      transition: 'background-image 0.5s ease-in-out'
    }}>
      <WeatherOverlay weather={currentWeather} />
      
      {/* Transparent card holding all controls */}
      <div style={{
        width: '100%',
        height: '100%',
        maxWidth: '600px',
        display: 'flex',
        flexDirection: 'column',
        padding: isMobile ? '8px' : '20px',
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
        padding: isMobile ? '6px 8px' : '20px',
        boxSizing: 'border-box'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMobile ? '3px' : '12px', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: isMobile ? '2px' : '6px' }}>
            <button className="bouncy-button secondary" onClick={onBack} style={{ padding: isMobile ? '5px 7px' : '8px 12px' }}>
              <ArrowLeft size={isMobile ? 16 : 20} />
            </button>
            <button className="bouncy-button secondary" onClick={resetAllProgress} style={{ padding: isMobile ? '5px 7px' : '8px 12px' }} title={lang === 'en' ? 'Reset Progress' : '重置所有进度'}>
              <RotateCcw size={isMobile ? 16 : 20} />
            </button>
          </div>
          <h2 style={{ color: '#c0487a', margin: 0, fontSize: isMobile ? '0.9rem' : '1.4rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {lang === 'en' ? `Maze (${levelIdx + 1}/${LEVELS.length})` : `编程迷宫 (${levelIdx + 1}/${LEVELS.length})`}
          </h2>
          <div style={{ display: 'flex', gap: isMobile ? '2px' : '6px' }}>
            <button className="bouncy-button secondary" onClick={triggerSettings} style={{ padding: isMobile ? '4px 6px' : '6px 10px' }} title={lang === 'en' ? 'Settings' : '设置'}>
              <Settings size={isMobile ? 14 : 18} />
            </button>
            <button className="bouncy-button secondary" onClick={handleZoomOut} style={{ padding: isMobile ? '4px 6px' : '6px 10px' }} title="缩小">
              <ZoomOut size={isMobile ? 14 : 18} />
            </button>
            <button className="bouncy-button secondary" onClick={handleZoomIn} style={{ padding: isMobile ? '4px 6px' : '6px 10px' }} title="放大">
              <ZoomIn size={isMobile ? 14 : 18} />
            </button>
            <button className="bouncy-button secondary" onClick={() => { audioSynth.playClick(); resetLevel(); }} style={{ padding: isMobile ? '4px 6px' : '8px 12px', marginLeft: isMobile ? '0' : '4px' }}>
              <RefreshCw size={isMobile ? 16 : 20} />
            </button>
          </div>
        </div>

        {/* Maze Container (Flex area that takes remaining vertical space) */}
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
          marginBottom: isMobile ? '3px' : '10px',
          perspective: '1000px'
        }}>
          {/* Inner container forced to be a square, sizing itself purely by CSS constraints */}
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
        <div style={{ flexShrink: 0, height: isMobile ? '16px' : '22px', fontSize: isMobile ? '0.8rem' : '0.95rem', fontWeight: 'bold', color: isSolved ? '#16a34a' : '#c0487a', marginBottom: isMobile ? '2px' : '6px' }}>
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

        {/* Direction buttons */}
        <div style={{ display: 'flex', flexShrink: 0, gap: isMobile ? '6px' : '12px', marginBottom: isMobile ? '4px' : '12px' }}>
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

        {/* Controls and Run area */}
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
            
            {(inventory.normal > 0 || inventory.freeze > 0 || inventory.super > 0) && (
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

      </div>
      </div>

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
              <button onClick={() => triggerMathQuiz('normal', 1)} className="bouncy-button secondary" style={{ padding: '12px', borderRadius: '12px', border: '2px solid #94a3b8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>💣 <span>{lang === 'en' ? 'Normal Bomb x2' : '普通炸弹 x2'}</span></div>
                  <div style={{ fontSize: '0.8rem', color: '#dc2626', background: '#fee2e2', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold' }}>{lang === 'en' ? 'Damage: -1❤️' : '威力: -1❤️'}</div>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{lang === 'en' ? '1 Question' : '需答对 1 题'}</div>
              </button>
              <button onClick={() => triggerMathQuiz('freeze', 2)} className="bouncy-button secondary" style={{ padding: '12px', borderRadius: '12px', border: '2px solid #93c5fd', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#eff6ff' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>❄️ <span style={{color: '#2563eb'}}>{lang === 'en' ? 'Freeze Bomb x1' : '冰冻弹 x1'}</span></div>
                  <div style={{ fontSize: '0.8rem', color: '#1d4ed8', background: '#dbeafe', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold' }}>{lang === 'en' ? 'Damage: -2❤️❤️' : '威力: -2❤️❤️'}</div>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#2563eb' }}>{lang === 'en' ? '2 Questions' : '需连答 2 题'}</div>
              </button>
              <button onClick={() => triggerMathQuiz('super', 3)} className="bouncy-button secondary" style={{ padding: '12px', borderRadius: '12px', border: '2px solid #fde047', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fefce8' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>🌟 <span style={{color: '#ca8a04'}}>{lang === 'en' ? 'Super Bomb x1' : '穿甲弹 x1'}</span></div>
                  <div style={{ fontSize: '0.8rem', color: '#b45309', background: '#fef3c7', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold' }}>{lang === 'en' ? 'Damage: -3❤️❤️❤️' : '威力: -3❤️❤️❤️'}</div>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#ca8a04' }}>{lang === 'en' ? '3 Questions' : '需连答 3 题'}</div>
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
              {lang === 'en' ? 'Math Challenge' : '算术挑战'}
            </h3>
            <p style={{ margin: '0 0 20px 0', color: '#475569', fontSize: '0.95rem', fontWeight: 'bold' }}>
              {lang === 'en' ? `Challenge (${shopTarget?.answered + 1}/${shopTarget?.needed})` : `算术挑战 (${shopTarget?.answered + 1}/${shopTarget?.needed})`}
            </p>
            
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
            width: '90%', maxWidth: '340px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#334155', textAlign: 'center' }}>
              {lang === 'en' ? 'Bomb Math Difficulty' : '获取炸弹难度设置'}
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '10px' }}>
              {lang === 'en' ? 'Numerical range (e.g. 10 to 20):' : '计算数值范围 (例如 10 到 20)：'}
            </p>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px' }}>
              <input 
                type="number" 
                value={customMinInput}
                onChange={e => setCustomMinInput(e.target.value)}
                style={{
                  flex: 1, padding: '12px', fontSize: '1.2rem', borderRadius: '12px',
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
                  flex: 1, padding: '12px', fontSize: '1.2rem', borderRadius: '12px',
                  border: '2px solid #cbd5e1', textAlign: 'center', minWidth: 0
                }}
                placeholder="20"
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => { audioSynth.playClick(); setShowSettings(false); }}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#e2e8f0', color: '#475569', fontWeight: 'bold' }}
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
                  setShowSettings(false);
                }}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#3b82f6', color: 'white', fontWeight: 'bold' }}
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

    </div>
  );
}

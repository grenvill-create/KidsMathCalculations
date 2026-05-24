// Progress Manager for Kids Math App
// Handles localStorage state, mistake book, and sync codes.

export const progressManager = {
  getInitialState() {
    return {
      stage: parseInt(localStorage.getItem('km_stage') || '1'),
      mistakes: JSON.parse(localStorage.getItem('km_mistakes') || '[]'),
      history: JSON.parse(localStorage.getItem('km_history') || '{"totalSolved":0}')
    };
  },

  saveState(state) {
    localStorage.setItem('km_stage', state.stage.toString());
    localStorage.setItem('km_mistakes', JSON.stringify(state.mistakes));
    localStorage.setItem('km_history', JSON.stringify(state.history));
  },

  // Record a mistake. if the problem already exists, increment error count.
  recordMistake(problemStr, num1, num2, symbol, answer) {
    let mistakes = JSON.parse(localStorage.getItem('km_mistakes') || '[]');
    let existing = mistakes.find(m => m.problemStr === problemStr);
    
    if (existing) {
      existing.count += 1;
    } else {
      mistakes.push({ problemStr, num1, num2, symbol, answer, count: 1 });
    }
    
    // Sort by count descending (hardest first)
    mistakes.sort((a, b) => b.count - a.count);
    localStorage.setItem('km_mistakes', JSON.stringify(mistakes));
  },

  // Remove or decrement mistake after reviewing
  resolveMistake(problemStr) {
    let mistakes = JSON.parse(localStorage.getItem('km_mistakes') || '[]');
    mistakes = mistakes.filter(m => m.problemStr !== problemStr);
    localStorage.setItem('km_mistakes', JSON.stringify(mistakes));
  },

  recordSolved() {
    let history = JSON.parse(localStorage.getItem('km_history') || '{"totalSolved":0}');
    history.totalSolved += 1;
    localStorage.setItem('km_history', JSON.stringify(history));
  },

  // Generate Base64 Sync Code
  generateSyncCode() {
    const data = {
      s: localStorage.getItem('km_stage') || '1',
      m: JSON.parse(localStorage.getItem('km_mistakes') || '[]'),
      h: JSON.parse(localStorage.getItem('km_history') || '{"totalSolved":0}')
    };
    // Encode to base64
    return btoa(JSON.stringify(data));
  },

  // Import Sync Code
  importSyncCode(code) {
    try {
      const data = JSON.parse(atob(code));
      if (data && data.s && data.m) {
        localStorage.setItem('km_stage', data.s.toString());
        localStorage.setItem('km_mistakes', JSON.stringify(data.m));
        localStorage.setItem('km_history', JSON.stringify(data.h || {"totalSolved":0}));
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }
};

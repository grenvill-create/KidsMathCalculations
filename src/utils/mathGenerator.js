// Pedagogical Math Generator — Custom Range Mode
// Supports arbitrary maxNumber (e.g. 10, 20, 30, 50, 100) and operation filters.

export const mathGenerator = {
  /**
   * Generate a question based on custom settings.
   * @param {object} opts - { maxNumber: number, operations: ['add','sub'] }
   * @param {number} stage - legacy stage (still used to control manipulative display)
   */
  generateQuestion(stage, opts = {}) {
    const minNumber = opts.minNumber ?? 1;
    const maxNumber = opts.maxNumber ?? 10;
    const operations = opts.operations ?? ['add', 'sub'];

    // Decide operation
    const canAdd = operations.includes('add');
    const canSub = operations.includes('sub');
    let isSub = false;
    if (canAdd && canSub) {
      isSub = Math.random() > 0.5;
    } else if (canSub) {
      isSub = true;
    } else {
      isSub = false;
    }

    let num1, num2, answer, symbol;

    if (!isSub) {
      // Addition: answer (sum) in [minNumber, maxNumber], split randomly.
      // Ensure answer is at least 2 so we can split it into two positive integers (e.g. 1 + 1)
      const minAns = Math.max(2, minNumber);
      const maxAns = Math.max(minAns, maxNumber);
      
      answer = Math.floor(Math.random() * (maxAns - minAns + 1)) + minAns;
      num1 = Math.floor(Math.random() * (answer - 1)) + 1; // at least 1
      num2 = answer - num1;
      symbol = '+';
    } else {
      // Subtraction: minuend (num1) in [minNumber, maxNumber], subtract [1, minuend-1]
      // Ensure minuend is at least 2 so we can subtract a positive integer and get a positive result
      const minMin = Math.max(2, minNumber);
      const maxMin = Math.max(minMin, maxNumber);
      
      num1 = Math.floor(Math.random() * (maxMin - minMin + 1)) + minMin;
      num2 = Math.floor(Math.random() * (num1 - 1)) + 1; // at least 1
      answer = num1 - num2;
      symbol = '-';
    }

    const lang = opts.lang ?? 'zh';
    const spokenText = lang === 'en'
      ? `What is ${num1} ${symbol === '+' ? 'plus' : 'minus'} ${num2}?`
      : `${num1} ${symbol === '+' ? '加' : '减'} ${num2} 等于几？`;
    const problemStr = `${num1}${symbol}${num2}`;

    return {
      problemStr,
      num1,
      num2,
      symbol,
      answer,
      spokenText,
      stage,        // preserve stage for UI logic (manipulatives display)
      minNumber,
      maxNumber,
    };
  },

  /**
   * Generate an array of unique questions for Challenge Mode.
   */
  generateChallenge(count, stage, opts = {}) {
    const questions = [];
    const usedStrs = new Set();
    
    // Safety break to prevent infinite loops if the pool is too small
    let attempts = 0;
    while (questions.length < count && attempts < count * 5) {
      attempts++;
      const q = this.generateQuestion(stage, opts);
      if (!usedStrs.has(q.problemStr)) {
        usedStrs.add(q.problemStr);
        questions.push(q);
      }
    }
    return questions;
  },

  /**
   * Generate a simple explanation text for a missed problem.
   */
  generateExplanation(q, lang = 'zh') {
    const isEn = lang === 'en';
    if (q.symbol === '+') {
      if (q.num1 + q.num2 <= 10) {
        return isEn 
          ? `Think about it, what do you get when you put ${q.num1} and ${q.num2} together? You can count them using your fingers!`
          : `想想看，${q.num1} 和 ${q.num2} 凑在一起是几呢？你可以伸出手指头数一数！`;
      } else if (q.num1 + q.num2 <= 20) {
        // Try to explain "凑十法" if possible
        const bigger = Math.max(q.num1, q.num2);
        const smaller = Math.min(q.num1, q.num2);
        const diffToTen = 10 - bigger;
        if (diffToTen > 0 && diffToTen < smaller) {
          return isEn
            ? `Tip: Try making ten! Split ${smaller} into ${diffToTen} and ${smaller - diffToTen}. ${bigger} plus ${diffToTen} makes 10, then add the remaining ${smaller - diffToTen} to get ${q.answer}.`
            : `机器提示：试试凑十法！把 ${smaller} 分成 ${diffToTen} 和 ${smaller - diffToTen}。${bigger} 加上 ${diffToTen} 凑成 10，再加上剩下的 ${smaller - diffToTen} 就是 ${q.answer} 啦。`;
        }
      }
      return isEn 
        ? `${q.num1} plus ${q.num2} equals ${q.answer}!` 
        : `${q.num1} 加上 ${q.num2}，等于 ${q.answer} 哦！`;
    } else {
      return isEn 
        ? `Taking away ${q.num2} from ${q.num1} leaves ${q.answer}.` 
        : `从 ${q.num1} 里面拿走 ${q.num2}，还剩下 ${q.answer}。`;
    }
  }
};

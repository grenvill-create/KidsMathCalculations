// Pedagogical Math Generator — Custom Range Mode
// Supports arbitrary maxNumber (e.g. 10, 20, 30, 50, 100) and operation filters.

export const mathGenerator = {
  /**
   * Generate a question based on custom settings.
   * @param {object} opts - { maxNumber: number, operations: ['add','sub'] }
   * @param {number} stage - legacy stage (still used to control manipulative display)
   */
  generateQuestion(stage, opts = {}) {
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
      // Addition: answer in [2, maxNumber], split randomly
      const minAnswer = Math.max(2, Math.floor(maxNumber * 0.1));
      answer = Math.floor(Math.random() * (maxNumber - minAnswer + 1)) + minAnswer;
      num1 = Math.floor(Math.random() * (answer - 1)) + 1; // at least 1
      num2 = answer - num1;
      symbol = '+';
    } else {
      // Subtraction: minuend in [2, maxNumber], subtract [1, minuend-1]
      const minMinuend = Math.max(2, Math.floor(maxNumber * 0.1));
      num1 = Math.floor(Math.random() * (maxNumber - minMinuend + 1)) + minMinuend;
      num2 = Math.floor(Math.random() * (num1 - 1)) + 1; // 1 to num1-1
      answer = num1 - num2;
      symbol = '-';
    }

    const spokenText = `${num1} ${symbol === '+' ? '加' : '减'} ${num2} 等于几？`;
    const problemStr = `${num1}${symbol}${num2}`;

    return {
      problemStr,
      num1,
      num2,
      symbol,
      answer,
      spokenText,
      stage,        // preserve stage for UI logic (manipulatives display)
      maxNumber,
    };
  }
};

// Pedagogical Math Generator

export const mathGenerator = {
  // Stage 1: Counting (0-10) -> Only addition, result <= 10. (In UI, it's just 'put X in basket', but data is 0+X)
  // Stage 2: Visual Math (Sum <= 10, Subtraction from <=10)
  // Stage 3: Abstract Math (Sum <= 15)
  // Stage 4: Base-10 (Sum up to 20, breaking 10)
  
  generateQuestion(stage) {
    let num1, num2, answer, symbol;
    
    // Stage 1 & 2: Sum up to 10
    if (stage <= 2) {
      const isSub = stage === 2 ? Math.random() > 0.5 : false; // Subtraction only in stage 2
      
      if (!isSub) {
        answer = Math.floor(Math.random() * 9) + 2; // 2 to 10
        num1 = Math.floor(Math.random() * answer);
        if (num1 === 0 && answer > 1) num1 = 1;
        num2 = answer - num1;
        symbol = '+';
      } else {
        num1 = Math.floor(Math.random() * 6) + 3; // 3 to 8
        num2 = Math.floor(Math.random() * num1) + 1; // 1 to num1
        if (num2 === num1) num2 = num1 - 1; 
        answer = num1 - num2;
        symbol = '-';
      }
    } 
    // Stage 3: Sum up to 15
    else if (stage === 3) {
      const isSub = Math.random() > 0.5;
      if (!isSub) {
        answer = Math.floor(Math.random() * 6) + 10; // 10 to 15
        num1 = Math.floor(Math.random() * 8) + 2; 
        num2 = answer - num1;
        symbol = '+';
      } else {
        num1 = Math.floor(Math.random() * 8) + 8; // 8 to 15
        num2 = Math.floor(Math.random() * 6) + 2;
        if (num2 >= num1) num2 = num1 - 2;
        answer = num1 - num2;
        symbol = '-';
      }
    }
    // Stage 4: Introduction to 20 (Base-10 grouping)
    else {
      const isSub = Math.random() > 0.6;
      if (!isSub) {
        answer = Math.floor(Math.random() * 6) + 15; // 15 to 20
        num1 = Math.floor(Math.random() * 9) + 6; 
        num2 = answer - num1;
        symbol = '+';
      } else {
        num1 = Math.floor(Math.random() * 5) + 15; // 15 to 19
        num2 = Math.floor(Math.random() * 8) + 4;
        answer = Math.floor(num1 - num2);
        symbol = '-';
      }
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
      stage
    };
  }
};

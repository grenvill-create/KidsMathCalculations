// Math Question Generator designed for 5-Year-Olds
// Respects strict maximum bounds set by parents.

export const mathGenerator = {
  generateQuestion(maxNumber, allowSubtraction) {
    const isSub = allowSubtraction ? Math.random() > 0.5 : false;
    
    let num1, num2, answer, symbol, spokenText;

    if (!isSub) {
      // Addition: num1 + num2 <= maxNumber
      // We want random distribution but leaning slightly towards easier numbers for toddlers if maxNumber is big
      answer = Math.floor(Math.random() * maxNumber) + 1; // 1 to maxNumber
      
      // Prevent 0 + X for absolute beginners (optional, but good for toddlers)
      num1 = Math.floor(Math.random() * answer); 
      if (answer > 1 && num1 === 0) num1 = 1; 
      
      num2 = answer - num1;
      symbol = '+';
      spokenText = `${num1} 加 ${num2} 等于几？`;
    } else {
      // Subtraction: num1 - num2 = answer (answer >= 0, num1 <= maxNumber)
      num1 = Math.floor(Math.random() * maxNumber) + 1; // 1 to maxNumber
      num2 = Math.floor(Math.random() * num1); // 0 to num1 - 1
      if (num1 > 1 && num2 === 0) num2 = 1; // Avoid X - 0 to make it meaningful
      
      answer = num1 - num2;
      symbol = '-';
      spokenText = `${num1} 减 ${num2} 等于几？`;
    }

    return {
      num1,
      num2,
      symbol,
      answer,
      spokenText
    };
  }
};

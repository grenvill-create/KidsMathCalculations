// Bilingual Translation Dictionary for KidsMathCalculations
// Supports Chinese (zh) and English (en)

export const translations = {
  zh: {
    // Header & Global
    questionNum: "第 {num} 题",
    reviewMistakes: "⭐ 错题复习",
    parent: "家长",
    home: "首页",
    cancel: "✕ 取消",
    save: "✓ 保存",
    philosophy: "理念",
    philosophyTitle: "设计初衷与理念",
    philosophyQuote: "💡 聪明的家长，不急着“刷题”，而是帮孩子“开窍”！很多时候卡住孩子的，往往不是“不会算”，而是“读不懂题”。本软件旨在通过图形与趣味教具，把时间投资在“玩和读”等肥沃的土壤上，培养理解力和数感，静待花开！🌻",
    
    // Welcome Screen
    appTitle: "奇妙数学冒险",
    startBtn: "🚀 马上开始",
    mistakesBtn: "📖 错题大作战",
    challengeBtn: "⚡ 挑战模式 (10题连答)",
    solvedStats: "🏅 已累计解题 {count} 道题",
    
    // Game Categories & Game Cards
    catNumber: "🔢 数感与数字",
    catShape: "🔷 图形与空间",
    catCognitive: "🌈 综合认知",
    
    gameCompare: "比大小",
    gameSort: "数字排序",
    gameSeqFill: "数列填空",
    gameMakeTen: "凑十法",
    gameBreakingTen: "破十减法",
    gameMultiIntro: "乘法启蒙",
    
    gameShape: "认形状",
    gamePattern: "找规律",
    gameShapeCount: "数形状",
    gameSpatial: "空间方位",
    
    gameClock: "时钟练习",
    gameColor: "认颜色",
    gameWeekday: "认星期",
    gameSeason: "认季节",
    gameShopping: "购物启蒙",
    
    // New modules (2026)
    gamePlaceValue: "数位认知",
    gameOddOneOut: "找不同",
    gameMultiStep: "连加连减",
    gameSortClassify: "分类排列",
    gameMeasurement: "长度与重量",
    gameMultiTable: "乘法口诀",
    gameFractions: "分数初步",
    gameTimeDiff: "时间差",
    
    // Guardian Gate
    guardianTitle: "家长通道",
    guardianQText: "为了验证是家长操作，请回答：",
    
    // Settings
    settingsTitle: "教案配置室",
    rangeTitle: "🎯 自定义计算范围",
    rangeDesc: "选择或自己设置数字范围（例如 1 到 10），让练习更有针对性！",
    customRange: "自定义数值范围：",
    to: "到",
    rangeLimits: "（最小值 ≥ 1，最大值 ≤ 9999）",
    
    opsTitle: "➕➖ 运算类型",
    opsDesc: "※ 至少需要选择一种运算类型",
    add: "加法",
    sub: "减法",
    
    stageTitle: "🏅 调整学习阶段（控制教具显示）",
    stage1: "阶段一：感知与计数（显示拖拽教具）",
    stage2: "阶段二：具象加减法（显示拖拽教具）",
    stage3: "阶段三：半抽象运算（按需显示教具）",
    stage4: "阶段四：纯计算（无教具，直接答题）",
    
    difficultyTitle: "🧠 难度模式 (Hybrid Difficulty)",
    diffAdaptive: "🌟 智能自适应 (推荐)",
    diffEasy: "🟢 基础难度 (Easy)",
    diffMedium: "🟡 进阶难度 (Medium)",
    diffHard: "🔴 挑战难度 (Hard)",
    
    mistakesTitle: "📖 错题本数据",
    mistakesCount: "当前记录错题数量：{count}",
    clearMistakesBtn: "清空错题本",
    
    syncTitle: "☁️ 进度跨设备同步",
    syncDesc: "通过\"同步码\"可以在 iPad 和电脑之间互传进度与设置。",
    syncExport: "本机同步码导出：",
    syncImport: "从其他设备导入：",
    syncPlaceholder: "粘贴同步码",
    syncImportBtn: "导入",
    
    dangerTitle: "⚠️ 危险区域",
    dangerDesc: "如果你想让孩子重新开始学习，可以初始化所有进度。",
    resetBtn: "重置所有进度",
    
    autoAdvanceTitle: "⚙️ 答题模式设置",
    autoAdvanceLabel: "答对后自动进入下一题",
    autoAdvanceDesc: "开启时，答对后将自动进入下一题；关闭时，答题后会显示正确顺序与解析，需要手动点击“下一题”确认。",
    
    // Main Gameplay
    helpBtn: "[?] 帮帮我",
    correctCelebration: "🌟 答对啦！真棒！",
    nextBtn: "下一题 ➔",
    
    // Challenge
    challengeComplete: "🎯 挑战完成！得分：{score} / 100",
    submitTest: "✅ 交 卷",
    goHome: "🏠 返回主页",
    analysis: "💡 解析：",
  },
  
  en: {
    // Header & Global
    questionNum: "Question {num}",
    reviewMistakes: "⭐ Review Mistakes",
    parent: "Parent",
    home: "Home",
    cancel: "✕ Cancel",
    save: "✓ Save",
    philosophy: "Ideal",
    philosophyTitle: "Design Philosophy",
    philosophyQuote: "💡 Smart parents don't rush to drill, but help kids open their minds! Often what stops a child is not arithmetic, but reading comprehension. This app focuses on visual toys to help kids 'play & read', and let thinking bloom! 🌻",
    
    // Welcome Screen
    appTitle: "KidsMath Adventure",
    startBtn: "🚀 Start Practice",
    mistakesBtn: "📖 Mistake Buster",
    challengeBtn: "⚡ Challenge Mode (10 Qs)",
    solvedStats: "🏅 Total Solved: {count} questions",
    
    // Game Categories & Game Cards
    catNumber: "🔢 Number Sense",
    catShape: "🔷 Shapes & Space",
    catCognitive: "🌈 Cognitive Math",
    
    gameCompare: "Compare",
    gameSort: "Sort Numbers",
    gameSeqFill: "Fill Sequence",
    gameMakeTen: "Make Ten",
    gameBreakingTen: "Teens Subtraction",
    gameMultiIntro: "Intro Multi",
    
    gameShape: "Shapes",
    gamePattern: "Patterns",
    gameShapeCount: "Count Shapes",
    gameSpatial: "Spatial Sense",
    
    gameClock: "Time Clock",
    gameColor: "Colors",
    gameWeekday: "Weekdays",
    gameSeason: "Seasons",
    gameShopping: "Shopping",
    
    // New modules (2026)
    gamePlaceValue: "Place Values",
    gameOddOneOut: "Odd One Out",
    gameMultiStep: "Multi-Step",
    gameSortClassify: "Sort & Order",
    gameMeasurement: "Measurement",
    gameMultiTable: "Times Tables",
    gameFractions: "Fractions",
    gameTimeDiff: "Time Difference",
    
    // Guardian Gate
    guardianTitle: "Parent Gate",
    guardianQText: "To verify you are a parent, solve:",
    
    // Settings
    settingsTitle: "Lesson Plan Settings",
    rangeTitle: "🎯 Custom Number Range",
    rangeDesc: "Select or input custom ranges to focus the math exercises.",
    customRange: "Custom Range:",
    to: "to",
    rangeLimits: "(Min ≥ 1, Max ≤ 9999)",
    
    opsTitle: "➕➖ Operation Types",
    opsDesc: "* Select at least one operation type",
    add: "Addition",
    sub: "Subtraction",
    
    stageTitle: "🏅 Adjust Learning Stage (Visual Aids)",
    stage1: "Stage 1: Counting & Visuals (with draggable beads)",
    stage2: "Stage 2: Addition/Subtraction (with draggable beads)",
    stage3: "Stage 3: Intermediate Math (click help for beads)",
    stage4: "Stage 4: Mental Math (no beads, just equations)",
    
    difficultyTitle: "🧠 Difficulty Mode",
    diffAdaptive: "🌟 Smart Adaptive (Recommended)",
    diffEasy: "🟢 Easy (Base Level)",
    diffMedium: "🟡 Medium (Intermediate)",
    diffHard: "🔴 Hard (Challenge)",
    
    mistakesTitle: "📖 Mistake Notebook",
    mistakesCount: "Active mistakes logged: {count}",
    clearMistakesBtn: "Clear Mistakes",
    
    syncTitle: "☁️ Cross-Device Progress Sync",
    syncDesc: "Use sync codes to pass progress and settings between devices.",
    syncExport: "Export sync code:",
    syncImport: "Import from other device:",
    syncPlaceholder: "Paste sync code here",
    syncImportBtn: "Import",
    
    dangerTitle: "⚠️ Danger Zone",
    dangerDesc: "Reset all progress, settings, and histories to start fresh.",
    resetBtn: "Reset All Progress",
    
    autoAdvanceTitle: "⚙️ Answer Mode Settings",
    autoAdvanceLabel: "Auto-advance to next question",
    autoAdvanceDesc: "When ON, advances automatically. When OFF, pauses to show explanations and requires clicking \"Next\".",
    
    // Main Gameplay
    helpBtn: "[?] Help Me",
    correctCelebration: "🌟 Correct! Great job!",
    nextBtn: "Next ➔",
    
    // Challenge
    challengeComplete: "🎯 Challenge Complete! Score: {score} / 100",
    submitTest: "✅ Submit Test",
    goHome: "🏠 Go Home",
    analysis: "💡 Explanation: ",
  }
};

export const t = (key, lang = 'zh') => {
  const dict = translations[lang] || translations['zh'];
  return dict[key] || key;
};

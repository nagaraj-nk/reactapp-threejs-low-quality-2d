// Fisher-Yates shuffle algorithm
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Select random questions from array
export const selectRandomQuestions = (questions, count) => {
  const shuffled = shuffleArray(questions);
  return shuffled.slice(0, count);
};

// Filter questions based on configuration
export const filterQuestions = (questions, config) => {
  let filtered = [...questions];

  // Filter by type
  if (config.type && config.type !== 'All') {
    filtered = filtered.filter((q) => q.type === config.type);
  }

  // Filter by categories
  if (config.categories && config.categories.length > 0) {
    filtered = filtered.filter((q) => config.categories.includes(q.category));
  }

  // Filter by choice type (single/multi-choice)
  if (config.choiceType && config.choiceType !== 'all') {
    if (config.choiceType === 'single') {
      // Only single-choice questions (correct_answer is string)
      filtered = filtered.filter((q) => !Array.isArray(q.correct_answer));
    } else if (config.choiceType === 'multi') {
      // Only multi-choice questions (correct_answer is array)
      filtered = filtered.filter((q) => Array.isArray(q.correct_answer));
    } else if (config.choiceType === 'mixed') {
      // Ensure we have both types
      const singleChoice = filtered.filter((q) => !Array.isArray(q.correct_answer));
      const multiChoice = filtered.filter((q) => Array.isArray(q.correct_answer));

      if (singleChoice.length > 0 && multiChoice.length > 0) {
        // Mix both types - take half from each if possible
        const halfCount = Math.floor(filtered.length / 2);
        const singleSample = selectRandomQuestions(singleChoice, Math.min(halfCount, singleChoice.length));
        const multiSample = selectRandomQuestions(multiChoice, Math.min(halfCount, multiChoice.length));
        filtered = shuffleArray([...singleSample, ...multiSample]);
      }
      // If only one type exists, keep all filtered questions
    }
  }

  // Select count
  if (config.questionCount === 'all') {
    filtered = shuffleArray(filtered);
  } else {
    const count = parseInt(config.questionCount, 10);
    filtered = selectRandomQuestions(filtered, Math.min(count, filtered.length));
  }

  return filtered;
};

// Calculate quiz results
export const calculateResults = (questions, answers) => {
  let correct = 0;
  let incorrect = 0;
  let skipped = 0;

  questions.forEach((question) => {
    const questionId = question._id.$oid;
    const userAnswer = answers[questionId];
    const correctAnswer = question.correct_answer;

    // Check if answer exists
    if (!userAnswer || (Array.isArray(userAnswer) && userAnswer.length === 0)) {
      skipped++;
      return;
    }

    // Handle multi-choice questions
    if (Array.isArray(correctAnswer)) {
      const userAnswerArray = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
      const sortedUser = [...userAnswerArray].sort().join(',');
      const sortedCorrect = [...correctAnswer].sort().join(',');

      if (sortedUser === sortedCorrect) {
        correct++;
      } else {
        incorrect++;
      }
    } else {
      // Handle single-choice questions
      if (userAnswer === correctAnswer) {
        correct++;
      } else {
        incorrect++;
      }
    }
  });

  const total = questions.length;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

  return {
    score: correct,
    total,
    percentage,
    correctAnswers: correct,
    incorrectAnswers: incorrect,
    skipped,
  };
};

// Format time in seconds to MM:SS
export const formatTime = (seconds) => {
  const absSeconds = Math.abs(seconds);
  const minutes = Math.floor(absSeconds / 60);
  const secs = absSeconds % 60;
  const sign = seconds < 0 ? '-' : '';
  return `${sign}${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

// Get unique categories from questions
export const getUniqueCategories = (questions) => {
  const categories = new Set(questions.map((q) => q.category));
  return Array.from(categories).sort();
};

// Get unique types from questions
export const getUniqueTypes = (questions) => {
  const types = new Set(questions.map((q) => q.type));
  return Array.from(types).sort();
};

// Get question ID
export const getQuestionId = (question) => {
  return question._id.$oid;
};

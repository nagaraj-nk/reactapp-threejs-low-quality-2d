import { STORAGE_KEY, MAX_HISTORY_SIZE } from '../constants/quizConstants';

// Save quiz result to localStorage
export const saveQuizResult = (quizResult) => {
  try {
    const history = getQuizHistory();
    history.unshift(quizResult); // Add to beginning

    // Keep only latest MAX_HISTORY_SIZE quizzes
    if (history.length > MAX_HISTORY_SIZE) {
      history.splice(MAX_HISTORY_SIZE);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    return true;
  } catch (error) {
    console.error('Error saving quiz result:', error);
    return false;
  }
};

// Get all quiz history from localStorage
export const getQuizHistory = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading quiz history:', error);
    return [];
  }
};

// Get specific quiz by ID
export const getQuizById = (id) => {
  try {
    const history = getQuizHistory();
    return history.find((quiz) => quiz.id === id);
  } catch (error) {
    console.error('Error getting quiz by ID:', error);
    return null;
  }
};

// Clear all quiz history
export const clearHistory = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing history:', error);
    return false;
  }
};

// Delete specific quiz by ID
export const deleteQuizById = (id) => {
  try {
    const history = getQuizHistory();
    const filtered = history.filter((quiz) => quiz.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting quiz:', error);
    return false;
  }
};

import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  selectRandomQuestions,
  filterQuestions,
  calculateResults,
  getQuestionId,
} from '../utils/quizUtils';
import { saveQuizResult } from '../utils/storageUtils';
import { DEFAULT_RANDOM_COUNT, QUIZ_MODES } from '../constants/quizConstants';

const QuizContext = createContext();

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};

export const QuizProvider = ({ children }) => {
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [lastResults, setLastResults] = useState(null);

  // Load quiz data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/data/quiz-data.json');
        if (!response.ok) {
          throw new Error('Failed to load quiz data');
        }
        const data = await response.json();
        setQuizData(data);
        setError(null);
      } catch (err) {
        console.error('Error loading quiz data:', err);
        setError('Failed to load quiz data. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Start random quiz (10 questions)
  const startRandomQuiz = () => {
    if (quizData.length === 0) {
      setError('No quiz data available');
      return;
    }

    const randomQuestions = selectRandomQuestions(quizData, DEFAULT_RANDOM_COUNT);

    const quiz = {
      id: crypto.randomUUID(),
      questions: randomQuestions,
      currentIndex: 0,
      answers: {},
      config: {
        mode: QUIZ_MODES.RANDOM,
        categories: [],
        questionCount: DEFAULT_RANDOM_COUNT,
        type: 'All',
        timeLimit: null,
      },
      startTime: Date.now(),
      endTime: null,
      isActive: true,
      isTimedOut: false,
    };

    setActiveQuiz(quiz);
    setLastResults(null);
    navigate('/quiz');
  };

  // Start advanced quiz with custom configuration
  const startAdvancedQuiz = (config) => {
    if (quizData.length === 0) {
      setError('No quiz data available');
      return { success: false, message: 'No quiz data available' };
    }

    const filteredQuestions = filterQuestions(quizData, config);

    if (filteredQuestions.length === 0) {
      return {
        success: false,
        message: 'No questions match your filters. Please adjust your selection.',
      };
    }

    // Adjust count if not enough questions
    const actualCount =
      config.questionCount === 'all'
        ? filteredQuestions.length
        : Math.min(parseInt(config.questionCount, 10), filteredQuestions.length);

    const quiz = {
      id: crypto.randomUUID(),
      questions: filteredQuestions.slice(0, actualCount),
      currentIndex: 0,
      answers: {},
      config: {
        mode: QUIZ_MODES.ADVANCED,
        ...config,
        questionCount: actualCount,
      },
      startTime: Date.now(),
      endTime: null,
      isActive: true,
      isTimedOut: false,
    };

    setActiveQuiz(quiz);
    setLastResults(null);
    navigate('/quiz');
    return { success: true, quiz };
  };

  // Answer current question
  const answerQuestion = (answer) => {
    if (!activeQuiz) return;

    const questionId = getQuestionId(activeQuiz.questions[activeQuiz.currentIndex]);

    setActiveQuiz((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: answer,
      },
    }));
  };

  // Navigate to next question
  const nextQuestion = () => {
    if (!activeQuiz) return;

    if (activeQuiz.currentIndex < activeQuiz.questions.length - 1) {
      setActiveQuiz((prev) => ({
        ...prev,
        currentIndex: prev.currentIndex + 1,
      }));
    }
  };

  // Navigate to previous question
  const previousQuestion = () => {
    if (!activeQuiz) return;

    if (activeQuiz.currentIndex > 0) {
      setActiveQuiz((prev) => ({
        ...prev,
        currentIndex: prev.currentIndex - 1,
      }));
    }
  };

  // Navigate to specific question index
  const navigateToQuestion = (index) => {
    if (!activeQuiz) return;

    if (index >= 0 && index < activeQuiz.questions.length) {
      setActiveQuiz((prev) => ({
        ...prev,
        currentIndex: index,
      }));
    }
  };

  // Submit quiz and calculate results
  const submitQuiz = () => {
    if (!activeQuiz) return;

    const endTime = Date.now();
    const timeTaken = Math.floor((endTime - activeQuiz.startTime) / 1000);

    const results = calculateResults(activeQuiz.questions, activeQuiz.answers);

    const quizResult = {
      id: activeQuiz.id,
      timestamp: activeQuiz.startTime,
      config: activeQuiz.config,
      questions: activeQuiz.questions,
      answers: activeQuiz.answers,
      results: {
        ...results,
        timeTaken,
        timedOut: activeQuiz.isTimedOut,
      },
    };

    // Save to localStorage
    saveQuizResult(quizResult);

    // Update state
    setActiveQuiz((prev) => ({
      ...prev,
      isActive: false,
      endTime,
      results,
    }));

    setLastResults(quizResult);
    navigate('/results');
  };

  // Mark quiz as timed out and submit
  const handleTimeout = () => {
    if (!activeQuiz) return;

    setActiveQuiz((prev) => ({
      ...prev,
      isTimedOut: true,
    }));

    // Auto-submit after marking as timed out
    setTimeout(() => {
      submitQuiz();
    }, 100);
  };

  // Reset/clear active quiz
  const resetQuiz = () => {
    setActiveQuiz(null);
    setLastResults(null);
  };

  // Get answer for a specific question
  const getAnswer = (questionId) => {
    if (!activeQuiz) return null;
    return activeQuiz.answers[questionId] || null;
  };

  // Get current question
  const getCurrentQuestion = () => {
    if (!activeQuiz || !activeQuiz.questions[activeQuiz.currentIndex]) {
      return null;
    }
    return activeQuiz.questions[activeQuiz.currentIndex];
  };

  // Get answered count
  const getAnsweredCount = () => {
    if (!activeQuiz) return 0;
    return Object.keys(activeQuiz.answers).length;
  };

  const value = {
    quizData,
    isLoading,
    error,
    activeQuiz,
    lastResults,
    startRandomQuiz,
    startAdvancedQuiz,
    answerQuestion,
    nextQuestion,
    previousQuestion,
    navigateToQuestion,
    submitQuiz,
    handleTimeout,
    resetQuiz,
    getAnswer,
    getCurrentQuestion,
    getAnsweredCount,
  };

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
};

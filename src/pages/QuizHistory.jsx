import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { getQuizHistory, deleteQuizById, clearHistory } from '../utils/storageUtils';
import QuizCard from '../components/QuizCard';

const QuizHistory = () => {
  const navigate = useNavigate();
  const { success, info } = useToast();
  const [history, setHistory] = useState([]);
  const [sortBy, setSortBy] = useState('date-desc');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const quizHistory = getQuizHistory();
    setHistory(quizHistory);
  };

  const handleDeleteQuiz = (id) => {
    deleteQuizById(id);
    loadHistory();
    success('Quiz deleted successfully');
  };

  const handleClearAll = () => {
    if (
      window.confirm(
        'Are you sure you want to delete all quiz history? This cannot be undone.'
      )
    ) {
      clearHistory();
      loadHistory();
      info('All quiz history cleared');
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  // Sort history
  const sortedHistory = [...history].sort((a, b) => {
    switch (sortBy) {
      case 'date-desc':
        return b.timestamp - a.timestamp;
      case 'date-asc':
        return a.timestamp - b.timestamp;
      case 'score-desc':
        return b.results.percentage - a.results.percentage;
      case 'score-asc':
        return a.results.percentage - b.results.percentage;
      default:
        return 0;
    }
  });

  // Calculate stats
  const totalQuizzes = history.length;
  const avgScore =
    totalQuizzes > 0
      ? Math.round(
          history.reduce((sum, quiz) => sum + quiz.results.percentage, 0) /
            totalQuizzes
        )
      : 0;
  const totalQuestions = history.reduce(
    (sum, quiz) => sum + quiz.results.total,
    0
  );
  const totalCorrect = history.reduce(
    (sum, quiz) => sum + quiz.results.correctAnswers,
    0
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Quiz History
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Review your past quiz attempts and track your progress
          </p>
        </div>
        <button
          onClick={handleBackToHome}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors"
        >
          Back to Home
        </button>
      </div>

      {/* Stats */}
      {totalQuizzes > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
              {totalQuizzes}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Quizzes
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
              {avgScore}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Average Score
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
              {totalQuestions}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Questions Attempted
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-1">
              {totalCorrect}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Correct Answers
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      {totalQuizzes > 0 && (
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Sort by:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="score-desc">Highest Score</option>
              <option value="score-asc">Lowest Score</option>
            </select>
          </div>

          <button
            onClick={handleClearAll}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-md transition-colors"
          >
            Clear All History
          </button>
        </div>
      )}

      {/* Quiz List */}
      {sortedHistory.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            No Quiz History
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You haven't taken any quizzes yet. Start your first quiz to track your progress!
          </p>
          <button
            onClick={handleBackToHome}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors"
          >
            Take a Quiz
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedHistory.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} onDelete={handleDeleteQuiz} />
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizHistory;

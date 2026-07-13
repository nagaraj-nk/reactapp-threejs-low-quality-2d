import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';
import { useToast } from '../context/ToastContext';
import { getUniqueCategories, getUniqueTypes } from '../utils/quizUtils';
import {
  QUESTION_COUNT_OPTIONS,
  TIME_LIMIT_OPTIONS,
  TYPE_FILTERS,
  CHOICE_TYPE_FILTERS,
} from '../constants/quizConstants';
import CategorySelector from '../components/CategorySelector';
import LoadingSpinner from '../components/LoadingSpinner';

const QuizSetup = () => {
  const navigate = useNavigate();
  const { quizData, startAdvancedQuiz, isLoading } = useQuiz();
  const { error: showError, warning } = useToast();

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [questionCount, setQuestionCount] = useState(10);
  const [selectedType, setSelectedType] = useState('All');
  const [choiceType, setChoiceType] = useState('all');
  const [timeLimit, setTimeLimit] = useState(null);

  const categories = useMemo(() => getUniqueCategories(quizData), [quizData]);
  const types = useMemo(() => getUniqueTypes(quizData), [quizData]);

  const handleStartQuiz = () => {
    // Validation
    if (selectedCategories.length === 0) {
      warning('Please select at least one category');
      return;
    }

    const config = {
      categories: selectedCategories,
      questionCount,
      type: selectedType,
      timeLimit,
    };

    const result = startAdvancedQuiz(config);

    if (!result.success) {
      showError(result.message);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading quiz data..." />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Customize Your Quiz
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Select categories, question count, difficulty, and time limit
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column - Configuration */}
        <div className="space-y-6">
          {/* Categories */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Categories
            </label>
            <CategorySelector
              categories={categories}
              selected={selectedCategories}
              onChange={setSelectedCategories}
            />
          </div>

          {/* Question Count */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Number of Questions
            </label>
            <select
              value={questionCount}
              onChange={(e) => setQuestionCount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {QUESTION_COUNT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option === 'all' ? 'All available questions' : `${option} questions`}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Question Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {TYPE_FILTERS.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
              {types
                .filter((type) => !TYPE_FILTERS.includes(type))
                .map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
            </select>
          </div>

          {/* Time Limit */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Time Limit (Optional)
            </label>
            <select
              value={timeLimit || ''}
              onChange={(e) => setTimeLimit(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {TIME_LIMIT_OPTIONS.map((option) => (
                <option key={option.label} value={option.value || ''}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Column - Preview */}
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-20">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quiz Summary
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Categories:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {selectedCategories.length || 'None selected'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Questions:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {questionCount === 'all' ? 'All' : questionCount}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Type:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {selectedType}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Time Limit:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {timeLimit ? `${timeLimit} minutes` : 'None'}
                </span>
              </div>
            </div>

            {selectedCategories.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Selected Categories:
                </p>
                <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                  {selectedCategories.map((cat) => (
                    <span
                      key={cat}
                      className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 space-y-3">
              <button
                onClick={handleStartQuiz}
                disabled={selectedCategories.length === 0}
                className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Start Quiz
              </button>
              <button
                onClick={handleCancel}
                className="w-full px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-md transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizSetup;

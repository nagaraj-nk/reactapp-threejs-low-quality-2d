import { useNavigate } from 'react-router-dom';
import { formatTime } from '../utils/quizUtils';

const QuizCard = ({ quiz, onDelete }) => {
  const navigate = useNavigate();
  const { id, timestamp, config, results } = quiz;

  const date = new Date(timestamp);
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const isPassing = results.percentage >= 70;

  const handleViewResults = () => {
    navigate(`/results/${id}`);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      onDelete(id);
    }
  };

  return (
    <div
      onClick={handleViewResults}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4"
      style={{
        borderLeftColor: isPassing ? '#10b981' : '#ef4444',
      }}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {config.mode === 'random' ? 'Random Quiz' : 'Custom Quiz'}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {formattedDate} at {formattedTime}
          </p>
        </div>

        <button
          onClick={handleDelete}
          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
          aria-label="Delete quiz"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>

      {/* Score */}
      <div className="mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`text-3xl font-bold ${
              isPassing
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {results.percentage}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {results.score} / {results.total} correct
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
          <div className="text-lg font-semibold text-green-600 dark:text-green-400">
            {results.correctAnswers}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Correct
          </div>
        </div>
        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
          <div className="text-lg font-semibold text-red-600 dark:text-red-400">
            {results.incorrectAnswers}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Incorrect
          </div>
        </div>
        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
          <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
            {formatTime(results.timeTaken)}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Time</div>
        </div>
      </div>

      {/* Categories */}
      {config.categories && config.categories.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {config.categories.slice(0, 3).map((cat) => (
            <span
              key={cat}
              className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded"
            >
              {cat}
            </span>
          ))}
          {config.categories.length > 3 && (
            <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
              +{config.categories.length - 3} more
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizCard;

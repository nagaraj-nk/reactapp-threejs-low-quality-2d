import { useNavigate } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Home = () => {
  const navigate = useNavigate();
  const { isLoading, error, startRandomQuiz, quizData } = useQuiz();

  const handleRandomQuiz = () => {
    startRandomQuiz();
  };

  const handleAdvancedQuiz = () => {
    navigate('/setup');
  };

  const handleViewHistory = () => {
    navigate('/history');
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading quiz data..." />;
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
            Error Loading Quiz Data
          </h2>
          <p className="text-red-700 dark:text-red-300">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          AWS Certification Quiz
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Practice for your AWS certification with {quizData.length} questions
        </p>
      </div>

      {/* Quiz Options */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Random Quiz Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Quick Random Test
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              10 random questions from all categories
            </p>
          </div>
          <button
            onClick={handleRandomQuiz}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors"
          >
            Start Random Quiz
          </button>
        </div>

        {/* Advanced Quiz Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border-2 border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 transition-colors">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Advanced Customized Test
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Choose categories, question count, and more
            </p>
          </div>
          <button
            onClick={handleAdvancedQuiz}
            className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md transition-colors"
          >
            Customize Quiz
          </button>
        </div>
      </div>

      {/* History Link */}
      <div className="text-center">
        <button
          onClick={handleViewHistory}
          className="text-blue-600 dark:text-blue-400 hover:underline text-lg font-medium"
        >
          View Quiz History →
        </button>
      </div>

      {/* Features */}
      <div className="mt-12 grid md:grid-cols-3 gap-6">
        <div className="text-center p-4">
          <div className="text-3xl mb-2">📊</div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            Track Progress
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Review your past quiz attempts and scores
          </p>
        </div>
        <div className="text-center p-4">
          <div className="text-3xl mb-2">⏱️</div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            Timed Quizzes
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Practice with optional time limits
          </p>
        </div>
        <div className="text-center p-4">
          <div className="text-3xl mb-2">🎯</div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            Targeted Practice
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Filter by categories and difficulty
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;

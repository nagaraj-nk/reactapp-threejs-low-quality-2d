import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';
import { getQuizById } from '../utils/storageUtils';
import { formatTime, getQuestionId } from '../utils/quizUtils';
import ReviewQuestion from '../components/ReviewQuestion';

const QuizResults = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { activeQuiz, lastResults, startRandomQuiz } = useQuiz();
  const [quiz, setQuiz] = useState(null);

  useEffect(() => {
    if (id) {
      // Viewing historical quiz
      const historicalQuiz = getQuizById(id);
      if (historicalQuiz) {
        setQuiz(historicalQuiz);
      } else {
        navigate('/history');
      }
    } else if (lastResults) {
      // Viewing just-completed quiz
      setQuiz(lastResults);
    } else if (activeQuiz && activeQuiz.results) {
      // Fallback to active quiz with results
      setQuiz({
        id: activeQuiz.id,
        timestamp: activeQuiz.startTime,
        config: activeQuiz.config,
        questions: activeQuiz.questions,
        answers: activeQuiz.answers,
        results: activeQuiz.results,
      });
    } else {
      // No quiz to display
      navigate('/');
    }
  }, [id, lastResults, activeQuiz, navigate]);

  if (!quiz) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-center text-gray-600 dark:text-gray-400">
          Loading results...
        </p>
      </div>
    );
  }

  const { results, questions, answers, config } = quiz;
  const percentage = results.percentage;
  const isPassing = percentage >= 70;

  const handleRetakeQuiz = () => {
    if (config.mode === 'random') {
      startRandomQuiz();
    } else {
      navigate('/setup');
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Score Summary Card */}
      <div
        className={`rounded-lg shadow-lg p-8 mb-8 ${
          isPassing
            ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500'
            : 'bg-red-50 dark:bg-red-900/20 border-2 border-red-500'
        }`}
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Quiz Completed!
          </h1>

          {/* Score Circle */}
          <div className="mb-6">
            <div
              className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${
                isPassing
                  ? 'bg-green-100 dark:bg-green-900'
                  : 'bg-red-100 dark:bg-red-900'
              }`}
            >
              <div className="text-center">
                <div
                  className={`text-4xl font-bold ${
                    isPassing
                      ? 'text-green-700 dark:text-green-300'
                      : 'text-red-700 dark:text-red-300'
                  }`}
                >
                  {percentage}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {results.score}/{results.total}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {results.correctAnswers}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Correct
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {results.incorrectAnswers}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Incorrect
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                {results.skipped}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Skipped
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatTime(results.timeTaken)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Time
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={handleRetakeQuiz}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors"
            >
              {config.mode === 'random' ? 'New Random Quiz' : 'New Custom Quiz'}
            </button>
            <button
              onClick={handleBackToHome}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-md transition-colors"
            >
              Back to Home
            </button>
            <button
              onClick={() => navigate('/history')}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-md transition-colors"
            >
              View History
            </button>
          </div>
        </div>
      </div>

      {/* Review Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Review Questions
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Review all questions and see the correct answers
        </p>
      </div>

      {/* Questions Review */}
      <div>
        {questions.map((question, index) => {
          const questionId = getQuestionId(question);
          const userAnswer = answers[questionId] || null;
          const correctAnswer = question.correct_answer;

          return (
            <ReviewQuestion
              key={questionId}
              question={question}
              questionNumber={index + 1}
              userAnswer={userAnswer}
              correctAnswer={correctAnswer}
            />
          );
        })}
      </div>
    </div>
  );
};

export default QuizResults;

import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';
import { useToast } from '../context/ToastContext';
import { getQuestionId } from '../utils/quizUtils';
import QuestionCard from '../components/QuestionCard';
import Timer from '../components/Timer';

const QuizTake = () => {
  const navigate = useNavigate();
  const {
    activeQuiz,
    answerQuestion,
    nextQuestion,
    previousQuestion,
    submitQuiz,
    handleTimeout,
    getAnswer,
    getCurrentQuestion,
  } = useQuiz();
  const { warning } = useToast();
  const hasCheckedRef = useRef(false);

  // Redirect if no active quiz (only check once on mount)
  useEffect(() => {
    if (!hasCheckedRef.current) {
      hasCheckedRef.current = true;
      if (!activeQuiz || !activeQuiz.isActive) {
        navigate('/');
        warning('Please start a quiz first');
      }
    }
  }, [activeQuiz, navigate, warning]);

  if (!activeQuiz || !activeQuiz.isActive) {
    return null;
  }

  const currentQuestion = getCurrentQuestion();
  const currentIndex = activeQuiz.currentIndex;
  const totalQuestions = activeQuiz.questions.length;
  const isFirstQuestion = currentIndex === 0;
  const isLastQuestion = currentIndex === totalQuestions - 1;

  const handleAnswerSelect = (answer) => {
    answerQuestion(answer);
  };

  const handleNext = () => {
    nextQuestion();
  };

  const handlePrevious = () => {
    previousQuestion();
  };

  const handleSubmit = () => {
    // Count answered questions (including multi-choice with at least one selection)
    let answeredCount = 0;
    activeQuiz.questions.forEach((q) => {
      const qId = getQuestionId(q);
      const answer = activeQuiz.answers[qId];
      if (answer && (!Array.isArray(answer) || answer.length > 0)) {
        answeredCount++;
      }
    });

    if (answeredCount < totalQuestions) {
      const unanswered = totalQuestions - answeredCount;
      if (
        !window.confirm(
          `You have ${unanswered} unanswered question${
            unanswered > 1 ? 's' : ''
          }. Are you sure you want to submit?`
        )
      ) {
        return;
      }
    }
    submitQuiz();
  };

  if (!currentQuestion) {
    return <div className="max-w-4xl mx-auto px-4 py-8">Loading question...</div>;
  }

  const questionId = getQuestionId(currentQuestion);
  const selectedAnswer = getAnswer(questionId);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header with Timer */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {activeQuiz.config.mode === 'random' ? 'Random Quiz' : 'Custom Quiz'}
          </h1>
          {activeQuiz.config.timeLimit && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Time:
              </span>
              <Timer
                timeLimit={activeQuiz.config.timeLimit}
                startTime={activeQuiz.startTime}
                onTimeout={handleTimeout}
              />
            </div>
          )}
        </div>
      </div>

      {/* Question Card */}
      <QuestionCard
        question={currentQuestion}
        selectedAnswer={selectedAnswer}
        onAnswerSelect={handleAnswerSelect}
      />

      {/* Navigation Buttons */}
      <div className="mt-6 flex justify-between items-center gap-4">
        <button
          onClick={handlePrevious}
          disabled={isFirstQuestion}
          className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ← Previous
        </button>

        <div className="flex gap-4">
          {isLastQuestion ? (
            <button
              onClick={handleSubmit}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md transition-colors"
            >
              Submit Quiz
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors"
            >
              Next →
            </button>
          )}
        </div>
      </div>

      {/* Question Navigator */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Question Navigator
        </h3>
        <div className="grid grid-cols-10 gap-2">
          {activeQuiz.questions.map((q, index) => {
            const qId = getQuestionId(q);
            const answer = getAnswer(qId);
            // Check if answered (for multi-choice, array must have at least one element)
            const isAnswered = answer && (!Array.isArray(answer) || answer.length > 0);
            const isCurrent = index === currentIndex;

            return (
              <button
                key={qId}
                onClick={() => {
                  const diff = index - currentIndex;
                  if (diff > 0) {
                    for (let i = 0; i < diff; i++) nextQuestion();
                  } else if (diff < 0) {
                    for (let i = 0; i < Math.abs(diff); i++) previousQuestion();
                  }
                }}
                className={`h-10 rounded font-semibold text-sm transition-colors ${
                  isCurrent
                    ? 'bg-blue-600 text-white'
                    : isAnswered
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                } hover:opacity-80`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuizTake;

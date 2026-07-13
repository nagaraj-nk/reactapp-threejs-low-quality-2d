const ReviewQuestion = ({
  question,
  questionNumber,
  userAnswer,
  correctAnswer,
}) => {
  // Handle multi-choice questions
  const isMultiChoice = Array.isArray(correctAnswer);

  const isCorrect = isMultiChoice
    ? JSON.stringify([...(Array.isArray(userAnswer) ? userAnswer : [])].sort()) ===
      JSON.stringify([...correctAnswer].sort())
    : userAnswer === correctAnswer;

  const isSkipped = !userAnswer || (Array.isArray(userAnswer) && userAnswer.length === 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-4">
      {/* Question Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
              Question {questionNumber}
            </span>
            {isSkipped ? (
              <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                Skipped
              </span>
            ) : isCorrect ? (
              <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                ✓ Correct
              </span>
            ) : (
              <span className="px-2 py-1 text-xs font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
                ✗ Incorrect
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
              {question.category}
            </span>
            <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded">
              {question.type}
            </span>
            {isMultiChoice && (
              <span className="px-2 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded">
                Multi-Choice
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Question Text */}
      <div className="mb-4">
        <p className="text-base font-medium text-gray-900 dark:text-white whitespace-pre-wrap">
          {question.question}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-2">
        {question.options.map((option) => {
          const userAnswerArray = isMultiChoice
            ? (Array.isArray(userAnswer) ? userAnswer : [])
            : userAnswer;

          const correctAnswerArray = isMultiChoice ? correctAnswer : [correctAnswer];

          const isUserAnswer = isMultiChoice
            ? userAnswerArray.includes(option.label)
            : userAnswer === option.label;

          const isCorrectOption = correctAnswerArray.includes(option.label);

          let bgClass = 'bg-gray-50 dark:bg-gray-700/50';
          let borderClass = 'border-gray-200 dark:border-gray-600';
          let textClass = 'text-gray-700 dark:text-gray-300';

          // Correct answer - show green
          if (isCorrectOption) {
            bgClass = 'bg-green-50 dark:bg-green-900/30';
            borderClass = 'border-green-500 dark:border-green-600';
            textClass = 'text-green-900 dark:text-green-100';
          }

          // User selected but wrong - show red
          if (isUserAnswer && !isCorrectOption) {
            bgClass = 'bg-red-50 dark:bg-red-900/30';
            borderClass = 'border-red-500 dark:border-red-600';
            textClass = 'text-red-900 dark:text-red-100';
          }

          return (
            <div
              key={option.label}
              className={`p-3 rounded-lg border-2 ${bgClass} ${borderClass}`}
            >
              <div className="flex items-start gap-3">
                <span className={`font-semibold ${textClass}`}>
                  {option.label}.
                </span>
                <span className={textClass}>{option.text}</span>
                <div className="ml-auto flex gap-2">
                  {isCorrectOption && (
                    <span className="text-green-600 dark:text-green-400 font-semibold whitespace-nowrap">
                      ✓ Correct
                    </span>
                  )}
                  {isUserAnswer && !isCorrectOption && (
                    <span className="text-red-600 dark:text-red-400 font-semibold whitespace-nowrap">
                      ✗ Your choice
                    </span>
                  )}
                  {!isUserAnswer && isCorrectOption && isMultiChoice && (
                    <span className="text-amber-600 dark:text-amber-400 font-semibold whitespace-nowrap">
                      Missed
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReviewQuestion;

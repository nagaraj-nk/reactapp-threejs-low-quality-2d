const QuestionCard = ({ question, selectedAnswer, onAnswerSelect }) => {
  if (!question) return null;

  // Check if this is a multi-choice question
  const isMultiChoice = Array.isArray(question.correct_answer);
  const selectedAnswers = isMultiChoice
    ? (Array.isArray(selectedAnswer) ? selectedAnswer : [])
    : selectedAnswer;

  const handleOptionClick = (optionLabel) => {
    if (isMultiChoice) {
      // Toggle selection for multi-choice
      const currentSelected = Array.isArray(selectedAnswers) ? selectedAnswers : [];
      if (currentSelected.includes(optionLabel)) {
        onAnswerSelect(currentSelected.filter(label => label !== optionLabel));
      } else {
        onAnswerSelect([...currentSelected, optionLabel]);
      }
    } else {
      // Single choice
      onAnswerSelect(optionLabel);
    }
  };

  const isSelected = (optionLabel) => {
    if (isMultiChoice) {
      return Array.isArray(selectedAnswers) && selectedAnswers.includes(optionLabel);
    }
    return selectedAnswers === optionLabel;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      {/* Question metadata */}
      <div className="flex flex-wrap gap-2 mb-4">
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

      {/* Question text */}
      <div className="mb-6">
        <p className="text-lg font-medium text-gray-900 dark:text-white whitespace-pre-wrap">
          {question.question}
        </p>
        {isMultiChoice && (
          <p className="mt-2 text-sm text-purple-600 dark:text-purple-400 font-medium">
            Select all that apply
          </p>
        )}
      </div>

      {/* Options */}
      <div className="space-y-3">
        {question.options.map((option) => {
          const selected = isSelected(option.label);

          return (
            <button
              key={option.label}
              onClick={() => handleOptionClick(option.label)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                selected
                  ? 'border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600'
              }`}
            >
              <div className="flex items-start gap-3">
                {isMultiChoice ? (
                  // Checkbox for multi-choice
                  <div
                    className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center ${
                      selected
                        ? 'border-blue-600 dark:border-blue-500 bg-blue-600 dark:bg-blue-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {selected && (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                ) : (
                  // Radio button for single choice
                  <div
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selected
                        ? 'border-blue-600 dark:border-blue-500 bg-blue-600 dark:bg-blue-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {selected && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                )}
                <div className="flex-1">
                  <span className="font-semibold text-gray-900 dark:text-white mr-2">
                    {option.label}.
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {option.text}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionCard;

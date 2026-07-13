const ProgressBar = ({ current, total, answered }) => {
  const percentage = total > 0 ? (current / total) * 100 : 0;
  const allAnswered = answered === total;

  return (
    <div className="mb-6">
      {/* Progress info */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Question {current + 1} of {total}
        </span>
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {answered} answered
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full transition-all duration-300 ${
            allAnswered
              ? 'bg-green-600 dark:bg-green-500'
              : 'bg-blue-600 dark:bg-blue-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;

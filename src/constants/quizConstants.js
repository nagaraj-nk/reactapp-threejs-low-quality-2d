export const QUESTION_COUNT_OPTIONS = [10, 20, 30, 50, 'all'];

export const DEFAULT_RANDOM_COUNT = 10;

export const TIME_LIMIT_OPTIONS = [
  { label: 'No time limit', value: null },
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '45 minutes', value: 45 },
  { label: '60 minutes', value: 60 },
  { label: '90 minutes', value: 90 },
];

export const TYPE_FILTERS = ['All', 'Developer Associate', 'Solutions Architect Associate'];

export const CHOICE_TYPE_FILTERS = [
  { label: 'All Questions', value: 'all' },
  { label: 'Single Choice Only', value: 'single' },
  { label: 'Multi-Choice Only', value: 'multi' },
  { label: 'Mixed (Both Types)', value: 'mixed' },
];

export const QUIZ_MODES = {
  RANDOM: 'random',
  ADVANCED: 'advanced',
};

export const TIMER_WARNING_THRESHOLD = 300; // 5 minutes in seconds
export const TIMER_CRITICAL_THRESHOLD = 60; // 1 minute in seconds

export const MAX_HISTORY_SIZE = 50;

export const STORAGE_KEY = 'quiz-history';

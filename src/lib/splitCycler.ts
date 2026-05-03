import { Goal, TrainingSplit, TrainingDay, Exercise, SplitType } from '@/types';

function ex(id: string, name: string, muscleGroup: string, equipment: string, notes?: string): Exercise {
  return { id, name, muscleGroup, equipment, notes };
}

const FULL_BODY_DAYS: TrainingDay[] = [
  {
    dayIndex: 1, // Monday
    label: 'Full Body A',
    exercises: [
      ex('fb-squat', 'Barbell Squat', 'Quads / Glutes', 'Barbell', '4x8'),
      ex('fb-bench', 'Bench Press', 'Chest / Triceps', 'Barbell', '4x8'),
      ex('fb-row', 'Barbell Row', 'Back / Biceps', 'Barbell', '4x8'),
      ex('fb-ohp', 'Overhead Press', 'Shoulders', 'Barbell', '3x10'),
      ex('fb-rdl', 'Romanian Deadlift', 'Hamstrings', 'Barbell', '3x10'),
    ],
  },
  {
    dayIndex: 3, // Wednesday
    label: 'Full Body B',
    exercises: [
      ex('fb-dead', 'Deadlift', 'Back / Hamstrings', 'Barbell', '3x5'),
      ex('fb-inc', 'Incline Dumbbell Press', 'Upper Chest', 'Dumbbell', '4x10'),
      ex('fb-pull', 'Pull-ups', 'Back / Biceps', 'Bodyweight', '4x6'),
      ex('fb-lunge', 'Walking Lunge', 'Quads / Glutes', 'Dumbbell', '3x12 each'),
      ex('fb-curl', 'Dumbbell Curl', 'Biceps', 'Dumbbell', '3x12'),
    ],
  },
  {
    dayIndex: 5, // Friday
    label: 'Full Body C',
    exercises: [
      ex('fb-fsquat', 'Front Squat', 'Quads', 'Barbell', '4x8'),
      ex('fb-dips', 'Dips', 'Chest / Triceps', 'Bodyweight', '4x10'),
      ex('fb-cable', 'Cable Row', 'Back', 'Cable', '4x12'),
      ex('fb-lpress', 'Leg Press', 'Quads / Glutes', 'Machine', '3x15'),
      ex('fb-face', 'Face Pull', 'Rear Delts', 'Cable', '3x15'),
    ],
  },
];

const UPPER_LOWER_DAYS: TrainingDay[] = [
  {
    dayIndex: 1, // Monday
    label: 'Upper A',
    exercises: [
      ex('ul-bench', 'Bench Press', 'Chest', 'Barbell', '4x6'),
      ex('ul-row', 'Barbell Row', 'Back', 'Barbell', '4x6'),
      ex('ul-ohp', 'Overhead Press', 'Shoulders', 'Barbell', '3x8'),
      ex('ul-pull', 'Pull-ups', 'Back', 'Bodyweight', '3x8'),
      ex('ul-tri', 'Tricep Dips', 'Triceps', 'Bodyweight', '3x12'),
    ],
  },
  {
    dayIndex: 2, // Tuesday
    label: 'Lower A',
    exercises: [
      ex('ul-squat', 'Barbell Squat', 'Quads', 'Barbell', '4x6'),
      ex('ul-rdl', 'Romanian Deadlift', 'Hamstrings', 'Barbell', '4x8'),
      ex('ul-press', 'Leg Press', 'Quads', 'Machine', '3x12'),
      ex('ul-curl', 'Leg Curl', 'Hamstrings', 'Machine', '3x12'),
      ex('ul-calf', 'Calf Raise', 'Calves', 'Machine', '4x15'),
    ],
  },
  {
    dayIndex: 4, // Thursday
    label: 'Upper B',
    exercises: [
      ex('ul-inc', 'Incline Bench', 'Upper Chest', 'Barbell', '4x8'),
      ex('ul-cable', 'Cable Row', 'Back', 'Cable', '4x10'),
      ex('ul-db-ohp', 'Dumbbell OHP', 'Shoulders', 'Dumbbell', '3x10'),
      ex('ul-lat', 'Lat Pulldown', 'Back', 'Cable', '3x12'),
      ex('ul-bi', 'Barbell Curl', 'Biceps', 'Barbell', '3x12'),
    ],
  },
  {
    dayIndex: 5, // Friday
    label: 'Lower B',
    exercises: [
      ex('ul-dead', 'Deadlift', 'Back / Hamstrings', 'Barbell', '4x5'),
      ex('ul-front', 'Front Squat', 'Quads', 'Barbell', '3x8'),
      ex('ul-step', 'Step-up', 'Glutes', 'Dumbbell', '3x12 each'),
      ex('ul-ham', 'Nordic Curl', 'Hamstrings', 'Bodyweight', '3x8'),
      ex('ul-glute', 'Hip Thrust', 'Glutes', 'Barbell', '4x12'),
    ],
  },
];

const PPL_DAYS: TrainingDay[] = [
  {
    dayIndex: 1, // Monday - Push A
    label: 'Push A',
    exercises: [
      ex('ppl-bench', 'Bench Press', 'Chest', 'Barbell', '4x6'),
      ex('ppl-ohp', 'Overhead Press', 'Shoulders', 'Barbell', '3x8'),
      ex('ppl-incdb', 'Incline DB Press', 'Upper Chest', 'Dumbbell', '3x10'),
      ex('ppl-latt', 'Lateral Raise', 'Side Delts', 'Dumbbell', '4x15'),
      ex('ppl-tri', 'Tricep Pushdown', 'Triceps', 'Cable', '4x12'),
    ],
  },
  {
    dayIndex: 2, // Tuesday - Pull A
    label: 'Pull A',
    exercises: [
      ex('ppl-dead', 'Deadlift', 'Back', 'Barbell', '4x5'),
      ex('ppl-pull', 'Pull-ups', 'Back', 'Bodyweight', '4x8'),
      ex('ppl-row', 'Cable Row', 'Back', 'Cable', '3x12'),
      ex('ppl-face', 'Face Pull', 'Rear Delts', 'Cable', '3x15'),
      ex('ppl-curl', 'Barbell Curl', 'Biceps', 'Barbell', '4x12'),
    ],
  },
  {
    dayIndex: 3, // Wednesday - Legs A
    label: 'Legs A',
    exercises: [
      ex('ppl-squat', 'Barbell Squat', 'Quads', 'Barbell', '5x5'),
      ex('ppl-rdl', 'Romanian Deadlift', 'Hamstrings', 'Barbell', '4x8'),
      ex('ppl-lp', 'Leg Press', 'Quads', 'Machine', '4x12'),
      ex('ppl-lc', 'Leg Curl', 'Hamstrings', 'Machine', '3x12'),
      ex('ppl-cr', 'Calf Raise', 'Calves', 'Machine', '5x15'),
    ],
  },
  {
    dayIndex: 4, // Thursday - Push B
    label: 'Push B',
    exercises: [
      ex('ppl-incbar', 'Incline Bench Press', 'Upper Chest', 'Barbell', '4x8'),
      ex('ppl-dbohp', 'Dumbbell OHP', 'Shoulders', 'Dumbbell', '4x10'),
      ex('ppl-pec', 'Pec Deck Fly', 'Chest', 'Machine', '3x15'),
      ex('ppl-front', 'Front Raise', 'Front Delts', 'Dumbbell', '3x12'),
      ex('ppl-skull', 'Skull Crusher', 'Triceps', 'Barbell', '3x12'),
    ],
  },
  {
    dayIndex: 5, // Friday - Pull B
    label: 'Pull B',
    exercises: [
      ex('ppl-lat', 'Lat Pulldown', 'Back', 'Cable', '4x10'),
      ex('ppl-trow', 'T-Bar Row', 'Back', 'Barbell', '4x8'),
      ex('ppl-shr', 'Dumbbell Shrug', 'Traps', 'Dumbbell', '4x15'),
      ex('ppl-rearfly', 'Rear Delt Fly', 'Rear Delts', 'Dumbbell', '4x15'),
      ex('ppl-hamcurl', 'Hammer Curl', 'Biceps', 'Dumbbell', '4x12'),
    ],
  },
  {
    dayIndex: 6, // Saturday - Legs B
    label: 'Legs B',
    exercises: [
      ex('ppl-front2', 'Front Squat', 'Quads', 'Barbell', '4x6'),
      ex('ppl-ht', 'Hip Thrust', 'Glutes', 'Barbell', '4x12'),
      ex('ppl-step', 'Step-up', 'Glutes', 'Dumbbell', '3x12 each'),
      ex('ppl-nordic', 'Nordic Curl', 'Hamstrings', 'Bodyweight', '3x8'),
      ex('ppl-sc', 'Seated Calf Raise', 'Calves', 'Machine', '5x20'),
    ],
  },
];

function buildSplit(id: string, userId: string, type: SplitType, days: TrainingDay[]): TrainingSplit {
  return { id, userId, type, days };
}

export function getDefaultSplit(goal: Goal, userId: string = ''): TrainingSplit {
  if (goal === 'lose_fat') {
    return buildSplit('default-fullbody', userId, 'FullBody', FULL_BODY_DAYS);
  } else if (goal === 'maintain') {
    return buildSplit('default-upperlower', userId, 'UpperLower', UPPER_LOWER_DAYS);
  } else {
    return buildSplit('default-ppl', userId, 'PPL', PPL_DAYS);
  }
}

export function getTodaySession(split: TrainingSplit): TrainingDay | null {
  const dayOfWeek = new Date().getDay(); // 0=Sun, 1=Mon, ...
  return split.days.find((d) => d.dayIndex === dayOfWeek) ?? null;
}

import { useMemo } from 'react';
import { useTrainingStore } from '@/store/useTrainingStore';
import { getTodaySession } from '@/lib/splitCycler';

export function useTrainingSplit() {
  const split = useTrainingStore((s) => s.split);

  const todaySession = useMemo(() => {
    if (!split) return null;
    return getTodaySession(split);
  }, [split]);

  const isRestDay = todaySession === null;

  return { todaySession, split, isRestDay };
}

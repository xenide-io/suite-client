'use client';

import { useEffect, useState } from 'react';

const NIGHT_START_HOUR = 18;
const NIGHT_END_HOUR = 6;

export function useIsNight(): boolean {
  const [isNight, setIsNight] = useState(false);

  useEffect(() => {
    const check = () => {
      const hour = new Date().getHours();
      return hour >= NIGHT_START_HOUR || hour < NIGHT_END_HOUR;
    };
    setIsNight(check());

    let timeout: ReturnType<typeof setTimeout>;
    const update = () => {
      const next = check();
      setIsNight((current) => (current !== next ? next : current));
      timeout = setTimeout(update, 60_000);
    };
    timeout = setTimeout(update, 60_000);
    return () => clearTimeout(timeout);
  }, []);

  return isNight;
}

import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay || 200); // Reduced from 500ms to 200ms

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
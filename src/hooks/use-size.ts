
import { useCallback, useState, useEffect } from 'react';

export function useSize(): [(element: HTMLElement | null) => void, { width: number; height: number } | null] {
  const [ref, setRef] = useState<HTMLElement | null>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  const handleSize = useCallback(() => {
    setSize({
      width: ref?.offsetWidth || 0,
      height: ref?.offsetHeight || 0,
    });
  }, [ref?.offsetHeight, ref?.offsetWidth]);

  useEffect(() => {
    if (!ref) return;

    handleSize();

    const observer = new ResizeObserver(handleSize);
    observer.observe(ref);

    return () => {
      observer.disconnect();
    };
  }, [ref, handleSize]);

  return [setRef, size];
}

import { useRef } from 'react';

import { isSimpleArrayEqual } from '@react-devui/utils';

import { useEvent } from './useEvent';
import { useForceUpdate } from './useForceUpdate';

function matchBreakpoints<P>(breakpoints: Map<P, number>) {
  const match: P[] = [];
  for (const [breakpoint, num] of Array.from(breakpoints).sort((a, b) => a[1] - b[1])) {
    if (window.matchMedia(`(min-width: ${num}px)`).matches) {
      match.push(breakpoint);
    }
  }
  return match;
}

export function useBreakpoints<P>(breakpoints: Map<P, number>) {
  const match = useRef<P[]>([]);
  if (typeof window !== 'undefined') {
    match.current = matchBreakpoints(breakpoints);
  }

  const forceUpdate = useForceUpdate();

  useEvent(window, 'resize', () => {
    const currentMediaMatch = matchBreakpoints(breakpoints);
    if (!isSimpleArrayEqual(currentMediaMatch, match.current)) {
      forceUpdate();
    }
  });

  return match.current;
}

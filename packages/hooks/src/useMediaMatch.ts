import { useRef } from 'react';

import { isSimpleArrayEqual } from '@react-devui/utils';

import { useEvent } from './useEvent';
import { useForceUpdate } from './useForceUpdate';

function getMediaMatch<P>(breakpoints: Map<P, number>) {
  const mediaMatch: P[] = [];
  for (const [breakpoint, num] of Array.from(breakpoints).sort((a, b) => a[1] - b[1])) {
    if (window.matchMedia(`(min-width: ${num}px)`).matches) {
      mediaMatch.push(breakpoint);
    }
  }
  return mediaMatch;
}

export function useMediaMatch<P>(breakpoints: Map<P, number>) {
  const mediaMatch = useRef<P[]>([]);
  if (typeof window !== 'undefined') {
    mediaMatch.current = getMediaMatch(breakpoints);
  }

  const forceUpdate = useForceUpdate();

  useEvent(window, 'resize', () => {
    const currentMediaMatch = getMediaMatch(breakpoints);
    if (!isSimpleArrayEqual(currentMediaMatch, mediaMatch.current)) {
      forceUpdate();
    }
  });

  return mediaMatch.current;
}

import type { DBreakpoints } from './Row';

import { isEqual } from 'lodash';
import { useEffect, useState } from 'react';

import { useAsync, useEventCallback, useGridConfig, useIsomorphicLayoutEffect } from '../../hooks';

export const MEDIA_QUERY_LIST = Object.freeze(['xxl', 'xl', 'lg', 'md', 'sm', 'xs'] as DBreakpoints[]);

function getMediaMatch(mqlList?: Map<DBreakpoints, MediaQueryList>) {
  const mediaMatch: DBreakpoints[] = [];
  if (mqlList) {
    for (const [breakpoint, mql] of mqlList) {
      if (mql.matches) {
        mediaMatch.push(breakpoint);
      }
    }
  }
  return mediaMatch;
}

export function useMediaMatch(onMediaChange?: (match: DBreakpoints[]) => void) {
  const { breakpoints } = useGridConfig();

  const asyncCapture = useAsync();

  const [mqlList, setMqlList] = useState<Map<DBreakpoints, MediaQueryList>>();
  const [mediaMatch, setMediaMatch] = useState<DBreakpoints[]>([]);
  useIsomorphicLayoutEffect(() => {
    const mqlList = new Map<DBreakpoints, MediaQueryList>(
      MEDIA_QUERY_LIST.map((breakpoint) => [breakpoint, window.matchMedia(`(min-width: ${breakpoints.get(breakpoint)}px)`)])
    );
    setMqlList(mqlList);
    setMediaMatch(getMediaMatch(mqlList));
  }, [breakpoints]);

  const handleResize = useEventCallback(() => {
    const _mediaMatch = getMediaMatch(mqlList);

    if (!isEqual(_mediaMatch, mediaMatch)) {
      onMediaChange?.(_mediaMatch);
      setMediaMatch(_mediaMatch);
    }
  });
  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();

    asyncGroup.fromEvent(window, 'resize').subscribe({
      next: () => {
        handleResize();
      },
    });

    return () => {
      asyncCapture.deleteGroup(asyncId);
    };
  }, [asyncCapture, handleResize]);

  return mediaMatch;
}

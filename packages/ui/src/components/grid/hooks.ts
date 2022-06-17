import type { DBreakpoints } from './Row';

import { freeze } from 'immer';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAsync, useGridConfig, useMount } from '../../hooks';

export const MEDIA_QUERY_LIST = freeze(['xxl', 'xl', 'lg', 'md', 'sm', 'xs'] as DBreakpoints[]);

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

export function useMediaMatch() {
  const { breakpoints } = useGridConfig();

  const asyncCapture = useAsync();

  const mqlList = useMemo<Map<DBreakpoints, MediaQueryList> | undefined>(() => {
    if (typeof window !== 'undefined') {
      return new Map<DBreakpoints, MediaQueryList>(
        MEDIA_QUERY_LIST.map((breakpoint) => [breakpoint, window.matchMedia(`(min-width: ${breakpoints.get(breakpoint)}px)`)])
      );
    }
  }, [breakpoints]);

  const [mediaMatch, setMediaMatch] = useState(() => {
    if (typeof window !== 'undefined') {
      return getMediaMatch(mqlList);
    }
    return [];
  });

  const updateMediaMatch = useCallback(() => {
    const _mediaMatch = getMediaMatch(mqlList);

    setMediaMatch((draft) => {
      if (draft.length !== _mediaMatch.length) {
        return _mediaMatch;
      } else {
        for (const breakpoint of draft) {
          if (!_mediaMatch.includes(breakpoint)) {
            return _mediaMatch;
          }
        }
        return draft;
      }
    });
  }, [mqlList]);

  useMount(() => {
    updateMediaMatch();
  });

  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();

    asyncGroup.fromEvent(window, 'resize').subscribe({
      next: () => {
        updateMediaMatch();
      },
    });

    return () => {
      asyncCapture.deleteGroup(asyncId);
    };
  }, [asyncCapture, updateMediaMatch]);

  return mediaMatch;
}

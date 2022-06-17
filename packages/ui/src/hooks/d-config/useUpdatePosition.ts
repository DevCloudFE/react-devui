import type { DElementSelector } from '../ui/useElement';

import { isNull, isString } from 'lodash';
import { useContext, useEffect } from 'react';

import { useAsync } from '../side-effect';
import { DConfigContext } from './contex';

function getEl(selector: DElementSelector) {
  return selector instanceof HTMLElement || isNull(selector)
    ? selector
    : isString(selector)
    ? (document.querySelector(selector) as HTMLElement | null)
    : selector();
}

export function useUpdatePosition(fn: () => void, listen = true) {
  const { scroll, resize } = useContext(DConfigContext)?.updatePosition ?? {};

  const asyncCapture = useAsync();

  useEffect(() => {
    if (listen) {
      const [asyncGroup, asyncId] = asyncCapture.createGroup();

      for (const selector of scroll ?? []) {
        const el = getEl(selector);
        if (el) {
          asyncGroup.fromEvent(el, 'scroll', { passive: true }).subscribe({
            next: () => {
              fn();
            },
          });
        }
      }

      return () => {
        asyncCapture.deleteGroup(asyncId);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asyncCapture, listen, scroll]);

  useEffect(() => {
    if (listen) {
      const [asyncGroup, asyncId] = asyncCapture.createGroup();

      for (const selector of resize ?? []) {
        const el = getEl(selector);
        if (el) {
          asyncGroup.onResize(el, () => {
            fn();
          });
        }
      }

      return () => {
        asyncCapture.deleteGroup(asyncId);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asyncCapture, listen, resize]);
}

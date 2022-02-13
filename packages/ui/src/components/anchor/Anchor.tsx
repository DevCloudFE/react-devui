import type { DElementSelector } from '../../hooks/element';

import { isUndefined } from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';

import {
  usePrefixConfig,
  useComponentConfig,
  useElement,
  useImmer,
  useAsync,
  useRefCallback,
  useContentSVChangeConfig,
  useForceUpdate,
  useCallbackWithState,
} from '../../hooks';
import { getClassName, generateComponentMate, scrollTo } from '../../utils';

export interface DAnchorContextData {
  gUpdateLinks: (href: string, el: HTMLLIElement) => void;
  gRemoveLinks: (href: string) => void;
  gActiveHref: string | null;
  gOnLinkClick: (href: string) => void;
}
export const DAnchorContext = React.createContext<DAnchorContextData | null>(null);

export interface DAnchorProps extends React.HTMLAttributes<HTMLUListElement> {
  dDistance?: number;
  dPage?: DElementSelector;
  dScrollBehavior?: 'instant' | 'smooth';
  dIndicator?: React.ReactNode | symbol;
  onHrefChange?: (href: string | null) => void;
}

const DOT_INDICATOR = Symbol('dot');
const LINE_INDICATOR = Symbol('line');

const { COMPONENT_NAME } = generateComponentMate('DAnchor');
export const DAnchor = (props: DAnchorProps) => {
  const {
    dDistance = 0,
    dPage,
    dScrollBehavior = 'instant',
    dIndicator = DOT_INDICATOR,
    onHrefChange,
    className,
    children,
    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const onContentSVChange$ = useContentSVChangeConfig();
  //#endregion

  //#region Ref
  const [anchorEl, anchorRef] = useRefCallback<HTMLUListElement>();
  //#endregion

  const dataRef = useRef<{
    clearTid?: () => void;
  }>({});

  const asyncCapture = useAsync();
  const forceUpdate = useForceUpdate();

  const [links, setLinks] = useImmer(new Map<string, HTMLLIElement>());

  const pageEl = useElement(dPage ?? null);

  const { activeHref, dotStyle } = useCallbackWithState<{
    activeHref: string | null;
    dotStyle: React.CSSProperties;
  }>(
    (draft) => {
      let pageTop = 0;
      if (!isUndefined(dPage)) {
        if (pageEl) {
          pageTop = pageEl.getBoundingClientRect().top;
        } else {
          return;
        }
      }

      let nearestEl: [string, number] | null = null;
      for (const [href] of links) {
        const el = document.getElementById(href.slice(1));
        if (el) {
          const top = el.getBoundingClientRect().top;
          // Add 1 because `getBoundingClientRect` return decimal
          if (top - pageTop <= dDistance + 1) {
            if (nearestEl === null) {
              nearestEl = [href, top];
            } else if (top > nearestEl[1]) {
              nearestEl = [href, top];
            }
          }
        }
      }

      const newHref = nearestEl ? nearestEl[0] : null;
      if (newHref !== draft.activeHref) {
        draft.activeHref = newHref;
        onHrefChange?.(newHref);
      }
      draft.dotStyle = (() => {
        draft.dotStyle.opacity = nearestEl ? 1 : 0;
        if (newHref) {
          for (const [href, el] of links) {
            if (href === newHref) {
              const rect = el.getBoundingClientRect();
              if (anchorEl) {
                draft.dotStyle.top = rect.top + rect.height / 2 - anchorEl.getBoundingClientRect().top;
              }
              break;
            }
          }
        }

        return draft.dotStyle;
      })();
    },
    {
      activeHref: null,
      dotStyle: {},
    }
  )();

  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();
    const ob = onContentSVChange$?.subscribe({
      next: () => {
        forceUpdate();
      },
    });
    asyncGroup.onGlobalScroll(forceUpdate);
    return () => {
      ob?.unsubscribe();
      asyncCapture.deleteGroup(asyncId);
    };
  }, [asyncCapture, forceUpdate, onContentSVChange$]);

  const gUpdateLinks = useCallback(
    (href, el) => {
      setLinks((draft) => {
        draft.set(href, el);
      });
    },
    [setLinks]
  );
  const gRemoveLinks = useCallback(
    (href) => {
      setLinks((draft) => {
        draft.delete(href);
      });
    },
    [setLinks]
  );
  const gOnLinkClick = useCallback(
    (href: string) => {
      let pageTop = 0;
      let targetEl: HTMLElement = document.documentElement;
      if (!isUndefined(dPage)) {
        if (pageEl) {
          pageTop = pageEl.getBoundingClientRect().top;
          targetEl = pageEl;
        } else {
          return;
        }
      }

      const scrollTop = targetEl.scrollTop;
      window.location.hash = href;
      targetEl.scrollTop = scrollTop;

      const el = document.getElementById(href.slice(1));
      if (el) {
        const top = el.getBoundingClientRect().top;
        const scrollTop = top - pageTop + targetEl.scrollTop - dDistance;
        dataRef.current.clearTid?.();
        dataRef.current.clearTid = scrollTo(targetEl, {
          top: scrollTop,
          behavior: dScrollBehavior,
        });
      }
    },
    [dPage, pageEl, dDistance, dScrollBehavior]
  );
  const contextValue = useMemo<DAnchorContextData>(
    () => ({
      gUpdateLinks,
      gRemoveLinks,
      gActiveHref: activeHref,
      gOnLinkClick,
    }),
    [activeHref, gOnLinkClick, gRemoveLinks, gUpdateLinks]
  );

  return (
    <DAnchorContext.Provider value={contextValue}>
      <ul {...restProps} ref={anchorRef} className={getClassName(className, `${dPrefix}anchor`)}>
        <div className={`${dPrefix}anchor__indicator`}>
          {dIndicator === DOT_INDICATOR ? (
            <span className={`${dPrefix}anchor__dot-indicator`} style={dotStyle}></span>
          ) : dIndicator === LINE_INDICATOR ? (
            <span className={`${dPrefix}anchor__line-indicator`} style={dotStyle}></span>
          ) : (
            dIndicator
          )}
        </div>
        {children}
      </ul>
    </DAnchorContext.Provider>
  );
};
DAnchor.DOT_INDICATOR = DOT_INDICATOR;
DAnchor.LINE_INDICATOR = LINE_INDICATOR;

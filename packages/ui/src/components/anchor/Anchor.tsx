import type { DElementSelector } from '../../hooks/element';

import { isUndefined } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useDPrefixConfig, useDComponentConfig, useCustomRef, useElement, useImmer } from '../../hooks';
import { getClassName, globalScrollCapture, CustomScroll } from '../../utils';

export interface DAnchorContextData {
  anchorActiveHref: string | null;
  onLinkClick: (href: string) => void;
  onLinkChange: (href: string, el?: HTMLElement) => void;
}
export const DAnchorContext = React.createContext<DAnchorContextData | null>(null);

export interface DAnchorProps extends React.HTMLAttributes<HTMLUListElement> {
  dDistance?: number;
  dPage?: DElementSelector;
  dScrollBehavior?: 'instant' | 'smooth';
  dIndicator?: React.ReactNode;
  onHrefChange?: (href: string | null) => void;
}

export function DAnchor(props: DAnchorProps) {
  const {
    dDistance = 0,
    dPage,
    dScrollBehavior = 'instant',
    dIndicator = 'dot',
    onHrefChange,
    className,
    children,
    ...restProps
  } = useDComponentConfig('anchor', props);

  //#region Context
  const dPrefix = useDPrefixConfig();
  //#endregion

  //#region Ref
  const [anchorEl, anchorRef] = useCustomRef<HTMLUListElement>();
  //#endregion

  const [currentData] = useState({
    links: new Map<string, HTMLElement>(),
  });

  const [customScroll] = useImmer(new CustomScroll());
  const [dotStyle, setDotStyle] = useImmer<React.CSSProperties>({});
  const [activeHref, setActiveHref] = useImmer<string | null>(null);

  const pageEl = useElement(dPage ?? null);

  const updateAnchor = useCallback(() => {
    if (anchorEl) {
      let pageTop = 0;
      if (!isUndefined(dPage)) {
        if (pageEl.current) {
          pageTop = pageEl.current.getBoundingClientRect().top;
        } else {
          return;
        }
      }

      let nearestEl: [string, number] | null = null;
      for (const [href] of currentData.links.entries()) {
        if (href) {
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
      }

      const activeHref = nearestEl ? nearestEl[0] : null;
      setDotStyle((draft) => {
        draft.opacity = nearestEl ? 1 : 0;
        if (activeHref) {
          const rect = currentData.links.get(activeHref)?.getBoundingClientRect();
          if (rect) {
            draft.top = rect.top + rect.height / 2 - anchorEl.getBoundingClientRect().top;
          }
        }

        return draft;
      });

      setActiveHref(activeHref);
    }
  }, [dDistance, dPage, currentData, pageEl, anchorEl, setActiveHref, setDotStyle]);

  const onLinkClick = useCallback(
    (href: string) => {
      let pageTop = 0;
      let _pageEl: HTMLElement = document.documentElement;
      if (!isUndefined(dPage)) {
        if (pageEl.current) {
          pageTop = pageEl.current.getBoundingClientRect().top;
          _pageEl = pageEl.current;
        } else {
          return;
        }
      }

      const scrollTop = _pageEl.scrollTop;
      window.location.hash = href;
      _pageEl.scrollTop = scrollTop;

      const el = document.getElementById(href.slice(1));
      if (el) {
        const top = el.getBoundingClientRect().top;
        const scrollTop = top - pageTop + _pageEl.scrollTop - dDistance;
        customScroll.scrollTo(_pageEl, {
          top: scrollTop,
          behavior: dScrollBehavior,
        });
      }
    },
    [dPage, dScrollBehavior, dDistance, customScroll, pageEl]
  );

  //#region DidUpdate
  useEffect(() => {
    onHrefChange?.(activeHref);
  }, [onHrefChange, activeHref]);

  useEffect(() => {
    updateAnchor();
  }, [updateAnchor]);

  useEffect(() => {
    const tid = globalScrollCapture.addTask(() => updateAnchor());
    return () => {
      globalScrollCapture.deleteTask(tid);
    };
  }, [updateAnchor]);
  //#endregion

  const contextValue = useMemo<DAnchorContextData>(
    () => ({
      anchorActiveHref: activeHref,
      onLinkClick,
      onLinkChange: (href, el) => {
        if (isUndefined(el)) {
          currentData.links.delete(href);
        } else {
          currentData.links.set(href, el);
        }
      },
    }),
    [activeHref, currentData, onLinkClick]
  );

  return (
    <DAnchorContext.Provider value={contextValue}>
      <ul {...restProps} ref={anchorRef} className={getClassName(className, `${dPrefix}anchor`)}>
        <div className={`${dPrefix}anchor__indicator`}>
          {dIndicator === 'dot' ? (
            <span className={`${dPrefix}anchor__dot-indicator`} style={dotStyle}></span>
          ) : dIndicator === 'line' ? (
            <span className={`${dPrefix}anchor__line-indicator`} style={dotStyle}></span>
          ) : (
            dIndicator
          )}
        </div>
        {children}
      </ul>
    </DAnchorContext.Provider>
  );
}

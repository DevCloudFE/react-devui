import type { DElementSelector } from '../../hooks/element-ref';

import { isUndefined } from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';

import { useDPrefixConfig, useDComponentConfig, useRefSelector, useImmer, useAsync, useRefCallback, useDContentConfig } from '../../hooks';
import { getClassName, CustomScroll } from '../../utils';

export interface DAnchorContextData {
  anchorActiveHref: string | null;
  onLinkClick: (href: string) => void;
  onLinkChange: (href: string, el?: HTMLElement | null) => void;
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
  } = useDComponentConfig(DAnchor.name, props);

  //#region Context
  const dPrefix = useDPrefixConfig();
  const rootContentRef = useDContentConfig();
  //#endregion

  //#region Ref
  const [anchorEl, anchorRef] = useRefCallback<HTMLUListElement>();
  //#endregion

  const dataRef = useRef({
    links: new Map<string, HTMLElement | null>(),
  });

  const asyncCapture = useAsync();
  const [customScroll] = useImmer(new CustomScroll());
  const [dotStyle, setDotStyle] = useImmer<React.CSSProperties>({});
  const [activeHref, setActiveHref] = useImmer<string | null>(null);

  const pageRef = useRefSelector(dPage ?? null);

  const updateAnchor = useCallback(() => {
    let pageTop = 0;
    if (!isUndefined(dPage)) {
      if (pageRef.current) {
        pageTop = pageRef.current.getBoundingClientRect().top;
      } else {
        return;
      }
    }

    let nearestEl: [string, number] | null = null;
    for (const [href] of dataRef.current.links.entries()) {
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
    setActiveHref(activeHref);
    setDotStyle((draft) => {
      draft.opacity = nearestEl ? 1 : 0;
      if (activeHref) {
        const rect = dataRef.current.links.get(activeHref)?.getBoundingClientRect();
        if (rect && anchorEl) {
          draft.top = rect.top + rect.height / 2 - anchorEl.getBoundingClientRect().top;
        }
      }

      return draft;
    });
  }, [anchorEl, dDistance, dPage, pageRef, setActiveHref, setDotStyle]);

  const onLinkClick = useCallback(
    (href: string) => {
      let pageTop = 0;
      let pageEl: HTMLElement = document.documentElement;
      if (!isUndefined(dPage)) {
        if (pageRef.current) {
          pageTop = pageRef.current.getBoundingClientRect().top;
          pageEl = pageRef.current;
        } else {
          return;
        }
      }

      const scrollTop = pageEl.scrollTop;
      window.location.hash = href;
      pageEl.scrollTop = scrollTop;

      const el = document.getElementById(href.slice(1));
      if (el) {
        const top = el.getBoundingClientRect().top;
        const scrollTop = top - pageTop + pageEl.scrollTop - dDistance;
        customScroll.scrollTo(pageEl, {
          top: scrollTop,
          behavior: dScrollBehavior,
        });
      }
    },
    [dPage, dScrollBehavior, dDistance, customScroll, pageRef]
  );

  //#region DidUpdate
  useEffect(() => {
    onHrefChange?.(activeHref);
  }, [onHrefChange, activeHref]);

  useEffect(() => {
    updateAnchor();
  }, [updateAnchor]);

  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();
    if (rootContentRef.current) {
      asyncGroup.onResize(rootContentRef.current, updateAnchor);
    }
    asyncGroup.onGlobalScroll(updateAnchor);
    return () => {
      asyncCapture.deleteGroup(asyncId);
    };
  }, [asyncCapture, rootContentRef, updateAnchor]);
  //#endregion

  const contextValue = useMemo<DAnchorContextData>(
    () => ({
      anchorActiveHref: activeHref,
      onLinkClick,
      onLinkChange: (href, el) => {
        if (isUndefined(el)) {
          dataRef.current.links.delete(href);
        } else {
          dataRef.current.links.set(href, el);
        }
      },
    }),
    [activeHref, onLinkClick]
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

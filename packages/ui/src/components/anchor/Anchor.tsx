import type { DElementSelector } from '../../hooks/element-ref';
import type { Draft } from 'immer';

import { isUndefined } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import {
  usePrefixConfig,
  useComponentConfig,
  useRefSelector,
  useImmer,
  useAsync,
  useRefCallback,
  useRootContentConfig,
  useValueChange,
} from '../../hooks';
import { getClassName, CustomScroll } from '../../utils';

export interface DAnchorContextData {
  updateLinks: (identity: string, href: string | undefined, el: HTMLLIElement | null) => void;
  removeLinks: (identity: string) => void;
  anchorActiveHref: string | null;
  onLinkClick: (href: string) => void;
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
  } = useComponentConfig(DAnchor.name, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const rootContentRef = useRootContentConfig();
  //#endregion

  //#region Ref
  const [anchorEl, anchorRef] = useRefCallback<HTMLUListElement>();
  //#endregion

  const asyncCapture = useAsync();
  const [customScroll] = useState(() => new CustomScroll());
  const [dotStyle, setDotStyle] = useImmer<React.CSSProperties>({});
  const [links, setLinks] = useImmer(new Map<string, { href: string; el: HTMLLIElement }>());
  const [activeHref, setActiveHref] = useState<string | null>(null);

  const pageRef = useRefSelector(dPage ?? null);

  useValueChange(activeHref, onHrefChange);

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
    for (const { href } of links.values()) {
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

    const newHref = nearestEl ? nearestEl[0] : null;
    setActiveHref(newHref);
    setDotStyle((draft) => {
      draft.opacity = nearestEl ? 1 : 0;
      if (newHref) {
        for (const { href, el } of links.values()) {
          if (href === newHref) {
            const rect = el.getBoundingClientRect();
            if (anchorEl) {
              draft.top = rect.top + rect.height / 2 - anchorEl.getBoundingClientRect().top;
            }
            break;
          }
        }
      }

      return draft;
    });
  }, [anchorEl, dDistance, dPage, links, pageRef, setDotStyle]);

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

  const stateBackflow = useMemo<Pick<DAnchorContextData, 'updateLinks' | 'removeLinks'>>(
    () => ({
      updateLinks: (identity, href, el) => {
        if (href && el) {
          setLinks((draft) => {
            draft.set(identity, { href, el: el as Draft<HTMLLIElement> });
          });
        }
      },
      removeLinks: (identity) => {
        setLinks((draft) => {
          draft.delete(identity);
        });
      },
    }),
    [setLinks]
  );
  const contextValue = useMemo<DAnchorContextData>(
    () => ({
      ...stateBackflow,
      anchorActiveHref: activeHref,
      onLinkClick,
    }),
    [activeHref, onLinkClick, stateBackflow]
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

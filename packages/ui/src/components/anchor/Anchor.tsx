import type { DElementSelector } from '../../hooks/element-ref';

import { isUndefined } from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  usePrefixConfig,
  useComponentConfig,
  useRefSelector,
  useImmer,
  useAsync,
  useRefCallback,
  useContentSVChangeConfig,
} from '../../hooks';
import { getClassName, CustomScroll, generateComponentMate } from '../../utils';

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
  const contentSVChange = useContentSVChangeConfig();
  //#endregion

  //#region Ref
  const [anchorEl, anchorRef] = useRefCallback<HTMLUListElement>();
  //#endregion

  const dataRef = useRef<{
    top?: { href: string; num: number };
  }>({});

  const asyncCapture = useAsync();
  const [customScroll] = useState(() => new CustomScroll());
  const [dotStyle, setDotStyle] = useImmer<React.CSSProperties>({});
  const [links, setLinks] = useImmer(new Map<string, { href: string; el: HTMLLIElement }>());

  const [activeHref, setActiveHref] = useState<string | null>(null);
  const changeActiveHref = useCallback(
    (value) => {
      if (value !== activeHref) {
        setActiveHref(value);
        onHrefChange?.(value);
      }
    },
    [activeHref, onHrefChange]
  );

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
    for (const { href } of links.values()) {
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
    changeActiveHref(newHref);
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
  }, [anchorEl, changeActiveHref, dDistance, dPage, links, pageRef, setDotStyle]);

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

  useEffect(() => {
    updateAnchor();
  }, [updateAnchor]);

  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();
    const ob = contentSVChange?.subscribe({
      next: () => {
        updateAnchor();
      },
    });
    const skipUpdate = () => {
      const data = Array.from(links.values())[0];
      if (data) {
        const el = document.getElementById(data.href.slice(1));
        if (el) {
          const top = el.getBoundingClientRect().top;

          const skip = dataRef.current.top?.href === data.href && dataRef.current.top?.num === top;
          dataRef.current.top = { href: data.href, num: top };
          return skip;
        }
      }

      return false;
    };
    asyncGroup.onGlobalScroll(updateAnchor, skipUpdate);
    return () => {
      ob?.unsubscribe();
      asyncCapture.deleteGroup(asyncId);
    };
  }, [asyncCapture, links, contentSVChange, updateAnchor]);

  const stateBackflow = useMemo<Pick<DAnchorContextData, 'updateLinks' | 'removeLinks'>>(
    () => ({
      updateLinks: (identity, href, el) => {
        if (href && el) {
          setLinks((draft) => {
            draft.set(identity, { href, el });
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

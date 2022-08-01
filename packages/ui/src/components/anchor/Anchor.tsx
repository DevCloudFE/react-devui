import type { DElementSelector } from '../../hooks/ui/useElement';
import type { DNestedChildren } from '../../utils/global';

import { isArray, isUndefined } from 'lodash';
import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';

import {
  usePrefixConfig,
  useComponentConfig,
  useElement,
  useAsync,
  useIsomorphicLayoutEffect,
  useEventCallback,
  useLayout,
} from '../../hooks';
import { getClassName, registerComponentMate, scrollTo } from '../../utils';

export interface DAnchorOption {
  title: React.ReactNode;
  href: string;
  target?: string;
}

export interface DAnchorRef {
  activeHref: string | null;
  updateAnchor: () => void;
}

export interface DAnchorProps<T extends DAnchorOption> extends Omit<React.HTMLAttributes<HTMLUListElement>, 'children'> {
  dLinks: DNestedChildren<T>[];
  dPage?: DElementSelector;
  dDistance?: number;
  dScrollBehavior?: 'instant' | 'smooth';
  dIndicator?: React.ReactNode | typeof DOT_INDICATOR | typeof LINE_INDICATOR;
  onLinkClick?: (href: string, link: DNestedChildren<T>) => void;
}

const DOT_INDICATOR = Symbol();
const LINE_INDICATOR = Symbol();

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DAnchor' });
function Anchor<T extends DAnchorOption>(props: DAnchorProps<T>, ref: React.ForwardedRef<DAnchorRef>): JSX.Element | null {
  const {
    dLinks,
    dPage,
    dDistance = 0,
    dScrollBehavior = 'instant',
    dIndicator = DOT_INDICATOR,
    onLinkClick,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { dScrollEl, dResizeEl } = useLayout();
  //#endregion

  //#region Ref
  const anchorRef = useRef<HTMLUListElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  //#endregion

  const dataRef = useRef<{
    clearTid?: () => void;
  }>({});

  const asyncCapture = useAsync();

  const pageEl = useElement(dPage ?? dScrollEl);
  const resizeEl = useElement(dResizeEl);

  const [activeHref, setActiveHref] = useState<string | null>(null);

  const updateAnchor = useEventCallback(() => {
    if (!pageEl) {
      return;
    }

    const pageTop = pageEl.getBoundingClientRect().top;
    let nearestEl: [string, number] | undefined;
    const reduceLinks = (arr: DNestedChildren<T>[]) => {
      arr.forEach(({ href, children }) => {
        const el = document.querySelector(href);
        if (el) {
          const top = el.getBoundingClientRect().top;
          // Add 1 because `getBoundingClientRect` return decimal
          if (top - pageTop <= dDistance + 1) {
            if (isUndefined(nearestEl)) {
              nearestEl = [href, top];
            } else if (top > nearestEl[1]) {
              nearestEl = [href, top];
            }
          }
        }
        if (isArray(children)) {
          reduceLinks(children);
        }
      });
    };
    reduceLinks(dLinks);

    const newHref = nearestEl ? nearestEl[0] : null;
    setActiveHref(newHref);
  });
  useIsomorphicLayoutEffect(() => {
    updateAnchor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (pageEl) {
      const [asyncGroup, asyncId] = asyncCapture.createGroup();

      asyncGroup.fromEvent(pageEl, 'scroll', { passive: true }).subscribe({
        next: () => {
          updateAnchor();
        },
      });

      return () => {
        asyncCapture.deleteGroup(asyncId);
      };
    }
  }, [asyncCapture, pageEl, updateAnchor]);

  useEffect(() => {
    if (resizeEl) {
      const [asyncGroup, asyncId] = asyncCapture.createGroup();

      asyncGroup.onResize(resizeEl, () => {
        updateAnchor();
      });

      return () => {
        asyncCapture.deleteGroup(asyncId);
      };
    }
  }, [asyncCapture, resizeEl, updateAnchor]);

  useEffect(() => {
    if (anchorRef.current && indicatorRef.current) {
      if (activeHref) {
        const el = anchorRef.current.querySelector(`.${dPrefix}anchor__link.is-active`);
        if (el) {
          const rect = el.getBoundingClientRect();
          const top = rect.top - anchorRef.current.getBoundingClientRect().top + rect.height / 2;
          indicatorRef.current.style.cssText = `opacity:1;top:${top}px;`;
        }
      } else {
        indicatorRef.current.style.cssText += 'opacity:0;';
      }
    }
  });

  useImperativeHandle(
    ref,
    () => ({
      activeHref,
      updateAnchor,
    }),
    [activeHref, updateAnchor]
  );

  const handleLinkClick = (href: string) => {
    if (!pageEl) {
      return;
    }

    const pageTop = pageEl.getBoundingClientRect().top;

    const scrollTop = pageEl.scrollTop;
    window.location.hash = href;
    pageEl.scrollTop = scrollTop;

    const el = document.querySelector(href);
    if (el) {
      const top = el.getBoundingClientRect().top;
      const scrollTop = top - pageTop + pageEl.scrollTop - dDistance;
      dataRef.current.clearTid?.();
      dataRef.current.clearTid = scrollTo(pageEl, {
        top: scrollTop,
        behavior: dScrollBehavior,
      });
    }
  };

  const linkNodes = (() => {
    const getNodes = (arr: DNestedChildren<T>[], level = 0): JSX.Element[] =>
      arr.map((link) => {
        const { title: linkTitle, href: linkHref, target: linkTarget, children } = link;
        return (
          <React.Fragment key={`${linkHref}-${level}`}>
            <li>
              <a
                className={getClassName(`${dPrefix}anchor__link`, {
                  'is-active': linkHref === activeHref,
                })}
                style={{ paddingLeft: 16 + level * 16 }}
                href={linkHref}
                target={linkTarget}
                onClick={(e) => {
                  e.preventDefault();

                  onLinkClick?.(linkHref, link);
                  handleLinkClick(linkHref);
                }}
              >
                {linkTitle}
              </a>
            </li>
            {children && getNodes(children, level + 1)}
          </React.Fragment>
        );
      });

    return getNodes(dLinks);
  })();

  return (
    <ul {...restProps} ref={anchorRef} className={getClassName(restProps.className, `${dPrefix}anchor`)}>
      <div className={`${dPrefix}anchor__indicator-track`}>
        <div ref={indicatorRef} className={`${dPrefix}anchor__indicator-wrapper`}>
          {dIndicator === DOT_INDICATOR ? (
            <div className={`${dPrefix}anchor__dot-indicator`}></div>
          ) : dIndicator === LINE_INDICATOR ? (
            <div className={`${dPrefix}anchor__line-indicator`}></div>
          ) : (
            dIndicator
          )}
        </div>
      </div>
      {linkNodes}
    </ul>
  );
}

export const DAnchor: {
  <T extends DAnchorOption>(props: DAnchorProps<T> & { ref?: React.ForwardedRef<DAnchorRef> }): ReturnType<typeof Anchor>;
  DOT_INDICATOR: typeof DOT_INDICATOR;
  LINE_INDICATOR: typeof LINE_INDICATOR;
} = React.forwardRef(Anchor) as any;

DAnchor.DOT_INDICATOR = DOT_INDICATOR;
DAnchor.LINE_INDICATOR = LINE_INDICATOR;

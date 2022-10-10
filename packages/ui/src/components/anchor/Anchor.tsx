import type { DRefExtra } from '@react-devui/hooks/useRefExtra';

import { isArray, isString, isUndefined } from 'lodash';
import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';

import { useEvent, useEventCallback, useIsomorphicLayoutEffect, useRefExtra, useResize } from '@react-devui/hooks';
import { getClassName, getOffsetToRoot, scrollTo, toPx } from '@react-devui/utils';

import { registerComponentMate } from '../../utils';
import { useComponentConfig, useGlobalScroll, useLayout, usePrefixConfig } from '../root';

export interface DAnchorItem {
  href: string;
  title?: React.ReactNode;
  target?: string;
  children?: DAnchorItem[];
}

export interface DAnchorRef {
  activeHref: string | null;
  updateAnchor: () => void;
}

export interface DAnchorProps<T extends DAnchorItem> extends Omit<React.HTMLAttributes<HTMLUListElement>, 'children'> {
  dList: T[];
  dPage?: DRefExtra;
  dDistance?: number | string;
  dScrollBehavior?: 'instant' | 'smooth';
  dIndicator?: React.ReactNode | typeof DOT_INDICATOR | typeof LINE_INDICATOR;
  onItemClick?: (href: string, item: T) => void;
}

const DOT_INDICATOR = Symbol();
const LINE_INDICATOR = Symbol();

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DAnchor' as const });
function Anchor<T extends DAnchorItem>(props: DAnchorProps<T>, ref: React.ForwardedRef<DAnchorRef>): JSX.Element | null {
  const {
    dList,
    dPage,
    dDistance = 0,
    dScrollBehavior = 'instant',
    dIndicator = DOT_INDICATOR,
    onItemClick,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { dPageScrollRef, dContentResizeRef } = useLayout();
  //#endregion

  //#region Ref
  const anchorRef = useRef<HTMLUListElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const pageRef = useRefExtra(dPage ?? (() => dPageScrollRef.current));
  //#endregion

  const dataRef = useRef<{
    clearTid?: () => void;
  }>({});

  const [activeHref, setActiveHref] = useState<string | null>(null);

  const updateAnchor = useEventCallback(() => {
    if (pageRef.current) {
      const pageTop = getOffsetToRoot(pageRef.current);
      let nearestEl: [string, number] | undefined;
      const reduceLinks = (arr: T[]) => {
        arr.forEach(({ href, children }) => {
          const el = document.getElementById(href);
          if (el && pageRef.current) {
            const top = getOffsetToRoot(el);
            const distance = isString(dDistance) ? toPx(dDistance, true) : dDistance;
            if (pageRef.current.scrollTop + distance >= top - pageTop) {
              if (isUndefined(nearestEl)) {
                nearestEl = [href, top];
              } else if (top > nearestEl[1]) {
                nearestEl = [href, top];
              }
            }
          }
          if (isArray(children)) {
            reduceLinks(children as T[]);
          }
        });
      };
      reduceLinks(dList);

      const newHref = nearestEl ? nearestEl[0] : null;
      setActiveHref(newHref);
    }
  });
  useIsomorphicLayoutEffect(() => {
    updateAnchor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const globalScroll = useGlobalScroll(updateAnchor);
  useEvent(pageRef, 'scroll', updateAnchor, { passive: true }, globalScroll);

  useResize(dContentResizeRef, updateAnchor);

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
    if (pageRef.current) {
      const pageTop = getOffsetToRoot(pageRef.current);

      const scrollTop = pageRef.current.scrollTop;
      window.location.hash = `#${href}`;
      pageRef.current.scrollTop = scrollTop;

      const el = document.getElementById(href);
      if (el) {
        const top = getOffsetToRoot(el);
        const distance = isString(dDistance) ? toPx(dDistance, true) : dDistance;
        dataRef.current.clearTid?.();
        dataRef.current.clearTid = scrollTo(pageRef.current, {
          top: top - pageTop - distance,
          behavior: dScrollBehavior,
        });
      }
    }
  };
  const linkNodes = (() => {
    const getNodes = (arr: T[], level = 0): JSX.Element[] =>
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
                href={`#${linkHref}`}
                target={linkTarget}
                onClick={(e) => {
                  e.preventDefault();

                  onItemClick?.(linkHref, link);
                  handleLinkClick(linkHref);
                }}
              >
                {linkTitle ?? linkHref}
              </a>
            </li>
            {children && getNodes(children as T[], level + 1)}
          </React.Fragment>
        );
      });

    return getNodes(dList);
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
  <T extends DAnchorItem>(props: DAnchorProps<T> & React.RefAttributes<DAnchorRef>): ReturnType<typeof Anchor>;
  DOT_INDICATOR: typeof DOT_INDICATOR;
  LINE_INDICATOR: typeof LINE_INDICATOR;
} = React.forwardRef(Anchor) as any;

DAnchor.DOT_INDICATOR = DOT_INDICATOR;
DAnchor.LINE_INDICATOR = LINE_INDICATOR;

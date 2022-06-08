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
  useImmer,
} from '../../hooks';
import { getClassName, registerComponentMate, scrollTo } from '../../utils';
import { DLink } from './Link';

export interface DAnchorOption {
  title: React.ReactNode;
  href: string;
  target?: string;
}

export interface DAnchorRef {
  activeHref: string | null;
  updateAnchor: () => void;
}

export interface DAnchorProps<T = DAnchorOption> extends Omit<React.HTMLAttributes<HTMLUListElement>, 'children'> {
  dLinks: DNestedChildren<T>[];
  dPage?: DElementSelector;
  dDistance?: number;
  dScrollBehavior?: 'instant' | 'smooth';
  dIndicator?: React.ReactNode | typeof DOT_INDICATOR | typeof LINE_INDICATOR;
  onLinkClick?: (href: string, link: DNestedChildren<T>) => void;
}

const DOT_INDICATOR = Symbol('dot');
const LINE_INDICATOR = Symbol('line');

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DAnchor' });
function Anchor<T extends DAnchorOption>(props: DAnchorProps<T>, ref: React.ForwardedRef<DAnchorRef>) {
  const {
    dLinks,
    dPage,
    dDistance = 0,
    dScrollBehavior = 'instant',
    dIndicator = DOT_INDICATOR,
    onLinkClick,

    className,
    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const anchorRef = useRef<HTMLUListElement>(null);
  //#endregion

  const dataRef = useRef<{
    clearTid?: () => void;
  }>({});

  const asyncCapture = useAsync();

  const pageEl = useElement(dPage ?? null);

  const [activeHref, setActiveHref] = useState<string | null>(null);
  const [indicatorStyle, setIndicatorStyle] = useImmer<React.CSSProperties>({ opacity: 0 });

  const updateAnchor = useEventCallback(() => {
    let pageTop = 0;
    if (!isUndefined(dPage)) {
      if (pageEl) {
        pageTop = pageEl.getBoundingClientRect().top;
      } else {
        return;
      }
    }

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
    setIndicatorStyle((draft) => {
      draft.opacity = nearestEl ? 1 : 0;
      if (newHref && anchorRef.current) {
        const el = anchorRef.current.querySelector(`.${dPrefix}anchor-link[href="${newHref}"]`);
        if (el) {
          const rect = el.getBoundingClientRect();
          draft.top = rect.top - anchorRef.current.getBoundingClientRect().top + rect.height / 2;
        }
      }
    });
  });
  useIsomorphicLayoutEffect(() => {
    updateAnchor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();

    asyncGroup.onGlobalScroll(updateAnchor);

    return () => {
      asyncCapture.deleteGroup(asyncId);
    };
  }, [asyncCapture, updateAnchor]);

  useImperativeHandle(
    ref,
    () => ({
      activeHref,
      updateAnchor,
    }),
    [activeHref, updateAnchor]
  );

  const handleLinkClick = (href: string) => {
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

    const el = document.querySelector(href);
    if (el) {
      const top = el.getBoundingClientRect().top;
      const scrollTop = top - pageTop + targetEl.scrollTop - dDistance;
      dataRef.current.clearTid?.();
      dataRef.current.clearTid = scrollTo(targetEl, {
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
            <DLink
              dHref={linkHref}
              dActive={linkHref === activeHref}
              dTarget={linkTarget}
              dLevel={level}
              onClick={() => {
                onLinkClick?.(linkHref, link);

                handleLinkClick(linkHref);
              }}
            >
              {linkTitle}
            </DLink>
            {children && getNodes(children, level + 1)}
          </React.Fragment>
        );
      });

    return getNodes(dLinks);
  })();

  return (
    <ul {...restProps} ref={anchorRef} className={getClassName(className, `${dPrefix}anchor`)}>
      <div className={`${dPrefix}anchor__indicator-track`}>
        <div className={`${dPrefix}anchor__indicator-wrapper`} style={indicatorStyle}>
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
  DOT_INDICATOR?: typeof DOT_INDICATOR;
  LINE_INDICATOR?: typeof LINE_INDICATOR;
} = React.forwardRef(Anchor) as any;

DAnchor.DOT_INDICATOR = DOT_INDICATOR;
DAnchor.LINE_INDICATOR = LINE_INDICATOR;

import type { DColBaseProps, DColProps, DSpanValue } from './Col';

import { isArray, isEqual, isNumber, isObject, isString, isUndefined } from 'lodash';
import React, { useCallback, useEffect, useMemo } from 'react';

import { usePrefixConfig, useComponentConfig, useImmer, useAsync } from '../../hooks';
import { getClassName, getFragmentChildren, mergeStyle } from '../../utils';

export type DBreakpoints = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
export type DGutterValue = number | string | [number | string, number | string];

export interface DRowProps extends React.HTMLAttributes<HTMLDivElement> {
  dColNum?: number;
  dBreakpoints?: Map<DBreakpoints, number>;
  dGutter?: DGutterValue;
  dResponsiveGutter?: Record<DBreakpoints, DGutterValue>;
  dAsListener?: boolean;
  dRender?: (match: DBreakpoints | null, matchs: DBreakpoints[]) => React.ReactNode;
  onMediaChange?: (match: DBreakpoints | null, matchs: DBreakpoints[]) => void;
}

const DEFAULT_PROPS = {
  dBreakpoints: new Map<DBreakpoints, number>([
    ['xs', 0],
    ['sm', 576],
    ['md', 768],
    ['lg', 992],
    ['xl', 1200],
    ['xxl', 1400],
  ]),
};
const MEDIA_QUERY_LIST = Array.from(DEFAULT_PROPS.dBreakpoints.keys());
export function DRow(props: DRowProps) {
  const {
    dColNum = 12,
    dBreakpoints = DEFAULT_PROPS.dBreakpoints,
    dGutter = 0,
    dResponsiveGutter,
    dAsListener = false,
    dRender,
    onMediaChange,
    className,
    style,
    children,
    ...restProps
  } = useComponentConfig(DRow.name, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const asyncCapture = useAsync();

  const mqlList = useMemo(
    () =>
      new Map<DBreakpoints, MediaQueryList>(
        Array.from(MEDIA_QUERY_LIST).map((breakpoint) => [breakpoint, window.matchMedia(`(min-width: ${dBreakpoints.get(breakpoint)}px)`)])
      ),
    [dBreakpoints]
  );

  const [mediaMatch, setMediaMatch] = useImmer(() => {
    const _mediaMatch: DBreakpoints[] = [];
    for (const [breakpoint, mql] of mqlList) {
      if (mql.matches) {
        _mediaMatch.push(breakpoint);
      }
    }
    return _mediaMatch;
  });

  const getMaxBreakpoint = useCallback(
    (arr?: string[]) => {
      let maxBreakpoint: DBreakpoints | null = null;
      for (const breakpoint of MEDIA_QUERY_LIST) {
        if (mediaMatch.includes(breakpoint)) {
          if (isUndefined(arr)) {
            maxBreakpoint = breakpoint;
          } else if (arr.includes(breakpoint)) {
            maxBreakpoint = breakpoint;
          }
        }
      }
      return maxBreakpoint;
    },
    [mediaMatch]
  );

  const maxBreakpoint = getMaxBreakpoint();

  const gap = useMemo(() => {
    const transformNum = (val: string | number) => {
      return isString(val) ? val : val + 'px';
    };
    const getGap = (gutter: DGutterValue): [string, string] => {
      if (isArray(gutter)) {
        return [transformNum(gutter[0]), transformNum(gutter[1])];
      }
      return [transformNum(gutter), transformNum(gutter)];
    };

    let _gap = getGap(dGutter);

    if (dResponsiveGutter) {
      const breakpoint = getMaxBreakpoint(Object.keys(dResponsiveGutter));
      if (breakpoint) {
        _gap = getGap(dResponsiveGutter[breakpoint]);
      }
    }
    return _gap;
  }, [dGutter, dResponsiveGutter, getMaxBreakpoint]);

  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();

    asyncGroup.fromEvent(window, 'resize').subscribe({
      next: () => {
        const _mediaMatch: DBreakpoints[] = [];
        for (const [breakpoint, mql] of mqlList) {
          if (mql.matches) {
            _mediaMatch.push(breakpoint);
          }
        }

        if (!isEqual(_mediaMatch, mediaMatch)) {
          onMediaChange?.(getMaxBreakpoint(_mediaMatch), _mediaMatch);
          setMediaMatch(_mediaMatch);
        }
      },
    });

    return () => {
      asyncCapture.deleteGroup(asyncId);
    };
  }, [asyncCapture, getMaxBreakpoint, mediaMatch, mqlList, onMediaChange, setMediaMatch]);

  const childs = useMemo(() => {
    if (dAsListener) {
      return isUndefined(dRender) ? children : dRender(maxBreakpoint, mediaMatch);
    }

    const _childs: Array<React.ReactElement<DColProps>> = [];
    let sameRowChilds: Array<{
      node: React.ReactElement<DColProps>;
      span?: number | true;
      props: DColProps;
    }> = [];
    let totalSpan = 0;

    const mergeChilds = () => {
      _childs.push(
        ...sameRowChilds
          .filter((item) => !(isNumber(item.span) && item.span === 0))
          .map((item) => {
            const colStyle: React.CSSProperties = {};
            if (item.span === true) {
              colStyle.flex = '1 0 0';
            } else if (isNumber(item.span)) {
              colStyle.flex = `0 0 calc((100% - ${sameRowChilds.length - 1} * ${gap[1]}) / ${dColNum} * ${item.span})`;
            }
            return React.cloneElement(item.node, {
              ...item.props,
              style: {
                ...item.props.style,
                ...colStyle,
              },
            });
          })
      );
    };

    const _children = (isUndefined(dRender) ? children : getFragmentChildren(dRender(maxBreakpoint, mediaMatch))) as Array<
      React.ReactElement<DColProps>
    >;
    React.Children.forEach(_children, (col) => {
      let colSpan = col.props.dSpan;
      let colProps = col.props;
      const breakpoint = getMaxBreakpoint(Object.keys(col.props));
      if (breakpoint) {
        const breakpointProps = col.props[breakpoint] as DSpanValue | DColBaseProps;

        if (isObject(breakpointProps)) {
          if (!isUndefined(breakpointProps.dSpan)) {
            colSpan = breakpointProps.dSpan;
          }
          colProps = {
            ...colProps,
            ...breakpointProps,
          };
        } else if (!isUndefined(breakpointProps)) {
          colSpan = breakpointProps;
        }
      }

      if (isNumber(colSpan)) {
        totalSpan += colSpan;
        if (totalSpan > dColNum) {
          mergeChilds();
          sameRowChilds = [
            {
              node: col,
              span: colSpan,
              props: colProps,
            },
          ];
          totalSpan = colSpan;
        } else {
          sameRowChilds.push({
            node: col,
            span: colSpan,
            props: colProps,
          });
        }
      } else {
        sameRowChilds.push({
          node: col,
          span: colSpan,
          props: colProps,
        });
      }
    });

    mergeChilds();

    return React.Children.toArray(_childs);
  }, [children, dAsListener, dColNum, dRender, gap, getMaxBreakpoint, maxBreakpoint, mediaMatch]);

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {dAsListener ? (
        childs
      ) : (
        <div {...restProps} className={getClassName(className, `${dPrefix}row`)} style={mergeStyle(style, { gap: gap.join(' ') })}>
          {childs}
        </div>
      )}
    </>
  );
}

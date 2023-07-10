import type { DPartialConfigContextData } from './contex';
import type { DIconContextData } from '@react-devui/icons/Icon';

import { useContext, useEffect, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom';

import { useRefExtra, useEvent } from '@react-devui/hooks';
import { DIconContext } from '@react-devui/icons/Icon';
import { getClassName } from '@react-devui/utils';

import dayjs from '../../dayjs';
import { DConfigContextManager } from './contex';
import { DConfigContext } from './contex';
import resources from './resources.json';

const ROOT = new DConfigContextManager({
  namespace: 'rd',
  componentConfigs: {},
  i18n: {
    lang: 'en-US',
    resources,
  },
  layout: {
    pageScrollEl: ':root',
  },
  globalScroll: false,
});

export const ROOT_DATA: {
  clickEvent?: {
    time: number;
    x: number;
    y: number;
  };
  pageSize: { width: number; height: number };
} = {
  pageSize: typeof window !== 'undefined' ? { width: window.innerWidth, height: window.innerHeight } : { width: 0, height: 0 },
};

export interface DRootProps {
  children: React.ReactNode;
  context?: DPartialConfigContextData;
}

export function DRoot(props: DRootProps): JSX.Element | null {
  const { children, context: _context } = props;

  const parent = useContext(DConfigContext);

  const windowRef = useRefExtra(() => window);
  const pageSizeRef = useRef<HTMLDivElement>(null);

  const [context, iconContext] = useMemo<[DConfigContextManager, DIconContextData]>(() => {
    const context = new DConfigContextManager((parent ?? ROOT).mergeContext(_context ?? {}));
    if (parent) {
      context.setParent(parent);
    }

    const namespace = context.namespace;
    const iconProps = context.componentConfigs.DIcon;

    return [
      context,
      {
        props: iconProps,
        className: (theme) => getClassName(`${namespace}-icon`, { [`t-${theme}`]: theme }),
        twoToneColor: (theme) => [
          theme ? `var(--${namespace}-color-${theme})` : `var(--${namespace}-text-color)`,
          theme ? `var(--${namespace}-background-color-${theme})` : `rgb(var(--${namespace}-text-color-rgb) / 10%)`,
        ],
      },
    ];
  }, [_context, parent]);

  switch (context.i18n.lang) {
    case 'en-US':
      dayjs.locale('en');
      break;

    case 'zh-CN':
      dayjs.locale('zh-cn');
      dayjs.updateLocale('zh-cn', {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        meridiem: (hour: number, minute: number, isLowercase: number) => {
          return hour > 12 ? 'PM' : 'AM';
        },
      });
      break;

    default:
      break;
  }

  useEvent<MouseEvent>(
    windowRef,
    'click',
    (e) => {
      // Check if click by keydown.
      if (!(e.clientX === 0 && e.clientY === 0)) {
        const rect = e.target instanceof Element ? e.target.getBoundingClientRect() : null;
        if (rect) {
          ROOT_DATA.clickEvent = {
            time: performance.now(),
            x: e.offsetX + rect.x,
            y: e.offsetX + rect.y,
          };
        }
      }
    },
    { capture: true }
  );

  useEffect(() => {
    if (pageSizeRef.current) {
      const observer = new ResizeObserver(() => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        ROOT_DATA.pageSize = { width: pageSizeRef.current!.clientWidth, height: pageSizeRef.current!.clientHeight };
      });
      observer.observe(pageSizeRef.current);
      return () => {
        observer.disconnect();
      };
    }
  });

  return (
    <>
      <DConfigContext.Provider value={context}>
        {parent ? children : <DIconContext.Provider value={iconContext}>{children}</DIconContext.Provider>}
      </DConfigContext.Provider>
      {windowRef.current &&
        ReactDOM.createPortal(
          <div
            ref={pageSizeRef}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              pointerEvents: 'none',
            }}
          ></div>,
          windowRef.current.document.body
        )}
    </>
  );
}

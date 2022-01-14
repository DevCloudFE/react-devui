import type { Updater } from '../../hooks/two-way-binding';

import React, { useCallback, useMemo, useState } from 'react';

import { usePrefixConfig, useComponentConfig, useTwoWayBinding, useTranslation, useAsync } from '../../hooks';
import { generateComponentMate, getClassName } from '../../utils';
import { DIcon } from '../icon';
import { DInput, DInputAffix } from '../input';
import { DSelect } from '../select';

export interface DPaginationProps extends React.HTMLAttributes<HTMLElement> {
  dActive?: [number, Updater<number>?];
  dTotal: number;
  dPageSize?: [number, Updater<number>?];
  dPageSizeOptions?: number[];
  dCompose?: Array<'total' | 'pages' | 'size' | 'jump'>;
  dCustomRender?: {
    total?: (range: [number, number]) => React.ReactNode;
    prev?: React.ReactNode;
    page?: (page: number) => React.ReactNode;
    next?: React.ReactNode;
    sizeOption?: (size: number) => React.ReactNode;
    jump?: (input: React.ReactNode) => React.ReactNode;
  };
  dMini?: boolean;
  onActiveChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

const { COMPONENT_NAME } = generateComponentMate('DPagination');
const DEFAULT_PROPS = {
  dCompose: ['pages'],
  dPageSizeOptions: [10, 20, 50, 100],
};
export function DPagination(props: DPaginationProps) {
  const {
    dActive,
    dTotal,
    dPageSize,
    dPageSizeOptions = DEFAULT_PROPS.dPageSizeOptions,
    dCompose = DEFAULT_PROPS.dCompose,
    dCustomRender,
    dMini = false,
    onActiveChange,
    onPageSizeChange,
    className,
    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const asyncCapture = useAsync();
  const [t] = useTranslation('DPagination');

  const [isChange, setIsChange] = useState(false);
  const [jumpValue, setJumpValue] = useState('');

  const [active, _changeActive] = useTwoWayBinding<number>(1, dActive, onActiveChange);
  const [pageSize, changePageSize] = useTwoWayBinding<number>(dPageSizeOptions[0] ?? 10, dPageSize, onPageSizeChange);

  const changeActive = useCallback(
    (active: number) => {
      _changeActive(active);

      setIsChange(true);
      asyncCapture.setTimeout(() => setIsChange(false));
    },
    [_changeActive, asyncCapture]
  );

  const lastPage = Math.max(Math.ceil(dTotal / pageSize), 1);
  const iconSize = '0.9em';

  if (lastPage < active) {
    _changeActive(lastPage);
  }

  const totalNode = useMemo(() => {
    if (dCompose.includes('total')) {
      const range: [number, number] = [Math.min((active - 1) * pageSize + 1, dTotal), Math.min(active * pageSize, dTotal)];
      if (dCustomRender && dCustomRender.total) {
        return dCustomRender.total(range);
      } else {
        return (
          <span>
            {t('Total')} {dTotal} {t('items')}
          </span>
        );
      }
    }
    return null;
  }, [active, dCompose, dCustomRender, dTotal, pageSize, t]);

  const [prevNode, pageNode, nextNode] = useMemo(() => {
    let [prevNode, nextNode]: [React.ReactNode, React.ReactNode] = [null, null];
    if (dCompose.includes('pages')) {
      if (dCustomRender && dCustomRender.prev) {
        prevNode = dCustomRender.prev;
      } else {
        prevNode = (
          <DIcon viewBox="64 64 896 896" dSize={iconSize}>
            <path d="M724 218.3V141c0-6.7-7.7-10.4-12.9-6.3L260.3 486.8a31.86 31.86 0 000 50.3l450.8 352.1c5.3 4.1 12.9.4 12.9-6.3v-77.3c0-4.9-2.3-9.6-6.1-12.6l-360-281 360-281.1c3.8-3 6.1-7.7 6.1-12.6z"></path>
          </DIcon>
        );
      }
      prevNode = (
        <li
          className={getClassName(
            `${dPrefix}pagination__item`,
            `${dPrefix}pagination__item--button`,

            {
              'is-disabled': active === 1,
              [`${dPrefix}pagination__item--border`]: !(dCustomRender && dCustomRender.prev),
            }
          )}
          role="button"
          tabIndex={0}
          title={t('Previous page')}
          aria-disabled={active === 1}
          onClick={() => {
            changeActive(Math.max(active - 1, 1));
          }}
          onKeyDown={(e) => {
            if (e.code === 'Enter' || e.code === 'Space') {
              e.preventDefault();
              changeActive(Math.max(active - 1, 1));
            }
          }}
        >
          {prevNode}
        </li>
      );

      if (dCustomRender && dCustomRender.next) {
        nextNode = dCustomRender.next;
      } else {
        nextNode = (
          <DIcon viewBox="64 64 896 896" dSize={iconSize}>
            <path d="M765.7 486.8L314.9 134.7A7.97 7.97 0 00302 141v77.3c0 4.9 2.3 9.6 6.1 12.6l360 281.1-360 281.1c-3.9 3-6.1 7.7-6.1 12.6V883c0 6.7 7.7 10.4 12.9 6.3l450.8-352.1a31.96 31.96 0 000-50.4z"></path>
          </DIcon>
        );
      }
      nextNode = (
        <li
          className={getClassName(`${dPrefix}pagination__item`, `${dPrefix}pagination__item--button`, {
            'is-disabled': active === lastPage,
            [`${dPrefix}pagination__item--border`]: !(dCustomRender && dCustomRender.next),
          })}
          role="button"
          tabIndex={0}
          title={t('Next page')}
          aria-disabled={active === lastPage}
          onClick={() => {
            changeActive(Math.min(active + 1, lastPage));
          }}
          onKeyDown={(e) => {
            if (e.code === 'Enter' || e.code === 'Space') {
              e.preventDefault();
              changeActive(Math.min(active + 1, lastPage));
            }
          }}
        >
          {nextNode}
        </li>
      );
    }
    return [
      prevNode,
      (page: number) => {
        if (dCustomRender && dCustomRender.page) {
          return dCustomRender.page(page);
        } else {
          return <span>{page}</span>;
        }
      },
      nextNode,
    ];
  }, [active, changeActive, dCompose, dCustomRender, dPrefix, lastPage, t]);

  const sizeNode = useMemo(() => {
    const options = dPageSizeOptions.map((size) => ({
      dLabel: size.toString(),
      dValue: size,
    }));

    return (
      <DSelect
        key="size"
        className={getClassName(`${dPrefix}pagination__size-select`, {
          [`${dPrefix}pagination__size-select--mini`]: dMini,
        })}
        dOptions={options}
        dModel={[pageSize]}
        dCustomSelected={(select) => `${select.dLabel} ${t(' / Page')}`}
        dOptionRender={(option) => (dCustomRender && dCustomRender.sizeOption ? dCustomRender.sizeOption(option.dValue) : option.dLabel)}
        onModelChange={(select) => {
          changePageSize(select as number);
        }}
      ></DSelect>
    );
  }, [changePageSize, dCustomRender, dMini, dPageSizeOptions, dPrefix, pageSize, t]);

  const jumpNode = useMemo(() => {
    if (dCompose.includes('jump')) {
      const inputNode = (
        <DInput
          className={getClassName(`${dPrefix}pagination__jump-input`, {
            [`${dPrefix}pagination__jump-input--mini`]: dMini,
          })}
          min={1}
          max={lastPage}
          step={1}
          dModel={[jumpValue, setJumpValue]}
          onKeyDown={(e) => {
            if (e.code === 'Enter') {
              e.preventDefault();
              const value = Number(jumpValue);
              if (!Number.isNaN(value)) {
                changeActive(Math.max(Math.min(value, lastPage), 1));
              }
              setJumpValue('');
            }
          }}
        />
      );
      const jumpInput = dMini ? inputNode : <DInputAffix dNumber>{inputNode}</DInputAffix>;

      if (dCustomRender && dCustomRender.jump) {
        return dCustomRender.jump(jumpInput);
      } else {
        return (
          <div>
            {t('Go')} {jumpInput} {t('Page')}
          </div>
        );
      }
    }
    return null;
  }, [changeActive, dCompose, dCustomRender, dMini, dPrefix, jumpValue, lastPage, t]);

  return (
    <nav
      {...restProps}
      className={getClassName(className, `${dPrefix}pagination`, {
        [`${dPrefix}pagination--mini`]: dMini,
        'is-change': isChange,
      })}
      tabIndex={-1}
      role="navigation"
      aria-label="Pagination Navigation"
    >
      {dCompose.map((item) => {
        if (item === 'total') {
          return (
            <div key="total" className={getClassName(`${dPrefix}pagination__item`)}>
              {totalNode}
            </div>
          );
        }

        if (item === 'pages') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let pages: any[] = [];

          if (lastPage <= 7) {
            pages = Array(lastPage)
              .fill(0)
              .map((n, index) => index + 1);
          } else {
            for (let n = -3; n <= 3; n++) {
              pages.push(active + n);
            }

            if (pages[0] < 1) {
              pages = pages.map((n) => n + (1 - pages[0]));
            }
            if (pages[6] > lastPage) {
              pages = pages.map((n) => n - (pages[6] - lastPage));
            }

            if (pages[0] > 1) {
              pages[0] = 1;
              pages[1] = 'prev5';
            }
            if (pages[6] < lastPage) {
              pages[6] = lastPage;
              pages[5] = 'next5';
            }
          }

          return (
            <ul key="pages" className={`${dPrefix}pagination__list`}>
              {prevNode}
              {pages.map((n) => {
                if (n === 'prev5') {
                  return (
                    <li
                      key="prev5"
                      className={getClassName(
                        `${dPrefix}pagination__item`,
                        `${dPrefix}pagination__item--button`,
                        `${dPrefix}pagination__item--jump5`
                      )}
                      role="button"
                      tabIndex={0}
                      title={t('5 pages forward')}
                      onClick={() => {
                        changeActive(Math.max(active - 5, 1));
                      }}
                      onKeyDown={(e) => {
                        if (e.code === 'Enter' || e.code === 'Space') {
                          e.preventDefault();
                          changeActive(Math.max(active - 5, 1));
                        }
                      }}
                    >
                      <DIcon viewBox="64 64 896 896" dSize={iconSize}>
                        <path d="M272.9 512l265.4-339.1c4.1-5.2.4-12.9-6.3-12.9h-77.3c-4.9 0-9.6 2.3-12.6 6.1L186.8 492.3a31.99 31.99 0 000 39.5l255.3 326.1c3 3.9 7.7 6.1 12.6 6.1H532c6.7 0 10.4-7.7 6.3-12.9L272.9 512zm304 0l265.4-339.1c4.1-5.2.4-12.9-6.3-12.9h-77.3c-4.9 0-9.6 2.3-12.6 6.1L490.8 492.3a31.99 31.99 0 000 39.5l255.3 326.1c3 3.9 7.7 6.1 12.6 6.1H836c6.7 0 10.4-7.7 6.3-12.9L576.9 512z"></path>
                      </DIcon>
                      <div className={`${dPrefix}pagination__ellipsis`}>•••</div>
                    </li>
                  );
                } else if (n === 'next5') {
                  return (
                    <li
                      key="next5"
                      className={getClassName(
                        `${dPrefix}pagination__item`,
                        `${dPrefix}pagination__item--button`,
                        `${dPrefix}pagination__item--jump5`
                      )}
                      role="button"
                      tabIndex={0}
                      title={t('5 pages backward')}
                      onClick={() => {
                        changeActive(Math.min(active + 5, lastPage));
                      }}
                      onKeyDown={(e) => {
                        if (e.code === 'Enter' || e.code === 'Space') {
                          e.preventDefault();
                          changeActive(Math.min(active + 5, lastPage));
                        }
                      }}
                    >
                      <DIcon viewBox="64 64 896 896" dSize={iconSize}>
                        <path d="M533.2 492.3L277.9 166.1c-3-3.9-7.7-6.1-12.6-6.1H188c-6.7 0-10.4 7.7-6.3 12.9L447.1 512 181.7 851.1A7.98 7.98 0 00188 864h77.3c4.9 0 9.6-2.3 12.6-6.1l255.3-326.1c9.1-11.7 9.1-27.9 0-39.5zm304 0L581.9 166.1c-3-3.9-7.7-6.1-12.6-6.1H492c-6.7 0-10.4 7.7-6.3 12.9L751.1 512 485.7 851.1A7.98 7.98 0 00492 864h77.3c4.9 0 9.6-2.3 12.6-6.1l255.3-326.1c9.1-11.7 9.1-27.9 0-39.5z"></path>
                      </DIcon>
                      <div className={`${dPrefix}pagination__ellipsis`}>•••</div>
                    </li>
                  );
                } else {
                  return (
                    <li
                      key={n}
                      className={getClassName(
                        `${dPrefix}pagination__item`,
                        `${dPrefix}pagination__item--button`,
                        `${dPrefix}pagination__item--border`,
                        {
                          'is-active': active === n,
                        }
                      )}
                      tabIndex={0}
                      onClick={() => {
                        changeActive(n);
                      }}
                      onKeyDown={(e) => {
                        if (e.code === 'Enter' || e.code === 'Space') {
                          e.preventDefault();
                          changeActive(n);
                        }
                      }}
                    >
                      {pageNode(n)}
                    </li>
                  );
                }
              })}
              {nextNode}
            </ul>
          );
        }

        if (item === 'size') {
          return sizeNode;
        }

        if (item === 'jump') {
          return (
            <div key="jump" className={getClassName(`${dPrefix}pagination__item`)}>
              {jumpNode}
            </div>
          );
        }

        return null;
      })}
    </nav>
  );
}

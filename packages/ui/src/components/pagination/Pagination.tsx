import type { DUpdater } from '../../hooks/common/useTwoWayBinding';

import { isNull } from 'lodash';
import { useRef, useState } from 'react';

import { usePrefixConfig, useComponentConfig, useTwoWayBinding, useTranslation, useAsync } from '../../hooks';
import { DoubleLeftOutlined, DoubleRightOutlined, LeftOutlined, RightOutlined } from '../../icons';
import { registerComponentMate, getClassName } from '../../utils';
import { DInput } from '../input';
import { DSelect } from '../select';

export interface DPaginationProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  dActive?: [number, DUpdater<number>?];
  dTotal: number;
  dPageSize?: [number, DUpdater<number>?];
  dPageSizeOptions?: number[];
  dCompose?: ('total' | 'pages' | 'size' | 'jump')[];
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

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DPagination' });
export function DPagination(props: DPaginationProps): JSX.Element | null {
  const {
    dActive,
    dTotal,
    dPageSize,
    dPageSizeOptions = [10, 20, 50, 100],
    dCompose = ['pages'],
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

  //#region Ref
  const navRef = useRef<HTMLElement>(null);
  //#endregion

  const dataRef = useRef<{
    clearTid?: () => void;
  }>({});

  const asyncCapture = useAsync();
  const [t] = useTranslation('DPagination');

  const [active, _changeActive] = useTwoWayBinding<number>(1, dActive, onActiveChange);
  const changeActive = (active: number, max = lastPage) => {
    _changeActive(Math.max(Math.min(active, max), 1));

    if (navRef.current) {
      navRef.current.classList.toggle('is-change', true);

      dataRef.current.clearTid?.();
      dataRef.current.clearTid = asyncCapture.afterNextAnimationFrame(() => {
        if (navRef.current) {
          navRef.current.classList.toggle('is-change', false);
        }
      });
    }
  };

  const [pageSize, _changePageSize] = useTwoWayBinding<number>(dPageSizeOptions[0] ?? 10, dPageSize, onPageSizeChange);
  const changePageSize = (size: number) => {
    _changePageSize(size);

    const lastPage = Math.max(Math.ceil(dTotal / size), 1);
    changeActive(active, lastPage);
  };

  const [jumpValue, setJumpValue] = useState('');
  const lastPage = Math.max(Math.ceil(dTotal / pageSize), 1);
  const iconSize = '0.9em';

  const totalNode = (() => {
    if (dCompose.includes('total')) {
      const range: [number, number] = [Math.min((active - 1) * pageSize + 1, dTotal), Math.min(active * pageSize, dTotal)];
      if (dCustomRender && dCustomRender.total) {
        return dCustomRender.total(range);
      } else {
        return (
          <div>
            {t('Total')} {dTotal} {t('items')}
          </div>
        );
      }
    }
    return null;
  })();

  const [prevNode, pageNode, nextNode] = (() => {
    let [prevNode, nextNode]: [React.ReactNode, React.ReactNode] = [null, null];
    if (dCompose.includes('pages')) {
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
          title={t('Previous page')}
          role="button"
          aria-disabled={active === 1}
          onClick={() => {
            changeActive(active - 1);
          }}
        >
          {dCustomRender && dCustomRender.prev ? dCustomRender.prev : <LeftOutlined dSize={iconSize} />}
        </li>
      );

      nextNode = (
        <li
          className={getClassName(`${dPrefix}pagination__item`, `${dPrefix}pagination__item--button`, {
            'is-disabled': active === lastPage,
            [`${dPrefix}pagination__item--border`]: !(dCustomRender && dCustomRender.next),
          })}
          title={t('Next page')}
          role="button"
          aria-disabled={active === lastPage}
          onClick={() => {
            changeActive(active + 1);
          }}
        >
          {dCustomRender && dCustomRender.next ? dCustomRender.next : <RightOutlined dSize={iconSize} />}
        </li>
      );
    }
    return [
      prevNode,
      (page: number) => {
        if (dCustomRender && dCustomRender.page) {
          return dCustomRender.page(page);
        } else {
          return <div>{page}</div>;
        }
      },
      nextNode,
    ];
  })();

  const sizeNode = (() => {
    const options = dPageSizeOptions.map((size) => ({
      label: size.toString(),
      value: size,
    }));

    return (
      <DSelect
        key="size"
        className={getClassName(`${dPrefix}pagination__size-select`, {
          [`${dPrefix}pagination__size-select--mini`]: dMini,
        })}
        dOptions={options}
        dModel={[pageSize]}
        dCustomOption={(option) => (dCustomRender && dCustomRender.sizeOption ? dCustomRender.sizeOption(option.value) : option.label)}
        dCustomSelected={(select) => `${select.label}${t(' / Page')}`}
        onModelChange={(value) => {
          if (!isNull(value)) {
            changePageSize(value);
          }
        }}
      />
    );
  })();

  const jumpNode = (() => {
    if (dCompose.includes('jump')) {
      const jumpInput = (
        <DInput
          className={getClassName(`${dPrefix}pagination__jump-input`, {
            [`${dPrefix}pagination__jump-input--mini`]: dMini,
          })}
          dType="number"
          dMax={lastPage}
          dMin={1}
          dStep={1}
          dModel={[jumpValue, setJumpValue]}
          dNumbetButton={!dMini}
          dInputProps={{
            onKeyDown: (e) => {
              if (e.code === 'Space' || e.code === 'Enter') {
                e.preventDefault();

                const val = Number(jumpValue);
                if (!isNaN(val)) {
                  changeActive(val);
                }
              }
            },
          }}
        />
      );

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
  })();

  return (
    <nav
      {...restProps}
      ref={navRef}
      className={getClassName(className, `${dPrefix}pagination`, {
        [`${dPrefix}pagination--mini`]: dMini,
      })}
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
          let pages: (number | 'prev5' | 'next5')[] = [];

          if (lastPage <= 7) {
            pages = Array(lastPage)
              .fill(0)
              .map((n, index) => index + 1);
          } else {
            for (let n = -3; n <= 3; n++) {
              pages.push(active + n);
            }

            if (pages[0] < 1) {
              pages = (pages as number[]).map((n) => n + (1 - (pages as number[])[0]));
            }
            if (pages[6] > lastPage) {
              pages = (pages as number[]).map((n) => n - ((pages as number[])[6] - lastPage));
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
                      title={t('5 pages forward')}
                      role="button"
                      onClick={() => {
                        changeActive(active - 5);
                      }}
                    >
                      <DoubleLeftOutlined dSize={iconSize} />
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
                      title={t('5 pages backward')}
                      role="button"
                      onClick={() => {
                        changeActive(active + 5);
                      }}
                    >
                      <DoubleRightOutlined dSize={iconSize} />
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
                        `${dPrefix}pagination__item--number`,
                        {
                          'is-active': active === n,
                        }
                      )}
                      tabIndex={active === n ? 0 : -1}
                      data-number={n}
                      onClick={() => {
                        changeActive(n);
                      }}
                      onKeyDown={(e) => {
                        const focusN = (num: number) => {
                          if (navRef.current) {
                            const activeEl = navRef.current.querySelector(`li[data-number="${num}"]`) as HTMLElement | null;
                            activeEl?.focus({ preventScroll: true });
                          }
                          changeActive(num);
                        };
                        switch (e.code) {
                          case 'ArrowLeft':
                            e.preventDefault();
                            focusN(n - 1);
                            break;

                          case 'ArrowRight':
                            e.preventDefault();
                            focusN(n + 1);
                            break;

                          case 'Home':
                            e.preventDefault();
                            focusN(1);
                            break;

                          case 'End':
                            e.preventDefault();
                            focusN(lastPage);
                            break;

                          default:
                            break;
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

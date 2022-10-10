import { isNull } from 'lodash';
import { useEffect, useRef, useState } from 'react';

import { DoubleLeftOutlined, DoubleRightOutlined, EllipsisOutlined, LeftOutlined, RightOutlined } from '@react-devui/icons';
import { getClassName } from '@react-devui/utils';

import { useDValue } from '../../hooks';
import { cloneHTMLElement, registerComponentMate } from '../../utils';
import { DInput } from '../input';
import { useComponentConfig, usePrefixConfig, useTranslation } from '../root';
import { DSelect } from '../select';
import { getButtonRoleAttributes } from './utils';

export interface DPaginationProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  dActive?: number;
  dTotal: number;
  dPageSize?: number;
  dPageSizeList?: number[];
  dCompose?: ('total' | 'pages' | 'size' | 'jump')[];
  dCustomRender?: {
    total?: (range: [number, number]) => React.ReactNode;
    prev?: React.ReactNode;
    page?: (page: number) => React.ReactNode;
    next?: React.ReactNode;
    size?: (size: number) => React.ReactNode;
    jump?: (input: React.ReactNode) => React.ReactNode;
  };
  dMini?: boolean;
  onActiveChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DPagination' as const });
export function DPagination(props: DPaginationProps): JSX.Element | null {
  const {
    dActive,
    dTotal,
    dPageSize,
    dPageSizeList = [10, 20, 50, 100],
    dCompose = ['pages'],
    dCustomRender,
    dMini = false,
    onActiveChange,
    onPageSizeChange,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const navRef = useRef<HTMLElement>(null);
  //#endregion

  const [t] = useTranslation();

  const [active, _changeActive] = useDValue<number>(1, dActive, onActiveChange);
  const changeActive = (active: number, max = lastPage) => {
    _changeActive(Math.max(Math.min(active, max), 1));
    setIsChange(true);
  };

  const [isChange, setIsChange] = useState(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isChange) {
      setIsChange(false);
    }
  });

  const [pageSize, _changePageSize] = useDValue<number>(dPageSizeList[0] ?? 10, dPageSize, onPageSizeChange);
  const changePageSize = (size: number) => {
    _changePageSize(size);

    const lastPage = Math.max(Math.ceil(dTotal / size), 1);
    changeActive(active, lastPage);
  };

  const [jumpValue, setJumpValue] = useState('');
  const lastPage = Math.max(Math.ceil(dTotal / pageSize), 1);

  const totalNode = (() => {
    if (dCompose.includes('total')) {
      const range: [number, number] = [Math.min((active - 1) * pageSize + 1, dTotal), Math.min(active * pageSize, dTotal)];
      if (dCustomRender && dCustomRender.total) {
        return dCustomRender.total(range);
      } else {
        return (
          <div>
            {t('Pagination', 'Total')} {dTotal} {t('Pagination', 'items')}
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
          {...getButtonRoleAttributes(() => {
            changeActive(active - 1);
          }, active === 1)}
          className={getClassName(
            `${dPrefix}pagination__item`,
            `${dPrefix}pagination__item--button`,

            {
              'is-disabled': active === 1,
              [`${dPrefix}pagination__item--border`]: !(dCustomRender && dCustomRender.prev),
            }
          )}
          title={t('Pagination', 'Previous page')}
        >
          {dCustomRender && dCustomRender.prev ? dCustomRender.prev : <LeftOutlined />}
        </li>
      );

      nextNode = (
        <li
          {...getButtonRoleAttributes(() => {
            changeActive(active + 1);
          }, active === lastPage)}
          className={getClassName(`${dPrefix}pagination__item`, `${dPrefix}pagination__item--button`, {
            'is-disabled': active === lastPage,
            [`${dPrefix}pagination__item--border`]: !(dCustomRender && dCustomRender.next),
          })}
          title={t('Pagination', 'Next page')}
        >
          {dCustomRender && dCustomRender.next ? dCustomRender.next : <RightOutlined />}
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
    const list = dPageSizeList.map((size) => ({
      label: size.toString(),
      value: size,
    }));

    return (
      <DSelect
        key="size"
        className={getClassName(`${dPrefix}pagination__size-select`, {
          [`${dPrefix}pagination__size-select--mini`]: dMini,
        })}
        dList={list}
        dModel={pageSize}
        dCustomItem={(item) => (dCustomRender && dCustomRender.size ? dCustomRender.size(item.value) : item.label)}
        dCustomSelected={(select) => `${select.label}${t('Pagination', ' / Page')}`}
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
          dModel={jumpValue}
          dNumbetButton={!dMini}
          dInputRender={(el) =>
            cloneHTMLElement(el, {
              onKeyDown: (e) => {
                el.props.onKeyDown?.(e);

                if (e.code === 'Enter') {
                  e.preventDefault();

                  const val = Number(jumpValue);
                  if (!isNaN(val)) {
                    changeActive(val);
                  }
                }
              },
            })
          }
          onModelChange={setJumpValue}
        />
      );

      if (dCustomRender && dCustomRender.jump) {
        return dCustomRender.jump(jumpInput);
      } else {
        return (
          <div className={`${dPrefix}pagination__jump-wrapper`}>
            {t('Pagination', 'Go')} {jumpInput} {t('Pagination', 'Page')}
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
      className={getClassName(restProps.className, `${dPrefix}pagination`, {
        [`${dPrefix}pagination--mini`]: dMini,
        'is-change': isChange,
      })}
      role="navigation"
      aria-label={restProps['aria-label'] ?? 'Pagination Navigation'}
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
                      {...getButtonRoleAttributes(() => {
                        changeActive(active - 5);
                      })}
                      key="prev5"
                      className={getClassName(
                        `${dPrefix}pagination__item`,
                        `${dPrefix}pagination__item--button`,
                        `${dPrefix}pagination__item--jump5`
                      )}
                      title={t('Pagination', '5 pages forward')}
                    >
                      <DoubleLeftOutlined className={`${dPrefix}pagination__jump5-icon`} />
                      <div className={`${dPrefix}pagination__ellipsis`}>
                        <EllipsisOutlined />
                      </div>
                    </li>
                  );
                } else if (n === 'next5') {
                  return (
                    <li
                      {...getButtonRoleAttributes(() => {
                        changeActive(active + 5);
                      })}
                      key="next5"
                      className={getClassName(
                        `${dPrefix}pagination__item`,
                        `${dPrefix}pagination__item--button`,
                        `${dPrefix}pagination__item--jump5`
                      )}
                      title={t('Pagination', '5 pages backward')}
                    >
                      <DoubleRightOutlined className={`${dPrefix}pagination__jump5-icon`} />
                      <div className={`${dPrefix}pagination__ellipsis`}>
                        <EllipsisOutlined />
                      </div>
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

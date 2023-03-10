import { isNull } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';

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
  dCompose?: ('total' | 'pages' | 'page-size' | 'jump')[];
  dCustomRender?: {
    total?: (range: [number, number]) => React.ReactNode;
    prev?: React.ReactNode;
    page?: (page: number) => React.ReactNode;
    next?: React.ReactNode;
    pageSize?: (pageSize: number) => React.ReactNode;
    jump?: (input: React.ReactNode) => React.ReactNode;
  };
  dMini?: boolean;
  onPaginationChange?: (page: number, pageSize: number) => void;
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
    onPaginationChange,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const navRef = useRef<HTMLElement>(null);
  //#endregion

  const [t] = useTranslation();

  const [active, _changeActive] = useDValue<number>(1, dActive);
  const changeActive = (_active: number) => {
    setIsChange(true);
    const newActive = Math.max(Math.min(_active, lastPage), 1);
    _changeActive(newActive);

    if (!Object.is(newActive, active)) {
      onPaginationChange?.(newActive, pageSize);
    }
  };

  const [isChange, setIsChange] = useState(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isChange) {
      setIsChange(false);
    }
  });

  const [pageSize, _changePageSize] = useDValue<number>(dPageSizeList[0] ?? 10, dPageSize);
  const changePageSize = (_pageSize: number) => {
    _changePageSize(_pageSize);

    const lastPage = Math.max(Math.ceil(dTotal / _pageSize), 1);
    const newActive = Math.max(Math.min(active, lastPage), 1);

    if (!Object.is(newActive, active) || !Object.is(_pageSize, pageSize)) {
      onPaginationChange?.(newActive, _pageSize);
    }
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
          className={getClassName(`${dPrefix}pagination__button`, {
            'is-disabled': active === 1,
            [`${dPrefix}pagination__button--border`]: !(dCustomRender && dCustomRender.prev),
          })}
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
          className={getClassName(`${dPrefix}pagination__button`, {
            'is-disabled': active === lastPage,
            [`${dPrefix}pagination__button--border`]: !(dCustomRender && dCustomRender.next),
          })}
          style={{ marginRight: dCompose[dCompose.length - 1] === 'pages' ? 0 : `var(--${dPrefix}pagination-space)` }}
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

  const pageSizeNode = (() => {
    const list = dPageSizeList.map((size) => ({
      label: size.toString(),
      value: size,
    }));

    return (
      <DSelect
        key="page-size"
        className={`${dPrefix}pagination__page-size`}
        style={{ marginRight: dCompose[dCompose.length - 1] === 'page-size' ? 0 : undefined }}
        dList={list}
        dModel={pageSize}
        dCustomItem={(item) => (dCustomRender && dCustomRender.pageSize ? dCustomRender.pageSize(item.value) : item.label)}
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
          className={`${dPrefix}pagination__jump-input`}
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
          <>
            <span>{t('Pagination', 'Go')}</span>
            {jumpInput}
            <span>{t('Pagination', 'Page')}</span>
          </>
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
            <div
              key="total"
              className={`${dPrefix}pagination__total`}
              style={{ marginRight: dCompose[dCompose.length - 1] === 'total' ? 0 : undefined }}
            >
              {totalNode}
            </div>
          );
        }

        if (item === 'pages') {
          let pages: (number | 'prev5' | 'next5')[] = [];

          if (lastPage <= 7) {
            pages = Array.from({ length: lastPage }).map((_, index) => index + 1);
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
            <React.Fragment key="pages">
              {prevNode}
              {pages.map((n) => {
                if (n === 'prev5') {
                  return (
                    <li
                      {...getButtonRoleAttributes(() => {
                        changeActive(active - 5);
                      })}
                      key="prev5"
                      className={getClassName(`${dPrefix}pagination__button`, `${dPrefix}pagination__button--jump5`)}
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
                      className={getClassName(`${dPrefix}pagination__button`, `${dPrefix}pagination__button--jump5`)}
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
                        `${dPrefix}pagination__button`,
                        `${dPrefix}pagination__button--border`,
                        `${dPrefix}pagination__button--number`,
                        {
                          'is-active': active === n,
                        }
                      )}
                      tabIndex={0}
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
            </React.Fragment>
          );
        }

        if (item === 'page-size') {
          return pageSizeNode;
        }

        if (item === 'jump') {
          return (
            <div
              key="jump"
              className={`${dPrefix}pagination__jump`}
              style={{ marginRight: dCompose[dCompose.length - 1] === 'jump' ? 0 : undefined }}
            >
              {jumpNode}
            </div>
          );
        }

        return null;
      })}
    </nav>
  );
}

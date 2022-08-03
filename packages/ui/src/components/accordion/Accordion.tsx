import type { DId } from '../../utils/global';

import { isNull, nth } from 'lodash';
import React, { useId } from 'react';

import { usePrefixConfig, useComponentConfig, useDValue } from '../../hooks';
import { DownOutlined } from '../../icons';
import { registerComponentMate, getClassName } from '../../utils';
import { TTANSITION_DURING_BASE } from '../../utils/global';
import { DCollapseTransition } from '../_transition';

export interface DAccordionItem<ID extends DId> {
  id: ID;
  title: React.ReactNode;
  region: React.ReactNode;
  arrow?: boolean | 'left';
  disabled?: boolean;
}

export interface DAccordionProps<ID extends DId, T extends DAccordionItem<ID>>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dList: T[];
  dActive?: ID | null | ID[];
  dActiveOne?: boolean;
  dArrow?: 'left' | 'right' | false;
  onActiveChange?: (id: any, item: any) => void;
  afterActiveChange?: (id: any, item: any, active: boolean) => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DAccordion' });
export function DAccordion<ID extends DId, T extends DAccordionItem<ID>>(props: DAccordionProps<ID, T>): JSX.Element | null {
  const {
    dList,
    dActive,
    dActiveOne = false,
    dArrow = 'right',
    onActiveChange,
    afterActiveChange,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const uniqueId = useId();
  const getButtonId = (id: ID) => `${dPrefix}accordion-button-${id}-${uniqueId}`;
  const getRegionId = (id: ID) => `${dPrefix}accordion-region-${id}-${uniqueId}`;

  const [activeId, changeActiveId] = useDValue<ID | null | ID[]>(dActiveOne ? null : [], dActive, (id) => {
    if (onActiveChange) {
      if (dActiveOne) {
        onActiveChange(id, isNull(id) ? null : dList.find((a) => a.id === id));
      } else {
        let length = (id as ID[]).length;
        const items: T[] = [];
        const reduceArr = (arr: T[]) => {
          for (const item of arr) {
            if (length === 0) {
              break;
            }

            const index = (id as ID[]).findIndex((v) => v === item.id);
            if (index !== -1) {
              items[index] = item;
              length -= 1;
            }
          }
        };
        reduceArr(dList);

        onActiveChange(id, items);
      }
    }
  });

  return (
    <div {...restProps} className={getClassName(restProps.className, `${dPrefix}accordion`)}>
      {dList.map((item, index) => {
        const { id: itemId, title: itemTitle, region: itemRegion, arrow: itemArrow = dArrow, disabled: itemDisabled = false } = item;

        const getAccordion = (next: boolean, _index = index): T | undefined => {
          for (let focusIndex = next ? _index + 1 : _index - 1, n = 0; n < dList.length; next ? focusIndex++ : focusIndex--, n++) {
            const t = nth(dList, focusIndex % dList.length);
            if (t && !t.disabled) {
              return t;
            }
          }
        };

        const focusTab = (t?: T) => {
          if (t) {
            const el = document.getElementById(getButtonId(t.id));
            if (el) {
              el.focus();
            }
          }
        };

        const buttonId = getButtonId(itemId);
        const regionId = getRegionId(itemId);
        const isActive = dActiveOne ? activeId === itemId : (activeId as ID[]).includes(itemId);
        const iconRotate = (() => {
          if (itemArrow === 'left' && !isActive) {
            return -90;
          }
          if (itemArrow === 'right' && isActive) {
            return 180;
          }
          return undefined;
        })();

        const handleClick = () => {
          if (dActiveOne) {
            changeActiveId(isActive ? null : itemId);
          } else {
            changeActiveId((draft) => {
              const index = (draft as ID[]).findIndex((v) => v === itemId);
              if (index !== -1) {
                (draft as ID[]).splice(index, 1);
              } else {
                (draft as ID[]).push(itemId);
              }
            });
          }
        };

        return (
          <div
            key={itemId}
            className={getClassName(`${dPrefix}accordion__container`, {
              [`${dPrefix}accordion__container--last`]: index === dList.length - 1,
            })}
          >
            <div
              id={buttonId}
              className={getClassName(`${dPrefix}accordion__button`, {
                [`${dPrefix}accordion__button--arrow-left`]: itemArrow === 'left',
                'is-disabled': itemDisabled,
              })}
              tabIndex={itemDisabled ? -1 : 0}
              role="button"
              aria-controls={regionId}
              aria-expanded={isActive}
              aria-disabled={itemDisabled}
              onClick={handleClick}
              onKeyDown={(e) => {
                switch (e.code) {
                  case 'Enter':
                  case 'Space':
                    e.preventDefault();
                    handleClick();
                    break;

                  case 'ArrowUp':
                    e.preventDefault();
                    focusTab(getAccordion(false));
                    break;

                  case 'ArrowDown':
                    e.preventDefault();
                    focusTab(getAccordion(true));
                    break;

                  case 'Home':
                    e.preventDefault();
                    for (const a of dList) {
                      if (!a.disabled) {
                        focusTab(a);
                        break;
                      }
                    }
                    break;

                  case 'End':
                    e.preventDefault();
                    for (let index = dList.length - 1; index >= 0; index--) {
                      if (!dList[index].disabled) {
                        focusTab(dList[index]);
                        break;
                      }
                    }
                    break;

                  default:
                    break;
                }
              }}
            >
              <div className={`${dPrefix}accordion__title`}>{itemTitle}</div>
              {itemArrow && <DownOutlined className={`${dPrefix}accordion__arrow`} dRotate={iconRotate} />}
            </div>
            <DCollapseTransition
              dSize={0}
              dIn={isActive}
              dDuring={TTANSITION_DURING_BASE}
              dStyles={{
                enter: { opacity: 0 },
                entering: {
                  transition: ['height', 'padding', 'margin', 'opacity']
                    .map((attr) => `${attr} ${TTANSITION_DURING_BASE}ms ease-out`)
                    .join(', '),
                },
                leaving: {
                  opacity: 0,
                  transition: ['height', 'padding', 'margin', 'opacity']
                    .map((attr) => `${attr} ${TTANSITION_DURING_BASE}ms ease-in`)
                    .join(', '),
                },
                leaved: { display: 'none' },
              }}
              afterEnter={() => {
                afterActiveChange?.(itemId, item, true);
              }}
              afterLeave={() => {
                afterActiveChange?.(itemId, item, false);
              }}
            >
              {(ref, collapseStyle) => (
                <div
                  ref={ref}
                  id={regionId}
                  className={`${dPrefix}accordion__region`}
                  style={collapseStyle}
                  role="region"
                  aria-labelledby={getButtonId(itemId)}
                >
                  {itemRegion}
                </div>
              )}
            </DCollapseTransition>
          </div>
        );
      })}
    </div>
  );
}

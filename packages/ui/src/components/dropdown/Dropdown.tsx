import type { DUpdater } from '../../hooks/common/useTwoWayBinding';
import type { DNestedChildren, DId } from '../../utils/global';

import { isUndefined, nth } from 'lodash';
import React, { useId, useRef } from 'react';
import { useState } from 'react';

import {
  usePrefixConfig,
  useComponentConfig,
  useTwoWayBinding,
  useTranslation,
  useEventCallback,
  useElement,
  useMaxIndex,
  useFocusVisible,
} from '../../hooks';
import { registerComponentMate, getClassName, getNoTransformSize, getVerticalSidePosition, scrollElementToView } from '../../utils';
import { DPopup, useNestedPopup } from '../_popup';
import { DTransition } from '../_transition';
import { DDropdownGroup } from './DropdownGroup';
import { DDropdownItem } from './DropdownItem';
import { DDropdownSub } from './DropdownSub';
import { checkEnableOption, getOptions } from './utils';

export interface DDropdownOption<ID extends DId> {
  id: ID;
  label: React.ReactNode;
  type: 'item' | 'group' | 'sub';
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface DDropdownProps<ID extends DId, T extends DDropdownOption<ID>>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  children: React.ReactElement;
  dOptions: DNestedChildren<T>[];
  dVisible?: [boolean, DUpdater<boolean>?];
  dPlacement?: 'top' | 'top-left' | 'top-right' | 'bottom' | 'bottom-left' | 'bottom-right';
  dTrigger?: 'hover' | 'click';
  dArrow?: boolean;
  dCloseOnClick?: boolean;
  dZIndex?: number | string;
  onVisibleChange?: (visible: boolean) => void;
  afterVisibleChange?: (visible: boolean) => void;
  onOptionClick?: (id: ID, option: DNestedChildren<T>) => void;
}

const TTANSITION_DURING = 116;
const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DDropdown' });
export function DDropdown<ID extends DId, T extends DDropdownOption<ID>>(props: DDropdownProps<ID, T>): JSX.Element | null {
  const {
    children,
    dOptions,
    dVisible,
    dPlacement = 'bottom-right',
    dTrigger = 'hover',
    dArrow = false,
    dCloseOnClick = true,
    dZIndex,
    onVisibleChange,
    afterVisibleChange,
    onOptionClick,

    id,
    className,
    style,
    onMouseEnter,
    onMouseLeave,
    onMouseDown,
    onMouseUp,
    onClick,
    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const dropdownRef = useRef<HTMLDivElement>(null);
  const ulRef = useRef<HTMLUListElement>(null);
  //#endregion

  const [t] = useTranslation('Common');

  const uniqueId = useId();
  const _id = id ?? `${dPrefix}dropdown-${uniqueId}`;
  const buttonId = children.props.id ?? `${dPrefix}dropdown-button-${uniqueId}`;
  const getOptionId = (id: ID) => `${dPrefix}dropdown-option-${id}-${uniqueId}`;

  const { popupIds, setPopupIds, addPopupId, removePopupId } = useNestedPopup<ID>();
  const [focusIds, setFocusIds] = useState<ID[]>([]);
  const [isFocus, setIsFocus] = useState(false);
  const [isFocusVisible, setIsFocusVisible] = useState(false);
  const { fvOnFocus, fvOnBlur, fvOnKeyDown } = useFocusVisible(setIsFocusVisible);
  const focusId = (() => {
    if (isFocus) {
      let id: ID | undefined;
      for (const [index, focusId] of focusIds.entries()) {
        id = focusId;
        if (nth(popupIds, index)?.id !== focusId) {
          break;
        }
      }
      return id;
    }
  })();

  const initFocus = () => {
    const ids: ID[] = [];
    const reduceArr = (arr: DNestedChildren<T>[]) => {
      for (const item of arr) {
        if (ids.length === 1) {
          break;
        }

        if (item.type === 'group' && item.children) {
          reduceArr(item.children);
        } else if (checkEnableOption(item)) {
          ids.push(item.id);
        }
      }
    };
    reduceArr(dOptions);
    setFocusIds(ids);
  };

  const [visible, _changeVisible] = useTwoWayBinding<boolean>(false, dVisible, onVisibleChange);
  const changeVisible = useEventCallback((visible: boolean) => {
    _changeVisible(visible);

    if (!visible) {
      setPopupIds([]);
    }
  });

  const maxZIndex = useMaxIndex(visible);
  const zIndex = (() => {
    if (isUndefined(dZIndex)) {
      return maxZIndex;
    } else {
      return dZIndex;
    }
  })();

  const containerEl = useElement(() => {
    let el = document.getElementById(`${dPrefix}dropdown-root`);
    if (!el) {
      el = document.createElement('div');
      el.id = `${dPrefix}dropdown-root`;
      document.body.appendChild(el);
    }
    return el;
  });

  const [popupPositionStyle, setPopupPositionStyle] = useState<React.CSSProperties>({
    top: -9999,
    left: -9999,
  });
  const [transformOrigin, setTransformOrigin] = useState<string>();
  const [arrowPosition, setArrowPosition] = useState<React.CSSProperties>();
  const updatePosition = useEventCallback(() => {
    const targetEl = document.getElementById(buttonId);
    if (targetEl && dropdownRef.current) {
      const { width, height } = getNoTransformSize(dropdownRef.current);
      const { top, left, transformOrigin, arrowPosition } = getVerticalSidePosition(targetEl, { width, height }, dPlacement, 8);
      setPopupPositionStyle({ top, left });
      setTransformOrigin(transformOrigin);
      setArrowPosition(arrowPosition);
    }
  });

  const preventBlur: React.MouseEventHandler<HTMLElement> = (e) => {
    if (e.button === 0) {
      e.preventDefault();
    }
  };

  let handleKeyDown: React.KeyboardEventHandler<HTMLElement> | undefined;
  const optionNodes = (() => {
    const getNodes = (arr: DNestedChildren<T>[], level: number, subParents: DNestedChildren<T>[]): JSX.Element[] =>
      arr.map((option) => {
        const { id: optionId, label: optionLabel, type: optionType, icon: optionIcon, disabled: optionDisabled, children } = option;

        const _subParents = optionType === 'sub' ? subParents.concat([option]) : subParents;
        const id = getOptionId(optionId);
        const isFocus = optionId === focusId;
        const isEmpty = !(children && children.length > 0);
        const popupState = popupIds.find((v) => v.id === optionId);

        const handleItemClick = () => {
          onOptionClick?.(optionId, option);

          setFocusIds(subParents.map((o) => o.id).concat([optionId]));
          if (dCloseOnClick) {
            changeVisible(false);
          }
        };

        if (isFocus) {
          handleKeyDown = (e) => {
            const sameLevelOptions = getOptions(nth(subParents, -1)?.children ?? dOptions);
            const focusOption = (o?: T) => {
              if (o) {
                setFocusIds(subParents.map((o) => o.id).concat([o.id]));
              }
            };
            const scrollToOption = (o?: T) => {
              if (o) {
                const el = document.getElementById(getOptionId(o.id));
                if (el && ulRef.current) {
                  scrollElementToView(el, ulRef.current, 4);
                }
              }
            };

            switch (e.code) {
              case 'ArrowUp': {
                e.preventDefault();
                const index = sameLevelOptions.findIndex((o) => o.id === optionId);
                const option = nth(sameLevelOptions, index - 1);
                focusOption(option);
                scrollToOption(option);
                if (option && nth(popupIds, -1)?.id === optionId) {
                  setPopupIds(popupIds.slice(0, -1));
                }
                break;
              }

              case 'ArrowDown': {
                e.preventDefault();
                const index = sameLevelOptions.findIndex((o) => o.id === optionId);
                const option = nth(sameLevelOptions, (index + 1) % sameLevelOptions.length);
                focusOption(option);
                scrollToOption(option);
                if (option && nth(popupIds, -1)?.id === optionId) {
                  setPopupIds(popupIds.slice(0, -1));
                }
                break;
              }

              case 'ArrowLeft': {
                e.preventDefault();
                setPopupIds(popupIds.slice(0, -1));
                const ids = subParents.map((item) => item.id);
                if (ids.length > 0) {
                  setFocusIds(ids);
                }
                break;
              }

              case 'ArrowRight':
                e.preventDefault();
                if (optionType === 'sub') {
                  addPopupId(optionId);
                  if (children) {
                    const o = nth(getOptions(children), 0);
                    if (o) {
                      setFocusIds(_subParents.map((o) => o.id).concat([o.id]));
                    }
                  }
                }
                break;

              case 'Home':
                e.preventDefault();
                focusOption(nth(sameLevelOptions, 0));
                if (ulRef.current) {
                  ulRef.current.scrollTop = 0;
                }
                break;

              case 'End':
                e.preventDefault();
                focusOption(nth(sameLevelOptions, -1));
                if (ulRef.current) {
                  ulRef.current.scrollTop = ulRef.current.scrollHeight;
                }
                break;

              case 'Enter':
              case 'Space':
                e.preventDefault();
                if (optionType === 'item') {
                  handleItemClick();
                } else if (optionType === 'sub') {
                  addPopupId(optionId);
                }
                break;

              default:
                break;
            }
          };
        }

        return (
          <React.Fragment key={optionId}>
            {optionType === 'item' ? (
              <DDropdownItem
                dId={id}
                dDisabled={optionDisabled}
                dFocusVisible={isFocusVisible && isFocus}
                dIcon={optionIcon}
                dLevel={level}
                onClick={handleItemClick}
              >
                {optionLabel}
              </DDropdownItem>
            ) : optionType === 'group' ? (
              <DDropdownGroup dId={id} dOptions={children && getNodes(children, level + 1, _subParents)} dEmpty={isEmpty} dLevel={level}>
                {optionLabel}
              </DDropdownGroup>
            ) : (
              <DDropdownSub
                dId={id}
                dDisabled={optionDisabled}
                dFocusVisible={isFocusVisible && isFocus}
                dPopup={children && getNodes(children, 0, _subParents)}
                dPopupVisible={!isUndefined(popupState)}
                dPopupState={popupState?.visible ?? false}
                dEmpty={isEmpty}
                dTrigger={dTrigger}
                dIcon={optionIcon}
                dLevel={level}
                onVisibleChange={(visible) => {
                  if (visible) {
                    if (subParents.length === 0) {
                      setPopupIds([{ id: optionId, visible: true }]);
                    } else {
                      addPopupId(optionId);
                    }
                  } else {
                    removePopupId(optionId);
                  }
                }}
              >
                {optionLabel}
              </DDropdownSub>
            )}
          </React.Fragment>
        );
      });

    return getNodes(dOptions, 0, []);
  })();

  return (
    <DTransition
      dIn={visible}
      dDuring={TTANSITION_DURING}
      onEnterRendered={updatePosition}
      afterEnter={() => {
        afterVisibleChange?.(true);
      }}
      afterLeave={() => {
        afterVisibleChange?.(false);
      }}
    >
      {(state) => {
        let transitionStyle: React.CSSProperties = {};
        switch (state) {
          case 'enter':
            transitionStyle = { transform: 'scaleY(0.7)', opacity: 0 };
            break;

          case 'entering':
            transitionStyle = {
              transition: `transform ${TTANSITION_DURING}ms ease-out, opacity ${TTANSITION_DURING}ms ease-out`,
              transformOrigin,
            };
            break;

          case 'leaving':
            transitionStyle = {
              transform: 'scaleY(0.7)',
              opacity: 0,
              transition: `transform ${TTANSITION_DURING}ms ease-in, opacity ${TTANSITION_DURING}ms ease-in`,
              transformOrigin,
            };
            break;

          case 'leaved':
            transitionStyle = { display: 'none' };
            break;

          default:
            break;
        }

        return (
          <DPopup
            dVisible={visible}
            dPopup={({ pOnClick, pOnMouseEnter, pOnMouseLeave, ...restPCProps }) => (
              <div
                ref={dropdownRef}
                {...restProps}
                {...restPCProps}
                className={getClassName(className, `${dPrefix}dropdown`)}
                style={{
                  ...style,
                  ...popupPositionStyle,
                  ...transitionStyle,
                  zIndex,
                }}
                onClick={(e) => {
                  onClick?.(e);
                  pOnClick?.();
                }}
                onMouseEnter={(e) => {
                  onMouseEnter?.(e);
                  pOnMouseEnter?.();
                }}
                onMouseLeave={(e) => {
                  onMouseLeave?.(e);
                  pOnMouseLeave?.();
                }}
                onMouseDown={(e) => {
                  onMouseDown?.(e);

                  preventBlur(e);
                }}
                onMouseUp={(e) => {
                  onMouseUp?.(e);

                  preventBlur(e);
                }}
              >
                <ul
                  ref={ulRef}
                  id={_id}
                  className={`${dPrefix}dropdown__list`}
                  tabIndex={-1}
                  role="menu"
                  aria-labelledby={buttonId}
                  aria-activedescendant={isUndefined(focusId) ? undefined : getOptionId(focusId)}
                >
                  {dOptions.length === 0 ? <div className={`${dPrefix}dropdown__empty`}>{t('No Data')}</div> : optionNodes}
                </ul>
                {dArrow && <div className={`${dPrefix}dropdown__arrow`} style={arrowPosition}></div>}
              </div>
            )}
            dContainer={containerEl}
            dTrigger={dTrigger}
            onVisibleChange={changeVisible}
            onUpdate={updatePosition}
          >
            {({ pOnClick, pOnFocus, pOnBlur, pOnMouseEnter, pOnMouseLeave, ...restPCProps }) =>
              React.cloneElement<React.HTMLAttributes<HTMLElement>>(children, {
                ...children.props,
                ...restPCProps,
                id: buttonId,
                tabIndex: 0,
                role: 'button',
                'aria-haspopup': 'menu',
                'aria-expanded': visible,
                'aria-controls': _id,
                onClick: (e) => {
                  children.props.onClick?.(e);
                  pOnClick?.();
                },
                onFocus: (e) => {
                  children.props.onFocus?.(e);
                  pOnFocus?.();
                  fvOnFocus();

                  setIsFocus(true);
                  initFocus();
                },
                onBlur: (e) => {
                  children.props.onBlur?.(e);
                  pOnBlur?.();
                  fvOnBlur();

                  setIsFocus(false);
                  changeVisible(false);
                },
                onKeyDown: (e) => {
                  children.props.onKeyDown?.(e);
                  fvOnKeyDown(e);

                  if (visible) {
                    handleKeyDown?.(e);
                  } else if (e.code === 'Enter' || e.code === 'Space') {
                    e.preventDefault();
                    changeVisible(true);
                  }
                },
                onMouseEnter: (e) => {
                  children.props.onMouseEnter?.(e);
                  pOnMouseEnter?.();
                },
                onMouseLeave: (e) => {
                  children.props.onMouseLeave?.(e);
                  pOnMouseLeave?.();
                },
              })
            }
          </DPopup>
        );
      }}
    </DTransition>
  );
}

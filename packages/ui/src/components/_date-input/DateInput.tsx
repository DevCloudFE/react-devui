import type { DCloneHTMLElement, DSize } from '../../utils/types';
import type { DFormControl } from '../form';

import { isArray, isNull, isUndefined } from 'lodash';
import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import ReactDOM from 'react-dom';

import { useAsync, useEvent, useEventCallback, useForceUpdate, useForkRef, useImmer, useRefExtra, useResize } from '@react-devui/hooks';
import { CloseCircleFilled, SwapRightOutlined } from '@react-devui/icons';
import { checkNodeExist, getClassName, getOriginalSize, getVerticalSidePosition } from '@react-devui/utils';

import { dayjs } from '../../dayjs';
import { useDValue, useMaxIndex } from '../../hooks';
import { cloneHTMLElement, TTANSITION_DURING_POPUP, WINDOW_SPACE } from '../../utils';
import { DBaseDesign } from '../_base-design';
import { DBaseInput } from '../_base-input';
import { DComboboxKeyboard } from '../_keyboard';
import { DTransition } from '../_transition';
import { useFormControl } from '../form';
import { useGlobalScroll, useLayout, usePrefixConfig, useTranslation } from '../root';
import { deepCompareDate } from './utils';

export interface DDateInputRef {
  updatePosition: () => void;
}

export interface DDateInputProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  children: (props: {
    date: [Date | null, Date | null];
    isFocus: [boolean, boolean];
    changeDate: (date: Date | [Date, Date]) => void;
    renderPopup: DCloneHTMLElement;
  }) => JSX.Element | null;
  dRef:
    | {
        inputLeft?: React.ForwardedRef<HTMLInputElement>;
        inputRight?: React.ForwardedRef<HTMLInputElement>;
      }
    | undefined;
  dClassNamePrefix: string;
  dFormControl: DFormControl | undefined;
  dModel: Date | null | [Date, Date] | undefined;
  dFormat: string;
  dVisible: boolean | undefined;
  dPlacement: 'top' | 'top-left' | 'top-right' | 'bottom' | 'bottom-left' | 'bottom-right';
  dOrder: (date: [Date, Date]) => boolean;
  dPlaceholder: [string, string];
  dSuffix: React.ReactNode | undefined;
  dRange: boolean;
  dSize: DSize | undefined;
  dClearable: boolean;
  dDisabled: boolean;
  dInputRender:
    | [DCloneHTMLElement<React.InputHTMLAttributes<HTMLInputElement>>?, DCloneHTMLElement<React.InputHTMLAttributes<HTMLInputElement>>?]
    | undefined;
  onModelChange: ((date: any) => void) | undefined;
  onVisibleChange: ((visible: boolean) => void) | undefined;
  onUpdatePanel: ((date: Date) => void) | undefined;
  afterVisibleChange: ((visible: boolean) => void) | undefined;
}

function DateInput(props: DDateInputProps, ref: React.ForwardedRef<DDateInputRef>): JSX.Element | null {
  const {
    children,
    dRef,
    dClassNamePrefix,
    dFormControl,
    dModel,
    dFormat,
    dVisible,
    dPlacement,
    dOrder,
    dPlaceholder,
    dSuffix,
    dRange,
    dSize,
    dClearable,
    dDisabled,
    dInputRender,
    onModelChange,
    onVisibleChange,
    onUpdatePanel,
    afterVisibleChange,

    ...restProps
  } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  const { dPageScrollRef, dContentResizeRef } = useLayout();
  //#endregion

  //#region Ref
  const boxRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLElement>(null);
  const inputLeftRef = useRef<HTMLInputElement>(null);
  const inputRightRef = useRef<HTMLInputElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const containerRef = useRefExtra(() => {
    let el = document.getElementById(`${prefix}-root`);
    if (!el) {
      el = document.createElement('div');
      el.id = `${prefix}-root`;
      document.body.appendChild(el);
    }
    return el;
  }, true);
  const combineInputLeftRef = useForkRef(inputLeftRef, dRef?.inputLeft);
  const combineInputRightRef = useForkRef(inputRightRef, dRef?.inputRight);
  //#endregion

  const dataRef = useRef<{
    clearTid?: () => void;
    focusAnother: boolean;
    inputValue: [string, string];
    rangeDate: [Date | null, Date | null];
  }>({
    focusAnother: false,
    inputValue: ['', ''],
    rangeDate: [null, null],
  });

  const prefix = `${dPrefix}${dClassNamePrefix}`;

  const async = useAsync();
  const [t] = useTranslation();
  const forceUpdate = useForceUpdate();

  const [visible, changeVisible] = useDValue<boolean>(false, dVisible, onVisibleChange);

  const formControlInject = useFormControl(dFormControl);
  const [_value, _changeValue] = useDValue<Date | null | [Date, Date]>(
    null,
    dModel,
    onModelChange,
    (a, b) => deepCompareDate(a, b, dFormat),
    formControlInject
  );

  let [valueLeft, valueRight = null] = (isArray(_value) ? _value : [_value, null]) as [Date | null, Date | null];
  if (dRange) {
    if (isNull(_value)) {
      [valueLeft, valueRight] = dataRef.current.rangeDate;
    } else {
      dataRef.current.rangeDate = [null, null];
    }
  }

  const [isFocus, setIsFocus] = useImmer<[boolean, boolean]>([false, false]);
  const handleFocusChange = (focus: boolean, isLeft: boolean) => {
    dataRef.current.clearTid?.();
    if (focus) {
      setIsFocus((draft) => {
        draft.fill(false);
        draft[isLeft ? 0 : 1] = true;
      });
    } else {
      dataRef.current.clearTid = async.setTimeout(() => {
        changeVisible(false);
        setIsFocus([false, false]);
      }, 20);
    }
  };
  if (!isFocus[0]) {
    dataRef.current.inputValue[0] = isNull(valueLeft) ? '' : dayjs(valueLeft).format(dFormat);
  }
  if (!isFocus[1]) {
    dataRef.current.inputValue[1] = isNull(valueRight) ? '' : dayjs(valueRight).format(dFormat);
  }
  const hasFocus = isFocus.some((f) => f);

  const changeValue = (date: Date) => {
    const index = isFocus[0] ? 0 : 1;
    dataRef.current.inputValue[index] = dayjs(date).format(dFormat);
    if (dRange) {
      if (isNull(_value)) {
        dataRef.current.rangeDate[index] = date;
        if (dataRef.current.rangeDate.every((v) => !isNull(v))) {
          dataRef.current.focusAnother = dOrder(dataRef.current.rangeDate as [Date, Date]);
          if (dataRef.current.focusAnother) {
            dataRef.current.rangeDate.reverse();
            dataRef.current.inputValue.reverse();
          }
          _changeValue(dataRef.current.rangeDate as [Date, Date]);
        }
      } else {
        _changeValue((draft) => {
          (draft as [Date, Date])[index] = date;
          dataRef.current.focusAnother = dOrder(draft as [Date, Date]);
          if (dataRef.current.focusAnother) {
            (draft as [Date, Date]).reverse();
            dataRef.current.inputValue.reverse();
          }
        });
      }
    } else {
      _changeValue(date);
    }
    forceUpdate();
  };

  const clearable = dClearable && !visible && !dDisabled;

  const maxZIndex = useMaxIndex(visible);

  const [popupPositionStyle, setPopupPositionStyle] = useState<React.CSSProperties>({
    top: -9999,
    left: -9999,
  });
  const [transformOrigin, setTransformOrigin] = useState<string>();
  const updatePosition = useEventCallback(() => {
    if (visible && boxRef.current && popupRef.current) {
      const { height } = getOriginalSize(popupRef.current);
      const maxWidth = window.innerWidth - WINDOW_SPACE * 2;
      const width = Math.min(popupRef.current.scrollWidth, maxWidth);
      const { top, left, transformOrigin } = getVerticalSidePosition(
        boxRef.current,
        { width, height },
        {
          placement: dPlacement,
          inWindow: WINDOW_SPACE,
        }
      );
      setPopupPositionStyle({
        top,
        left,
        maxWidth,
      });
      setTransformOrigin(transformOrigin);
    }
  });

  const globalScroll = useGlobalScroll(updatePosition, !visible);
  useEvent(dPageScrollRef, 'scroll', updatePosition, { passive: true }, !visible || globalScroll);

  useResize(boxRef, updatePosition, !visible);
  useResize(popupRef, updatePosition, !visible);
  useResize(dContentResizeRef, updatePosition, !visible);

  useEffect(() => {
    if (boxRef.current && indicatorRef.current) {
      let focus = false;
      const boxRect = boxRef.current.getBoundingClientRect();
      if (inputLeftRef.current && document.activeElement === inputLeftRef.current) {
        const rect = inputLeftRef.current.getBoundingClientRect();
        indicatorRef.current.style.cssText = `left:${rect.left - boxRect.left}px;width:${rect.width}px;opacity:1;`;
        focus = true;
      }
      if (inputRightRef.current && document.activeElement === inputRightRef.current) {
        const rect = inputRightRef.current.getBoundingClientRect();
        indicatorRef.current.style.cssText = `left:${rect.left - boxRect.left}px;width:${rect.width}px;opacity:1;`;
        focus = true;
      }
      if (!focus) {
        indicatorRef.current.style.cssText += 'opacity:0;';
      }
    }
  });

  useEffect(() => {
    if (dataRef.current.focusAnother && document.activeElement) {
      const el = document.activeElement.parentElement as HTMLElement;
      for (let index = 0; index < el.childElementCount; index++) {
        const element = el.children.item(index) as HTMLElement;
        if (element.tagName.toLowerCase() === 'input' && element !== document.activeElement) {
          element.focus({ preventScroll: true });
          break;
        }
      }
    }
    dataRef.current.focusAnother = false;
  });

  const preventBlur: React.MouseEventHandler = (e) => {
    if (e.target !== inputLeftRef.current && e.target !== inputRightRef.current && e.button === 0) {
      e.preventDefault();
    }
  };

  useImperativeHandle(
    ref,
    () => ({
      updatePosition,
    }),
    [updatePosition]
  );

  const getInputNode = (isLeft: boolean) => (
    <DComboboxKeyboard
      dVisible={visible}
      dEditable
      dHasSub={false}
      onVisibleChange={changeVisible}
      onFocusChange={() => {
        // Only for popup open/close
      }}
    >
      {({ render: renderComboboxKeyboard }) => (
        <DBaseInput dFormControl={dFormControl} dLabelFor={isLeft}>
          {({ render: renderBaseInput }) => {
            const index = isLeft ? 0 : 1;
            const value = isLeft ? valueLeft : valueRight;
            const inputRender = (dInputRender ?? [])[index];
            const input = renderComboboxKeyboard(
              renderBaseInput(
                <input
                  ref={isLeft ? combineInputLeftRef : combineInputRightRef}
                  className={`${prefix}__input`}
                  type="text"
                  autoComplete="off"
                  value={dataRef.current.inputValue[index]}
                  placeholder={dPlaceholder[index]}
                  disabled={dDisabled}
                  onChange={(e) => {
                    const val = e.currentTarget.value;
                    dataRef.current.inputValue[index] = val;
                    if (dayjs(val, dFormat, true).isValid()) {
                      const date = dayjs(val, dFormat).toDate();
                      onUpdatePanel?.(date);
                      changeValue(date);
                    }
                    forceUpdate();
                  }}
                  onKeyDown={(e) => {
                    if (e.code === 'Enter') {
                      if (dayjs(dataRef.current.inputValue[index], dFormat, true).isValid()) {
                        if (dRange) {
                          if (isNull(isLeft ? valueRight : valueLeft)) {
                            dataRef.current.focusAnother = true;
                          } else {
                            changeVisible(false);
                          }
                        } else {
                          changeVisible(false);
                        }
                      } else {
                        dataRef.current.inputValue[index] = isNull(value) ? '' : dayjs(value).format(dFormat);
                      }
                      forceUpdate();
                    }
                  }}
                  onFocus={() => {
                    if (value && isFocus[isLeft ? 1 : 0]) {
                      onUpdatePanel?.(value);
                    }

                    handleFocusChange(true, isLeft);
                  }}
                  onBlur={() => {
                    handleFocusChange(false, isLeft);
                  }}
                />
              )
            );

            return isUndefined(inputRender) ? input : inputRender(input);
          }}
        </DBaseInput>
      )}
    </DComboboxKeyboard>
  );

  return (
    <>
      <DBaseDesign
        dComposeDesign={{
          active: hasFocus,
          disabled: dDisabled,
        }}
        dFormDesign={{
          control: dFormControl,
        }}
      >
        {({ render: renderBaseDesign }) =>
          renderBaseDesign(
            <div
              {...restProps}
              ref={boxRef}
              className={getClassName(restProps.className, prefix, {
                [`${prefix}--${dSize}`]: dSize,
                'is-disabled': dDisabled,
                'is-focus': hasFocus,
              })}
              onMouseDown={(e) => {
                restProps.onMouseDown?.(e);

                preventBlur(e);
              }}
              onMouseUp={(e) => {
                restProps.onMouseUp?.(e);

                preventBlur(e);
              }}
              onClick={(e) => {
                restProps.onClick?.(e);

                changeVisible(true);
                if (!hasFocus) {
                  inputLeftRef.current?.focus({ preventScroll: true });
                }
              }}
            >
              {getInputNode(true)}
              {dRange && (
                <>
                  <div ref={indicatorRef} className={`${prefix}__indicator`}></div>
                  <SwapRightOutlined className={`${prefix}__separator`} />
                  {getInputNode(false)}
                </>
              )}
              {clearable && (
                <div
                  className={`${prefix}__clear`}
                  role="button"
                  aria-label={t('Clear')}
                  onClick={(e) => {
                    e.stopPropagation();

                    _changeValue(null);
                  }}
                >
                  <CloseCircleFilled />
                </div>
              )}
              {checkNodeExist(dSuffix) && (
                <div className={`${prefix}__icon`} style={{ opacity: clearable ? 0 : 1 }}>
                  {dSuffix}
                </div>
              )}
            </div>
          )
        }
      </DBaseDesign>
      {containerRef.current &&
        ReactDOM.createPortal(
          <DTransition
            dIn={visible}
            dDuring={TTANSITION_DURING_POPUP}
            onEnter={updatePosition}
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
                    transition: ['transform', 'opacity'].map((attr) => `${attr} ${TTANSITION_DURING_POPUP}ms ease-out`).join(', '),
                    transformOrigin,
                  };
                  break;

                case 'leaving':
                  transitionStyle = {
                    transform: 'scaleY(0.7)',
                    opacity: 0,
                    transition: ['transform', 'opacity'].map((attr) => `${attr} ${TTANSITION_DURING_POPUP}ms ease-in`).join(', '),
                    transformOrigin,
                  };
                  break;

                case 'leaved':
                  transitionStyle = { display: 'none' };
                  break;

                default:
                  break;
              }

              return children({
                date: dRange ? (isNull(_value) ? dataRef.current.rangeDate : (_value as [Date, Date])) : [valueLeft, null],
                isFocus,
                changeDate: (date) => {
                  if (isArray(date)) {
                    dataRef.current.inputValue = date.map((d) => dayjs(d).format(dFormat)) as [string, string];
                    _changeValue(date);
                  } else {
                    changeValue(date);
                  }
                },
                renderPopup: (el) =>
                  cloneHTMLElement(el, {
                    ref: popupRef,
                    style: {
                      ...el.props.style,
                      ...popupPositionStyle,
                      zIndex: maxZIndex,
                      ...transitionStyle,
                    },
                    onMouseDown: (e) => {
                      el.props.onMouseDown?.(e);

                      preventBlur(e);
                    },
                    onMouseUp: (e) => {
                      el.props.onMouseUp?.(e);

                      preventBlur(e);
                    },
                  }),
              });
            }}
          </DTransition>,
          containerRef.current
        )}
    </>
  );
}

export const DDateInput = React.forwardRef(DateInput);

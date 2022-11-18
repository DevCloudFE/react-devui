import type { DCloneHTMLElement } from '../../utils/types';
import type { DFormControl } from '../form';
import type { DTooltipRef } from '../tooltip';

import { isArray, isNull, isNumber, isUndefined, toNumber } from 'lodash';
import { useEffect, useState, useRef } from 'react';

import { useEvent, useRefExtra } from '@react-devui/hooks';
import { getClassName } from '@react-devui/utils';

import { useGeneralContext, useDValue } from '../../hooks';
import { registerComponentMate } from '../../utils';
import { DBaseInput } from '../_base-input';
import { useFormControl } from '../form';
import { useComponentConfig, usePrefixConfig } from '../root';
import { DTooltip } from '../tooltip';

export interface DSliderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dRef?: {
    inputLeft?: React.ForwardedRef<HTMLInputElement>;
    inputRight?: React.ForwardedRef<HTMLInputElement>;
  };
  dFormControl?: DFormControl;
  dModel?: number | [number, number];
  dMax?: number;
  dMin?: number;
  dStep?: number | null;
  dDisabled?: boolean;
  dMarks?: number | ({ value: number; label: React.ReactNode } | number)[];
  dVertical?: boolean;
  dReverse?: boolean;
  dRange?: boolean;
  dRangeMinDistance?: number;
  dRangeThumbDraggable?: boolean;
  dTooltipVisible?: boolean | [boolean?, boolean?];
  dCustomTooltip?: (value: number) => React.ReactNode;
  dInputRender?: [
    DCloneHTMLElement<React.InputHTMLAttributes<HTMLInputElement>>?,
    DCloneHTMLElement<React.InputHTMLAttributes<HTMLInputElement>>?
  ];
  onModelChange?: (value: any) => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DSlider' as const });
export function DSlider(props: DSliderProps): JSX.Element | null {
  const {
    dRef,
    dFormControl,
    dModel,
    dMax = 100,
    dMin = 0,
    dStep = 1,
    dDisabled = false,
    dMarks,
    dTooltipVisible,
    dRange = false,
    dRangeMinDistance,
    dRangeThumbDraggable = false,
    dVertical = false,
    dReverse = false,
    dCustomTooltip,
    dInputRender,
    onModelChange,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gDisabled } = useGeneralContext();
  //#endregion

  //#region Ref
  const sliderRef = useRef<HTMLDivElement>(null);
  const dotLeftRef = useRef<HTMLDivElement>(null);
  const dotRightRef = useRef<HTMLDivElement>(null);
  const tooltipLeftRef = useRef<DTooltipRef>(null);
  const tooltipRightRef = useRef<DTooltipRef>(null);
  const windowRef = useRefExtra(() => window);
  //#endregion

  const [focusDot, setFocusDot] = useState<'left' | 'right' | null>(null);
  const [mouseenterDot, setMouseenterDot] = useState<'left' | 'right' | null>(null);
  const [draggableDot, setDraggableDot] = useState<'left' | 'right' | null>(null);
  const [thumbPoint, setThumbPoint] = useState<{ left: number; right: number; clientX: number; clientY: number } | null>(null);

  const formControlInject = useFormControl(dFormControl);
  const [_value, changeValue] = useDValue<number | [number, number]>(
    dRange ? [0, 0] : 0,
    dModel,
    onModelChange,
    (a, b) => {
      if (isNumber(a) && isNumber(b)) {
        return a === b;
      } else if (isArray(a) && isArray(b)) {
        return a[0] === b[0] && a[1] === b[1];
      }
      return false;
    },
    formControlInject
  );

  const [valueLeft, valueRight = 0] = (dRange ? _value : [_value]) as [number, number?];
  const disabled = dDisabled || gDisabled || dFormControl?.control.disabled;

  const [visibleLeft, visibleRight] = [
    (dRange ? dTooltipVisible?.[0] : dTooltipVisible) ?? (mouseenterDot === 'left' ? true : !!(focusDot === 'left' || thumbPoint)),
    (dRange ? dTooltipVisible?.[1] : undefined) ?? (mouseenterDot === 'right' ? true : !!(focusDot === 'right' || thumbPoint)),
  ];

  const preventBlur: React.MouseEventHandler = (e) => {
    if (e.button === 0) {
      e.preventDefault();
    }
  };

  const getValue = (value: number, func: 'round' | 'ceil' | 'floor' = 'round') => {
    let newValue: number | null = null;
    if (dStep) {
      const n = Math[func](value / dStep);
      newValue = Math.min(dMax, Math.max(dMin, n * dStep));
    }

    if (isArray(dMarks)) {
      let min = newValue ? Math.abs(newValue - value) : Infinity;
      if (min > 0) {
        for (const mark of dMarks) {
          const v: number = isNumber(mark) ? mark : mark.value;
          if (func === 'round' || (func === 'ceil' && v - value >= 0) || (func === 'floor' && v - value <= 0)) {
            const offset = Math.abs(v - value);
            if (offset < min) {
              min = offset;
              newValue = v;
            }
          }
        }
      }
    }

    return newValue ?? dMin;
  };

  const handleMove = (e: { clientX: number; clientY: number }, isLeft?: boolean) => {
    isLeft = isLeft ?? focusDot === 'left';
    if (sliderRef.current) {
      const rect = sliderRef.current.getBoundingClientRect();
      const newValue = getValue(
        (dMax - dMin) *
          (dVertical
            ? (dReverse ? e.clientY - rect.top : rect.bottom - e.clientY) / rect.height
            : (dReverse ? rect.right - e.clientX : e.clientX - rect.left) / rect.width)
      );

      if (dRange) {
        changeValue((draft) => {
          const index = isLeft ? 0 : 1;
          if (draft[index] !== newValue) {
            const offset = newValue - draft[index];
            const isAdd = offset > 0;
            draft[index] = newValue;
            if (isNumber(dRangeMinDistance) && draft[1] - draft[0] < dRangeMinDistance) {
              const _index = isLeft ? 1 : 0;
              draft[_index] = getValue(draft[_index] + offset, isAdd ? 'ceil' : 'floor');
              if (draft[1] - draft[0] < dRangeMinDistance) {
                draft[index] = getValue(draft[_index] + (isAdd ? -dRangeMinDistance : dRangeMinDistance), isAdd ? 'floor' : 'ceil');
              }
            }
          }
        });
      } else {
        changeValue(newValue);
      }
    }
  };

  const handleThumbMove = (e: { clientX: number; clientY: number }) => {
    if (dStep && thumbPoint && sliderRef.current) {
      const rect = sliderRef.current.getBoundingClientRect();
      const offset =
        Math.round(
          ((dMax - dMin) *
            (dVertical
              ? (dReverse ? e.clientY - thumbPoint.clientY : thumbPoint.clientY - e.clientY) / rect.height
              : (dReverse ? thumbPoint.clientX - e.clientX : e.clientX - thumbPoint.clientX) / rect.width)) /
            dStep
        ) * dStep;
      const value: [number, number] = [0, 0];
      let index = -1;

      for (const v of [thumbPoint.left + offset, thumbPoint.right + offset]) {
        index += 1;
        const _index = index === 0 ? 1 : 0;
        if (v < dMin) {
          value[index] = dMin;
          value[_index] = dMin + Math.abs(thumbPoint.left - thumbPoint.right);
          break;
        }
        if (v > dMax) {
          value[index] = dMax;
          value[_index] = dMax - Math.abs(thumbPoint.left - thumbPoint.right);
          break;
        }
        value[index] = v;
      }

      changeValue(value);
    }
  };

  const startDrag = (e: { clientX: number; clientY: number }) => {
    const handle = (isLeft = true) => {
      const el = isLeft ? dotLeftRef.current : dotRightRef.current;
      if (el) {
        handleMove(e, isLeft);
        setDraggableDot(isLeft ? 'left' : 'right');
        (el.firstElementChild as HTMLElement).focus({ preventScroll: true });
      }
    };
    if (dRange) {
      if (dotLeftRef.current && dotRightRef.current) {
        const rectLeft = dotLeftRef.current.getBoundingClientRect();
        const rectRight = dotRightRef.current.getBoundingClientRect();
        const offsetLeft = dVertical
          ? Math.abs(rectLeft.bottom - rectLeft.height / 2 - e.clientY)
          : Math.abs(e.clientX - (rectLeft.left + rectLeft.width / 2));
        const offsetRight = dVertical
          ? Math.abs(rectRight.bottom - rectRight.height / 2 - e.clientY)
          : Math.abs(e.clientX - (rectRight.left + rectRight.width / 2));

        if (
          dRangeThumbDraggable &&
          (dVertical ? e.clientY < Math.max(rectLeft.top, rectRight.top) : e.clientX > Math.min(rectLeft.right, rectRight.right)) &&
          (dVertical ? e.clientY > Math.min(rectLeft.bottom, rectRight.bottom) : e.clientX < Math.max(rectLeft.left, rectRight.left))
        ) {
          setThumbPoint({ left: valueLeft, right: valueRight, clientX: e.clientX, clientY: e.clientY });
        } else {
          if (offsetRight <= offsetLeft) {
            handle(false);
          } else {
            handle(true);
          }
        }
      }
    } else {
      handle(true);
    }
  };

  useEffect(() => {
    if (thumbPoint) {
      tooltipLeftRef.current?.updatePosition();
      tooltipRightRef.current?.updatePosition();
    } else {
      if (focusDot === 'left') {
        tooltipLeftRef.current?.updatePosition();
      } else if (focusDot === 'right') {
        tooltipRightRef.current?.updatePosition();
      }
    }
  }, [focusDot, _value, thumbPoint]);

  const listenDragEvent = !isNull(draggableDot) || !isNull(thumbPoint);

  useEvent<TouchEvent>(
    windowRef,
    'touchmove',
    (e) => {
      if (!isNull(draggableDot)) {
        e.preventDefault();

        handleMove({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY });
      }
      if (!isNull(thumbPoint)) {
        e.preventDefault();

        handleThumbMove({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY });
      }
    },
    { passive: false },
    !listenDragEvent
  );
  useEvent<MouseEvent>(
    windowRef,
    'mousemove',
    (e) => {
      if (!isNull(draggableDot)) {
        e.preventDefault();

        handleMove({ clientX: e.clientX, clientY: e.clientY });
      }
      if (!isNull(thumbPoint)) {
        e.preventDefault();

        handleThumbMove({ clientX: e.clientX, clientY: e.clientY });
      }
    },
    {},
    !listenDragEvent
  );
  useEvent(
    windowRef,
    'mouseup',
    () => {
      setDraggableDot(null);
      setThumbPoint(null);
    },
    {},
    !listenDragEvent
  );

  const marks = (() => {
    const marks: React.ReactNode[] = [];
    const getNode = (value: number, label: React.ReactNode = null) => {
      let percentage = (value / (dMax - dMin)) * 100;
      if (dReverse) {
        percentage = 100 - percentage;
      }
      marks.push(
        <div
          key={value}
          className={getClassName(`${dPrefix}slider__mark`, {
            [`${dPrefix}slider__mark--hidden`]: value === dMin || value === dMax,
          })}
          style={{
            left: dVertical ? undefined : `${percentage}%`,
            bottom: dVertical ? `${percentage}%` : undefined,
          }}
        >
          {label && (
            <div
              key={value}
              className={getClassName(`${dPrefix}slider__mark-label`, {
                'is-active': dRange
                  ? value <= Math.max(valueLeft, valueRight) && value >= Math.min(valueLeft, valueRight)
                  : value <= valueLeft,
              })}
            >
              {label}
            </div>
          )}
        </div>
      );
    };
    if (isArray(dMarks)) {
      dMarks.forEach((mark) => {
        const value = isNumber(mark) ? mark : mark.value;
        getNode(value, isNumber(mark) ? null : mark.label);
      });
    } else if (isNumber(dMarks)) {
      for (let index = 0; index < (dMax - dMin) / dMarks; index++) {
        const value = index * dMarks;
        getNode(value);
      }
    }

    return marks;
  })();

  const getDotNode = (isLeft: boolean) => {
    const value = isLeft ? valueLeft : valueRight;

    return (
      <DTooltip
        ref={isLeft ? tooltipLeftRef : tooltipRightRef}
        dVisible={isLeft ? visibleLeft : visibleRight}
        dTitle={dCustomTooltip ? dCustomTooltip(value) : value}
        dPlacement={dVertical ? 'right' : 'top'}
        onVisibleChange={(visible) => {
          setMouseenterDot(visible ? (isLeft ? 'left' : 'right') : null);
        }}
      >
        <div
          ref={isLeft ? dotLeftRef : dotRightRef}
          className={getClassName(`${dPrefix}slider__input-wrapper`, {
            'is-focus': focusDot === (isLeft ? 'left' : 'right'),
          })}
          style={{
            left: dVertical ? undefined : `calc(${value} / ${dMax - dMin} * 100% - 7px)`,
            bottom: dVertical ? `calc(${value} / ${dMax - dMin} * 100% - 7px)` : undefined,
          }}
        >
          <DBaseInput dFormControl={dFormControl} dLabelFor={isLeft}>
            {({ render: renderBaseInput }) => {
              const inputRender = (dInputRender ?? [])[isLeft ? 0 : 1];
              const input = renderBaseInput(
                <input
                  ref={isLeft ? dRef?.inputLeft : dRef?.inputRight}
                  className={`${dPrefix}slider__input`}
                  type="range"
                  value={value}
                  disabled={disabled}
                  max={dMax}
                  min={dMin}
                  step={dStep ?? undefined}
                  aria-orientation={dVertical ? 'vertical' : 'horizontal'}
                  onChange={(e) => {
                    const val = toNumber(e.currentTarget.value);
                    if (dRange) {
                      const index = isLeft ? 0 : 1;
                      changeValue((draft) => {
                        const offset = val - draft[index];
                        const isAdd = offset > 0;
                        draft[index] = val;
                        if (isNumber(dRangeMinDistance) && draft[1] - draft[0] < dRangeMinDistance) {
                          const _index = isLeft ? 1 : 0;
                          draft[_index] = getValue(draft[_index] + offset, isAdd ? 'ceil' : 'floor');
                          if (draft[1] - draft[0] < dRangeMinDistance) {
                            draft[index] = getValue(
                              draft[_index] + (isAdd ? -dRangeMinDistance : dRangeMinDistance),
                              isAdd ? 'floor' : 'ceil'
                            );
                          }
                        }
                      });
                    } else {
                      changeValue(val);
                    }
                  }}
                  onFocus={() => {
                    setFocusDot(isLeft ? 'left' : 'right');
                  }}
                  onBlur={() => {
                    setFocusDot(null);
                  }}
                />
              );

              return isUndefined(inputRender) ? input : inputRender(input);
            }}
          </DBaseInput>
        </div>
      </DTooltip>
    );
  };

  return (
    <div
      {...restProps}
      ref={sliderRef}
      className={getClassName(restProps.className, `${dPrefix}slider`, `${dPrefix}slider--${dVertical ? 'vertical' : 'horizontal'}`, {
        'is-disabled': disabled,
      })}
      onMouseDown={(e) => {
        restProps.onMouseDown?.(e);

        preventBlur(e);
        if (e.button === 0) {
          startDrag(e);
        }
      }}
      onMouseUp={(e) => {
        restProps.onMouseUp?.(e);

        preventBlur(e);
      }}
      onTouchStart={(e) => {
        restProps.onTouchStart?.(e);

        startDrag({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY });
      }}
      onTouchEnd={(e) => {
        restProps.onTouchEnd?.(e);

        setDraggableDot(null);
        setThumbPoint(null);
      }}
    >
      <div
        className={getClassName(`${dPrefix}slider__thumb`, {
          [`${dPrefix}slider__thumb--reverse `]: dReverse,
        })}
      >
        <div
          className={getClassName(`${dPrefix}slider__active-thumb`, {
            [`${dPrefix}slider__active-thumb--draggable`]: dRangeThumbDraggable,
            'is-focus': thumbPoint,
          })}
          style={
            dVertical
              ? {
                  bottom: `calc(${Math.min(valueLeft, valueRight)} / ${dMax - dMin} * 100%)`,
                  top: `calc(${dMax - Math.max(valueLeft, valueRight)} / ${dMax - dMin} * 100%)`,
                }
              : {
                  left: `calc(${Math.min(valueLeft, valueRight)} / ${dMax - dMin} * 100%)`,
                  right: `calc(${dMax - Math.max(valueLeft, valueRight)} / ${dMax - dMin} * 100%)`,
                }
          }
        ></div>
        {getDotNode(true)}
        {dRange && getDotNode(false)}
      </div>
      {marks}
    </div>
  );
}

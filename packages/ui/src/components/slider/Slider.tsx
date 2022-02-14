import type { DUpdater } from '../../hooks/two-way-binding';
import type { DPopupRef } from '../_popup';

import { isArray, isNumber, toNumber } from 'lodash';
import { useEffect, useId, useState } from 'react';
import { useRef } from 'react';

import {
  usePrefixConfig,
  useComponentConfig,
  useGeneralState,
  useTwoWayBinding,
  useAsync,
  useThrottle,
  useRefCallback,
  useEventCallback,
} from '../../hooks';
import { generateComponentMate, getClassName } from '../../utils';
import { DTooltip } from '../tooltip';

export interface DSliderBaseProps extends React.HTMLAttributes<HTMLDivElement> {
  dFormControlName?: string;
  dMax?: number;
  dMin?: number;
  dStep?: number | null;
  dMarks?: number | ({ value: number; label: React.ReactNode } | number)[];
  dVertical?: boolean;
  dReverse?: boolean;
  dDisabled?: boolean;
  dCustomTooltip?: (value: number) => React.ReactNode;
}

export interface DSliderSingleProps extends DSliderBaseProps {
  dModel?: [number, DUpdater<number>?];
  dRange?: false;
  dInputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  dInputRef?: React.Ref<HTMLInputElement>;
  dTooltipVisible?: boolean;
  onModelChange?: (value: number) => void;
}

export interface DSliderRangeProps extends DSliderBaseProps {
  dModel?: [[number, number], DUpdater<[number, number]>?];
  dRange: true;
  dRangeMinDistance?: number;
  dRangeThumbDraggable?: boolean;
  dInputProps?: [React.InputHTMLAttributes<HTMLInputElement>?, React.InputHTMLAttributes<HTMLInputElement>?];
  dInputRef?: [React.Ref<HTMLInputElement>?, React.Ref<HTMLInputElement>?];
  dTooltipVisible?: [boolean?, boolean?];
  onModelChange?: (value: [number, number]) => void;
}

export interface DSliderProps extends DSliderBaseProps {
  dFormControlName?: string;
  dModel?: DSliderSingleProps['dModel'] | DSliderRangeProps['dModel'];
  dInputProps?: DSliderSingleProps['dInputProps'] | DSliderRangeProps['dInputProps'];
  dInputRef?: DSliderSingleProps['dInputRef'] | DSliderRangeProps['dInputRef'];
  dTooltipVisible?: DSliderSingleProps['dTooltipVisible'] | DSliderRangeProps['dTooltipVisible'];
  dRange?: boolean;
  dRangeMinDistance?: number;
  dRangeThumbDraggable?: boolean;
  dDisabled?: boolean;
  onModelChange?: DSliderSingleProps['onModelChange'] | DSliderRangeProps['onModelChange'];
}

const { COMPONENT_NAME } = generateComponentMate('DSlider');
export function DSlider(props: DSliderSingleProps): JSX.Element | null;
export function DSlider(props: DSliderRangeProps): JSX.Element | null;
export function DSlider(props: DSliderProps): JSX.Element | null;
export function DSlider(props: DSliderProps): JSX.Element | null {
  const {
    dFormControlName,
    dModel,
    dMax = 100,
    dMin = 0,
    dStep = 1,
    dMarks,
    dInputProps,
    dInputRef,
    dTooltipVisible,
    dRange = false,
    dRangeMinDistance,
    dRangeThumbDraggable = false,
    dVertical = false,
    dReverse = false,
    dDisabled = false,
    dCustomTooltip,
    onModelChange,
    className,
    onMouseDown,
    onTouchStart,
    onTouchEnd,
    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gDisabled } = useGeneralState();
  //#endregion

  //#region Ref
  const [sliderEl, sliderRef] = useRefCallback<HTMLDivElement>();
  const [dotLeftEl, dotLeftRef] = useRefCallback<HTMLDivElement>();
  const [dotRightEl, dotRightRef] = useRefCallback<HTMLDivElement>();
  const tooltipLeftRef = useRef<DPopupRef>(null);
  const tooltipRightRef = useRef<DPopupRef>(null);
  //#endregion

  const asyncCapture = useAsync();
  const { throttleByAnimationFrame } = useThrottle();

  const uniqueId = useId();

  const [focusDot, setFocusDot] = useState<'left' | 'right' | null>(null);
  const [mouseenterDot, setMouseenterDot] = useState<'left' | 'right' | null>(null);
  const [draggableDot, setDraggableDot] = useState<'left' | 'right' | null>(null);
  const [thumbPoint, setThumbPoint] = useState<{ left: number; right: number; clientX: number; clientY: number } | null>(null);

  const [inputPropsLeft, inputPropsRight] = (dRange ? dInputProps ?? [] : [dInputProps]) as [
    React.InputHTMLAttributes<HTMLInputElement>?,
    React.InputHTMLAttributes<HTMLInputElement>?
  ];
  const [inputRefLeft, inputRefRight] = (dRange ? dInputRef ?? [] : [dInputRef]) as [
    React.Ref<HTMLInputElement>?,
    React.Ref<HTMLInputElement>?
  ];

  const idLeft = inputPropsLeft?.id ?? `${dPrefix}slider-input-left-${uniqueId}`;
  const idRight = inputPropsRight?.id ?? `${dPrefix}slider-input-right-${uniqueId}`;

  const [_value, changeValue, { validateClassName, ariaAttribute, controlDisabled }] = useTwoWayBinding<number | [number, number]>(
    dRange ? [0, 0] : 0,
    dModel,
    onModelChange,
    { formControlName: dFormControlName, id: idLeft, deepCompare: true }
  );

  const [valueLeft, valueRight = 0] = (dRange ? _value : [_value]) as [number, number?];
  const disabled = dDisabled || gDisabled || controlDisabled;

  const [visibleLeft, visibleRight] = [
    (dRange ? dTooltipVisible?.[0] : dTooltipVisible) ?? (mouseenterDot === 'left' ? true : !!(focusDot === 'left' || thumbPoint)),
    (dRange ? dTooltipVisible?.[1] : undefined) ?? (mouseenterDot === 'right' ? true : !!(focusDot === 'right' || thumbPoint)),
  ];

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

  const handleMove = useEventCallback((e: { clientX: number; clientY: number }, isLeft?: boolean) => {
    isLeft = isLeft ?? focusDot === 'left';
    if (sliderEl) {
      const rect = sliderEl.getBoundingClientRect();
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
  });

  const handleThumbMove = useEventCallback((e: { clientX: number; clientY: number }) => {
    if (dStep && thumbPoint && sliderEl) {
      const rect = sliderEl.getBoundingClientRect();
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
  });

  const startDrag = (e: { clientX: number; clientY: number }) => {
    const handle = (isLeft = true) => {
      const el = isLeft ? dotLeftEl : dotRightEl;
      if (el) {
        handleMove(e, isLeft);
        setDraggableDot(isLeft ? 'left' : 'right');
        (el.firstElementChild as HTMLElement).focus({ preventScroll: true });
      }
    };
    if (dRange) {
      if (dotLeftEl && dotRightEl) {
        const rectLeft = dotLeftEl.getBoundingClientRect();
        const rectRight = dotRightEl.getBoundingClientRect();
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, isLeft = true) => {
    if (dRange) {
      const index = isLeft ? 0 : 1;
      const newValue = toNumber(e.currentTarget.value);
      changeValue((draft) => {
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
      });
    } else {
      changeValue(toNumber(e.currentTarget.value));
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

  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();

    if (draggableDot !== null) {
      let clientX: number;
      let clientY: number;

      asyncGroup.fromEvent<MouseEvent>(window, 'mouseup', { capture: true }).subscribe({
        next: (e) => {
          e.preventDefault();

          setDraggableDot(null);
        },
      });

      asyncGroup.fromEvent<TouchEvent>(window, 'touchmove', { capture: true, passive: false }).subscribe({
        next: (e) => {
          e.preventDefault();

          clientY = e.touches[0].clientY;
          clientX = e.touches[0].clientX;

          throttleByAnimationFrame.run(() => {
            handleMove({ clientX, clientY });
          });
        },
      });

      asyncGroup.fromEvent<MouseEvent>(window, 'mousemove', { capture: true }).subscribe({
        next: (e) => {
          e.preventDefault();
          clientX = e.clientX;
          clientY = e.clientY;

          throttleByAnimationFrame.run(() => {
            handleMove({ clientX, clientY });
          });
        },
      });
    }

    return () => {
      asyncCapture.deleteGroup(asyncId);
    };
  }, [asyncCapture, draggableDot, handleMove, throttleByAnimationFrame]);

  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();

    if (thumbPoint) {
      let clientX: number;
      let clientY: number;

      asyncGroup.fromEvent<MouseEvent>(window, 'mouseup', { capture: true }).subscribe({
        next: (e) => {
          e.preventDefault();

          setThumbPoint(null);
        },
      });

      asyncGroup.fromEvent<TouchEvent>(window, 'touchmove', { capture: true, passive: false }).subscribe({
        next: (e) => {
          e.preventDefault();

          clientY = e.touches[0].clientY;
          clientX = e.touches[0].clientX;

          throttleByAnimationFrame.run(() => {
            handleThumbMove({ clientX, clientY });
          });
        },
      });

      asyncGroup.fromEvent<MouseEvent>(window, 'mousemove', { capture: true }).subscribe({
        next: (e) => {
          e.preventDefault();
          clientX = e.clientX;
          clientY = e.clientY;

          throttleByAnimationFrame.run(() => {
            handleThumbMove({ clientX, clientY });
          });
        },
      });
    }

    return () => {
      asyncCapture.deleteGroup(asyncId);
    };
  }, [asyncCapture, handleThumbMove, throttleByAnimationFrame, thumbPoint]);

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

  const handleMouseDown: React.MouseEventHandler<HTMLDivElement> = (e) => {
    onMouseDown?.(e);

    if (e.button === 0 && !disabled) {
      e.preventDefault();

      startDrag(e);
    }
  };

  const handleTouchStart: React.TouchEventHandler<HTMLDivElement> = (e) => {
    onTouchStart?.(e);

    startDrag({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY });
  };

  const handleTouchEnd: React.TouchEventHandler<HTMLDivElement> = (e) => {
    onTouchEnd?.(e);

    setDraggableDot(null);
    setThumbPoint(null);
  };

  return (
    <div
      {...restProps}
      ref={sliderRef}
      className={getClassName(
        className,
        validateClassName,
        `${dPrefix}slider`,
        `${dPrefix}slider--${dVertical ? 'vertical' : 'horizontal'}`,
        {
          'is-disabled': disabled,
        }
      )}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
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
        <DTooltip
          ref={tooltipLeftRef}
          dVisible={[visibleLeft]}
          dTitle={dCustomTooltip ? dCustomTooltip(valueLeft) : valueLeft}
          dPlacement={dVertical ? 'right' : 'top'}
          onVisibleChange={(visible) => {
            setMouseenterDot(visible ? 'left' : null);
          }}
        >
          <div
            ref={dotLeftRef}
            className={getClassName(`${dPrefix}slider__input-wrapper`, {
              'is-focus': focusDot === 'left',
            })}
            style={{
              left: dVertical ? undefined : `calc(${valueLeft} / ${dMax - dMin} * 100% - 7px)`,
              bottom: dVertical ? `calc(${valueLeft} / ${dMax - dMin} * 100% - 7px)` : undefined,
            }}
          >
            <input
              {...inputPropsLeft}
              {...ariaAttribute}
              ref={inputRefLeft}
              id={idLeft}
              className={getClassName(inputPropsLeft?.className, `${dPrefix}slider__input`)}
              type="range"
              value={valueLeft}
              disabled={disabled}
              max={dMax}
              min={dMin}
              step={dStep ?? undefined}
              aria-orientation={dVertical ? 'vertical' : 'horizontal'}
              onChange={handleChange}
              onFocus={(e) => {
                inputPropsLeft?.onFocus?.(e);

                setFocusDot('left');
              }}
              onBlur={(e) => {
                inputPropsLeft?.onBlur?.(e);

                setFocusDot(null);
              }}
            ></input>
          </div>
        </DTooltip>
        {dRange && (
          <DTooltip
            ref={tooltipRightRef}
            dVisible={[visibleRight]}
            dTitle={dCustomTooltip ? dCustomTooltip(valueRight) : valueRight}
            dPlacement={dVertical ? 'right' : 'top'}
            onVisibleChange={(visible) => {
              setMouseenterDot(visible ? 'right' : null);
            }}
          >
            <div
              ref={dotRightRef}
              className={getClassName(`${dPrefix}slider__input-wrapper`, {
                'is-focus': focusDot === 'right',
              })}
              style={{
                left: dVertical ? undefined : `calc(${valueRight} / ${dMax - dMin} * 100% - 7px)`,
                bottom: dVertical ? `calc(${valueRight} / ${dMax - dMin} * 100% - 7px)` : undefined,
              }}
            >
              <input
                {...inputPropsRight}
                {...ariaAttribute}
                ref={inputRefRight}
                id={idRight}
                className={getClassName(inputPropsRight?.className, `${dPrefix}slider__input`)}
                type="range"
                value={valueRight}
                disabled={disabled}
                max={dMax}
                min={dMin}
                step={dStep ?? undefined}
                aria-orientation={dVertical ? 'vertical' : 'horizontal'}
                onChange={(e) => {
                  handleChange(e, false);
                }}
                onFocus={(e) => {
                  inputPropsRight?.onFocus?.(e);

                  setFocusDot('right');
                }}
                onBlur={(e) => {
                  inputPropsRight?.onBlur?.(e);

                  setFocusDot(null);
                }}
              ></input>
            </div>
          </DTooltip>
        )}
      </div>
      {marks}
    </div>
  );
}

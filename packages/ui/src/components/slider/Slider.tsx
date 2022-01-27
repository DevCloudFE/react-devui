import type { Updater } from '../../hooks/two-way-binding';
import type { DPopupRef } from '../_popup';

import { isEqual, isNumber, toNumber } from 'lodash';
import { useCallback, useEffect, useId, useState } from 'react';
import { useRef } from 'react';

import {
  usePrefixConfig,
  useComponentConfig,
  useTranslation,
  useGeneralState,
  useTwoWayBinding,
  useAsync,
  useThrottle,
  useRefCallback,
} from '../../hooks';
import { generateComponentMate, getClassName } from '../../utils';
import { DTooltip } from '../tooltip';

export interface DSliderBaseProps extends React.HTMLAttributes<HTMLDivElement> {
  dFormControlName?: string;
  dMax?: number;
  dMin?: number;
  dStep?: number;
  dDisabled?: boolean;
}

export interface DSliderSingleProps extends DSliderBaseProps {
  dModel?: [number, Updater<number>?];
  dRange?: false;
  dInputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  dInputRef?: React.Ref<HTMLInputElement>;
  onModelChange?: (value: number) => void;
}

export interface DSliderRangeProps extends DSliderBaseProps {
  dModel?: [[number, number], Updater<[number, number]>?];
  dRange: true;
  dRangeDistance?: number;
  dRangeThumbDraggable?: boolean;
  dInputProps?: [React.InputHTMLAttributes<HTMLInputElement>?, React.InputHTMLAttributes<HTMLInputElement>?];
  dInputRef?: [React.Ref<HTMLInputElement>?, React.Ref<HTMLInputElement>?];
  onModelChange?: (value: [number, number]) => void;
}

export interface DSliderProps extends DSliderBaseProps {
  dFormControlName?: string;
  dModel?: DSliderSingleProps['dModel'] | DSliderRangeProps['dModel'];
  dInputProps?: DSliderSingleProps['dInputProps'] | DSliderRangeProps['dInputProps'];
  dInputRef?: DSliderSingleProps['dInputRef'] | DSliderRangeProps['dInputRef'];
  dRange?: boolean;
  dRangeDistance?: number;
  dRangeThumbDraggable?: boolean;
  dDisabled?: boolean;
  onModelChange?: DSliderSingleProps['onModelChange'] | DSliderRangeProps['onModelChange'];
}

const { COMPONENT_NAME } = generateComponentMate('DSlider');
export function DSlider(props: DSliderSingleProps): React.ReactElement;
export function DSlider(props: DSliderRangeProps): React.ReactElement;
export function DSlider(props: DSliderProps): React.ReactElement;
export function DSlider(props: DSliderProps) {
  const {
    dFormControlName,
    dModel,
    dMax = 100,
    dMin = 0,
    dStep = 1,
    dInputProps,
    dInputRef,
    dRange = false,
    dRangeDistance,
    dRangeThumbDraggable = false,
    dDisabled = false,
    onModelChange,
    className,
    onMouseDown,
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

  const [t] = useTranslation('Common');

  const asyncCapture = useAsync();
  const { throttleByAnimationFrame } = useThrottle();

  const uniqueId = useId();

  const [focusDot, setFocusDot] = useState<'left' | 'right' | null>(null);
  const [mouseenterDot, setMouseenterDot] = useState<'left' | 'right' | null>(null);
  const [draggableDot, setDraggableDot] = useState<'left' | 'right' | null>(null);
  const [thumbPoint, setThumbPoint] = useState<{ left: number; right: number; clientX: number } | null>(null);

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

  const [_value, changeValue, { ariaAttribute, controlDisabled }] = useTwoWayBinding<number | [number, number]>(
    dRange ? [0, 0] : 0,
    dModel,
    onModelChange,
    { formControlName: dFormControlName, id: idLeft, deepCompare: true }
  );

  const [valueLeft, valueRight = 0] = (dRange ? _value : [_value]) as [number, number?];
  const disabled = dDisabled || gDisabled || controlDisabled;

  const handleMove = useCallback(
    (e: { clientX: number; clientY: number }, isLeft?: boolean) => {
      isLeft = isLeft ?? focusDot === 'left';
      if (sliderEl) {
        const rect = sliderEl.getBoundingClientRect();

        const offset = Math.min(rect.width, Math.max(0, e.clientX - rect.left));
        const n = Math.round((dMax - dMin) * (offset / rect.width));

        if (dRange) {
          changeValue((draft) => {
            const index = isLeft ? 0 : 1;
            const isAdd = n - draft[index] > 0;
            draft[index] = n;
            if (isNumber(dRangeDistance) && Math.abs(draft[1] - draft[0]) < dRangeDistance) {
              const _index = isLeft ? 1 : 0;
              draft[_index] = draft[index] + (isAdd ? dRangeDistance : -dRangeDistance);
              if (draft[_index] < dMin) {
                draft[_index] = dMin;
                draft[index] = dRangeDistance;
              } else if (draft[_index] > dMax) {
                draft[_index] = dMax;
                draft[index] = dMax - dRangeDistance;
              }
            }
          });
        } else {
          changeValue(n);
        }
      }
    },
    [changeValue, dMax, dMin, dRange, dRangeDistance, focusDot, sliderEl]
  );

  const handleThumbMove = useCallback(
    (e: { clientX: number; clientY: number }) => {
      if (sliderEl && thumbPoint) {
        const rect = sliderEl.getBoundingClientRect();

        const n = Math.round((dMax - dMin) * ((e.clientX - thumbPoint.clientX) / rect.width));
        const value: [number, number] = [0, 0];
        let index = -1;
        for (const v of [thumbPoint.left + n, thumbPoint.right + n]) {
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
    },
    [changeValue, dMax, dMin, sliderEl, thumbPoint]
  );

  const handleMouseDown = useCallback<React.MouseEventHandler<HTMLDivElement>>(
    (e) => {
      onMouseDown?.(e);

      if (e.button === 0 && !disabled) {
        e.preventDefault();

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
            const offsetLeft = Math.abs(e.clientX - (rectLeft.left + rectLeft.width / 2));
            const offsetRight = Math.abs(e.clientX - (rectRight.left + rectRight.width / 2));

            if (
              dRangeThumbDraggable &&
              e.clientX > Math.min(rectLeft.right, rectRight.right) &&
              e.clientX < Math.max(rectLeft.left, rectRight.left)
            ) {
              setThumbPoint({ left: valueLeft, right: valueRight, clientX: e.clientX });
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
      }
    },
    [dRange, dRangeThumbDraggable, disabled, dotLeftEl, dotRightEl, handleMove, onMouseDown, valueLeft, valueRight]
  );

  const handleChange = useCallback(
    (e, isLeft = true) => {
      if (dRange) {
        changeValue((draft) => {
          isLeft ? (draft[0] = toNumber(e.currentTarget.value)) : (draft[1] = toNumber(e.currentTarget.value));
        });
      } else {
        changeValue(toNumber(e.currentTarget.value));
      }
    },
    [changeValue, dRange]
  );

  const handleFocus = useCallback(
    (e, isLeft = true) => {
      (isLeft ? inputPropsLeft : inputPropsRight)?.onFocus?.(e);

      setFocusDot(isLeft ? 'left' : 'right');
    },
    [inputPropsLeft, inputPropsRight]
  );
  const handleBlur = useCallback(
    (e, isLeft = true) => {
      (isLeft ? inputPropsLeft : inputPropsRight)?.onBlur?.(e);

      setFocusDot(null);
    },
    [inputPropsLeft, inputPropsRight]
  );

  const handleVisibleChange = useCallback((visible, isLeft = true) => {
    setMouseenterDot(visible ? (isLeft ? 'left' : 'right') : null);
  }, []);

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

  return (
    <div
      {...restProps}
      ref={sliderRef}
      className={getClassName(className, `${dPrefix}slider`, {
        'is-disabled': disabled,
      })}
      onMouseDown={handleMouseDown}
    >
      <div className={`${dPrefix}slider__thumb`}>
        <div
          className={getClassName(`${dPrefix}slider__active-thumb`, {
            [`${dPrefix}slider__active-thumb--draggable`]: dRangeThumbDraggable,
            'is-focus': thumbPoint,
          })}
          style={{
            left: `calc(${Math.min(valueLeft, valueRight)} / ${dMax - dMin} * 100%)`,
            right: `calc(${dMax - Math.max(valueLeft, valueRight)} / ${dMax - dMin} * 100%)`,
          }}
        ></div>
      </div>
      <DTooltip
        ref={tooltipLeftRef}
        dVisible={[mouseenterDot === 'left' ? true : !!(focusDot === 'left' || thumbPoint)]}
        dTitle={<span className={`${dPrefix}slider__tooltip`}>{valueLeft}</span>}
        onVisibleChange={handleVisibleChange}
      >
        <div
          ref={dotLeftRef}
          className={getClassName(`${dPrefix}slider__input-wrapper`, {
            'is-focus': focusDot === 'left',
          })}
          style={{
            left: `calc(${valueLeft} / ${dMax - dMin} * 100% - 7px)`,
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
            step={dStep}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
          ></input>
        </div>
      </DTooltip>
      {dRange && (
        <DTooltip
          ref={tooltipRightRef}
          dVisible={[mouseenterDot === 'right' ? true : !!(focusDot === 'right' || thumbPoint)]}
          dTitle={<span className={`${dPrefix}slider__tooltip`}>{valueRight}</span>}
          onVisibleChange={(visible) => {
            handleVisibleChange(visible, false);
          }}
        >
          <div
            ref={dotRightRef}
            className={getClassName(`${dPrefix}slider__input-wrapper`, {
              'is-focus': focusDot === 'right',
            })}
            style={{
              left: `calc(${valueRight} / ${dMax - dMin} * 100% - 7px)`,
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
              step={dStep}
              onChange={(e) => {
                handleChange(e, false);
              }}
              onFocus={(e) => {
                handleFocus(e, false);
              }}
              onBlur={(e) => {
                handleBlur(e, false);
              }}
            ></input>
          </div>
        </DTooltip>
      )}
    </div>
  );
}

import type { DId } from '../../utils/types';

import { isBoolean, isNumber, isUndefined, nth } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';

import { useAsync, useEvent, useId, useRefExtra } from '@react-devui/hooks';
import { LeftOutlined, RightOutlined } from '@react-devui/icons';
import { getClassName } from '@react-devui/utils';

import { useDValue } from '../../hooks';
import { registerComponentMate } from '../../utils';
import { useComponentConfig, usePrefixConfig } from '../root';

export interface DSlideItem<ID extends DId> {
  id: ID;
  tooltip?: string;
  content: React.ReactNode;
}

interface DAutoplayOptions {
  delay?: number;
  stopOnLast?: boolean;
  pauseOnMouseEnter?: boolean;
}
interface DPaginationOptions {
  visible?: boolean | 'hover';
  dynamic?: boolean;
}

export interface DSlidesProps<ID extends DId, T extends DSlideItem<ID>> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dList: T[];
  dActive?: ID;
  dAutoplay?: number | DAutoplayOptions;
  dArrow?: boolean | 'hover';
  dPagination?: boolean | 'hover' | DPaginationOptions;
  dEffect?: 'slide' | 'fade';
  dVertical?: boolean;
  onActiveChange?: (id: any, slide: any) => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DSlides' as const });
export function DSlides<ID extends DId, T extends DSlideItem<ID>>(props: DSlidesProps<ID, T>): JSX.Element | null {
  const {
    dList,
    dActive,
    dAutoplay = 0,
    dArrow = 'hover',
    dPagination = true,
    dEffect = 'slide',
    dVertical = false,
    onActiveChange,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const slidesRef = useRef<HTMLDivElement>(null);
  const windowRef = useRefExtra(() => window);
  //#endregion

  const dataRef = useRef<{
    startDragTime: number;
    clearTid?: () => void;
  }>({
    startDragTime: 0,
  });

  const async = useAsync();

  const uniqueId = useId();
  const viewId = `${dPrefix}slides-view-${uniqueId}`;

  const autoplay = Object.assign<DAutoplayOptions, DAutoplayOptions>(
    { delay: 0, stopOnLast: false, pauseOnMouseEnter: true },
    isNumber(dAutoplay) ? { delay: dAutoplay } : dAutoplay
  );
  const pagination = Object.assign<DPaginationOptions, DPaginationOptions>(
    { visible: true, dynamic: false },
    isBoolean(dPagination) ? { visible: dPagination } : dPagination === 'hover' ? { visible: 'hover' } : dPagination
  );

  const [activeId, changeActiveId] = useDValue<ID | undefined, ID>(nth(dList, 0)?.id, dActive, (id) => {
    if (onActiveChange) {
      const slide = dList.find((s) => s.id === id);
      if (slide) {
        onActiveChange(id, slide);
      }
    }
  });

  const [mouseEnter, setMouseEnter] = useState(false);

  const activeIndex = dList.findIndex((s) => s.id === activeId);

  useEffect(() => {
    if (slidesRef.current) {
      let size = 0;
      const slideEls = slidesRef.current.querySelectorAll(`.${dPrefix}slides__slide`);
      slideEls.forEach((el) => {
        const index = Number((el as HTMLDivElement).dataset['index']);
        if (index < activeIndex) {
          size += el[dVertical ? 'clientHeight' : 'clientWidth'];
        } else if (index === activeIndex) {
          slidesRef.current!.style.height = el.clientHeight + 'px';
        }
      });

      const containerEl = slidesRef.current.querySelector(`.${dPrefix}slides__container`) as HTMLDivElement;
      containerEl.style.transform = dEffect === 'slide' ? `translate${dVertical ? 'Y' : 'X'}(calc(-${size}px + ${dragDistance}px))` : '';
    }
  });

  useEffect(() => {
    if (
      autoplay.delay === 0 ||
      (autoplay.stopOnLast && activeIndex === dList.length - 1) ||
      (autoplay.pauseOnMouseEnter && mouseEnter) ||
      listenDragEvent
    ) {
      dataRef.current.clearTid?.();
      dataRef.current.clearTid = undefined;
    } else if (isUndefined(dataRef.current.clearTid)) {
      dataRef.current.clearTid = async.setTimeout(
        () => {
          dataRef.current.clearTid = undefined;
          changeActiveId(dList[(activeIndex + 1) % dList.length].id);
        },
        autoplay.delay,
        () => {
          dataRef.current.clearTid = undefined;
        }
      );
    }
  });

  const [dragStartPosition, setDragStartPosition] = useState<number>();
  const [dragDistance, setDragDistance] = useState(0);
  const [dragOpacity, setDragOpacity] = useState<{ index: number; value: number }>();
  const changeDragDistance = (distance: number) => {
    if (slidesRef.current) {
      const els: HTMLDivElement[] = [];
      const slideEls = slidesRef.current.querySelectorAll(`.${dPrefix}slides__slide`);
      slideEls.forEach((el) => {
        const index = Number((el as HTMLDivElement).dataset['index']);
        els[index] = el as HTMLDivElement;
      });

      if (distance > 0) {
        let size = 0;
        for (let index = activeIndex - 1; index >= 0; index--) {
          size += els[index][dVertical ? 'clientHeight' : 'clientWidth'];
        }
        const distanceValue =
          Math.abs(distance) > size
            ? size +
              Math.sin(
                Math.min((Math.abs(distance) - size) / (els[0][dVertical ? 'clientHeight' : 'clientWidth'] * 3), 1) * (Math.PI / 2)
              ) *
                els[0][dVertical ? 'clientHeight' : 'clientWidth']
            : distance;
        setDragDistance(distanceValue);
        setDragOpacity({
          index: activeIndex,
          value:
            activeIndex === 0
              ? 1
              : Math.max(1 - Math.abs(distanceValue) / els[activeIndex - 1][dVertical ? 'clientHeight' : 'clientWidth'], 0),
        });
      } else {
        let size = 0;
        for (let index = activeIndex + 1; index < dList.length; index++) {
          size += els[index][dVertical ? 'clientHeight' : 'clientWidth'];
        }
        const distanceValue =
          Math.abs(distance) > size
            ? -(
                size +
                Math.sin(
                  Math.min((Math.abs(distance) - size) / (els[dList.length - 1][dVertical ? 'clientHeight' : 'clientWidth'] * 3), 1) *
                    (Math.PI / 2)
                ) *
                  els[dList.length - 1][dVertical ? 'clientHeight' : 'clientWidth']
              )
            : distance;
        setDragDistance(distanceValue);
        setDragOpacity({
          index: Math.min(activeIndex + 1, dList.length - 1),
          value:
            activeIndex === dList.length - 1
              ? 1
              : Math.min(Math.abs(distanceValue) / els[activeIndex + 1][dVertical ? 'clientHeight' : 'clientWidth'], 1),
        });
      }
    }
  };
  const handleDragEnd = () => {
    if (slidesRef.current) {
      const els: HTMLDivElement[] = [];
      const slideEls = slidesRef.current.querySelectorAll(`.${dPrefix}slides__slide`);
      slideEls.forEach((el) => {
        const index = Number((el as HTMLDivElement).dataset['index']);
        els[index] = el as HTMLDivElement;
      });

      if (dragDistance > 0) {
        let newIndex = activeIndex;
        let size = 0;
        for (let index = activeIndex - 1; index >= 0; index--) {
          if (Math.abs(dragDistance) > size + els[index][dVertical ? 'clientHeight' : 'clientWidth'] / 2) {
            size += els[index][dVertical ? 'clientHeight' : 'clientWidth'];
            newIndex = index;
          } else {
            break;
          }
        }
        if (newIndex === activeIndex) {
          if (performance.now() - dataRef.current.startDragTime < 300 && Math.abs(dragDistance) > 30) {
            changeActiveId(dList[Math.max(newIndex - 1, 0)].id);
          }
        } else {
          changeActiveId(dList[newIndex].id);
        }
      } else {
        let newIndex = activeIndex;
        let size = 0;
        for (let index = activeIndex + 1; index < dList.length; index++) {
          if (Math.abs(dragDistance) > size + els[index][dVertical ? 'clientHeight' : 'clientWidth'] / 2) {
            size += els[index][dVertical ? 'clientHeight' : 'clientWidth'];
            newIndex = index;
          } else {
            break;
          }
        }
        if (newIndex === activeIndex) {
          if (performance.now() - dataRef.current.startDragTime < 300 && Math.abs(dragDistance) > 30) {
            changeActiveId(dList[Math.min(newIndex + 1, dList.length - 1)].id);
          }
        } else {
          changeActiveId(dList[newIndex].id);
        }
      }
    }
    setDragStartPosition(undefined);
    setDragDistance(0);
    setDragOpacity(undefined);
  };

  const listenDragEvent = !isUndefined(dragStartPosition);

  useEvent<TouchEvent>(
    windowRef,
    'touchmove',
    (e) => {
      if (listenDragEvent) {
        e.preventDefault();

        changeDragDistance(e.touches[0][dVertical ? 'clientY' : 'clientX'] - dragStartPosition);
      }
    },
    { passive: false },
    !listenDragEvent
  );
  useEvent<MouseEvent>(
    windowRef,
    'mousemove',
    (e) => {
      if (listenDragEvent) {
        e.preventDefault();

        changeDragDistance(e[dVertical ? 'clientY' : 'clientX'] - dragStartPosition);
      }
    },
    {},
    !listenDragEvent
  );
  useEvent(
    windowRef,
    'mouseup',
    () => {
      handleDragEnd();
    },
    {},
    !listenDragEvent
  );

  return (
    <div
      {...restProps}
      ref={slidesRef}
      className={getClassName(restProps.className, `${dPrefix}slides`, {
        [`${dPrefix}slides--vertical`]: dVertical,
        [`${dPrefix}slides--fade`]: dEffect === 'fade',
      })}
      onMouseEnter={(e) => {
        restProps.onMouseEnter?.(e);

        setMouseEnter(true);
      }}
      onMouseLeave={(e) => {
        restProps.onMouseLeave?.(e);

        setMouseEnter(false);
      }}
    >
      <div
        className={`${dPrefix}slides__container`}
        id={viewId}
        style={{ transition: listenDragEvent ? 'none' : undefined }}
        role="region"
        aria-live="polite"
        onMouseDown={(e) => {
          e.preventDefault();

          if (e.button === 0) {
            setDragStartPosition(e[dVertical ? 'clientY' : 'clientX']);
            dataRef.current.startDragTime = performance.now();
          }
        }}
        onTouchStart={(e) => {
          setDragStartPosition(e.touches[0][dVertical ? 'clientY' : 'clientX']);
          dataRef.current.startDragTime = performance.now();
        }}
        onTouchEnd={() => {
          handleDragEnd();
        }}
      >
        {dList.map((slide, index) => {
          let opacity = index <= activeIndex ? 1 : 0;
          if (listenDragEvent && dragOpacity && dragOpacity.index === index) {
            opacity = dragOpacity.value;
          }

          return (
            <div
              key={slide.id}
              className={`${dPrefix}slides__slide`}
              style={
                dEffect === 'slide'
                  ? undefined
                  : {
                      opacity,
                      transition: listenDragEvent ? 'none' : undefined,
                    }
              }
              aria-hidden={slide.id !== activeId}
              data-index={index}
            >
              {slide.content}
            </div>
          );
        })}
      </div>
      {(dArrow === true || dArrow === 'hover') && (
        <>
          <button
            className={getClassName(`${dPrefix}slides__arrow`, `${dPrefix}slides__arrow--prev`, {
              'is-hidden': dArrow === 'hover' && !mouseEnter,
            })}
            tabIndex={-1}
            disabled={activeIndex === 0}
            onClick={() => {
              changeActiveId(dList[activeIndex - 1].id);
            }}
          >
            <LeftOutlined />
          </button>
          <button
            className={getClassName(`${dPrefix}slides__arrow`, `${dPrefix}slides__arrow--next`, {
              'is-hidden': dArrow === 'hover' && !mouseEnter,
            })}
            tabIndex={-1}
            disabled={activeIndex === dList.length - 1}
            onClick={() => {
              changeActiveId(dList[activeIndex + 1].id);
            }}
          >
            <RightOutlined />
          </button>
        </>
      )}
      {(pagination.visible === true || pagination.visible === 'hover') && (
        <div
          className={getClassName(`${dPrefix}slides__pagination`, {
            [`${dPrefix}slides__pagination--dynamic`]: pagination.dynamic,
            'is-hidden': pagination.visible === 'hover' && !mouseEnter,
          })}
          role="radiogroup"
        >
          {dList.map((slide, index) => {
            const checked = activeId === slide.id;

            return (
              <input
                key={slide.id}
                className={getClassName(`${dPrefix}slides__pagination-radio`, {
                  [`${dPrefix}slides__pagination-radio--prev-1`]: pagination.dynamic && index - activeIndex === -1,
                  [`${dPrefix}slides__pagination-radio--prev-2`]: pagination.dynamic && index - activeIndex === -2,
                  [`${dPrefix}slides__pagination-radio--next-1`]: pagination.dynamic && index - activeIndex === 1,
                  [`${dPrefix}slides__pagination-radio--next-2`]: pagination.dynamic && index - activeIndex === 2,
                  'is-checked': checked,
                })}
                style={{ [dVertical ? 'top' : 'left']: pagination.dynamic ? 40 - 8 - 16 * activeIndex : undefined }}
                type="radio"
                value={slide.id}
                checked={checked}
                name={uniqueId}
                title={slide.tooltip}
                aria-checked={checked}
                aria-controls={viewId}
                onChange={() => {
                  changeActiveId(slide.id);
                }}
              ></input>
            );
          })}
        </div>
      )}
    </div>
  );
}

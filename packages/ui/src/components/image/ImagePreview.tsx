import { isUndefined } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';

import { useEvent, useImmer, useIsomorphicLayoutEffect, useLockScroll, useRefExtra } from '@react-devui/hooks';
import { CloseOutlined, LeftOutlined, RightOutlined, RotateRightOutlined, ZoomInOutlined, ZoomOutOutlined } from '@react-devui/icons';
import { getClassName } from '@react-devui/utils';

import { useDValue, useMaxIndex } from '../../hooks';
import { registerComponentMate, TTANSITION_DURING_BASE } from '../../utils';
import { DMask } from '../_mask';
import { DTransition } from '../_transition';
import { DButton } from '../button';
import { DInput } from '../input';
import { useComponentConfig, usePrefixConfig } from '../root';

export interface DImagePreviewProps extends React.HTMLAttributes<HTMLDivElement> {
  dList: React.ImgHTMLAttributes<HTMLImageElement>[];
  dActive?: number;
  dVisible?: boolean;
  dZIndex?: number | string;
  dMask?: boolean;
  dMaskClosable?: boolean;
  dEscClosable?: boolean;
  onActiveChange?: (index: number) => void;
  onVisibleChange?: (visible: boolean) => void;
  afterVisibleChange?: (visible: boolean) => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DImage.Preview' as const });
export function DImagePreview(props: DImagePreviewProps): JSX.Element | null {
  const {
    dList,
    dActive,
    dVisible,
    dZIndex,
    dMask = true,
    dMaskClosable = true,
    dEscClosable = true,
    onActiveChange,
    onVisibleChange,
    afterVisibleChange,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const previewRef = useRef<HTMLDivElement>(null);
  const containerRef = useRefExtra(() => {
    let el = document.getElementById(`${dPrefix}image-preview-root`);
    if (!el) {
      el = document.createElement('div');
      el.id = `${dPrefix}image-preview-root`;
      document.body.appendChild(el);
    }
    return el;
  }, true);
  const windowRef = useRefExtra(() => window);
  //#endregion

  const dataRef = useRef<{
    prevActiveEl: HTMLElement | null;
    eventData: {
      initMove?: { x: number; y: number };
      currentMove?: { x: number; y: number };
      initScale?: { x0: number; y0: number; x1: number; y1: number };
      currentScale?: { x0: number; y0: number; x1: number; y1: number };
    };
  }>({
    prevActiveEl: null,
    eventData: {},
  });

  const [activeIndex, changeActiveIndex] = useDValue<number>(0, dActive, onActiveChange);
  const activeSrc = dList[activeIndex].src!;

  const [offset, setOffset] = useState(3);

  let startIndex = Math.max(activeIndex - offset, 0);
  const endIndex = Math.min(startIndex + offset * 2, dList.length - 1);
  startIndex = Math.max(endIndex - offset * 2, 0);

  const [isDragging, setIsDragging] = useState(false);

  const [position, setPosition] = useImmer(new Map<string, { top: number; left: number }>());
  const activePosition = position.get(activeSrc) ?? { top: 0, left: 0 };

  const [rotate, setRotate] = useImmer(new Map<string, number>());
  const activeRotate = rotate.get(activeSrc) ?? 0;

  const [scale, setScale] = useImmer(new Map<string, number>());
  const activeScale = scale.get(activeSrc) ?? 1;

  const [visible, changeVisible] = useDValue<boolean>(false, dVisible, onVisibleChange);

  const maxZIndex = useMaxIndex(visible);
  const zIndex = (() => {
    if (!isUndefined(dZIndex)) {
      return dZIndex;
    }
    return maxZIndex;
  })();

  const getOffset = () => {
    setOffset(~~((window.innerWidth - 108) / 120));
  };
  useIsomorphicLayoutEffect(() => {
    getOffset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEvent(windowRef, 'resize', getOffset, {}, !visible);

  const handleMove = () => {
    const { initMove, currentMove, initScale, currentScale } = dataRef.current.eventData;
    if (initMove && currentMove) {
      const movementX = currentMove.x - initMove.x;
      const movementY = currentMove.y - initMove.y;
      setPosition((draft) => {
        const oldPosition = draft.get(activeSrc) ?? { top: 0, left: 0 };
        draft.set(activeSrc, {
          top: oldPosition.top + movementY,
          left: oldPosition.left + movementX,
        });
      });

      dataRef.current.eventData.initMove = currentMove;
      dataRef.current.eventData.currentMove = undefined;
    }

    if (initScale && currentScale) {
      const initLength = Math.sqrt(Math.pow(initScale.x0 - initScale.x1, 2) + Math.pow(initScale.y0 - initScale.y1, 2));
      const currentLength = Math.sqrt(Math.pow(currentScale.x0 - currentScale.x1, 2) + Math.pow(currentScale.y0 - currentScale.y1, 2));
      setScale((draft) => {
        const oldScale = draft.get(activeSrc) ?? 1;
        draft.set(activeSrc, Math.max(oldScale + (currentLength - initLength) / 100, 1));
      });

      dataRef.current.eventData.initScale = currentScale;
      dataRef.current.eventData.currentScale = undefined;
    }
  };

  useLockScroll(visible);

  useEffect(() => {
    if (visible) {
      dataRef.current.prevActiveEl = document.activeElement as HTMLElement | null;

      if (previewRef.current) {
        previewRef.current.focus({ preventScroll: true });
      }
    } else if (dataRef.current.prevActiveEl) {
      dataRef.current.prevActiveEl.focus({ preventScroll: true });
    }
  }, [visible]);

  const listenWindow = visible && isDragging;

  useEvent<TouchEvent>(
    windowRef,
    'touchmove',
    (e) => {
      e.preventDefault();

      if (e.touches.length === 2) {
        dataRef.current.eventData.initMove = dataRef.current.eventData.currentMove = undefined;

        const newScale = {
          x0: e.touches[0].clientX,
          y0: e.touches[0].clientY,
          x1: e.touches[1].clientX,
          y1: e.touches[1].clientY,
        };
        if (isUndefined(dataRef.current.eventData.initScale)) {
          dataRef.current.eventData.initScale = newScale;
        } else {
          dataRef.current.eventData.currentScale = newScale;
        }
      } else {
        dataRef.current.eventData.initScale = dataRef.current.eventData.currentScale = undefined;

        const newMove = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
        if (isUndefined(dataRef.current.eventData.initMove)) {
          dataRef.current.eventData.initMove = newMove;
        } else {
          dataRef.current.eventData.currentMove = newMove;
        }
      }

      handleMove();
    },
    { passive: false },
    !listenWindow
  );

  useEvent<MouseEvent>(
    windowRef,
    'mousemove',
    (e) => {
      e.preventDefault();

      const newMove = {
        x: e.clientX,
        y: e.clientY,
      };
      if (isUndefined(dataRef.current.eventData.initMove)) {
        dataRef.current.eventData.initMove = newMove;
      } else {
        dataRef.current.eventData.currentMove = newMove;
      }

      handleMove();
    },
    {},
    !listenWindow
  );

  useEvent(
    windowRef,
    'mouseup',
    () => {
      setIsDragging(false);
    },
    {},
    !listenWindow
  );

  return (
    containerRef.current &&
    ReactDOM.createPortal(
      <DTransition
        dIn={visible}
        dDuring={TTANSITION_DURING_BASE}
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
              transitionStyle = { transform: 'scale(0.3)', opacity: 0 };
              break;

            case 'entering':
              transitionStyle = {
                transition: ['transform', 'opacity'].map((attr) => `${attr} ${TTANSITION_DURING_BASE}ms ease-out`).join(', '),
              };
              break;

            case 'leaving':
              transitionStyle = {
                transform: 'scale(0.3)',
                opacity: 0,
                transition: ['transform', 'opacity'].map((attr) => `${attr} ${TTANSITION_DURING_BASE}ms ease-in`).join(', '),
              };
              break;

            default:
              break;
          }

          return (
            <div
              {...restProps}
              ref={previewRef}
              className={getClassName(restProps.className, `${dPrefix}image-preview`)}
              style={{
                ...restProps.style,
                display: state === 'leaved' ? 'none' : undefined,
                zIndex,
                ...transitionStyle,
              }}
              tabIndex={-1}
              onKeyDown={(e) => {
                if (dEscClosable && e.code === 'Escape') {
                  changeVisible(false);
                }
              }}
            >
              <button
                className={getClassName(`${dPrefix}image-preview__navigation-button`, `${dPrefix}image-preview__navigation-button--prev`)}
                onClick={() => {
                  changeActiveIndex((draft) => {
                    return draft === 0 ? dList.length - 1 : draft - 1;
                  });
                }}
              >
                <LeftOutlined />
              </button>
              <button
                className={getClassName(`${dPrefix}image-preview__navigation-button`, `${dPrefix}image-preview__navigation-button--next`)}
                onClick={() => {
                  changeActiveIndex((draft) => {
                    return draft === dList.length - 1 ? 0 : draft + 1;
                  });
                }}
              >
                <RightOutlined />
              </button>
              <ul className={`${dPrefix}image-preview__toolbar`}>
                <li className={`${dPrefix}image-preview__toolbar-page`}>
                  <DInput
                    className={`${dPrefix}image-preview__toolbar-page-input`}
                    dModel={(activeIndex + 1).toString()}
                    dType="number"
                    dSize="smaller"
                    dMin={1}
                    dMax={dList.length}
                    dInteger
                    onModelChange={(val) => {
                      if (val) {
                        changeActiveIndex(Number(val) - 1);
                      }
                    }}
                  />
                  <span>/</span>
                  <span>{dList.length}</span>
                </li>
                <li className={`${dPrefix}image-preview__toolbar-rotate`}>
                  <DButton
                    onClick={() => {
                      setRotate((draft) => {
                        const oldRotate = draft.get(activeSrc) ?? 0;
                        draft.set(activeSrc, oldRotate + 90);
                      });
                    }}
                    dType="text"
                    dIcon={<RotateRightOutlined />}
                  ></DButton>
                </li>
                <li className={`${dPrefix}image-preview__toolbar-zoom-out`}>
                  <DButton
                    onClick={() => {
                      setScale((draft) => {
                        const oldScale = draft.get(activeSrc) ?? 1;
                        draft.set(activeSrc, Math.max(oldScale / 1.3, 1));
                      });
                    }}
                    dType="text"
                    dIcon={<ZoomOutOutlined />}
                  ></DButton>
                </li>
                <li className={`${dPrefix}image-preview__toolbar-zoom`}>
                  <DInput
                    className={`${dPrefix}image-preview__toolbar-zoom-input`}
                    dModel={Math.round(activeScale * 100).toString()}
                    dType="number"
                    dSize="smaller"
                    dMin={100}
                    dStep={10}
                    dInteger
                    onModelChange={(val) => {
                      if (val) {
                        setScale((draft) => {
                          draft.set(activeSrc, Number(val) / 100);
                        });
                      }
                    }}
                  />
                </li>
                <li className={`${dPrefix}image-preview__toolbar-zoom-in`}>
                  <DButton
                    onClick={() => {
                      setScale((draft) => {
                        const oldScale = draft.get(activeSrc) ?? 1;
                        draft.set(activeSrc, oldScale * 1.3);
                      });
                    }}
                    dType="text"
                    dIcon={<ZoomInOutlined />}
                  ></DButton>
                </li>
                <li className={`${dPrefix}image-preview__toolbar-close`}>
                  <DButton
                    onClick={() => {
                      changeVisible(false);
                    }}
                    dType="text"
                    dIcon={<CloseOutlined />}
                  ></DButton>
                </li>
              </ul>
              {
                // eslint-disable-next-line jsx-a11y/alt-text
                <img
                  {...dList[activeIndex]}
                  className={`${dPrefix}image-preview__img`}
                  style={{
                    transform: `translate(${activePosition.left}px, ${activePosition.top}px) rotate(${activeRotate}deg) scale(${activeScale})`,
                  }}
                  width={undefined}
                  height={undefined}
                  tabIndex={-1}
                  onMouseDown={(e) => {
                    if (e.button === 0) {
                      e.preventDefault();

                      e.currentTarget.focus({ preventScroll: true });
                      dataRef.current.eventData = {};
                      setIsDragging(true);
                    }
                  }}
                  onMouseUp={(e) => {
                    if (e.button === 0) {
                      e.preventDefault();
                    }
                  }}
                  onTouchStart={(e) => {
                    e.currentTarget.focus({ preventScroll: true });
                    dataRef.current.eventData = {};
                    setIsDragging(true);
                  }}
                  onTouchEnd={() => {
                    setIsDragging(false);
                  }}
                  onWheel={(e) => {
                    setScale((draft) => {
                      const oldScale = draft.get(activeSrc) ?? 1;
                      draft.set(activeSrc, e.deltaY < 0 ? oldScale + 0.1 : Math.max(oldScale - 0.1, 1));
                    });
                  }}
                />
              }
              <ul className={`${dPrefix}image-preview__thumbnail-list`}>
                {dList.map(
                  (imgProps, index) =>
                    index >= startIndex &&
                    index <= endIndex && (
                      <li
                        key={index}
                        className={getClassName(`${dPrefix}image-preview__thumbnail`, {
                          'is-active': activeIndex === index,
                        })}
                        onClick={() => {
                          changeActiveIndex(index);
                        }}
                      >
                        {
                          // eslint-disable-next-line jsx-a11y/alt-text
                          <img
                            {...imgProps}
                            className={`${dPrefix}image-preview__thumbnail-img`}
                            style={undefined}
                            width={undefined}
                            height={undefined}
                          />
                        }
                      </li>
                    )
                )}
              </ul>
              {dMask && (
                <DMask
                  dVisible
                  onClose={() => {
                    if (dMaskClosable) {
                      changeVisible(false);
                    }
                  }}
                />
              )}
            </div>
          );
        }}
      </DTransition>,
      containerRef.current
    )
  );
}

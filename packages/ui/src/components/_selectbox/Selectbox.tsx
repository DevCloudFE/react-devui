import type { DCloneHTMLElement, DSize } from '../../utils/types';
import type { DFormControl } from '../form';

import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { fromEvent } from 'rxjs';

import { useForkRef, useRefExtra, useResize } from '@react-devui/hooks';
import { CloseCircleFilled, DownOutlined, LoadingOutlined, SearchOutlined } from '@react-devui/icons';
import { checkNodeExist, getClassName } from '@react-devui/utils';

import { useMaxIndex } from '../../hooks';
import { cloneHTMLElement } from '../../utils';
import { ESC_CLOSABLE_DATA } from '../../utils/checkNoExpandedEl';
import { DBaseDesign } from '../_base-design';
import { DBaseInput } from '../_base-input';
import { DFocusVisible } from '../_focus-visible';
import { useGlobalScroll, useLayout, usePrefixConfig, useTranslation } from '../root';

export interface DSelectboxProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  children: (props: { renderPopup: DCloneHTMLElement }) => JSX.Element | null;
  dRef: {
    box: React.ForwardedRef<HTMLDivElement>;
    input: React.ForwardedRef<HTMLInputElement> | undefined;
  };
  dClassNamePrefix: string;
  dFormControl: DFormControl | undefined;
  dVisible: boolean;
  dContent: React.ReactNode | undefined;
  dContentTitle: string | undefined;
  dPlaceholder: string | undefined;
  dSuffix: React.ReactNode | undefined;
  dSize: DSize | undefined;
  dLoading: boolean;
  dSearchable: boolean;
  dClearable: boolean;
  dDisabled: boolean;
  dUpdatePosition: {
    fn: () => void;
    popupRef: React.RefObject<HTMLElement>;
    extraScrollRefs: (React.RefObject<HTMLElement> | undefined)[];
  };
  dInputRender: DCloneHTMLElement<React.InputHTMLAttributes<HTMLInputElement>>;
  onFocusVisibleChange: (visible: boolean) => void;
  onClear: () => void;
}

export function DSelectbox(props: DSelectboxProps): JSX.Element | null {
  const {
    children,
    dRef,
    dClassNamePrefix,
    dFormControl,
    dVisible,
    dContent,
    dContentTitle,
    dPlaceholder,
    dSuffix,
    dSize,
    dLoading,
    dSearchable,
    dClearable,
    dDisabled,
    dUpdatePosition,
    dInputRender,
    onFocusVisibleChange,
    onClear,

    ...restProps
  } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  const { dPageScrollRef, dContentResizeRef } = useLayout();
  //#endregion

  //#region Ref
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRefExtra(() => {
    let el = document.getElementById(`${prefix}-root`);
    if (!el) {
      el = document.createElement('div');
      el.id = `${prefix}-root`;
      document.body.appendChild(el);
    }
    return el;
  }, true);
  const combineBoxRef = useForkRef(boxRef, dRef.box);
  const combineInputRef = useForkRef(inputRef, dRef.input);
  //#endregion

  const prefix = `${dPrefix}${dClassNamePrefix}`;

  const [t] = useTranslation();

  const [isFocus, setIsFocus] = useState(false);

  const inputable = dSearchable && dVisible;
  const clearable = dClearable && dContent && !dVisible && !dLoading && !dDisabled;

  const maxZIndex = useMaxIndex(dVisible);

  const preventBlur: React.MouseEventHandler = (e) => {
    if (e.target !== inputRef.current && e.button === 0) {
      e.preventDefault();
    }
  };

  const globalScroll = useGlobalScroll(dUpdatePosition.fn, !dVisible);
  useEffect(() => {
    if (!dVisible || !globalScroll) {
      const ob = fromEvent(
        [dPageScrollRef, ...dUpdatePosition.extraScrollRefs].map((ref) => ref?.current).filter((el) => el) as HTMLElement[],
        'scroll',
        { passive: true }
      ).subscribe({
        next: () => {
          dUpdatePosition.fn();
        },
      });
      return () => {
        ob.unsubscribe();
      };
    }
  });

  useResize(boxRef, dUpdatePosition.fn, !dVisible);
  useResize(dUpdatePosition.popupRef, dUpdatePosition.fn, !dVisible);
  useResize(dContentResizeRef, dUpdatePosition.fn, !dVisible);

  return (
    <>
      <DBaseDesign
        dComposeDesign={{
          active: isFocus,
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
              {...{ [ESC_CLOSABLE_DATA]: dVisible }}
              ref={combineBoxRef}
              className={getClassName(restProps.className, prefix, {
                [`${prefix}--${dSize}`]: dSize,
                'is-expanded': dVisible,
                'is-focus': isFocus,
                'is-disabled': dDisabled,
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

                inputRef.current?.focus({ preventScroll: true });
              }}
            >
              <div className={`${prefix}__container`} title={dContentTitle}>
                <DFocusVisible onFocusVisibleChange={onFocusVisibleChange}>
                  {({ render: renderFocusVisible }) => (
                    <DBaseInput dFormControl={dFormControl} dLabelFor>
                      {({ render: renderBaseInput }) => {
                        return dInputRender(
                          renderFocusVisible(
                            renderBaseInput(
                              React.createElement<any>(
                                dSearchable ? 'input' : 'div',
                                Object.assign(
                                  {
                                    ref: combineInputRef,
                                    className: `${prefix}__search`,
                                    style: {
                                      opacity: inputable ? undefined : 0,
                                      zIndex: inputable ? undefined : -1,
                                    },
                                    tabIndex: dDisabled ? -1 : 0,
                                    role: 'combobox',
                                    'aria-haspopup': 'listbox',
                                    'aria-expanded': dVisible,
                                    onFocus: () => {
                                      setIsFocus(true);
                                    },
                                    onBlur: () => {
                                      setIsFocus(false);
                                    },
                                  },
                                  dSearchable
                                    ? {
                                        type: 'text',
                                        autoComplete: 'off',
                                        disabled: dDisabled,
                                      }
                                    : {}
                                )
                              )
                            )
                          )
                        );
                      }}
                    </DBaseInput>
                  )}
                </DFocusVisible>
                {!inputable &&
                  (dContent ? (
                    <div className={`${prefix}__content`}>{dContent}</div>
                  ) : dPlaceholder ? (
                    <div className={`${prefix}__placeholder-wrapper`}>
                      <div className={`${prefix}__placeholder`}>{dPlaceholder}</div>
                    </div>
                  ) : null)}
              </div>
              {checkNodeExist(dSuffix) && (
                <div
                  className={`${prefix}__suffix`}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  {dSuffix}
                </div>
              )}
              {clearable && (
                <div
                  className={`${prefix}__clear`}
                  role="button"
                  aria-label={t('Clear')}
                  onClick={(e) => {
                    e.stopPropagation();

                    onClear();
                  }}
                >
                  <CloseCircleFilled />
                </div>
              )}
              <div
                className={getClassName(`${prefix}__icon`, {
                  'is-arrow-up': !dLoading && !inputable && dVisible,
                })}
                style={{
                  opacity: clearable ? 0 : 1,
                }}
              >
                {dLoading ? <LoadingOutlined dSpin /> : inputable ? <SearchOutlined /> : <DownOutlined />}
              </div>
            </div>
          )
        }
      </DBaseDesign>
      {containerRef.current &&
        ReactDOM.createPortal(
          children({
            renderPopup: (el) =>
              cloneHTMLElement(el, {
                style: {
                  ...el.props.style,
                  zIndex: maxZIndex,
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
          }),
          containerRef.current
        )}
    </>
  );
}

import { isUndefined } from 'lodash';
import React, { startTransition, useCallback, useRef, useState } from 'react';
import { useEffect } from 'react';
import { filter } from 'rxjs';

import { useAsync, usePrefixConfig, useRefCallback, useGeneralState, useTranslation } from '../../hooks';
import { getClassName, getVerticalSideStyle } from '../../utils';
import { DPopup } from '../_popup';
import { DIcon } from '../icon';

export interface DSelectBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  dPopupContent: React.ReactNode;
  dSuffix?: React.ReactNode;
  dVisible?: boolean;
  dShowClear?: boolean;
  dSearchable?: boolean;
  dClearIcon?: React.ReactNode;
  dSize?: 'smaller' | 'larger';
  dPlaceholder?: string;
  dContentTitle?: string;
  dDisabled?: boolean;
  dLoading?: boolean;
  dPopupClassName?: string;
  dCustomWidth?: boolean;
  dAutoMaxWidth?: boolean;
  onClear?: () => void;
  onSearch?: (value: string) => void;
  onVisibleChange?: (expanded: boolean) => void;
  onRendered?: () => void;
}

export function DSelectBox(props: DSelectBoxProps) {
  const {
    dPopupContent,
    dSuffix,
    dVisible = false,
    dShowClear = false,
    dSearchable = false,
    dClearIcon,
    dSize,
    dPlaceholder,
    dContentTitle,
    dDisabled = false,
    dLoading = false,
    dPopupClassName,
    dCustomWidth = false,
    dAutoMaxWidth = false,
    onClear,
    onSearch,
    onVisibleChange,
    onRendered,
    className,
    tabIndex = 0,
    onKeyDown,
    onMouseDown,
    onMouseUp,
    onClick,
    children,
    ...restProps
  } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gSize, gDisabled } = useGeneralState();
  //#endregion

  //#region Ref
  const [boxEl, boxRef] = useRefCallback();
  const [searchEl, searchRef] = useRefCallback();
  //#endregion

  const dataRef = useRef({ visible: dVisible });

  const asyncCapture = useAsync();
  const [t] = useTranslation();

  const [searchValue, setSearchValue] = useState('');

  const size = dSize ?? gSize;
  const disabled = dDisabled || gDisabled;

  const iconSize = size === 'smaller' ? 12 : size === 'larger' ? 16 : 14;

  const preventBlur = useCallback(
    (e) => {
      if (dVisible && e.button === 0) {
        e.preventDefault();
      }
    },
    [dVisible]
  );

  const handleSuffixClick = useCallback((e) => {
    e.stopPropagation();
  }, []);

  const handleClearClick = useCallback(
    (e) => {
      e.stopPropagation();

      onClear?.();
    },
    [onClear]
  );

  const handleSearchChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      setSearchValue(e.currentTarget.value);
      startTransition(() => {
        onSearch?.(e.currentTarget.value);
      });
    },
    [onSearch, setSearchValue]
  );

  const handleKeyDown = useCallback<React.KeyboardEventHandler<HTMLDivElement>>(
    (e) => {
      onKeyDown?.(e);

      if (!disabled && !dVisible) {
        if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          onVisibleChange?.(true);
        }
      }
    },
    [dVisible, disabled, onVisibleChange, onKeyDown]
  );
  const handleMouseDown = useCallback(
    (e) => {
      onMouseDown?.(e);

      if (e.button === 0) {
        e.preventDefault();
      }
    },
    [onMouseDown]
  );
  const handleMouseUp = useCallback(
    (e) => {
      onMouseUp?.(e);

      if (e.button === 0) {
        e.preventDefault();
      }
    },
    [onMouseUp]
  );
  const handleClick = useCallback(
    (e) => {
      onClick?.(e);

      onVisibleChange?.(!dVisible);
    },
    [dVisible, onClick, onVisibleChange]
  );

  const customTransition = useCallback(
    (popupEl: HTMLElement, targetEl: HTMLElement) => {
      if (!dCustomWidth) {
        popupEl.style.width = targetEl.getBoundingClientRect().width + 'px';
      }
      const { top, left, transformOrigin } = getVerticalSideStyle(popupEl, targetEl, 'bottom-left', 8);
      if (dAutoMaxWidth) {
        popupEl.style.maxWidth = window.innerWidth - left - 20 + 'px';
      }
      return {
        top,
        left,
        stateList: {
          'enter-from': { transform: 'scaleY(0.7)', opacity: '0' },
          'enter-to': { transition: 'transform 116ms ease-out, opacity 116ms ease-out', transformOrigin },
          'leave-active': { transition: 'transform 116ms ease-in, opacity 116ms ease-in', transformOrigin },
          'leave-to': { transform: 'scaleY(0.7)', opacity: '0' },
        },
      };
    },
    [dAutoMaxWidth, dCustomWidth]
  );

  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();

    if (dVisible) {
      asyncGroup
        .fromEvent<KeyboardEvent>(window, 'keydown')
        .pipe(filter((e) => e.code === 'Escape'))
        .subscribe({
          next: () => {
            onVisibleChange?.(false);
          },
        });
    }

    return () => {
      asyncCapture.deleteGroup(asyncId);
    };
  }, [asyncCapture, dVisible, onVisibleChange]);

  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();

    if (dVisible && boxEl) {
      if (dSearchable && searchEl) {
        searchEl.focus({ preventScroll: true });
        asyncGroup.fromEvent(searchEl, 'blur').subscribe({
          next: () => {
            onVisibleChange?.(false);
          },
        });
      } else {
        boxEl.focus({ preventScroll: true });
        asyncGroup.fromEvent(boxEl, 'blur').subscribe({
          next: () => {
            onVisibleChange?.(false);
          },
        });
      }
    }

    return () => {
      asyncCapture.deleteGroup(asyncId);
    };
  }, [asyncCapture, boxEl, dSearchable, dVisible, onVisibleChange, searchEl]);

  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();

    if (!dVisible && dVisible !== dataRef.current.visible) {
      asyncGroup.setTimeout(() => {
        if (document.activeElement === null || document.activeElement === document.body) {
          boxEl?.focus({ preventScroll: true });
        }
      }, 20);
    }

    dataRef.current.visible = dVisible;

    return () => {
      asyncCapture.deleteGroup(asyncId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dVisible]);

  return (
    <DPopup
      className={dPopupClassName}
      dVisible={dVisible}
      dPopupContent={dPopupContent}
      dTrigger={null}
      dArrow={false}
      dCustomPopup={customTransition}
      dTriggerRender={(renderProps) => (
        <div
          {...restProps}
          {...renderProps}
          ref={boxRef}
          className={getClassName(className, `${dPrefix}select-box`, {
            [`${dPrefix}select-box--${size}`]: size,
            'is-expanded': dVisible,
            'is-disabled': disabled,
          })}
          role="button"
          tabIndex={disabled ? undefined : tabIndex}
          aria-disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={dVisible}
          onKeyDown={handleKeyDown}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onClick={handleClick}
        >
          {dSearchable && dVisible ? (
            <input
              ref={searchRef}
              className={`${dPrefix}select-box__search`}
              type="search"
              autoComplete="off"
              value={searchValue}
              onChange={handleSearchChange}
            ></input>
          ) : (
            <div className={`${dPrefix}select-box__content`} title={dContentTitle}>
              {children}
            </div>
          )}
          <div className={`${dPrefix}select-box__suffix`} onClick={handleSuffixClick}>
            {dSuffix}
          </div>
          {!(dSearchable && dVisible) && !children && dPlaceholder && (
            <div className={`${dPrefix}select-box__placeholder`}>
              <span>{dPlaceholder}</span>
            </div>
          )}
          {!dVisible && !dLoading && !disabled && dShowClear && (
            <div
              className={`${dPrefix}select-box__clear`}
              style={{ width: iconSize, height: iconSize }}
              role="button"
              tabIndex={-1}
              aria-label={t('Common', 'Clear')}
              onClick={handleClearClick}
            >
              {isUndefined(dClearIcon) ? (
                <DIcon viewBox="64 64 896 896" dSize="0.8em">
                  <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm165.4 618.2l-66-.3L512 563.4l-99.3 118.4-66.1.3c-4.4 0-8-3.5-8-8 0-1.9.7-3.7 1.9-5.2l130.1-155L340.5 359a8.32 8.32 0 01-1.9-5.2c0-4.4 3.6-8 8-8l66.1.3L512 464.6l99.3-118.4 66-.3c4.4 0 8 3.5 8 8 0 1.9-.7 3.7-1.9 5.2L553.5 514l130 155c1.2 1.5 1.9 3.3 1.9 5.2 0 4.4-3.6 8-8 8z"></path>
                </DIcon>
              ) : (
                dClearIcon
              )}
            </div>
          )}
          <DIcon
            className={getClassName(`${dPrefix}select-box__icon`, {
              'is-expand': !dLoading && !dSearchable && dVisible,
            })}
            viewBox={dLoading ? '0 0 1024 1024' : '64 64 896 896'}
            dSize={iconSize}
            dSpin={dLoading}
          >
            {dLoading ? (
              <path d="M988 548c-19.9 0-36-16.1-36-36 0-59.4-11.6-117-34.6-171.3a440.45 440.45 0 00-94.3-139.9 437.71 437.71 0 00-139.9-94.3C629 83.6 571.4 72 512 72c-19.9 0-36-16.1-36-36s16.1-36 36-36c69.1 0 136.2 13.5 199.3 40.3C772.3 66 827 103 874 150c47 47 83.9 101.8 109.7 162.7 26.7 63.1 40.2 130.2 40.2 199.3.1 19.9-16 36-35.9 36z"></path>
            ) : dSearchable && dVisible ? (
              <path d="M909.6 854.5L649.9 594.8C690.2 542.7 712 479 712 412c0-80.2-31.3-155.4-87.9-212.1-56.6-56.7-132-87.9-212.1-87.9s-155.5 31.3-212.1 87.9C143.2 256.5 112 331.8 112 412c0 80.1 31.3 155.5 87.9 212.1C256.5 680.8 331.8 712 412 712c67 0 130.6-21.8 182.7-62l259.7 259.6a8.2 8.2 0 0011.6 0l43.6-43.5a8.2 8.2 0 000-11.6zM570.4 570.4C528 612.7 471.8 636 412 636s-116-23.3-158.4-65.6C211.3 528 188 471.8 188 412s23.3-116.1 65.6-158.4C296 211.3 352.2 188 412 188s116.1 23.2 158.4 65.6S636 352.2 636 412s-23.3 116.1-65.6 158.4z"></path>
            ) : (
              <path d="M884 256h-75c-5.1 0-9.9 2.5-12.9 6.6L512 654.2 227.9 262.6c-3-4.1-7.8-6.6-12.9-6.6h-75c-6.5 0-10.3 7.4-6.5 12.7l352.6 486.1c12.8 17.6 39 17.6 51.7 0l352.6-486.1c3.9-5.3.1-12.7-6.4-12.7z"></path>
            )}
          </DIcon>
        </div>
      )}
      onRendered={onRendered}
      onMouseDown={preventBlur}
      onMouseUp={preventBlur}
    />
  );
}

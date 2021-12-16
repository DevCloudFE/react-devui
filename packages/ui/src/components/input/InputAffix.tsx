import { isUndefined } from 'lodash';
import React, { useCallback, useMemo, useRef } from 'react';

import { usePrefixConfig, useComponentConfig, useTranslation, useImmer, useAsync } from '../../hooks';
import { getClassName } from '../../utils';
import { DButton } from '../button';
import { useCompose } from '../compose';
import { DIcon } from '../icon';
import { getNumberAttribute } from './utils';

export interface DInputAffixContextData {
  inputAffixDisabled: boolean;
  inputAffixPassword: boolean;
  inputAffixNumber: boolean;
  inputAffixSize: DInputAffixProps['dSize'];
  onFocus: () => void;
  onBlur: () => void;
  onClearableChange: (clearable: boolean) => void;
  onInputRendered: (changeBindValue: (value: string) => void, inputEl: HTMLInputElement) => void;
}
export const DInputAffixContext = React.createContext<DInputAffixContextData | null>(null);

export interface DInputAffixProps extends React.HTMLAttributes<HTMLDivElement> {
  dPrefix?: React.ReactNode;
  dSuffix?: React.ReactNode;
  dDisabled?: boolean;
  dPassword?: boolean;
  dPasswordToggle?: boolean;
  dNumber?: boolean;
  dClearable?: boolean;
  dClearIcon?: React.ReactNode;
  dSize?: 'smaller' | 'larger';
}

export function DInputAffix(props: DInputAffixProps) {
  const {
    dPrefix: _dPrefix,
    dSuffix,
    dDisabled = false,
    dPassword = false,
    dPasswordToggle = true,
    dNumber = false,
    dClearable = false,
    dClearIcon,
    dSize,
    className,
    children,
    ...restProps
  } = useComponentConfig(DInputAffix.name, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { composeSize, composeDisabled } = useCompose();
  //#endregion

  const dataRef = useRef<{
    changeBindValue?: (value: string) => void;
    inputEl?: HTMLInputElement;
    clearLoop?: () => void;
    clearTid?: () => void;
  }>({});

  const asyncCapture = useAsync();
  const [t] = useTranslation();

  const [isFocus, setIsFocus] = useImmer(false);
  const [clearable, setClearable] = useImmer(false);
  const [password, setPassword] = useImmer(true);

  const size = composeSize ?? dSize;
  const disabled = composeDisabled || dDisabled;

  const handleClearMouseDown = useCallback<React.MouseEventHandler<HTMLButtonElement>>((e) => {
    if (e.button === 0) {
      if (document.activeElement === dataRef.current.inputEl) {
        e.preventDefault();
      }
      dataRef.current.changeBindValue?.('');
    }
  }, []);

  const handleNumberChange = useCallback(
    (isIncrease = true) => {
      const handleFunc = () => {
        if (dataRef.current.inputEl && dataRef.current.changeBindValue) {
          const step = getNumberAttribute(dataRef.current.inputEl.step, 1);
          const max = getNumberAttribute(dataRef.current.inputEl.max, Infinity);
          const min = getNumberAttribute(dataRef.current.inputEl.min, -Infinity);
          const value = getNumberAttribute(dataRef.current.inputEl.value, 0);
          const newValue = isIncrease ? value + step : value - step;
          dataRef.current.changeBindValue(Math.max(min, Math.min(max, newValue)).toFixed(step.toString().split('.')[1]?.length ?? 0));
        }
      };

      handleFunc();
      const loop = () => {
        handleFunc();
        dataRef.current.clearLoop = asyncCapture.setTimeout(() => loop(), 50);
      };
      dataRef.current.clearTid = asyncCapture.setTimeout(() => loop(), 400);
    },
    [asyncCapture]
  );

  const handlePasswordMouseDown = useCallback<React.MouseEventHandler<HTMLButtonElement>>(
    (e) => {
      if (e.button === 0) {
        if (document.activeElement === dataRef.current.inputEl) {
          e.preventDefault();
        }
        if (dPasswordToggle) {
          setPassword(!password);
        }
      }
    },
    [dPasswordToggle, password, setPassword]
  );

  const handleNumberIncreaseMouseDown = useCallback<React.MouseEventHandler<HTMLButtonElement>>(
    (e) => {
      if (e.button === 0) {
        if (document.activeElement === dataRef.current.inputEl) {
          e.preventDefault();
        }

        handleNumberChange();
      }
    },
    [handleNumberChange]
  );

  const handleNumberDecreaseMouseDown = useCallback<React.MouseEventHandler<HTMLButtonElement>>(
    (e) => {
      if (e.button === 0) {
        if (document.activeElement === dataRef.current.inputEl) {
          e.preventDefault();
        }

        handleNumberChange(false);
      }
    },
    [handleNumberChange]
  );

  const handleMouseUp = useCallback((e) => {
    if (document.activeElement === dataRef.current.inputEl) {
      e.preventDefault();
    }

    dataRef.current.clearLoop?.();
    dataRef.current.clearTid?.();
  }, []);

  const contextValue = useMemo<DInputAffixContextData>(
    () => ({
      inputAffixDisabled: disabled,
      inputAffixPassword: dPassword ? password : false,
      inputAffixNumber: dNumber,
      inputAffixSize: size,
      onFocus: () => {
        setIsFocus(true);
      },
      onBlur: () => {
        setIsFocus(false);
      },
      onClearableChange: (clearable) => {
        setClearable(clearable);
      },
      onInputRendered: (changeBindValue, inputEl) => {
        dataRef.current.changeBindValue = changeBindValue;
        dataRef.current.inputEl = inputEl;
      },
    }),
    [dNumber, dPassword, disabled, password, setClearable, setIsFocus, size]
  );

  return (
    <DInputAffixContext.Provider value={contextValue}>
      <div
        {...restProps}
        className={getClassName(className, `${dPrefix}input-affix`, {
          [`${dPrefix}input-affix--${size}`]: size,
          [`${dPrefix}input-affix--number`]: dNumber,
          'is-disabled': disabled,
          'is-focus': isFocus,
        })}
        role="radiogroup"
      >
        {_dPrefix && <div className={`${dPrefix}input-affix__prefix`}>{_dPrefix}</div>}
        {children}
        {dClearable && !disabled && (
          <DButton
            className={`${dPrefix}input-affix__clear`}
            style={{ opacity: clearable ? 1 : 0 }}
            tabIndex={-1}
            dType="link"
            dShape="circle"
            dIcon={
              isUndefined(dClearIcon) ? (
                <DIcon viewBox="64 64 896 896" dSize={size === 'smaller' ? 10 : size === 'larger' ? 14 : 12}>
                  <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm165.4 618.2l-66-.3L512 563.4l-99.3 118.4-66.1.3c-4.4 0-8-3.5-8-8 0-1.9.7-3.7 1.9-5.2l130.1-155L340.5 359a8.32 8.32 0 01-1.9-5.2c0-4.4 3.6-8 8-8l66.1.3L512 464.6l99.3-118.4 66-.3c4.4 0 8 3.5 8 8 0 1.9-.7 3.7-1.9 5.2L553.5 514l130 155c1.2 1.5 1.9 3.3 1.9 5.2 0 4.4-3.6 8-8 8z"></path>
                </DIcon>
              ) : (
                dClearIcon
              )
            }
            aria-label={t('Common', 'Clear')}
            onMouseDown={handleClearMouseDown}
            onMouseUp={handleMouseUp}
          ></DButton>
        )}
        {dPassword && !disabled && (
          <DButton
            className={`${dPrefix}input-affix__password`}
            tabIndex={-1}
            dType="link"
            dShape="circle"
            dIcon={
              <DIcon viewBox="64 64 896 896" dSize={size === 'smaller' ? 12 : size === 'larger' ? 16 : 14}>
                {password ? (
                  <>
                    <path d="M942.2 486.2Q889.47 375.11 816.7 305l-50.88 50.88C807.31 395.53 843.45 447.4 874.7 512 791.5 684.2 673.4 766 512 766q-72.67 0-133.87-22.38L323 798.75Q408 838 512 838q288.3 0 430.2-300.3a60.29 60.29 0 000-51.5zm-63.57-320.64L836 122.88a8 8 0 00-11.32 0L715.31 232.2Q624.86 186 512 186q-288.3 0-430.2 300.3a60.3 60.3 0 000 51.5q56.69 119.4 136.5 191.41L112.48 835a8 8 0 000 11.31L155.17 889a8 8 0 0011.31 0l712.15-712.12a8 8 0 000-11.32zM149.3 512C232.6 339.8 350.7 258 512 258c54.54 0 104.13 9.36 149.12 28.39l-70.3 70.3a176 176 0 00-238.13 238.13l-83.42 83.42C223.1 637.49 183.3 582.28 149.3 512zm246.7 0a112.11 112.11 0 01146.2-106.69L401.31 546.2A112 112 0 01396 512z"></path>
                    <path d="M508 624c-3.46 0-6.87-.16-10.25-.47l-52.82 52.82a176.09 176.09 0 00227.42-227.42l-52.82 52.82c.31 3.38.47 6.79.47 10.25a111.94 111.94 0 01-112 112z"></path>
                  </>
                ) : (
                  <path d="M942.2 486.2C847.4 286.5 704.1 186 512 186c-192.2 0-335.4 100.5-430.2 300.3a60.3 60.3 0 000 51.5C176.6 737.5 319.9 838 512 838c192.2 0 335.4-100.5 430.2-300.3 7.7-16.2 7.7-35 0-51.5zM512 766c-161.3 0-279.4-81.8-362.7-254C232.6 339.8 350.7 258 512 258c161.3 0 279.4 81.8 362.7 254C791.5 684.2 673.4 766 512 766zm-4-430c-97.2 0-176 78.8-176 176s78.8 176 176 176 176-78.8 176-176-78.8-176-176-176zm0 288c-61.9 0-112-50.1-112-112s50.1-112 112-112 112 50.1 112 112-50.1 112-112 112z"></path>
                )}
              </DIcon>
            }
            aria-label={t('DInputAffix', password ? 'Password is visible' : 'Password is not visible')}
            onMouseDown={handlePasswordMouseDown}
            onMouseUp={handleMouseUp}
          ></DButton>
        )}
        {dNumber && !disabled && (
          <div className={`${dPrefix}input-affix__number-container`}>
            <DButton
              className={`${dPrefix}input-affix__number`}
              tabIndex={-1}
              dType="text"
              dIcon={
                <DIcon viewBox="0 0 24 24" dSize={size === 'smaller' ? 12 : size === 'larger' ? 16 : 14}>
                  <path d="M19.637 16.4369C19.0513 17.0227 18.1015 17.0227 17.5157 16.4369L11.8589 10.7801L6.20202 16.4369C5.61623 17.0227 4.66648 17.0227 4.0807 16.4369C3.49491 15.8511 3.49491 14.9014 4.0807 14.3156L10.7982 7.59809C11.384 7.01231 12.3337 7.01231 12.9195 7.59809L19.637 14.3156C20.2228 14.9014 20.2228 15.8511 19.637 16.4369Z"></path>
                </DIcon>
              }
              aria-label={t('DInputAffix', 'Increase number')}
              onMouseDown={handleNumberIncreaseMouseDown}
              onMouseUp={handleMouseUp}
            ></DButton>
            <DButton
              className={`${dPrefix}input-affix__number`}
              tabIndex={-1}
              dType="text"
              dIcon={
                <DIcon viewBox="0 0 24 24" dSize={size === 'smaller' ? 12 : size === 'larger' ? 16 : 14}>
                  <path d="M4.08045 7.59809C4.66624 7.01231 5.61599 7.01231 6.20177 7.59809L11.8586 13.2549L17.5155 7.59809C18.1013 7.01231 19.051 7.01231 19.6368 7.59809C20.2226 8.18388 20.2226 9.13363 19.6368 9.71941L12.9193 16.4369C12.3335 17.0227 11.3838 17.0227 10.798 16.4369L4.08045 9.71941C3.49467 9.13363 3.49467 8.18388 4.08045 7.59809Z"></path>
                </DIcon>
              }
              aria-label={t('DInputAffix', 'Decrease number')}
              onMouseDown={handleNumberDecreaseMouseDown}
              onMouseUp={handleMouseUp}
            ></DButton>
          </div>
        )}
        {dSuffix && <div className={`${dPrefix}input-affix__suffix`}>{dSuffix}</div>}
      </div>
    </DInputAffixContext.Provider>
  );
}

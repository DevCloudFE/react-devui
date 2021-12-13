import { isUndefined } from 'lodash';
import React, { useCallback, useMemo, useRef } from 'react';

import { usePrefixConfig, useComponentConfig, useTranslation, useImmer } from '../../hooks';
import { getClassName } from '../../utils';
import { DButton } from '../button';
import { useCompose } from '../compose';
import { DIcon } from '../icon';

export interface DInputAffixContextData {
  inputAffixDisabled: boolean;
  inputAffixPassword?: boolean;
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

  const dataRef = useRef<{ changeBindValue?: (value: string) => void; inputEl?: HTMLInputElement }>({});

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

  const handleMouseUp = useCallback((e) => {
    if (document.activeElement === dataRef.current.inputEl) {
      e.preventDefault();
    }
  }, []);

  const contextValue = useMemo<DInputAffixContextData>(
    () => ({
      inputAffixDisabled: disabled,
      inputAffixPassword: dPassword ? password : false,
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
    [dPassword, disabled, password, setClearable, setIsFocus, size]
  );

  return (
    <DInputAffixContext.Provider value={contextValue}>
      <div
        {...restProps}
        className={getClassName(className, `${dPrefix}input-affix`, {
          [`${dPrefix}input-affix--${size}`]: size,
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
        {dSuffix && <div className={`${dPrefix}input-affix__suffix`}>{dSuffix}</div>}
      </div>
    </DInputAffixContext.Provider>
  );
}

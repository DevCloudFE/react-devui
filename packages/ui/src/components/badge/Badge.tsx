import { useRef } from 'react';

import { usePrefixConfig, useComponentConfig } from '../../hooks';
import { registerComponentMate, getClassName } from '../../utils';
import { TTANSITION_DURING_BASE } from '../../utils/global';
import { DTransition } from '../_transition';
import { DNumber } from './Number';

export interface DBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  dValue: number;
  dTheme?: 'primary' | 'success' | 'warning' | 'danger';
  dColor?: string;
  dShowZero?: boolean;
  dMax?: number;
  dDot?: boolean;
  dOffset?: [number | string, number | string];
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DBadge' });
export function DBadge(props: DBadgeProps): JSX.Element | null {
  const {
    children,
    dValue,
    dTheme = 'danger',
    dColor,
    dShowZero = false,
    dMax = Infinity,
    dDot = false,
    dOffset = [0, '100%'],

    className,
    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const dataRef = useRef<{
    saveValue?: number;
    prevValue: number;
    dDown: boolean;
  }>({
    prevValue: dValue,
    dDown: false,
  });

  const show = dShowZero || dValue > 0;
  const value = show ? dValue : dataRef.current.saveValue ?? 0;
  dataRef.current.saveValue = value;

  const nums = (value > dMax ? dMax : value)
    .toString()
    .split('')
    .map((n) => Number(n));

  if (value !== dataRef.current.prevValue) {
    dataRef.current.dDown = value < dataRef.current.prevValue;
    dataRef.current.prevValue = value;
  }

  return (
    <DTransition dIn={show} dDuring={TTANSITION_DURING_BASE}>
      {(state) => {
        let transitionStyle: React.CSSProperties = {};
        switch (state) {
          case 'enter':
            transitionStyle = { transform: 'scale(0)', opacity: 0 };
            break;

          case 'entering':
            transitionStyle = {
              transition: `transform ${TTANSITION_DURING_BASE}ms ease-out, opacity ${TTANSITION_DURING_BASE}ms ease-out`,
            };
            break;

          case 'leaving':
            transitionStyle = {
              transform: 'scale(0)',
              opacity: 0,
              transition: `transform ${TTANSITION_DURING_BASE}ms ease-in, opacity ${TTANSITION_DURING_BASE}ms ease-in`,
            };
            break;

          default:
            break;
        }

        return (
          <div
            {...restProps}
            className={getClassName(className, `${dPrefix}badge__container`)}
            title={dDot ? undefined : dValue.toString()}
          >
            {children}
            {state === 'leaved' ? null : (
              <div
                className={getClassName(`${dPrefix}badge`, {
                  [`t-${dTheme}`]: dTheme,
                  [`${dPrefix}badge--dot`]: dDot,
                })}
                style={{
                  top: dOffset[0],
                  left: dOffset[1],
                  [`--${dPrefix}badge-color`]: dColor,
                }}
              >
                <div className={`${dPrefix}badge__wrapper`} style={transitionStyle}>
                  {dDot ? null : (
                    <>
                      {nums.map((n, i) => (
                        <DNumber key={nums.length - i} dValue={n} dDown={dataRef.current.dDown}></DNumber>
                      ))}
                      {value > dMax ? '+' : ''}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      }}
    </DTransition>
  );
}

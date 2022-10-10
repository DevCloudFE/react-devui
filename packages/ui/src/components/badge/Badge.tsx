import { useRef } from 'react';

import { getClassName } from '@react-devui/utils';

import { registerComponentMate, TTANSITION_DURING_BASE } from '../../utils';
import { DTransition } from '../_transition';
import { useComponentConfig, usePrefixConfig } from '../root';
import { DNumber } from './Number';

export interface DBadgeProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dValue: number;
  dTheme?: 'primary' | 'success' | 'warning' | 'danger';
  dColor?: string;
  dShowZero?: boolean;
  dMax?: number;
  dDot?: boolean;
  dOffset?: [number | string, number | string];
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DBadge' as const });
export function DBadge(props: DBadgeProps): JSX.Element | null {
  const {
    dValue,
    dTheme = 'danger',
    dColor,
    dShowZero = false,
    dMax = Infinity,
    dDot = false,
    dOffset = [0, '100%'],

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
              transition: ['transform', 'opacity'].map((attr) => `${attr} ${TTANSITION_DURING_BASE}ms ease-out`).join(', '),
            };
            break;

          case 'leaving':
            transitionStyle = {
              transform: 'scale(0)',
              opacity: 0,
              transition: ['transform', 'opacity'].map((attr) => `${attr} ${TTANSITION_DURING_BASE}ms ease-in`).join(', '),
            };
            break;

          default:
            break;
        }

        return state === 'leaved' ? null : (
          <div
            {...restProps}
            className={getClassName(restProps.className, `${dPrefix}badge`, {
              [`t-${dTheme}`]: dTheme,
              [`${dPrefix}badge--dot`]: dDot,
            })}
            style={{
              ...restProps.style,
              top: dOffset[0],
              left: dOffset[1],
              [`--${dPrefix}badge-color`]: dColor,
            }}
            title={restProps.title ?? (dDot ? undefined : dValue.toString())}
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
        );
      }}
    </DTransition>
  );
}

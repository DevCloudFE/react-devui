import { getClassName } from '@react-devui/utils';

import { registerComponentMate, TTANSITION_DURING_BASE } from '../../utils';
import { DTransition } from '../_transition';
import { useComponentConfig, usePrefixConfig } from '../root';

export interface DBadgeTextProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dText: string;
  dTheme?: 'primary' | 'success' | 'warning' | 'danger';
  dColor?: string;
  dOffset?: [number | string, number | string];
  dAlone?: boolean;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DBadge.Text' as const });
export function DBadgeText(props: DBadgeTextProps): JSX.Element | null {
  const {
    dText,
    dTheme = 'danger',
    dColor,
    dOffset = [0, '100%'],
    dAlone = false,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  return (
    <DTransition dIn={dText.length > 0} dDuring={TTANSITION_DURING_BASE}>
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
              [`${dPrefix}badge--alone`]: dAlone,
            })}
            style={{
              ...restProps.style,
              ...(dAlone
                ? {}
                : {
                    top: dOffset[0],
                    left: dOffset[1],
                  }),
              [`--${dPrefix}badge-color`]: dColor,
            }}
            title={restProps.title ?? dText}
          >
            <div className={`${dPrefix}badge__wrapper`} style={transitionStyle}>
              {dText}
            </div>
          </div>
        );
      }}
    </DTransition>
  );
}

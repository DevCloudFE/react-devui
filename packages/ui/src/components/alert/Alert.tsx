import { checkNodeExist, getClassName } from '@react-devui/utils';

import { useDValue } from '../../hooks';
import { registerComponentMate, TTANSITION_DURING_BASE } from '../../utils';
import { DCollapseTransition } from '../_transition';
import { DPanel as DNotificationPanel } from '../notification/Panel';
import { useComponentConfig, usePrefixConfig } from '../root';
import { DPanel as DToastPanel } from '../toast/Panel';

export interface DAlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dVisible?: boolean;
  dType?: 'success' | 'warning' | 'error' | 'info';
  dIcon?: React.ReactNode;
  dTitle: React.ReactNode;
  dDescription?: React.ReactNode;
  dActions?: React.ReactNode[];
  onVisibleChange?: (visible: boolean) => void;
  afterVisibleChange?: (visible: boolean) => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DAlert' as const });
export function DAlert(props: DAlertProps): JSX.Element | null {
  const {
    dVisible,
    dType,
    dIcon,
    dTitle,
    dDescription,
    dActions = [],
    onVisibleChange,
    afterVisibleChange,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const [visible, changeVisible] = useDValue<boolean>(true, dVisible, onVisibleChange);

  return (
    <DCollapseTransition
      dOriginalSize={{
        height: 'auto',
      }}
      dCollapsedStyle={{
        height: 0,
      }}
      dIn={visible}
      dDuring={TTANSITION_DURING_BASE}
      dStyles={{
        enter: { opacity: 0 },
        entering: {
          transition: ['height', 'padding', 'margin', 'opacity'].map((attr) => `${attr} ${TTANSITION_DURING_BASE}ms ease-out`).join(', '),
        },
        leaving: {
          opacity: 0,
          transition: ['height', 'padding', 'margin', 'opacity'].map((attr) => `${attr} ${TTANSITION_DURING_BASE}ms ease-in`).join(', '),
        },
        leaved: { display: 'none' },
      }}
      afterEnter={() => {
        afterVisibleChange?.(true);
      }}
      afterLeave={() => {
        afterVisibleChange?.(false);
      }}
    >
      {(collapseRef, collapseStyle) =>
        checkNodeExist(dDescription) ? (
          <DNotificationPanel
            {...restProps}
            ref={collapseRef}
            className={getClassName(restProps.className, `${dPrefix}alert--notification`)}
            style={{
              ...restProps.style,
              ...collapseStyle,
            }}
            dClassNamePrefix="alert"
            dType={dType}
            dIcon={dIcon}
            dTitle={dTitle}
            dDescription={dDescription}
            dActions={dActions}
            onClose={() => {
              changeVisible(false);
            }}
          ></DNotificationPanel>
        ) : (
          <DToastPanel
            {...restProps}
            ref={collapseRef}
            className={getClassName(restProps.className, `${dPrefix}alert--toast`)}
            style={{
              ...restProps.style,
              ...collapseStyle,
            }}
            dClassNamePrefix="alert"
            dType={dType}
            dIcon={dIcon}
            dContent={dTitle}
            dActions={dActions}
            onClose={() => {
              changeVisible(false);
            }}
          ></DToastPanel>
        )
      }
    </DCollapseTransition>
  );
}

import { useComponentConfig, useDValue, usePrefixConfig } from '../../hooks';
import { checkNodeExist, getClassName, registerComponentMate } from '../../utils';
import { TTANSITION_DURING_BASE } from '../../utils/global';
import { DCollapseTransition } from '../_transition';
import { DPanel as DNotificationPanel } from '../notification/Panel';
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

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DAlert' });
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
      dSize={0}
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
      {(ref, collapseStyle) =>
        checkNodeExist(dDescription) ? (
          <DNotificationPanel
            {...restProps}
            ref={ref}
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
            ref={ref}
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

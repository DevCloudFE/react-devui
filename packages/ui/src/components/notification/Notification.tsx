import { useRef } from 'react';
import ReactDOM from 'react-dom';

import { useRefExtra } from '@react-devui/hooks';

import { registerComponentMate } from '../../utils';
import { DAlertPopover } from '../_alert-popover';
import { DTransition } from '../_transition';
import { useComponentConfig, usePrefixConfig } from '../root';
import { DPanel } from './Panel';

export interface DNotificationProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dVisible: boolean;
  dType?: 'success' | 'warning' | 'error' | 'info';
  dIcon?: React.ReactNode;
  dTitle: React.ReactNode;
  dDescription?: React.ReactNode;
  dDuration?: number;
  dPlacement?: 'left-top' | 'right-top' | 'left-bottom' | 'right-bottom';
  dActions?: React.ReactNode[];
  dEscClosable?: boolean;
  onClose?: () => void;
  afterVisibleChange?: (visible: boolean) => void;
}

const TTANSITION_DURING = { enter: 133, leave: 166 };
const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DNotification' as const });
export function DNotification(props: DNotificationProps): JSX.Element | null {
  const {
    dVisible,
    dType,
    dIcon,
    dTitle,
    dDescription,
    dDuration = 9.6,
    dPlacement = 'right-top',
    dActions = ['close'],
    dEscClosable = true,
    onClose,
    afterVisibleChange,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const panelRef = useRef<HTMLDivElement>(null);
  //#endregion

  const getRoot = (id: string) => {
    let root = document.getElementById(`${dPrefix}notification-root`);
    if (!root) {
      root = document.createElement('div');
      root.id = `${dPrefix}notification-root`;
      document.body.appendChild(root);
    }

    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement('div');
      el.id = id;
      root.appendChild(el);
    }
    return el;
  };
  const notificationLTRootRef = useRefExtra(() => getRoot(`${dPrefix}notification-lt-root`), true);
  const notificationRTRootRef = useRefExtra(() => getRoot(`${dPrefix}notification-rt-root`), true);
  const notificationLBRootRef = useRefExtra(() => getRoot(`${dPrefix}notification-lb-root`), true);
  const notificationRBRootRef = useRefExtra(() => getRoot(`${dPrefix}notification-rb-root`), true);

  const rootRef =
    dPlacement === 'left-top'
      ? notificationLTRootRef
      : dPlacement === 'right-top'
      ? notificationRTRootRef
      : dPlacement === 'left-bottom'
      ? notificationLBRootRef
      : notificationRBRootRef;

  return (
    rootRef.current &&
    ReactDOM.createPortal(
      <DTransition
        dIn={dVisible}
        dDuring={TTANSITION_DURING}
        dSkipFirstTransition={false}
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
              transitionStyle = {
                transform: dPlacement === 'left-top' || dPlacement === 'left-bottom' ? 'translate(-100%, 0)' : 'translate(100%, 0)',
              };
              break;

            case 'entering':
              transitionStyle = {
                transition: ['transform'].map((attr) => `${attr} ${TTANSITION_DURING.enter}ms ease-out`).join(', '),
              };
              break;

            case 'leave':
              if (panelRef.current) {
                const height = panelRef.current.offsetHeight;
                transitionStyle = { height, overflow: 'hidden' };
              }
              break;

            case 'leaving':
              transitionStyle = {
                height: 0,
                overflow: 'hidden',
                paddingTop: 0,
                paddingBottom: 0,
                marginTop: 0,
                marginBottom: 0,
                opacity: 0,
                transition: ['height', 'padding', 'margin', 'opacity']
                  .map((attr) => `${attr} ${TTANSITION_DURING.leave}ms ease-in`)
                  .join(', '),
              };
              break;

            case 'leaved':
              transitionStyle = { display: 'none' };
              break;

            default:
              break;
          }

          return (
            <DAlertPopover dDuration={dDuration} dEscClosable={dEscClosable} onClose={onClose}>
              {({ render }) =>
                render(
                  <DPanel
                    {...restProps}
                    ref={panelRef}
                    style={{
                      ...restProps.style,
                      ...transitionStyle,
                    }}
                    dClassNamePrefix="notification"
                    dType={dType}
                    dIcon={dIcon}
                    dTitle={dTitle}
                    dDescription={dDescription}
                    dActions={dActions}
                    onClose={onClose}
                  ></DPanel>
                )
              }
            </DAlertPopover>
          );
        }}
      </DTransition>,
      rootRef.current
    )
  );
}

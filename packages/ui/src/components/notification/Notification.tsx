import type { DNotificationProps } from './service';

import { useRef } from 'react';

import { useComponentConfig } from '../../hooks';
import { registerComponentMate } from '../../utils';
import { DAlertPopover } from '../_alert-popover';
import { DTransition } from '../_transition';
import { DPanel } from './Panel';

const TTANSITION_DURING = { enter: 133, leave: 166 };
const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DNotification' as const });
export function DNotification(props: DNotificationProps & { dVisible: boolean }): JSX.Element | null {
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

  //#region Ref
  const panelRef = useRef<HTMLDivElement>(null);
  //#endregion

  return (
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
              const { height } = panelRef.current.getBoundingClientRect();
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
          </DAlertPopover>
        );
      }}
    </DTransition>
  );
}

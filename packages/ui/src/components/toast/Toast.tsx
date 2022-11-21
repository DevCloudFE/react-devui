import { useRef } from 'react';
import ReactDOM from 'react-dom';

import { useRefExtra } from '@react-devui/hooks';

import { registerComponentMate } from '../../utils';
import { DAlertPopover } from '../_alert-popover';
import { DTransition } from '../_transition';
import { useComponentConfig, usePrefixConfig } from '../root';
import { DPanel } from './Panel';

export interface DToastProps extends React.HTMLAttributes<HTMLDivElement> {
  dVisible: boolean;
  dType?: 'success' | 'warning' | 'error' | 'info';
  dIcon?: React.ReactNode;
  dDuration?: number;
  dPlacement?: 'top' | 'bottom';
  dEscClosable?: boolean;
  onClose?: () => void;
  afterVisibleChange?: (visible: boolean) => void;
}

const TTANSITION_DURING = { enter: 133, leave: 166 };
const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DToast' as const });
export function DToast(props: DToastProps): JSX.Element | null {
  const {
    dVisible,
    dType,
    dIcon,
    dDuration = 2,
    dPlacement = 'top',
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
    let root = document.getElementById(`${dPrefix}toast-root`);
    if (!root) {
      root = document.createElement('div');
      root.id = `${dPrefix}toast-root`;
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
  const toastTRootRef = useRefExtra(() => getRoot(`${dPrefix}toast-t-root`), true);
  const toastBRootRef = useRefExtra(() => getRoot(`${dPrefix}toast-b-root`), true);

  const rootRef = dPlacement === 'top' ? toastTRootRef : toastBRootRef;

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
                transform: dPlacement === 'top' ? 'translate(0, -70%)' : 'translate(0, 70%)',
                opacity: 0,
              };
              break;

            case 'entering':
              transitionStyle = {
                transition: ['transform', 'opacity'].map((attr) => `${attr} ${TTANSITION_DURING.enter}ms ease-out`).join(', '),
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
                    dClassNamePrefix="toast"
                    dType={dType}
                    dIcon={dIcon}
                    dActions={[]}
                    onClose={undefined}
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

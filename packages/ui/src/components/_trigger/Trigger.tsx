import { useRef } from 'react';

import { useAsync } from '../../hooks';

export type DTriggerType = 'hover' | 'focus' | 'click';

export interface DTriggerRenderProps {
  sOnMouseEnter?: () => void;
  sOnMouseLeave?: () => void;
  sOnFocus?: () => void;
  sOnBlur?: () => void;
  sOnClick?: () => void;
}

export interface DTriggerProps {
  disabled?: boolean;
  children: (props: DTriggerRenderProps) => JSX.Element | null;
  dMouseEnterDelay?: number;
  dMouseLeaveDelay?: number;
}
export function DTrigger(props: DTriggerProps & { dTrigger: 'click'; onTrigger?: () => void }): JSX.Element | null;
export function DTrigger(props: DTriggerProps & { dTrigger: 'hover' | 'focus'; onTrigger?: (state: boolean) => void }): JSX.Element | null;
export function DTrigger(props: DTriggerProps & { dTrigger: DTriggerType; onTrigger?: (state?: boolean) => void }): JSX.Element | null;
export function DTrigger(props: DTriggerProps & { dTrigger: DTriggerType; onTrigger?: (state?: any) => void }): JSX.Element | null {
  const { disabled, children, dTrigger, dMouseEnterDelay = 150, dMouseLeaveDelay = 200, onTrigger } = props;

  const dataRef = useRef<{
    clearTid?: () => void;
  }>({});

  const asyncCapture = useAsync();

  const childProps: DTriggerRenderProps = {};
  if (!disabled) {
    switch (dTrigger) {
      case 'hover':
        childProps.sOnMouseEnter = () => {
          dataRef.current.clearTid?.();
          dataRef.current.clearTid = asyncCapture.setTimeout(() => {
            onTrigger?.(true);
          }, dMouseEnterDelay);
        };
        childProps.sOnMouseLeave = () => {
          dataRef.current.clearTid?.();
          dataRef.current.clearTid = asyncCapture.setTimeout(() => {
            onTrigger?.(false);
          }, dMouseLeaveDelay);
        };
        break;

      case 'focus':
        childProps.sOnFocus = () => {
          onTrigger?.(true);
        };
        childProps.sOnBlur = () => {
          onTrigger?.(false);
        };
        break;

      case 'click':
        childProps.sOnClick = () => {
          onTrigger?.();
        };
        break;

      default:
        break;
    }
  }

  return children(childProps);
}

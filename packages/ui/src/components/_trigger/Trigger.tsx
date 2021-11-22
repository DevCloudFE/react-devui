import type { DElementSelector } from '../../hooks/element';

import { isUndefined } from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';

import { useAsync } from '../../hooks';
import { useElement } from '../../hooks/element';

export type DTriggerType = 'hover' | 'focus' | 'click';

export interface DTriggerProps {
  dTrigger?: DTriggerType | DTriggerType[];
  dMouseEnterDelay?: number;
  dMouseLeaveDelay?: number;
  dTriggerNode?: DElementSelector;
  children?: React.ReactNode;
  onTrigger?: (state?: boolean) => void;
}

export function DTrigger(props: DTriggerProps) {
  const { dTrigger, dMouseEnterDelay = 150, dMouseLeaveDelay = 200, dTriggerNode, children, onTrigger } = props;

  const [currentData] = useState<{ tid: number | null }>({
    tid: null,
  });

  const asyncCapture = useAsync();

  const triggerEl = useElement(dTriggerNode ?? null);

  //#region DidUpdate
  useEffect(() => {
    if (!isUndefined(dTriggerNode)) {
      const [asyncGroup, asyncId] = asyncCapture.createGroup();
      if (triggerEl.current) {
        if (dTrigger === 'hover') {
          asyncGroup.fromEvent(triggerEl.current, 'mouseenter').subscribe({
            next: () => {
              currentData.tid && asyncCapture.clearTimeout(currentData.tid);
              currentData.tid = asyncCapture.setTimeout(() => {
                currentData.tid = null;
                onTrigger?.(true);
              }, dMouseEnterDelay);
            },
          });
          asyncGroup.fromEvent(triggerEl.current, 'mouseleave').subscribe({
            next: () => {
              currentData.tid && asyncCapture.clearTimeout(currentData.tid);
              currentData.tid = asyncCapture.setTimeout(() => {
                currentData.tid = null;
                onTrigger?.(false);
              }, dMouseLeaveDelay);
            },
          });
        }

        if (dTrigger === 'focus') {
          asyncGroup.fromEvent(triggerEl.current, 'focus').subscribe({
            next: () => {
              currentData.tid && asyncCapture.clearTimeout(currentData.tid);
              onTrigger?.(true);
            },
          });
          asyncGroup.fromEvent(triggerEl.current, 'blur').subscribe({
            next: () => {
              currentData.tid = asyncCapture.setTimeout(() => onTrigger?.(false), 20);
            },
          });
        }

        if (dTrigger === 'click') {
          asyncGroup.fromEvent(triggerEl.current, 'click').subscribe({
            next: () => {
              currentData.tid && asyncCapture.clearTimeout(currentData.tid);
              onTrigger?.();
            },
          });
        }
      }

      return () => {
        asyncCapture.deleteGroup(asyncId);
      };
    }
  }, [asyncCapture, currentData, dMouseEnterDelay, dMouseLeaveDelay, dTrigger, dTriggerNode, onTrigger, triggerEl]);
  //#endregion

  const child = useMemo(() => {
    if (isUndefined(dTriggerNode)) {
      const _child = React.Children.only(children) as React.ReactElement<React.HTMLAttributes<HTMLElement>>;
      let childProps: React.HTMLAttributes<HTMLElement> = {};

      if (dTrigger === 'hover') {
        childProps = {
          onMouseEnter: (e) => {
            _child.props.onMouseEnter?.(e);

            currentData.tid && asyncCapture.clearTimeout(currentData.tid);
            currentData.tid = asyncCapture.setTimeout(() => {
              currentData.tid = null;
              onTrigger?.(true);
            }, dMouseEnterDelay);
          },
          onMouseLeave: (e) => {
            _child.props.onMouseLeave?.(e);

            currentData.tid && asyncCapture.clearTimeout(currentData.tid);
            currentData.tid = asyncCapture.setTimeout(() => {
              currentData.tid = null;
              onTrigger?.(false);
            }, dMouseLeaveDelay);
          },
        };
      }
      if (dTrigger === 'focus') {
        childProps = {
          onFocus: (e) => {
            _child.props.onFocus?.(e);

            currentData.tid && asyncCapture.clearTimeout(currentData.tid);
            onTrigger?.(true);
          },
          onBlur: (e) => {
            _child.props.onBlur?.(e);

            currentData.tid = asyncCapture.setTimeout(() => onTrigger?.(false), 20);
          },
        };
      }
      if (dTrigger === 'click') {
        childProps = {
          onClick: (e) => {
            _child.props.onClick?.(e);

            currentData.tid && asyncCapture.clearTimeout(currentData.tid);
            onTrigger?.();
          },
        };
      }

      return React.cloneElement<React.HTMLAttributes<HTMLElement>>(_child, {
        ..._child.props,
        ...childProps,
      });
    }

    return null;
  }, [asyncCapture, children, currentData, dMouseEnterDelay, dMouseLeaveDelay, dTrigger, dTriggerNode, onTrigger]);

  return child;
}

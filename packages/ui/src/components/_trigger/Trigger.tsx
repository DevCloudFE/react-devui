import { isUndefined } from 'lodash';
import React, { useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { useImmer } from 'use-immer';

import { useAsync } from '../../hooks';

export type DTriggerType = 'hover' | 'focus' | 'click';

export interface DTriggerProps {
  dTrigger?: DTriggerType | DTriggerType[];
  dDefaultState?: boolean;
  dMouseEnterDelay?: number;
  dMouseLeaveDelay?: number;
  dDisabled?: boolean;
  children: React.ReactNode;
  onTrigger?: (state: boolean) => void;
}

export const DTrigger = React.forwardRef<HTMLElement, DTriggerProps>((props, ref) => {
  const { dTrigger, dDefaultState = false, dMouseEnterDelay = 150, dMouseLeaveDelay = 200, dDisabled, children, onTrigger } = props;

  const asyncCapture = useAsync();

  const [currentData] = useState({
    state: dDefaultState,
  });

  //#region States.
  /*
   * @see https://reactjs.org/docs/state-and-lifecycle.html
   *
   * - Vue: data.
   * @see https://v3.vuejs.org/api/options-data.html#data-2
   * - Angular: property on a class.
   * @example
   * export class HeroChildComponent {
   *   public data: 'example';
   * }
   */
  const [el, setEl] = useImmer<HTMLElement | null>(null);
  //#endregion

  useEffect(() => {
    if (!dDisabled) {
      const [asyncGroup, asyncId] = asyncCapture.createGroup();
      if (el) {
        const setState = (state?: boolean) => {
          if (el) {
            const _state = isUndefined(state) ? !currentData.state : state;
            if (currentData.state !== _state) {
              currentData.state = _state;
              onTrigger?.(_state);
            }
          }
        };

        if (dTrigger === 'hover') {
          let tid: number | null = null;

          asyncGroup.fromEvent(el, 'mouseenter').subscribe({
            next: () => {
              tid && asyncGroup.clearTimeout(tid);
              tid = asyncGroup.setTimeout(() => {
                tid = null;
                setState(true);
              }, dMouseEnterDelay);
            },
          });
          asyncGroup.fromEvent(el, 'mouseleave').subscribe({
            next: () => {
              tid && asyncGroup.clearTimeout(tid);
              tid = asyncGroup.setTimeout(() => {
                tid = null;
                setState(false);
              }, dMouseLeaveDelay);
            },
          });
        }

        if (dTrigger === 'focus') {
          let tid: number | null = null;

          asyncGroup.fromEvent(el, 'focus').subscribe({
            next: () => {
              tid && asyncGroup.clearTimeout(tid);
              setState(true);
            },
          });
          asyncGroup.fromEvent(el, 'blur').subscribe({
            next: () => {
              tid = asyncGroup.setTimeout(() => {
                setState(false);
              }, 20);
            },
          });
        }

        if (dTrigger === 'click') {
          asyncGroup.fromEvent(el, 'click').subscribe({
            next: () => {
              setState();
            },
          });
        }
      }

      return () => {
        asyncCapture.deleteGroup(asyncId);
      };
    }
  }, [dMouseEnterDelay, dMouseLeaveDelay, dTrigger, dDisabled, onTrigger, asyncCapture, currentData, el]);

  //#region React.cloneElement.
  /*
   * @see https://reactjs.org/docs/react-api.html#cloneelement
   *
   * - Vue: Scoped Slots.
   * @see https://v3.vuejs.org/guide/component-slots.html#scoped-slots
   * - Angular: NgTemplateOutlet.
   * @see https://angular.io/api/common/NgTemplateOutlet
   */
  const child = useMemo(() => {
    const _child = children as React.ReactElement;
    let props: React.HTMLAttributes<HTMLElement> = {};
    if (dDisabled) {
      props = {
        className: _child.props.className ? _child.props.className + ' is-disabled' : 'is-disabled',
        'aria-disabled': true,
        onClick: (e) => {
          e.preventDefault();
          e.stopPropagation();
        },
        onFocus: (e) => {
          e.preventDefault();
          e.stopPropagation();
        },
      };
    }

    return React.cloneElement(_child, {
      ..._child.props,
      ...props,
      ref: (node: HTMLElement | null) => {
        setEl(node);
      },
    });
  }, [dDisabled, children, setEl]);
  //#endregion

  useImperativeHandle(ref, () => el as HTMLElement, [el]);

  return child;
});

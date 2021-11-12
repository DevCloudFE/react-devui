import type { DPopupProps, DPopupRef } from '../_popup';

import React, { useMemo } from 'react';

import { useDPrefixConfig, useDComponentConfig, useId } from '../../hooks';
import { getClassName } from '../../utils';
import { DPopup } from '../_popup';

export interface DTooltipProps extends Omit<DPopupProps, 'dTarget'> {
  dTitle: React.ReactNode;
}

export const DTooltip = React.forwardRef<DPopupRef, DTooltipProps>((props, ref) => {
  const { dTitle, className, children, ...restProps } = useDComponentConfig('tooltip', props);

  const dPrefix = useDPrefixConfig();

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
  const id = useId();
  //#endregion

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
    const _child = React.Children.only(children) as React.ReactElement;
    return React.cloneElement(_child, {
      ..._child.props,
      'aria-describedby': `d-tooltip-${id}`,
    });
  }, [children, id]);
  //#endregion

  return (
    <>
      {child}
      {dTitle && (
        <DPopup
          {...restProps}
          ref={ref}
          id={`d-tooltip-${id}`}
          className={getClassName(className, `${dPrefix}tooltip`)}
          role="tooltip"
          dTarget={`[aria-describedby="d-tooltip-${id}"]`}
        >
          {dTitle}
        </DPopup>
      )}
    </>
  );
});

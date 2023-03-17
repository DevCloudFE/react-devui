import type { DFabButtonProps } from './FabButton';

import { isUndefined } from 'lodash';
import React from 'react';

import { getClassName } from '@react-devui/utils';

import { useDValue } from '../../hooks';
import { cloneHTMLElement, registerComponentMate } from '../../utils';
import { useComponentConfig, usePrefixConfig } from '../root';
import { DFabBacktop } from './FabBacktop';
import { DFabButton } from './FabButton';

export interface DFabProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  children: React.ReactElement<DFabButtonProps>;
  dExpand?: boolean;
  dList?: { placement: 'top' | 'right' | 'bottom' | 'left'; actions: React.ReactElement<DFabButtonProps>[] }[];
  onExpandChange?: (expand: boolean) => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DFab' as const });
export const DFab: {
  (props: DFabProps): JSX.Element | null;
  Button: typeof DFabButton;
  Backtop: typeof DFabBacktop;
} = (props) => {
  const {
    children,
    dExpand,
    dList,
    onExpandChange,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const [expand, changeExpand] = useDValue<boolean>(false, dExpand, onExpandChange);

  return (
    <div {...restProps} className={getClassName(restProps.className, `${dPrefix}fab`)}>
      {cloneHTMLElement(children, {
        className: getClassName(children.props.className, { 'is-expand': expand }),
        onClick: (e) => {
          children.props.onClick?.(e);

          if (!isUndefined(dList)) {
            changeExpand((draft) => !draft);
          }
        },
      })}
      {expand &&
        dList &&
        dList.map(({ placement, actions }, key) => (
          <div key={key} className={getClassName(`${dPrefix}fab__actions`, `${dPrefix}fab__actions--${placement}`)}>
            {React.Children.map(placement === 'right' || placement === 'bottom' ? actions : [...actions].reverse(), (action, index) =>
              cloneHTMLElement(action, {
                className: getClassName(action.props.className, `${dPrefix}fab__action`),
                style: {
                  ...action.props.style,
                  animationDelay: `${(placement === 'right' || placement === 'bottom' ? index : actions.length - 1 - index) * 33}ms`,
                },
                onClick: (e) => {
                  action.props.onClick?.(e);

                  changeExpand(false);
                },
              })
            )}
          </div>
        ))}
    </div>
  );
};

DFab.Button = DFabButton;
DFab.Backtop = DFabBacktop;

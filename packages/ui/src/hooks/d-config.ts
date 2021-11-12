import type {
  DAffixProps,
  DAnchorProps,
  DAnchorLinkProps,
  DButtonProps,
  DButtonGroupProps,
  DDrawerProps,
  DDrawerHeaderProps,
  DDrawerFooterProps,
  DIconProps,
  DMenuProps,
  DMenuGroupProps,
  DMenuItemProps,
  DMenuSubProps,
  DTooltipProps,
} from '../components';

import { isUndefined } from 'lodash';
import React, { useContext } from 'react';

export type DComponentConfig = Partial<{
  affix: DAffixProps;

  anchor: DAnchorProps;
  'anchor-link': DAnchorLinkProps;

  button: DButtonProps;
  'button-group': DButtonGroupProps;

  drawer: DDrawerProps;
  'drawer-header': DDrawerHeaderProps;
  'drawer-footer': DDrawerFooterProps;

  icon: DIconProps;

  menu: DMenuProps;
  'menu-group': DMenuGroupProps;
  'menu-item': DMenuItemProps;
  'menu-sub': DMenuSubProps;

  tooltip: DTooltipProps;
}>;

export const DComponentConfigContext = React.createContext<DComponentConfig>({});
export const DPrefixConfigContext = React.createContext('d-');

export function useDComponentConfig<T>(component: keyof DComponentConfig, props: T): T {
  const dConfig = useContext(DComponentConfigContext);
  const customConfig = dConfig[component] ?? {};
  const noUndefinedProps: unknown = {};
  Object.keys(props).forEach((key) => {
    if (!isUndefined(props[key])) {
      (noUndefinedProps as T)[key] = props[key];
    }
  });
  return { ...customConfig, ...(noUndefinedProps as T) };
}

export function useDPrefixConfig() {
  const prefix = useContext(DPrefixConfigContext);
  return prefix;
}

import type {
  DAffixProps,
  DAnchorProps,
  DAnchorLinkProps,
  DButtonProps,
  DButtonGroupProps,
  DCascaderProps,
  DCheckboxProps,
  DCheckboxGroupProps,
  DComposeProps,
  DComposeItemProps,
  DDrawerProps,
  DDrawerHeaderProps,
  DDrawerFooterProps,
  DDropdownProps,
  DDropdownItemProps,
  DDropdownSubProps,
  DDropdownGroupProps,
  DEmptyProps,
  DFormProps,
  DFormItemProps,
  DFormGroupProps,
  DRowProps,
  DColProps,
  DIconProps,
  DInputProps,
  DInputAffixProps,
  DMenuProps,
  DMenuGroupProps,
  DMenuItemProps,
  DMenuSubProps,
  DNotificationProps,
  DPaginationProps,
  DRadioProps,
  DRadioGroupProps,
  DRatingProps,
  DSelectProps,
  DSeparatorProps,
  DSliderProps,
  DSwitchProps,
  DTabProps,
  DTabsProps,
  DTagProps,
  DTextareaProps,
  DToastProps,
  DTooltipProps,
} from '../components';
import type { DBreakpoints } from '../components/grid';
import type { Subject } from 'rxjs';

import { isUndefined } from 'lodash';
import React, { useContext } from 'react';

import { getFragmentChildren } from '../utils';

interface Resources {
  [index: string]: string | Resources;
}

export type DTheme = 'light' | 'dark';
export type DLang = 'en-US' | 'zh-Hant';
export interface DComponentConfig {
  DAffix: DAffixProps;
  DAnchor: DAnchorProps;
  DAnchorLink: DAnchorLinkProps;
  DButton: DButtonProps;
  DButtonGroup: DButtonGroupProps;
  DCascader: DCascaderProps;
  DCheckbox: DCheckboxProps;
  DCheckboxGroup: DCheckboxGroupProps;
  DCompose: DComposeProps;
  DComposeItem: DComposeItemProps;
  DDrawer: DDrawerProps;
  DDrawerHeader: DDrawerHeaderProps;
  DDrawerFooter: DDrawerFooterProps;
  DDropdown: DDropdownProps;
  DDropdownItem: DDropdownItemProps;
  DDropdownSub: DDropdownSubProps;
  DDropdownGroup: DDropdownGroupProps;
  DEmpty: DEmptyProps;
  DForm: DFormProps;
  DFormItem: DFormItemProps;
  DFormGroup: DFormGroupProps;
  DRow: DRowProps;
  DCol: DColProps;
  DIcon: DIconProps;
  DInput: DInputProps;
  DInputAffix: DInputAffixProps;
  DMenu: DMenuProps;
  DMenuGroup: DMenuGroupProps;
  DMenuItem: DMenuItemProps;
  DMenuSub: DMenuSubProps;
  DNotification: DNotificationProps;
  DPagination: DPaginationProps;
  DRadio: DRadioProps;
  DRadioGroup: DRadioGroupProps;
  DRating: DRatingProps;
  DSelect: DSelectProps;
  DSeparator: DSeparatorProps;
  DSlider: DSliderProps;
  DSwitch: DSwitchProps;
  DTab: DTabProps;
  DTabs: DTabsProps;
  DTag: DTagProps;
  DTextarea: DTextareaProps;
  DToast: DToastProps;
  DTooltip: DTooltipProps;
}
export interface DConfigContextData {
  prefix?: string;
  theme?: DTheme;
  grid?: {
    breakpoints?: Map<DBreakpoints, number>;
    colNum?: number;
  };
  componentConfigs?: Partial<DComponentConfig>;
  i18n?: {
    lang?: DLang;
    resources?: Resources;
  };
  icons?: {
    name: string;
    list: {
      viewBox: string;
      paths: string[];
      type?: string;
    }[];
  }[];
  onScrollViewChange$?: Subject<void>;
}
export const DConfigContext = React.createContext<DConfigContextData>({});

export function usePrefixConfig() {
  const prefix = useContext(DConfigContext).prefix ?? 'd-';
  return prefix;
}

const BREAKPOINTS = new Map<DBreakpoints, number>([
  ['xs', 0],
  ['sm', 576],
  ['md', 768],
  ['lg', 992],
  ['xl', 1200],
  ['xxl', 1400],
]);
export function useGridConfig() {
  const grid = useContext(DConfigContext).grid;
  const breakpoints = grid?.breakpoints ?? BREAKPOINTS;
  const colNum = grid?.colNum ?? 12;

  return {
    breakpoints,
    colNum,
  };
}

export function useThemeConfig() {
  const theme = useContext(DConfigContext).theme ?? 'light';
  return theme;
}

export function useComponentConfig<T>(component: keyof DComponentConfig, props: T): T {
  const componentConfigs = useContext(DConfigContext).componentConfigs ?? {};
  const customConfig = componentConfigs[component] ?? {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const noUndefinedProps: any = {};
  Object.keys(props).forEach((key) => {
    if (!isUndefined(props[key])) {
      (noUndefinedProps as T)[key] = props[key];
    }
  });

  let children: React.ReactNode = undefined;
  if ('children' in noUndefinedProps) {
    children = getFragmentChildren(noUndefinedProps.children);
  } else if ('children' in customConfig) {
    children = getFragmentChildren(customConfig.children);
  }

  return { ...customConfig, ...(noUndefinedProps as T), children };
}

export function useContentSVChangeConfig() {
  return useContext(DConfigContext).onScrollViewChange$;
}

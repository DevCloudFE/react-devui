import type {
  DAffixProps,
  DAnchorProps,
  DButtonProps,
  DCascaderProps,
  DCheckboxProps,
  DCheckboxGroupProps,
  DComposeProps,
  DComposeItemProps,
  DDrawerProps,
  DDrawerHeaderProps,
  DDrawerFooterProps,
  DDropdownProps,
  DEmptyProps,
  DFormProps,
  DFormItemProps,
  DFormGroupProps,
  DRowProps,
  DColProps,
  DInputProps,
  DMenuProps,
  DNotificationProps,
  DPaginationProps,
  DRadioProps,
  DRadioGroupProps,
  DRatingProps,
  DSelectProps,
  DSeparatorProps,
  DSliderProps,
  DSwitchProps,
  DTabsProps,
  DTagProps,
  DTextareaProps,
  DToastProps,
  DTooltipProps,
} from '../../components';
import type { DBreakpoints } from '../../components/grid';
import type { DIconBaseProps } from '../../icons';
import type { DLang, DTheme } from '../../utils/global';

import React from 'react';

interface Resources {
  [index: string]: string | Resources;
}

export type DComponentConfig = {
  DAffix: DAffixProps;
  DAnchor: DAnchorProps;
  DButton: DButtonProps;
  DCascader: DCascaderProps<any, any>;
  DCheckbox: DCheckboxProps;
  DCheckboxGroup: DCheckboxGroupProps<any>;
  DCompose: DComposeProps;
  DComposeItem: DComposeItemProps;
  DDrawer: DDrawerProps;
  DDrawerHeader: DDrawerHeaderProps;
  DDrawerFooter: DDrawerFooterProps;
  DDropdown: DDropdownProps<any, any>;
  DEmpty: DEmptyProps;
  DForm: DFormProps;
  DFormItem: DFormItemProps<any>;
  DFormGroup: DFormGroupProps;
  DRow: DRowProps;
  DCol: DColProps;
  DInput: DInputProps;
  DMenu: DMenuProps<any, any>;
  DNotification: DNotificationProps;
  DPagination: DPaginationProps;
  DRadio: DRadioProps;
  DRadioGroup: DRadioGroupProps<any>;
  DRating: DRatingProps;
  DSelect: DSelectProps<any, any>;
  DSeparator: DSeparatorProps;
  DSlider: DSliderProps;
  DSwitch: DSwitchProps;
  DTabs: DTabsProps<any, any>;
  DTag: DTagProps;
  DTextarea: DTextareaProps;
  DToast: DToastProps;
  DTooltip: DTooltipProps;
} & { DIcon: Omit<DIconBaseProps, 'children'> };

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
}
export const DConfigContext = React.createContext<DConfigContextData | undefined>(undefined);

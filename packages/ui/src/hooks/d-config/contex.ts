import type {
  DAffixProps,
  DAnchorProps,
  DAutoCompleteProps,
  DBadgeProps,
  DButtonProps,
  DCascaderProps,
  DCheckboxProps,
  DCheckboxGroupProps,
  DComposeProps,
  DComposeItemProps,
  DDatePickerProps,
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
  DModalProps,
  DModalHeaderProps,
  DModalFooterProps,
  DNotificationProps,
  DPaginationProps,
  DProgressProps,
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
  DTimePickerProps,
  DToastProps,
  DTooltipProps,
  DTransferProps,
  DUploadProps,
} from '../../components';
import type { DBreakpoints } from '../../components/grid';
import type { DIconBaseProps } from '../../icons';
import type { DLang } from '../../utils/global';
import type { DElementSelector } from '../ui/useElement';

import React from 'react';

interface Resources {
  [index: string]: string | Resources;
}

export type DComponentConfig = {
  DAffix: DAffixProps;
  DAnchor: DAnchorProps;
  DAutoComplete: DAutoCompleteProps<any>;
  DBadge: DBadgeProps;
  DButton: DButtonProps;
  DCascader: DCascaderProps<any, any>;
  DCheckbox: DCheckboxProps;
  DCheckboxGroup: DCheckboxGroupProps<any>;
  DCompose: DComposeProps;
  DDatePicker: DDatePickerProps;
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
  DModal: DModalProps;
  DModalHeader: DModalHeaderProps;
  DModalFooter: DModalFooterProps;
  DNotification: DNotificationProps;
  DPagination: DPaginationProps;
  DProgress: DProgressProps;
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
  DTimePicker: DTimePickerProps;
  DToast: DToastProps;
  DTooltip: DTooltipProps;
  DTransfer: DTransferProps<any, any>;
  DUpload: DUploadProps;
} & { DIcon: Omit<DIconBaseProps, 'children'> };

export interface DConfigContextData {
  prefix?: string;
  grid?: {
    breakpoints?: Map<DBreakpoints, number>;
    colNum?: number;
  };
  componentConfigs?: Partial<DComponentConfig>;
  i18n?: {
    lang?: DLang;
    resources?: Resources;
  };
  updatePosition?: {
    scroll?: DElementSelector[];
    resize?: DElementSelector[];
  };
}
export const DConfigContext = React.createContext<DConfigContextData | undefined>(undefined);

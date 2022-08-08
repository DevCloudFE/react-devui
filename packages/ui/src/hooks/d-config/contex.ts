import type {
  DAccordionProps,
  DAffixProps,
  DAlertProps,
  DAnchorProps,
  DAutoCompleteProps,
  DAvatarProps,
  DBackTopProps,
  DBadgeProps,
  DBreadcrumbProps,
  DButtonProps,
  DCardProps,
  DCardHeaderProps,
  DCardContentProps,
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
  DFormGroupProps,
  DFormItemProps,
  DRowProps,
  DColProps,
  DImageProps,
  DImagePreviewProps,
  DInputProps,
  DMenuProps,
  DModalProps,
  DModalHeaderProps,
  DModalFooterProps,
  DNotificationProps,
  DPaginationProps,
  DPopoverProps,
  DPopoverHeaderProps,
  DPopoverFooterProps,
  DProgressProps,
  DRadioProps,
  DRadioGroupProps,
  DRatingProps,
  DSelectProps,
  DSeparatorProps,
  DSkeletonProps,
  DSliderProps,
  DSlidesProps,
  DSlideProps,
  DSpinnerProps,
  DStepperProps,
  DSwitchProps,
  DTabsProps,
  DTagProps,
  DTextareaProps,
  DTimePickerProps,
  DTimelineProps,
  DToastProps,
  DTooltipProps,
  DTransferProps,
  DTreeProps,
  DUploadProps,
  DUploadActionProps,
  DVirtualScrollProps,
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
  DAccordion: DAccordionProps<any, any>;
  DAffix: DAffixProps;
  DAlert: DAlertProps;
  DAnchor: DAnchorProps<any>;
  DAutoComplete: DAutoCompleteProps<any>;
  DAvatar: DAvatarProps;
  DBackTop: DBackTopProps;
  DBadge: DBadgeProps;
  DBreadcrumb: DBreadcrumbProps<any, any>;
  DButton: DButtonProps;
  DCard: DCardProps;
  'DCard.Header': DCardHeaderProps;
  'DCard.Content': DCardContentProps;
  DCascader: DCascaderProps<any, any>;
  DCheckbox: DCheckboxProps;
  'DCheckbox.Group': DCheckboxGroupProps<any>;
  DCompose: DComposeProps;
  DDatePicker: DDatePickerProps;
  'DCompose.Item': DComposeItemProps;
  DDrawer: DDrawerProps;
  'DDrawer.Header': DDrawerHeaderProps;
  'DDrawer.Footer': DDrawerFooterProps;
  DDropdown: DDropdownProps<any, any>;
  DEmpty: DEmptyProps;
  DForm: DFormProps;
  'DForm.Group': DFormGroupProps;
  'DForm.Item': DFormItemProps<any>;
  DRow: DRowProps;
  DCol: DColProps;
  DImage: DImageProps;
  'DImage.Preview': DImagePreviewProps;
  DInput: DInputProps;
  DMenu: DMenuProps<any, any>;
  DModal: DModalProps;
  'DModal.Header': DModalHeaderProps;
  'DModal.Footer': DModalFooterProps;
  DNotification: DNotificationProps;
  DPagination: DPaginationProps;
  DPopover: DPopoverProps;
  'DPopover.Header': DPopoverHeaderProps;
  'DPopover.Footer': DPopoverFooterProps;
  DProgress: DProgressProps;
  DRadio: DRadioProps;
  'DRadio.Group': DRadioGroupProps<any>;
  DRating: DRatingProps;
  DSelect: DSelectProps<any, any>;
  DSeparator: DSeparatorProps;
  DSkeleton: DSkeletonProps;
  DSlider: DSliderProps;
  DSlides: DSlidesProps;
  'DSlides.Slide': DSlideProps;
  DSpinner: DSpinnerProps;
  DStepper: DStepperProps<any>;
  DSwitch: DSwitchProps;
  DTabs: DTabsProps<any, any>;
  DTag: DTagProps;
  DTextarea: DTextareaProps;
  DTimePicker: DTimePickerProps;
  DTimeline: DTimelineProps<any>;
  DToast: DToastProps;
  DTooltip: DTooltipProps;
  DTransfer: DTransferProps<any, any>;
  DTree: DTreeProps<any, any>;
  DUpload: DUploadProps;
  'DUpload.Action': DUploadActionProps;
  DVirtualScroll: DVirtualScrollProps<any>;
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
  layout?: {
    scrollEl?: DElementSelector;
    resizeEl?: DElementSelector;
  };
}
export const DConfigContext = React.createContext<DConfigContextData | undefined>(undefined);

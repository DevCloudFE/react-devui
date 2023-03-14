/* eslint-disable @typescript-eslint/no-this-alias */
import type { DLang } from '../../utils/types';
import type { DAccordionProps } from '../accordion';
import type { DAffixProps } from '../affix';
import type { DAlertProps } from '../alert';
import type { DAnchorProps } from '../anchor';
import type { DAutoCompleteProps } from '../auto-complete';
import type { DAvatarProps } from '../avatar';
import type { DBadgeProps } from '../badge';
import type { DBreadcrumbProps } from '../breadcrumb';
import type { DButtonProps } from '../button';
import type { DCardProps, DCardActionsProps, DCardActionProps, DCardHeaderProps, DCardContentProps } from '../card';
import type { DCascaderProps } from '../cascader';
import type { DCheckboxProps, DCheckboxGroupProps } from '../checkbox';
import type { DComposeProps, DComposeItemProps } from '../compose';
import type { DDatePickerProps } from '../date-picker';
import type { DDrawerProps, DDrawerHeaderProps, DDrawerFooterProps } from '../drawer';
import type { DDropdownProps } from '../dropdown';
import type { DEmptyProps } from '../empty';
import type { DFabProps, DFabButtonProps, DFabBacktopProps } from '../fab';
import type { DFormProps, DFormGroupProps, DFormItemProps } from '../form';
import type { DImageProps, DImageActionProps, DImagePreviewProps } from '../image';
import type { DInputProps } from '../input';
import type { DMenuProps } from '../menu';
import type { DModalProps, DModalHeaderProps, DModalFooterProps } from '../modal';
import type { DNotificationProps } from '../notification';
import type { DPaginationProps } from '../pagination';
import type { DPopoverProps, DPopoverHeaderProps, DPopoverFooterProps } from '../popover';
import type { DProgressProps } from '../progress';
import type { DRadioProps, DRadioGroupProps } from '../radio';
import type { DRatingProps } from '../rating';
import type { DSelectProps } from '../select';
import type { DSeparatorProps } from '../separator';
import type { DSkeletonProps } from '../skeleton';
import type { DSliderProps } from '../slider';
import type { DSlidesProps } from '../slides';
import type { DSpinnerProps } from '../spinner';
import type { DStepperProps } from '../stepper';
import type { DSwitchProps } from '../switch';
import type {
  DTableProps,
  DTableThProps,
  DTableThActionProps,
  DTableTdProps,
  DTableEmptyProps,
  DTableFilterProps,
  DTableSearchProps,
  DTableExpandProps,
} from '../table';
import type { DTabsProps } from '../tabs';
import type { DTagProps } from '../tag';
import type { DTextareaProps } from '../textarea';
import type { DTimePickerProps } from '../time-picker';
import type { DTimelineProps } from '../timeline';
import type { DToastProps } from '../toast';
import type { DTooltipProps } from '../tooltip';
import type { DTransferProps } from '../transfer';
import type { DTreeProps } from '../tree';
import type { DTreeSelectProps } from '../tree-select';
import type { DUploadProps, DUploadActionProps, DUploadListProps, DUploadPictureButtonProps } from '../upload';
import type { DVirtualScrollProps } from '../virtual-scroll';
import type resources from './resources.json';
import type { DRefExtra } from '@react-devui/hooks/useRefExtra';
import type { DIconProps } from '@react-devui/icons/Icon';

import { get, isString, set } from 'lodash';
import React from 'react';

export type DComponentConfig = {
  DAccordion: DAccordionProps<any, any>;
  DAffix: DAffixProps;
  DAlert: DAlertProps;
  DAnchor: DAnchorProps<any>;
  DAutoComplete: DAutoCompleteProps<any>;
  DAvatar: DAvatarProps;
  DBadge: DBadgeProps;
  DBreadcrumb: DBreadcrumbProps<any, any>;
  DButton: DButtonProps;
  DCard: DCardProps;
  'DCard.Actions': DCardActionsProps;
  'DCard.Action': DCardActionProps;
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
  DFab: DFabProps;
  'DFab.Button': DFabButtonProps;
  'DFab.Backtop': DFabBacktopProps;
  DForm: DFormProps;
  'DForm.Group': DFormGroupProps;
  'DForm.Item': DFormItemProps<any>;
  DImage: DImageProps;
  'DImage.Action': DImageActionProps;
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
  DSlides: DSlidesProps<any, any>;
  DSpinner: DSpinnerProps;
  DStepper: DStepperProps<any>;
  DSwitch: DSwitchProps;
  DTable: DTableProps;
  'DTable.Th': DTableThProps;
  'DTable.ThAction': DTableThActionProps;
  'DTable.Td': DTableTdProps;
  'DTable.Empty': DTableEmptyProps;
  'DTable.Filter': DTableFilterProps<any, any>;
  'DTable.Search': DTableSearchProps;
  'DTable.Expand': DTableExpandProps;
  DTabs: DTabsProps<any, any>;
  DTag: DTagProps;
  DTextarea: DTextareaProps;
  DTimePicker: DTimePickerProps;
  DTimeline: DTimelineProps<any>;
  DToast: DToastProps;
  DTooltip: DTooltipProps;
  DTransfer: DTransferProps<any, any>;
  DTree: DTreeProps<any, any>;
  DTreeSelect: DTreeSelectProps<any, any>;
  DUpload: DUploadProps;
  'DUpload.Action': DUploadActionProps;
  'DUpload.List': DUploadListProps;
  'DUpload.PictureButton': DUploadPictureButtonProps;
  DVirtualScroll: DVirtualScrollProps<any>;
} & { DIcon: Omit<DIconProps, 'dIcon'> };

type PartialContext<T extends object> = { [K in keyof T]?: T[K] extends object ? PartialContext<T[K]> : T[K] };
interface DConfigContextData {
  namespace: string;
  componentConfigs: Partial<DComponentConfig>;
  i18n: {
    lang: DLang;
    resources: typeof resources;
  };
  layout: {
    pageScrollEl?: DRefExtra;
    contentResizeEl?: DRefExtra;
  };
  globalScroll: boolean;
}
export type DPartialConfigContextData = PartialContext<DConfigContextData>;
export class DConfigContextManager {
  public namespace: string;
  public componentConfigs: Partial<DComponentConfig>;
  public i18n: {
    lang: DLang;
    resources: typeof resources;
  };
  public layout: {
    pageScrollEl?: DRefExtra;
    contentResizeEl?: DRefExtra;
  };
  public globalScroll: boolean;

  get parent(): DConfigContextManager | null {
    return this._parent;
  }
  get root(): DConfigContextManager {
    let data: DConfigContextManager = this;

    while (data.parent) {
      data = data.parent;
    }

    return data;
  }

  private _parent: DConfigContextManager | null = null;

  constructor(data: DConfigContextData) {
    this.namespace = data.namespace;
    this.componentConfigs = data.componentConfigs;
    this.i18n = data.i18n;
    this.layout = data.layout;
    this.globalScroll = data.globalScroll;
  }

  setParent(parent: DConfigContextManager): void {
    this._parent = parent;
  }

  mergeContext(context: DPartialConfigContextData): DConfigContextData {
    const newContext: any = {};

    const mergeContext = (path: string[], defaultValue: any) => {
      set(newContext, path, get(context, path) ?? defaultValue);
    };

    mergeContext(['namespace'], this.namespace);

    mergeContext(['componentConfigs'], this.componentConfigs);

    mergeContext(['i18n', 'lang'], this.i18n.lang);
    const mergeResources = (path: string[], value: string | object) => {
      if (isString(value)) {
        mergeContext(path, value);
      } else {
        Object.entries(value).forEach(([k, v]) => {
          mergeResources(path.concat(k), v);
        });
      }
    };
    mergeResources(['i18n', 'resources'], this.i18n.resources);

    mergeContext(['layout', 'pageScrollEl'], this.layout.pageScrollEl);
    mergeContext(['layout', 'contentResizeEl'], this.layout.contentResizeEl);

    return newContext;
  }
}

export const DConfigContext = React.createContext<DConfigContextManager | null>(null);

import type { DUploadFile } from './Upload';

import { isUndefined } from 'lodash';
import React from 'react';

import { usePrefixConfig, useComponentConfig, useTranslation } from '../../hooks';
import { DeleteOutlined, DownloadOutlined, EyeOutlined } from '../../icons';
import { registerComponentMate, getClassName } from '../../utils';
import { saveFile } from './utils';

export interface DUploadActionProps extends React.HTMLAttributes<HTMLElement> {
  dPreset?: 'preview' | 'download' | 'remove';
}

export interface DUploadActionPropsWithPrivate extends DUploadActionProps {
  __file: DUploadFile;
  __defaultActions?: {
    preview?: (file: DUploadFile) => void;
    download?: (file: DUploadFile) => void;
  };
  __onRemove?: () => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DUpload.Action' });
function UploadAction(props: DUploadActionProps, ref: React.ForwardedRef<any>): JSX.Element | null {
  const {
    children,
    dPreset,
    __file,
    __defaultActions,
    __onRemove,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props as DUploadActionPropsWithPrivate);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const [t] = useTranslation();

  const defaultAction = dPreset === 'preview' ? __defaultActions?.preview : dPreset === 'download' ? __defaultActions?.download : undefined;

  return dPreset === 'preview' ? (
    <a
      className={getClassName(`${dPrefix}upload__item-action`, `${dPrefix}upload__item-action--preview`, {
        'is-disabled': isUndefined(__file.url),
      })}
      target={restProps['target'] ?? '_blank'}
      href={restProps['href'] ?? __file.url}
      title={restProps.title ?? t('Upload', 'Preview file')}
      onClick={(e) => {
        if (!isUndefined(defaultAction)) {
          e.preventDefault();

          defaultAction(__file);
        }
      }}
    >
      {children ?? <EyeOutlined />}
    </a>
  ) : dPreset === 'download' ? (
    <button
      {...restProps}
      ref={ref}
      className={getClassName(restProps.className, `${dPrefix}upload__item-action`)}
      type={restProps['type'] ?? 'button'}
      disabled={isUndefined(__file.url)}
      onClick={(e) => {
        restProps.onClick?.(e);

        if (!isUndefined(defaultAction)) {
          defaultAction(__file);
        } else {
          saveFile(__file.url!, __file.name);
        }
      }}
      title={restProps.title ?? t('Upload', 'Download file')}
    >
      {children ?? <DownloadOutlined />}
    </button>
  ) : dPreset === 'remove' ? (
    <button
      {...restProps}
      ref={ref}
      className={getClassName(restProps.className, `${dPrefix}upload__item-action`)}
      type={restProps['type'] ?? 'button'}
      onClick={(e) => {
        restProps.onClick?.(e);

        __onRemove?.();
      }}
      title={restProps.title ?? t('Upload', 'Remove file')}
    >
      {children ?? <DeleteOutlined />}
    </button>
  ) : (
    <button
      {...restProps}
      ref={ref}
      className={getClassName(restProps.className, `${dPrefix}upload__item-action`)}
      type={restProps['type'] ?? 'button'}
    >
      {children}
    </button>
  );
}

export const DUploadAction = React.forwardRef(UploadAction);

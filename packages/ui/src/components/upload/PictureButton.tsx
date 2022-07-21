import type { DUploadFile } from './Upload';
import type { DUploadActionPropsWithPrivate } from './UploadAction';

import React from 'react';

import { usePrefixConfig, useTranslation } from '../../hooks';
import { FileTwoTone, LoadingOutlined, PlusOutlined } from '../../icons';
import { getClassName } from '../../utils';
import { DUploadAction } from './UploadAction';

export interface DPictureButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  dFile?: DUploadFile;
  dDefaultActions?: {
    preview?: (file: DUploadFile) => void;
    download?: (file: DUploadFile) => void;
  };
  dActions?: React.ReactNode[];
  onRemove?: () => void;
}

export function DPictureButton(props: DPictureButtonProps): JSX.Element | null {
  const {
    dFile,
    dActions = [<DUploadAction dPreset="preview" />, <DUploadAction dPreset="remove" />],
    dDefaultActions,
    onRemove,

    ...restProps
  } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const [t] = useTranslation();

  const isLoading = dFile && dFile.status === 'progress';

  return (
    <div
      {...restProps}
      tabIndex={restProps.tabIndex ?? 0}
      className={getClassName(restProps.className, `${dPrefix}upload__picture-item`, `${dPrefix}upload__picture-item--button`, {
        'is-disabled': isLoading,
        [`${dPrefix}upload__picture-item--${dFile?.status}`]: dFile,
      })}
    >
      {dFile && dFile.status !== 'progress' ? (
        <>
          {dFile.thumbUrl ? (
            <img className={`${dPrefix}upload__picture-preview`} src={dFile.thumbUrl} alt={dFile.name} />
          ) : (
            <>
              <FileTwoTone dSize={28} dTheme={dFile.status === 'error' ? 'danger' : 'primary'} />
              <div className={`${dPrefix}upload__picture-name`}>{dFile.name}</div>
            </>
          )}
          <div className={`${dPrefix}upload__picture-actions`}>
            {React.Children.map(dActions as any[], (action) =>
              React.cloneElement<DUploadActionPropsWithPrivate>(action, {
                ...action.props,
                onClick: (e) => {
                  action.props.onClick?.(e);

                  e.stopPropagation();
                },
                __file: dFile,
                __defaultActions: dDefaultActions,
                __onRemove: onRemove,
              })
            )}
          </div>
        </>
      ) : (
        <>
          <div className={`${dPrefix}upload__picture-button-icon`}>{isLoading ? <LoadingOutlined dSpin /> : <PlusOutlined />}</div>
          <div className={`${dPrefix}upload__picture-button-text`}>{t('Upload', isLoading ? 'Uploading' : 'Upload')}</div>
        </>
      )}
    </div>
  );
}

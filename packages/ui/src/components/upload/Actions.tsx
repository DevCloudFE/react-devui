import type { DUploadFile } from './Upload';

import { isUndefined } from 'lodash';
import React from 'react';

import { usePrefixConfig, useTranslation } from '../../hooks';
import { DeleteOutlined, DownloadOutlined, EyeOutlined } from '../../icons';
import { getClassName } from '../../utils';
import { saveFile } from './utils';

export interface DActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  dFile: DUploadFile;
  dDefaultActions?: {
    preview?: (file: DUploadFile) => void;
    download?: (file: DUploadFile) => void;
  };
  dActions?: (React.ReactElement<React.ButtonHTMLAttributes<HTMLButtonElement>> | 'preview' | 'download' | 'remove')[];
  onRemove?: (file: DUploadFile) => void;
}

export function DActions(props: DActionsProps): JSX.Element | null {
  const {
    dFile,
    dActions = ['preview', 'remove'],
    dDefaultActions,
    onRemove,

    ...restProps
  } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const [t] = useTranslation();

  return (
    <div {...restProps}>
      {dActions.map((action, index) =>
        action === 'preview' ? (
          <a
            key="preview"
            className={getClassName(`${dPrefix}upload__item-action`, {
              'is-disabled': isUndefined(dFile.url),
            })}
            target="_blank"
            href={dFile.url}
            rel="noreferrer"
            title={t('Upload', 'Preview file')}
            onClick={(e) => {
              if (!isUndefined(dDefaultActions?.preview)) {
                e.preventDefault();

                dDefaultActions!.preview(dFile);
              }
            }}
          >
            <EyeOutlined />
          </a>
        ) : action === 'download' ? (
          <button
            key="download"
            className={`${dPrefix}upload__item-action`}
            title={t('Upload', 'Download file')}
            disabled={isUndefined(dFile.url)}
            onClick={() => {
              if (!isUndefined(dDefaultActions?.download)) {
                dDefaultActions!.download(dFile);
              } else {
                saveFile(dFile.url!, dFile.name);
              }
            }}
          >
            <DownloadOutlined />
          </button>
        ) : action === 'remove' ? (
          <button
            key="remove"
            className={`${dPrefix}upload__item-action`}
            title={t('Upload', 'Remove file')}
            onClick={() => {
              onRemove?.(dFile);
            }}
          >
            <DeleteOutlined />
          </button>
        ) : (
          React.cloneElement(action, {
            ...action.props,
            key: index,
            className: getClassName(action.props.className, `${dPrefix}upload__item-action`),
          })
        )
      )}
    </div>
  );
}

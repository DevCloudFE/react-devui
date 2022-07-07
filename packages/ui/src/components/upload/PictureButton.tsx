import type { DUploadFile } from './Upload';

import { usePrefixConfig, useTranslation } from '../../hooks';
import { FileTwoTone, LoadingOutlined, PlusOutlined } from '../../icons';
import { getClassName } from '../../utils';
import { DActions } from './Actions';

export interface DPictureButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  dFile?: DUploadFile;
  dDefaultActions?: {
    preview?: (file: DUploadFile) => void;
    download?: (file: DUploadFile) => void;
  };
  dActions?: (React.ReactElement<React.ButtonHTMLAttributes<HTMLButtonElement>> | 'preview' | 'download' | 'remove')[];
  onRemove?: () => void;
}

export function DPictureButton(props: DPictureButtonProps): JSX.Element | null {
  const {
    dFile,
    dActions = ['preview', 'remove'],
    dDefaultActions,
    onRemove,

    className,
    tabIndex = 0,
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
      tabIndex={tabIndex}
      className={getClassName(className, `${dPrefix}upload__picture-item`, `${dPrefix}upload__picture-item--button`, {
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
          <DActions
            className={`${dPrefix}upload__picture-actions`}
            dFile={dFile}
            dDefaultActions={dDefaultActions}
            dActions={dActions}
            onRemove={onRemove}
            onClick={(e) => {
              e.stopPropagation();
            }}
          ></DActions>
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

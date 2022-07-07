import type { DId } from '../../utils/global';
import type { DUploadFile } from './Upload';

import { isNumber } from 'lodash';
import React, { useState } from 'react';

import { useImmer, useMount, usePrefixConfig, useTranslation } from '../../hooks';
import { FileTwoTone } from '../../icons';
import { getClassName } from '../../utils';
import { TTANSITION_DURING_BASE } from '../../utils/global';
import { DTransition } from '../_transition';
import { DProgress } from '../progress';
import { DActions } from './Actions';

export interface DPictureProps {
  children: React.ReactNode;
  dFileList: DUploadFile[];
  dDefaultActions?: {
    preview?: (file: DUploadFile) => void;
    download?: (file: DUploadFile) => void;
  };
  dActions: (
    file: DUploadFile,
    index: number
  ) => (React.ReactElement<React.ButtonHTMLAttributes<HTMLButtonElement>> | 'preview' | 'download' | 'remove')[];
  onRemove: (file: DUploadFile) => void;
}

export function DPicture(props: DPictureProps): JSX.Element | null {
  const { children, dFileList, dDefaultActions, dActions, onRemove } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const [t] = useTranslation();

  const [removeUIDs, setRemoveUIDs] = useImmer<DId[]>([]);
  const [skipFirstTransition, setSkipFirstTransition] = useState(true);

  useMount(() => {
    setSkipFirstTransition(false);
  });

  return (
    <ul className={`${dPrefix}upload__picture`}>
      {dFileList.map((file, index) => {
        const actions = dActions(file, index);
        const isLoading = file && file.status === 'progress';

        return (
          <DTransition
            key={file.uid}
            dIn={!removeUIDs.includes(file.uid)}
            dDuring={TTANSITION_DURING_BASE}
            dSkipFirstTransition={skipFirstTransition}
            afterLeave={() => {
              setRemoveUIDs((draft) => {
                draft.splice(
                  draft.findIndex((uid) => uid === file.uid),
                  1
                );
              });
              onRemove(file);
            }}
          >
            {(state) => {
              let transitionStyle: React.CSSProperties = {};
              switch (state) {
                case 'enter':
                  transitionStyle = { transform: 'scale(0)' };
                  break;

                case 'entering':
                  transitionStyle = {
                    transition: `transform ${TTANSITION_DURING_BASE}ms ease-out`,
                    transformOrigin: 'top left',
                  };
                  break;

                case 'leaving':
                  transitionStyle = {
                    transform: 'scale(0)',
                    transition: `transform ${TTANSITION_DURING_BASE}ms ease-in`,
                    transformOrigin: 'top left',
                  };
                  break;

                case 'leaved':
                  transitionStyle = { display: 'none' };
                  break;

                default:
                  break;
              }

              return (
                <li
                  className={getClassName(`${dPrefix}upload__picture-item`, `${dPrefix}upload__picture-item--${file.status}`, {
                    'is-disabled': isLoading,
                  })}
                  style={transitionStyle}
                >
                  {file.status !== 'progress' ? (
                    <>
                      {file.thumbUrl ? (
                        <img className={`${dPrefix}upload__picture-preview`} src={file.thumbUrl} alt={file.name} />
                      ) : (
                        <>
                          <FileTwoTone dSize={28} dTheme={file.status === 'error' ? 'danger' : 'primary'} />
                          <div className={`${dPrefix}upload__picture-name`}>{file.name}</div>
                        </>
                      )}
                      <DActions
                        className={`${dPrefix}upload__picture-actions`}
                        dFile={file}
                        dDefaultActions={dDefaultActions}
                        dActions={actions}
                        onRemove={() => {
                          setRemoveUIDs((draft) => {
                            draft.push(file.uid);
                          });
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      ></DActions>
                    </>
                  ) : (
                    <>
                      <div className={`${dPrefix}upload__picture-text`}>{t('Upload', 'Uploading')}</div>
                      {isNumber(file.percent) && <DProgress dPercent={file.percent} dLineWidth={2} dLabel={false}></DProgress>}
                    </>
                  )}
                </li>
              );
            }}
          </DTransition>
        );
      })}
      {children}
    </ul>
  );
}

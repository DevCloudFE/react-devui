import type { DId } from '../../utils/global';
import type { DUploadFile } from './Upload';
import type { DUploadActionPropsWithPrivate } from './UploadAction';

import { isNumber, isUndefined } from 'lodash';
import React, { useState } from 'react';

import { useImmer, useMount, usePrefixConfig } from '../../hooks';
import { FileTwoTone, LoadingOutlined } from '../../icons';
import { getClassName } from '../../utils';
import { TTANSITION_DURING_BASE } from '../../utils/global';
import { DCollapseTransition } from '../_transition';
import { DProgress } from '../progress';

export interface DPictureListProps {
  dFileList: DUploadFile[];
  dDefaultActions?: {
    preview?: (file: DUploadFile) => void;
    download?: (file: DUploadFile) => void;
  };
  dActions: (file: DUploadFile, index: number) => React.ReactNode[];
  onRemove: (file: DUploadFile) => void;
}

export function DPictureList(props: DPictureListProps): JSX.Element | null {
  const { dFileList, dDefaultActions, dActions, onRemove } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const [removeUIDs, setRemoveUIDs] = useImmer<DId[]>([]);
  const [skipFirstTransition, setSkipFirstTransition] = useState(true);

  useMount(() => {
    setSkipFirstTransition(false);
  });

  return (
    <ul className={getClassName(`${dPrefix}upload__list`, `${dPrefix}upload__list--picture`)}>
      {dFileList.map((file, index) => {
        const actions = dActions(file, index);

        return (
          <DCollapseTransition
            key={file.uid}
            dSize={0}
            dIn={!removeUIDs.includes(file.uid)}
            dDuring={TTANSITION_DURING_BASE}
            dStyles={{
              entering: {
                transition: ['height', 'padding', 'margin'].map((attr) => `${attr} ${TTANSITION_DURING_BASE}ms ease-out`).join(', '),
              },
              leaving: {
                transition: ['height', 'padding', 'margin'].map((attr) => `${attr} ${TTANSITION_DURING_BASE}ms ease-in`).join(', '),
              },
              leaved: { display: 'none' },
            }}
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
            {(ref, collapseStyle) => (
              <li
                ref={ref}
                className={getClassName(
                  `${dPrefix}upload__list-item`,
                  `${dPrefix}upload__list-item--picture`,
                  `${dPrefix}upload__list-item--${file.status}`,
                  {
                    [`${dPrefix}upload__list-item--first`]: index === 0,
                  }
                )}
                style={collapseStyle}
              >
                <div className={`${dPrefix}upload__list-icon`}>
                  {file.status === 'progress' ? (
                    <LoadingOutlined dSpin />
                  ) : file.thumbUrl ? (
                    <img className={`${dPrefix}upload__picture-preview`} src={file.thumbUrl} alt={file.name} />
                  ) : (
                    <FileTwoTone dTheme={file.status === 'error' ? 'danger' : 'primary'} />
                  )}
                </div>
                <a
                  className={getClassName(`${dPrefix}upload__list-link`, {
                    'is-active': file.status === 'load' && !isUndefined(file.url),
                  })}
                  target="_blank"
                  href={file.url}
                  rel="noreferrer"
                  title={file.name}
                  onClick={(e) => {
                    if (!isUndefined(dDefaultActions?.preview)) {
                      e.preventDefault();

                      dDefaultActions!.preview(file);
                    }
                  }}
                >
                  {file.name}
                </a>
                <div className={`${dPrefix}upload__list-actions`}>
                  {React.Children.map(actions, (action: any) =>
                    React.cloneElement<DUploadActionPropsWithPrivate>(action, {
                      ...action.props,
                      __file: file,
                      __defaultActions: dDefaultActions,
                      __onRemove: () => {
                        setRemoveUIDs((draft) => {
                          draft.push(file.uid);
                        });
                      },
                    })
                  )}
                </div>
                <div className={`${dPrefix}upload__list-progress-wrapper`}>
                  {isNumber(file.percent) && <DProgress dPercent={file.percent} dLineWidth={2} dLabel={false}></DProgress>}
                </div>
              </li>
            )}
          </DCollapseTransition>
        );
      })}
    </ul>
  );
}

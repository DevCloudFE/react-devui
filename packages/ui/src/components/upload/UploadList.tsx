import type { DUploadFile } from './Upload';

import React from 'react';

import { registerComponentMate } from '../../utils';
import { useComponentConfig } from '../root';
import { DList } from './List';
import { DPicture } from './Picture';
import { DPictureList } from './PictureList';
import { DUploadAction } from './UploadAction';

export interface DUploadListProps extends Omit<React.HTMLAttributes<HTMLUListElement>, 'children'> {
  dType?: 'list' | 'picture' | 'picture-list';
  dDefaultActions?: {
    preview?: (file: DUploadFile) => void;
    download?: (file: DUploadFile) => void;
  };
  dActions?: (file: DUploadFile, index: number) => React.ReactNode[];
}

export interface DUploadListPrivateProps {
  __fileList: DUploadFile[];
  __onRemove: (file: DUploadFile) => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DUpload.List' as const });
export function DUploadList(props: DUploadListProps): JSX.Element | null {
  const {
    dType = 'list',
    dDefaultActions,
    dActions,
    __fileList,
    __onRemove,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props as DUploadListProps & DUploadListPrivateProps);

  return dType === 'list' ? (
    <DList
      {...restProps}
      dFileList={__fileList}
      dDefaultActions={dDefaultActions}
      dActions={dActions ?? (() => [<DUploadAction dPreset="remove" />])}
      onRemove={__onRemove}
    ></DList>
  ) : dType === 'picture' ? (
    <DPicture
      {...restProps}
      dFileList={__fileList}
      dDefaultActions={dDefaultActions}
      dActions={dActions ?? (() => [<DUploadAction dPreset="preview" />, <DUploadAction dPreset="remove" />])}
      onRemove={__onRemove}
    />
  ) : (
    <DPictureList
      {...restProps}
      dFileList={__fileList}
      dDefaultActions={dDefaultActions}
      dActions={dActions ?? (() => [<DUploadAction dPreset="remove" />])}
      onRemove={__onRemove}
    ></DPictureList>
  );
}

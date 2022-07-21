import type { DId } from '../../utils/global';
import type { DFormControl } from '../form';

import { isNull, isNumber } from 'lodash';
import React, { useRef } from 'react';

import { usePrefixConfig, useComponentConfig, useForkRef, useDValue, useUnmount } from '../../hooks';
import { registerComponentMate, getClassName, getUID } from '../../utils';
import { useFormControl } from '../form';
import { DList } from './List';
import { DPicture } from './Picture';
import { DPictureButton } from './PictureButton';
import { DPictureList } from './PictureList';

export type DUploadFileStatus = 'load' | 'error' | 'progress' | null;

export interface DUploadFile {
  uid: DId;
  name: string;
  url?: string;
  thumbUrl?: string;
  status: DUploadFileStatus;
  percent?: number;
  originFile?: File;
  response?: any;
  [index: string | symbol]: any;
}

export interface DUploadProps extends React.InputHTMLAttributes<HTMLInputElement> {
  children: React.ReactElement | null;
  dFormControl?: DFormControl;
  dModel?: DUploadFile[];
  dXHRRequest: {
    method?: string;
    url: string | URL;
    responseType?: XMLHttpRequestResponseType;
    header?: { [index: string]: string };
    body?: (file: string | Blob) => Document | XMLHttpRequestBodyInit | null | undefined;
    custom?: (xhr: XMLHttpRequest) => void;
  };
  dListType?: 'list' | 'picture' | 'picture-list' | false;
  dDrag?: boolean;
  dMax?: number;
  dDefaultActions?: {
    preview?: (file: DUploadFile) => void;
    download?: (file: DUploadFile) => void;
  };
  dActions?: (
    file: DUploadFile,
    index: number
  ) => (React.ReactElement<React.ButtonHTMLAttributes<HTMLButtonElement>> | 'preview' | 'download' | 'remove')[];
  dCustomUpload?: (files: FileList) => void;
  dBeforeUpload?: (file: File, files: FileList) => boolean | string | Blob | Promise<boolean | string | Blob>;
  onModelChange?: (
    files: DUploadFile[],
    data: {
      type: 'add' | 'update' | 'remove';
      files: DUploadFile[];
    }
  ) => void;
  onRemove?: (file: DUploadFile) => void;
}

const UID_KEY = Symbol();

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DUpload' });
function Upload(props: DUploadProps, ref: React.ForwardedRef<HTMLInputElement>): JSX.Element | null {
  const {
    children,
    dFormControl,
    dModel,
    dXHRRequest,
    dListType = 'list',
    dDrag = false,
    dMax,
    dDefaultActions,
    dActions,
    dCustomUpload,
    dBeforeUpload,
    onModelChange,
    onRemove,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const inputRef = useRef<HTMLInputElement>(null);
  //#endregion

  const dataRef = useRef<{ fileURLs: string[] }>({ fileURLs: [] });

  const combineInputRef = useForkRef(inputRef, ref);

  const formControlInject = useFormControl(dFormControl);
  const [fileList, changeFileList] = useDValue<DUploadFile[]>([], dModel, undefined, undefined, formControlInject);

  useUnmount(() => {
    dataRef.current.fileURLs.forEach((fileURL) => {
      URL.revokeObjectURL(fileURL);
    });
  });

  const handleFiles = (files: FileList) => {
    if (dCustomUpload) {
      dCustomUpload(files);
    } else {
      const addList: DUploadFile[] = [];
      for (let index = 0; index < files.length; index++) {
        const file = files.item(index);
        if (file) {
          const xhr = new XMLHttpRequest();

          let uid: DId = getUID();
          const update = (obj: any, add: boolean) => {
            if (add) {
              const fileURL = URL.createObjectURL(file);
              dataRef.current.fileURLs.push(fileURL);
              const addFile = {
                uid,
                [UID_KEY]: uid,
                url: fileURL,
                thumbUrl: file.type.startsWith('image') ? fileURL : undefined,
                name: file.name,
                originFile: file,
                response: xhr.response,
                ...obj,
              };

              if (isNumber(dMax) && fileList.length + addList.length >= dMax) {
                if (dMax === 1) {
                  uid = addFile.uid = addFile[UID_KEY] = fileList[0].uid;
                  changeFileList([addFile]);
                  onModelChange?.([addFile], {
                    type: 'update',
                    files: [addFile],
                  });
                  return;
                }
                return true;
              }

              addList.push(addFile);
            } else {
              let hasChange = true;
              const newList = changeFileList((draft) => {
                const index = draft.findIndex((f) => f[UID_KEY] === uid);
                if (index !== -1) {
                  draft[index] = Object.assign(draft[index], { response: xhr.response, ...obj });
                } else {
                  hasChange = false;
                }
              });
              if (hasChange) {
                onModelChange?.(newList, {
                  type: 'update',
                  files: [newList.find((f) => f[UID_KEY] === uid)!],
                });
              }
            }
          };

          const upload = (condition: boolean | string | Blob) => {
            if (condition === false) {
              update({ status: null }, true);
            } else {
              const abort = update({ status: 'progress', percent: 0 }, true);
              if (abort) {
                return;
              }

              xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                  const percent = Math.round((e.loaded * 100) / e.total);
                  update({ status: 'progress', percent }, false);
                }
              });
              xhr.addEventListener('error', () => {
                update({ status: 'error', percent: undefined }, false);
              });
              xhr.addEventListener('load', () => {
                update({ status: xhr.status >= 200 && xhr.status < 300 ? 'load' : 'error', percent: undefined }, false);
              });

              const {
                method = 'POST',
                url,
                responseType = 'json',
                header = {},
                body = (file) => {
                  const formData = new FormData();
                  formData.append('file', file);
                  return formData;
                },
                custom,
              } = dXHRRequest;

              xhr.open(method, url);
              xhr.responseType = responseType;
              Object.entries(header).forEach((h) => {
                xhr.setRequestHeader(...h);
              });
              custom?.(xhr);
              xhr.send(body(condition === true ? file : condition));
            }
          };

          let shouldUpload: boolean | string | Blob | Promise<boolean | string | Blob> = true;
          if (dBeforeUpload) {
            shouldUpload = dBeforeUpload(file, files);
            if (shouldUpload instanceof Promise) {
              shouldUpload.then((condition) => {
                upload(condition);
              });
            } else {
              upload(shouldUpload);
            }
          } else {
            upload(true);
          }
        }
      }
      if (addList.length > 0) {
        const newList = changeFileList((draft) => draft.concat(addList));
        onModelChange?.(newList, {
          type: 'add',
          files: addList,
        });
      }
    }
  };

  const child = (() => {
    if (isNull(children)) {
      return children;
    }

    let dragProps: React.HTMLAttributes<HTMLElement> = {};
    if (dDrag) {
      dragProps = {
        onDragEnter: (e) => {
          children.props.onDragEnter?.(e);

          e.stopPropagation();
          e.preventDefault();
        },
        onDragOver: (e) => {
          children.props.onDragOver?.(e);

          e.stopPropagation();
          e.preventDefault();
        },
        onDrop: (e) => {
          children.props.onDrop?.(e);

          e.stopPropagation();
          e.preventDefault();

          const dt = e.dataTransfer;
          const files = dt.files;
          handleFiles(files);
        },
      };
    }

    return React.cloneElement<React.HTMLAttributes<HTMLElement>>(children, {
      ...children.props,
      onClick: (e) => {
        children.props.onClick?.(e);

        if (inputRef.current) {
          inputRef.current.click();
        }
      },
      ...dragProps,
    });
  })();

  const listProps = {
    dFileList: fileList,
    dDefaultActions,
    onRemove: (file: DUploadFile) => {
      onRemove?.(file);

      const newList = changeFileList((draft) => {
        const index = draft.findIndex((f) => f.uid === file.uid);
        draft.splice(index, 1);
      });
      onModelChange?.(newList, { type: 'remove', files: [file] });
    },
  };

  return (
    <>
      <input
        {...restProps}
        ref={combineInputRef}
        className={getClassName(restProps.className, `${dPrefix}upload`)}
        type={restProps.type ?? 'file'}
        onChange={(e) => {
          restProps.onChange?.(e);

          const files = e.currentTarget.files;
          if (files) {
            handleFiles(files);
          }

          e.currentTarget.value = '';
        }}
      ></input>
      {dListType === 'list' ? (
        <>
          {child}
          <DList {...listProps} dActions={dActions ?? (() => ['remove'])}></DList>
        </>
      ) : dListType === 'picture' ? (
        <DPicture {...listProps} dActions={dActions ?? (() => ['preview', 'remove'])}>
          {child}
        </DPicture>
      ) : dListType === 'picture-list' ? (
        <>
          {child}
          <DPictureList {...listProps} dActions={dActions ?? (() => ['remove'])}></DPictureList>
        </>
      ) : (
        child
      )}
    </>
  );
}

export const DUpload: {
  (props: DUploadProps & { ref?: React.ForwardedRef<HTMLInputElement> }): ReturnType<typeof Upload>;
  PICTURE_BUTTON: typeof DPictureButton;
} = React.forwardRef(Upload) as any;

DUpload.PICTURE_BUTTON = DPictureButton;

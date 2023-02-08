import type { DId } from '../../utils/types';
import type { DFormControl } from '../form';
import type { DUploadListPrivateProps } from './UploadList';

import { isNumber } from 'lodash';
import React, { useRef } from 'react';

import { useForkRef, useUnmount } from '@react-devui/hooks';
import { getClassName, getUID } from '@react-devui/utils';

import { useDValue } from '../../hooks';
import { registerComponentMate } from '../../utils';
import { useFormControl } from '../form';
import { useComponentConfig, usePrefixConfig } from '../root';
import { DUploadAction } from './UploadAction';
import { DUploadList } from './UploadList';
import { DUploadPictureButton } from './UploadPictureButton';

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

export interface DUploadProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'children'> {
  children?: (nodes: { trigger: React.ReactNode; list: React.ReactNode }) => React.ReactNode;
  dFormControl?: DFormControl;
  dModel?: DUploadFile[];
  dTrigger?: React.ReactElement;
  dList?: React.ReactElement;
  dXHRRequest?: {
    method?: string;
    url: string | URL;
    responseType?: XMLHttpRequestResponseType;
    header?: { [index: string]: string };
    body?: (file: string | Blob) => Document | XMLHttpRequestBodyInit | null | undefined;
    custom?: (xhr: XMLHttpRequest) => void;
  };
  dDrag?: boolean;
  dMax?: number;
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

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DUpload' as const });
function Upload(props: DUploadProps, ref: React.ForwardedRef<HTMLInputElement>): JSX.Element | null {
  const {
    children,
    dFormControl,
    dModel,
    dTrigger,
    dList,
    dXHRRequest,
    dDrag = false,
    dMax,
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
  const combineInputRef = useForkRef(inputRef, ref);
  //#endregion

  const dataRef = useRef<{
    fileURLs: string[];
  }>({
    fileURLs: [],
  });

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
          const add = (obj: any) => {
            const fileURL = URL.createObjectURL(file);
            dataRef.current.fileURLs.push(fileURL);
            const addFile = {
              uid,
              url: fileURL,
              thumbUrl: file.type.startsWith('image') ? fileURL : undefined,
              name: file.name,
              originFile: file,
              response: xhr.response,
              ...obj,
            };

            if (isNumber(dMax) && fileList.length + addList.length >= dMax) {
              if (dMax === 1) {
                uid = addFile.uid = fileList[0].uid;
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
          };
          const update = (obj: any) => {
            let hasChange = true;
            const newList = changeFileList((draft) => {
              const index = draft.findIndex((f) => f.uid === uid);
              if (index !== -1) {
                draft[index] = Object.assign(draft[index], { response: xhr.response, ...obj });
              } else {
                hasChange = false;
              }
            });
            if (hasChange) {
              onModelChange?.(newList, {
                type: 'update',
                files: [newList.find((f) => f.uid === uid)!],
              });
            }
          };

          const upload = (condition: boolean | string | Blob) => {
            if (condition === false) {
              add({ status: null });
            } else {
              const abort = add({ status: 'progress', percent: 0 });
              if (abort) {
                return;
              }

              xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                  const percent = Math.round((e.loaded * 100) / e.total);
                  update({ status: 'progress', percent });
                }
              });
              xhr.addEventListener('error', () => {
                update({ status: 'error', percent: undefined });
              });
              xhr.addEventListener('load', () => {
                update({ status: xhr.status >= 200 && xhr.status < 300 ? 'load' : 'error', percent: undefined });
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
              } = dXHRRequest!;

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

  const trigger = (() => {
    if (dTrigger) {
      let dragProps: React.HTMLAttributes<HTMLElement> = {};
      if (dDrag) {
        dragProps = {
          onDragEnter: (e) => {
            dTrigger.props.onDragEnter?.(e);

            e.stopPropagation();
            e.preventDefault();
          },
          onDragOver: (e) => {
            dTrigger.props.onDragOver?.(e);

            e.stopPropagation();
            e.preventDefault();
          },
          onDrop: (e) => {
            dTrigger.props.onDrop?.(e);

            e.stopPropagation();
            e.preventDefault();

            const dt = e.dataTransfer;
            const files = dt.files;
            handleFiles(files);
          },
        };
      }

      return React.cloneElement<React.HTMLAttributes<HTMLElement>>(dTrigger, {
        ...dragProps,
        onClick: (e) => {
          dTrigger.props.onClick?.(e);

          if (inputRef.current) {
            inputRef.current.click();
          }
        },
      });
    }
  })();

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
      {children?.({
        trigger,
        list:
          dList &&
          React.cloneElement<DUploadListPrivateProps>(dList, {
            __fileList: fileList,
            __onRemove(file) {
              onRemove?.(file);

              const newList = changeFileList((draft) => {
                const index = draft.findIndex((f) => f.uid === file.uid);
                draft.splice(index, 1);
              });
              onModelChange?.(newList, { type: 'remove', files: [file] });
            },
          }),
      })}
    </>
  );
}

export const DUpload: {
  (props: DUploadProps & React.RefAttributes<HTMLInputElement>): ReturnType<typeof Upload>;
  Action: typeof DUploadAction;
  List: typeof DUploadList;
  PictureButton: typeof DUploadPictureButton;
} = React.forwardRef(Upload) as any;

DUpload.Action = DUploadAction;
DUpload.List = DUploadList;
DUpload.PictureButton = DUploadPictureButton;

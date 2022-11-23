---
title: 上传
---

## API

### DUploadProps

```tsx
interface DUploadFile {
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

interface DUploadProps extends React.InputHTMLAttributes<HTMLInputElement> {
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
  dActions?: (file: DUploadFile, index: number) => React.ReactNode[];
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
```

<!-- prettier-ignore-start -->
| 属性 | 说明 | 默认值 | 版本 | 
| --- | --- | --- | --- | 
| dFormControl | 支持表单 | - |  |
| dModel | 上传文件，受控，默认为 `[]` | - |  |
| dXHRRequest | 设置 [XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) | - |  |
| dListType | 设置文件列表类型 | `'list'` |  |
| dDrag | 是否可拖拽上传 | `false` |  |
| dMax | 最大上传文件数量 | - |  |
| dDefaultActions | 设置按钮默认行为 | - |  |
| dActions | 设置按钮组 | - |  |
| dCustomUpload | 自定义上传，需要自行更新上传文件 | - |  |
| dBeforeUpload | 拦截上传，返回 `false` 表示取消上传，支持 `Promise` | - |  |
| onModelChange | 上传文件变化的回调 | - |  |
| onRemove | 移除文件的回调 | - |  |
<!-- prettier-ignore-end -->

### DUploadActionProps

```tsx
interface DUploadActionProps extends React.HTMLAttributes<HTMLElement> {
  dPreset?: 'preview' | 'download' | 'remove';
}
```

<!-- prettier-ignore-start -->
| 属性 | 说明 | 默认值 | 版本 | 
| --- | --- | --- | --- | 
| dPreset | 按钮采用预设配置 | - |  |
<!-- prettier-ignore-end -->

### DUploadPictureButtonProps

```tsx
interface DUploadPictureButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  dFile?: DUploadFile;
  dDefaultActions?: {
    preview?: (file: DUploadFile) => void;
    download?: (file: DUploadFile) => void;
  };
  dActions?: React.ReactNode[];
  onRemove?: () => void;
}
```

<!-- prettier-ignore-start -->
| 属性 | 说明 | 默认值 | 版本 | 
| --- | --- | --- | --- | 
| dFile | 上传文件 | - |  |
| dDefaultActions | 设置按钮默认行为 | - |  |
| dActions | 设置按钮组 | - |  |
| onRemove | 移除文件的回调 | - |  |
<!-- prettier-ignore-end -->

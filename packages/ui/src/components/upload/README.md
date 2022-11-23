---
group: Data Entry
title: Upload
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
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dFormControl | Support Forms | - | |
| dModel | upload file, controlled, default `[]` | - | |
| dXHRRequest | Settings [XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) | - | |
| dListType | Set file list type | `'list'` | |
| dDrag | Can drag and drop upload | `false` | |
| dMax | Maximum number of uploaded files | - | |
| dDefaultActions | Set button default actions | - | |
| dActions | Settings button group | - | |
| dCustomUpload | Custom upload, you need to update the upload file yourself | - | |
| dBeforeUpload | Intercept upload, return `false` to cancel upload, support `Promise` | - | |
| onModelChange | Callback for uploading file changes | - | |
| onRemove | Callback for removing files | - | |
<!-- prettier-ignore-end -->

### DUploadActionProps

```tsx
interface DUploadActionProps extends React.HTMLAttributes<HTMLElement> {
  dPreset?: 'preview' | 'download' | 'remove';
}
```

<!-- prettier-ignore-start -->
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dPreset | Button adopts preset configuration | - | |
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
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dFile | upload file | - | |
| dDefaultActions | Set button default actions | - | |
| dActions | Settings button group | - | |
| onRemove | Callback for removing files | - | |
<!-- prettier-ignore-end -->

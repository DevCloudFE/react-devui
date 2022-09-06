# 国际化

这里是[完整配置](https://github.com/DevCloudFE/react-devui/blob/main/packages/ui/src/hooks/i18n/resources.json)。

## 修改语言

默认语言为 `en-US`，如果需要使用其他语言，请配置 `DRoot`：

```tsx
import type { DConfigContextData } from '@react-devui/ui/hooks/d-config';

import { useMemo } from 'react';

import { DRoot } from '@react-devui/ui';

export default function App() {
  const rootContext = useMemo<DConfigContextData>(
    () => ({
      i18n: { lang: 'zh-Hant' },
    }),
    []
  );

  return <DRoot dContext={rootContext}>Some content...</DRoot>;
}
```

## 修改语言显示

支持修改语言显示：

```tsx
import type { DConfigContextData } from '@react-devui/ui/hooks/d-config';

import { useMemo } from 'react';

import { DRoot } from '@react-devui/ui';

export default function App() {
  const rootContext = useMemo<DConfigContextData>(
    () => ({
      i18n: {
        resources: {
          DatePicker: {
            Now: {
              'en-US': 'Present',
              'zh-Hant': '现在',
            },
          },
        },
      },
    }),
    []
  );

  return <DRoot dContext={rootContext}>Some content...</DRoot>;
}
```

## 增加语言

支持增加语言：

```tsx
import type { DConfigContextData } from '@react-devui/ui/hooks/d-config';

import { useMemo } from 'react';

import { DRoot } from '@react-devui/ui';

export default function App() {
  const rootContext = useMemo<DConfigContextData>(
    () => ({
      i18n: {
        resources: {
          Common: {
            Loading: {
              'en-US': 'Loading',
              'zh-Hant': '加载中',
              'ja-JP': '読み込み中',
            },
            ...other,
          },
          ...other,
        },
      },
    }),
    []
  );

  return <DRoot dContext={rootContext}>Some content...</DRoot>;
}
```

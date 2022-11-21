# 国际化

这里是[完整配置](https://github.com/DevCloudFE/react-devui/blob/main/packages/ui/src/components/root/resources.json)。

## 修改语言

默认语言为 `en-US`，如果需要使用其他语言，请配置 `DRoot`：

```tsx
import type { DRootProps } from '@react-devui/ui';

import { useMemo } from 'react';

import { DRoot } from '@react-devui/ui';

export default function App() {
  const rootContext = useMemo<DRootProps['context']>(
    () => ({
      i18n: { lang: 'zh-CN' },
    }),
    []
  );

  return <DRoot context={rootContext}>Some content...</DRoot>;
}
```

## 部分修改

支持部分修改：

```tsx
import type { DRootProps } from '@react-devui/ui';

import { useMemo } from 'react';

import { DRoot } from '@react-devui/ui';

export default function App() {
  const rootContext = useMemo<DRootProps['context']>(
    () => ({
      i18n: {
        resources: {
          'en-US': { DatePicker: { Now: 'Present' } },
          'zh-CN': { DatePicker: { Now: '现在' } },
        },
      },
    }),
    []
  );

  return <DRoot context={rootContext}>Some content...</DRoot>;
}
```

## 增加语言

支持增加语言：

```tsx
import type { DRootProps } from '@react-devui/ui';

import { useMemo } from 'react';

import { DRoot } from '@react-devui/ui';

export default function App() {
  const rootContext = useMemo<DRootProps['context']>(
    () => ({
      i18n: {
        resources: {
          lang: 'ja-JP',
          'ja-JP': {
            DatePicker: { Now: '今' },
            ...otherConfig,
          },
        },
      },
    }),
    []
  );

  return <DRoot context={rootContext}>Some content...</DRoot>;
}
```

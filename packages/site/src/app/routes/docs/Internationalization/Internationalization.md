# Internationalization

Here is the [full configuration](https://github.com/DevCloudFE/react-devui/blob/main/packages/ui/hooks/i18n/resources.json).

## Modify language

The default language is `en-US`, if you need to use another language, please configure `DRoot`:

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

## Modify language display

Support to modify the language display:

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

## Add language

Support for adding languages:

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

# Internationalization

Here is the [full configuration](https://github.com/DevCloudFE/react-devui/blob/main/packages/ui/src/components/root/resources.json).

## Modify language

The default language is `en-US`, if you need to use another language, please configure `DRoot`:

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

## Modify modification

Partially modifications are supported:

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

## Add language

Support for adding languages:

```tsx
import type { DRootProps } from '@react-devui/ui';

import { useMemo } from 'react';

import { DRoot } from '@react-devui/ui';

export default function App() {
  const rootContext = useMemo<DRootProps['context']>(
    () => ({
      i18n: {
        lang: 'ja-JP',
        resources: {
          'ja-JP': { DatePicker: { Now: '今' } },
          ...otherConfig,
        },
      },
    }),
    []
  );

  return <DRoot context={rootContext}>Some content...</DRoot>;
}
```

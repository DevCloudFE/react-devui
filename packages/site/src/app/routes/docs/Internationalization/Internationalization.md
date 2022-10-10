# Internationalization

Here is the [full configuration](https://github.com/DevCloudFE/react-devui/blob/main/packages/ui/src/hooks/i18n/resources.json).

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

## Modify language display

Support to modify the language display:

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
        resources: {
          'ja-JP': { DatePicker: { Now: '今' } },
        },
      },
    }),
    []
  );

  return <DRoot context={rootContext}>Some content...</DRoot>;
}
```

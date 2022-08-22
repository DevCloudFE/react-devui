# Getting Started

## Installation

```bash
npm install @react-devui/ui @react-devui/icons @react-devui/hooks @react-devui/utils
```

## Import style

For the sake of packing volume and importing on demand, we do not pack style files.

Global style:

```scss
@import '~@react-devui/ui/styles/index';
```

Import on demand:

```scss
@import '~@react-devui/ui/styles/base';

@import '~@react-devui/ui/styles/components/button';
```

## Import the root component

You need to import `DRoot` on the root component of your project (like `App.tsx`), `DRoot` is required and it provides global configuration.

It is recommended to configure the `layout` parameter, which provides the layout information of your page, so that we can automatically do some work (such as updating the popup position).

```tsx
import type { DConfigContextData } from '@react-devui/ui/hooks/d-config';

import { useMemo } from 'react';

import { DRoot } from '@react-devui/ui';

export default function App() {
  const rootContext = useMemo<DConfigContextData>(
    () => ({
      layout: { scrollEl: 'main', resizeEl: 'article' },
    }),
    []
  );

  return (
    <DRoot dContext={rootContext}>
      <main style={{ overflow: 'auto' }}>
        <article style={{ height: '200vh' }}>Some content...</article>
      </main>
    </DRoot>
  );
}
```

## Ready

Everything is ready and you can start using the required components:

<iframe
  src="https://codesandbox.io/embed/getting-started-dvzlf0?fontsize=14&hidenavigation=1&module=%2Fsrc%2FDemo.tsx&theme=dark"
  style="
    width: 100%;
    height: 500px;
    overflow: hidden;
    border: 0;
    border-radius: 4px;
  "
  title="getting-started"
  allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
  sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
></iframe>

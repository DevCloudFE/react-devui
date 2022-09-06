# Dynamic Theme

## How to use

Through clever style design, we have achieved theme customization with a small number of css variables!

Check out our [dark theme](https://github.com/DevCloudFE/react-devui/blob/main/packages/ui/src/styles/theme-dark.scss).

```tsx
export default function App() {
  useEffect(() => {
    document.body.classList.toggle('dark', theme === 'dark');
    if (theme === 'dark') {
      const colorScheme = document.documentElement.style.colorScheme;
      document.documentElement.style.colorScheme = 'dark';
      return () => {
        document.documentElement.style.colorScheme = colorScheme;
      };
    }
  }, [theme]);
}
```

## Variable conflict

All our css variables have namespaces added, the default is `d`, if our css variables conflict with your project, you can modify `$namespace`.

Note: `$namespace` also affects stylesheets, so you need to modify the `DRoot` configuration:

```scss
$namespace: 'app';
```

```tsx
import type { DConfigContextData } from '@react-devui/ui/hooks/d-config';

import { useMemo } from 'react';

import { DRoot } from '@react-devui/ui';

export default function App() {
  const rootContext = useMemo<DConfigContextData>(
    () => ({
      namespace: 'app',
    }),
    []
  );

  return <DRoot dContext={rootContext}>Some content...</DRoot>;
}
```

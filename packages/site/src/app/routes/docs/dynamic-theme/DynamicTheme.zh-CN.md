# 动态主题

## 如何使用

通过巧妙的样式设计，我们实现了通过少量的 css 变量即可完成主题定制！

参考我们的[暗黑主题](https://github.com/DevCloudFE/react-devui/blob/main/packages/ui/src/styles/theme-dark.scss)。

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

## 变量冲突

我们的 css 变量均添加了命名空间，默认为 `d`，如果我们的 css 变量与您项目冲突，可以修改 `$d-namespace`。

注意：`$d-namespace` 同样影响样式表，所以您需要修改 `DRoot` 的配置：

```scss
$d-namespace: 'app';
```

```tsx
import type { DRootProps } from '@react-devui/ui';

import { useMemo } from 'react';

import { DRoot } from '@react-devui/ui';

export default function App() {
  const rootContext = useMemo<DRootProps['context']>(
    () => ({
      namespace: 'app',
    }),
    []
  );

  return <DRoot context={rootContext}>Some content...</DRoot>;
}
```

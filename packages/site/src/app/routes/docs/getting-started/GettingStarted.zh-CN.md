# 快速开始

## 安装

```bash
yarn add @react-devui/ui @react-devui/icons @react-devui/hooks @react-devui/utils
```

## 引入样式

出于打包体积以及按需引入的考虑，我们没有打包样式文件。

全局样式：

```scss
@import '~@react-devui/ui/styles/index';
```

按需引入：

```scss
@import '~@react-devui/ui/styles/variables';

@import '~@react-devui/ui/styles/mixins';

@import '~@react-devui/ui/styles/root';
@import '~@react-devui/ui/styles/reboot';
@import '~@react-devui/ui/styles/animations';
@import '~@react-devui/ui/styles/common';

@import '~@react-devui/ui/styles/components/button';
```

## 引入根组件

您需要在项目的根组件（如`App.tsx`）上引入 `DRoot`，`DRoot` 是必须的并且它提供了[全局配置](/docs/GlobalConfiguration)。

建议配置 `layout` 参数，它提供了您页面的布局信息，这样我们就可以自动完成某些工作（如更新弹窗位置）。

```tsx
import type { DRootProps } from '@react-devui/ui';

import { useMemo } from 'react';

import { DRoot } from '@react-devui/ui';

export default function App() {
  const rootContext = useMemo<DRootProps['context']>(
    () => ({
      layout: { pageScrollEl: '#app-main', contentResizeEl: '#app-content' },
    }),
    []
  );

  return (
    <DRoot context={rootContext}>
      <main id="app-main" style={{ overflow: 'auto' }}>
        <section id="app-content" style={{ height: '200vh' }}>
          Some content...
        </section>
      </main>
    </DRoot>
  );
}
```

## 准备就绪

一切准备就绪，您可以开始使用所需要的组件：

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

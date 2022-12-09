<p align="center">
  <a href="//react-devui.com" rel="noopener" target="_blank"><img width="150" src="/packages/site/src/assets/logo.svg" alt="DevUI logo"></a>
</p>

<h1 align="center">React DevUI</h1>

<div align="center">

<!-- prettier-ignore-start -->
[![npm latest package](http://img.shields.io/npm/v/@react-devui/ui/latest.svg?style=flat-square)](https://www.npmjs.com/package/@react-devui/ui)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/@react-devui/ui?style=flat-square)](https://bundlephobia.com/package/@react-devui/ui)
[![gitHub workflow status](https://img.shields.io/github/workflow/status/DevCloudFE/react-devui/Main?style=flat-square)](https://github.com/DevCloudFE/react-devui/actions/workflows/main.yml)
<!-- prettier-ignore-end -->

</div>
 
 <div align="center">

[English](README.md) | 简体中文

</div>

## 安装

```bash
yarn add @react-devui/ui @react-devui/icons @react-devui/hooks @react-devui/utils
```

## 快速开始

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

## 链接

- [react-devui.com](//react-devui.com)
- [admin.react-devui.com](//admin.react-devui.com)

## 贡献

请先阅读我们的[贡献指南](/CONTRIBUTING.md)。

需要单元测试支持（Jest） 🤝。

## 授权协议

[![gitHub license](https://img.shields.io/github/license/DevCloudFE/react-devui?style=flat-square)](/LICENSE)

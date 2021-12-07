<h1 align="center">React DevUI</h1>

<p align="center">DevUI components based on React</p>

[English](README.md) | 简体中文

开发中。

需要单元测试支持（Jest）🤝

## 开始

我们在 `prepare` 中添加 `chmod ug+x .husky/` 以确保文件在 linux 中是可执行的。 所以您使用其他操作系统，只需忽略错误。

执行下面的命令以预览组件：

```
yarn site:serve
```

非新组件贡献请参考 [贡献指南](CONTRIBUTING.md)。

## 目录结构

```
├── packages                                    // 根目录：项目
│   ├── site                                    // 根目录：网站
│   │   └── src
│   │       ├── app
│   │       │   ├── components                  // 组件
│   │       │   │   ├── header
│   │       │   │   ├── route
│   │       │   │   └── sidebar
│   │       │   ├── configs                     // 配置文件（json）
│   │       │   ├── i18n
│   │       │   ├── routes                      // 路由
│   │       │   └── styles                      // 样式
│   │       ├── assets                          // 静态资源
│   │       │   └── components
│   │       └── environments                    // 开发和生产环境下的配置文件
│   └── ui                                      // 根目录：组件
│       └── src
│           ├── components                      // 组件
│           ├── hooks                           // Hooks
│           ├── styles                          // 样式
│           ├── tests                           // 测试配置
│           └── utils                           // 实用函数
└── tools                                       // 根目录：项目脚手架
```

## VSCode 配置

参考 `.vscode` 目录下的 [README.md](https://github.com/xiejay97/react-devui/tree/main/.vscode)

## 设计指南

- 全部使用 Hook 完成组件。
- 最大程度保持组件的独立性，使用组件组合完成更复杂的逻辑，例如：[Drawer](https://github.com/xiejay97/react-devui/tree/main/packages/ui/src/components/drawer) 组件分离了 Header，这样我们可以单独使用 DrawerHeader，而不是通过向 Drawer 组件传递 Header 的 Props，不止如此，分离组件使我们不必担心未来组件功能越来越多而难以维护。
- 确保组件 `Props` 继承了原生属性，如 `React.HTMLAttributes<HTMLElement>`， 我们希望组件的使用与 DOM 元素一致，在实现组件时需要注意不覆盖掉用户传递的 `id`、`className` 、 `style` 和事件（如 onClick）。
- 确保复杂组件仅根组件的 `Props` 提供回调，如 `menu` 中仅 [DMenu](https://github.com/xiejay97/react-devui/blob/main/packages/ui/src/components/menu/Menu.tsx) 提供了 `onActiveChange` 回调。
- 支持双向绑定（[useTwoWayBinding](https://github.com/xiejay97/react-devui/blob/main/packages/ui/src/hooks/two-way-binding.ts)），参考 [DRadio](https://github.com/xiejay97/react-devui/blob/main/packages/ui/src/components/radio/Radio.tsx)。
- 数据录入务必使用原生的 `input` 实现，并且使用 [useTwoWayBinding](https://github.com/xiejay97/react-devui/blob/main/packages/ui/src/hooks/two-way-binding.ts) 以支持未来的 `form` 组件，参考 [DRadio](https://github.com/xiejay97/react-devui/blob/main/packages/ui/src/components/radio/Radio.tsx)。
- 使用 `useAsync` 管理异步函数，通过拦截异步方法，如 `setTimeout`， 我们确保异步函数不会在组件销毁后执行。
- 务必遵循 [WAI-ARIA](https://www.w3.org/TR/wai-aria-practices-1.1/)，一些未定义的组件，如 `Drawer`，我们也应该尽可能根据使用情况提供 WAI-ARIA 支持。
- 支持国际化，参考 [DFooter](https://github.com/xiejay97/react-devui/blob/main/packages/ui/src/components/_footer/Footer.tsx)。
- 不要引入第三方组件，我们希望组件是完全可控的。
- 尽可能使用 class 而不是 style 以允许使用者可以修改样式。

## 样式

- class 命名遵循 [BEM](http://getbem.com/introduction/) 规范。
- 提供额外的 主题、状态、js 的 [mixin](https://github.com/xiejay97/react-devui/blob/main/packages/ui/src/styles/mixins/_bem.scss)，参考 [namespaces](https://csswizardry.com/2015/03/more-transparent-ui-code-with-namespaces/)。
- 所有的 `font-size` 使用 [RFS](https://github.com/twbs/rfs#readme) 以实现响应式文字。
- 我们使用 sass 输出样式，但是我们的变量使用原生的 `var()`。

## 测试

- 不要使用快照（我有充分的理由让你相信为什么不使用它）。
- 测试应当专注于功能的完整性， 即输入 Props 是否能够得到我们期望的响应。
- 如果组件非 Props 的变更会影响测试，如组件样式（调整图标位置）、组件包含的文字内容（测试组件中的按钮时经常会用文字来判断是否为预期的按钮），那么应当怀疑测试是否合理。

参考 [DFooter](https://github.com/xiejay97/react-devui/blob/main/packages/ui/src/components/_footer/Footer.tsx)。

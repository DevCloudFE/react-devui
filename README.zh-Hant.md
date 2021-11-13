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

贡献请参考 [贡献指南](CONTRIBUTING.md)。

## 设计指南

### 代码

- 全部使用 Hook 完成组件。
- 最大程度保持组件的独立性，使用组件组合已完成更复杂的逻辑，例如：Drawer 组件分离了 Header，这样我们可以单独使用 DrawerHeader，而不是通过向 Drawer 组件传递 Header 的 Props，不止如此，分离组件使我们不必担心未来组件功能越来越多而难以维护。
- 使用结构化的注释对代码结构分层，使函数组件代码量庞大的时候能够保持结构清晰，并且提供了向 Angular、Vue 迁移的指导。
- 我们提供了 `useAsync` 以管理异步函数，通过拦截异步方法，如 `setTimeout`， 我们确保异步函数不会在组件销毁后执行。
- 确保组件 `Props` 继承 `React.HTMLAttributes<HTMLElement>`， 我们希望组件的使用与 DOM 元素一致。
- 不要引入第三方组件，我们希望组件是完全可控的。
- 更多的细节可以参考典型的 [Drawer](https://github.com/xiejay97/react-devui/tree/main/ui/src/components/drawer) 组件的实现。

### 样式

- class 命名遵循 [BEM](http://getbem.com/introduction/) 规范。
- 尽可能使用 class 而不是 style 以允许使用者可以修改样式。
- 我们使用 sass 输出样式，但是我们的变量使用原生的 `var()`。
- 如果不是必须，不要为组件创建单独的变量，我们希望主题系统是简单的、易于使用的。
- 所有的 `font-size` 使用 [RFS](https://github.com/twbs/rfs#readme) 以实现响应式文字。

### 其它

- 务必遵循 [WAI-ARIA](https://www.w3.org/TR/wai-aria-practices-1.1/)，一些未定义的组件，如 `Drawer`，我们也应该尽可能根据使用情况提供 WAI-ARIA 支持。
- 支持国际化。

# FAQ

下面列出了一些常见问题：

## 组件库是否含有副作用

组件库仅样式覆盖了全局的 `box-sizing`，这也是目前绝大多数人的选择：

```scss
*,
*::before,
*::after {
  box-sizing: border-box;
}
```

## 组件何时受控

我们约定 `undefined` 代表组件为非受控状态，其它值均代表组件受控。

## 受控组件空值一般是什么

受控组件空值一般定义为 `null`，实际情况请参考组件 API。

## 如何修改 dayjs 配置

首先我们应该确保项目是全局唯一的 `dayjs`，所以组件库的 `dayjs` 是放在 `peerDependencies` 中。

您只需要在您的项目中配置 `dayjs` 即可，最佳实践是创建一个 `startup` 确保最开始的时候进行一些配置，可参考 [startup](https://github.com/DevCloudFE/react-devui/tree/main/packages/platform/src/startup) 。

# 全局配置

通过我们的根组件 `DRoot`，您可以非常方便的配置我们的组件库，下面列出了所有配置项：

```tsx
interface DConfigContextData {
  // 命名空间，影响 `className`，例如设置值为 'app'，那么 'rd-button' 将变为 'app-button'
  // 注意：需要同步修改样式表 `$rd-namespace: 'app'`！
  namespace: string;
  // 组件的全局配置，组件 Prop 优先级为：组件 > 全局配置 > 默认
  // 举个例子: `{ DEmpty: { dDescription: 'Global configuration' } }` 将修改空状态组件的默认描述
  componentConfigs: Partial<DComponentConfig>;
  // [国际化](/docs/Internationalization)
  i18n: {
    lang: DLang;
    resources: typeof resources;
  };
  // 页面布局
  layout: {
    // 滚动容器
    pageScrollEl?: DRefExtra;
    // 内容容器
    contentResizeEl?: DRefExtra;
  };
  // 是否监听全局滚动，会造成不必要的计算，谨慎使用！
  // 如果正确设置了页面布局，那么类似于弹出窗口位置的计算大多数情况都是符合期望的
  // 但是如果页面经常包含嵌套滚动，那么基于每个滚动容器的滚动事件去处理各种位置计算无疑是困难的，这时候可以监听全局滚动
  globalScroll: boolean;
}
```

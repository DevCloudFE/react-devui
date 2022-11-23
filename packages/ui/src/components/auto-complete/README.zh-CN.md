---
title: 自动完成
---

## API

### DAutoCompleteProps

```tsx
interface DAutoCompleteItem {
  value: string;
  disabled?: boolean;
  children?: DAutoCompleteItem[];
}

interface DAutoCompleteProps<T extends DAutoCompleteItem> extends React.HTMLAttributes<HTMLDivElement> {
  dList: T[];
  dVisible?: boolean;
  dLoading?: boolean;
  dCustomItem?: (item: T) => React.ReactNode;
  onVisibleChange?: (visible: boolean) => void;
  onItemClick?: (value: string, item: T) => void;
  onScrollBottom?: () => void;
  afterVisibleChange?: (visible: boolean) => void;
}
```

<!-- prettier-ignore-start -->
| 属性 | 说明 | 默认值 | 版本 | 
| --- | --- | --- | --- | 
| dList | 数据列表 | - |  |
| dVisible | 是否可见，受控，默认为 `false` | - |  |
| dLoading | 加载中状态 | `false` |  |
| dCustomItem | 自定义选项 | - |  |
| onVisibleChange | 显/隐的回调 | - |  |
| onItemClick | 点击选项的回调 | - |  |
| onScrollBottom | 滚动到底部的回调 | - |  |
| afterVisibleChange | 完成显/隐的回调 | - |  |
<!-- prettier-ignore-end -->

---
title: 树
---

## API

### DTreeProps

```tsx
interface DTreeItem<V extends DId> {
  label: string;
  value: V;
  loading?: boolean;
  disabled?: boolean;
  children?: DTreeItem<V>[];
}

interface DTreeProps<V extends DId, T extends DTreeItem<V>> extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  dFormControl?: DFormControl;
  dList: T[];
  dModel?: V | null | V[];
  dHeight?: number;
  dExpands?: V[];
  dShowLine?: boolean;
  dDisabled?: boolean;
  dMultiple?: boolean;
  dOnlyLeafSelectable?: boolean;
  dCustomItem?: (item: T) => React.ReactNode;
  onModelChange?: (value: any, item: any) => void;
  onFirstExpand?: (value: T['value'], item: T) => void;
  onExpandsChange?: (ids: T['value'][], items: T[]) => void;
}
```

<!-- prettier-ignore-start -->
| 属性 | 说明 | 默认值 | 版本 | 
| --- | --- | --- | --- | 
| dFormControl | 支持表单 | - |  |
| dList | 数据列表 | - |  |
| dModel | 已选项，受控，默认为 `dMultiple ? [] : null` | - |  |
| dHeight | 设置列表高度 | - |  |
| dExpands | 展开项，受控，默认为 `[]` | - |  |
| dShowLine | 是否显示连接线 | `false` |  |
| dDisabled | 是否禁用 | `false` |  |
| dMultiple | 是否为多选 | `false` |  |
| dOnlyLeafSelectable | 是否只能选择叶子节点 | `true` |  |
| dCustomItem | 自定义选项 | - |  |
| onModelChange | 已选项变化的回调 | - |  |
| onFirstExpand | 第一次展开选项的回调 | - |  |
| onExpandsChange | 展开项变化的回调 | - |  |
<!-- prettier-ignore-end -->

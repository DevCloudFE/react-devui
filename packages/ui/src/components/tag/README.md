---
group: Data Display
title: Tag
---

Tag.

## When To Use

Mark and classify.

## API

### DTagProps

Extend `React.HTMLAttributes<HTMLDivElement>`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dType | Set tag type | 'primary' \| 'fill' \| 'outline' | 'primary' |
| dTheme | Set tag theme | 'primary' \| 'success' \| 'warning' \| 'danger' | - |
| dColor | Custom tag color | string | - |
| dSize | Set tag size | 'smaller' \| 'larger' | - |
| dClosable | Whether the tag can be closed | boolean | false |
| onClose | Callback when the close button is clicked | React.MouseEventHandler\<HTMLSpanElement\> | - |
<!-- prettier-ignore-end -->

---
group: General
title: Compose
---

Used to combine various components to form a whole.

## When To Use

It is often used to combine various input components or buttons.

## API

### DComposeProps

Extend `React.HTMLAttributes<HTMLDivElement>`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dSize | Set items size | 'smaller' \| 'larger' | - |
| dDisabled | Whether to disable items | boolean | false |
<!-- prettier-ignore-end -->

### DComposeItemProps

Extend `React.HTMLAttributes<HTMLDivElement>`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dGray | Commonly used gray background | boolean | false |
<!-- prettier-ignore-end -->

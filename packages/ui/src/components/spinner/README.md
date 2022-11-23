---
group: Feedback
title: Spinner
---

## API

### DSpinnerProps

```tsx
interface DSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  dVisible?: boolean;
  dText?: React.ReactNode;
  dDelay?: number;
  dSize?: number;
  dAlone?: boolean;
  afterVisibleChange?: (visible: boolean) => void;
}
```

<!-- prettier-ignore-start -->
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dVisible | Whether to show loading indicator | `true` | |
| dText | set text | - | |
| dDelay | Delayed display/hide to prevent visual jitter | - | |
| dSize | set loading indicator size | `28` | |
| dAlone | display as separate element | `false` | |
| afterVisibleChange | Finished visible/hidden callback | - | |
<!-- prettier-ignore-end -->

---
group: Data Entry
title: Form
---

## API

### DFormProps

```tsx
interface DFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  dUpdate: () => void;
  dLabelWidth?: number | string;
  dLabelColon?: boolean;
  dRequiredType?: 'required' | 'optional' | 'hidden';
  dLayout?: 'horizontal' | 'vertical' | 'inline';
  dInlineSpan?: number | true;
  dFeedbackIcon?:
    | boolean
    | {
        success?: React.ReactNode;
        warning?: React.ReactNode;
        error?: React.ReactNode;
        pending?: React.ReactNode;
      };
  dSize?: DSize;
}
```

<!-- prettier-ignore-start -->
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dUpdate | Provide form updates | - |  |
| dLabelWidth | Set label length | - |  |
| dLabelColon | Whether to display the colon after the label | - |  |
| dRequiredType | Set how to display required fields | `'required'` |  |
| dLayout | Set the form layout | `'horizontal'` |  |
| dInlineSpan | Set the number of columns occupied by form items in the `inline` layout | `6` |  |
| dFeedbackIcon | Set the feedback icon for the state of the form item | `false` |  |
| dSize | Set the form item size | - |  |
<!-- prettier-ignore-end -->

### DFormGroupProps

```tsx
interface DFormGroupProps {
  children: React.ReactNode;
  dFormGroup: FormGroup;
  dTitle?: React.ReactNode;
}
```

<!-- prettier-ignore-start -->
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dFormGroup | Provide form data | - |  |
| dTitle | set title | - |  |
<!-- prettier-ignore-end -->

### DFormItemProps

```tsx
type DErrorInfo =
  | string
  | { message: string; status: 'warning' | 'error' }
  | { [index: string]: string | { message: string; status: 'warning' | 'error' } };

interface DFormItemProps<T extends { [index: string]: DErrorInfo }> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  children: React.ReactNode | ((formControls: { [N in keyof T]: DFormControl }) => React.ReactNode);
  dFormControls?: T;
  dLabel?: React.ReactNode;
  dLabelWidth?: number | string;
  dLabelExtra?: ({ title: string; icon?: React.ReactElement } | string)[];
  dShowRequired?: boolean;
  dColNum?: number;
  dSpan?: number | string | true;
}
```

<!-- prettier-ignore-start -->
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dFormControls | Provide form data | - |  |
| dLabel | set tab | - |  |
| dLabelWidth | Set label length | - |  |
| dLabelExtra | Set extra content for the label | - |  |
| dShowRequired | Is it shown as required | - |  |
| dColNum | set the total number of columns | `12` |  |
| dSpan | Set the number of occupied columns | - |  |
<!-- prettier-ignore-end -->

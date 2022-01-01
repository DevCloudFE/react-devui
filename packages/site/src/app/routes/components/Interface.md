# Interface

## DElementSelector

```tsx
type DElementSelector = HTMLElement | null | string | (() => HTMLElement | null);
```

## DPopupProps

Extend `React.HTMLAttributes<HTMLDivElement>`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dVisible | Control the display of popup | boolean | - |
| dPopupContent | The contents of the popup | React.ReactNode | - |
| dTriggerRender | The target node of the popup | `(props: DTriggerRenderProps) => React.ReactNode` | - |
| dTriggerEl |  Custom popup target node | HTMLElement \| null | - |
| dContainer | Mount node of popup, `false` represents the parent node mounted to the target node | [DElementSelector](/components/Interface#DElementSelector) \| false | - |
| dPlacement | popup direction | 'top' \| 'top-left' \| 'top-right' \| 'right' \| 'right-top' \| 'right-bottom' \| 'bottom' \| 'bottom-left' \| 'bottom-right' \| 'left' \| 'left-top' \| 'left-bottom' | 'top' |
| dAutoPlace | When the popup is occluded, the position is automatically adjusted. If the `dContainer` attribute is not specified, the `window` view will be compared by default | boolean | true |
| dTrigger | Trigger behavior | 'hover' \| 'focus' \| 'click' \| null | 'hover' |
| dDistance | The distance of the pop-up window from the target node | number | 10 |
| dArrow | Whether to show arrow | boolean | true |
| dZIndex | Manually control the value of `z-index` | number | - |
| dDestroy | Destroy the node after shutdown | boolean | false |
| dMouseEnterDelay | How many milliseconds after the mouse is moved to display | number | 150 |
| dMouseLeaveDelay | How many milliseconds after the mouse is moved out will it be displayed | number | 150 |
| dEscClosable | Whether to close by pressing Esc | boolean | true |
| dCustomPopup | Custom popup | `(popupEl: HTMLElement, targetEl: HTMLElement) => { top: number; left: number; stateList: DTransitionStateList; arrowPosition?: React.CSSProperties }` | - |
| onVisibleChange | popup display/hide callback | `(visible: boolean) => void` | - |
| afterVisibleChange | Callback for the end of the popup show/hide animation | `(visible: boolean) => void` | - |
<!-- prettier-ignore-end -->

## DPopupRef

```tsx
interface DPopupRef {
  el: HTMLDivElement | null;
  triggerEl: HTMLElement | null;
  updatePosition: () => void;
}
```

## DTriggerRenderProps

```tsx
interface DTriggerRenderProps {
  [key: `data-${string}popup-trigger`]: string;
  onMouseEnter?: React.MouseEventHandler<HTMLElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLElement>;
  onFocus?: React.FocusEventHandler<HTMLElement>;
  onBlur?: React.FocusEventHandler<HTMLElement>;
  onClick?: React.MouseEventHandler<HTMLElement>;
}
```

## DTransitionStateList

```tsx
interface DTransitionStateList {
  'enter-from'?: Partial<CSSStyleDeclaration>;
  'enter-active'?: Partial<CSSStyleDeclaration>;
  'enter-to'?: Partial<CSSStyleDeclaration>;
  'leave-from'?: Partial<CSSStyleDeclaration>;
  'leave-active'?: Partial<CSSStyleDeclaration>;
  'leave-to'?: Partial<CSSStyleDeclaration>;
}
```

## DHeaderProps

Extend `React.HTMLAttributes<HTMLDivElement>`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dClosable | Can be closed | boolean | false |
| dCloseIcon | Custom close icon | React.ReactNode | - |
| dExtraIcons | Add some extra action buttons | React.ReactNode[] | - |
| onClose | Callback when the close button is clicked | `() => void` | - |
<!-- prettier-ignore-end -->

## DFooterProps

Extend `React.HTMLAttributes<HTMLDivElement>`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dAlign | Set the horizontal position of the button | 'left' \| 'center' \| 'right' | 'right' |
| dButtons | Custom button, `'cancel'` stands for cancel button, `'ok'` stands for OK button | React.ReactNode[] | `['cancel', 'ok']` |
| dOkButtonProps | Provide additional `Props` for the OK button | [DButtonProps](/components/Button#DButtonProps) | - |
| dCancelButtonProps | Provide additional `Props` for the cancel button | [DButtonProps](/components/Button#DButtonProps) | - |
| onOkClick | The callback of clicking the OK button | `() => void` | - |
| onCancelClick | The callback of clicking the cancel button | `() => void` | - |
<!-- prettier-ignore-end -->

## DSelectBoxProps

Extend `React.HTMLAttributes<HTMLDivElement>`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dSuffix | Select box suffix | React.ReactNode | - |
| dExpanded | Whether to expand | boolean | false |
| dShowClear | Whether to show the clear button | boolean | false |
| dSearchable | Searchable | boolean | false |
| dClearIcon | Custom clear button | React.ReactNode | - |
| dSize | Select box size | 'smaller' \| 'larger' | - |
| dPlaceholder | Placeholder content | string | - |
| dDisabled | Whether to disable | boolean | false |
| dLoading | Whether it is loading | boolean | false |
| onClear | Callback for clicking the clear button | `() => void` | - |
| onSearch | Search callback | `(value: string) => void` | - |
<!-- prettier-ignore-end -->

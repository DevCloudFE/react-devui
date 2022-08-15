import { useAsync } from '@react-devui/hooks';

import { isPrintableCharacter } from './utils';

export type DComboboxKeyboardSupportKey = 'next' | 'prev' | 'first' | 'last' | 'next-level' | 'prev-level';

export interface DComboboxKeyboardSupportRenderProps {
  ksOnKeyDown: React.KeyboardEventHandler;
}

export interface DComboboxKeyboardSupportProps {
  children: (props: DComboboxKeyboardSupportRenderProps) => JSX.Element | null;
  dVisible: boolean;
  dEditable?: boolean;
  dNested?: boolean;
  onVisibleChange?: (dVisible: boolean) => void;
  onFocusChange?: (key: DComboboxKeyboardSupportKey) => void;
}

export function DComboboxKeyboardSupport(props: DComboboxKeyboardSupportProps): JSX.Element | null {
  const { children, dVisible, dEditable = false, dNested = false, onVisibleChange, onFocusChange } = props;

  const asyncCapture = useAsync();

  return children({
    ksOnKeyDown: (e) => {
      let code: string | null = e.code;
      if (code === 'Escape') {
        e.preventDefault();
        onVisibleChange?.(false);
      } else {
        if (dVisible) {
          if (!dNested && ['ArrowLeft', 'ArrowRight'].includes(code)) {
            code = null;
          }
          switch (code) {
            case 'ArrowUp':
              e.preventDefault();
              onFocusChange?.('prev');
              break;

            case 'ArrowDown':
              e.preventDefault();
              onFocusChange?.('next');
              break;

            case 'Home':
              e.preventDefault();
              onFocusChange?.('first');
              break;

            case 'End':
              e.preventDefault();
              onFocusChange?.('last');
              break;

            case 'ArrowLeft':
              e.preventDefault();
              onFocusChange?.('prev-level');
              break;

            case 'ArrowRight':
              e.preventDefault();
              onFocusChange?.('next-level');
              break;

            default:
              break;
          }
        } else {
          if (dEditable && ['Home', 'End', 'Enter', 'Space'].includes(code)) {
            code = null;
          }
          switch (code) {
            case 'ArrowUp':
              e.preventDefault();
              onVisibleChange?.(true);
              asyncCapture.requestAnimationFrame(() => onFocusChange?.('last'));
              break;

            case 'ArrowDown':
              e.preventDefault();
              onVisibleChange?.(true);
              asyncCapture.requestAnimationFrame(() => onFocusChange?.('first'));
              break;

            case 'Home':
              e.preventDefault();
              onVisibleChange?.(true);
              asyncCapture.requestAnimationFrame(() => onFocusChange?.('first'));
              break;

            case 'End':
              e.preventDefault();
              onVisibleChange?.(true);
              asyncCapture.requestAnimationFrame(() => onFocusChange?.('last'));
              break;

            case 'Enter':
            case 'Space':
              e.preventDefault();
              onVisibleChange?.(true);
              break;

            default:
              if (isPrintableCharacter(e.key)) {
                onVisibleChange?.(true);
              }
              break;
          }
        }
      }
    },
  });
}

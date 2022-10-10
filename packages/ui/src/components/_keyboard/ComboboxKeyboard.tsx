import type { DCloneHTMLElement } from '../../utils/types';

import { useAsync } from '@react-devui/hooks';

import { cloneHTMLElement } from '../../utils';
import { isPrintableCharacter } from './utils';

export type DComboboxKeyboardKey = 'next' | 'prev' | 'first' | 'last' | 'next-level' | 'prev-level';

export interface DComboboxKeyboardProps {
  children: (props: { render: DCloneHTMLElement }) => JSX.Element | null;
  dVisible: boolean;
  dEditable: boolean;
  dHasSub: boolean;
  onVisibleChange: (dVisible: boolean) => void;
  onFocusChange: (key: DComboboxKeyboardKey) => void;
}

export function DComboboxKeyboard(props: DComboboxKeyboardProps): JSX.Element | null {
  const { children, dVisible, dEditable, dHasSub, onVisibleChange, onFocusChange } = props;

  const async = useAsync();

  return children({
    render: (el) =>
      cloneHTMLElement(el, {
        onKeyDown: (e) => {
          el.props.onKeyDown?.(e);

          let code: string | null = e.code;
          if (code === 'Escape') {
            e.preventDefault();
            onVisibleChange(false);
          } else {
            if (dVisible) {
              if (!dHasSub && ['ArrowLeft', 'ArrowRight'].includes(code)) {
                code = null;
              }
              switch (code) {
                case 'ArrowUp':
                  e.preventDefault();
                  onFocusChange('prev');
                  break;

                case 'ArrowDown':
                  e.preventDefault();
                  onFocusChange('next');
                  break;

                case 'Home':
                  e.preventDefault();
                  onFocusChange('first');
                  break;

                case 'End':
                  e.preventDefault();
                  onFocusChange('last');
                  break;

                case 'ArrowLeft':
                  e.preventDefault();
                  onFocusChange('prev-level');
                  break;

                case 'ArrowRight':
                  e.preventDefault();
                  onFocusChange('next-level');
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
                  onVisibleChange(true);
                  async.requestAnimationFrame(() => onFocusChange('last'));
                  break;

                case 'ArrowDown':
                  e.preventDefault();
                  onVisibleChange(true);
                  async.requestAnimationFrame(() => onFocusChange('first'));
                  break;

                case 'Home':
                  e.preventDefault();
                  onVisibleChange(true);
                  async.requestAnimationFrame(() => onFocusChange('first'));
                  break;

                case 'End':
                  e.preventDefault();
                  onVisibleChange(true);
                  async.requestAnimationFrame(() => onFocusChange('last'));
                  break;

                case 'Enter':
                case 'Space':
                  e.preventDefault();
                  onVisibleChange(true);
                  break;

                default:
                  if (isPrintableCharacter(e.key)) {
                    onVisibleChange(true);
                  }
                  break;
              }
            }
          }
        },
      }),
  });
}

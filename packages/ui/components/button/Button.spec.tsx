import type { DButtonProps } from './Button';

import { render, screen, fireEvent } from '@testing-library/react';

import { SearchOutlined } from '@react-devui/icons';

import { PREFIX } from '../../__tests__';
import { DButton } from './Button';

describe('DButton', () => {
  let buttonRender: (props: DButtonProps) => void;
  let buttonReRender: (props: DButtonProps) => void;
  let buttonEl: HTMLElement;

  beforeEach(() => {
    buttonRender = (props) => {
      const { rerender } = render(<DButton data-testid="button" {...props} />);
      buttonReRender = (props) => {
        rerender(<DButton data-testid="button" {...props} />);
      };
      buttonEl = screen.getByTestId('button');
    };
  });

  it('should `dType` work', () => {
    const type = 'secondary';
    buttonRender({ dType: type });
    expect(buttonEl).toHaveClass(`${PREFIX}button--${type}`);
  });

  it('should `dTheme` work', () => {
    const theme = 'success';
    buttonRender({ dTheme: theme });
    expect(buttonEl).toHaveClass(`t-${theme}`);
  });

  it('should `dLoading` work', () => {
    buttonRender({ dLoading: true });
    expect(buttonEl).toHaveClass('is-loading');
    expect(buttonEl).toBeDisabled();
  });

  it('should `dBlock` work', () => {
    buttonRender({ dBlock: true });
    expect(buttonEl).toHaveClass(`${PREFIX}button--block`);
  });

  it('should `dVariant` work', () => {
    const variant = 'circle';
    buttonRender({ dVariant: variant });
    expect(buttonEl).toHaveClass(`${PREFIX}button--${variant}`);
  });

  it('should `dSize` work', () => {
    const size = 'smaller';
    buttonRender({ dSize: size });
    expect(buttonEl).toHaveClass(`${PREFIX}button--${size}`);
  });

  it('should `dIcon` work', () => {
    buttonRender({ dIcon: <SearchOutlined data-testid="icon" /> });
    expect(screen.getByTestId('icon')).toBeTruthy();
  });

  it('should `dIconRight` work', () => {
    buttonRender({ dIconRight: true });
    expect(buttonEl).toHaveClass(`${PREFIX}button--icon-right`);
  });

  it('should `wave` work', () => {
    buttonRender({ dType: 'link', dTheme: 'primary' });
    expect(buttonEl.querySelector(`.${PREFIX}wave`)).not.toBeTruthy();

    fireEvent.click(buttonEl);
    expect(buttonEl.querySelector(`.${PREFIX}wave`)).not.toBeTruthy();

    buttonReRender({ dType: 'primary', dTheme: 'primary' });
    fireEvent.click(buttonEl);
    expect(buttonEl.querySelector(`.${PREFIX}wave`)).toBeTruthy();
  });
});

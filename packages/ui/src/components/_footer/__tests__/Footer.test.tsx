import { render, screen, fireEvent } from '@testing-library/react';

import { PREFIX } from '../../../tests';
import { DButton } from '../../button';
import { DFooter } from '../Footer';

describe('DFooter', () => {
  const okButton = () => {
    return screen.getByText('OK');
  };
  const cancelButton = () => {
    return screen.getByText('Cancel');
  };

  it('should `dAlign` work', () => {
    render(<DFooter data-testid="footer" dAlign="left" />);
    expect(screen.getByTestId('footer').classList.contains(`${PREFIX}footer--left`)).toBeTruthy();
  });

  it('should `dButtons` work', () => {
    render(<DFooter dButtons={['cancel', <DButton>Button</DButton>, 'ok']} />);

    expect(screen.queryAllByRole('button').length).toBe(3);

    const buttons = screen.queryAllByRole('button');

    expect(buttons[0].textContent).toBe('Cancel');

    expect(buttons[1].textContent).toBe('Button');

    expect(buttons[2].textContent).toBe('OK');
  });

  it('should `dOkButtonProps` work', () => {
    render(<DFooter dOkButtonProps={{ disabled: true }} />);
    expect(okButton()).toBeDisabled();
  });

  it('should `dCancelButtonProps` work', () => {
    render(<DFooter dCancelButtonProps={{ disabled: true }} />);

    expect(cancelButton()).toBeDisabled();
  });

  it('should `onOkClick` work', () => {
    const mockCallBack = jest.fn();
    render(<DFooter onOkClick={mockCallBack} />);
    fireEvent.click(okButton());

    expect(mockCallBack).toHaveBeenCalledTimes(1);
  });

  it('should `onCancelClick` work', () => {
    const mockCallBack = jest.fn();
    render(<DFooter onCancelClick={mockCallBack} />);
    fireEvent.click(cancelButton());

    expect(mockCallBack).toHaveBeenCalledTimes(1);
  });
});

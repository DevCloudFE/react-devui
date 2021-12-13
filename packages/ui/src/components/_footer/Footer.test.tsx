import { render, screen, fireEvent } from '@testing-library/react';

import { PREFIX } from '../../tests';
import { DButton } from '../button';
import { DFooter } from './Footer';

describe('DFooter', () => {
  // const okButton = (footer: ShallowWrapper) => {
  //   return footer.find(DButton).at(1);
  // };
  // const cancelButton = (footer: ShallowWrapper) => {
  //   return footer.find(DButton).at(0);
  // };

  it('should `dAlign` work', () => {
    render(<DFooter data-testid="footer" dAlign="left" />);
    expect(screen.getByTestId('footer').classList.contains(`${PREFIX}footer--left`)).toBeTruthy();
  });

  it('should `dButtons` work', () => {
    render(<DFooter dButtons={['cancel', <DButton>Button</DButton>, 'ok']} />);

    expect(screen.queryAllByRole('button').length).toBe(3);

    const buttons = screen.queryAllByRole('button');

    expect(buttons[0].innerHTML).toBe('Cancel');

    expect(buttons[1].innerHTML).toBe('Button');

    expect(buttons[2].innerHTML).toBe('OK');
  });

  it('should `dOkButtonProps` work', () => {
    render(<DFooter dOkButtonProps={{ disabled: true }} />);
    expect(screen.queryAllByRole('button')[1].getAttribute('disabled')).toBe('');
    expect(screen.queryAllByRole('button')[1].getAttribute('aria-disabled')).toBeTruthy();
  });

  it('should `dCancelButtonProps` work', () => {
    render(<DFooter dCancelButtonProps={{ disabled: true }} />);

    expect(screen.queryAllByRole('button')[0].getAttribute('disabled')).toBe('');
    expect(screen.queryAllByRole('button')[0].getAttribute('aria-disabled')).toBeTruthy();
  });

  it('should `onOkClick` work', () => {
    const mockCallBack = jest.fn();
    render(<DFooter onOkClick={mockCallBack} />);
    fireEvent.click(screen.queryAllByRole('button')[1]);

    expect(mockCallBack.mock.calls.length).toBe(1);
  });

  it('should `onCancelClick` work', () => {
    const mockCallBack = jest.fn();
    render(<DFooter onCancelClick={mockCallBack} />);
    fireEvent.click(screen.queryAllByRole('button')[0]);

    expect(mockCallBack.mock.calls.length).toBe(1);
  });
});

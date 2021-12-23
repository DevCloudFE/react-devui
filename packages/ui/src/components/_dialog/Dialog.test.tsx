import { fireEvent, render, screen } from '@testing-library/react';

import { DDialog } from './Dialog';

describe('DDialog', () => {
  const mask = () => screen.queryAllByRole('dialog')[0].firstChild;

  it('should `dVisible` work', () => {
    render(<DDialog dVisible={false} />);
    expect(screen.queryAllByRole('dialog').length).toBe(0);
    render(<DDialog dVisible={true} />);
    expect(screen.queryAllByRole('dialog').length).toBe(1);
  });

  it('should `dMask` work', () => {
    render(<DDialog dVisible={true} />);
    jest.advanceTimersByTime(1000);

    expect(mask()).not.toBeVisible();

    render(<DDialog dVisible={true} dMask={false} />);
    jest.advanceTimersByTime(1000);

    expect(mask()).not.toBeVisible();
  });

  describe('dMaskClosable', () => {
    it('should `dMaskClosable` work, default is true', () => {
      render(<DDialog dVisible={true} />);
      jest.advanceTimersByTime(1000);
      expect(mask()).toBeVisible();
      fireEvent.click(mask()!);
      expect(mask()).not.toBeVisible();
    });
  });

  describe('dDestroy', () => {
    it('default if false', () => {
      render(
        <DDialog dVisible={true}>
          <input data-testid="dialog-test" />
        </DDialog>
      );
      fireEvent.click(mask()!);
      expect(screen.queryAllByTestId('dialog-test').length).toBe(1);
    });

    it('destroy on hide should unmount child components on close', () => {
      render(
        <DDialog dVisible={true} dDestroy={true}>
          <input data-testid="dialog-test" />
        </DDialog>
      );

      fireEvent.click(mask()!);
      jest.advanceTimersByTime(1000);

      expect(screen.queryAllByTestId('dialog-test').length).toBe(0);
    });
  });

  it('should `onClose` work', () => {
    const mockCallBack = jest.fn();
    render(<DDialog dVisible={true} onClose={mockCallBack} />);
    fireEvent.click(mask()!);
    expect(mockCallBack.mock.calls.length).toBe(1);
  });

  // describe('should `afterVisibleChange` work', () => {
  it('work when dVisible from true to false', () => {
    const mockCallBack = jest.fn();
    const { rerender } = render(<DDialog dVisible={true} afterVisibleChange={mockCallBack} />);
    rerender(<DDialog dVisible={false} afterVisibleChange={mockCallBack} />);
    // the difference between `onClose` and `afterVisibleChange` is whether the callback will be called immediately
    expect(mockCallBack).not.toBeCalled();
    jest.advanceTimersByTime(1000);
    expect(mockCallBack).toHaveBeenCalledTimes(1);
  });

  it('should `afterVisibleChange` work', () => {
    const mockCallBack = jest.fn();
    const { rerender } = render(<DDialog dVisible={false} afterVisibleChange={mockCallBack} />);
    expect(mockCallBack).not.toBeCalled();
    rerender(<DDialog dVisible={true} afterVisibleChange={mockCallBack} />);
    jest.advanceTimersByTime(1000);
    expect(mockCallBack).toBeCalled();
    expect(mockCallBack).toHaveBeenCalledTimes(1);
  });

  it('work when dVisible from false to true', () => {
    const mockCallBack = jest.fn();
    const { rerender } = render(<DDialog dVisible={false} afterVisibleChange={mockCallBack} />);
    rerender(<DDialog dVisible={true} afterVisibleChange={mockCallBack} />);
    jest.advanceTimersByTime(1000);
    expect(mockCallBack).toHaveBeenCalledTimes(1);
    expect(mockCallBack.mock.calls.length).toBe(1);
  });

  it('should custom `className` work', () => {
    const customClassName = 'testClassName';
    render(<DDialog dVisible={true} className={customClassName} />);
    expect(screen.queryAllByRole('dialog')[0]).toHaveClass(customClassName);
  });
});

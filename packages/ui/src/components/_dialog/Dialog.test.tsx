import { fireEvent, render, screen } from '@testing-library/react';

import { DDialog } from './Dialog';

describe('DDialog', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const mask = () => screen.queryAllByRole('dialog')[0].firstChild;

  it('should `dVisible` work', () => {
    render(<DDialog dVisible={false} />);
    expect(screen.queryAllByRole('dialog').length).toBe(0);
    render(<DDialog dVisible={true} />);
    expect(screen.queryAllByRole('dialog').length).toBe(1);
  });

  it('should `dMask` work', () => {
    render(<DDialog dVisible={true} />);
    setTimeout(() => {
      expect(mask()).toBeVisible();
    }, 1000);

    render(<DDialog dVisible={true} dMask={false} />);
    setTimeout(() => {
      expect(mask()).not.toBeVisible();
    }, 1000);
  });

  describe('dMaskClosable', () => {
    it('should `dMaskClosable` work, default is true', () => {
      render(<DDialog dVisible={true} />);
      setTimeout(() => {
        expect(mask()).toBeVisible();
        fireEvent.click(mask()!);
        expect(mask()).not.toBeVisible();
      }, 1000);
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
      // question: why without setTimeout cannot work?
      setTimeout(() => {
        fireEvent.click(mask()!);
        expect(screen.queryAllByTestId('dialog-test').length).toBe(0);
      }, 1000);
    });
  });

  it('should `onClose` work', () => {
    const mockCallBack = jest.fn();
    render(<DDialog dVisible={true} onClose={mockCallBack} />);
    fireEvent.click(mask()!);
    expect(mockCallBack.mock.calls.length).toBe(1);
  });

  it('should `afterVisibleChange` work', () => {
    const mockCallBack = jest.fn();
    render(<DDialog dVisible={true} afterVisibleChange={mockCallBack} />);
    fireEvent.click(mask()!);
    // the difference between `onClose` and `afterVisibleChange` is whether the callback will be called immediately
    setTimeout(() => {
      expect(mockCallBack.mock.calls.length).toBe(1);
    }, 1000);
  });

  it('should custom `className` work', () => {
    const customClassName = 'testClassName';
    render(<DDialog dVisible={true} className={customClassName} />);
    expect(screen.queryAllByRole('dialog')[0]).toHaveClass(customClassName);
  });
});

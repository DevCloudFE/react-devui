import { render, screen, fireEvent } from '@testing-library/react';

import { DIcon } from '../icon';
import { DHeader } from './Header';

const icon = <DIcon data-testid="custom-icon"></DIcon>;

describe('DHeader', () => {
  it('should `dCloseIcon` work', () => {
    render(<DHeader />);
    expect(screen.getAllByRole('button').length).toBe(1);
  });

  it('should custom `dCloseIcon` work', () => {
    render(<DHeader dCloseIcon={icon} />);
    expect(screen.getAllByTestId('custom-icon').length).toBe(1);
  });

  it('should `dCloseIcon` null work', () => {
    render(<DHeader dCloseIcon={null} />);
    expect(screen.queryAllByRole('button').length).toBe(0);
  });

  it('should `dExtraIcons` work', () => {
    render(<DHeader dExtraIcons={[icon, icon]} dCloseIcon={null} />);
    expect(screen.getAllByRole('button').length).toBe(2);
  });

  it('should `onClose` work', () => {
    const mockCallBack = jest.fn();
    render(<DHeader onClose={mockCallBack} />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockCallBack).toHaveBeenCalledTimes(1);
  });
});

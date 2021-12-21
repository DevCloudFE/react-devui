import { render, fireEvent } from '@testing-library/react';

import { PREFIX } from '../../tests';
import { DIcon } from '../icon';
import { DInput, DInputAffix } from './index';

const icon = (
  <DIcon data-testid="custom-icon" viewBox="64 64 896 896">
    <path d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 00203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z"></path>
  </DIcon>
);

describe('DInput', () => {
  it('should `dValue` work', () => {
    const value = '123';
    const { getByRole } = render(<DInput dValue={[value]} />);
    expect(getByRole('textbox').getAttribute('value')).toBe('123');
  });

  it('should `dSize` work', () => {
    const size = 'larger';
    const { getByRole } = render(<DInput dSize={size} />);
    expect(getByRole('textbox').classList.contains(`${PREFIX}input--${size}`)).toBeTruthy();
  });

  it('should `onValueChange` work', () => {
    const mockCallBack = jest.fn();
    const { getByRole } = render(<DInput onValueChange={mockCallBack} />);
    fireEvent.change(getByRole('textbox'), { target: { value: '42' } });
    expect(mockCallBack.mock.calls.length).toBe(1);
  });
});

describe('DInputAffix', () => {
  it('should `dPrefix` work', () => {
    const { getByRole } = render(
      <DInputAffix dPrefix={icon}>
        <DInput />
      </DInputAffix>
    );
    expect(getByRole('textbox').previousSibling?.nodeName).toBe('DIV');
  });

  it('should `dSuffix` work', () => {
    const { getByRole } = render(
      <DInputAffix dSuffix={icon}>
        <DInput />
      </DInputAffix>
    );
    expect(getByRole('textbox').nextSibling?.nodeName).toBe('DIV');
  });

  it('should `dDisabled` work', () => {
    const { getByRole } = render(
      <DInputAffix dDisabled>
        <DInput />
      </DInputAffix>
    );
    expect(getByRole('textbox')).toBeDisabled();
  });

  it('should `dPassword` work', () => {
    const value = 'This is password input';
    const { getByRole, getByDisplayValue } = render(
      <DInputAffix dPassword>
        <DInput dValue={[value]} />
      </DInputAffix>
    );
    expect(getByDisplayValue(value).getAttribute('type')).toBe('password');
    fireEvent.mouseDown(getByRole('button'));
    expect(getByDisplayValue(value).getAttribute('type')).toBe('text');
  });

  it('should `dPasswordToggle` work', () => {
    const value = 'This is password input';
    const { getByRole, getByDisplayValue } = render(
      <DInputAffix dPassword dPasswordToggle={false}>
        <DInput dValue={[value]} />
      </DInputAffix>
    );
    fireEvent.mouseDown(getByRole('button'));
    expect(getByDisplayValue(value).getAttribute('type')).toBe('password');
  });

  it('should `not dPassword and dPasswordToggle is false` work', () => {
    const { getByRole } = render(
      <DInputAffix dPasswordToggle={false}>
        <DInput />
      </DInputAffix>
    );
    expect(getByRole('textbox').nextSibling).toBeNull();
    expect(getByRole('textbox').getAttribute('type')).toBe('text');
  });

  it('should `dNumber` work', () => {
    const value = '100';
    const { getByDisplayValue } = render(
      <DInputAffix dNumber>
        <DInput dValue={[value]} />
      </DInputAffix>
    );
    expect(getByDisplayValue(value).getAttribute('type')).toBe('number');
  });

  it('should `dNumber use button change value` work', () => {
    const { getByTestId, getAllByRole } = render(
      <DInputAffix dNumber>
        <DInput data-testid="numberInput" />
      </DInputAffix>
    );
    const buttons = getAllByRole('button');
    fireEvent.mouseDown(buttons[0]);
    expect(getByTestId('numberInput').getAttribute('value')).toBe('1');

    fireEvent.mouseDown(buttons[1]);
    expect(getByTestId('numberInput').getAttribute('value')).toBe('0');
  });

  it('should `dClearable` work', () => {
    const mockCallBack = jest.fn();
    const value = 'This is number input';
    const { getByRole } = render(
      <DInputAffix dClearable>
        <DInput dValue={[value]} onValueChange={mockCallBack} />
      </DInputAffix>
    );
    fireEvent.mouseDown(getByRole('button'));
    expect(mockCallBack.mock.calls[0][0]).toBe('');
  });

  it('should `dClearIcon` work', () => {
    const { getByTestId } = render(
      <DInputAffix dClearable dClearIcon={icon}>
        <DInput />
      </DInputAffix>
    );
    expect(getByTestId('custom-icon')).toBeTruthy();
  });

  it('should `dSize` work', () => {
    const size = 'larger';
    const { getByRole, getByTestId } = render(
      <DInputAffix data-testid="d-input-affix" dSize={size}>
        <DInput />
      </DInputAffix>
    );
    expect(getByTestId('d-input-affix').classList.contains(`${PREFIX}input-affix--${size}`)).toBeTruthy();
    expect(getByRole('textbox').classList.contains(`${PREFIX}input--${size}`)).toBeTruthy();
  });
});

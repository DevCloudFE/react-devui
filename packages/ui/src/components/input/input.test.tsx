import { render, act, fireEvent } from '@testing-library/react';

import { PREFIX } from '../../tests';
import { DCompose } from '../compose';
import { DIcon } from '../icon';
import { DInput, DInputAffix } from './index';

jest.useFakeTimers();

const icon = (
  <DIcon data-testid="custom-icon" viewBox="64 64 896 896">
    <path d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 00203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z"></path>
  </DIcon>
);

describe('DInput', () => {
  it('should `dModel` work', () => {
    const value = '123';
    const { getByRole } = render(<DInput dModel={[value]} />);
    expect(getByRole('textbox').getAttribute('value')).toBe('123');
  });

  it('should `dSize` work', () => {
    const size = 'larger';
    const { getByRole } = render(<DInput dSize={size} />);
    expect(getByRole('textbox').classList.contains(`${PREFIX}input--${size}`)).toBeTruthy();
  });

  it('should `onModelChange` work', () => {
    const mockCallBack = jest.fn();
    const { getByRole } = render(<DInput onModelChange={mockCallBack} />);
    fireEvent.change(getByRole('textbox'), { target: { value: '42' } });
    expect(mockCallBack.mock.calls.length).toBe(1);
  });
  it('should `onChange` work', () => {
    const mockCallBack = jest.fn();
    const { getByRole } = render(<DInput onChange={mockCallBack} />);
    fireEvent.change(getByRole('textbox'), { target: { value: '42' } });
    expect(mockCallBack.mock.calls.length).toBe(1);
  });
  it('should `onFocus` work', () => {
    const mockCallBack = jest.fn();
    const { getByRole } = render(<DInput onFocus={mockCallBack} />);
    fireEvent.focus(getByRole('textbox'));
    expect(mockCallBack.mock.calls.length).toBe(1);
  });
  it('should `onBlur` work', () => {
    const mockCallBack = jest.fn();
    const { getByRole } = render(<DInput onBlur={mockCallBack} />);
    fireEvent.blur(getByRole('textbox'));
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
        <DInput dModel={[value]} />
      </DInputAffix>
    );
    expect(getByDisplayValue(value).getAttribute('type')).toBe('password');
    act(() => {
      getByDisplayValue(value).focus();
    });
    fireEvent.mouseDown(getByRole('button'));
    fireEvent.mouseUp(getByRole('button'));
    expect(getByDisplayValue(value).getAttribute('type')).toBe('text');
  });

  it('should `dPasswordToggle` work', () => {
    const value = 'This is password input';
    const { getByRole, getByDisplayValue } = render(
      <DInputAffix dPassword dPasswordToggle={false}>
        <DInput dModel={[value]} />
      </DInputAffix>
    );
    fireEvent.mouseDown(getByRole('button'));
    fireEvent.mouseUp(getByRole('button'));
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
        <DInput dModel={[value]} />
      </DInputAffix>
    );
    expect(getByDisplayValue(value).getAttribute('type')).toBe('number');
  });

  it('should `dNumber use increase button change value` work', () => {
    const mockCallBack = jest.fn();
    const { getByTestId, getAllByRole } = render(
      <DInputAffix dNumber>
        <DInput data-testid="increaseNumberInput" onModelChange={mockCallBack} />
      </DInputAffix>
    );
    const buttons = getAllByRole('button');
    act(() => {
      getByTestId('increaseNumberInput').focus();
    });
    fireEvent.mouseDown(buttons[0]);
    fireEvent.mouseUp(buttons[0]);
    expect(mockCallBack.mock.calls.length).toBe(1);
  });

  it('should `dNumber use decrease button change value` work', () => {
    const mockCallBack = jest.fn();
    const { getByTestId, getAllByRole } = render(
      <DInputAffix dNumber>
        <DInput data-testid="decreaseNumberInput" onModelChange={mockCallBack} />
      </DInputAffix>
    );
    const buttons = getAllByRole('button');
    act(() => {
      getByTestId('decreaseNumberInput').focus();
    });
    fireEvent.mouseDown(buttons[1]);
    fireEvent.mouseUp(buttons[1]);
    expect(mockCallBack.mock.calls.length).toBe(1);
  });
  it('should `dNumber loop increase button change value` work', () => {
    const mockCallBack = jest.fn();
    const { getAllByRole } = render(
      <DInputAffix dNumber>
        <DInput data-testid="numberInput" onModelChange={mockCallBack} />
      </DInputAffix>
    );
    const buttons = getAllByRole('button');

    act(() => {
      fireEvent.mouseDown(buttons[0]);
      jest.runOnlyPendingTimers();
    });
    expect(mockCallBack.mock.calls.length).not.toBe(1);
  });
  it('should `dNumber loop decrease button change value` work', () => {
    const mockCallBack = jest.fn();
    const { getAllByRole } = render(
      <DInputAffix dNumber>
        <DInput data-testid="numberInput" onModelChange={mockCallBack} />
      </DInputAffix>
    );
    const buttons = getAllByRole('button');

    act(() => {
      fireEvent.mouseDown(buttons[1]);
      jest.runOnlyPendingTimers();
    });
    expect(mockCallBack.mock.calls.length).not.toBe(1);
  });

  it('should `dClearable` work', () => {
    const mockCallBack = jest.fn();
    const value = 'This is text input';
    const { getByRole } = render(
      <DInputAffix dClearable>
        <DInput dModel={[value]} onModelChange={mockCallBack} />
      </DInputAffix>
    );
    act(() => {
      getByRole('textbox').focus();
    });
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

  it('should `is-focus class` work', () => {
    const { getByRole, getByTestId } = render(
      <DInputAffix data-testid="d-input-affix">
        <DInput />
      </DInputAffix>
    );
    fireEvent.focus(getByRole('textbox'));
    expect(getByTestId('d-input-affix').classList.contains(`is-focus`)).toBeTruthy();

    fireEvent.blur(getByRole('textbox'));
    expect(getByTestId('d-input-affix').classList.contains(`is-focus`)).toBeFalsy();
  });

  it('should `DCompose dSize` work', () => {
    const size = 'smaller';
    const { getByRole } = render(
      <DCompose dSize={size}>
        <DInputAffix>
          <DInput />
        </DInputAffix>
      </DCompose>
    );
    expect(getByRole('textbox').classList.contains(`${PREFIX}input--${size}`)).toBeTruthy();
  });
});

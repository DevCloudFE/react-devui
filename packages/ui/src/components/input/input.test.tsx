import type { DInputProps } from './Input';
import type { DInputAffixProps } from './InputAffix';
import type { RenderResult } from '@testing-library/react';

import { render, act, fireEvent } from '@testing-library/react';

import { PREFIX } from '../../tests';
import { DIcon } from '../icon';
import { DInput, DInputAffix } from './index';

jest.useFakeTimers();

const icon = <DIcon data-testid="custom-icon"></DIcon>;

describe('DInput', () => {
  let inputRender: (props: DInputProps) => RenderResult;
  let inputEl: HTMLElement;

  beforeEach(() => {
    inputRender = (props) => {
      const renderResult = render(<DInput data-testid="input" {...props} />);
      inputEl = renderResult.getByTestId('input');
      return renderResult;
    };
  });

  it('should `dModel` work', () => {
    const value = '123';
    inputRender({ dModel: [value] });

    expect(inputEl.getAttribute('value')).toBe(value);
  });

  it('should `dSize` work', () => {
    const size = 'larger';
    inputRender({ dSize: size });

    expect(inputEl.classList.contains(`${PREFIX}input--${size}`)).toBeTruthy();
  });

  it('should `onModelChange` work', () => {
    const mockCallBack = jest.fn();
    inputRender({ onModelChange: mockCallBack });

    fireEvent.change(inputEl, { target: { value: '42' } });
    expect(mockCallBack).toHaveBeenCalledTimes(1);
  });

  it('should `onChange` work', () => {
    const mockCallBack = jest.fn();
    inputRender({ onChange: mockCallBack });

    fireEvent.change(inputEl, { target: { value: '42' } });
    expect(mockCallBack).toHaveBeenCalledTimes(1);
  });

  it('should `onFocus` work', () => {
    const mockCallBack = jest.fn();
    inputRender({ onFocus: mockCallBack });

    fireEvent.focus(inputEl);
    expect(mockCallBack).toHaveBeenCalledTimes(1);
  });

  it('should `onBlur` work', () => {
    const mockCallBack = jest.fn();
    inputRender({ onBlur: mockCallBack });

    fireEvent.blur(inputEl);
    expect(mockCallBack).toHaveBeenCalledTimes(1);
  });
});

describe('DInputAffix', () => {
  let inputAffixRender: (props: DInputAffixProps, inputProps?: DInputProps) => RenderResult;
  let inputAffixReRender: (props: DInputAffixProps, inputProps?: DInputProps) => void;
  let inputAffixEl: HTMLElement;
  let inputEl: HTMLElement;

  beforeEach(() => {
    let renderResult: RenderResult;
    inputAffixRender = (props, inputProps) => {
      renderResult = render(
        <DInputAffix data-testid="input-affix" {...props}>
          <DInput data-testid="input" {...inputProps} />
        </DInputAffix>
      );
      inputAffixEl = renderResult.getByTestId('input-affix');
      inputEl = renderResult.getByTestId('input');
      return renderResult;
    };

    inputAffixReRender = (props, inputProps) => {
      renderResult.rerender(
        <DInputAffix data-testid="input-affix" {...props}>
          <DInput data-testid="input" {...inputProps} />
        </DInputAffix>
      );
    };
  });

  it('should `dPrefix` work', () => {
    const { getByTestId } = inputAffixRender({ dPrefix: icon });

    getByTestId('custom-icon');
  });

  it('should `dSuffix` work', () => {
    const { getByTestId } = inputAffixRender({ dSuffix: icon });

    getByTestId('custom-icon');
  });

  it('should `dDisabled` work', () => {
    inputAffixRender({ dDisabled: true });

    expect(inputEl).toBeDisabled();
  });

  it('should `dPassword` work', () => {
    inputAffixRender({ dPassword: true });

    expect(inputEl.getAttribute('type')).toBe('password');
  });

  it('should `dPasswordToggle` work', () => {
    const { getByRole } = inputAffixRender({ dPassword: true, dPasswordToggle: false });
    const buttonEl = getByRole('button');

    fireEvent.mouseDown(buttonEl, { button: 0 });
    expect(inputEl.getAttribute('type')).toBe('password');

    inputAffixReRender({ dPassword: true });
    fireEvent.mouseDown(buttonEl, { button: 2 });
    expect(inputEl.getAttribute('type')).toBe('password');
    fireEvent.mouseDown(buttonEl, { button: 0 });
    expect(inputEl.getAttribute('type')).not.toBe('password');

    act(() => {
      inputEl.focus();
    });
    fireEvent.mouseDown(buttonEl, { button: 0 });
    expect(document.activeElement).toBe(inputEl);
  });

  it('should `dNumber` work', () => {
    inputAffixRender({ dNumber: true });

    expect(inputEl.getAttribute('type')).toBe('number');
  });

  describe('should `dNumber` work', () => {
    const testFn = (label: string) => {
      const mockCallBack = jest.fn();
      const { getByLabelText } = inputAffixRender({ dNumber: true }, { onModelChange: mockCallBack });
      const buttonEl = getByLabelText(label);

      fireEvent.mouseDown(buttonEl, { button: 2 });
      expect(mockCallBack).toHaveBeenCalledTimes(0);
      fireEvent.mouseDown(buttonEl, { button: 0 });
      expect(mockCallBack).toHaveBeenCalledTimes(1);

      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(mockCallBack.mock.calls.length).toBeGreaterThan(1);

      const calledTimes = mockCallBack.mock.calls.length;
      fireEvent.mouseUp(buttonEl);
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(mockCallBack).toHaveBeenCalledTimes(calledTimes);

      act(() => {
        inputEl.focus();
        buttonEl.dispatchEvent(
          new MouseEvent('mousedown', {
            bubbles: true,
            cancelable: true,
            view: window,
            button: 0,
          })
        );
      });
      expect(document.activeElement).toBe(inputEl);
    };

    it('should `increase` work', () => {
      testFn('Increase number');
    });

    it('should `decrease` work', () => {
      testFn('Decrease number');
    });
  });

  it('should `dClearable` work', () => {
    const mockCallBack = jest.fn();
    const { getByRole } = inputAffixRender({ dClearable: true }, { dModel: ['This is text input'], onModelChange: mockCallBack });
    const buttonEl = getByRole('button');

    fireEvent.mouseDown(buttonEl, { button: 2 });
    expect(mockCallBack).not.toBeCalled();
    fireEvent.mouseDown(buttonEl, { button: 0 });
    expect(mockCallBack).toHaveBeenCalledWith('');

    act(() => {
      inputEl.focus();
      buttonEl.dispatchEvent(
        new MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true,
          view: window,
          button: 0,
        })
      );
    });
    expect(document.activeElement).toBe(inputEl);
  });

  it('should `dClearIcon` work', () => {
    const { getByTestId } = inputAffixRender({ dClearable: true, dClearIcon: icon });

    getByTestId('custom-icon');
  });

  it('should `dSize` work', () => {
    const size = 'larger';
    inputAffixRender({ dSize: size });

    expect(inputAffixEl.classList.contains(`${PREFIX}input-affix--${size}`)).toBeTruthy();
    expect(inputEl.classList.contains(`${PREFIX}input--${size}`)).toBeTruthy();
  });

  it('should `is-focus class` work', () => {
    inputAffixRender({});

    fireEvent.focus(inputEl);
    expect(inputAffixEl.classList.contains(`is-focus`)).toBeTruthy();

    fireEvent.blur(inputEl);
    expect(inputAffixEl.classList.contains(`is-focus`)).toBeFalsy();
  });
});

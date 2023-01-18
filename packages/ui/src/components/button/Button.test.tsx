import type { DSize } from '../../utils/types';
import type { DButtonProps } from './Button';

import { render, fireEvent } from '../../__tests__/utils';
import { DCompose } from '../compose';
import { DButton } from './index';

const dPrefix = 'rd-';

const getTypeClass = (dType: DButtonProps['dType'], prefix = dPrefix) => {
  return `${prefix}button--${dType || 'primary'}`;
};
const getThemeClass = (dTheme: DButtonProps['dTheme'], prefix = 't') => {
  return `${prefix}-${dTheme || 'primary'}`;
};
const getOtherClass = (ots?: 'icon' | DSize | 'block' | DButtonProps['dVariant'], separator = '--', prefix = dPrefix) => {
  return !ots ? `${prefix}button` : `${prefix}button${separator}${ots || ''}`;
};

const sleep = (time: number) =>
  new Promise((resolve) =>
    setTimeout(() => {
      resolve('');
    }, time)
  );

describe('DButton', () => {
  const text = 'This is DButton';

  it('should `children` work', () => {
    const { getByText } = render(<DButton children={text} />);
    expect(getByText(text)).toBeInTheDocument();
  });

  describe('the type property of DButton', () => {
    it('should render with the root, text, and primary classes but no others', () => {
      const buttonText = 'Hello World';
      const { getByRole, getByText } = render(
        <DButton className="cust-btn" type="submit">
          {buttonText}
        </DButton>
      );
      const button = getByRole('button');
      expect(getByText(buttonText)).toBeInTheDocument();
      expect(button.classList.contains(`cust-btn`)).toBe(true);
      expect(button.classList.contains(getOtherClass())).toBe(true);
      expect(button.classList.contains(getTypeClass('primary'))).toBe(true);
      expect(button.classList.contains(getThemeClass('primary'))).toBe(true);

      expect(button.classList.contains(getOtherClass('icon'))).not.toBe(true);
      expect(button.classList.contains(getOtherClass('block'))).not.toBe(true);
      expect(button.classList.contains(getOtherClass('smaller'))).not.toBe(true);
      expect(button.classList.contains(getOtherClass('larger'))).not.toBe(true);
      expect(button.classList.contains('is-loading')).not.toBe(true);
      expect(button.getAttribute('type')).toBe('submit');
    });

    it('should render a text secondary button', () => {
      const buttonText = 'Hello World';
      const { getByRole } = render(<DButton dType="secondary">{buttonText}</DButton>);
      const button = getByRole('button');

      expect(button.classList.contains(getTypeClass('secondary'))).toBe(true);
      expect(button.classList.contains(getOtherClass())).toBe(true);
      expect(button.classList.contains(getThemeClass('primary'))).toBe(true);

      expect(button.classList.contains(getOtherClass('icon'))).not.toBe(true);
      expect(button.classList.contains(getOtherClass('block'))).not.toBe(true);
      expect(button.classList.contains(getOtherClass('smaller'))).not.toBe(true);
      expect(button.classList.contains(getOtherClass('larger'))).not.toBe(true);
      expect(button.classList.contains('is-loading')).not.toBe(true);
    });

    it('should render a text outline button', () => {
      const buttonText = 'Hello World';
      const { getByRole } = render(<DButton dType="outline">{buttonText}</DButton>);
      const button = getByRole('button');

      expect(button.classList.contains(getTypeClass('outline'))).toBe(true);
      expect(button.classList.contains(getOtherClass())).toBe(true);
      expect(button.classList.contains(getThemeClass('primary'))).toBe(true);

      expect(button.classList.contains(getOtherClass('icon'))).not.toBe(true);
      expect(button.classList.contains(getOtherClass('block'))).not.toBe(true);
      expect(button.classList.contains(getOtherClass('smaller'))).not.toBe(true);
      expect(button.classList.contains(getOtherClass('larger'))).not.toBe(true);
      expect(button.classList.contains('is-loading')).not.toBe(true);
    });

    it('should render a text dashed button', () => {
      const buttonText = 'Hello World';
      const { getByRole } = render(<DButton dType="dashed">{buttonText}</DButton>);
      const button = getByRole('button');

      expect(button.classList.contains(getTypeClass('dashed'))).toBe(true);
      expect(button.classList.contains(getOtherClass())).toBe(true);
      expect(button.classList.contains(getThemeClass('primary'))).toBe(true);

      expect(button.classList.contains(getOtherClass('icon'))).not.toBe(true);
      expect(button.classList.contains(getOtherClass('block'))).not.toBe(true);
      expect(button.classList.contains(getOtherClass('smaller'))).not.toBe(true);
      expect(button.classList.contains(getOtherClass('larger'))).not.toBe(true);
      expect(button.classList.contains('is-loading')).not.toBe(true);
    });

    it('should render a text text button', () => {
      const buttonText = 'Hello World';
      const { getByRole } = render(<DButton dType="text">{buttonText}</DButton>);
      const button = getByRole('button');

      expect(button.classList.contains(getTypeClass('text'))).toBe(true);
      expect(button.classList.contains(getOtherClass())).toBe(true);
      expect(button.classList.contains(getThemeClass('primary'))).toBe(true);

      expect(button.classList.contains(getOtherClass('icon'))).not.toBe(true);
      expect(button.classList.contains(getOtherClass('block'))).not.toBe(true);
      expect(button.classList.contains(getOtherClass('smaller'))).not.toBe(true);
      expect(button.classList.contains(getOtherClass('larger'))).not.toBe(true);
      expect(button.classList.contains('is-loading')).not.toBe(true);
    });

    it('should render a text link button', () => {
      const buttonText = 'Hello World';
      const { getByRole } = render(<DButton dType="link">{buttonText}</DButton>);
      const button = getByRole('button');

      expect(button.classList.contains(getTypeClass('link'))).toBe(true);
      expect(button.classList.contains(getOtherClass())).toBe(true);
      expect(button.classList.contains(getThemeClass('primary'))).toBe(true);

      expect(button.classList.contains(getOtherClass('icon'))).not.toBe(true);
      expect(button.classList.contains(getOtherClass('block'))).not.toBe(true);
      expect(button.classList.contains(getOtherClass('smaller'))).not.toBe(true);
      expect(button.classList.contains(getOtherClass('larger'))).not.toBe(true);
      expect(button.classList.contains('is-loading')).not.toBe(true);
    });
  });

  describe('the theme property of DButton', () => {
    it('should render a primary button', () => {
      const buttonText = 'Hello World';
      const { getByRole } = render(<DButton dTheme="primary">{buttonText}</DButton>);
      const button = getByRole('button');

      expect(button.classList.contains(getThemeClass('primary'))).toBe(true);
    });

    it('should render a success button', () => {
      const buttonText = 'Hello World';
      const { getByRole } = render(<DButton dTheme="success">{buttonText}</DButton>);
      const button = getByRole('button');

      expect(button.classList.contains(getThemeClass('success'))).toBe(true);
    });

    it('should render a warning button', () => {
      const buttonText = 'Hello World';
      const { getByRole } = render(<DButton dTheme="warning">{buttonText}</DButton>);
      const button = getByRole('button');

      expect(button.classList.contains(getThemeClass('warning'))).toBe(true);
    });

    it('should render a danger button', () => {
      const buttonText = 'Hello World';
      const { getByRole } = render(<DButton dTheme="danger">{buttonText}</DButton>);
      const button = getByRole('button');

      expect(button.classList.contains(getThemeClass('danger'))).toBe(true);
    });
  });

  describe('the icon property of DButton', () => {
    it('should render a button with icon', () => {
      const buttonText = 'Hello World';
      const FackIcon = <div>icon</div>;
      const { getByRole, getByText } = render(<DButton dIcon={FackIcon}>{buttonText}</DButton>);
      const button = getByRole('button');
      const icon = getByText('icon');

      expect(icon).toBeInTheDocument();
      expect(button.contains(icon)).toBe(true);
      expect(button.getElementsByClassName(getOtherClass('icon', '__'))).toBeTruthy();
    });
  });

  describe('the disabled property of DButton', () => {
    it('should render a clickable button', () => {
      const buttonText = 'Hello World';
      const cb = jest.fn();
      const { getByRole } = render(<DButton onClick={cb}>{buttonText}</DButton>);
      const button = getByRole('button');
      expect(cb).not.toBeCalled();

      fireEvent.click(button);
      expect(cb.mock.calls.length).toBe(1);
      expect(button.classList.contains('is-loading')).not.toBe(true);
    });

    it('should render a disabled button', () => {
      const buttonText = 'Hello World';
      const cb = jest.fn();
      const { getByRole } = render(<DButton disabled>{buttonText}</DButton>);
      const button = getByRole('button');

      expect(cb).not.toBeCalled();
      expect(button['disabled']).toBe(true);
      fireEvent.click(button);
      expect(cb).not.toBeCalled();
      expect(button.classList.contains('is-loading')).not.toBe(true);
    });
  });

  describe('the loading property of DButton', () => {
    it('should render a loading-button', () => {
      const buttonText = 'Hello World';
      const cb = jest.fn();
      const { getByRole } = render(
        <DButton dLoading={true} onClick={cb}>
          {buttonText}
        </DButton>
      );
      const button = getByRole('button');
      expect(button.className.includes('is-loading')).toBe(true);
      expect(button.querySelector(`.${dPrefix}button__icon`)).toBeInTheDocument();
      fireEvent.click(button);
      expect(cb).not.toBeCalled();
    });

    it('should render a loading-button without icon', () => {
      const buttonText = 'Hello World';
      const cb = jest.fn();
      const mockIcon = <div>icon</div>;
      const { getByRole, queryByText } = render(
        <DButton dIcon={mockIcon} dLoading onClick={cb}>
          {buttonText}
        </DButton>
      );
      const button = getByRole('button');
      const icon = queryByText('icon');

      expect(icon).toBeNull();
      expect(button.className.includes('is-loading')).toBe(true);
      expect(button.getElementsByClassName(getOtherClass('icon', '__'))).toBeTruthy();
      fireEvent.click(button);
      expect(cb.mock.calls.length).toBe(0);
    });
  });

  describe('the block property of DButton', () => {
    it('should render a button that suitable for its parent width', () => {
      const buttonText = 'Hello World';
      const { getByRole } = render(<DButton dBlock>{buttonText}</DButton>);
      const button = getByRole('button');
      expect(button.className.includes(getOtherClass('block'))).toBe(true);
    });
  });

  describe('the size property of DButton', () => {
    it('should render a small button', () => {
      const buttonText = 'Hello World';
      const { getByRole } = render(<DButton dSize="smaller">{buttonText}</DButton>);
      const button = getByRole('button');

      expect(button.className.includes(getOtherClass('smaller'))).toBe(true);
    });

    it('should render a large button', () => {
      const buttonText = 'Hello World';
      const { getByRole } = render(<DButton dSize="larger">{buttonText}</DButton>);
      const button = getByRole('button');

      expect(button.className.includes(getOtherClass('larger'))).toBe(true);
    });
  });

  describe('the variant property of DButton', () => {
    it('should render a circle button', () => {
      const buttonText = 'Hello World';
      const { getByRole } = render(
        <DButton dSize="larger" dVariant="circle">
          {buttonText}
        </DButton>
      );
      const button = getByRole('button');
      expect(button.className.includes(getOtherClass('circle'))).toBe(true);
    });

    it('should render a round button', () => {
      const buttonText = 'Hello World';
      const { getByRole } = render(
        <DButton dSize="larger" dVariant="round">
          {buttonText}
        </DButton>
      );
      const button = getByRole('button');
      expect(button.className.includes(getOtherClass('round'))).toBe(true);
    });
  });

  describe('Emotion compatibility', () => {
    it('should have a wave by default', async () => {
      const { getByRole } = render(
        <DButton dSize="larger" dVariant="round">
          Hello World
        </DButton>
      );
      const button = getByRole('button');

      expect(button.querySelector('.rd-wave')).toBeNull();
      fireEvent.click(button);
      expect(button.querySelector('.rd-wave')).toBeTruthy();
      // animation-duration
      await sleep(4 * 1000);

      expect(button.querySelector('rd-wave')).toBeNull();
    });

    it('the properties of size and disabled should be inherited from DCmpose', () => {
      const { container, getAllByRole } = render(
        <DCompose dSize="larger" dDisabled={true}>
          <DButton id="middle-btn1">middle-btn1</DButton>
          <DButton id="middle-btn2">middle-btn2</DButton>
          <DButton id="middle-btn3">middle-btn3</DButton>
          <DButton id="small-btn" dSize="smaller">
            small-btn
          </DButton>
        </DCompose>
      );
      const buttons = getAllByRole('button');
      expect(buttons.length).toBe(4);
      for (let idx = 0; idx < buttons.length; idx++) {
        expect(buttons[idx]['disabled']).toBe(true);
      }
      expect(container.querySelector('#middle-btn1')?.className.includes(getOtherClass('larger'))).toBe(true);
      expect(container.querySelector('#small-btn')?.className.includes(getOtherClass('smaller'))).toBe(true);
    });
  });
});

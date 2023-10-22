import type { DComposeProps } from './Compose';

import { render } from '../../__tests__/utils';
import { DButton } from '../button';
import { DInput } from '../input';
import { DCompose, DComposeItem } from './index';

const dPrefix = 'rd-';

describe('DCompose', () => {
  it('renders correctly', () => {
    const { getByRole } = render(<DCompose></DCompose>);
    const composeElement = getByRole('group');
    expect(composeElement).toBeInTheDocument();
  });

  it('renders with different dSize values', () => {
    const sizes: (DComposeProps['dSize'] | undefined)[] = ['smaller', 'larger'];
    sizes.forEach((size) => {
      const { container } = render(
        <DCompose dSize={size}>
          <DInput dPlaceholder="Search" />
          <DButton>Button</DButton>
        </DCompose>
      );
      const inputDiv = container.querySelector('.rd-input');
      const buttonElement = container.querySelector('.rd-button');
      expect(inputDiv).toHaveClass(`${dPrefix}input--${size}`);
      expect(buttonElement).toHaveClass(`${dPrefix}button--${size}`);
    });
  });

  it('renders vertically', () => {
    const { getByRole } = render(<DCompose dVertical={true} />);
    const composeElement = getByRole('group');
    expect(composeElement).toHaveClass(`${dPrefix}compose--vertical`);
  });

  it('renders with dDisabled set to true', () => {
    const { container } = render(
      <DCompose dDisabled={true}>
        <DInput dPlaceholder="Search" />
        <DButton>Button</DButton>
      </DCompose>
    );
    const inputDiv = container.querySelector('.rd-input');
    const buttonElement = container.querySelector('.rd-button');
    expect(inputDiv?.classList.contains('is-disabled')).toBe(true);
    expect(buttonElement).toHaveAttribute('disabled');
  });

  it('renders with children', () => {
    const { container } = render(
      <DCompose>
        <DComposeItem>
          <DInput dPlaceholder="Search" />
        </DComposeItem>
        <DComposeItem>
          <DButton>Button</DButton>
        </DComposeItem>
      </DCompose>
    );
    const composeItemElements = container.querySelectorAll(`.rd-compose-item`);
    expect(composeItemElements.length).toBe(2);
  });

  // __noStyle test
  it('should not have default style class when __noStyle is true', () => {
    const { container } = render(
      <DCompose __noStyle={true}>
        <div className="no-style">Child</div>
      </DCompose>
    );

    const hasStyleClass = container.firstChild?.classList.contains('rd-compose');
    expect(hasStyleClass).toBe(false);
  });

  it('should have default style class when __noStyle is false or not provided', () => {
    const { container: container1 } = render(
      <DCompose __noStyle={false}>
        <div>Child</div>
      </DCompose>
    );
    const hasStyleClass1 = container1?.firstChild?.classList.contains('rd-compose');
    expect(hasStyleClass1).toBe(true);

    const { container: container2 } = render(
      <DCompose>
        <div>Child</div>
      </DCompose>
    );
    const hasStyleClass2 = container2?.firstChild?.classList.contains('rd-compose');
    expect(hasStyleClass2).toBe(true);
  });
});

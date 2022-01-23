import { render, screen } from '@testing-library/react';

import { PREFIX } from '../../../tests';
import { DIcon } from '../../icon';
import { DButton } from '../Button';
import { DButtonGroup } from '../ButtonGroup';

const icon = <DIcon data-testid="custom-icon"></DIcon>;

describe('DButton', () => {
  const text = 'This is DButton';

  const buttonClassList = () => {
    return screen.getByRole('button').classList;
  };

  it('should `children` work', () => {
    const { getByText } = render(<DButton children={text} />);
    expect(getByText(text)).toBeInTheDocument();
  });

  it('should `dType` work', () => {
    const type = 'secondary';
    render(<DButton dType={type} />);
    expect(buttonClassList().contains(`${PREFIX}button--${type}`)).toBeTruthy();
  });

  it('should `dTheme` work', () => {
    const theme = 'danger';
    render(<DButton dTheme={theme} />);
    expect(buttonClassList().contains(`t-${theme}`)).toBeTruthy();
  });

  it('should `dLoading` work', () => {
    const { getByRole } = render(<DButton dLoading={true} />);
    expect(buttonClassList().contains(`is-loading`)).toBeTruthy();
    expect(getByRole('button').children.length).toBe(1);
  });

  it('should `dIcon` work', () => {
    const { getByRole } = render(<DButton dIcon={icon} />);
    expect(getByRole('button').children.length).toBe(1);
  });

  it('should `dIconRight` work', () => {
    const { getByRole } = render(<DButton dIcon={icon} dIconRight={true} children={text} />);
    expect(getByRole('button').childNodes.length).toBe(2);
    expect(getByRole('button').firstChild?.textContent).toBe(text);
  });

  it('should `dBlock` work', () => {
    render(<DButton dBlock={true} />);
    expect(buttonClassList().contains(`${PREFIX}button--block`)).toBeTruthy();
  });

  it('should `dShape` work', () => {
    const shape = 'round';
    render(<DButton dShape={shape} />);
    expect(buttonClassList().contains(`${PREFIX}button--${shape}`)).toBeTruthy();
    expect(buttonClassList().contains(`${PREFIX}button--circle`)).toBeFalsy();
  });

  it('should `dSize` work', () => {
    const size = 'larger';
    render(<DButton dSize={size} />);
    expect(buttonClassList().contains(`${PREFIX}button--${size}`)).toBeTruthy();
  });

  it('should `disabled` work', () => {
    const { getByRole } = render(<DButton disabled />);
    expect(getByRole('button')).toBeDisabled();
  });
});

describe('ButtonGroup', () => {
  const expectBtnClass = (className: string) => {
    const Buttons = screen.getAllByRole('button');
    for (const iterator of Buttons) {
      expect(iterator.classList.contains(className)).toBeTruthy();
    }
  };

  it('should `children` work', () => {
    const { getAllByRole } = render(
      <DButtonGroup>
        <DButton>L</DButton>
        <DButton>M</DButton>
        <DButton>R</DButton>
      </DButtonGroup>
    );
    expect(getAllByRole('button').length).toBe(3);
  });

  it('should `dType` work', () => {
    const type = 'outline';
    render(
      <DButtonGroup dType={type}>
        <DButton>L</DButton>
        <DButton>M</DButton>
        <DButton>R</DButton>
      </DButtonGroup>
    );
    expectBtnClass(`${PREFIX}button--${type}`);
  });

  it('should `dTheme` work', () => {
    const theme = 'warning';
    render(
      <DButtonGroup dTheme={theme}>
        <DButton>L</DButton>
        <DButton>M</DButton>
        <DButton>R</DButton>
      </DButtonGroup>
    );
    expectBtnClass(`t-${theme}`);
  });

  it('should `dSize` work', () => {
    const size = 'smaller';
    render(
      <DButtonGroup dSize={size}>
        <DButton>L</DButton>
        <DButton>M</DButton>
        <DButton>R</DButton>
      </DButtonGroup>
    );
    expectBtnClass(`${PREFIX}button--${size}`);
  });

  it('should `dDisabled` work', () => {
    const { getAllByRole } = render(
      <DButtonGroup dDisabled>
        <DButton>L</DButton>
        <DButton>M</DButton>
        <DButton>R</DButton>
      </DButtonGroup>
    );
    const buttons = getAllByRole('button');
    expect(buttons[0]).toBeDisabled();
    expect(buttons[1]).toBeDisabled();
    expect(buttons[2]).toBeDisabled();
  });
});

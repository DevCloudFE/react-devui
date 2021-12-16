import { render, screen } from '@testing-library/react';

import { PREFIX } from '../../tests';
import { DCompose } from '../compose';
import { DIcon } from '../icon';
import { DButtonGroup, DButton } from './index';

const icon = (
  <DIcon data-testid="custom-icon" viewBox="64 64 896 896">
    <path d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 00203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z"></path>
  </DIcon>
);

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
    const dType = 'secondary';
    render(<DButton dType={dType} />);
    expect(buttonClassList().contains(`${PREFIX}button--${dType}`)).toBeTruthy();
  });

  it('should `dColor` work', () => {
    const dColor = 'danger';
    render(<DButton dColor={dColor} />);
    expect(buttonClassList().contains(`t-${dColor}`)).toBeTruthy();
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

  it('should `dColor` work', () => {
    const color = 'warning';
    render(
      <DButtonGroup dColor={color}>
        <DButton>L</DButton>
        <DButton>M</DButton>
        <DButton>R</DButton>
      </DButtonGroup>
    );
    expectBtnClass(`t-${color}`);
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

describe('DCompose', () => {
  const expectBtnClass = (className: string) => {
    const Buttons = screen.getAllByRole('button');
    for (const iterator of Buttons) {
      expect(iterator.classList.contains(className)).toBeTruthy();
    }
  };
  it('should `dSize` work', () => {
    const size = 'smaller';
    render(
      <DCompose dSize={size}>
        <DButton></DButton>
      </DCompose>
    );
    expectBtnClass(`${PREFIX}button--${size}`);
  });

  it('should `dDisabled` work', () => {
    const { getByRole } = render(
      <DCompose dDisabled>
        <DButton></DButton>
      </DCompose>
    );
    expect(getByRole('button')).toBeDisabled();
  });
});

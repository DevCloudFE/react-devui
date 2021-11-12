import type { ShallowWrapper } from 'enzyme';

import { shallow } from 'enzyme';

import { PREFIX } from '../../tests';
import { DButton } from '../button';
import { DFooter } from './Footer';

describe('DFooter', () => {
  const okButton = (footer: ShallowWrapper) => {
    return footer.find(DButton).at(1);
  };
  const cancelButton = (footer: ShallowWrapper) => {
    return footer.find(DButton).at(0);
  };

  it('should `dAlign` work', () => {
    const footer = shallow(<DFooter dAlign="left" />);
    expect(footer.find(`.${PREFIX}footer--left`).length).toBe(1);
  });

  it('should `dButtons` work', () => {
    const footer = shallow(<DFooter dButtons={['cancel', <DButton>Button</DButton>, 'ok']} />);

    expect(footer.find(DButton).length).toBe(3);

    footer.find(DButton).forEach((button, index) => {
      switch (index) {
        case 0:
          expect(button.text()).toBe('Cancel');
          break;

        case 1:
          expect(button.text()).toBe('Button');
          break;

        case 2:
          expect(button.text()).toBe('OK');
          break;

        default:
          break;
      }
    });
  });

  it('should `dOkButtonProps` work', () => {
    const footer = shallow(<DFooter dOkButtonProps={{ disabled: true }} />);

    expect(okButton(footer).prop('disabled')).toBe(true);
  });

  it('should `dCancelButtonProps` work', () => {
    const footer = shallow(<DFooter dCancelButtonProps={{ disabled: true }} />);

    expect(cancelButton(footer).prop('disabled')).toBe(true);
  });

  it('should `onOkClick` work', () => {
    const mockCallBack = jest.fn();
    const footer = shallow(<DFooter onOkClick={mockCallBack} />);

    okButton(footer).simulate('click');
    expect(mockCallBack.mock.calls.length).toEqual(1);
  });

  it('should `onCancelClick` work', () => {
    const mockCallBack = jest.fn();
    const footer = shallow(<DFooter onCancelClick={mockCallBack} />);

    cancelButton(footer).simulate('click');
    expect(mockCallBack.mock.calls.length).toEqual(1);
  });
});

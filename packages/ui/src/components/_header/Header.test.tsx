import { shallow } from 'enzyme';

import { DButton } from '../button';
import { DIcon } from '../icon';
import { DHeader } from './Header';

describe('DHeader', () => {
  const icon = (
    <DIcon>
      <path d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 00203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z"></path>
    </DIcon>
  );

  it('should `dCloseIcon` work', () => {
    let header = shallow(<DHeader />);
    expect(header.find(DButton).length).toBe(1);

    header = shallow(<DHeader dCloseIcon={null} />);
    expect(header.find(DButton).length).toBe(0);

    header = shallow(<DHeader dCloseIcon={icon} />);
    expect(header.find(DButton).at(0).prop('dIcon')).toBe(icon);
  });

  it('should `dExtraIcons` work', () => {
    const header = shallow(<DHeader dExtraIcons={[icon, icon]} dCloseIcon={null} />);
    expect(header.find(DButton).length).toBe(2);
  });

  it('should `onClose` work', () => {
    const mockCallBack = jest.fn();
    const header = shallow(<DHeader onClose={mockCallBack} />);
    header.find(DButton).at(0).simulate('click');
    expect(mockCallBack.mock.calls.length).toBe(1);
  });
});

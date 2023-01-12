import { render } from '../../__tests__/utils';
import { DButton } from './index';

describe('DButton', () => {
  it('should `children` work', () => {
    const text = 'This is DButton';
    const { getByText } = render(<DButton>{text}</DButton>);
    expect(getByText(text)).toBeInTheDocument();
  });
});

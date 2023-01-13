import { render } from '../../__tests__/utils';

import { DButton } from './index';

describe('DButton', () => {
  const text = 'This is DButton';

  it('should `children` work', () => {
    const { getByText } = render(<DButton children={text} />);
    expect(getByText(text)).toBeInTheDocument();
  });
});

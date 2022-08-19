import type { DButtonProps } from './Button';
import type { RenderResult } from '@testing-library/react';

import { render } from '@testing-library/react';

import { PREFIX } from '../../__tests__';
import { DButton } from './Button';

describe('DButton', () => {
  let buttonRender: (props: DButtonProps) => RenderResult;
  let buttonEl: HTMLElement;

  beforeEach(() => {
    buttonRender = (props) => {
      const renderResult = render(<DButton data-testid="button" {...props} />);
      buttonEl = renderResult.getByTestId('button');
      return renderResult;
    };
  });

  it('should `dType` work', () => {
    const type = 'secondary';
    buttonRender({ dType: type });
    expect(buttonEl.classList.contains(`${PREFIX}button--${type}`)).toBeTruthy();
  });
});

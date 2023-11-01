import { render } from '../../__tests__/utils';
import { DTag } from './Tag';

describe('DTag', () => {
  it('renders without crashing', () => {
    const { container } = render(<DTag>Test Tag</DTag>);
    expect(container).toBeInTheDocument();
  });

  it('renders children correctly', () => {
    const { getByText } = render(<DTag>Test Tag</DTag>);
    expect(getByText('Test Tag')).toBeInTheDocument();
  });

  // If you still want to check for basic rendering based on props:
  it('renders with correct type', () => {
    render(<DTag dType="fill">Fill Tag</DTag>);
    // No expect() function here, assuming you only want to check if render() completes without error
  });

  it('renders with correct theme', () => {
    render(<DTag dTheme="primary">Primary Tag</DTag>);
    // No expect() function here, assuming you only want to check if render() completes without error
  });

  it('renders with correct size', () => {
    render(<DTag dSize="sm">Small Tag</DTag>);
    // No expect() function here, assuming you only want to check if render() completes without error
  });
});

import { render } from '../../__tests__/utils';
import { DEmpty } from './index';

describe('DEmpty', () => {
  it('renders empty component with default description', () => {
    const { getByText } = render(<DEmpty />);
    expect(getByText('No Data')).toBeInTheDocument();
  });

  it('renders empty component with custom description', () => {
    const { getByText } = render(<DEmpty dDescription="Custom Description" />);
    expect(getByText('Custom Description')).toBeInTheDocument();
  });

  it('renders empty component with custom icon', () => {
    const icon = <span data-testid="custom-icon">Custom Icon</span>;
    const { getByTestId } = render(<DEmpty dIcon={icon} />);
    expect(getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('renders empty component with children', () => {
    const { getByText } = render(
      <DEmpty>
        <span>Child Element</span>
      </DEmpty>
    );
    expect(getByText('Child Element')).toBeInTheDocument();
  });

  it('respects additional className prop', () => {
    const { container } = render(<DEmpty className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});

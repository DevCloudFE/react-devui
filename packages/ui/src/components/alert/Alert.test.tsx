import { render, fireEvent, screen } from '../../__tests__/utils';
import { DAlert } from './Alert';

describe('DAlert', () => {
  it('renders correctly with given props', () => {
    render(<DAlert dType="success" dTitle="Success Alert" dDescription="This is a successful alert." />);

    expect(screen.getByText('Success Alert')).toBeInTheDocument();
    expect(screen.getByText('This is a successful alert.')).toBeInTheDocument();
  });

  // Test all dType values
  ['success', 'warning', 'error', 'info'].forEach((type) => {
    it(`renders correctly with dType=${type}`, () => {
      render(<DAlert dType={type} dTitle={`${type} Alert`} />);
      expect(screen.getByText(`${type} Alert`)).toBeInTheDocument();
    });
  });

  it('renders the notification layout if dDescription prop is provided', () => {
    render(<DAlert dType="error" dTitle="Error Alert" dDescription="Error occurred." />);

    const alertNode = screen.getByText('Error occurred.').parentNode;
    expect(alertNode).toHaveClass('alert--notification');
  });

  it('renders the toast layout if dDescription prop is not provided', () => {
    render(<DAlert dType="info" dTitle="Info Alert" />);

    const alertNode = screen.getByText('Info Alert').parentNode;
    expect(alertNode).toHaveClass('alert--toast');
  });

  it('should call onClose when alert is closed', () => {
    const mockOnClose = jest.fn();
    render(<DAlert dType="warning" dTitle="Warning Alert" dDescription="Be careful!" onClose={mockOnClose} />);

    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should call afterVisibleChange when alert is closed', () => {
    const mockAfterVisibleChange = jest.fn();
    render(<DAlert dType="warning" dTitle="Warning Alert" dDescription="Be careful!" afterVisibleChange={mockAfterVisibleChange} />);

    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);

    expect(mockAfterVisibleChange).toHaveBeenCalledWith(false);
  });

  it('should not render the close button if neither onClose nor afterVisibleChange prop is provided', () => {
    render(<DAlert dType="warning" dTitle="Warning Alert" dDescription="Be careful!" />);

    const closeButton = screen.queryByRole('button');
    expect(closeButton).not.toBeInTheDocument();
  });

  // Test dIcon rendering
  it('renders the provided icon', () => {
    const iconText = 'Test Icon';
    render(<DAlert dType="success" dTitle="Success Alert" dIcon={<span>{iconText}</span>} />);

    expect(screen.getByText(iconText)).toBeInTheDocument();
  });

  // Test dActions rendering
  it('renders the provided actions', () => {
    const actionText = 'Test Action';
    render(<DAlert dType="success" dTitle="Success Alert" dActions={[<button>{actionText}</button>]} />);

    expect(screen.getByText(actionText)).toBeInTheDocument();
  });

  // 测试DCollapseTransition的动画效果
  it('triggers afterVisibleChange on enter and leave of DCollapseTransition', () => {
    const mockAfterVisibleChange = jest.fn();
    render(<DAlert dType="success" dTitle="Success Alert" afterVisibleChange={mockAfterVisibleChange} />);

    // 模拟DCollapseTransition的enter和leave动画
    // 这部分可能需要根据您的实际实现进行调整
    fireEvent.transitionEnd(screen.getByText('Success Alert'));
    expect(mockAfterVisibleChange).toHaveBeenCalledWith(true);
    fireEvent.transitionEnd(screen.getByText('Success Alert'));
    expect(mockAfterVisibleChange).toHaveBeenCalledWith(false);
  });

  // 测试onClose的调用
  it('triggers onClose when alert is closed', () => {
    const mockOnClose = jest.fn();
    render(<DAlert dType="success" dTitle="Success Alert" onClose={mockOnClose} />);

    const closeButton = screen.getByRole('button', { name: /close/i }); // 假设关闭按钮有一个"close"的aria-label或文本
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalled();
  });
});

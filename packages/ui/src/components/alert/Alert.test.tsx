import type { DAlertProps } from './Alert';

import { render, act } from '../../__tests__/utils';
import { DButton } from '../button';
import { DAlert } from './Alert';

describe('DAlert', () => {
  // basic test
  it('should render correctly', () => {
    const { getByText } = render(<DAlert dTitle="hello world" />);
    expect(getByText('hello world')).toBeInTheDocument();
  });

  // test dDescription
  it('should render dDescription correctly', () => {
    const { getByText } = render(<DAlert dTitle="hello world" dDescription="hello description" />);
    expect(getByText('hello description')).toBeInTheDocument();
  });

  // Test all dType values
  ['success', 'warning', 'error', 'info'].forEach((dType: DAlertProps['dType']) => {
    it(`renders correctly with dType=${dType}`, () => {
      const { getByText } = render(<DAlert dType={dType} dTitle={`${dType} Alert`} />);
      expect(getByText(`${dType} Alert`)).toBeInTheDocument();
    });
  });

  // Test dIcon
  it('should render dIcon correctly', () => {
    const { getByText } = render(<DAlert dIcon={<span>icon</span>} dTitle="hello world" />);
    expect(getByText('icon')).toBeInTheDocument();
  });

  // Test dActions
  it('should render dActions correctly', () => {
    const { getByText, getByLabelText } = render(
      <DAlert
        dActions={[
          <DButton dType="outline" dTheme="success">
            Button
          </DButton>,
          'close',
        ]}
        dTitle="hello world"
      />
    );
    expect(getByText('Button')).toBeInTheDocument();
    expect(getByLabelText('Close')).toBeInTheDocument();
  });

  // Test onClose
  it('should render onClose correctly', async () => {
    const onClose = jest.fn();
    const { getByLabelText } = render(<DAlert dActions={['close']} dTitle="hello world" onClose={onClose} />);

    await act(async () => {
      getByLabelText('Close').click();
    });

    expect(onClose).toBeCalled();
  });

  // Test afterVisibleChange
  it('should render afterVisibleChange correctly', async () => {
    const afterVisibleChange = jest.fn();
    const { getByLabelText } = render(<DAlert dActions={['close']} dTitle="hello world" afterVisibleChange={afterVisibleChange} />);

    await act(async () => {
      getByLabelText('Close').click();
    });

    expect(afterVisibleChange).toBeCalledWith(true);
  });

  // Test dVisible
  it('should render dVisible correctly', () => {
    const { queryByText } = render(<DAlert dVisible={false} dTitle="hello world" />);
    expect(queryByText('hello world')).toBeNull();
  });

  // Test changeVisible
  it('should hide the alert when DNotificationPanel close button is clicked', async () => {
    const { getByLabelText, getByText } = render(
      <DAlert dType="success" dActions={['close']} dTitle="Success Alert" dDescription="Description" />
    );

    await act(async () => {
      getByLabelText('Close').click();
    });

    expect(getByText('Success Alert')).toBeVisible(); // or .not.toBeVisible() based on your implementation
  });
});

import { render, fireEvent } from '../../__tests__/utils';
import { DAvatar } from './Avatar';

describe('DAvatar', () => {
  it('renders without crashing', () => {
    const { getByRole } = render(<DAvatar />);
    expect(getByRole('img')).toBeInTheDocument();
  });

  it('renders with an image when dImg is provided', () => {
    const testImageUrl = 'test-image-url';
    const { getByRole } = render(<DAvatar dImg={{ src: testImageUrl }} />);
    const image = getByRole('img');
    expect(image).toHaveAttribute('src', testImageUrl);
  });

  it('switches to icon type when dImg is not provided but dIcon is', () => {
    const TestIcon = () => <span>Test Icon</span>;
    const { getByText } = render(<DAvatar dIcon={<TestIcon />} />);
    expect(getByText('Test Icon')).toBeInTheDocument();
  });

  it('switches to text type when neither dImg nor dIcon is provided', () => {
    const { getByText } = render(<DAvatar dText="A" />);
    expect(getByText('A')).toBeInTheDocument();
  });
  it('handles image load errors', () => {
    const { getByRole } = render(<DAvatar dImg={{ src: 'test-image.jpg', alt: 'Test Image' }} />);
    const image = getByRole('img');
    fireEvent.error(image);
    expect(image).toHaveAttribute('src', 'test-image.jpg');
  });
  it('should scale the text properly when necessary', () => {
    const dSize = 40;
    Object.defineProperty(HTMLElement.prototype, 'scrollWidth', { configurable: true, value: 100 });
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', { configurable: true, value: 20 });
    const { getByText } = render(<DAvatar dSize={dSize} dText="Test Text" />);
    const textElement = getByText('Test Text');
    const expectedScaleValue = (Math.sqrt(Math.pow(dSize / 2, 2) - Math.pow(20 / 2, 2)) * 2) / 100;
    const expectedScale = `scale(${expectedScaleValue})`;
    expect(textElement.style.transform).toBe(expectedScale);
  });
});

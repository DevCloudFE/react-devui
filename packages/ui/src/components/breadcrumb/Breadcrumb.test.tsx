import { render, fireEvent } from '../../__tests__/utils';
import { DBreadcrumb } from './Breadcrumb';

describe('DBreadcrumb', () => {
  it('renders the breadcrumb with items', () => {
    const breadcrumbItems = [
      { id: 'home', title: 'Home' },
      { id: 'about', title: 'About', link: true },
      { id: 'contact', title: 'Contact' },
    ];

    const { getByText } = render(<DBreadcrumb dList={breadcrumbItems} />);

    expect(getByText('Home')).toBeInTheDocument();
    expect(getByText('About')).toBeInTheDocument();
    expect(getByText('Contact')).toBeInTheDocument();
  });

  it('calls "onItemClick" when an item is clicked', () => {
    const onItemClickMock = jest.fn();
    const breadcrumbItems = [
      { id: 'home', title: 'Home' },
      { id: 'about', title: 'About', link: true },
    ];

    const { getByText } = render(<DBreadcrumb dList={breadcrumbItems} onItemClick={onItemClickMock} />);

    fireEvent.click(getByText('About'));
    expect(onItemClickMock).toHaveBeenCalledWith('about', breadcrumbItems[1]);
  });

  it('uses the custom separator if provided', () => {
    const customSeparator = '>';
    const breadcrumbItems = [
      { id: 'home', title: 'Home' },
      { id: 'about', title: 'About', link: true },
    ];

    const { queryAllByRole } = render(<DBreadcrumb dList={breadcrumbItems} dSeparator={customSeparator} />);

    const separators = queryAllByRole('separator');
    separators.forEach((separator) => {
      expect(separator).toHaveTextContent(customSeparator);
    });
  });
});

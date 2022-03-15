import type { DIconProps } from '../Icon';

import { CaretDownOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function CaretDownOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

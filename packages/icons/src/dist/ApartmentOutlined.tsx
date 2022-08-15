import type { DIconProps } from '../Icon';

import { ApartmentOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function ApartmentOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

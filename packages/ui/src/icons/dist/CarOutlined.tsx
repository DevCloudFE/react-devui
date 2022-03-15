import type { DIconProps } from '../Icon';

import { CarOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function CarOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

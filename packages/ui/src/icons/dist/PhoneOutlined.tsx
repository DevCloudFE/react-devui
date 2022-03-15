import type { DIconProps } from '../Icon';

import { PhoneOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function PhoneOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

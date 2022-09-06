import type { DIconProps } from '../Icon';

import { CheckOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function CheckOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

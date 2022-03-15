import type { DIconProps } from '../Icon';

import { CustomerServiceOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function CustomerServiceOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

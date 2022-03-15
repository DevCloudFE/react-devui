import type { DIconProps } from '../Icon';

import { CloudServerOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function CloudServerOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

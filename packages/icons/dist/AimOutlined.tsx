import type { DIconProps } from '../Icon';

import { AimOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function AimOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

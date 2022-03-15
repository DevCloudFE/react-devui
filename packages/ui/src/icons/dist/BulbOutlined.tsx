import type { DIconProps } from '../Icon';

import { BulbOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function BulbOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

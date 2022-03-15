import type { DIconProps } from '../Icon';

import { PartitionOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function PartitionOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

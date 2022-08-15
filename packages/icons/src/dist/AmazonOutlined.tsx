import type { DIconProps } from '../Icon';

import { AmazonOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function AmazonOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

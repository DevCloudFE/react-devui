import type { DIconProps } from '../Icon';

import { CompressOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function CompressOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

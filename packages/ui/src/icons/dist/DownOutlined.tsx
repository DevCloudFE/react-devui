import type { DIconProps } from '../Icon';

import { DownOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function DownOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

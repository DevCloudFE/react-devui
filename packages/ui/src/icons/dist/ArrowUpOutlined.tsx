import type { DIconProps } from '../Icon';

import { ArrowUpOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function ArrowUpOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

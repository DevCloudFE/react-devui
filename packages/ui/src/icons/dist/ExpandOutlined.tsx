import type { DIconProps } from '../Icon';

import { ExpandOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function ExpandOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

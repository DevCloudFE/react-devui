import type { DIconProps } from '../Icon';

import { IeOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function IeOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

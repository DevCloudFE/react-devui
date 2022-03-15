import type { DIconProps } from '../Icon';

import { MacCommandOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function MacCommandOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

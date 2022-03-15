import type { DIconProps } from '../Icon';

import { RocketOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function RocketOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

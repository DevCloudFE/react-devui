import type { DIconProps } from '../Icon';

import { RightOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function RightOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

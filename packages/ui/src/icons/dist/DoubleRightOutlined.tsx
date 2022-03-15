import type { DIconProps } from '../Icon';

import { DoubleRightOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function DoubleRightOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

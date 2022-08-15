import type { DIconProps } from '../Icon';

import { DoubleLeftOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function DoubleLeftOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

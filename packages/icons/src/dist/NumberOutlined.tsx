import type { DIconProps } from '../Icon';

import { NumberOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function NumberOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

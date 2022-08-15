import type { DIconProps } from '../Icon';

import { BorderlessTableOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function BorderlessTableOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

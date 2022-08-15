import type { DIconProps } from '../Icon';

import { TwitterOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function TwitterOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

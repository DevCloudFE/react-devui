import type { DIconProps } from '../Icon';

import { SafetyOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function SafetyOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

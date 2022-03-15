import type { DIconProps } from '../Icon';

import { WarningOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function WarningOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

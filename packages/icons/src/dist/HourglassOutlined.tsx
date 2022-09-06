import type { DIconProps } from '../Icon';

import { HourglassOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function HourglassOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

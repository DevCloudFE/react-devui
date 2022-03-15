import type { DIconProps } from '../Icon';

import { PercentageOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function PercentageOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

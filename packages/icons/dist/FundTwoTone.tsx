import type { DIconProps } from '../Icon';

import { FundTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function FundTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

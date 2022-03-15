import type { DIconProps } from '../Icon';

import { GoldenFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function GoldenFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

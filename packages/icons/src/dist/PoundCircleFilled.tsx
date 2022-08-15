import type { DIconProps } from '../Icon';

import { PoundCircleFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function PoundCircleFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

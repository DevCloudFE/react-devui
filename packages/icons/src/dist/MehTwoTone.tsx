import type { DIconProps } from '../Icon';

import { MehTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function MehTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

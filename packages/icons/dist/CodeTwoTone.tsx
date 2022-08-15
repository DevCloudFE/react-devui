import type { DIconProps } from '../Icon';

import { CodeTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function CodeTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

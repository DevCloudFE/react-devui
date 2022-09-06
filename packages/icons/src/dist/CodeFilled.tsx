import type { DIconProps } from '../Icon';

import { CodeFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function CodeFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

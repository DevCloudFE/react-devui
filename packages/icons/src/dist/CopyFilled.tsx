import type { DIconProps } from '../Icon';

import { CopyFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function CopyFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

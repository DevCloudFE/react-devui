import type { DIconProps } from '../Icon';

import { SkinFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function SkinFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

import type { DIconProps } from '../Icon';

import { SkinTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function SkinTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

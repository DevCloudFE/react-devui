import type { DIconProps } from '../Icon';

import { PictureTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function PictureTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

import type { DIconProps } from '../Icon';

import { PictureFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function PictureFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

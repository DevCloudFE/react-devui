import type { DIconProps } from '../Icon';

import { YoutubeFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function YoutubeFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

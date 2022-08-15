import type { DIconProps } from '../Icon';

import { EuroCircleTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function EuroCircleTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

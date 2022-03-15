import type { DIconProps } from '../Icon';

import { AppstoreTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function AppstoreTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

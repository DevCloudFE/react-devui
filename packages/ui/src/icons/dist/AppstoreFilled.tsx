import type { DIconProps } from '../Icon';

import { AppstoreFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function AppstoreFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

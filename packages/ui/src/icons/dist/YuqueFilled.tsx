import type { DIconProps } from '../Icon';

import { YuqueFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function YuqueFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

import type { DIconProps } from '../Icon';

import { ChromeFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function ChromeFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

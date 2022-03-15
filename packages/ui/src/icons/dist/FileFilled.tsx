import type { DIconProps } from '../Icon';

import { FileFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function FileFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

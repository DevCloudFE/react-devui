import type { DIconProps } from '../Icon';

import { FolderTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function FolderTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

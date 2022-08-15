import type { DIconProps } from '../Icon';

import { FolderAddFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function FolderAddFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

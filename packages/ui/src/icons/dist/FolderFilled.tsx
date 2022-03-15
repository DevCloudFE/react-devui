import type { DIconProps } from '../Icon';

import { FolderFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function FolderFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

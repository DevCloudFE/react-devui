import type { DIconProps } from '../Icon';

import { FolderOpenFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function FolderOpenFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

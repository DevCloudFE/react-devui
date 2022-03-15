import type { DIconProps } from '../Icon';

import { FolderViewOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function FolderViewOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

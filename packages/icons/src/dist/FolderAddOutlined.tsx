import type { DIconProps } from '../Icon';

import { FolderAddOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function FolderAddOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

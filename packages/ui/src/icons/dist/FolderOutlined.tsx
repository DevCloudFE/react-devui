import type { DIconProps } from '../Icon';

import { FolderOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function FolderOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

import type { DIconProps } from '../Icon';

import { FolderOpenOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function FolderOpenOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

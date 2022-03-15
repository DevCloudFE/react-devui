import type { DIconProps } from '../Icon';

import { DropboxOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function DropboxOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

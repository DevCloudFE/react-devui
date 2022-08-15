import type { DIconProps } from '../Icon';

import { UploadOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function UploadOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

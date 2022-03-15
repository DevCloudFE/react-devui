import type { DIconProps } from '../Icon';

import { CopyOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function CopyOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

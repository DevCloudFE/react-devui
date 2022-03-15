import type { DIconProps } from '../Icon';

import { LayoutOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function LayoutOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

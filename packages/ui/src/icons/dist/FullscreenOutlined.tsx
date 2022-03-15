import type { DIconProps } from '../Icon';

import { FullscreenOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function FullscreenOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

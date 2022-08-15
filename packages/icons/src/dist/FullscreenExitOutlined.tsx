import type { DIconProps } from '../Icon';

import { FullscreenExitOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function FullscreenExitOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

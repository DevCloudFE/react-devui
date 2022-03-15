import type { DIconProps } from '../Icon';

import { SoundOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function SoundOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

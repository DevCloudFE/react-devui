import type { DIconProps } from '../Icon';

import { AudioMutedOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function AudioMutedOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

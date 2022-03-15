import type { DIconProps } from '../Icon';

import { InteractionOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function InteractionOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

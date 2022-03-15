import type { DIconProps } from '../Icon';

import { InteractionTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function InteractionTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

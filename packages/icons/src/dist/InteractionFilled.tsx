import type { DIconProps } from '../Icon';

import { InteractionFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function InteractionFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

import type { DIconProps } from '../Icon';

import { MacCommandFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function MacCommandFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

import type { DIconProps } from '../Icon';

import { ProfileFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function ProfileFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

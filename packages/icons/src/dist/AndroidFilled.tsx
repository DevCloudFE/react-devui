import type { DIconProps } from '../Icon';

import { AndroidFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function AndroidFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

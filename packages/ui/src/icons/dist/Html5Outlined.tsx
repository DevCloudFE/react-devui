import type { DIconProps } from '../Icon';

import { Html5Outlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function Html5Outlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

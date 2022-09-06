import type { DIconProps } from '../Icon';

import { Html5Filled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function Html5Filled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

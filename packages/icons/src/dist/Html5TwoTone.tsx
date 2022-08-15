import type { DIconProps } from '../Icon';

import { Html5TwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function Html5TwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}

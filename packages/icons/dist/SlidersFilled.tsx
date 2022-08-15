import type { DIconProps } from '../Icon';

import { SlidersFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function SlidersFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
